// steamon_compensation.js
// Stackable compensation queue for Steamon SMP.
//
// PLAYER
//   /compensation                 claim every queued comp you haven't claimed yet.
//                                 Inventory full -> the rest stays queued for you.
// ADMIN (op level 2)
//   /compensation list            show the queue
//   /compensation add <item> <n>  push a comp onto the queue (item autocompletes)
//   /compensation edit <id> <n>   change the amount of a queued comp
//   /compensation remove <id>     remove a comp from the queue
//   /compensation clear           empty the whole queue
//
// PERSISTENCE  kubejs/data/steamon_compensation.json
//   { "next_id": N, "queue": [ {id,item,count,label}, ... ], "claimed": { uuid:[ids] } }
//
// NOTE: all locals use `var` on purpose. KubeJS' Rhino engine shares scope across
// functions in a script and throws "redeclaration of var" on const/let reused
// between functions, which silently broke every read. `var` hoists cleanly.

var COMP_FILE = 'kubejs/data/steamon_compensation.json'

// ---------------------------------------------------------------------------
// storage
// ---------------------------------------------------------------------------

function compLoad() {
  try {
    var stored = JsonIO.read(COMP_FILE)
    if (stored && stored.queue) {
      if (!stored.claimed) stored.claimed = {}
      if (!stored.next_id) stored.next_id = 1
      return stored
    }
  } catch (loadErr) {
    console.error('[steamon] compensation load error: ' + loadErr)
  }
  return { next_id: 1, queue: [], claimed: {} }
}

function compSave(state) {
  JsonIO.write(COMP_FILE, state)
}

// resolve the item id string from an ITEM_STACK argument result (ItemInput)
function compItemId(itemInput) {
  var stack = itemInput.createItemStack(1, false)
  return Item.of(stack).getId()
}

// deliver one comp; returns true only if fully delivered (inventory had room)
function compDeliver(player, comp) {
  var stack = Item.of(comp.item, comp.count)
  if (stack.isEmpty()) {
    console.error('[steamon] compensation: invalid item ' + comp.item + ', skipping')
    return true
  }
  player.inventory.add(stack)   // inserts what fits, shrinks stack to leftover
  player.inventory.setChanged()
  return stack.isEmpty()
}

function compFindIndex(state, id) {
  for (var i = 0; i < state.queue.length; i++) {
    if (state.queue[i].id === id) return i
  }
  return -1
}

// ---------------------------------------------------------------------------
// action handlers (return brigadier result int)
// ---------------------------------------------------------------------------

function compClaim(ctx) {
  var player = ctx.source.player
  if (!player) {
    ctx.source.sendFailure(Text.red('This command must be run by a player.'))
    return 0
  }

  var state = compLoad()
  var uuid = player.uuid.toString()
  var claimedIds = state.claimed[uuid] || []

  var pending = state.queue.filter(c => claimedIds.indexOf(c.id) === -1)
  if (pending.length === 0) {
    player.tell(Text.of('You have no compensation to claim right now.'))
    return 1
  }

  var delivered = 0
  var heldBack = false
  for (var i = 0; i < pending.length; i++) {
    var done = compDeliver(player, pending[i])
    if (done) {
      claimedIds.push(pending[i].id)
      delivered++
    } else {
      heldBack = true
      break   // inventory full: keep the rest queued for later
    }
  }

  state.claimed[uuid] = claimedIds
  compSave(state)

  if (delivered > 0) {
    player.tell(Text.green('You received ' + delivered + ' compensation' +
      (delivered > 1 ? 's' : '') + '. Thanks for your patience!'))
  }
  if (heldBack) {
    player.tell(Text.yellow('Your inventory is full. Make room and run /compensation again for the rest.'))
  }
  return 1
}

function compActionList(ctx) {
  var state = compLoad()
  if (state.queue.length === 0) {
    ctx.source.sendSuccess(Text.of('Compensation queue is empty.'), false)
    return 1
  }
  ctx.source.sendSuccess(Text.gold('Compensation queue (' + state.queue.length + '):'), false)
  for (var i = 0; i < state.queue.length; i++) {
    var c = state.queue[i]
    ctx.source.sendSuccess(Text.of('  #' + c.id + '  ->  ' + c.count + 'x ' + c.item), false)
  }
  return 1
}

function compActionAdd(ctx, itemId, count) {
  if (count < 1) {
    ctx.source.sendFailure(Text.red('Count must be at least 1.'))
    return 0
  }
  var state = compLoad()
  var id = state.next_id
  state.next_id = id + 1
  state.queue.push({ id: id, item: itemId, count: count, label: count + 'x ' + itemId })
  compSave(state)
  ctx.source.sendSuccess(Text.green('Compensation #' + id + ' added: ' +
    count + 'x ' + itemId + ' (claimable once by every player via /compensation).'), true)
  return 1
}

function compActionEdit(ctx, id, count) {
  if (count < 1) {
    ctx.source.sendFailure(Text.red('Count must be at least 1.'))
    return 0
  }
  var state = compLoad()
  var idx = compFindIndex(state, id)
  if (idx === -1) {
    ctx.source.sendFailure(Text.red('No compensation with id #' + id + '.'))
    return 0
  }
  var c = state.queue[idx]
  c.count = count
  c.label = count + 'x ' + c.item
  compSave(state)
  ctx.source.sendSuccess(Text.green('Compensation #' + id + ' set to ' + count + 'x ' + c.item + '.'), true)
  return 1
}

function compActionRemove(ctx, id) {
  var state = compLoad()
  var idx = compFindIndex(state, id)
  if (idx === -1) {
    ctx.source.sendFailure(Text.red('No compensation with id #' + id + '.'))
    return 0
  }
  var removed = state.queue[idx]
  // Rebuild the queue by filtering instead of splice(): the array coming back
  // from JsonIO.read can be a wrapped Java list whose splice() misbehaves.
  var kept = []
  for (var i = 0; i < state.queue.length; i++) {
    if (state.queue[i].id !== id) kept.push(state.queue[i])
  }
  state.queue = kept
  compSave(state)
  ctx.source.sendSuccess(Text.green('Removed compensation #' + id + ' (' +
    removed.count + 'x ' + removed.item + ').'), true)
  return 1
}

function compActionClear(ctx) {
  var state = compLoad()
  var n = state.queue.length
  state.queue = []
  compSave(state)
  ctx.source.sendSuccess(Text.green('Cleared ' + n + ' queued compensation(s).'), true)
  return 1
}

// wipe one player's claim history -> they can claim every queued comp again
function compActionReset(ctx, targetPlayer) {
  var state = compLoad()
  var uuid = targetPlayer.uuid.toString()
  var name = targetPlayer.username
  if (!state.claimed[uuid] || state.claimed[uuid].length === 0) {
    ctx.source.sendSuccess(Text.of(name + ' had no claim history (nothing to reset).'), true)
    return 1
  }
  delete state.claimed[uuid]
  compSave(state)
  ctx.source.sendSuccess(Text.green('Reset ' + name + "'s compensation claims. They can claim the queue again."), true)
  return 1
}

// wipe EVERY player's claim history -> the whole server can claim again
function compActionResetAll(ctx) {
  var state = compLoad()
  var n = 0
  for (var k in state.claimed) { if (state.claimed.hasOwnProperty(k)) n++ }
  state.claimed = {}
  compSave(state)
  ctx.source.sendSuccess(Text.green('Reset claim history for ' + n + ' player(s). Everyone can claim the queue again.'), true)
  return 1
}

// ---------------------------------------------------------------------------
// command tree: /compensation [list|add|edit|remove|clear]
// ---------------------------------------------------------------------------

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var Arguments = event.arguments

  event.register(
    Commands.literal('compensation')
      // bare /compensation -> player claim
      .executes(ctx => compClaim(ctx))

      // /compensation list
      .then(
        Commands.literal('list')
          .requires(src => src.hasPermission(2))
          .executes(ctx => compActionList(ctx))
      )

      // /compensation add <item> <count>
      .then(
        Commands.literal('add')
          .requires(src => src.hasPermission(2))
          .then(
            Commands.argument('item', Arguments.ITEM_STACK.create(event))
              .then(
                Commands.argument('count', Arguments.INTEGER.create(event))
                  .executes(ctx => compActionAdd(
                    ctx,
                    compItemId(Arguments.ITEM_STACK.getResult(ctx, 'item')),
                    Arguments.INTEGER.getResult(ctx, 'count')
                  ))
              )
          )
      )

      // /compensation edit <id> <count>
      .then(
        Commands.literal('edit')
          .requires(src => src.hasPermission(2))
          .then(
            Commands.argument('id', Arguments.INTEGER.create(event))
              .then(
                Commands.argument('count', Arguments.INTEGER.create(event))
                  .executes(ctx => compActionEdit(
                    ctx,
                    Arguments.INTEGER.getResult(ctx, 'id'),
                    Arguments.INTEGER.getResult(ctx, 'count')
                  ))
              )
          )
      )

      // /compensation remove <id>
      .then(
        Commands.literal('remove')
          .requires(src => src.hasPermission(2))
          .then(
            Commands.argument('id', Arguments.INTEGER.create(event))
              .executes(ctx => compActionRemove(ctx, Arguments.INTEGER.getResult(ctx, 'id')))
          )
      )

      // /compensation clear
      .then(
        Commands.literal('clear')
          .requires(src => src.hasPermission(2))
          .executes(ctx => compActionClear(ctx))
      )

      // /compensation reset <player>  |  /compensation reset all
      .then(
        Commands.literal('reset')
          .requires(src => src.hasPermission(2))
          .then(
            Commands.literal('all')
              .executes(ctx => compActionResetAll(ctx))
          )
          .then(
            Commands.argument('player', Arguments.PLAYER.create(event))
              .executes(ctx => compActionReset(ctx, Arguments.PLAYER.getResult(ctx, 'player')))
          )
      )
  )
})

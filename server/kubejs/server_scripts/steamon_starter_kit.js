// steamon_starter_kit.js
// Starter kit given ONCE to every new player on their first login.
//
// Kit contents:
//   8x  minersdelight:vegan_wrap
//   1x  cobblemon:pokedex_<random color>   (7 colors, random per player)
//   16x minecraft:torch
//   1x  artifacts:running_shoes            -> EQUIPPED in the "shoes" accessory slot
//   1x  rctmod:trainer_card
//   1x  ftbquests:book
//   1x  create:wrench
//   1x  sophisticatedbackpacks:backpack    -> EQUIPPED in the "back" accessory slot
//
// The two accessory items are equipped through the Curios API (the
// accessories_compat_layer bridges Curios <-> Accessories, so Curios slot ids
// mirror the Accessories slot names, e.g. "shoes" / "back"). This is the same
// proven pattern used by steamon_badge_equip.js.
//
// One-time guard: we tag the player's persistent data with steamon_got_kit so the
// kit is never granted twice, even across relogs. KubeJS is the single source of
// truth for the whole kit (we do NOT use FTB Essentials starter kit) to avoid any
// double-give.
//
// NOTE: all locals use `var` on purpose (KubeJS/Rhino shares scope across functions
// in a script and throws "redeclaration of var" on const/let reuse).

var CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')

var KIT_FLAG = 'steamon_got_kit'

var POKEDEX_COLORS = [
  'black', 'blue', 'green', 'pink', 'red', 'white', 'yellow',
]

// Plain inventory items: [id, count]
var KIT_ITEMS = [
  ['minersdelight:vegan_wrap', 8],
  ['minecraft:torch', 16],
  ['rctmod:trainer_card', 1],
  ['ftbquests:book', 1],
  ['create:wrench', 1],
]

// Accessory items: id -> target accessory (Curios/Accessories) slot
var KIT_ACCESSORIES = [
  ['artifacts:running_shoes', 'shoes'],
  ['sophisticatedbackpacks:backpack', 'back'],
]

// Equip one item into the first free slot of the given accessory slot type.
// Returns true if equipped, false otherwise (then we drop it in the inventory
// as a safe fallback so the player never loses the item).
function equipAccessory(player, itemId, slotName) {
  try {
    var opt = CuriosApi.getCuriosInventory(player)
    if (!opt || !opt.isPresent()) {
      console.warn('[steamon] starter kit: no curios inventory for ' + player.username)
      return false
    }
    var handlerOpt = opt.get().getStacksHandler(slotName)
    if (!handlerOpt || !handlerOpt.isPresent()) {
      console.warn('[steamon] starter kit: slot "' + slotName + '" not found. Available slots: ' +
        curiosSlotNames(opt.get()))
      return false
    }
    var stacks = handlerOpt.get().getStacks()
    for (var i = 0; i < stacks.getSlots(); i++) {
      if (stacks.getStackInSlot(i).isEmpty()) {
        var one = Item.of(itemId, 1)
        stacks.setStackInSlot(i, one)
        player.playSound('minecraft:item.armor.equip_leather', 1.0, 1.0)
        return true
      }
    }
    console.warn('[steamon] starter kit: no free slot in "' + slotName + '" for ' + itemId)
    return false
  } catch (err) {
    console.error('[steamon] starter kit equip error (' + itemId + ' -> ' + slotName + '): ' + err)
    return false
  }
}

function curiosSlotNames(inv) {
  try {
    var names = []
    var it = inv.getCurios().keySet().iterator()
    while (it.hasNext()) names.push(String(it.next()))
    return names.join(', ')
  } catch (e) { return '(unavailable)' }
}

function giveOrDrop(player, stack) {
  player.inventory.add(stack)
  player.inventory.setChanged()
  if (!stack.isEmpty()) player.drop(stack, false)
}

function grantKit(player) {
  // plain items
  for (var i = 0; i < KIT_ITEMS.length; i++) {
    giveOrDrop(player, Item.of(KIT_ITEMS[i][0], KIT_ITEMS[i][1]))
  }
  // random pokedex color
  var color = POKEDEX_COLORS[Math.floor(Math.random() * POKEDEX_COLORS.length)]
  giveOrDrop(player, Item.of('cobblemon:pokedex_' + color, 1))

  // equipped accessories (fallback to inventory if equip fails)
  for (var a = 0; a < KIT_ACCESSORIES.length; a++) {
    var id = KIT_ACCESSORIES[a][0]
    var slot = KIT_ACCESSORIES[a][1]
    if (!equipAccessory(player, id, slot)) {
      giveOrDrop(player, Item.of(id, 1))
    }
  }

  player.tell(Text.gold('Welcome to Steamon! Your starter kit has been added. Your running shoes and backpack are already equipped in your accessory slots.'))
  console.info('[steamon] starter kit granted to ' + player.username + ' (pokedex: ' + color + ')')
}

PlayerEvents.loggedIn(function (event) {
  var player = event.player
  try {
    var data = player.persistentData
    if (data.getBoolean(KIT_FLAG)) return
    grantKit(player)
    data.putBoolean(KIT_FLAG, true)
  } catch (err) {
    console.error('[steamon] starter kit login error: ' + err)
  }
})

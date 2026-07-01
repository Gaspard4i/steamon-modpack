// Right-click a badge or the Badge Case to auto-equip it into the first free
// matching Curios slot (badge -> badge slot, badge_case -> charm slot).
var CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')

var BADGE_IDS = [
  'steamon:chaos_badge', 'steamon:carnival_badge', 'steamon:greenhouse_badge',
  'steamon:terapagos_badge', 'steamon:frostfae_badge', 'steamon:iron_will_badge',
  'steamon:aether_badge',
]

// item id -> target curios slot
function targetSlot(id) {
  if (id === 'steamon:badge_case') return 'charm'
  if (BADGE_IDS.indexOf(id) !== -1) return 'badge'
  return null
}

ItemEvents.rightClicked(function (event) {
  try {
    var player = event.player
    var hand = event.item
    if (hand.isEmpty()) return
    var slot = targetSlot(String(hand.getId()))
    if (!slot) return

    var opt = CuriosApi.getCuriosInventory(player)
    if (!opt || !opt.isPresent()) return
    var handlerOpt = opt.get().getStacksHandler(slot)
    if (!handlerOpt || !handlerOpt.isPresent()) return
    var stacks = handlerOpt.get().getStacks()
    for (var i = 0; i < stacks.getSlots(); i++) {
      if (stacks.getStackInSlot(i).isEmpty()) {
        var one = hand.copy(); one.setCount(1)
        stacks.setStackInSlot(i, one)
        hand.shrink(1)
        // play the accessory equip sound (like Relics/Artifacts)
        player.playSound('minecraft:item.armor.equip_leather', 1.0, 1.0)
        return
      }
    }
  } catch (err) {
    console.error('[steamon] badge equip error: ' + err)
  }
})

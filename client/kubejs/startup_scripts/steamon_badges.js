// Steamon gym badges — real items registered via KubeJS.
// Namespace forced to "steamon:" so ids are steamon:<id> and textures resolve to
// kubejs/assets/steamon/textures/item/<id>.png

const STEAMON_BADGES = {
  chaos_badge:      'Chaos Badge',
  carnival_badge:   'Carnival Badge',
  greenhouse_badge: 'Greenhouse Badge',
  terapagos_badge:  'Terapagos Badge',
  frostfae_badge:   'Frostfae Badge',
  iron_will_badge:  'Iron Will Badge',
  aether_badge:     'Aether Badge',
  dragons_den_badge: "Dragon's Den Badge",
  ghost_badge:      'Ghost Badge',
}

StartupEvents.registry('item', event => {
  for (const id in STEAMON_BADGES) {
    event.create('steamon:' + id)
      .displayName(STEAMON_BADGES[id])
      .maxStackSize(1)
  }
  // Badge Case: worn in the charm slot, unlocks a batch of badge slots.
  event.create('steamon:badge_case')
    .displayName('Badge Case')
    .maxStackSize(1)
    .rarity('rare')
    .tooltip('Wear it to open your badge slots')
})

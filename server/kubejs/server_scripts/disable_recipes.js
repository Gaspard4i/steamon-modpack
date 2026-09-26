// Disables the crafting recipes of items we do not want obtainable via craft.
// Replaces the old Item Obliterator mod, which crashed the server by recursing
// with Lootr on container close. Recipe removal runs once at load, never scans
// containers, so it is safe with Lootr.
//
// cobblemon_utility caps/candies are handled by the "NO RECIPES" jar variant.
// This script covers the remaining non-cobblemon_utility items.

ServerEvents.recipes(event => {
  const disabled = [
    'mythsandlegends:zygarde_cube',
    'mythsandlegends:zygarde_core',
    'mythsandlegends:zygarde_cell',
    'artifacts:eternal_steak',
    'artifacts:everlasting_beef',
    'createendertransmission:chunk_loader'
  ]

  disabled.forEach(id => {
    event.remove({ output: id })
  })
})

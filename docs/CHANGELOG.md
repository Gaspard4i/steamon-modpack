# Changelog

All notable changes to the Steamon modpack.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [SemVer](https://semver.org/).

## [1.6.4] - 2026-07-05

### Added
- **Construction Sticks** — place many blocks at once to build faster (five tiers
  from Wood to Netherite, plus upgrades). Client + server.

## [1.6.3] - 2026-07-05

### Added
- **Maintenance Mode** (server) — lets admins put the server in maintenance so only
  allowed players can join. No client update needed.

## [1.6.2] - 2026-07-05

### Added
- **Create: Threaded Trains** (server) — runs the railway network calculations on
  a separate thread parallel to the server tick, big win for large train networks.
  No client update needed.

### Removed
- **Noisium** (server) — abandoned/archived worldgen optimizer, redundant with
  C2ME which already handles parallel chunk generation.

## [1.6.1] - 2026-07-05

### Added
- **Lithium** (client) — game-logic optimizations now run client-side too.

### Changed
- **ServerCore tuning** — enabled dynamic performance scaling, prevent-moving-into-
  unloaded-chunks (fewer lagspikes on chunk load), villager lobotomization, fast
  biome lookups and duplicate-fluid-tick cancelling.
- **Frogport (Package Port) reach** increased from 5 to 9 blocks.

### Fixed
- Removed orphaned `GLARES`/`RASCALS` mobcap categories (from the removed Friends
  & Foes mod) that made ServerCore's config invalid and blocked its optimizations.

## [1.6.0] - 2026-07-05

### Added
- **Create Cobblemon Potion** — brew Cobblemon medicines at scale with Create
  (Mechanical Mixer + Basin + Spout).
- **Berry Pouch [Cobblemon]** — a pouch to carry your Cobblemon berries.
- **Berry Harvester** — Create Mechanical Harvesters can now auto-harvest and
  replant Cobblemon berry bushes.
- **Echo Shard** recipes: 1 amethyst shard + 1 sculk (crafting), 1 Heart of the
  Deep cut into 8 echo shards (stonecutter), and a Create deploying variant
  (apply sculk on an amethyst shard).
- **Shulker Shell** recipe: 5 dried chorus flowers in a helmet shape around 1
  popped chorus fruit.

### Removed
- Our custom Create mixing recipes for Cobblemon medicines (27 `med_*` recipes)
  are replaced by the Create Cobblemon Potion mod.

## [1.5.6] - 2026-07-04

### Added
- **WorldEdit** (server) — re-added after the 1.5.5 revert; kept for admin world
  editing (its only issue was a one-time startup cost, not in-game lag).

## [1.5.5] - 2026-07-04

### Removed
- **Alternate Current**, **KryptonFoxified**, **WorldEdit** (server) — reverted the
  1.5.4 server-side additions after they were linked to severe TPS drops. Create
  config improvements (schematicannon speed, longer tracks, reactor rod lifespan)
  from 1.5.4 are kept. (WorldEdit re-added in 1.5.6.)

## [1.5.4] - 2026-07-04

### Added
- **Alternate Current** (server) — faster redstone engine, drastically lower tick
  time on large redstone circuits. No client update needed.
- **KryptonFoxified** (server) — network stack and entity tracker optimizations.
  No client update needed.
- **WorldEdit** (server) — world editing tools for admins (`//set`, `//copy`, etc.).
### Updated
- **Entity Culling** (client) 1.10.2 -> 1.10.5 — skips rendering entities hidden
  behind blocks for better client FPS.

### Changed
- **Schematicannon** is now much faster (delay 10 -> 2 ticks between blocks).
- **Train tracks** can be placed in longer stretches at once
  (`maxTrackPlacementLength` 32 -> 128).
- **Create Nuclear reactor rods** last longer (uranium and graphite lifespan
  3600 -> 5000 ticks).

## [1.5.3] - 2026-07-02

### Changed
- **Waystones teleport cost** — teleporting within the same dimension is now
  **free**; crossing between dimensions costs **1 level** (down from 7 levels
  same-dimension / 27 levels interdimensional). Warp plates and global waystones
  stay free.

## [1.5.2] - 2026-07-01

### Fixed
- **Removed LuckPerms** (server) — LuckPerms 5.4.140 is broken on NeoForge 1.21.1
  and caused every player to be kicked with "Invalid player data" at login.
  Permissions are already handled by NeoEssentials, so LuckPerms was redundant.

## [1.5.1] - 2026-07-01

### Fixed
- Removed the obsolete `steamon-gym-badges` resource pack (badges are now real
  KubeJS items with their own textures). This also drops the dev-only `.bat`/`.py`
  helper files that CurseForge rejected, unblocking the CurseForge upload.

## [1.5.0] - 2026-07-01

### Added
- **KubeJS** (+ Rhino) — scripting backbone for the new gym badge system.
- **Gym Badges** — seven collectible gym badges (Chaos, Carnival, Greenhouse,
  Terapagos, Frostfae, Iron Will, Aether) as real items with custom art. Right
  click to auto-equip; each plays an equip sound.
- **Badge Case** — a craftable accessory (2 string + 2 leather + 1 gold nugget)
  worn in the charm slot; it opens a dedicated row of badge slots so you can
  display the badges you have earned.
- **Badge accessory slot** (Curios) — a dedicated slot type for badges, shown in
  the accessories screen with its own icon.

### Changed
- Server pack rolls up the 1.4.1 server-only changes (Essential Commands removed,
  NeoEssentials tracked, anti-spam disabled, Create Spout poison recipes).

## [1.4.1] - 2026-06-30 (server only)

### Added
- **Create Spout poison recipes** (steamon-tweaks datapack) — all 10 Deep Aether
  poison conversions are now automatable with a Create Spout filling
  `deep_aether:poison_fluid` (250 mb each): enchanted berry to blue berry,
  enchanted dart/dart shooter to golden, enchanted gravitite to gravitite ore,
  healing stone to holystone, potato to poisonous potato, remedy bucket to
  poison bucket, quicksoil glass to quicksoil, clorite to raw clorite, skyroot
  remedy bucket to skyroot poison bucket.

### Removed
- **Essential Commands** removed (server) — it duplicated and conflicted with
  NeoEssentials (both registered /home, /back, /spawn, /tpa, /warp, etc.),
  causing player-join kit errors and command clashes. NeoEssentials is now the
  single essentials/permissions/chat provider.

### Changed
- **NeoEssentials** is now tracked in the packwiz server pack (was deployed
  manually) so it survives modpack re-installs/updates.
- **Anti-spam filter disabled** in the NeoEssentials chat config — the split-config
  AntiSpamManager threw a "config is null" exception on every chat message,
  flooding the server thread and causing multi-second tick stalls.

## [1.4.0] - 2026-06-30

### Added
- **Toni's Immersive Lanterns** — placeable hanging/standing lanterns and
  decorative lighting (uses Accessories, already in the pack).
- **Aether's Delight** — Farmer's Delight-style cooking with Aether ingredients.
- **Accessories Compatibility Layer** (+ TxniLib) — runs Curios on top of
  Accessories so there is a single accessory interface instead of two separate
  ones. Both systems stay installed (mods depend on each); players only see one.
- **Resource Pack Overrides** (client) — keeps your resource packs enabled and
  ordered across server restarts/reconnects.
- **Create x Aether recipes** (steamon-tweaks datapack) — crushing for Ambrosium
  Ore, Zanite Ore and Holystone, plus compacting Ambrosium/Zanite shards into
  blocks. Automate Aether material processing with Create.

### Removed
- **Create Live Radio** removed (client + server).
- **Friends & Foes** (and the Beekeeper Hut addon) removed — the Glares were
  accumulating in large numbers and contributing to server lag spikes.
- **Stack Refill** removed from the client pack (it was already removed
  server-side in 1.3.3 to fix the inventory-shuffle bug).

### Changed
- **Enchanted Golden Apple** Create recipe rebalanced: 25% chance for the
  enchanted apple, otherwise a weighted consolation drop (gold nugget, apple,
  gold ingot, or golden apple).

## [1.3.3] - 2026-06-29 (server only)

### Added
- **LuckPerms** (server-side) — permission/group management backing the
  moderator and admin roles (also drives the Discord moderation bridge).
- **Enchanted Golden Apple** Create sequenced-assembly recipe (steamon-tweaks
  datapack): golden apple + 1000mb experience + 25mb fire resistance + a press.
  Yields the enchanted apple 25% of the time; the rest of the time it returns a
  weighted consolation drop (gold nugget, apple, gold ingot, or golden apple).

### Removed
- **Stack Refill** removed from the server — its server-side auto-refill was
  reorganising players' inventories on its own (items moving between slots,
  hotbar tool jumping back to the first slot). This is a known Stack Refill
  behaviour when a held stack runs out. Removed server-side to stop the
  inventory shuffling. Also removed from the client pack (no client release cut
  yet — that will follow in a later client update).

### Fixed
- **Empty `c:foods/milk` tag** — several cooking recipes (Cultural Delights'
  Spicy Curry, Brewin' & Chewin', End's Delight) require the `c:foods/milk`
  item tag, but no mod populated it, so the ingredient showed as an empty tag
  and the recipes were uncraftable. Added a steamon-tweaks datapack tag mapping
  `minecraft:milk_bucket` into `c:foods/milk`.

## [1.3.2] - 2026-06-17

### Fixed
- **Sophisticated Storage** bumped to 1.5.60 (from 1.5.47) — Storage 1.5.47 was paired with Sophisticated Core 1.4.58 in 1.3.0, but that combination is incompatible: Storage 1.5.47 references `UpgradeGuiManager$IUpgradeInventoryPartFactory`, a class that does not exist in Core 1.4.58, causing a client crash at startup (`NoClassDefFoundError` during `RegisterMenuScreensEvent`). 1.5.60 is the Storage build released alongside Core 1.4.58 and matches its API.

## [1.3.0] - 2026-06-17

### Added
- **Create Live Radio** (1.0.2) — play in-game radio stations and music streams powered by the Create mod's rotational energy. Place a receiver block, spin it with a Create power source, and tune in to internet radio.
- **Create: Connected** (1.2.2) — quality-of-life additions for Create: displays, nixie tubes, and linked controls that make large Create builds easier to wire and monitor.
- **Sophisticated Storage Create Integration** (0.1.17) — connects Sophisticated Storage barrels and chests to Create logistics: filter items in and out with funnels, read stock levels with Create readers, and automate sorting through conveyor belts.
- **Sophisticated Backpacks Create Integration** (0.1.6) — lets Create funnels and belts interact with Sophisticated Backpacks, so automated crafting lines can pull from and push into backpacks directly.

### Fixed
- **Sophisticated Backpacks** bumped to 3.25.63 and **Sophisticated Core** bumped to 1.4.58 — the Backpacks Create Integration requires Sophisticated Backpacks 3.25.55 or above (and that version in turn requires Sophisticated Core 1.4.55 or above). The previous versions caused a crashloop on server boot.

## [1.2.7] - 2026-06-16 (server only)

### Removed
- **Chunky** removed — world pre-generation around spawn is done, the mod no
  longer had any task running (just sitting loaded). Removed from server/ and
  client/ in the repo. Can be re-added later if new areas need pre-generating.

## [1.2.6] - 2026-06-16 (server only)

### Removed
- **CobbleDex (rei-emi-jei)** removed from the server — it is a client-side
  Pokedex UI addon that was wrongly running server-side, re-syncing ~1 MB of
  Pokedex data to every client on each login (on the main thread), causing a
  lag spike at every connection. Removed from server/ and client/ in the repo
  (client keeps it until the next client release).

## [1.2.5] - 2026-06-16 (server only)

### Added
- **Item Obliterator** + **Necronomicon API** (server-side) — removes the
  Eternal Steak and Everlasting Beef (Artifacts) everywhere: inventories, chests,
  drops, and disables their recipes. These items were too strong (infinite food).
  Server-only, no client update needed.

## [1.2.4] - 2026-06-15

### Changed
- **Cobblemon Smartphone** updated to 1.0.9-rev01 — PokeNav and Waystone no longer require the item in your inventory (now part of the smartphone upgrade system, crafted smartphones come pre-upgraded). Removed the server-side `waystone_free` smartphone action override, which is now handled natively by the mod.

### Added
- **Deep Aether** (1.21.1-1.1.5.1) — expands the Aether dimension with new biomes, mobs, and structures.
- **TerraBlender** (4.1.0.8) — required dependency for Deep Aether.

## [1.2.3] - 2026-06-11 (server only)

### Added
- **EasyAFK** (server-side) — marks idle players as AFK and kicks them after
  5 minutes of inactivity, with anti-bypass checks (boat / water flow). Clients
  are unaffected (server-only), no client update needed.

## [1.2.2] - 2026-06-11

### Added
- **Navas ZA Megas** — adds the Mega Evolutions from Pokémon Legends Z-A to
  Cobblemon (requires Mega Showdown, already in the pack).

## [1.2.1] - 2026-06-09

### Added
- **Cultural Delights** — Farmer's Delight expansion adding regional dishes and
  cooking ingredients.
- **Pet Your Cobblemon** — pet and interact with your Pokémon.
- **Cobblemon Unchained** — Cobblemon gameplay expansion.

### Removed
- **Snow Real Magic** — caused a server crash during entity pathfinding.
- **Carry On** — recurrent crash that disconnected all players.
- **Friends for Life**.

## [1.2.0] - 2026-06-04

Big update bundling everything since 1.0.7: claim protection, recipes, and a
performance pass on both client and server. Detailed per-step notes are kept
below (1.0.8 → 1.0.17).

### Performance
- **Client FPS:** added **BadOptimizations** (engine-level optimizations) and
  **Sodium Extra** (OptiFine-style video settings — lower particles, fog,
  clouds, animations to gain FPS on weaker PCs without losing any content).
- **Dropped Saturn** (redundant — its mixins were all overridden by Lithium /
  ModernFix, doing nothing but spamming conflict warnings).
- **Added C2ME** (Concurrent Chunk Management Engine) for multithreaded chunk
  generation/loading — big help against exploration freezes.
- **Pre-generated** the area around spawn (Chunky) so generation lag is gone
  inside the played zone.
- `entity-broadcast-range-percentage` lowered to 80 (server).

### Claim protection (OPAC) — per-claim toggles, protected by default
- Armor stands & hat stands, decorations (bell, globe, hourglass, clock, flags,
  etc.), the whole Create ecosystem (interact only), and all remaining modded
  containers (backpacks, gilded chests, easy villagers, kegs, cabinets, etc.).
- Vault interaction (toggle, on by default). Warp plate right-click removed.
- Carry On: picking up other players disabled.
- You can break your own gravestone in any claim.

### Mobs
- Zombie/Skeleton Horse traps disabled (In Control).

### Recipes (steamon-tweaks datapack)
- Create recipes added: blank TR / blank TM (sequenced assembly + soap),
  Zygarde Cell, Disc Fragment 5.
- Ender Transmission transmitters reworked (crying obsidian / eye of ender /
  warp stone); chunk loader recipe removed.
- Crying obsidian no longer obtainable via Haunting.
- **Removed the Easy Villagers mod entirely** (client + server), along with its
  datapack recipe and its entries in the OPAC Modded_Storage group.

## [1.0.17] - 2026-06-03

Server-only release (client stays on 1.0.7). Recipe overrides via the
`steamon-tweaks` datapack.

### Changed
- **Ender Transmission transmitters reworked.** Energy / item / fluid
  transmitters now use crying obsidian (was obsidian), eye of ender (was ender
  pearl) and a warp stone (was eye of ender). The chunk loader recipe is removed.
- **Easy Villagers are now Create-only.** All seven blocks (trader, auto trader,
  breeder, converter, farmer, incubator, iron farm) can only be made in a
  Mechanical Crafter, not the vanilla crafting table.

### Removed
- **Crying obsidian can no longer be made by Haunting** (disabled the create_sa
  and create_ultimate_factory haunting recipes), keeping it a deliberate
  ingredient.

## [1.0.16] - 2026-06-03

Server-only release (client stays on 1.0.7).

### Fixed
- **Supplementaries statue moved from Decorations to containers.** The statue
  has an item slot, so it belongs to `Modded_Storage` (protected like a
  container), not the cosmetic `Decorations` group.

### Changed
- **Seats group extended to every modded sittable.** Added CobbleFurnies
  (chairs/armchairs/stools/sofas tags), let's-do Meadow (chairs, benches,
  sofas), Beachparty (beach/palm chairs, bar stool, towel) and Vinery chair on
  top of Create / Comforts / Another Furniture. Sitting stays enabled by default.

## [1.0.15] - 2026-06-02

Server-only release (client stays on 1.0.7). Three new per-claim OPAC toggles,
all protected by default and enableable by the claim owner.

### Added
- **Decorations toggle** — interaction with purely cosmetic blocks (vanilla
  `bell`, Supplementaries globe / sepia globe / hourglass / clock / flags /
  crystal display / doormat / statue / faucet / bellows / candelabra / candle
  holders / sconces / relayer / turn table).
- **Create toggle** — `Create{create*:*}` covers the whole Create ecosystem
  (Create + all its addons), interaction only (no breaking), so visitors can't
  mess with machines in a claim unless the owner allows it.
- **Modded containers expanded** — `Modded_Storage` now also covers
  Sophisticated Backpacks, Cobblemon gilded/gimmighoul chests, Easy Villagers,
  Supplementaries safe/jar/urn/flower box/lunch basket, Supplementaries Squared
  sacks, Aether chests, Brewin' kegs, the let's-do / nether's-delight cabinets,
  Farm & Charm bags, Miner's Delight basket, and Vinery containers. (Vanilla,
  Spud's Shop and Lootr stay handled separately.)

## [1.0.14] - 2026-06-02

Server-only release (client stays on 1.0.7).

### Changed
- **Armor stand / hat stand protection is now a per-claim toggle (claim-aware).**
  Dropped the global lockout. Added `anything$Armor_Stands{minecraft:armor_stand}`
  and `anything$Hat_Stands{supplementaries:hat_stand}` as OPAC optional entity
  exception groups with player-config options. Result: outside claims anyone can
  interact; inside a claim it is protected by default (`N`), and each claim owner
  can enable it for their own claim from the OPAC menu.

### Fixed
- **You can now break your own gravestone in any claim.** Added
  `break$gravestone:gravestone` to `forcedBlockProtectionExceptionList`. OPAC no
  longer blocks breaking the grave inside claims; the Gravestone mod's own
  `only_owners_can_break=true` still restricts it to the grave's owner (+ admins),
  so only you can break your grave, anywhere.

## [1.0.13] - 2026-06-02

Server-only release (client stays on 1.0.7).

### Changed
- **Armor stand / hat stand interaction blocked server-wide again.** Re-added
  `minecraft:armor_stand` and `supplementaries:hat_stand` to
  `completelyDisabledEntityInteractions`. Root cause of the theft was found: the
  Spawn claim had `entitiesByPlayers = "E"` (all entities open to everyone), so
  claim-based protection couldn't help there. The global block is the reliable
  fix — it stops item theft from both stands everywhere without touching other
  entities. Trade-off: stands are decorative only (nobody, owner included, can
  equip/remove items). Breaking/placing still works.

## [1.0.12] - 2026-06-02

Server-only release (client stays on 1.0.7).

### Changed
- **Armor stand / hat stand protection is now claim-based again.** Dropped the
  server-wide `completelyDisabledEntityInteractions` lockout (which blocked the
  owner too) and removed the `Armor_Stands` exception group entirely, so both
  entities fall under the base `entitiesByPlayers` claim protection only: the
  claim owner and party can use them, others cannot. (Testing whether this holds
  against the Aether arms / Supplementaries interaction paths.)

## [1.0.11] - 2026-06-02

Server-only release (client stays on 1.0.7).

### Removed
- **Old starter kits Starter1–Starter7 dropped.** Only the new `Default` kit
  remains, so every new player gets the same up-to-date kit.

## [1.0.10] - 2026-06-02

Server-only release (client stays on 1.0.7).

### Changed
- **Armor stands and hat stands can no longer be interacted with — anywhere, by
  anyone.** Both are entities (`minecraft:armor_stand`,
  `supplementaries:hat_stand`) whose item slots could be looted even inside
  claims: the Aether arms mixin and Supplementaries route the take/equip through
  a code path that bypassed OPAC's claim protection. Added both to OPAC's
  `completelyDisabledEntityInteractions`, which blocks interaction server-wide
  and is not bypassable. They stay decorative — placing and breaking them still
  works, only equipping/removing items is gone. A true claim-aware block is not
  possible with these mods.

## [1.0.9] - 2026-06-02

Server-only hotfix (client stays on 1.0.7).

### Fixed
- **End lockout disabled and de-bugged.** The 1.0.8 lockout used
  `execute in the_end as @a`, which does not filter players by dimension (the
  `in` only sets the execution dimension) — so every player, including those in
  the overworld, was teleported to spawn every tick and could not move. The
  function is now correct (`execute as @a if dimension minecraft:the_end`) but
  left **out of the `tick` tag**, so the End is open again. Re-enable by adding
  `steamon:disable_end_tick` back to the tick tag.

## [1.0.8] - 2026-06-02

Server-only release (client stays on 1.0.7). Config tweaks to mob spawning,
claim protection, Carry On, and a temporary End lockout.

### Changed
- **Zombie and Skeleton Horse traps disabled.** In Control now denies
  `minecraft:skeleton_horse` and `minecraft:zombie_horse` outright. The
  previous hostile-only spawn deny rule never caught them, since trap horses
  are not flagged hostile, so lightning storms kept spawning skeleton-horse
  traps.
- **Warp plate no longer interactable by right-click in claims.**
  `waystones:warp_plate` was removed from the OPAC `Waystones` exception
  group. Warp plates still work by walking onto them; only the right-click
  interaction in foreign claims is gone.
- **Carry On: picking up other players is disabled** (`pickupPlayers = false`).
- **The End is closed for now.** A `steamon-tweaks` datapack tick function
  bounces any player who enters `the_end` back to the overworld spawn. Vanilla,
  reversible — remove `steamon:disable_end_tick` from the `minecraft:tick` tag
  to re-open it.

### Added
- **Vault exception in OPAC** (`minecraft:vault`), enabled by default on the
  server and toggleable per claim. Lets players activate vaults inside claims.

## [1.0.7] - 2026-05-31

Cleanup release: drops two unused mods that were silently bloating the
client download, and unblocks the CurseForge auto-publish pipeline.

### Removed
- **WATERMeDIA: Multimedia API** and its companion **wm_binaries** (171 MB
  of media codecs) dropped from the client. Nothing in the pack actually
  used them — no other mod referenced WaterMedia's APIs, and there's no
  feature in Steamon that needs video/audio playback in-world. Dropping
  them shaves ~180 MB off the client download for everyone.

### CI
- **CurseForge auto-publish now works end-to-end.** The previous pipeline
  uploaded the Modrinth `.mrpack` to CurseForge — CurseForge silently
  rejected those uploads (HTTP 200 + a fileId but the file never showed
  up in the dashboard) because it expects a CF-native zip with
  `manifest.json` at the root, not Modrinth's `modrinth.index.json`.
  The pipeline now runs `packwiz curseforge export` for the client and
  uploads the CF-native zip instead. Combined with the WaterMedia
  cleanup above, the CF upload fits under the API's size limit and goes
  through automatically on every release.

## [1.0.6] - 2026-05-31

Big quality-of-life pass on claims, anti-grief, and chat clutter. Adds the
Radical Trainer Card to starter kits, fixes Magnum Torches blocking your own
party send-outs, and drops two orphan mods.

### Added
- **Radical Trainer Card** in every starter kit (slot 9). New players can
  start tracking and challenging RCT trainers immediately, no detour to
  find the card item.
- **Carry On blacklist extended** to cover the rest of the modded content
  that was still pickup-able by accident: every Exposure block + entity,
  the Spud's Shops blocks, every Let's Do block + entity (Meadow, Vinery,
  Nethervinery, Farm & Charm, Beachparty), the three Immersive mods
  (Furniture, Melodies, Aircraft), the Create addons whose namespace
  doesn't start with "create" (Dreams & Desires, Molten Vents, Stam1o
  Tweaks, Slice and Dice), and RCT trainers (so you can't carry an NPC
  away mid-fight).
- **OPAC claim QoL exceptions** (default-on, owner-disablable): waystones,
  warpstones, Cobblemon healing machines and PCs all stay usable inside
  someone else's claim. Lootr blocks stay interactable even when forced
  by the owner. Harvest tools, seats, modded storage and cooking blocks
  also covered.
- **OPAC anti-grief forced rules**: gravestones, Spud's Shops blocks,
  Lootr containers and the brush/pokeball items stay interactable
  everywhere, with no opt-out — prevents lock-out exploits.

### Changed
- **Healing machine recharge is now infinite** (`infiniteHealerCharge`).
  No more sitting on a hill for two minutes mid-progression — heal up
  and keep going.
- **Resourcepack priority**: the auto-generated `mod_resources` is now
  pinned at the bottom of the list (highest priority), so mod textures
  always win over the base pack stack when there's a conflict.
- **Magnum Torch**: removed `cobblemon:pokemon` from the blacklist. The
  torch couldn't tell a wild spawn from a player sending out their own
  party, so it was breaking send-outs in claimed areas. It now blocks
  only RCT trainers (on top of vanilla hostiles).
- **Cobblemon Unchained chat notifications** silenced for hidden-ability
  and perfect-IV rolls (12 of 18 boosters). Shiny notifications are kept
  — they're rare enough to be worth the visibility. Boosters still work
  silently; you discover the reward by inspecting the pokemon.
- **Keybinds remap** (Default Options, first install only — never resets
  existing player choices): `²` opens the Cobblemon summary (was the
  smartphone), `V` opens the voice-chat menu, `N` mutes the mic.

### Removed
- **TerraBlender** dropped. Orphan dependency: Terralith 2.5+ migrated to
  Lithostitched, Tectonic uses Lithostitched too, nothing in the pack
  references TerraBlender anymore.
- **Man of Many Planes** + its Create-recipes datapack dropped. Unused
  content weight, no mod in the pack depends on it.

### Fixed
- The `unchained.notification.hidden.spawn` raw lang key no longer shows
  up in chat. Root cause was Unchained being server-side only — the
  client never had the translation file. Silencing the HA/IV notifications
  removes the issue at the source.

### CI
- **CurseForge auto-publish** added (was Modrinth-only). Same `.mrpack`
  goes to both stores.
- **Changelog auto-extraction** from `docs/CHANGELOG.md`. The same
  English changelog now ships to Modrinth, CurseForge and the Discord
  `#changelog` embed automatically — no more manual PATCH after release.
- **Featured auto-toggle on Modrinth**: on a `-release` tag, the new
  version is featured and previous versions are un-featured.
- **Pipeline speedup**: packwiz binary cached, smoke test and depcheck
  parallelised. Run time drops from ~3 min to ~1 min 15.

## [1.0.5] - 2026-05-28

### Changed
- **Claims per player lowered from 500 to 100 (Open Parties & Claims).** 500 chunks each was
  far more than anyone needs and let a few players fence off huge areas; 100 claimed chunks
  is still plenty for a base + farms while keeping the map open for everyone. Party members
  still pool their claims, and forceloads stay at 5.

## [1.0.4] - 2026-05-28

### Fixed
- **Relics research screen no longer flickers** (client). ImmediatelyFast's `enhanced_batching`
  (it batches GUI draw calls to save performance) was breaking Relics' custom research /
  ability-unlock puzzle screen, making it flash/blink. Batching is now disabled in
  `config/immediatelyfast.json` — the screen renders cleanly. Negligible perf impact, and
  it also avoids the same glitch on other complex modded GUIs.

## [1.0.3] - 2026-05-28

### Added
- **Visible Traders** (client + server): a villager's *locked* trades (the higher-tier
  offers normally hidden until you level the villager up) are now shown in the trade
  screen, so you can see what a villager will eventually sell before grinding it. Pairs
  with Easy Villagers' trade cycling. Trades revert if the mod is ever removed (no exploit).

### Changed
- **Discord bridge: advancement messages removed from chat.** Every player advancement
  used to spam the Discord #in-game-chat ("X has made the advancement …"); those messages
  are now off. Normal chat, joins/leaves and deaths still bridge as before.

## [1.0.2] - 2026-05-28

Bug-fix and balance pass: kills the night-time mobs that slipped past our spawn rules,
removes a redundant mod that made villager trades cycle twice, locks down a carriable
block, and adds the last batch of Mega-item crafting recipes.

### Removed
- **Trade Cycling** mod removed. It did the exact same thing as Easy Villagers (cycle a
  villager's offers), and both were bound to the same key — so a single press cycled the
  trade **twice**. Easy Villagers keeps the feature on **C**; now one press = one cycle.

### Changed
- **Hostile spawns tightened (In Control).** Phantoms (the night-time "insomnia" mobs)
  and village-siege / reinforcement zombies were still spawning at night because they
  don't use the normal spawn path our rule blocked. They're now denied too, and
  `doInsomnia` is off so phantoms never trigger in the first place. Spawners, trial
  spawners and summons are unaffected.
- **Carry On: Cobblemon Display Case is no longer carriable.** Picking it up with Carry On
  could drop its stored item / desync its block entity, so it's blacklisted like the
  other inventory-sensitive blocks.

### Added (custom recipes — steamon-tweaks datapack)
- **Mega items are now craftable**, so Mega Evolution no longer depends purely on finding
  drops:
  - **Keystone**: compress a Radiated Mega Meteorite block 20× in a sequenced assembly —
    70% chance to yield the Keystone, otherwise you get a plain Mega Meteorite block back.
    Also a Create deploying recipe.
  - **Mega Stone**, **Blank Z-Crystal**, **Wishing Star**, **Sparkling Stone** (light & dark):
    each gets a shaped recipe plus a Create variant (deploying / mixing / assembly).

## [1.0.1] - 2026-05-27

### Added
- **Starter Kit** (server): every new player gets a random kit on first join (1 of 7 variants) —
  a Pokédex (random color), 10 Poké Balls, Running Shoes, a Sophisticated Backpack, 10 Oran Berries,
  and 4 random-color Apricorn seeds. Admins can re-give with `/sk give <player> <kit>`.
- **Just Zoom** (client): zoom keybind set to **C**, adjustable with the scroll wheel.
- **Sodium Dynamic Lights** + **Create: Dynamic Lights** (client): held/dropped light-emitting items
  (and Create light sources) now light up their surroundings.

### Changed
- Sophisticated Backpacks are now owner-locked (other players can't open them).

## [1.0.0] - 2026-05-27 — First stable release

Out of beta. Full recap of the pack and everything that changed across the betas.

### Content & mods
- Create x Cobblemon core (MC 1.21.1 / NeoForge).
- Mega Showdown + AllTheMons x MSD (Mega Evolution, Dynamax, Terastallization, Z-Moves).
- Cobblemon addons: Fight or Flight, Unchained, Capture XP, CobbleStats, Counter, Release Rewards,
  Safe Pastures, Paleontology, CobBreeding, SimpleTMs, Cobblemon Industries (Create), Smartphone,
  PokeNav/CobbleNav, Cobbledex.
- Large Create stack (Steam'n'Rails, Createaddition, Create Nuclear, Ultimate Factory, and more).
- Worldgen: Terralith, Tectonic, Towns & Towers, CTOV, YUNG's structures, Explorify, Sky Villages.
- QoL/social: Waystones (+ teleport pets), Simple Voice Chat, Sophisticated Storage & Backpacks,
  Jade, JEI, Carry On, Gravestone, Easy Villagers, Tree Harvester, Open Parties & Claims,
  Discord <-> MC chat bridge.
- Client: Xaero's minimap (mob icons, top-right), default resourcepacks pre-enabled,
  CraftPresence ("Playing Steamon"), tuned default options.

### Changed (balance & config)
- Hostile mobs no longer spawn naturally at night, except in the Aether, the Otherside (Deep Dark
  dimension) and the vanilla Deep Dark biome. Spawners / trial spawners / summons still work.
- Cobblemon can no longer spawn in the Otherside dimension.
- Magnum Torch (diamond) also blocks wild Cobblemon and Radical trainers, wider range.
- Carry On: only block-entity blocks are carriable; Create machines & Pokémon stay non-carriable.
- Waystones: warp cost ~1 level (same dim) / ~3 levels (interdimensional).
- Claims (OPAC): 5 forceloads, 500 claims per player (stack in parties).
- Mega Showdown: multiple Megas, Dynamax anywhere, Tera shard cost reduced to 16.
- Tree Harvester: chop without sneaking, no auto-replant.
- Create Nuclear: reactor explosion disabled.
- Jade: shows all Pokémon stats (caught or not).
- Gravestone: owner-only grave breaking. Servercore perf tuning. Internal mod backups disabled.
- Eternal Steak / Everlasting Beef: loot removed (no longer obtainable).
- Minecraft tutorial (move/jump/punch a tree) disabled by default.

### Added (custom recipes — steamon-tweaks datapack)
- Smartphone: Mechanical Crafter recipe (any pokefinder + apricorn + warp stone + healing machine +
  nether star + PC + precision mechanism + ender chest); vanilla recipe removed; re-dye to any color.
- Base villager (Easy Villagers): emeralds + brown mushroom + Heart of the Deep + any crop.
- 18 Type Gems (amethyst + diamond + a type item).
- 18 Tera Shards + Stellar: gem -> 4 shards via cutting board (iron+ pickaxe / diamond+ knife) or
  Create saw; reverse 4 shards + 4 diamonds -> 1 gem; Stellar = nether star cut the same way.
- Rare Candy: Create sequenced assembly (exp candy XL -> deploy apricorn -> spout honey ->
  deploy paper -> deploy blue dye -> press); old mixing recipe removed.
- Applin apples: Sweet (honeycomb), Tart (sweet berries), Syrupy (honey bottles).
- Skeleton Skull: bone block on a cutting board (+ bonus bone meal). Wither Skeleton Skull: mixing
  (wither rose + skull) OR a 10-step sequenced assembly (80% success, scrap on failure).
- Wither Rose: haunting a poppy -> 1% wither rose / 99% ash.
- Nether Star duplication: 4 stellar shards + 4 diamonds + 1 star -> 2.
- Cobblemon staples now craftable: everstone, leftovers, lucky egg.
- All Cobblemon medicines ported to Create mixing (27 recipes, same berries as brewing);
  brewing stand & campfire still work too.

## [Unreleased]

### Added
- Initial repository structure (packwiz client + server, GitHub Actions CI)

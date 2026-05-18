![Steamon — Create x Cobblemon x Cozy Farm](https://cdn.modrinth.com/data/CR2XFGJ4/images/be4f1ffd5f82a3e95a089e3bb266d086ad289298.png)

# Steamon — Create × Cobblemon × Cozy Farm

**NeoForge 1.21.1 | Create 6.0 | Cobblemon 1.7 | Sophisticated Storage | Cozy Farming | Adventure | Optimized | Multiplayer-ready**

A cozy automation + Pokémon modpack where you tame your first Pikachu, automate your kitchen with Create contraptions, and clear gym leaders along the way — all in the same world.

Ships as **two variants** on Modrinth:

- **Steamon Client** — optimized for FPS, shader-ready, full QoL
- **Steamon Server** — optimized for TPS, curated Cobblemon datapacks (Indigo League, gyms, trainers)

---

## 🌟 Why Steamon?

Most Create+Cobblemon packs are kitchen-sink: hundreds of mods, no focus, painful to onboard. Steamon picks **three pillars** and builds a tight, opinionated experience around them.

- ⚙️ **Create 6.0** for automation, trains, factories
- 🎮 **Cobblemon 1.7.3** for the full Pokémon journey
- 📦 **Sophisticated Storage** for smart, upgradable storage

Everything else is curated to support these three. No filler.

---

## ✨ Features

⚙️ **Create ecosystem** — Steam 'n' Rails, New Age (electricity), Numismatics (economy), Big Cannons, Diesel Generators, Crafts & Additions, Deco, Connected, Enchantment Industry
🎮 **Cobblemon journey** — Mega Showdown, Knowlogy (in-game Pokédex), AllTheMons, Radical Cobblemon Trainers, full Indigo League with gyms and Elite Four
🌳 **Adventure** — Terralith, YUNG's series, When Dungeons Arise, Towns and Towers, Repurposed Structures, Waystones
🌾 **Cozy & Farm** — Farmer's Delight, Aquaculture, Friends & Foes, Supplementaries, Chipped, all four Macaw's mods, Beautify
💍 **RPG-lite** — Accessories (NeoForge-native), Relics, Artifacts
🗺️ **Maps** — Xaero's Minimap & World Map with Cobblemon icon overlay
⚡ **Optimized client** — Sodium, Iris (shaders!), FerriteCore, ModernFix, EntityCulling, ImmediatelyFast
🚀 **Optimized server** — Lithium, ServerCore, Spark, Alternate Current, Noisium

---

## 🎨 Visuals

- 🖼️ **Fresh Animations** + Fresh Moves / Fresh Player extensions
- 🐾 **XaerosCobblemon** — Pokémon icons on the minimap
- 👤 **RCT Trainers+** — extra trainer textures and animations
- 🌅 **Complementary Reimagined** shader pack shipped (disabled by default — enable in Video Settings → Shaders)

---

## 📦 Installation

### Client (player)

1. Install the [Modrinth App](https://modrinth.com/app)
2. Browse Modpacks → search **Steamon** → click *Install* on the **Client** version
3. Launch

Also works with **Prism Launcher**, **ATLauncher**, **MultiMC** — anything that accepts `.mrpack`.

### Server (host)

1. Download the latest **Server** `.mrpack` from this page
2. Unzip into a fresh server directory
3. Install **NeoForge 21.1.230** on top
4. Tweak `server.properties` if needed (default: view-distance 8, simulation-distance 6)
5. Run with Java 21, 8 GB RAM minimum: `java -Xms8G -Xmx8G -XX:+UseG1GC -jar neoforge-server.jar nogui`

Full setup notes in the [GitHub repo](https://github.com/Gaspard4i/steamon-modpack/blob/main/docs/INSTALL.md).

---

## 🔄 Why two variants?

A one-size-fits-all modpack forces servers to ship Sodium and Iris uselessly (the server doesn't render anything) and forces players to pay for ServerCore tuning that does nothing on their machine.

Steamon splits the concerns:

| | Client | Server |
|---|---|---|
| Sodium / Iris / EntityCulling | ✅ | ❌ |
| Resource packs / shaders | ✅ | ❌ |
| Xaero's Minimap | ✅ | ❌ |
| Lithium / ServerCore / Noisium | ❌ | ✅ |
| Gym leader datapacks (Indigo, RGS, CobbleBuilds) | ❌ | ✅ |
| RCT NPC trainers | ✅ | ✅ |
| Core mod set (Create, Cobblemon, Storage, structures, cozy) | ✅ | ✅ |

Both variants share the same core, so multiplayer is seamless: install Client, connect to a server running Server.

---

## ❓ FAQ

**Q: Do I need Java 21?**
Yes — NeoForge 1.21.1 requires Java 21. Modrinth App and Prism handle this automatically.

**Q: How much RAM?**
Client: 6 GB allocated minimum, 8 GB recommended for shaders. Server: 8 GB minimum, 12 GB for 10+ players.

**Q: Are shaders enabled by default?**
No. Complementary Reimagined ships in `shaderpacks/` but is disabled. Activate it in *Video Settings → Shaders* — Iris will handle the rest.

**Q: Can I play singleplayer with the Server variant?**
Technically yes (it's still a `.mrpack`), but you'll be missing the client perf mods. **Use the Client variant for singleplayer.**

**Q: Will there be a questbook?**
Planned for v0.3 — FTB Quests or Heracles, depending on stability in 1.21.1.

**Q: Are Pokémon spawning in Terralith biomes?**
The `AllTheMons x Mega Showdown` datapack covers most cases. If a biome feels empty, see the spawn notes in [`docs/CONFIG_NOTES.md`](https://github.com/Gaspard4i/steamon-modpack/blob/main/docs/CONFIG_NOTES.md).

---

## 🗺️ Roadmap

- ✅ **v0.1** — Core mod selection, dual client/server packs, CI pipeline
- 🔧 **v0.2** — Custom configs (Relics balance, Terralith spawn patch, server tuning)
- 📜 **v0.3** — Questbook (FTB Quests or Heracles)
- 🌍 **v0.4** — Custom Cobblemon spawn rebalance for Terralith biomes
- 🚀 **v1.0** — First stable release with full smoke-test in solo and multiplayer

---

## 🛠️ Source code

Built with [packwiz](https://packwiz.infra.link/) — every mod is tracked in a TOML file under `client/mods/` or `server/mods/`. Fully open source on **[GitHub](https://github.com/Gaspard4i/steamon-modpack)**.

CI publishes a new version to Modrinth automatically on every `v*-client` / `v*-server` Git tag.

## 👥 Credits

Every mod, resource pack, and shader in this modpack is the work of its respective authors — please support them directly on their Modrinth pages.

Modpack curated by **[Gaspard4i](https://github.com/Gaspard4i)**.

Special thanks to the **Cobblemon**, **Create**, and **Modrinth** communities.

## 🐛 Issues & Suggestions

Found a bug? Got an idea for v0.2? **[Open an issue on GitHub](https://github.com/Gaspard4i/steamon-modpack/issues)**.

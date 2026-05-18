# Notes de configuration

## Relics — Désactivation de l'Infinite Steak

L'item **Infinite Steak** de Relics permet de manger sans limite et casse l'équilibre alimentaire. Pour le désactiver :

1. Lancer le jeu une première fois pour que Relics génère ses configs
2. Ouvrir `config/relics/items/infinite_steak.toml`
3. Mettre `enabled = false`
4. Sauvegarder, relancer

Alternative côté serveur : ajouter dans la liste `disabled_items` du fichier `config/relics-common.toml` :

```toml
disabled_items = ["relics:infinite_steak"]
```

## Cobblemon spawn dans Terralith

Cobblemon ne spawne pas nativement dans les biomes Terralith. Le datapack **AllTheMons x Mega Showdown** (déjà inclus côté serveur) fournit des configs de spawn élargies. Si certains biomes Terralith restent vides de Pokémon :

- Ajouter manuellement un datapack universel "Cobblemon Biome Spawn Patch" (à chercher sur Modrinth si besoin)
- Ou éditer `config/cobblemon/spawning/biome_categories.json` pour mapper les biomes Terralith aux catégories Cobblemon

## Sodium / Iris

Sodium est livré activé. Iris est livré sans shader actif (le `.zip` Complementary Reimagined est présent dans `shaderpacks/` mais désactivé). Pour activer : Options vidéo → Shaders → choisir Complementary Reimagined.

## RAM serveur recommandée

- 8 Go minimum
- 12 Go recommandé pour 10+ joueurs simultanés
- Java 21 obligatoire (NeoForge 1.21.x)

Lancement type : `java -Xms8G -Xmx8G -XX:+UseG1GC -jar neoforge-server.jar nogui`

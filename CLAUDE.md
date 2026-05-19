# Steamon Modpack — Project notes for Claude

Modpack Modrinth **Create x Cobblemon** pour Minecraft 1.21.1 (NeoForge 21.1.230). Pack géré avec **packwiz**, publié sur Modrinth via GitHub Actions sur tag.

## Structure

```
steamon-modpack/
├── .github/workflows/publish.yml   CI : tag v*-client/v*-server -> upload .mrpack sur Modrinth
├── .modrinth/                      Assets de la fiche Modrinth (banner.png, icon.png, body.md)
├── .blender/                       Pipeline 3D render (Playwright, skinview3d, Blockbench)
├── .ballviewer/                    Vite/React playground pour inspecter bbmodels (NON publie)
├── client/                         packwiz pack client (mods, config, shaderpacks)
├── server/                         packwiz pack server (mods, config, datapacks)
└── docs/                           INSTALL, CONFIG_NOTES, CHANGELOG
```

## Workflow de release (CRITIQUE)

**Les `.mrpack` Modrinth ne sont publies QUE sur tag git `v*-client` / `v*-server`.** Un push sur main sans tag ne declenche rien. Si l'utilisateur dit "j'ai modifie le pack mais Modrinth montre l'ancienne version", c'est qu'il manque le tag.

Procedure pour publier une nouvelle version :

```bash
# 1. Bumper la version dans client/pack.toml ET server/pack.toml
#    (champ `version = "X.Y.Z"`)

# 2. Refresh packwiz dans les deux dossiers (recalcule les hash de l'index)
cd client && packwiz refresh && cd ..
cd server && packwiz refresh && cd ..

# 3. Commit + push main
git add client/pack.toml server/pack.toml
git commit -m "release: bump to vX.Y.Z (<resume des changements>)"
git push origin main

# 4. Tagger les deux variantes ET pousser les tags
git tag vX.Y.Z-client vX.Y.Z-server
git push origin vX.Y.Z-client vX.Y.Z-server

# 5. La pipeline tourne ~40s par variante. Verifier :
gh run list -R Gaspard4i/steamon-modpack --limit 4
```

Convention de version : tout drop/ajout de mods = bump minor (`0.X.0`), correction d'un mod cassé = bump patch (`0.X.Y`).

## Modrinth — particularites importantes

- **Project ID** : `CR2XFGJ4`, **slug** : `steamon`.
- **Token API** : secret GitHub `MODRINTH_TOKEN` sur le repo. Si la pipeline echoue avec `Token length: 1`, le secret n'a pas ete set correctement — utiliser `echo -n "<token>" | gh secret set MODRINTH_TOKEN -R Gaspard4i/steamon-modpack` (NE PAS utiliser `printf` avec `--body -` sur Windows/Git Bash, le pipe stdin peut ne pas passer).
- **Banniere dans la description (`body.md`)** : il faut une **URL externe** (Modrinth n'accepte pas les images inline). Pour mettre a jour la banniere de la description :
  1. Upload l'image dans la Gallery via `POST /v2/project/steamon/gallery?ext=png&featured=true&title=...`
  2. Recuperer l'URL CDN dans la reponse (`raw_url`, pas `url` qui est la version `.webp`)
  3. Patcher `.modrinth/body.md` avec la nouvelle URL
  4. PATCH le body sur Modrinth : `PATCH /v2/project/steamon` avec `{"body": "..."}`
  5. Commit + push `.modrinth/body.md`
- **Suppression d'une image Gallery** : `DELETE /v2/project/steamon/gallery?url=<webp_url_encoded>` — utiliser l'URL `.webp` (champ `url`), pas le `raw_url` `.png`, sinon erreur "not part of the project's gallery".
- **Banniere de page** (haut de la fiche Modrinth) : Gallery item avec `featured=true`. **L'icone** : champ `Settings -> General -> Icon`, carre, format PNG/WEBP.

## Source de verite des assets

- **Banniere** : `.modrinth/banner.png` (sert le README GitHub via chemin relatif ET sert de source pour upload Modrinth)
- **Icone** : `.modrinth/icon.png`
- Les versions canoniques sont **commitees** (pas dans `Downloads/`). Quand l'utilisateur fournit un nouveau fichier depuis Downloads :
  1. Copier dans `.modrinth/banner.png` ET `.blender/output/banner.png` (mirror)
  2. Commit + push (le README GitHub se met a jour automatiquement)
  3. Upload sur Modrinth Gallery (featured) via API
  4. Supprimer l'ancienne image de la Gallery
  5. Patcher `body.md` avec la nouvelle URL CDN + PATCH body Modrinth

## Conventions

- **Pas de `git add -A` / `git add .`** — toujours staged precis. `.ballviewer/node_modules/` fait 229 Mo, doit rester ignore.
- **Commit messages** : `feat(mods): ...` pour ajout/drop, `chore(assets): ...` pour banner/logo, `release: bump to vX.Y.Z` pour version bump, `fix(ci): ...` pour pipeline.
- **CRLF warnings** sur les `.toml` et `.py` : normal, Git autoconvert sur Windows, ignorer.
- **Branche main protegee cote Claude Code** : le push direct sur `main` declenche un prompt de confirmation. C'est normal, demander a l'utilisateur de confirmer ou de passer par une feature branch.

## Pipeline CI — points connus

- `.github/workflows/publish.yml` utilise **curl inline** (pas d'action externe pour eviter les casses).
- L'upload `.mrpack` se fait via `POST /v2/version` avec multipart (data + file_parts).
- Si la pipeline echoue, premier reflexe : `gh run view <run_id> --log-failed | tail -40` et chercher "Token length", "HTTP:" ou "error".

## Social preview GitHub

Non-API : se configure manuellement dans GitHub Settings -> Social preview. Pas de moyen de l'automatiser via `gh` ou l'API REST.

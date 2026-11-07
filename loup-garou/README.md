# Loup-Garou en ligne : une table, une nuit

Le Loup-Garou de Thiercelieux pour jouer entre amis. **Une seule partie** partagée par tout le monde, protégée par un mot de passe. 100 % JavaScript.

## Fonctionnement
- **Table unique** : un seul état de jeu côté serveur. Le premier arrivé devient hôte (transfert automatique s'il part).
- Chaque joueur choisit un **pseudo** (unique) et une **couleur** (18 cachets, unique, mise à jour en direct).
- Partie en cours = les nouveaux arrivent en **spectateurs** (aucun rôle visible) et rejoignent à la partie suivante.
- Reconnexion automatique (token en localStorage), même en pleine nuit.
- Rôles : Loup-Garou, Villageois, Voyante, Sorcière, Chasseur, Cupidon, Petite Fille, Voleur + élection du Maire.
- **Narrateur** : l'hôte peut désigner un joueur narrateur. Il ne joue pas, voit seulement la liste des rôles à appeler dans l'ordre de la nuit et fait avancer la partie (étape suivante, ouverture et clôture du vote, +30 s). Les votes restent aux joueurs et sont comptés automatiquement. Sans narrateur, des minuteurs rythment la partie. Si le narrateur se déconnecte en pleine nuit, le jeu reprend en automatique.
- Règles accessibles à tous (onglet Règles). Chaque joueur peut retourner sa carte à tout moment pour relire son rôle.
- Chat du village (jour), des loups (nuit), des morts.

## Architecture
```
server/core   moteur PUR (machine à états, rôles = Strategy, actions = Commands, projection par joueur)
server/net    Socket.IO, validation Zod, rate limiting
server/infra  snapshot JSON atomique (la partie survit à un redémarrage)
client        Vite + JS vanilla + GSAP, scènes DOM
shared        constantes, palette, schémas Zod
```
Le serveur est l'unique source de vérité : chaque client reçoit une **projection** ne contenant que ce qu'il a le droit de savoir.

## Développement
```bash
npm install
npm test            # moteur (parties de bots) + intégration Socket.IO
npm run build && TABLE_PASSWORD=test npm start     # http://127.0.0.1:3210
# ou : npm run dev (serveur) + npm run dev:client (Vite, proxy vers le serveur)
```

## Déploiement sur le VPS
Depuis le dossier `loup-garou/` copié sur le serveur :
```bash
sudo DOMAIN=loup.mondomaine.fr EMAIL=moi@mail.fr TABLE_PASSWORD=monsecret bash deploy/install.sh
sudo TABLE_PASSWORD=monsecret bash deploy/install.sh     # sans domaine : http://IP:3210
```
Le script : détecte Node/nginx/Caddy, installe Node 22 et pm2 si besoin, build, démarre en **une seule instance** (obligatoire : la table vit en mémoire), configure le proxy WebSocket + HTTPS, et ne touche pas aux autres sites.
Mise à jour : `git pull && sudo bash deploy.sh`.

Commandes utiles : `pm2 logs loup-garou`, `pm2 restart loup-garou`, `curl localhost:3210/healthz`.
Mot de passe de la table : variable `TABLE_PASSWORD` dans `.env`.

## Limites connues
- Pas de sons ni musique pour l'instant (voir `CREDITS.md`).
- Les illustrations officielles des cartes sont protégées par le droit d'auteur et ne sont pas incluses. Pour utiliser les tiennes, dépose `werewolf.webp`, `seer.webp`, etc. dans `client/public/cards/` (voir `LISEZMOI.txt`).
- La synchronisation envoie l'état complet filtré à chaque changement (suffisant pour ≤ 18 joueurs).

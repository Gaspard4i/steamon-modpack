#!/usr/bin/env bash
# Installation / mise à jour sur le VPS (Debian/Ubuntu). À lancer depuis le dossier loup-garou/ du dépôt.
#
#   sudo DOMAIN=loup.mondomaine.fr EMAIL=moi@mail.fr TABLE_PASSWORD=monsecret bash deploy/install.sh
#   sudo TABLE_PASSWORD=monsecret bash deploy/install.sh            # sans domaine : accès par http://IP:3210
#
# Idempotent : relancer = mise à jour (build + reload). Ne touche à aucun autre site.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-/var/www/loup-garou}"
PORT="${PORT:-3210}"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
log() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" -eq 0 ] || { echo "Lance ce script avec sudo/root."; exit 1; }

log "Reconnaissance du serveur"
echo "OS      : $(. /etc/os-release && echo "$PRETTY_NAME")"
echo "Node    : $(node -v 2>/dev/null || echo absent)"
echo "nginx   : $(command -v nginx >/dev/null && echo oui || echo non)   caddy : $(command -v caddy >/dev/null && echo oui || echo non)"
echo "Port $PORT : $(ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN && echo 'DÉJÀ UTILISÉ' || echo libre)"
if ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN && ! pm2 describe loup-garou >/dev/null 2>&1; then
  echo "Le port $PORT est pris par autre chose. Relance avec PORT=xxxx."; exit 1
fi

log "Node.js >= 20"
need_node=1
if command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ]; then need_node=0; fi
if [ "$need_node" -eq 1 ]; then
  apt-get update -y && apt-get install -y curl ca-certificates gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

log "Copie des sources vers $APP_DIR"
mkdir -p "$APP_DIR"
if [ "$SRC" != "$APP_DIR" ]; then
  tar -C "$SRC" --exclude=node_modules --exclude=client/dist --exclude=data --exclude=.env -cf - . | tar -C "$APP_DIR" -xf -
fi
cd "$APP_DIR"
mkdir -p data

log "Configuration (.env)"
if [ ! -f .env ]; then
  PASS="${TABLE_PASSWORD:-}"
  if [ -z "$PASS" ]; then PASS="$(head -c 9 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 10)"; echo "Mot de passe généré : $PASS"; fi
  HOSTBIND="127.0.0.1"; [ -z "$DOMAIN" ] && HOSTBIND="0.0.0.0"
  cat > .env <<EOF
PORT=$PORT
HOST=$HOSTBIND
TABLE_PASSWORD=$PASS
DATA_DIR=$APP_DIR/data
LOG_LEVEL=info
NODE_ENV=production
EOF
  chmod 600 .env
else
  echo ".env existant conservé."
fi

log "Dépendances et build"
npm ci
npm run build
npm prune --omit=dev

log "Démarrage avec pm2"
if pm2 describe loup-garou >/dev/null 2>&1; then pm2 reload ecosystem.config.cjs --update-env; else pm2 start ecosystem.config.cjs; fi
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

if [ -n "$DOMAIN" ]; then
  if command -v nginx >/dev/null; then
    log "nginx : $DOMAIN"
    sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__PORT__/$PORT/g" deploy/nginx.conf.tpl > /etc/nginx/sites-available/loup-garou
    ln -sf /etc/nginx/sites-available/loup-garou /etc/nginx/sites-enabled/loup-garou
    nginx -t && systemctl reload nginx
    if [ -n "$EMAIL" ]; then
      command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx
      certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --no-eff-email --redirect --non-interactive || echo "certbot a échoué : vérifie que le DNS de $DOMAIN pointe vers ce serveur."
    else
      echo "Pas d'EMAIL fourni : site en HTTP. Relance avec EMAIL=... pour activer HTTPS."
    fi
  elif command -v caddy >/dev/null; then
    log "Caddy : ajoute ceci à /etc/caddy/Caddyfile puis 'systemctl reload caddy'"
    sed -e "s/loup.exemple.fr/$DOMAIN/" -e "s/3210/$PORT/" deploy/Caddyfile.snippet
  else
    log "Aucun reverse proxy détecté : installation de Caddy (HTTPS automatique)"
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
    apt-get update -y && apt-get install -y caddy
    printf '%s {\n    encode zstd gzip\n    reverse_proxy 127.0.0.1:%s\n}\n' "$DOMAIN" "$PORT" >> /etc/caddy/Caddyfile
    systemctl reload caddy
  fi
else
  if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow "$PORT"/tcp; fi
fi

log "Vérification"
sleep 2
curl -fsS "http://127.0.0.1:$PORT/healthz" && echo
echo
if [ -n "$DOMAIN" ]; then echo "En ligne : http(s)://$DOMAIN"; else echo "En ligne : http://$(curl -fsS ifconfig.me 2>/dev/null || echo IP_DU_SERVEUR):$PORT"; fi
echo "Mot de passe de la table : $(grep '^TABLE_PASSWORD=' .env | cut -d= -f2)"
echo "Logs : pm2 logs loup-garou   |   Redémarrer : pm2 restart loup-garou"

#!/usr/bin/env bash
# Mise à jour en une commande sur le VPS : sudo bash deploy.sh
exec bash "$(dirname "$0")/deploy/install.sh"

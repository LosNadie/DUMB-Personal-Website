#!/usr/bin/env bash
set -euo pipefail

echo "[1/6] Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git nginx curl ca-certificates

echo "[2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "[3/6] Installing PM2..."
sudo npm install -g pm2

echo "[4/6] Creating project directory..."
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www

echo "[5/6] Cloning repository (replace REPO_URL)..."
if [ ! -d "/var/www/dumb-personal-website" ]; then
  git clone REPO_URL /var/www/dumb-personal-website
fi

echo "[6/6] Bootstrap completed."
echo "Next: cd /var/www/dumb-personal-website && bash deploy/scripts/deploy.sh"

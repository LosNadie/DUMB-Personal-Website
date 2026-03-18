#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/var/www/dumb-personal-website"
BACKEND_ROOT="$PROJECT_ROOT/backend"

echo "[1/9] Pull latest code..."
cd "$PROJECT_ROOT"
git pull origin main

echo "[2/9] Install frontend dependencies..."
npm install

echo "[3/9] Install backend dependencies..."
cd "$BACKEND_ROOT"
npm install

echo "[4/9] Prepare backend env..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created backend/.env from template. Please edit secrets before continuing."
  exit 1
fi

echo "[5/9] Run database migrations..."
npm run prisma:migrate -- --name prod-init || true

echo "[6/9] Build backend..."
npm run build

echo "[7/9] Build frontend..."
cd "$PROJECT_ROOT"
npm run build

echo "[8/9] Restart PM2 app..."
cd "$BACKEND_ROOT"
if pm2 describe dumb-api >/dev/null 2>&1; then
  pm2 restart dumb-api
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "[9/9] Nginx config reminder:"
echo "  - Copy deploy/nginx/dumb.conf to /etc/nginx/sites-available/dumb.conf"
echo "  - Replace your-domain.com"
echo "  - Enable site and reload nginx"
echo "Deploy completed."

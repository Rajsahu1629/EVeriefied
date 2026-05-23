#!/usr/bin/env bash
# Deploy backend to AWS EC2 from your Mac.
# Usage:
#   export DEPLOY_HOST=ubuntu@15.207.85.85
#   export DEPLOY_KEY=~/.ssh/your-key.pem
#   export DEPLOY_PATH=~/EVeerified-Native
#   ./deploy.sh

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-ubuntu@15.207.85.85}"
DEPLOY_KEY="${DEPLOY_KEY:-}"
DEPLOY_PATH="${DEPLOY_PATH:-~/EVeerified-Native}"
SSH_OPTS=()
[[ -n "$DEPLOY_KEY" ]] && SSH_OPTS=(-i "$DEPLOY_KEY")

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"

echo "→ Syncing backend to $DEPLOY_HOST:$DEPLOY_PATH/backend"
rsync -avz --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .env \
  -e "ssh ${SSH_OPTS[*]}" \
  "$BACKEND/" "$DEPLOY_HOST:$DEPLOY_PATH/backend/"

echo "→ Installing, building, restarting on server"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" bash -s <<EOF
set -e
cd $DEPLOY_PATH/backend
npm install
npm run build
if command -v pm2 >/dev/null 2>&1; then
  pm2 describe everified-api >/dev/null 2>&1 && pm2 restart everified-api || pm2 start ecosystem.config.js
  pm2 save
else
  pkill -f "node dist/index.js" 2>/dev/null || true
  nohup node dist/index.js > api.log 2>&1 &
fi
echo "→ Health check"
curl -sf http://localhost:3001/api/health | head -c 200
echo ""
echo "→ Admin login check (expect success JSON)"
curl -s -X POST http://localhost:3001/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumber":"9473928468","password":"Rajsahu@2000"}' | head -c 200
echo ""
EOF

echo "Done. Set EXPO_PUBLIC_API_URL=http://15.207.85.85:3001/api and restart Expo."

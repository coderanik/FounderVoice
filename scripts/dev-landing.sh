#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${LANDING_PORT:-4600}"

cd "$ROOT/landing-page"
if [[ ! -d node_modules ]]; then
  npm install
fi

bash "$ROOT/scripts/open-when-ready.sh" "http://127.0.0.1:${PORT}" &
exec npm run dev -- --port "$PORT"

#!/usr/bin/env bash
# Smoke-test PitchOS API (demo mode, no OpenAI key required)
set -euo pipefail
API="${API:-http://127.0.0.1:8010/api}"
curl -sf "$API/health" >/dev/null
PID=$(curl -sf -X POST "$API/projects" -H 'Content-Type: application/json' \
  -d '{"name":"Smoke","founder_name":"Test","strict_mode":false}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
curl -sf -X POST "$API/projects/$PID/memos/text" -H 'Content-Type: application/json' \
  -d '{"transcript":"Building a tool for founders. Problem is messy pitches. Raising 100000. Team of two.","language":"en"}' >/dev/null
echo "OK project=$PID"

#!/usr/bin/env bash
# Open a URL in the browser once the server responds.
set -euo pipefail

url="${1:?url required}"

for _ in $(seq 1 80); do
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" != "000" && -n "$code" ]]; then
    open "$url"
    exit 0
  fi
  sleep 0.5
done

echo "Server did not respond at $url"
exit 1

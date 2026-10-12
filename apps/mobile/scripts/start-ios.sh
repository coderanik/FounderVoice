#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXPO_PORT="${EXPO_PORT:-19006}"
XCODE_APP="/Applications/Xcode.app/Contents/Developer"

if ! xcode-select -p >/dev/null 2>&1; then
  echo "Xcode Command Line Tools not configured."
  echo "Run: xcode-select --install"
  echo "Or point to Xcode: sudo xcode-select -s ${XCODE_APP}"
  exit 1
fi

if ! xcrun simctl help >/dev/null 2>&1; then
  if [[ -d /Applications/Xcode.app ]]; then
    ACTIVE="$(xcode-select -p)"
    echo "Xcode is installed, but the active developer path is wrong for the iOS Simulator."
    echo "  Active:  ${ACTIVE}"
    echo "  Needed:  ${XCODE_APP}"
    echo ""
    echo "Run this once (requires your password), then retry make ios:"
    echo "  sudo xcode-select -s ${XCODE_APP}"
    echo ""
    echo "If you haven't opened Xcode yet, open it once to finish setup and accept the license."
  else
    echo "iOS Simulator unavailable (xcrun simctl failed)."
    echo "Install Xcode from the App Store, then open it once to finish setup."
  fi
  exit 1
fi

BOOTED="$(xcrun simctl list devices booted 2>/dev/null | grep -E 'iPhone|iPad' | head -1 || true)"
if [[ -z "$BOOTED" ]]; then
  DEVICE_UDID="$(xcrun simctl list devices available 2>/dev/null | grep -E 'iPhone' | grep -v unavailable | head -1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')"
  if [[ -z "$DEVICE_UDID" ]]; then
    echo "No available iOS simulators found."
    echo "Open Xcode → Settings → Platforms and install an iOS simulator runtime."
    exit 1
  fi
  echo "Booting iOS Simulator..."
  xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
  open -a Simulator
fi

cd "$ROOT_DIR"
exec npx expo start --ios --port "$EXPO_PORT"

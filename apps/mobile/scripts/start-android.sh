#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXPO_PORT="${EXPO_PORT:-19006}"

cd "$ROOT_DIR"
# Expo Go QR only — do not launch an emulator or open a device.
exec npx expo start --port "$EXPO_PORT"

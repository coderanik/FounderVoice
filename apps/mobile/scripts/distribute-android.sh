#!/usr/bin/env bash
# Upload the release APK to Firebase App Distribution.
# Requires: npx firebase-tools login
# App id: Firebase console → Project settings → Your apps → Android → App ID
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="${1:-$ROOT/android/app/build/outputs/apk/release/app-release.apk}"
APP_ID_FILE="$ROOT/.firebase-android-app-id"
APP_ID="${FIREBASE_ANDROID_APP_ID:-}"
TESTERS="${FIREBASE_TESTERS:-anikdas210605@gmail.com}"
NOTES="${FIREBASE_RELEASE_NOTES:-PitchOS preview}"

if [[ -z "$APP_ID" && -f "$APP_ID_FILE" ]]; then
  APP_ID="$(tr -d '[:space:]' < "$APP_ID_FILE")"
fi

if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK"
  echo "Build it first: cd apps/mobile && npx expo run:android --variant release"
  exit 1
fi

if [[ -z "$APP_ID" ]]; then
  echo "Missing Firebase Android app id."
  echo "Put it in apps/mobile/.firebase-android-app-id or FIREBASE_ANDROID_APP_ID."
  echo "Console: Project settings → Your apps → Android app → App ID (1:…:android:…)."
  exit 1
fi

cd "$ROOT"
npx --yes firebase-tools appdistribution:distribute "$APK" \
  --app "$APP_ID" \
  --testers "$TESTERS" \
  --release-notes "$NOTES"

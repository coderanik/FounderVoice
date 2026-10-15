# PitchOS

Voice → Claim Graph → investor critic → PPTX + XLSX diligence pack.

## Stack

- **API:** Python FastAPI, SQLAlchemy (SQLite), python-pptx, openpyxl
- **Web:** Next.js 15 (TypeScript)
- **Mobile:** React Native + Expo (TypeScript)
- **STT:** Local [faster-whisper](https://github.com/SYSTRAN/faster-whisper) by default (no API key)
- **Extract/critic:** Heuristic offline mode by default (only uses what you said); optional OpenAI for richer results

## Quick start

From repo root (after `make install`):

```bash
make api      # API on :8010
make site     # Marketing site on :4500
make ios      # Expo app in iOS Simulator (Metro :19006)
make android  # Expo app in Android Emulator (Metro :19006)
make web      # Expo app in browser (Metro :19006)
```

### 1. API

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

First audio transcription downloads the Whisper model (`LOCAL_WHISPER_MODEL=base`, ~140MB).

API docs: http://127.0.0.1:8010/docs

### 2. Marketing site

```bash
make site
```

App: http://127.0.0.1:4500

### 3. Mobile (Expo)

```bash
cd apps/mobile
cp .env.example .env
npm install
make ios      # or: make android | make web
```

Metro dev server runs on **port 19006** (not 8081). Start the API first with `make api`.

- **iOS Simulator:** `EXPO_PUBLIC_API_BASE=http://127.0.0.1:8010/api` (default)
- **Android Emulator:** `EXPO_PUBLIC_API_BASE=http://10.0.2.2:8010/api`
- **Physical device:** the app uses the same machine address Metro already used. Port 8000 is left alone because other local services often bind it.

## MVP flow

1. Create a project
2. Record (live captions), upload audio/txt, or paste a transcript
3. Extract Claim Graph + critic questions + assumptions (only from your words)
4. Confirm/edit claims, answer critical questions
5. Export PPTX + XLSX (always downloads; watermarked until investor-ready)

## Honesty rules

- Agents write drafts; founders confirm claims
- Assumptions only appear when numbers were stated (no invented placeholders)
- Strict mode watermarks export when critical questions or unconfirmed claims remain — downloads still work

## Notes

- **Audio pipeline (upload):** denoise → detect Hindi/English → transcribe → translate non-English to English (local Whisper) → claim extract
- **Live record:** Chrome live captions for instant text; uploaded file path uses the full clean/detect/translate pipeline
- **Local STT:** Browser can send WAV; server uses faster-whisper — no ffmpeg / OpenAI key required
- **Optional cloud:** Set `OPENAI_API_KEY` and/or `STT_BACKEND=openai|auto` for cloud Whisper + richer LLM extraction

# FounderVoice

**Fundraising readiness infrastructure.**

Turn rambling founder thinking into an investor-ready truth.

FounderVoice listens to a pitch, builds a Claim Graph from what was actually said, stress-tests it like an investor, and renders a deck and a model that stay in sync. Agents draft. Founders confirm. Nothing gets invented.

[Live site](https://foundervoice-sigma.vercel.app)

---

## The problem

Fundraising breaks when the story outruns the source.

A founder can explain the company out loud and still ship a deck, a spreadsheet, and an email that disagree. Bankers are expensive. Generic AI is fluent and careless. The first hard question exposes the gap.

FounderVoice is the layer between the voice memo and the room.

## The product

One source of truth. Every output comes from it.

| | |
| --- | --- |
| **Capture** | Record a pitch, upload audio or text, or paste a transcript |
| **Structure** | A typed Claim Graph: problem, market, traction, ask, and the rest |
| **Stress-test** | An investor critic asks the question everyone is thinking |
| **Resolve** | The founder confirms claims and answers what is still open |
| **Render** | PPTX and XLSX, watermarked until the pitch is investor-ready |

Every claim carries provenance. Founder-stated numbers stay attached to the words that produced them. Assumptions appear only when the founder stated the numbers.

```
voice memo  →  transcript  →  claim graph  →  critic  →  deck + model
```

## Why it is different

FounderVoice is built to be the opposite of AI hype.

- Agents write drafts. Founders confirm claims.
- Unconfirmed claims and open critic questions watermark the export. The file still downloads.
- Local speech-to-text works with no API key. Cloud models are optional, for people who want a richer pass.
- Hindi and English audio is cleaned, transcribed, and brought into English before extraction.

> No invented metrics. Ever.

## Who it is for

**Pre-seed and seed founders** who need a narrative that survives the first hard question.

**Accelerators and university programs** who want every company in a cohort telling a consistent story.

**Teams already raising** who need the deck, the model, and the update to stop contradicting each other.

## What’s in this repo

| Path | Role |
| --- | --- |
| [`apps/api`](apps/api) | FastAPI. Transcription, claim extraction, critic, PPTX and XLSX |
| [`apps/web`](apps/web) | Next.js marketing site and signed-in workspace |
| [`apps/mobile`](apps/mobile) | Expo app for recording a pitch and reviewing claims |
| [`landing-page`](landing-page) | Public site and waitlist, deployed on Vercel |
| [`supabase`](supabase) | Auth schema for the mobile app |
| [`docs`](docs) | Architecture notes |

Speech-to-text defaults to [faster-whisper](https://github.com/SYSTRAN/faster-whisper) on the machine. Extraction and the critic run offline the same way. Set `OPENAI_API_KEY` when you want hosted Whisper or a richer model.

## Run FounderVoice locally

You need Python 3.11+, Node.js 20+, and [pnpm](https://pnpm.io) for the web app. Xcode or Android Studio only if you want a simulator.

```bash
make install
make api          # http://127.0.0.1:8010    docs at /docs
make site         # http://127.0.0.1:4500
make landingpage  # http://127.0.0.1:4600
make ios          # iOS Simulator, Metro on :19006
make android      # Android Emulator
make web          # Expo in the browser
make smoke        # API health check
```

Start the API before the web or mobile app. The first transcription downloads the Whisper `base` model, about 140MB.

### API

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

### Web

```bash
cd apps/web
pnpm install
pnpm dev --port 4500
```

### Mobile

```bash
cd apps/mobile
cp .env.example .env
npm install
```

Then from the repo root: `make ios`, `make android`, or `make web`. Metro uses port **19006**.

| Where it runs | `EXPO_PUBLIC_API_BASE` |
| --- | --- |
| iOS Simulator and Expo web | `http://127.0.0.1:8010/api` |
| Android Emulator | `http://10.0.2.2:8010/api` |
| A physical phone | The machine Metro already reached. A stale LAN address in `.env` is replaced automatically. |

Mobile auth is Supabase. Run [`supabase/migrations/001_profiles.sql`](supabase/migrations/001_profiles.sql), then copy the project URL and anon key into `apps/mobile/.env`. Redirect URLs and EAS variables are in [`supabase/README.md`](supabase/README.md) and [`apps/mobile/EAS.md`](apps/mobile/EAS.md).

### Environment

Copy `apps/api/.env.example` to `apps/api/.env`. The defaults are enough to run locally. Never commit a filled `.env`.

| Variable | Default | What it does |
| --- | --- | --- |
| `STT_BACKEND` | `local` | `local`, `openai`, or `auto` |
| `LOCAL_WHISPER_MODEL` | `base` | faster-whisper model size |
| `AUDIO_DENOISE` | `true` | Clean uploaded audio before transcription |
| `OPENAI_API_KEY` | empty | Hosted Whisper and richer extraction |
| `OPENAI_MODEL` | `gpt-4o-mini` | Used when a key is set |
| `DEMO_MODE` | `false` | Demo behavior for the API |
| `CORS_ORIGINS` | local web origins | Extra browser origins |

## A pitch, end to end

1. Create a project.
2. Record, upload, or paste.
3. Read the Claim Graph. See the gaps before an investor does.
4. Confirm claims and answer the critic.
5. Export the deck and the workbook.

Uploaded audio is denoised, language-detected, transcribed, and translated to English when it needs to be. Live recording shows captions immediately. The uploaded file still goes through the full pipeline.

## Status

FounderVoice is in active build. The waitlist is live at [foundervoice-sigma.vercel.app](https://foundervoice-sigma.vercel.app). The API, web workspace, and mobile capture app in this repository are the product behind it.

## License

MIT. Built for founders who would rather be honest than impressive.

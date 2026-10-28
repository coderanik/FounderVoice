from __future__ import annotations

import mimetypes
import os
import re
from dataclasses import dataclass
from pathlib import Path

import httpx
from openai import OpenAI

from app.config import Settings
from app.services.audio_clean import denoise_to_wav


def _running_on_render() -> bool:
    return bool(os.environ.get("RENDER") or os.environ.get("RENDER_SERVICE_ID"))


_ELEVEN_LANG = {
    "eng": "en",
    "en": "en",
    "hin": "hi",
    "hi": "hi",
    "spa": "es",
    "es": "es",
    "tam": "ta",
    "ta": "ta",
    "tel": "te",
    "te": "te",
}


@dataclass
class STTResult:
    """English working transcript + provenance for the ingest pipeline."""

    transcript: str  # English (or original if already EN)
    original_transcript: str
    detected_language: str
    used_api: bool
    source: str
    cleaned: bool
    translated: bool


def transcribe_audio(path: Path, language: str, settings: Settings) -> STTResult:
    """
    Strict audio path:
      1) denoise
      2) detect language (hi/en) + transcribe
      3) translate non-English speech to English (Whisper translate)
    Text uploads skip clean/translate.
    """
    suffix = path.suffix.lower()
    is_text = suffix in {".txt", ".md"}

    if is_text:
        text = path.read_text(encoding="utf-8", errors="ignore").strip()
        lang = language if language and language != "auto" else detect_language_hint(text)
        english, translated = _ensure_english_text(text, lang, settings)
        return STTResult(
            transcript=english,
            original_transcript=text,
            detected_language=lang or "en",
            used_api=False,
            source="text_file",
            cleaned=False,
            translated=translated,
        )

    work_path = path
    cleaned = False
    # Denoise + local Whisper OOM/kill free-tier hosts (Render 502 HTML). Skip on Render.
    on_render = _running_on_render()
    if settings.audio_denoise and not on_render:
        work_path, cleaned = denoise_to_wav(path, prop_decrease=settings.audio_denoise_strength)

    backend = (settings.stt_backend or "local").lower()
    try_eleven = backend in {"elevenlabs", "auto"} and bool(settings.elevenlabs_api_key)
    try_openai = backend in {"openai", "auto"} and bool(settings.openai_api_key)
    # Never load faster-whisper in the cloud free tier — it restarts the dyno mid-upload.
    try_local = backend in {"local", "auto"} and not on_render

    if try_eleven:
        eleven_result = _transcribe_elevenlabs(work_path, language, settings, cleaned=cleaned)
        if eleven_result is not None:
            return eleven_result

    if try_openai:
        openai_result = _transcribe_openai(work_path, language, settings, cleaned=cleaned)
        if openai_result is not None:
            return openai_result

    if try_local:
        try:
            from app.services.local_whisper import transcribe_local
        except ImportError:
            transcribe_local = None  # type: ignore[assignment]
        local = transcribe_local(work_path, language, settings) if transcribe_local else None
        if local is not None:
            return _from_local(local, cleaned)

    if on_render and not (settings.elevenlabs_api_key or settings.openai_api_key):
        print("[stt] Render has no cloud STT key; skipping local Whisper to avoid OOM/502")

    return STTResult(
        transcript="",
        original_transcript="",
        detected_language=language if language and language != "auto" else "en",
        used_api=False,
        source="unavailable",
        cleaned=cleaned,
        translated=False,
    )


def _from_local(local, cleaned: bool) -> STTResult:
    return STTResult(
        transcript=local.english_text or local.text,
        original_transcript=local.text,
        detected_language=local.language or "en",
        used_api=False,
        source="local_whisper",
        cleaned=cleaned,
        translated=local.translated,
    )


def _normalize_eleven_lang(code: str | None, fallback: str) -> str:
    if not code:
        return fallback
    raw = code.strip().lower()
    if raw in _ELEVEN_LANG:
        return _ELEVEN_LANG[raw]
    if len(raw) >= 2 and raw[:2] in _ELEVEN_LANG:
        return _ELEVEN_LANG[raw[:2]]
    return fallback


def _transcribe_elevenlabs(
    path: Path,
    language: str,
    settings: Settings,
    *,
    cleaned: bool,
) -> STTResult | None:
    """ElevenLabs Scribe — free-tier friendly cloud STT (OpenAI not required)."""
    try:
        forced = None if not language or language == "auto" else language
        # Scribe accepts ISO-639-1/3; map our short codes.
        lang_param = None
        if forced:
            lang_param = {"en": "eng", "hi": "hin", "es": "spa", "ta": "tam", "te": "tel"}.get(
                forced, forced
            )

        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        data = {
            "model_id": settings.elevenlabs_stt_model or "scribe_v2",
            "tag_audio_events": "false",
        }
        if lang_param:
            data["language_code"] = lang_param

        base = (settings.elevenlabs_base_url or "https://api.elevenlabs.io").rstrip("/")
        with path.open("rb") as f:
            files = {"file": (path.name, f, mime)}
            resp = httpx.post(
                f"{base}/v1/speech-to-text",
                headers={"xi-api-key": settings.elevenlabs_api_key},
                data=data,
                files=files,
                timeout=120.0,
            )
        if resp.status_code >= 400:
            print(f"[stt] ElevenLabs STT HTTP {resp.status_code}: {resp.text[:300]}")
            return None

        payload = resp.json()
        text = (payload.get("text") or "").strip()
        # Drop pure audio-event tags like "[phone beep]" when nothing else was said.
        if text.startswith("[") and text.endswith("]") and " " not in text.strip("[]"):
            text = ""
        detected = _normalize_eleven_lang(
            payload.get("language_code"),
            forced or detect_language_hint(text) or "en",
        )
        english, translated = text, False
        if text and detected != "en":
            english, translated = _ensure_english_text(text, detected, settings)

        return STTResult(
            transcript=english,
            original_transcript=text,
            detected_language=detected,
            used_api=True,
            source="elevenlabs",
            cleaned=cleaned,
            translated=translated,
        )
    except Exception as exc:
        print(f"[stt] ElevenLabs STT failed for {path.name}: {type(exc).__name__}: {exc}")
        return None


def _transcribe_openai(
    path: Path,
    language: str,
    settings: Settings,
    *,
    cleaned: bool,
) -> STTResult | None:
    try:
        client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
        forced = None if not language or language == "auto" else language
        with path.open("rb") as f:
            kwargs: dict = {"model": settings.whisper_model, "file": f}
            if forced:
                kwargs["language"] = forced
            result = client.audio.transcriptions.create(**kwargs)
        text = (result.text or "").strip()
        detected = forced or detect_language_hint(text) or "en"
        if not text:
            return STTResult(
                transcript="",
                original_transcript="",
                detected_language=detected,
                used_api=True,
                source="whisper",
                cleaned=cleaned,
                translated=False,
            )

        english, translated = text, False
        if detected != "en":
            # OpenAI translate endpoint
            with path.open("rb") as f2:
                tr = client.audio.translations.create(model=settings.whisper_model, file=f2)
            english = (tr.text or "").strip() or text
            translated = english.lower() != text.lower()

        return STTResult(
            transcript=english,
            original_transcript=text,
            detected_language=detected,
            used_api=True,
            source="whisper",
            cleaned=cleaned,
            translated=translated,
        )
    except Exception as exc:
        print(f"[stt] OpenAI Whisper failed for {path.name}: {type(exc).__name__}: {exc}")
        return None


def _ensure_english_text(text: str, lang: str, settings: Settings) -> tuple[str, bool]:
    """For pasted text: if Hindi script, leave as-is unless we later add MT; mark not translated."""
    if lang == "en" or not text:
        return text, False
    if detect_language_hint(text) == "en" and lang != "hi":
        return text, False
    # Text Hindi paste: keep original in UI; extraction still runs (heuristic is EN-biased).
    # Optional OpenAI text translate if key present.
    if settings.openai_api_key and detect_language_hint(text) == "hi":
        try:
            client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
            resp = client.chat.completions.create(
                model=settings.openai_model,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "Translate the user text to clear English. Return only the translation.",
                    },
                    {"role": "user", "content": text},
                ],
            )
            out = (resp.choices[0].message.content or "").strip()
            if out:
                return out, True
        except Exception as exc:
            print(f"[stt] text translate failed: {type(exc).__name__}: {exc}")
    return text, False


def detect_language_hint(text: str) -> str:
    """Very lightweight script-based hint for MVP."""
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"
    if re.search(r"[\u0B80-\u0BFF]", text):
        return "ta"
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "te"
    if re.search(r"[áéíóúñ¿¡]", text.lower()):
        return "es"
    return "en"

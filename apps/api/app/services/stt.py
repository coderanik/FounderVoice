from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from openai import OpenAI

from app.config import Settings
from app.services.audio_clean import denoise_to_wav
from app.services.local_whisper import LocalSTTResult, transcribe_local


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
    if settings.audio_denoise:
        work_path, cleaned = denoise_to_wav(path, prop_decrease=settings.audio_denoise_strength)

    backend = (settings.stt_backend or "local").lower()
    try_local = backend in {"local", "auto"}
    try_openai = backend in {"openai", "auto"} and bool(settings.openai_api_key)

    if try_local:
        local = transcribe_local(work_path, language, settings)
        if local is not None:
            return _from_local(local, cleaned)

    if try_openai:
        openai_result = _transcribe_openai(work_path, language, settings, cleaned=cleaned)
        if openai_result is not None:
            return openai_result

    return STTResult(
        transcript="",
        original_transcript="",
        detected_language=language if language and language != "auto" else "en",
        used_api=False,
        source="unavailable",
        cleaned=cleaned,
        translated=False,
    )


def _from_local(local: LocalSTTResult, cleaned: bool) -> STTResult:
    return STTResult(
        transcript=local.english_text or local.text,
        original_transcript=local.text,
        detected_language=local.language or "en",
        used_api=False,
        source="local_whisper",
        cleaned=cleaned,
        translated=local.translated,
    )


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

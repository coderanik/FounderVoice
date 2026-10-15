from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

from app.config import Settings


@dataclass
class LocalSTTResult:
    text: str
    language: str
    english_text: str
    translated: bool


@lru_cache(maxsize=4)
def _load_model(model_size: str, device: str, compute_type: str):
    from faster_whisper import WhisperModel

    return WhisperModel(model_size, device=device, compute_type=compute_type)


def _resolve_device(settings: Settings) -> tuple[str, str]:
    requested = (settings.local_whisper_device or "auto").lower()
    if requested in {"cpu", "cuda", "auto"}:
        device = "cpu" if requested == "auto" else requested
    else:
        device = "cpu"
    compute_type = "int8" if device == "cpu" else "float16"
    return device, compute_type


def _normalize_lang(code: str | None) -> str:
    if not code:
        return "en"
    c = code.lower().strip()
    if c.startswith("en"):
        return "en"
    if c.startswith("hi") or c in {"hin", "hindi"}:
        return "hi"
    return c[:8]


def _join_segments(segments) -> str:
    parts: list[str] = []
    for seg in segments:
        t = (seg.text or "").strip()
        if t:
            parts.append(t)
    return " ".join(parts).strip()


def transcribe_local(
    path: Path,
    language: str,
    settings: Settings,
) -> Optional[LocalSTTResult]:
    """
    Local STT with language detection + English translation for non-English speech.

    Steps inside Whisper:
    1) Transcribe (auto-detect or forced lang) → original text + language
    2) If Hindi (or other non-en), run Whisper task=translate → English text
    """
    try:
        device, compute_type = _resolve_device(settings)
        model = _load_model(settings.local_whisper_model, device, compute_type)
    except Exception as exc:
        print(f"[stt] local Whisper unavailable: {type(exc).__name__}: {exc}")
        return None

    forced = None if not language or language == "auto" else _normalize_lang(language)
    # Product focus: English + Hindi. If UI forced something else, still allow it.
    try:
        segments, info = model.transcribe(
            str(path),
            language=forced,
            task="transcribe",
            vad_filter=True,
            beam_size=5 if settings.stt_high_quality else 1,
            best_of=5 if settings.stt_high_quality else 1,
        )
        original = _join_segments(segments)
        detected = _normalize_lang(getattr(info, "language", None) or forced or "en")
    except Exception as exc:
        print(f"[stt] local Whisper failed for {path.name}: {type(exc).__name__}: {exc}")
        return None

    # Script hint can override a wrong Whisper language guess for Hindi
    if _looks_hindi(original):
        detected = "hi"

    english = original
    translated = False
    if detected != "en" and original:
        try:
            tr_segments, _ = model.transcribe(
                str(path),
                language=detected if detected in {"hi", "en"} else forced,
                task="translate",  # Whisper: speech → English
                vad_filter=True,
                beam_size=5 if settings.stt_high_quality else 1,
                best_of=5 if settings.stt_high_quality else 1,
            )
            english = _join_segments(tr_segments) or original
            translated = english.strip().lower() != original.strip().lower()
        except Exception as exc:
            print(f"[stt] Whisper translate failed: {type(exc).__name__}: {exc}")
            english = original
            translated = False

    return LocalSTTResult(
        text=original,
        language=detected,
        english_text=english or original,
        translated=translated,
    )


def _looks_hindi(text: str) -> bool:
    import re

    return bool(re.search(r"[\u0900-\u097F]", text or ""))

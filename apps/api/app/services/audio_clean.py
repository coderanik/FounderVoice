from __future__ import annotations

from pathlib import Path


def denoise_to_wav(path: Path, *, prop_decrease: float = 0.75) -> tuple[Path, bool]:
    """
    Load audio, reduce noise, write a cleaned mono WAV next to the original.
    Returns (path_to_use, cleaned_ok).
    On failure, returns the original path and False.
    """
    try:
        import numpy as np
        import noisereduce as nr
        import soundfile as sf
    except Exception as exc:
        print(f"[audio] denoise deps missing: {type(exc).__name__}: {exc}")
        return path, False

    try:
        audio, sample_rate = _load_mono(path)
        if audio.size < sample_rate * 0.15:
            # Too short to denoise meaningfully
            return path, False

        reduced = nr.reduce_noise(
            y=audio,
            sr=sample_rate,
            stationary=False,
            prop_decrease=float(prop_decrease),
        )
        original_rms = float(np.sqrt(np.mean(np.square(audio)))) or 1.0
        reduced_rms = float(np.sqrt(np.mean(np.square(reduced))))
        # Short phone clips get their speech treated as noise. Keep the original.
        if reduced_rms < original_rms * 0.55:
            print(
                f"[audio] denoise dropped the level on {path.name} "
                f"({reduced_rms:.4f} vs {original_rms:.4f}); using the original"
            )
            return path, False

        # Soft peak normalize so Whisper gets healthy levels
        peak = float(np.max(np.abs(reduced))) or 1.0
        if peak > 0:
            reduced = (reduced / peak) * 0.95

        out = path.with_name(f"{path.stem}_clean.wav")
        sf.write(str(out), reduced.astype(np.float32), sample_rate, subtype="PCM_16")
        return out, True
    except Exception as exc:
        print(f"[audio] denoise failed for {path.name}: {type(exc).__name__}: {exc}")
        return path, False


def _load_mono(path: Path):
    import numpy as np
    import soundfile as sf

    try:
        data, rate = sf.read(str(path), always_2d=False)
    except Exception:
        data, rate = _load_via_av(path)

    arr = np.asarray(data, dtype=np.float32)
    if arr.ndim > 1:
        arr = arr.mean(axis=1)
    return arr, int(rate)


def _load_via_av(path: Path):
    """Decode non-WAV containers (webm/m4a) via PyAV when soundfile can't."""
    import av
    import numpy as np

    container = av.open(str(path))
    stream = container.streams.audio[0]
    resampler = av.audio.resampler.AudioResampler(format="flt", layout="mono", rate=16000)
    chunks: list = []
    for frame in container.decode(audio=0):
        for rf in resampler.resample(frame):
            chunks.append(rf.to_ndarray().reshape(-1))
    for rf in resampler.resample(None):
        chunks.append(rf.to_ndarray().reshape(-1))
    if not chunks:
        raise RuntimeError("no audio frames")
    return np.concatenate(chunks).astype(np.float32), 16000

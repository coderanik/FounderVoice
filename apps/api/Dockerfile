FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PYTHONUNBUFFERED=1 \
    STT_BACKEND=openai \
    AUDIO_DENOISE=false \
    LOCAL_WHISPER_MODEL=base \
    LOCAL_WHISPER_DEVICE=cpu \
    PORT=8010

RUN mkdir -p /app/data/uploads /app/data/exports

EXPOSE 8010

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8010}"]

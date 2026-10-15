"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api,
  Assumption,
  Claim,
  ExportResult,
  ProjectDetail,
  Question,
} from "@/lib/api";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

function pickRecorderMime(): { mimeType: string; ext: string } {
  const candidates = [
    { mimeType: "audio/webm;codecs=opus", ext: "webm" },
    { mimeType: "audio/webm", ext: "webm" },
    { mimeType: "audio/mp4", ext: "m4a" },
    { mimeType: "audio/ogg;codecs=opus", ext: "ogg" },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mimeType)) {
      return c;
    }
  }
  return { mimeType: "", ext: "webm" };
}

/** Encode AudioBuffer as 16-bit mono WAV so the API needs no ffmpeg. */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const channelData =
    buffer.numberOfChannels > 1
      ? mixToMono(buffer)
      : buffer.getChannelData(0);

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const length = buffer.length;
  const out = new Float32Array(length);
  const channels = buffer.numberOfChannels;
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) out[i] += data[i] / channels;
  }
  return out;
}

async function blobToWavFile(blob: Blob, basename: string): Promise<File> {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const wav = audioBufferToWav(audioBuffer);
    return new File([wav], `${basename}.wav`, { type: "audio/wav" });
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function speechLang(code: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    es: "es-ES",
    ta: "ta-IN",
    auto: typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US",
  };
  return map[code] || "en-US";
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("auto");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [recording, setRecording] = useState(false);
  const [liveInterim, setLiveInterim] = useState("");
  const [liveFinal, setLiveFinal] = useState("");
  const [liveSupported, setLiveSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRef = useRef<BrowserSpeechRecognition | null>(null);
  const recordingRef = useRef(false);
  const liveFinalRef = useRef("");
  const liveInterimRef = useRef("");

  const load = useCallback(async () => {
    const p = await api.getProject(id);
    setProject(p);
    if (p.memos[0]?.transcript) setTranscript(p.memos[0].transcript);
    if (p.language) setLanguage(p.language);
    const latest = p.memos[0];
    if (latest?.status === "stt_unavailable") {
      setNotice("Latest audio could not be transcribed. Paste a transcript or check local Whisper.");
    } else if (latest && !latest.transcript?.trim() && latest.filename?.includes("recording")) {
      setNotice("No speech detected in the last recording. Try again or paste a transcript.");
    } else if (latest?.original_transcript && latest.original_transcript !== latest.transcript) {
      setNotice(
        `Detected ${latest.language || "speech"} → English. Original kept below the transcript.`
      );
    } else if (latest?.status?.includes("clean")) {
      setNotice("Audio was noise-reduced before transcription.");
    } else if (latest?.status === "demo_fallback") {
      setNotice("Old demo fallback memo detected — re-record or paste a real transcript.");
    } else {
      setNotice("");
    }
  }, [id]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    return () => {
      recordingRef.current = false;
      try {
        speechRef.current?.abort();
      } catch {
        /* ignore */
      }
      speechRef.current = null;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const step = useMemo(() => {
    if (!project) return 0;
    if (!project.memos.length && !project.claims.length) return 1;
    if (project.claims.some((c) => c.status !== "confirmed" && c.status !== "rejected")) return 2;
    if (project.questions.some((q) => q.severity === "critical" && !q.resolved)) return 3;
    if (project.artifacts.length) return 5;
    return 4;
  }, [project]);

  async function runTextPipeline(textOverride?: string) {
    const raw = typeof textOverride === "string" ? textOverride : transcript;
    const text = (raw ?? "").toString().trim();
    if (!text) {
      setError("Nothing to extract — speak, paste, or upload a transcript first.");
      return;
    }
    setBusy("extract");
    setError("");
    setNotice("");
    setExportResult(null);
    try {
      if (typeof textOverride === "string") setTranscript(textOverride);
      await api.pasteTranscript(id, text, language);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setBusy("");
    }
  }

  async function onUpload(file: File) {
    setBusy("upload");
    setError("");
    setNotice("");
    try {
      const result = await api.uploadMemo(id, file, language);
      await load();
      if (result.warning) setNotice(result.warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }

  function stopLiveSpeech() {
    recordingRef.current = false;
    const rec = speechRef.current;
    speechRef.current = null;
    if (!rec) return;
    try {
      rec.onend = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.stop();
    } catch {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    }
  }

  function startLiveSpeech(): boolean {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setLiveSupported(false);
      return false;
    }
    setLiveSupported(true);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang(language);
    recognition.onresult = (ev) => {
      let interim = "";
      let newlyFinal = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript || "";
        if (ev.results[i].isFinal) newlyFinal += piece;
        else interim += piece;
      }
      if (newlyFinal) {
        const next = `${liveFinalRef.current}${liveFinalRef.current ? " " : ""}${newlyFinal.trim()}`.trim();
        liveFinalRef.current = next;
        setLiveFinal(next);
        setTranscript(interim ? `${next} ${interim}`.trim() : next);
      } else {
        const base = liveFinalRef.current;
        setTranscript(interim ? `${base}${base ? " " : ""}${interim}`.trim() : base);
      }
      liveInterimRef.current = interim.trim();
      setLiveInterim(interim.trim());
    };
    recognition.onerror = (ev) => {
      const code = ev.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone / speech permission denied. Allow mic access in Chrome and try again.");
        setLiveSupported(false);
        recordingRef.current = false;
        setRecording(false);
        return;
      }
      if (code === "audio-capture") {
        setError("No microphone found, or another app is using it.");
        return;
      }
      if (code === "network") {
        setNotice("Speech service network error — check internet (Chrome live captions need connectivity).");
        return;
      }
      // no-speech / aborted / etc. — ignore, onend will restart
    };
    recognition.onend = () => {
      if (recordingRef.current && speechRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };
    speechRef.current = recognition;
    try {
      recognition.start();
      return true;
    } catch (e) {
      setLiveSupported(false);
      setNotice(
        e instanceof Error
          ? `Live captions failed to start (${e.message}).`
          : "Live captions failed to start."
      );
      speechRef.current = null;
      return false;
    }
  }

  async function startMediaFallback() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    const { mimeType, ext } = pickRecorderMime();
    const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (ev) => {
      if (ev.data.size) chunksRef.current.push(ev.data);
    };
    rec.onerror = () => {
      setError("Recording failed. Try uploading an audio file instead.");
      recordingRef.current = false;
      setRecording(false);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const type = rec.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      if (!blob.size) {
        setError("Recording was empty — mic may be muted or blocked.");
        return;
      }
      try {
        const file = await blobToWavFile(blob, `recording-${Date.now()}`);
        await onUpload(file);
      } catch (e) {
        const file = new File([blob], `recording-${Date.now()}.${ext}`, { type });
        setNotice(
          e instanceof Error
            ? `WAV convert failed (${e.message}); uploaded raw audio instead.`
            : "WAV convert failed; uploaded raw audio instead."
        );
        await onUpload(file);
      }
    };
    rec.start(250);
    mediaRecorderRef.current = rec;
  }

  async function startRecording() {
    setError("");
    setNotice("");
    setLiveFinal("");
    setLiveInterim("");
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    setTranscript("");
    mediaRecorderRef.current = null;

    // Prefer SpeechRecognition alone — MediaRecorder + SpeechRecognition fight over the mic in Chrome
    // and captions stay stuck on "Start speaking…"
    recordingRef.current = true;
    setRecording(true);
    const speechOk = startLiveSpeech();
    if (speechOk) {
      setNotice("Listening — speak clearly. Words should appear above within a second.");
      return;
    }

    // Fallback: record audio file → local Whisper (no live captions)
    try {
      setNotice("Live captions unavailable here — recording audio for local Whisper on Stop.");
      await startMediaFallback();
    } catch (e) {
      recordingRef.current = false;
      setRecording(false);
      setError(
        e instanceof Error
          ? e.message
          : "Mic permission denied. Paste a transcript or upload a file instead."
      );
    }
  }

  async function stopRecording() {
    const interim = liveInterimRef.current.trim();
    liveInterimRef.current = "";
    setLiveInterim("");
    if (interim) {
      const next = `${liveFinalRef.current}${liveFinalRef.current ? " " : ""}${interim}`.trim();
      liveFinalRef.current = next;
      setLiveFinal(next);
      setTranscript(next);
    }

    const hadSpeechSession = !!speechRef.current || liveFinalRef.current.trim().length > 0;
    stopLiveSpeech();
    setRecording(false);

    const media = mediaRecorderRef.current;
    if (media && media.state !== "inactive") {
      media.stop();
      mediaRecorderRef.current = null;
      return; // onstop handles upload
    }
    mediaRecorderRef.current = null;

    const spoken = liveFinalRef.current.trim();
    if (spoken) {
      await runTextPipeline(spoken);
      return;
    }

    if (hadSpeechSession) {
      setError("No speech was captured. Check Chrome mic permission, speak louder, then try Record again.");
    } else {
      setError("Nothing recorded. Allow microphone access and try again.");
    }
  }

  async function saveClaim(claim: Claim, patch: Partial<Claim>) {
    await api.updateClaim(id, claim.id, patch);
    await load();
  }

  async function confirmAllHigh() {
    if (!project) return;
    const ids = project.claims
      .filter((c) => c.confidence >= 0.55 && c.status !== "rejected")
      .map((c) => c.id);
    setBusy("confirm");
    try {
      await api.bulkConfirm(id, ids, "confirmed");
      await load();
    } finally {
      setBusy("");
    }
  }

  async function answerQ(q: Question, answer: string) {
    await api.answerQuestion(id, q.id, answer);
    await load();
  }

  async function saveAssumption(a: Assumption, patch: Partial<Assumption>) {
    await api.updateAssumption(id, a.id, patch);
    await load();
  }

  async function doExport() {
    setBusy("export");
    setError("");
    try {
      const result = await api.exportPack(id);
      setExportResult(result);
      await load();
      if (!result.allowed && result.blocking_issues.length) {
        setNotice(
          "Deck generated as a draft (watermarked). Resolve the blocking items below for an investor-ready export."
        );
      } else if (result.watermarked) {
        setNotice("Deck generated with a watermark because some warnings remain.");
      } else {
        setNotice("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy("");
    }
  }

  if (!project) {
    return (
      <main className="shell">
        <p className="muted">{error || "Loading…"}</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="flex items-center gap-3.5">
          <Link href="/app" aria-label="FounderVoice Home" className="shrink-0 hover:opacity-90 transition-opacity">
            <FounderVoiceLogo variant="mark" size={32} />
          </Link>
          <div>
            <Link href="/app" className="muted text-xs">
              ← Projects
            </Link>
            <div className="brand" style={{ marginTop: "0.15rem" }}>
              {project.name}
            </div>
            <div className="sub">
              {project.founder_name || "Founder"} · {project.status} ·{" "}
              {project.strict_mode ? "Strict" : "Exploratory"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted">Readiness</div>
          <div className="score">{project.readiness_score.toFixed(0)}</div>
        </div>
      </header>

      <div className="steps">
        {[
          [1, "Capture"],
          [2, "Confirm claims"],
          [3, "Critic Q&A"],
          [4, "Assumptions"],
          [5, "Export"],
        ].map(([n, label]) => (
          <span key={n as number} className={step >= (n as number) ? "on" : ""}>
            {n}. {label}
          </span>
        ))}
      </div>

      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="muted" style={{ borderLeft: "3px solid #b45309", paddingLeft: "0.75rem" }}>{notice}</p> : null}

      <div className="grid two">
        <section className="card stack">
          <h2>1. Capture</h2>
          <p className="muted">
            Upload or record: audio is noise-cleaned, language is detected (Hindi/English), then
            transcribed and translated to English for the claim graph. Live captions still show as you speak.
          </p>
          <label className="field">
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={recording}
            >
              <option value="auto">Auto-detect (HI / EN)</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
          {recording ? (
            <div
              className="live-captions"
              aria-live="polite"
              style={{
                border: "1px solid #111",
                background: "linear-gradient(180deg, #fff8e8 0%, #f6f3ea 100%)",
                padding: "0.85rem 1rem",
                minHeight: "5.5rem",
              }}
            >
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <strong style={{ letterSpacing: "0.02em" }}>Live captions</strong>
                <span className="muted mono" style={{ color: "#b45309" }}>
                  ● listening
                </span>
              </div>
              {liveFinal || liveInterim ? (
                <p style={{ margin: 0, lineHeight: 1.45, fontSize: "1.05rem" }}>
                  {liveFinal}
                  {liveFinal && liveInterim ? " " : ""}
                  {liveInterim ? (
                    <span className="muted" style={{ fontStyle: "italic" }}>
                      {liveInterim}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  {liveSupported
                    ? "Speak now — captions should appear here…"
                    : "Live captions unavailable; audio will upload on Stop for local Whisper."}
                </p>
              )}
            </div>
          ) : null}
          <label className="field">
            Transcript (English working copy)
            <textarea
              value={
                recording
                  ? `${liveFinal}${liveFinal && liveInterim ? " " : ""}${liveInterim}`
                  : transcript
              }
              onChange={(e) => setTranscript(e.target.value)}
              readOnly={recording}
              placeholder={recording ? "Listening…" : "Record, upload, or paste your pitch…"}
            />
          </label>
          {!recording &&
          project.memos[0]?.original_transcript &&
          project.memos[0].original_transcript.trim() &&
          project.memos[0].original_transcript.trim() !== transcript.trim() ? (
            <label className="field">
              Original transcript ({project.memos[0].language || "source"})
              <textarea value={project.memos[0].original_transcript} readOnly />
            </label>
          ) : null}
          <div className="row">
            <button type="button" onClick={() => runTextPipeline()} disabled={!!busy}>
              {busy === "extract" ? "Extracting…" : "Extract claim graph"}
            </button>
            {!recording ? (
              <button type="button" className="secondary" onClick={startRecording} disabled={!!busy}>
                Record voice
              </button>
            ) : (
              <button
                type="button"
                className="secondary"
                onClick={stopRecording}
                disabled={busy === "upload" || busy === "extract"}
              >
                {busy === "upload" || busy === "extract" ? "Processing…" : "Stop & process"}
              </button>
            )}
            <label className="secondary" style={{ border: "1px solid #111", padding: "0.55rem 0.9rem" }}>
              Upload file
              <input
                type="file"
                accept="audio/*,.txt,.md"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>
          </div>
          {project.summary ? (
            <p className="muted">
              <strong>Summary:</strong> {project.summary}
            </p>
          ) : null}
        </section>

        <section className="card stack">
          <h2>Auditor</h2>
          {project.audit_issues.length === 0 ? (
            <p className="muted">No issues yet — run extract first.</p>
          ) : (
            <ul className="list">
              {project.audit_issues.map((i) => (
                <li key={i.id} style={{ border: "1px solid #d4d4d0", padding: "0.65rem" }}>
                  <span className={`badge ${i.severity === "block" ? "block" : "warn"}`}>
                    {i.severity}
                  </span>{" "}
                  <span className="mono">{i.code}</span>
                  <div style={{ marginTop: "0.35rem" }}>{i.message}</div>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="secondary" onClick={() => api.refreshAudit(id).then(load)}>
            Refresh audit
          </button>
        </section>
      </div>

      <section className="card stack" style={{ marginTop: "1rem" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>2. Claim graph</h2>
          <button type="button" className="secondary" onClick={confirmAllHigh} disabled={!!busy || !project.claims.length}>
            Confirm high-confidence
          </button>
        </div>
        {!project.claims.length ? (
          <p className="muted">No claims yet.</p>
        ) : (
          <div className="stack">
            {project.claims.map((c) => (
              <ClaimCard key={c.id} claim={c} onSave={saveClaim} />
            ))}
          </div>
        )}
      </section>

      <section className="card stack" style={{ marginTop: "1rem" }}>
        <h2>3. Investor critic</h2>
        <p className="muted">
          These questions are for you to answer — they stay empty until you type a reply and submit.
        </p>
        {!project.questions.length ? (
          <p className="muted">Questions appear after extraction.</p>
        ) : (
          <div className="stack">
            {project.questions.map((q) => (
              <QuestionCard key={q.id} q={q} onAnswer={answerQ} />
            ))}
          </div>
        )}
      </section>

      <section className="card stack" style={{ marginTop: "1rem" }}>
        <h2>4. Financial assumptions (provenance)</h2>
        {!project.assumptions.length ? (
          <p className="muted">Assumptions appear after extraction.</p>
        ) : (
          <div className="stack">
            {project.assumptions.map((a) => (
              <AssumptionCard key={a.id} a={a} onSave={saveAssumption} />
            ))}
          </div>
        )}
      </section>

      <section className="card stack" style={{ marginTop: "1rem" }}>
        <h2>5. Export diligence pack</h2>
        <p className="muted">
          Always generates PPTX + XLSX. Strict mode watermarks the pack when claims are unconfirmed or
          critical questions remain — it no longer blocks the download.
        </p>
        <div className="row">
          <button type="button" onClick={doExport} disabled={!!busy}>
            {busy === "export" ? "Exporting…" : "Generate PPTX + XLSX"}
          </button>
          {exportResult?.pptx_artifact_id ? (
            <a href={api.downloadUrl(exportResult.pptx_artifact_id)} className="badge">
              Download PPTX{exportResult.watermarked ? " (draft)" : ""}
            </a>
          ) : null}
          {exportResult?.xlsx_artifact_id ? (
            <a href={api.downloadUrl(exportResult.xlsx_artifact_id)} className="badge">
              Download XLSX{exportResult.watermarked ? " (draft)" : ""}
            </a>
          ) : null}
          {project.artifacts
            .filter(
              (a) =>
                a.id !== exportResult?.pptx_artifact_id && a.id !== exportResult?.xlsx_artifact_id
            )
            .map((a) => (
              <a key={a.id} href={api.downloadUrl(a.id)} className="badge">
                Download {a.kind}
                {a.watermarked ? " (draft)" : ""}
              </a>
            ))}
        </div>
        {exportResult ? (
          <div className="stack">
            <p>
              Investor-ready: <strong>{exportResult.allowed ? "yes" : "no"}</strong> · Watermarked:{" "}
              <strong>{exportResult.watermarked ? "yes" : "no"}</strong>
            </p>
            {exportResult.blocking_issues.length ? (
              <div>
                <strong>Still needed for a clean pack</strong>
                <ul>
                  {exportResult.blocking_issues.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {exportResult.outline?.length ? (
              <div>
                <strong>Slide outline</strong>
                <ul>
                  {exportResult.outline.map((s) => (
                    <li key={s.title}>
                      <strong>{s.title}</strong>
                      {s.bullets?.length ? ` — ${s.bullets.length} bullets` : " — empty"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ClaimCard({
  claim,
  onSave,
}: {
  claim: Claim;
  onSave: (c: Claim, patch: Partial<Claim>) => Promise<void>;
}) {
  const [body, setBody] = useState(claim.body);
  const [status, setStatus] = useState(claim.status);
  useEffect(() => {
    setBody(claim.body);
    setStatus(claim.status);
  }, [claim]);
  return (
    <div className="claim">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>
          {claim.title} <span className="muted mono">({claim.claim_type})</span>
        </strong>
        <span className="badge">
          {claim.status} · {Math.round(claim.confidence * 100)}% · {claim.provenance}
        </span>
      </div>
      {claim.source_quote ? <div className="muted mono">“{claim.source_quote}”</div> : null}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="row">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">draft</option>
          <option value="stated">stated</option>
          <option value="challenged">challenged</option>
          <option value="confirmed">confirmed</option>
          <option value="rejected">rejected</option>
        </select>
        <button
          type="button"
          className="secondary"
          onClick={() => onSave(claim, { body, status })}
        >
          Save
        </button>
        <button type="button" onClick={() => onSave(claim, { body, status: "confirmed" })}>
          Confirm
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  onAnswer,
}: {
  q: Question;
  onAnswer: (q: Question, answer: string) => Promise<void>;
}) {
  const [answer, setAnswer] = useState(q.answer || "");
  useEffect(() => setAnswer(q.answer || ""), [q]);
  return (
    <div className="claim">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{q.question}</strong>
        <span className={`badge ${q.severity === "critical" ? "block" : "warn"}`}>
          {q.severity}
          {q.resolved ? " · resolved" : ""}
        </span>
      </div>
      {q.rationale ? <div className="muted">{q.rationale}</div> : null}
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer…" />
      <button type="button" onClick={() => onAnswer(q, answer)} disabled={!answer.trim()}>
        Submit answer
      </button>
    </div>
  );
}

function AssumptionCard({
  a,
  onSave,
}: {
  a: Assumption;
  onSave: (a: Assumption, patch: Partial<Assumption>) => Promise<void>;
}) {
  const [value, setValue] = useState(String(a.value));
  const [provenance, setProvenance] = useState(a.provenance);
  useEffect(() => {
    setValue(String(a.value));
    setProvenance(a.provenance);
  }, [a]);
  return (
    <div className="claim">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>
          {a.label} <span className="muted mono">({a.key})</span>
        </strong>
        <span className="badge">{a.provenance}</span>
      </div>
      {a.notes ? <div className="muted">{a.notes}</div> : null}
      <div className="row">
        <input value={value} onChange={(e) => setValue(e.target.value)} style={{ maxWidth: 160 }} />
        <span className="muted">{a.unit}</span>
        <select value={provenance} onChange={(e) => setProvenance(e.target.value)}>
          <option value="founder_stated">founder_stated</option>
          <option value="inferred">inferred</option>
          <option value="benchmark">benchmark</option>
          <option value="verified_metric">verified_metric</option>
        </select>
        <button
          type="button"
          className="secondary"
          onClick={() =>
            onSave(a, { value: Number(value) || 0, provenance })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

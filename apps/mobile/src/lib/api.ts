import { API_BASE } from "./apiBase";
import { nativeFetch } from "./nativeFetch";

/** Turn gateway HTML / JSON error bodies into a short user-facing message. */
export function formatApiError(status: number, body: string, fallback: string): string {
  const text = (body || "").trim();
  if (!text) return fallback || `Request failed (${status})`;

  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { detail?: unknown; message?: unknown; error?: unknown };
      const detail = parsed.detail ?? parsed.message ?? parsed.error;
      if (typeof detail === "string" && detail.trim()) return detail.trim();
      if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    } catch {
      /* fall through */
    }
  }

  const looksHtml = /<!DOCTYPE|<html[\s>]|<title>/i.test(text);
  if (looksHtml || status === 502 || status === 503 || status === 504) {
    if (status === 502) {
      return "The API is restarting or overloaded. Wait a few seconds and try again.";
    }
    if (status === 504) {
      return "The server took too long. Try a shorter recording, or paste a transcript.";
    }
    return "The API is temporarily unavailable. Wait a moment and try again.";
  }

  if (text.length > 220) return `${text.slice(0, 200).trim()}…`;
  return text;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await nativeFetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiError(res.status, text, res.statusText || "Request failed"));
  }
  return res.json() as Promise<T>;
}

export type Project = {
  id: string;
  name: string;
  founder_name: string;
  language: string;
  output_language: string;
  strict_mode: boolean;
  status: string;
  readiness_score: number;
  summary: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Claim = {
  id: string;
  claim_type: string;
  title: string;
  body: string;
  status: string;
  confidence: number;
  provenance: string;
  source_quote?: string | null;
};

export type Question = {
  id: string;
  claim_type?: string | null;
  severity: string;
  question: string;
  rationale: string;
  answer: string;
  resolved: boolean;
};

export type Assumption = {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string;
  provenance: string;
  notes: string;
};

export type AuditIssue = {
  id: string;
  code: string;
  severity: string;
  message: string;
  claim_ids_csv: string;
  resolved: boolean;
};

export type Artifact = {
  id: string;
  kind: string;
  filename: string;
  watermarked: boolean;
};

export type Memo = {
  id: string;
  filename: string;
  language: string;
  transcript: string;
  original_transcript?: string;
  status: string;
  duration_seconds: number;
};

export type ProjectDetail = Project & {
  claims: Claim[];
  memos: Memo[];
  questions: Question[];
  assumptions: Assumption[];
  audit_issues: AuditIssue[];
  artifacts: Artifact[];
};

export type ExportResult = {
  project_id: string;
  allowed: boolean;
  watermarked: boolean;
  blocking_issues: string[];
  warning_issues: string[];
  pptx_artifact_id?: string | null;
  xlsx_artifact_id?: string | null;
  outline: { title: string; bullets: { text: string }[] }[];
  readiness_score: number;
};

export const apiBase = API_BASE;

export const api = {
  listProjects: () => request<Project[]>("/projects"),
  createProject: (body: {
    name: string;
    founder_name?: string;
    language?: string;
    strict_mode?: boolean;
  }) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getProject: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  uploadMemo: async (
    id: string,
    file: { uri: string; name: string; type: string } | File,
    language = "en"
  ) => {
    const fd = new FormData();
    fd.append("file", file as Blob);
    fd.append("language", language);
    const res = await nativeFetch(`${API_BASE}/projects/${id}/memos`, { method: "POST", body: fd });
    if (!res.ok) {
      throw new Error(formatApiError(res.status, await res.text(), "Could not upload recording"));
    }
    return res.json() as Promise<{
      project_id: string;
      memo_id: string;
      warning: string;
      summary: string;
    }>;
  },
  pasteTranscript: (id: string, transcript: string, language = "en") =>
    request<{
      project_id: string;
      memo_id: string;
      warning: string;
      summary: string;
    }>(`/projects/${id}/memos/text`, {
      method: "POST",
      body: JSON.stringify({ transcript, language }),
    }),
  updateClaim: (projectId: string, claimId: string, body: Partial<Claim>) =>
    request<Claim>(`/projects/${projectId}/claims/${claimId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  answerQuestion: (projectId: string, questionId: string, answer: string) =>
    request<Question>(`/projects/${projectId}/questions/${questionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),
  updateAssumption: (projectId: string, assumptionId: string, body: Partial<Assumption>) =>
    request<Assumption>(`/projects/${projectId}/assumptions/${assumptionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  exportPack: (projectId: string) =>
    request<ExportResult>(`/projects/${projectId}/export`, { method: "POST" }),
  downloadUrl: (artifactId: string) => `${API_BASE}/artifacts/${artifactId}/download`,
  memoAudioUrl: (projectId: string, memoId: string) =>
    `${API_BASE}/projects/${projectId}/memos/${memoId}/audio`,
};

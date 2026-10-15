const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8010/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
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
  updateProject: (id: string, body: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  pasteTranscript: (id: string, transcript: string, language = "en") =>
    request(`/projects/${id}/memos/text`, {
      method: "POST",
      body: JSON.stringify({ transcript, language }),
    }),
  uploadMemo: async (id: string, file: File, language = "en") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("language", language);
    const res = await fetch(`${API_BASE}/projects/${id}/memos`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{
      project_id: string;
      memo_id: string;
      used_llm: boolean;
      used_stt: boolean;
      stt_source: string;
      cleaned?: boolean;
      translated?: boolean;
      original_transcript?: string;
      language?: string;
      warning: string;
      summary: string;
    }>;
  },
  updateClaim: (projectId: string, claimId: string, body: Partial<Claim>) =>
    request<Claim>(`/projects/${projectId}/claims/${claimId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  bulkConfirm: (projectId: string, claimIds: string[], status = "confirmed") =>
    request(`/projects/${projectId}/claims/bulk-status`, {
      method: "POST",
      body: JSON.stringify({ claim_ids: claimIds, status }),
    }),
  answerQuestion: (projectId: string, questionId: string, answer: string) =>
    request(`/projects/${projectId}/questions/${questionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),
  updateAssumption: (projectId: string, assumptionId: string, body: Partial<Assumption>) =>
    request(`/projects/${projectId}/assumptions/${assumptionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  refreshAudit: (projectId: string) =>
    request(`/projects/${projectId}/audit/refresh`, { method: "POST" }),
  exportPack: (projectId: string) =>
    request<ExportResult>(`/projects/${projectId}/export`, { method: "POST" }),
  downloadUrl: (artifactId: string) => `${API_BASE}/artifacts/${artifactId}/download`,
};

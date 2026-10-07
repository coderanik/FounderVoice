import { API_BASE } from "./apiBase";
import { nativeFetch } from "./nativeFetch";

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
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{
      project_id: string;
      memo_id: string;
      warning: string;
      summary: string;
    }>;
  },
};

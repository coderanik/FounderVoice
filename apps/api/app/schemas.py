from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    founder_name: str = ""
    language: str = "en"
    output_language: str = "en"
    strict_mode: bool = True


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    founder_name: Optional[str] = None
    language: Optional[str] = None
    output_language: Optional[str] = None
    strict_mode: Optional[bool] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    founder_name: str
    language: str
    output_language: str
    strict_mode: bool
    status: str
    readiness_score: float
    summary: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ClaimOut(BaseModel):
    id: str
    claim_type: str
    title: str
    body: str
    status: str
    confidence: float
    provenance: str
    numeric_value: Optional[float] = None
    numeric_unit: Optional[str] = None
    source_quote: Optional[str] = None

    model_config = {"from_attributes": True}


class ClaimUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    status: Optional[str] = None
    provenance: Optional[str] = None
    numeric_value: Optional[float] = None
    numeric_unit: Optional[str] = None


class ClaimBulkConfirm(BaseModel):
    claim_ids: List[str]
    status: str = "confirmed"


class MemoOut(BaseModel):
    id: str
    filename: str
    language: str
    transcript: str
    original_transcript: str = ""
    status: str
    duration_seconds: float

    model_config = {"from_attributes": True}


class TranscriptUpdate(BaseModel):
    transcript: str
    language: Optional[str] = None


class QuestionOut(BaseModel):
    id: str
    claim_type: Optional[str]
    severity: str
    question: str
    rationale: str
    answer: str
    resolved: bool

    model_config = {"from_attributes": True}


class QuestionAnswer(BaseModel):
    answer: str


class AssumptionOut(BaseModel):
    id: str
    key: str
    label: str
    value: float
    unit: str
    provenance: str
    notes: str

    model_config = {"from_attributes": True}


class AssumptionUpdate(BaseModel):
    value: Optional[float] = None
    provenance: Optional[str] = None
    notes: Optional[str] = None
    label: Optional[str] = None


class AuditIssueOut(BaseModel):
    id: str
    code: str
    severity: str
    message: str
    claim_ids_csv: str
    resolved: bool

    model_config = {"from_attributes": True}


class ArtifactOut(BaseModel):
    id: str
    kind: str
    filename: str
    watermarked: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProjectDetail(ProjectOut):
    claims: List[ClaimOut] = []
    memos: List[MemoOut] = []
    questions: List[QuestionOut] = []
    assumptions: List[AssumptionOut] = []
    audit_issues: List[AuditIssueOut] = []
    artifacts: List[ArtifactOut] = []


class PipelineResult(BaseModel):
    project_id: str
    memo_id: str
    claims_created: int
    questions_created: int
    assumptions_created: int
    language: str
    summary: str
    used_llm: bool
    used_stt: bool = False
    stt_source: str = "unknown"
    cleaned: bool = False
    translated: bool = False
    original_transcript: str = ""
    mode: str
    warning: str = ""


class ExportResult(BaseModel):
    project_id: str
    allowed: bool
    watermarked: bool
    blocking_issues: List[str]
    warning_issues: List[str]
    pptx_artifact_id: Optional[str] = None
    xlsx_artifact_id: Optional[str] = None
    outline: List[Dict[str, Any]] = []
    readiness_score: float

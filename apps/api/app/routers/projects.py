from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Assumption, ClaimNode, CriticQuestionRow, Project, VoiceMemo, Artifact
from app.schemas import (
    AssumptionOut,
    AssumptionUpdate,
    ClaimBulkConfirm,
    ClaimOut,
    ClaimUpdate,
    ExportResult,
    MemoOut,
    PipelineResult,
    ProjectCreate,
    ProjectDetail,
    ProjectOut,
    ProjectUpdate,
    QuestionAnswer,
    QuestionOut,
    TranscriptUpdate,
)
from app.services import pipeline as pipe
from app.ontology.claims import empty_graph_template

router = APIRouter(tags=["projects"])


def _get_project(db: Session, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


_STT_WARNINGS = {
    "unavailable": (
        "Audio was saved, but transcription is unavailable on the hosted API. "
        "Set OPENAI_API_KEY on the API service, or paste a transcript and re-extract."
    ),
}


def _pipeline_result(
    project: Project,
    result: pipe.IngestResult,
    *,
    mode: str,
) -> PipelineResult:
    memo = result.memo
    bits: list[str] = []
    if result.cleaned:
        bits.append("noise-reduced")
    if result.translated:
        bits.append(f"translated {memo.language}→en")
    elif memo.language and memo.language != "en":
        bits.append(f"detected {memo.language}")
    if result.stt_source == "unavailable":
        bits.append(_STT_WARNINGS["unavailable"])
    warning = " · ".join(bits)
    return PipelineResult(
        project_id=project.id,
        memo_id=memo.id,
        claims_created=len(project.claims),
        questions_created=len(project.questions),
        assumptions_created=len(project.assumptions),
        language=memo.language,
        summary=project.summary,
        used_llm=result.used_llm,
        used_stt=result.used_stt,
        stt_source=result.stt_source,
        cleaned=result.cleaned,
        translated=result.translated,
        original_transcript=memo.original_transcript or "",
        mode=mode,
        warning=warning,
    )


@router.get("/health")
def health():
    return {"ok": True, "service": "pitchos-api"}


@router.get("/ontology/claims")
def ontology_claims():
    return {"slots": empty_graph_template()}


@router.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=payload.name,
        founder_name=payload.founder_name,
        language=payload.language,
        output_language=payload.output_language,
        strict_mode=payload.strict_mode,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str, db: Session = Depends(get_db)):
    return _get_project(db, project_id)


@router.patch("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


@router.post("/projects/{project_id}/memos", response_model=PipelineResult)
async def upload_memo(
    project_id: str,
    file: UploadFile = File(...),
    language: str = Form("en"),
    db: Session = Depends(get_db),
):
    project = _get_project(db, project_id)
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")
    path = pipe.save_upload(data, file.filename or "memo.bin")
    try:
        result = pipe.run_ingest_and_extract(
            db,
            project,
            stored_path=path,
            filename=file.filename or "memo.bin",
            content_type=file.content_type or "",
            language=language,
        )
    except Exception as exc:
        # Never let an uncaught STT/OOM crash become Render's HTML 502 page.
        print(f"[upload] ingest failed for {path.name}: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=503,
            detail=(
                "Could not process that recording on the server. "
                "Try again in a moment, or paste a transcript instead."
            ),
        ) from exc
    db.refresh(project)
    return _pipeline_result(project, result, mode="auto")


@router.post("/projects/{project_id}/memos/text", response_model=PipelineResult)
def upload_transcript_text(
    project_id: str,
    payload: TranscriptUpdate,
    db: Session = Depends(get_db),
):
    """Paste a transcript directly (no audio) — great for demos and native-language edits."""
    project = _get_project(db, project_id)
    path = pipe.save_upload(payload.transcript.encode("utf-8"), "pasted_transcript.txt")
    result = pipe.run_ingest_and_extract(
        db,
        project,
        stored_path=path,
        filename="pasted_transcript.txt",
        content_type="text/plain",
        language=payload.language or project.language,
    )
    db.refresh(project)
    return _pipeline_result(project, result, mode="text")


@router.patch("/projects/{project_id}/memos/{memo_id}", response_model=MemoOut)
def update_transcript(
    project_id: str,
    memo_id: str,
    payload: TranscriptUpdate,
    db: Session = Depends(get_db),
):
    project = _get_project(db, project_id)
    memo = db.get(VoiceMemo, memo_id)
    if not memo or memo.project_id != project.id:
        raise HTTPException(404, "Memo not found")
    memo.transcript = payload.transcript
    if payload.language:
        memo.language = payload.language
    db.commit()
    db.refresh(memo)
    return memo


@router.get("/projects/{project_id}/memos/{memo_id}/audio")
def download_memo_audio(project_id: str, memo_id: str, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    memo = db.get(VoiceMemo, memo_id)
    if not memo or memo.project_id != project.id or not memo.stored_path:
        raise HTTPException(404, "Memo audio not found")
    return FileResponse(
        memo.stored_path,
        filename=memo.filename or "memo.m4a",
        media_type=memo.content_type or "audio/mp4",
    )


@router.post("/projects/{project_id}/memos/{memo_id}/reextract", response_model=PipelineResult)
def reextract(project_id: str, memo_id: str, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    memo = db.get(VoiceMemo, memo_id)
    if not memo or memo.project_id != project.id:
        raise HTTPException(404, "Memo not found")
    result = pipe.reextract_from_transcript(db, project, memo)
    db.refresh(project)
    return _pipeline_result(project, result, mode="reextract")


@router.patch("/projects/{project_id}/claims/{claim_id}", response_model=ClaimOut)
def update_claim(
    project_id: str,
    claim_id: str,
    payload: ClaimUpdate,
    db: Session = Depends(get_db),
):
    project = _get_project(db, project_id)
    claim = db.get(ClaimNode, claim_id)
    if not claim or claim.project_id != project.id:
        raise HTTPException(404, "Claim not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(claim, k, v)
    pipe._refresh_audit(db, project)
    db.commit()
    db.refresh(claim)
    return claim


@router.post("/projects/{project_id}/claims/bulk-status", response_model=list[ClaimOut])
def bulk_claim_status(project_id: str, payload: ClaimBulkConfirm, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    out = []
    for cid in payload.claim_ids:
        claim = db.get(ClaimNode, cid)
        if claim and claim.project_id == project.id:
            claim.status = payload.status
            out.append(claim)
    pipe._refresh_audit(db, project)
    db.commit()
    return out


@router.post("/projects/{project_id}/questions/{question_id}/answer", response_model=QuestionOut)
def answer_question(
    project_id: str,
    question_id: str,
    payload: QuestionAnswer,
    db: Session = Depends(get_db),
):
    project = _get_project(db, project_id)
    q = db.get(CriticQuestionRow, question_id)
    if not q or q.project_id != project.id:
        raise HTTPException(404, "Question not found")
    q.answer = payload.answer
    q.resolved = bool(payload.answer.strip())
    # Promote related claim toward confirmed if answered
    if q.claim_type and q.resolved:
        for c in project.claims:
            if c.claim_type == q.claim_type and c.status == "challenged":
                # Append answer into body as founder clarification
                c.body = (c.body or "").rstrip() + f"\n\nFounder clarification: {payload.answer.strip()}"
                c.status = "stated"
                c.confidence = max(c.confidence, 0.7)
    pipe._refresh_audit(db, project)
    db.commit()
    db.refresh(q)
    return q


@router.patch("/projects/{project_id}/assumptions/{assumption_id}", response_model=AssumptionOut)
def update_assumption(
    project_id: str,
    assumption_id: str,
    payload: AssumptionUpdate,
    db: Session = Depends(get_db),
):
    project = _get_project(db, project_id)
    row = db.get(Assumption, assumption_id)
    if not row or row.project_id != project.id:
        raise HTTPException(404, "Assumption not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    pipe._refresh_audit(db, project)
    db.commit()
    db.refresh(row)
    return row


@router.post("/projects/{project_id}/audit/refresh")
def refresh_audit(project_id: str, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    pipe._refresh_audit(db, project)
    db.commit()
    db.refresh(project)
    return {
        "readiness_score": project.readiness_score,
        "issues": [
            {"code": i.code, "severity": i.severity, "message": i.message}
            for i in project.audit_issues
        ],
    }


@router.post("/projects/{project_id}/export", response_model=ExportResult)
def export_project(project_id: str, db: Session = Depends(get_db)):
    project = _get_project(db, project_id)
    return ExportResult(**pipe.export_pack(db, project))


@router.get("/artifacts/{artifact_id}/download")
def download_artifact(artifact_id: str, db: Session = Depends(get_db)):
    art = db.get(Artifact, artifact_id)
    if not art:
        raise HTTPException(404, "Artifact not found")
    return FileResponse(
        art.stored_path,
        filename=art.filename,
        media_type=(
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            if art.kind == "pptx"
            else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
    )

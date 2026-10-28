from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import EXPORT_DIR, UPLOAD_DIR, get_settings
from app.models import (
    Artifact,
    Assumption,
    AuditIssueRow,
    ClaimNode,
    CriticQuestionRow,
    Project,
    VoiceMemo,
)
from app.services.auditor import audit_project, readiness_score
from app.services.critic import generate_critic_questions
from app.services.extract import extract_claims
from app.services.render_pptx import build_outline, render_pptx
from app.services.render_xlsx import render_xlsx
from app.services.stt import detect_language_hint, transcribe_audio


@dataclass
class IngestResult:
    memo: VoiceMemo
    used_llm: bool
    used_stt: bool
    stt_source: str
    cleaned: bool = False
    translated: bool = False


def save_upload(file_bytes: bytes, filename: str) -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = UPLOAD_DIR / f"{uuid.uuid4()}_{filename}"
    dest.write_bytes(file_bytes)
    return dest


def run_ingest_and_extract(
    db: Session,
    project: Project,
    *,
    stored_path: Path,
    filename: str,
    content_type: str,
    language: str | None = None,
) -> IngestResult:
    settings = get_settings()
    lang = language or project.language or "auto"
    stt = transcribe_audio(stored_path, lang, settings)
    detected = stt.detected_language or "en"
    # Prefer Whisper/audio detection; script hint only if still auto-like
    if lang == "auto" and stt.transcript:
        hinted = detect_language_hint(stt.original_transcript or stt.transcript)
        if hinted == "hi":
            detected = "hi"

    # Working language for extraction is always English after translate step
    extract_lang = "en"
    status = {
        "whisper": "transcribed",
        "elevenlabs": "transcribed",
        "local_whisper": "transcribed",
        "text_file": "transcribed",
        "demo_fallback": "demo_fallback",
        "unavailable": "stt_unavailable",
    }.get(stt.source, "transcribed")
    if stt.translated and status == "transcribed":
        status = "translated"
    if stt.cleaned and status in {"transcribed", "translated"}:
        status = f"{status}_clean"

    memo = VoiceMemo(
        project_id=project.id,
        filename=filename,
        stored_path=str(stored_path),
        content_type=content_type or "",
        language=detected,
        transcript=stt.transcript,
        original_transcript=stt.original_transcript or stt.transcript,
        status=status,
    )
    db.add(memo)
    db.flush()

    extraction, used_llm = extract_claims(stt.transcript, extract_lang, settings)
    project.language = detected
    project.output_language = "en"
    project.summary = extraction.summary
    project.status = "extracted"

    # Replace prior draft claims/assumptions/questions from automated runs (keep confirmed?)
    # MVP: clear non-confirmed claims and all auto questions/assumptions on re-extract
    for c in list(project.claims):
        if c.status != "confirmed":
            db.delete(c)
    for a in list(project.assumptions):
        db.delete(a)
    for q in list(project.questions):
        if not q.resolved:
            db.delete(q)

    db.flush()

    for c in extraction.claims:
        db.add(
            ClaimNode(
                project_id=project.id,
                claim_type=c.claim_type.value,
                title=c.title,
                body=c.body,
                status="draft",
                confidence=c.confidence,
                provenance=c.provenance.value,
                numeric_value=c.numeric_value,
                numeric_unit=c.numeric_unit,
                source_quote=c.source_quote,
                source_memo_id=memo.id,
            )
        )

    for a in extraction.assumptions:
        db.add(
            Assumption(
                project_id=project.id,
                key=a.key,
                label=a.label,
                value=a.value,
                unit=a.unit,
                provenance=a.provenance.value,
                notes=a.notes,
            )
        )

    db.flush()
    db.refresh(project)

    claim_dicts = [
        {
            "id": c.id,
            "claim_type": c.claim_type,
            "title": c.title,
            "body": c.body,
            "status": c.status,
            "confidence": c.confidence,
            "provenance": c.provenance,
        }
        for c in project.claims
    ]
    assumption_dicts = [
        {
            "key": a.key,
            "label": a.label,
            "value": a.value,
            "unit": a.unit,
            "provenance": a.provenance,
            "notes": a.notes,
        }
        for a in project.assumptions
    ]

    questions, _ = generate_critic_questions(claim_dicts, assumption_dicts, settings)
    for q in questions:
        db.add(
            CriticQuestionRow(
                project_id=project.id,
                claim_type=q.claim_type.value if q.claim_type else None,
                severity=q.severity,
                question=q.question,
                rationale=q.rationale,
            )
        )
        if q.claim_type:
            for c in project.claims:
                if c.claim_type == q.claim_type.value and c.status == "draft":
                    c.status = "challenged"

    project.status = "awaiting_confirmation"
    _refresh_audit(db, project)
    db.commit()
    db.refresh(memo)
    return IngestResult(
        memo=memo,
        used_llm=used_llm,
        used_stt=bool(stt.transcript)
        and stt.source in {"local_whisper", "whisper", "elevenlabs"},
        stt_source=stt.source,
        cleaned=stt.cleaned,
        translated=stt.translated,
    )


def reextract_from_transcript(db: Session, project: Project, memo: VoiceMemo) -> IngestResult:
    """Re-run extract+critic from edited transcript text (no new audio)."""
    lang = memo.language or project.language or "en"
    # Write temp txt and reuse pipeline pieces
    tmp = UPLOAD_DIR / f"{memo.id}_edited.txt"
    tmp.write_text(memo.transcript, encoding="utf-8")
    return run_ingest_and_extract(
        db,
        project,
        stored_path=tmp,
        filename=f"{memo.filename or 'memo'}.txt",
        content_type="text/plain",
        language=lang,
    )


def _refresh_audit(db: Session, project: Project) -> list[AuditIssueRow]:
    for old in list(project.audit_issues):
        db.delete(old)
    db.flush()

    claims = [
        {
            "id": c.id,
            "claim_type": c.claim_type,
            "body": c.body,
            "status": c.status,
            "confidence": c.confidence,
            "provenance": c.provenance,
        }
        for c in project.claims
    ]
    assumptions = [
        {
            "id": a.id,
            "key": a.key,
            "value": a.value,
            "provenance": a.provenance,
        }
        for a in project.assumptions
    ]
    questions = [
        {
            "id": q.id,
            "severity": q.severity,
            "resolved": q.resolved,
        }
        for q in project.questions
    ]
    issues = audit_project(
        claims=claims,
        assumptions=assumptions,
        questions=questions,
        strict_mode=project.strict_mode,
    )
    rows: list[AuditIssueRow] = []
    for issue in issues:
        row = AuditIssueRow(
            project_id=project.id,
            code=issue.code,
            severity=issue.severity,
            message=issue.message,
            claim_ids_csv=",".join(issue.claim_ids),
        )
        db.add(row)
        rows.append(row)
    project.readiness_score = readiness_score(claims, questions, assumptions)
    return rows


def export_pack(db: Session, project: Project) -> dict:
    """Always render PPTX + XLSX. `allowed` means investor-ready (no blockers in strict mode)."""
    _refresh_audit(db, project)
    db.flush()

    blocking = [i for i in project.audit_issues if i.severity == "block"]
    warnings = [i for i in project.audit_issues if i.severity == "warn"]
    investor_ready = not (project.strict_mode and blocking)
    watermarked = bool(blocking or warnings) or (
        not project.strict_mode
        and any(a.provenance == "placeholder" for a in project.assumptions)
    )

    claims = [
        {
            "id": c.id,
            "claim_type": c.claim_type,
            "title": c.title,
            "body": c.body,
            "status": c.status,
            "provenance": c.provenance,
        }
        for c in project.claims
    ]
    outline = build_outline(project.name, claims)

    result = {
        "project_id": project.id,
        "allowed": investor_ready,
        "watermarked": watermarked or not investor_ready,
        "blocking_issues": [i.message for i in blocking],
        "warning_issues": [i.message for i in warnings],
        "pptx_artifact_id": None,
        "xlsx_artifact_id": None,
        "outline": outline,
        "readiness_score": project.readiness_score,
    }

    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = uuid.uuid4().hex[:8]
    safe_name = re.sub(r"[^\w\-]+", "_", project.name).strip("_") or "pitch"
    pptx_name = f"{safe_name}_{stamp}.pptx"
    xlsx_name = f"{safe_name}_{stamp}.xlsx"
    pptx_path = EXPORT_DIR / pptx_name
    xlsx_path = EXPORT_DIR / xlsx_name

    render_pptx(
        path=pptx_path,
        project_name=project.name,
        founder_name=project.founder_name,
        claims=claims,
        watermarked=result["watermarked"],
        readiness_score=project.readiness_score,
    )
    render_xlsx(
        path=xlsx_path,
        project_name=project.name,
        assumptions=[
            {
                "key": a.key,
                "label": a.label,
                "value": a.value,
                "unit": a.unit,
                "provenance": a.provenance,
                "notes": a.notes,
            }
            for a in project.assumptions
        ],
        watermarked=result["watermarked"],
    )

    pptx_art = Artifact(
        project_id=project.id,
        kind="pptx",
        filename=pptx_name,
        stored_path=str(pptx_path),
        watermarked=result["watermarked"],
    )
    xlsx_art = Artifact(
        project_id=project.id,
        kind="xlsx",
        filename=xlsx_name,
        stored_path=str(xlsx_path),
        watermarked=result["watermarked"],
    )
    db.add(pptx_art)
    db.add(xlsx_art)
    project.status = "exported" if investor_ready else "exported_draft"
    db.commit()
    db.refresh(pptx_art)
    db.refresh(xlsx_art)
    result["pptx_artifact_id"] = pptx_art.id
    result["xlsx_artifact_id"] = xlsx_art.id
    return result

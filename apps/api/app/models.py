from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    founder_name: Mapped[str] = mapped_column(String(200), default="")
    language: Mapped[str] = mapped_column(String(16), default="en")
    output_language: Mapped[str] = mapped_column(String(16), default="en")
    strict_mode: Mapped[bool] = mapped_column(default=True)
    status: Mapped[str] = mapped_column(String(40), default="draft")
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    memos: Mapped[List["VoiceMemo"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="VoiceMemo.created_at.desc()",
    )
    claims: Mapped[List["ClaimNode"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    questions: Mapped[List["CriticQuestionRow"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    assumptions: Mapped[List["Assumption"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    artifacts: Mapped[List["Artifact"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    audit_issues: Mapped[List["AuditIssueRow"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class VoiceMemo(Base):
    __tablename__ = "voice_memos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(255), default="")
    stored_path: Mapped[str] = mapped_column(String(500), default="")
    content_type: Mapped[str] = mapped_column(String(100), default="")
    language: Mapped[str] = mapped_column(String(16), default="en")
    transcript: Mapped[str] = mapped_column(Text, default="")  # English working copy
    original_transcript: Mapped[str] = mapped_column(Text, default="")  # source language text
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(40), default="uploaded")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped[Project] = relationship(back_populates="memos")


class ClaimNode(Base):
    __tablename__ = "claim_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    claim_type: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="draft")
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    provenance: Mapped[str] = mapped_column(String(40), default="founder_stated")
    numeric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    numeric_unit: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    source_quote: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_memo_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    project: Mapped[Project] = relationship(back_populates="claims")


class CriticQuestionRow(Base):
    __tablename__ = "critic_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    claim_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    question: Mapped[str] = mapped_column(Text)
    rationale: Mapped[str] = mapped_column(Text, default="")
    answer: Mapped[str] = mapped_column(Text, default="")
    resolved: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped[Project] = relationship(back_populates="questions")


class Assumption(Base):
    __tablename__ = "assumptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(80))
    label: Mapped[str] = mapped_column(String(200))
    value: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str] = mapped_column(String(40), default="")
    provenance: Mapped[str] = mapped_column(String(40), default="placeholder")
    notes: Mapped[str] = mapped_column(Text, default="")

    project: Mapped[Project] = relationship(back_populates="assumptions")


class Artifact(Base):
    __tablename__ = "artifacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(40))  # pptx | xlsx | outline
    filename: Mapped[str] = mapped_column(String(255))
    stored_path: Mapped[str] = mapped_column(String(500))
    watermarked: Mapped[bool] = mapped_column(default=False)
    meta_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped[Project] = relationship(back_populates="artifacts")


class AuditIssueRow(Base):
    __tablename__ = "audit_issues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    code: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(20))
    message: Mapped[str] = mapped_column(Text)
    claim_ids_csv: Mapped[str] = mapped_column(String(500), default="")
    resolved: Mapped[bool] = mapped_column(default=False)

    project: Mapped[Project] = relationship(back_populates="audit_issues")

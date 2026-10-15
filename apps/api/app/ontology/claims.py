"""Claim Graph v1 ontology — typed slots for fundraising readiness."""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ClaimType(str, Enum):
    PROBLEM = "problem"
    INSIGHT = "insight"
    ICP = "icp"
    MARKET = "market"
    SOLUTION = "solution"
    DIFFERENTIATION = "differentiation"
    TRACTION = "traction"
    GTM = "gtm"
    PRICING = "pricing"
    UNIT_ECONOMICS = "unit_economics"
    TEAM = "team"
    ASK = "ask"
    USE_OF_FUNDS = "use_of_funds"
    MILESTONES = "milestones"
    RISK = "risk"
    WHY_NOW = "why_now"
    COMPETITION = "competition"


class ClaimStatus(str, Enum):
    STATED = "stated"
    INFERRED = "inferred"
    CHALLENGED = "challenged"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    DRAFT = "draft"


class ProvenanceKind(str, Enum):
    FOUNDER_STATED = "founder_stated"
    BENCHMARK = "benchmark"
    PLACEHOLDER = "placeholder"
    VERIFIED_METRIC = "verified_metric"
    INFERRED = "inferred"


CLAIM_TYPE_LABELS = {
    ClaimType.PROBLEM: "Problem",
    ClaimType.INSIGHT: "Insight",
    ClaimType.ICP: "Ideal Customer Profile",
    ClaimType.MARKET: "Market",
    ClaimType.SOLUTION: "Solution",
    ClaimType.DIFFERENTIATION: "Differentiation / Moat",
    ClaimType.TRACTION: "Traction",
    ClaimType.GTM: "Go-to-Market",
    ClaimType.PRICING: "Pricing",
    ClaimType.UNIT_ECONOMICS: "Unit Economics",
    ClaimType.TEAM: "Team",
    ClaimType.ASK: "The Ask",
    ClaimType.USE_OF_FUNDS: "Use of Funds",
    ClaimType.MILESTONES: "Milestones",
    ClaimType.RISK: "Risks / Unknowns",
    ClaimType.WHY_NOW: "Why Now",
    ClaimType.COMPETITION: "Competition",
}

DECK_CLAIM_ORDER = [
    ClaimType.PROBLEM,
    ClaimType.WHY_NOW,
    ClaimType.INSIGHT,
    ClaimType.SOLUTION,
    ClaimType.ICP,
    ClaimType.MARKET,
    ClaimType.TRACTION,
    ClaimType.GTM,
    ClaimType.PRICING,
    ClaimType.UNIT_ECONOMICS,
    ClaimType.COMPETITION,
    ClaimType.DIFFERENTIATION,
    ClaimType.TEAM,
    ClaimType.ASK,
    ClaimType.USE_OF_FUNDS,
    ClaimType.MILESTONES,
    ClaimType.RISK,
]


class ExtractedClaim(BaseModel):
    claim_type: ClaimType
    title: str
    body: str
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)
    provenance: ProvenanceKind = ProvenanceKind.FOUNDER_STATED
    numeric_value: Optional[float] = None
    numeric_unit: Optional[str] = None
    source_quote: Optional[str] = None


class CriticQuestion(BaseModel):
    claim_type: Optional[ClaimType] = None
    severity: str = "medium"
    question: str
    rationale: str = ""


class AssumptionRow(BaseModel):
    key: str
    label: str
    value: float
    unit: str = ""
    provenance: ProvenanceKind = ProvenanceKind.PLACEHOLDER
    notes: str = ""


class AuditIssue(BaseModel):
    code: str
    severity: str
    message: str
    claim_ids: List[str] = Field(default_factory=list)


class ExtractionResult(BaseModel):
    language: str = "en"
    claims: List[ExtractedClaim] = Field(default_factory=list)
    assumptions: List[AssumptionRow] = Field(default_factory=list)
    summary: str = ""


def empty_graph_template() -> List[Dict[str, Any]]:
    return [
        {
            "claim_type": t.value,
            "label": CLAIM_TYPE_LABELS[t],
            "required_for_deck": t in DECK_CLAIM_ORDER[:8],
        }
        for t in ClaimType
    ]

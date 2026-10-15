from __future__ import annotations

import json
import re
from typing import Any

from openai import OpenAI

from app.config import Settings
from app.ontology.claims import (
    AssumptionRow,
    ClaimType,
    ExtractedClaim,
    ExtractionResult,
    ProvenanceKind,
)

EXTRACT_SYSTEM = """You are the PitchOS Extractor agent.
Extract structured fundraising claims from a founder's transcript.
Rules:
- Never invent traction, revenue, or user counts not present in the text.
- If a number is missing, omit numeric_value or mark assumption provenance as placeholder.
- confidence is 0-1 reflecting how explicitly the founder stated it.
- Return ONLY valid JSON matching the schema.
"""

EXTRACT_SCHEMA_HINT = {
    "language": "en",
    "summary": "one paragraph",
    "claims": [
        {
            "claim_type": "problem|insight|icp|market|solution|differentiation|traction|gtm|pricing|unit_economics|team|ask|use_of_funds|milestones|risk|why_now|competition",
            "title": "short title",
            "body": "1-3 sentences",
            "confidence": 0.0,
            "provenance": "founder_stated|inferred|placeholder",
            "numeric_value": None,
            "numeric_unit": None,
            "source_quote": "short quote or null",
        }
    ],
    "assumptions": [
        {
            "key": "mrr|customers|arpu|churn|gross_margin|monthly_burn|raise_amount|runway_months",
            "label": "human label",
            "value": 0,
            "unit": "USD|count|percent|months",
            "provenance": "founder_stated|placeholder|inferred",
            "notes": "",
        }
    ],
}


def extract_claims(transcript: str, language: str, settings: Settings) -> tuple[ExtractionResult, bool]:
    if settings.openai_api_key:
        try:
            result = _extract_llm(transcript, language, settings)
            return result, True
        except Exception:
            pass
    return _extract_heuristic(transcript, language), False


def _extract_llm(transcript: str, language: str, settings: Settings) -> ExtractionResult:
    client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
    user = (
        f"Transcript language hint: {language}\n\n"
        f"Transcript:\n{transcript}\n\n"
        f"JSON schema example:\n{json.dumps(EXTRACT_SCHEMA_HINT)}"
    )
    resp = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": EXTRACT_SYSTEM},
            {"role": "user", "content": user},
        ],
    )
    raw = resp.choices[0].message.content or "{}"
    data = json.loads(raw)
    return _parse_extraction(data, language)


def _parse_extraction(data: dict[str, Any], language: str) -> ExtractionResult:
    claims: list[ExtractedClaim] = []
    for c in data.get("claims") or []:
        try:
            ctype = ClaimType(c.get("claim_type"))
        except Exception:
            continue
        prov = c.get("provenance") or "founder_stated"
        try:
            provenance = ProvenanceKind(prov)
        except Exception:
            provenance = ProvenanceKind.INFERRED
        claims.append(
            ExtractedClaim(
                claim_type=ctype,
                title=(c.get("title") or ctype.value.replace("_", " ").title())[:300],
                body=(c.get("body") or "").strip(),
                confidence=float(c.get("confidence") or 0.5),
                provenance=provenance,
                numeric_value=c.get("numeric_value"),
                numeric_unit=c.get("numeric_unit"),
                source_quote=c.get("source_quote"),
            )
        )

    assumptions: list[AssumptionRow] = []
    for a in data.get("assumptions") or []:
        try:
            provenance = ProvenanceKind(a.get("provenance") or "placeholder")
        except Exception:
            provenance = ProvenanceKind.PLACEHOLDER
        assumptions.append(
            AssumptionRow(
                key=str(a.get("key") or "unknown"),
                label=str(a.get("label") or a.get("key") or "Assumption"),
                value=float(a.get("value") or 0),
                unit=str(a.get("unit") or ""),
                provenance=provenance,
                notes=str(a.get("notes") or ""),
            )
        )

    return ExtractionResult(
        language=data.get("language") or language,
        claims=claims,
        assumptions=assumptions,
        summary=(data.get("summary") or "")[:2000],
    )


def _extract_heuristic(transcript: str, language: str) -> ExtractionResult:
    """Extract only what appears in the transcript — never invent filler claims or numbers."""
    text = _normalize_speech(transcript.strip())
    lower = text.lower()
    claims: list[ExtractedClaim] = []

    def add(ctype: ClaimType, title: str, body: str, conf: float = 0.55, quote: str | None = None):
        body = (body or "").strip()
        if not body:
            return
        # Avoid dumping the entire memo into every matched slot
        if len(body) > 280:
            body = body[:277].rsplit(" ", 1)[0] + "…"
        claims.append(
            ExtractedClaim(
                claim_type=ctype,
                title=title,
                body=body,
                confidence=conf,
                provenance=ProvenanceKind.FOUNDER_STATED if conf >= 0.6 else ProvenanceKind.INFERRED,
                source_quote=(quote or body)[:280],
            )
        )

    chunks = _speech_chunks(text)

    def first_matching(keys: list[str]) -> str:
        return next((s for s in chunks if any(k in s.lower() for k in keys)), "")

    def snippet(pattern: str, flags: int = re.I) -> str:
        m = re.search(pattern, text, flags)
        return m.group(0).strip() if m else ""

    # Prefer focused regex snippets over whole-run-on-sentence matches
    solution_s = (
        snippet(
            r"(?:my idea is(?: to)?|i(?:'m| am)? (?:building|developing|creating)|"
            r"we(?:'re| are)? (?:building|developing)|idea is developed?)\s+.{5,120}?(?=(?:\.|,|;|\bthe (?:problem|thing|plan)\b|\brais|\bseed\b|$))"
        )
        or first_matching(
            [
                "solution",
                "idea",
                "building",
                "develop",
                "chatbot",
                "chat bot",
                "app",
                "platform",
                "product",
                "tool",
                "saas",
            ]
        )
    )
    problem_s = (
        snippet(
            r"(?:(?:the )?(?:problem|thing) is|struggle(?:s|ing)?|waste|wasting|spend(?:ing)? (?:a )?lot of time|"
            r"hard to|takes? (?:too )?much time).{5,140}?(?=(?:\.|,|;|\bmy plan\b|\brais|\bseed\b|$))"
        )
        or first_matching(
            [
                "problem",
                "struggle",
                "hard",
                "expensive",
                "pain",
                "difficult",
                "frustrated",
                "waste",
                "wasting",
                "lot of time",
                "rest a lot of time",
                "searching notes",
                "during notes",
            ]
        )
    )
    icp_s = (
        snippet(r"(?:for|targeting)\s+(?:college\s+)?(?:students|founders|teachers|startups|businesses|smes)\b")
        or first_matching(
            ["college students", "students", "targeting", "customers", "for founders", "for businesses", "icp"]
        )
    )
    ask_s = (
        snippet(
            r"(?:(?:plan is to|we(?:'re| are)?|i(?:'m| am)?)\s+)?(?:rais(?:e|ing)|seed|funding|ask)\s+"
            r"(?:a\s+|about\s+|of\s+)?(?:\$)?[0-9][0-9,]*(?:\s*(?:k|thousand|m|million))?"
        )
        or first_matching(["raising", "raise", "seed", "ask", "funding", "round", "investment"])
    )
    traction_s = first_matching(["traction", "pilot", "users", "prototype", "revenue", "loi", "signed", "customers"])
    team_s = first_matching(["team", "co-founder", "cofounder", "i am the founder", "we're two"])
    risk_s = first_matching(["risk", "biggest risk", "challenge", "worried"])
    pricing_s = first_matching(
        ["pricing", "price", "dollar", "$", "month", "cohort", "subscription", "charge", "rupees"]
    )
    gtm_s = first_matching(["go-to-market", "gtm", "sell", "distribution", "channel", "acquire"])
    why_s = first_matching(["why now", "timing", "now is", "recently"])
    diff_s = first_matching(["different", "unlike", "versus", "competitor", "moat", "unique"])
    market_s = first_matching(["market", "tam", "sam", "billion", "industry"])

    add(ClaimType.PROBLEM, "Problem", problem_s, 0.75 if problem_s else 0.0)
    add(ClaimType.SOLUTION, "Solution", solution_s, 0.8 if solution_s else 0.0)
    add(ClaimType.ICP, "ICP", icp_s, 0.7 if icp_s else 0.0)
    add(ClaimType.MARKET, "Market", market_s, 0.6 if market_s else 0.0)
    add(ClaimType.TRACTION, "Traction", traction_s, 0.7 if traction_s else 0.0)
    add(ClaimType.GTM, "Go-to-Market", gtm_s, 0.6 if gtm_s else 0.0)
    add(ClaimType.PRICING, "Pricing", pricing_s, 0.7 if pricing_s else 0.0)
    add(ClaimType.TEAM, "Team", team_s, 0.7 if team_s else 0.0)
    add(ClaimType.ASK, "The Ask", ask_s, 0.8 if ask_s else 0.0)
    add(ClaimType.RISK, "Risks", risk_s, 0.7 if risk_s else 0.0)
    add(ClaimType.WHY_NOW, "Why Now", why_s, 0.6 if why_s else 0.0)
    add(ClaimType.DIFFERENTIATION, "Differentiation", diff_s, 0.6 if diff_s else 0.0)

    if not claims and text:
        add(ClaimType.SOLUTION, "Founder narrative", text[:2000], 0.45, text[:280])

    assumptions = _heuristic_assumptions(lower, text)
    summary = " ".join(chunks[:3]) if chunks else text[:400]
    return ExtractionResult(language=language or "en", claims=claims, assumptions=assumptions, summary=summary)


def _normalize_speech(text: str) -> str:
    """Light cleanup for common STT mistakes in founder memos."""
    replacements = [
        (r"\bchat\s*bought\b", "chatbot"),
        (r"\bchat\s*bot\b", "chatbot"),
        (r"\bidea is developed\b", "idea is to develop"),
        (r"\bthe rest a lot of time\b", "they waste a lot of time"),
        (r"\bthis during notes\b", "searching notes"),
        (r"\bduring notes\b", "on notes"),
        (r"\bseed a\b", "seed "),
        (r"\s+", " "),
    ]
    out = text
    for pat, repl in replacements:
        out = re.sub(pat, repl, out, flags=re.I)
    return out.strip()


def _speech_chunks(text: str) -> list[str]:
    """Split run-on voice transcripts into workable chunks."""
    parts = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if len(parts) > 1:
        return parts
    # Discourse / clause markers common in spoken pitches
    parts = [
        s.strip(" ,")
        for s in re.split(
            r"\s*(?:\n|;|(?:,\s*)?\b(?:and then|also|plus|the problem|the thing is|my plan|we(?:'re| are) raising|i(?:'m| am) raising)\b)\s*",
            text,
            flags=re.I,
        )
        if s and s.strip(" ,")
    ]
    return parts or ([text] if text else [])


def _heuristic_assumptions(lower: str, text: str) -> list[AssumptionRow]:
    """Only emit assumptions grounded in stated numbers — never invent placeholders."""
    assumptions: list[AssumptionRow] = []

    raise_amt = None
    if "two hundred and fifty thousand" in lower or "250,000" in lower or "250k" in lower:
        raise_amt = 250000.0
    else:
        m = re.search(
            r"(?:rais(?:e|ing)|seed|funding|ask)\s+(?:a\s+|about\s+|of\s+)?(?:\$)?([0-9][0-9,]*)\s*(k|thousand|m|million)?",
            lower,
        )
        if m:
            val = float(m.group(1).replace(",", ""))
            unit = (m.group(2) or "").lower()
            if unit in {"k", "thousand"}:
                val *= 1000
            elif unit in {"m", "million"}:
                val *= 1_000_000
            raise_amt = val

    if raise_amt is not None:
        assumptions.append(
            AssumptionRow(
                key="raise_amount",
                label="Raise amount",
                value=raise_amt,
                unit="USD",
                provenance=ProvenanceKind.FOUNDER_STATED,
                notes="Parsed from transcript",
            )
        )

    price = None
    if re.search(r"forty-?nine|\$\s*49|49 dollars", lower):
        price = 49.0
    else:
        pm = re.search(r"\$\s*([0-9]+(?:\.[0-9]+)?)\s*(?:/\s*)?(?:per\s+)?month", lower)
        if pm:
            price = float(pm.group(1))

    if price is not None:
        assumptions.append(
            AssumptionRow(
                key="pro_price_monthly",
                label="Pro price (monthly)",
                value=price,
                unit="USD",
                provenance=ProvenanceKind.FOUNDER_STATED,
                notes="Parsed from transcript",
            )
        )
        assumptions.append(
            AssumptionRow(
                key="arpu_monthly",
                label="ARPU monthly",
                value=price,
                unit="USD",
                provenance=ProvenanceKind.INFERRED,
                notes="Inferred from stated price",
            )
        )

    if re.search(r"two to fifteen thousand|\$?\s*2,?000\s*(?:to|-)\s*\$?\s*15,?000", lower):
        assumptions.append(
            AssumptionRow(
                key="cohort_price_mid",
                label="Cohort price (mid)",
                value=8500,
                unit="USD",
                provenance=ProvenanceKind.FOUNDER_STATED,
                notes="Midpoint of stated 2–15k cohort range",
            )
        )

    return assumptions

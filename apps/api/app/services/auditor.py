from __future__ import annotations

import re

from app.ontology.claims import AuditIssue


def audit_project(
    *,
    claims: list[dict],
    assumptions: list[dict],
    questions: list[dict],
    strict_mode: bool,
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    by_type = {c["claim_type"]: c for c in claims if c.get("status") != "rejected"}

    # Unresolved critical questions
    critical_open = [q for q in questions if q.get("severity") == "critical" and not q.get("resolved")]
    if critical_open:
        issues.append(
            AuditIssue(
                code="critical_questions_open",
                severity="block" if strict_mode else "warn",
                message=f"{len(critical_open)} critical investor question(s) still unanswered.",
            )
        )

    # Unconfirmed claims used in narrative
    draftish = [c for c in claims if c.get("status") in {"draft", "stated", "inferred", "challenged"}]
    if draftish and strict_mode:
        issues.append(
            AuditIssue(
                code="unconfirmed_claims",
                severity="block",
                message=f"{len(draftish)} claim(s) are not confirmed. Confirm or reject before Strict export.",
                claim_ids=[c["id"] for c in draftish if c.get("id")],
            )
        )
    elif draftish:
        issues.append(
            AuditIssue(
                code="unconfirmed_claims",
                severity="warn",
                message=f"{len(draftish)} claim(s) still unconfirmed.",
                claim_ids=[c["id"] for c in draftish if c.get("id")],
            )
        )

    # Placeholder assumptions
    placeholders = [a for a in assumptions if a.get("provenance") == "placeholder"]
    if placeholders:
        issues.append(
            AuditIssue(
                code="placeholder_assumptions",
                severity="block" if strict_mode else "warn",
                message=(
                    "Financial model contains placeholder assumptions: "
                    + ", ".join(a.get("key", "") for a in placeholders)
                    + ". Tag as founder_stated or edit values before investor send."
                ),
            )
        )

    # Traction vs soft language
    traction = by_type.get("traction")
    if traction:
        body = (traction.get("body") or "").lower()
        soft = any(w in body for w in ["prototype", "planning", "hope", "will have", "not fully verified"])
        has_number = bool(re.search(r"\d", traction.get("body") or ""))
        if soft and not has_number:
            issues.append(
                AuditIssue(
                    code="soft_traction",
                    severity="warn",
                    message="Traction claim uses soft language without hard numbers.",
                    claim_ids=[traction["id"]] if traction.get("id") else [],
                )
            )
        # If slide-worthy confirmed traction but numeric assumption customers is 0 placeholder
        cust = next((a for a in assumptions if a.get("key") in {"starting_customers", "customers"}), None)
        if cust and float(cust.get("value") or 0) == 0 and "pilot" in body:
            issues.append(
                AuditIssue(
                    code="traction_model_mismatch",
                    severity="warn",
                    message="Traction mentions pilots/users but customer assumption is 0 — align graph and model.",
                    claim_ids=[traction["id"]] if traction.get("id") else [],
                )
            )

    # Ask vs raise_amount
    ask = by_type.get("ask")
    raise_a = next((a for a in assumptions if a.get("key") == "raise_amount"), None)
    if ask and raise_a:
        ask_nums = [float(x.replace(",", "")) for x in re.findall(r"([0-9][0-9,]{2,})", ask.get("body") or "")]
        rv = float(raise_a.get("value") or 0)
        if ask_nums and rv and all(abs(n - rv) > max(1000, 0.2 * rv) for n in ask_nums if n > 1000):
            # only flag if clearly different large numbers
            if any(n > 10000 for n in ask_nums):
                issues.append(
                    AuditIssue(
                        code="ask_amount_mismatch",
                        severity="block" if strict_mode else "warn",
                        message="Ask claim text and raise_amount assumption appear to disagree.",
                        claim_ids=[ask["id"]] if ask.get("id") else [],
                    )
                )

    # Required slots for a minimal deck
    required = ["problem", "solution", "ask"]
    for r in required:
        node = by_type.get(r)
        if not node or not (node.get("body") or "").strip():
            issues.append(
                AuditIssue(
                    code=f"missing_{r}",
                    severity="block",
                    message=f"Missing required claim: {r}.",
                )
            )

    # B2B vs consumer mixed signals
    blob = " ".join((c.get("body") or "") for c in claims).lower()
    if "b2b" in blob and "consumer" in blob:
        issues.append(
            AuditIssue(
                code="b2b_consumer_mix",
                severity="warn",
                message="Claims mention both B2B and consumer — clarify primary motion.",
            )
        )

    return issues


def readiness_score(claims: list[dict], questions: list[dict], assumptions: list[dict]) -> float:
    if not claims:
        return 0.0
    confirmed = sum(1 for c in claims if c.get("status") == "confirmed")
    claim_score = confirmed / max(len(claims), 1)
    q_total = len(questions) or 1
    q_resolved = sum(1 for q in questions if q.get("resolved"))
    q_score = q_resolved / q_total
    placeholders = sum(1 for a in assumptions if a.get("provenance") == "placeholder")
    a_score = 1.0 - (placeholders / max(len(assumptions), 1)) * 0.5
    return round(100 * (0.5 * claim_score + 0.3 * q_score + 0.2 * a_score), 1)

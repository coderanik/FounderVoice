from __future__ import annotations

import json

from openai import OpenAI

from app.config import Settings
from app.ontology.claims import ClaimType, CriticQuestion

CRITIC_SYSTEM = """You are the PitchOS Investor Critic agent.
Given a founder's claim graph, ask tough but fair follow-up questions like a seed investor.
Rules:
- Cite which claim_type is weak.
- Prefer critical gaps that would block a raise (traction evidence, ICP clarity, ask clarity, unit economics).
- Do NOT invent facts or fill missing numbers.
- Return JSON: {"questions":[{"claim_type":"...","severity":"critical|medium|low","question":"...","rationale":"..."}]}
Max 10 questions.
"""


def generate_critic_questions(
    claims: list[dict],
    assumptions: list[dict],
    settings: Settings,
) -> tuple[list[CriticQuestion], bool]:
    if settings.openai_api_key:
        try:
            return _critic_llm(claims, assumptions, settings), True
        except Exception:
            pass
    return _critic_heuristic(claims, assumptions), False


def _critic_llm(claims: list[dict], assumptions: list[dict], settings: Settings) -> list[CriticQuestion]:
    client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
    payload = {"claims": claims, "assumptions": assumptions}
    resp = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": CRITIC_SYSTEM},
            {"role": "user", "content": json.dumps(payload)},
        ],
    )
    data = json.loads(resp.choices[0].message.content or "{}")
    out: list[CriticQuestion] = []
    for q in data.get("questions") or []:
        ctype = None
        if q.get("claim_type"):
            try:
                ctype = ClaimType(q["claim_type"])
            except Exception:
                ctype = None
        out.append(
            CriticQuestion(
                claim_type=ctype,
                severity=q.get("severity") or "medium",
                question=q.get("question") or "",
                rationale=q.get("rationale") or "",
            )
        )
    return [q for q in out if q.question]


def _critic_heuristic(claims: list[dict], assumptions: list[dict]) -> list[CriticQuestion]:
    by_type = {c.get("claim_type"): c for c in claims}
    questions: list[CriticQuestion] = []

    def q(ctype: ClaimType | None, severity: str, question: str, rationale: str = ""):
        questions.append(
            CriticQuestion(claim_type=ctype, severity=severity, question=question, rationale=rationale)
        )

    traction = by_type.get("traction")
    if not traction or float(traction.get("confidence") or 0) < 0.6:
        q(
            ClaimType.TRACTION,
            "critical",
            "What concrete traction evidence do you have today (users, revenue, LOIs, pilots), and what can you show an investor?",
            "Traction claim is missing or low-confidence.",
        )
    elif "not fully verified" in (traction.get("body") or "").lower() or "prototype" in (traction.get("body") or "").lower():
        q(
            ClaimType.TRACTION,
            "critical",
            "You mention a prototype/pilots — how many active users or signed pilot agreements, and over what time period?",
            "Traction language is soft.",
        )

    ask = by_type.get("ask")
    if not ask or float(ask.get("confidence") or 0) < 0.5:
        q(ClaimType.ASK, "critical", "Exactly how much are you raising, on what instrument, and what runway does that buy?", "Ask is unclear.")

    icp = by_type.get("icp")
    if not icp or "incomplete" in (icp.get("body") or "").lower():
        q(ClaimType.ICP, "medium", "Who is the single best beachhead customer (role, company size, trigger event)?", "ICP needs sharpness.")

    market = by_type.get("market")
    if market and "TAM" not in (market.get("body") or "") and "billion" not in (market.get("body") or "").lower():
        q(ClaimType.MARKET, "medium", "How do you size the market bottom-up (not just top-down TAM)?", "Market method unclear.")

    pricing = by_type.get("pricing")
    solution = by_type.get("solution")
    if pricing and solution:
        body = (pricing.get("body") or "") + (solution.get("body") or "")
        if "b2b" in body.lower() and "consumer" in body.lower():
            q(ClaimType.PRICING, "critical", "Is this B2B SaaS or consumer? Pricing and ICP seem mixed — which is the primary motion?", "Possible B2B/consumer contradiction.")

    placeholders = [a for a in assumptions if a.get("provenance") == "placeholder"]
    if placeholders:
        q(
            ClaimType.UNIT_ECONOMICS,
            "critical",
            f"You still have placeholder financial assumptions ({', '.join(a.get('key','') for a in placeholders[:4])}). Which of these are founder-stated vs exploratory?",
            "Placeholder assumptions remain.",
        )

    if "differentiation" not in by_type:
        q(
            ClaimType.DIFFERENTIATION,
            "medium",
            "What is your edge vs obvious alternatives (incumbents, DIY tools, ChatGPT wrappers)?",
            "Moat not stated.",
        )

    team = by_type.get("team")
    if not team or float(team.get("confidence") or 0) < 0.5:
        q(ClaimType.TEAM, "medium", "Who are the founders, what have they shipped before, and what key hire comes first post-raise?", "Team thin.")

    problem = by_type.get("problem")
    if not problem:
        q(
            ClaimType.PROBLEM,
            "critical",
            "What painful problem are you solving, for whom, and how do they solve it today?",
            "Problem claim is missing.",
        )

    # Deduplicate by question text
    seen = set()
    unique: list[CriticQuestion] = []
    for item in questions:
        if item.question in seen:
            continue
        seen.add(item.question)
        unique.append(item)
    return unique[:10]

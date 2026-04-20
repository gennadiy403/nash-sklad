# Conflict Detection Report

Ingest scope: 2 classified documents (1 PRD, 1 DOC). Mode: new.
Precedence applied: ADR > SPEC > PRD > DOC.

Cycle detection: cross-ref graph is empty. No cycles.
Unknown-confidence docs: none. Both classifications are high confidence with manifest override.

## BLOCKERS (0)

No blocker-class conflicts found.

- No LOCKED-vs-LOCKED ADR contradictions (no ADRs in ingest set).
- No cycle-detection blockers (empty cross-ref graph).
- No UNKNOWN-confidence-low classifications (both docs classified high).
- No existing locked-decision contradictions (mode=new; no existing CONTEXT.md).

## WARNINGS (0)

No competing-variant conflicts found.

- Single PRD in ingest (ROADMAP.md) — no divergent acceptance criteria across multiple PRDs.
- STORY.md (DOC) reinforces ROADMAP.md framing and does not propose competing variants.

## INFO (0)

No auto-resolved conflicts.

- No SPEC-vs-ADR contradictions (neither type present).
- ROADMAP (PRD) and STORY (DOC) are factually consistent on shared scope:
  - Marketplace set: both list WB, Ozon, ЯМ. Consistent.
  - Target audience entry point: marketplace sellers. Consistent.
  - Integration philosophy: STORY's "прямые интеграции с МП без прослоек" and "модульная архитектура" align with ROADMAP's REQ-industry-modules and USP framing. No contradiction; STORY is supporting context, not a competing source.
  - No lower-precedence DOC claim had to override a higher-precedence PRD claim.

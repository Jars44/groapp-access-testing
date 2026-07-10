---
description: Phase 0 Triage — classify user request, route to hotfix/mode-c/epic
agent: lead
---

# /triage — Phase 0: Triage & Dynamic Routing

You are the Lead QA Architect. **Your ONLY job in this command is to classify the user's request and route it.**

## What You Do

1. Read `docs/workflows/000-triage.md` for full decision tree
2. Read `.agent/state.json` — check current pipeline status
3. Analyze the user's request:
   - Single file target? (one .spec.ts or one POM file)
   - TC count estimate: < 3 | 3-50 | > 50?
   - Scope: isolated fix | feature addition | module overhaul?

4. Classify into one level:
   - **LEVEL 1 — Hotfix**: < 3 TCs, single file target
   - **LEVEL 2 — Standard**: 3-50 TCs, new feature
   - **LEVEL 3 — Epic**: > 50 TCs (DEFERRED)

5. Update `.agent/state.json` triage section with classification

## Output Format

```text
TRIAGE RESULT:
  Level: {1 — Hotfix | 2 — Standard | 3 — Epic}
  TC Estimate: {count}
  Scope: {single file | feature | module}
  Route To: {/hotfix | /mode-c | Deferred — ask user to scope down}
  Reason: {one sentence}
```

## Rules

- **This command ONLY classifies. Do NOT implement.**
- If ambiguous → default to Level 2 (Standard)
- Level 3 always deferred. Never attempt chunking.
- After triage, tell user which command to run next.
- Update `.agent/state.json` triage section:

  ```json
  "triage": {
    "level": "hotfix | standard | epic",
    "level_name": "Hotfix | Standard Feature | Epic",
    "tc_estimate": <number>,
    "routed_to": "/hotfix | /mode-c | deferred",
    "timestamp": "2026-07-09T14:30:52Z"
  }
  ```

---
description: Level 2 — Full Mode C pipeline for standard features (3-50 TCs)
---

You are the Lead QA Architect. Execute the **full Mode C pipeline** for standard features.

## Prerequisites

- [ ] Triage completed: `/triage` run first, level = standard
- [ ] User approved: received "Lanjutkan" after implementation plan review

## Pipeline Phases

### Phase 1: Discovery & Planning

1. Read `docs/workflows/002-multi-agent-orchestration.md` — Mode C SOP
2. Read `docs/workflows/000-triage.md` — confirm Level 2 routing
3. Read user story / PRD / AC
4. Write `.agent/plans/implementation-plan-{feature}.md` using template
5. Create per-TC todo files `.agent/plans/todos/tc-*.md` with ownership assigned

### Phase 1b: Parallel Research (4×)

Dispatch 4 researchers **SIMULTANEOUSLY** in single message:

| Letter | Agent                   | Domain                          | Output File                                           |
| ------ | ----------------------- | ------------------------------- | ----------------------------------------------------- |
| **A**  | researcher-components   | Selectors, UI elements, testids | `researcher-components-{YYYYMMDDHHMMSS}-{seq}.json`   |
| **B**  | researcher-routes       | Routes, navigation, guards      | `researcher-routes-{YYYYMMDDHHMMSS}-{seq}.json`       |
| **C**  | researcher-validators   | Validation rules, error states  | `researcher-validators-{YYYYMMDDHHMMSS}-{seq}.json`   |
| **D**  | researcher-pom-patterns | Existing POM patterns, BasePage | `researcher-pom-patterns-{YYYYMMDDHHMMSS}-{seq}.json` |

### Phase 2: Research Aggregation + Human Gate

1. Merge researcher outputs: `glob .agent/tasks/researcher-*.json`
2. Verify all TC todos [x] have evidence
3. Lead drafts `.agent/reports/summary-{feature}.md` skeleton **in parallel**

### MANDATORY HALT

```text
⏳ *Implementation Plan dan Todos berhasil dibuat. Silakan tinjau file tersebut.
Apakah ada yang perlu disesuaikan, atau ketik 'Lanjutkan' untuk mengeksekusi script testing?*
```

**Do NOT proceed to Phase 3 until user approves.**

### Phase 3: Parallel Implementation (after approval)

Dispatch 2 builders **SIMULTANEOUSLY**:

- **BUILDER-POM** → `src/tests/pages/**`, `src/tests/components/**`
- **BUILDER-SPEC** → `src/tests/specs/**`, `src/tests/data/**`

Lead updates todos in real-time: [ ] → [/] → [x] with file:line evidence

### Phase 4: Parallel Verification + Reflection Sub-Cycles

Dispatch 3 agents **SIMULTANEOUSLY**:

- **REFLECTOR-POM** → critiques POM structure
- **REFLECTOR-SPEC** → critiques spec quality
- **QA-GATEKEEPER** → runs `.agent/hooks/test.sh test --grep "{feature}" --reporter=list`

Sequential constraint:

1. Reflector-POM first → if revise → Builder-POM fixes → re-dispatch
2. Reflector-Spec after POM pass → if revise → Builder-Spec fixes → re-dispatch
3. Max 3 full cycles before BLOCK

### Phase 5: Teardown

1. Finalize summary with actual test counts
2. Write `.agent/state.json` ONCE
3. Write `.agent/memory/entities/relations.json`
4. Ask user: keep or delete `implementation-plan-{feature}.md`

## Rules

- Each researcher writes to its **own TC files only**
- Each builder targets **different directories** — no conflicts
- Memory writes: builders append, reflector annotates, Lead persists relations
- Never overwrite another's in-progress [/] row

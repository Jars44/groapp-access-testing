# SOP 002 — Multi-Agent Orchestration

> Run researcher + builder + reviewer + qa-gatekeeper agents in parallel or sequential pipeline mode.

## Trigger

Use when task involves:

- New feature with 3+ test scenarios
- Unknown codebase area requiring exploration
- Large batch of POM + spec files
- Complex end-to-end flow needing persona isolation

---

## Mode A: Parallel Dispatch

```text
LEAD AGENT
│
├── 1. ANALYZE requirements
│   ├── Read PRD / feature spec
│   ├── Identify scope: routes, components, APIs, validation
│   └── Write test-plan.md using .agent/templates/test-plan-template.md
│       └── Each TC has: expected outcome, route, selectors, verification criteria
│
├── 2. DISPATCH sub-agents (parallel)
│   │
│   ├── RESEARCHER (read-only)
│   │   ├── Find all routes → file:line
│   │   ├── Find all components → selectors, testids
│   │   ├── Find API endpoints → request/response shapes
│   │   └── Find form validators → field rules
│   │
│   ├── BUILDER (after researcher completes)
│   │   ├── Create/update POM files
│   │   ├── Create/update spec files
│   │   ├── Create/update data factories
│   │   └── Check off [ ]→[x] in .agent/plans/test-plan-{feature}.md with file:line evidence
│   │
│   └── REVIEWER (after builder completes) — two-stage review
│       ├── Stage 1: Spec Compliance (blocking)
│       │   ├── Audit each [x] has file:line evidence
│       │   ├── Confirm every AC has a test
│       │   ├── Check no scope drift (gold-plating guard)
│       │   └── BLOCK if any spec mismatch — return to builder
│       ├── Stage 2: Code Quality (non-blocking)
│       │   ├── Audit POM structure
│       │   ├── Audit spec quality
│       │   └── Report findings — continue regardless
│       └── Report Stage 1 pass + Stage 2 findings
│
├── 3. VERIFY
│   ├── Run tests: npx playwright test --reporter=list
│   ├── Fix any failures
│   └── Run quality gate (constitution 004)
│
└── 4. WRITE state & SUMMARY
    ├── Generate .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md with evidence table
    ├── Update .agent/state.json with final results + summary path
    └── Stage all changed files
```

---

## Mode B: Sequential Pipeline

Use when task requires strict persona isolation with phased handoff. Each phase has one active agent; output feeds next phase. Every handoff includes human-verifiable evidence.

```text
LEAD ARCHITECT (Phase 1 — Discovery & Planning)
│
├── 1. Read user story / PRD / AC
├── 2. Identify all test scenarios, routes, APIs, validation rules
├── 3. Write .agent/plans/test-plan-{feature}.md using template
│   └── Each TC has: ID, description, type, route, given/when/then,
│       test data, selectors, verification criteria checklist
├── 4. Map each TC to state.json → tasks array with status=not_started
└── 5. Run validate-state.sh → update state.json phase=discovery
│
▼ (handoff via state.json — human verifies .agent/plans/test-plan-{feature}.md)
│
RESEARCHER (Phase 2 — Code Exploration)
│
├── 1. Read .agent/plans/test-plan-{feature}.md for scope
├── 2. Find routes → file:line
├── 3. Find page/component JSX → selectors, testids
├── 4. Find API endpoints → request/response shapes
├── 5. Find form validators → field rules, error states
├── 6. Write findings to .agent/state.json → artifacts.research_findings
└── 7. Never modify code
│
▼ (handoff via state.json — human verifies findings match test-plan.md)
│
BUILDER (Phase 3 — Implementation)
│
├── 1. Read .agent/plans/test-plan-{feature}.md for todo list
├── 2. Read researcher findings from state.json
├── 3. Read existing state.json tasks array
├── 4. Build in order:
│   ├── Test data factories → data/*.data.ts (if needed)
│   ├── Page Objects → pages/**/*.page.ts
│   ├── Component POMs → pages/components/*.component.ts
│   ├── Spec files → specs/**/*.spec.ts
│   └── Fixtures → fixtures/*.fixture.ts (if needed)
├── 5. Check off [ ] → [x] in .agent/plans/test-plan-{feature}.md with file:line evidence
│   └── Evidence format: "Spec: path:line | POM: path:line"
├── 6. Update state.json tasks array → evidence populated per TC
└── 7. Update state.json artifacts → pom_files, spec_files, data_factories
│
▼ (handoff via state.json — human inspects code at file:line)
│
QA GATEKEEPER (Phase 4 — Verification)
│
├── 1. Read .agent/plans/test-plan-{feature}.md — reject if any [x] lacks file:line evidence
├── 2. Read state.json tasks array — verify each TC has evidence field
├── 3. Run `npx playwright test --reporter=list`
├── 4. If failures: run flakiness protocol (run 3x)
├── 5. Update state.json per-TC: test_run_result, verification_notes
├── 6. PASS → generate summary, update state.json
└── 7. BLOCK → write detailed error with test output to state.json
│
▼ (handoff via state.json + summary file)
│
LEAD ARCHITECT (Phase 5 — Teardown & Summary)
│
├── 1. Read QA Gatekeeper report from state.json
├── 2. Verify every test-plan.md [x] has matching state.json tasks entry
├── 3. If blocked: re-dispatch to builder or gatekeeper (max 3 retries)
├── 4. If passed: generate .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md
│   └── See orchestrator-lead.md → Implementation Summary Generation
├── 5. Update state.json → summary path, phase=done
├── 6. Ask user: ".agent/plans/test-plan-{feature}.md complete. Keep or delete?"
└── 7. Present summary to user with explicit verification steps
```

## State Handoff

### Mode A (Parallel)

```text
Lead writes    → .agent/state.json  → { tasks: [{ id, status, agent }] }
Researcher     → .agent/state.json  → { artifacts: ["paths to findings"] }
Builder        → .agent/state.json  → { artifacts: ["paths to created files"] }
Reviewer       → .agent/state.json  → { artifacts: ["paths to review report"] }
Lead reads     → .agent/state.json  → verify all complete
```

### Mode B (Pipeline)

Each handoff produces a human-verifiable artifact. A human can inspect the artifact to confirm correctness without running any code.

| Phase          | Agent         | Writes to state.json                                 | Reads from              | Human-verifiable artifact                                                          |
| -------------- | ------------- | ---------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| Discovery      | Lead          | `tasks[]`, `phase=discovery`                         | PRD/AC                  | `.agent/plans/test-plan-{feature}.md` — manual checklist per TC                    |
| Exploration    | Researcher    | `artifacts.research_findings`, `phase=explore`       | test-plan.md + tasks    | File:line table — open source to verify                                            |
| Implementation | Builder       | `tasks[].evidence`, `artifacts.*`, `phase=build`     | test-plan.md + findings | `.agent/plans/test-plan-{feature}.md` [x] with file:line — inspect code            |
| Verification   | QA Gatekeeper | `tasks[].test_run_result`, `summary`, `phase=verify` | test-plan.md + code     | `.agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md` — test output + gaps      |
| Teardown       | Lead          | `summary.summary_path`, `phase=done`                 | all above               | Final `.agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md` — full traceability |

## Persona Reference

| Persona        | File                                 | Model (recommended) | Scope                           |
| -------------- | ------------------------------------ | ------------------- | ------------------------------- |
| Lead Architect | `docs/personas/orchestrator-lead.md` | LLaMA 3.3 70B       | Planning, delegation, teardown  |
| Researcher     | `docs/personas/researcher.md`        | Gemini 1.5 Flash    | Read-only code exploration      |
| Builder        | `docs/personas/builder.md`           | Qwen 3 Coder        | POM + spec implementation       |
| Reviewer       | `docs/personas/reviewer.md`          | —                   | Code audit (used in Mode A)     |
| QA Gatekeeper  | `docs/personas/qa-gatekeeper.md`     | —                   | Test execution, flakiness check |

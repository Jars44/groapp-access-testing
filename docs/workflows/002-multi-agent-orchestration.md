# SOP 002 — Multi-Agent Orchestration

> **Reality check:** OpenCode `task()` is serial — one sub-agent at a time, blocks until return. Parallel dispatch below is logical dependency view, not runtime behavior. State passed via prompt context and per-agent files, not shared state.json.

## Trigger

Use when task involves:

- New feature with 3+ test scenarios
- Unknown codebase area requiring exploration
- Large batch of POM + spec files
- Complex end-to-end flow needing persona isolation

---

## Mode A: Parallel Dispatch (Logical)

```text
LEAD AGENT
│
├── 1. ANALYZE requirements + WRITE TODOS
│   ├── Read PRD / feature spec
│   ├── Identify scope: routes, components, APIs, validation
│   ├── Write .agent/plans/test-plan-{feature}.md
│   └── Write .agent/plans/todos-{feature}.md with [ ]/[/]/[x] tracking per TC
│
├── 2. DISPATCH sub-agents (sequential — task() is serial)
│   │
│   ├── RESEARCHER (read-only) → writes .agent/tasks/researcher-{ts}.json
│   │   ├── Find all routes → file:line
│   │   ├── Find all components → selectors, testids
│   │   ├── Find API endpoints → request/response shapes
│   │   └── Find form validators → field rules
│   │
│   ├── BUILDER (after researcher) → writes .agent/tasks/builder-{ts}.json
│   │   ├── Create/update POM files
│   │   ├── Create/update spec files
│   │   ├── Create/update data factories
│   │   └── Update todos: [ ] → [/] → [x] per TC with file:line evidence
│   │
│   └── REVIEWER (after builder) → writes .agent/tasks/reviewer-{ts}.json
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
    ├── Generate .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md
    ├── Update .agent/state.json with final results + summary path
    └── Stage all changed files
```

---

## Mode B: Sequential Pipeline (Default)

Use when task requires strict persona isolation with phased handoff. Each phase has one active agent; output feeds next phase via per-agent output files, not shared state.

```text
LEAD ARCHITECT (Phase 1 — Discovery & Planning)
│
├── 1. Read user story / PRD / AC
├── 2. Identify all test scenarios, routes, APIs, validation rules
├── 3. Write .agent/plans/test-plan-{feature}.md using template
│   └── Each TC has: ID, description, type, route, given/when/then,
│       test data, selectors, verification criteria checklist
├── 4. Write .agent/plans/todos-{feature}.md
│   └── Each TC gets [ ] row with: TC-ID, description, assignee, status, evidence
└── 5. Read test-plan.md to confirm scope before dispatching

▼ (handoff via todos + plan — human verifies test-plan-{feature}.md)

RESEARCHER (Phase 2 — Code Exploration)
│
├── 1. Read .agent/plans/test-plan-{feature}.md for scope
├── 2. Find routes → file:line
├── 3. Find page/component JSX → selectors, testids
├── 4. Find API endpoints → request/response shapes
├── 5. Find form validators → field rules, error states
├── 6. Write findings to .agent/tasks/researcher-{timestamp}.json
└── 7. Never modify code

▼ (handoff via .agent/tasks/researcher-{ts}.json — human verifies findings)

BUILDER (Phase 3 — Implementation)
│
├── 1. Read .agent/plans/test-plan-{feature}.md for todo list
├── 2. Read researcher output from .agent/tasks/researcher-{ts}.json
├── 3. Build in order:
│   ├── Test data factories → data/*.data.ts (if needed)
│   ├── Page Objects → pages/**/*.page.ts
│   ├── Component POMs → pages/components/*.component.ts
│   ├── Spec files → specs/**/*.spec.ts
│   └── Fixtures → fixtures/*.fixture.ts (if needed)
├── 4. Update .agent/plans/todos-{feature}.md: [ ] → [/] → [x] per TC
│   └── Evidence: "Spec: path:line | POM: path:line"
├── 5. Write .agent/tasks/builder-{timestamp}.json with artifacts list
└── 6. Do NOT write to .agent/state.json

▼ (handoff via .agent/tasks/builder-{ts}.json — human inspects code at file:line)

QA GATEKEEPER (Phase 4 — Verification)
│
├── 1. Read .agent/plans/test-plan-{feature}.md — reject if any [x] lacks evidence
├── 2. Read .agent/tasks/builder-{ts}.json — verify artifacts exist
├── 3. Run `npx playwright test --reporter=list`
├── 4. If failures: run flakiness protocol (run 3x)
├── 5. Write .agent/tasks/qa-gatekeeper-{timestamp}.json with results
├── 6. PASS → generate summary
└── 7. BLOCK → write detailed error to qa-gatekeeper file

▼ (handoff via .agent/tasks/qa-gatekeeper-{ts}.json)

LEAD ARCHITECT (Phase 5 — Teardown & Summary)
│
├── 1. Read .agent/tasks/qa-gatekeeper-{ts}.json
├── 2. Verify every test-plan.md [x] has matching todos entry with evidence
├── 3. If blocked: re-dispatch to builder or gatekeeper (max 3 retries)
├── 4. If passed: generate .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md
│   └── See orchestrator-lead.md → Implementation Summary Generation
├── 5. Aggregate all .agent/tasks/*.json → .agent/state.json
│   └── state.json is WRITTEN ONCE by lead, never modified by sub-agents
├── 6. Ask user: ".agent/plans/test-plan-{feature}.md complete. Keep or delete?"
└── 7. Present summary to user with explicit verification steps
```

---

## Task Breakdown Protocol

Every task MUST produce a todo file. No exceptions.

### Todo File Format

Path: `.agent/plans/todos-{feature}.md`

```markdown
# TODOs: {Feature}

| TC-ID | Description | Type  | Assignee | Status | Evidence |
| ----- | ----------- | ----- | -------- | ------ | -------- |
| TC-XX | ...         | happy | builder  | [ ]    | —        |
| TC-XX | ...         | error | builder  | [ ]    | —        |
```

Status transitions: `[ ]` → `[/]` (in progress) → `[x]` (complete with `file:line` evidence) → `[-]` (skipped with reason).

### Evidence Format

Each `[x]` MUST include evidence in the format:

```text
Spec: src/tests/specs/feature/file.spec.ts:24
POM:  src/tests/pages/feature/file.page.ts:46
Data: src/tests/data/feature.data.ts:12
```

No evidence = not done. `[x]` without evidence = reverted to `[ ]`.

---

## Per-Agent Output Files

Sub-agents write to individual files, never to `.agent/state.json`.

| Agent          | Output File                                        | Content                           |
| -------------- | -------------------------------------------------- | --------------------------------- |
| Researcher     | `.agent/tasks/researcher-{YYYYMMDD}-{seq}.json`    | Routes, selectors, API endpoints  |
| Builder        | `.agent/tasks/builder-{YYYYMMDD}-{seq}.json`       | Created files list, artifacts     |
| Reviewer       | `.agent/tasks/reviewer-{YYYYMMDD}-{seq}.json`      | Spec compliance verdict, findings |
| QA Gatekeeper  | `.agent/tasks/qa-gatekeeper-{YYYYMMDD}-{seq}.json` | Test results, flakiness report    |
| Lead Architect | `.agent/state.json`                                | Aggregated summary, final results |

Orchestrator aggregates: `glob .agent/tasks/*.json → merge → write state.json once`.

---

## State Handoff

### Per-Agent Files (Default)

```text
Lead writes    → .agent/plans/test-plan-{feature}.md + todos-{feature}.md
Researcher     → .agent/tasks/researcher-{ts}.json
Builder        → .agent/tasks/builder-{ts}.json
Reviewer       → .agent/tasks/reviewer-{ts}.json
QA Gatekeeper  → .agent/tasks/qa-gatekeeper-{ts}.json
Lead reads all → aggregates → .agent/state.json (written once, never overwritten)
```

### Why Per-Agent Files Instead of Shared state.json

| Problem            | Shared state.json            | Per-agent files                         |
| ------------------ | ---------------------------- | --------------------------------------- |
| Concurrent writes  | Last-writer-wins, data loss  | No shared write — each agent owns file  |
| Partial corruption | Corrupts whole state         | Isolated — one bad agent = one bad file |
| Debugging          | Hard to trace who wrote what | Clear — each file = one agent's output  |
| Parallel future    | Impossible today             | Designed for eventual parallel dispatch |

### When Shared state.json Is Safe

- **Mode B sequential pipeline only** — one agent at a time
- **Lead-only writes** — sub-agents write to `.agent/tasks/`, lead aggregates
- **state.json is append-only** after write — never overwritten

### Current Constraints (Reality Check)

- OpenCode `task()` tool is serial — one sub-agent at a time, blocks until return
- Parallel dispatch in this SOP is logical dependency view, not runtime behavior
- Concurrent writes to `.agent/state.json` cause data loss (last-writer-wins)

### What Actually Works Today

| Phase   | Agent                         | Handoff                                |
| ------- | ----------------------------- | -------------------------------------- |
| Phase 1 | Lead writes test-plan + todos | → human verifies                       |
| Phase 2 | task(researcher) → findings   | → .agent/tasks/researcher-{ts}.json    |
| Phase 3 | task(builder) → files         | → .agent/tasks/builder-{ts}.json       |
| Phase 4 | task(qa-gatekeeper) → results | → .agent/tasks/qa-gatekeeper-{ts}.json |
| Phase 5 | Lead merges → summary         | → .agent/state.json (once)             |

Sequential pipeline. State passed via prompt context + per-agent files, not shared file writes.

### Improvement to Enable Parallelism

1. **Split researcher** into domain-scoped agents (routes, components, validators) — still serial per `task()` but narrower scope per call
2. **Replace shared state.json** with per-agent output files in `.agent/tasks/{agent}-{timestamp}.json` — orchestrator reads all after gathering
3. **File-based handoff protocol** instead of shared mutable state
4. **Orchestrator aggregates:** `glob .agent/tasks/*.json` → merge → feed next agent
5. **Same pattern** works with concurrent dispatch once tooling supports it

### Not Possible Today

- True concurrent sub-agent execution (no Promise.all equivalent for `task()`)
- Shared mutable state across parallel agents
- Parallel read/write to state.json without corruption risk

---

## Persona Reference

| Persona        | File                                  | Model (recommended) | Scope                           |
| -------------- | ------------------------------------- | ------------------- | ------------------------------- |
| Lead Architect | `docs/personas/orchestrator-lead.md`  | LLaMA 3.3 70B       | Planning, delegation, teardown  |
| Researcher     | `docs/personas/researcher.md`         | Gemini 1.5 Flash    | Read-only code exploration      |
| Builder        | `docs/personas/builder.md`            | Qwen 3 Coder        | POM + spec implementation       |
| Reviewer       | `docs/personas/reviewer.md`           | —                   | Code audit (used in Mode A)     |
| QA Gatekeeper  | `docs/personas/qa-gatekeeper.md`      | —                   | Test execution, flakiness check |
| QA Engineer    | `docs/personas/senior-qa-engineer.md` | —                   | Test strategy, quality gate     |

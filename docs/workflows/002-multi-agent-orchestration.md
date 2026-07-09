# SOP 002 — Multi-Agent Orchestration

> **Reality check:** OpenCode `task()` is serial — one sub-agent at a time, blocks until return. Parallel dispatch below is logical dependency view, not runtime behavior. State passed via prompt context and per-agent files, not shared state.json.

## Trigger

Use when task involves:

- New feature with 3+ test scenarios
- Unknown codebase area requiring exploration
- Large batch of POM + spec files
- Complex end-to-end flow needing persona isolation

---

## Mode C: Maximum Parallelism (Optimal)

> **Goal:** Maximize parallel execution to reduce total wall-clock time. Documentation runs simultaneously with code work where safe.

### Parallelization Matrix

| Phase          | Parallel Tasks                                                                            | Sequential Constraints                                     |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Discovery      | 4x Researcher sub-agents + Lead writes todos + Memory entities                            | None                                                       |
| Implementation | Lead updates todos real-time + Builder writes + Memory observations                       | Builder needs researcher output                            |
| Verification   | Lead drafts summary structure + QA runs tests + Memory test results + Reflector critiques | QA needs builder artifacts, Reflector needs builder output |
| Teardown       | Lead finalizes summary + merges state.json + persists memory relations                    | State.json written once                                    |

### Sub-Agent Parallelizability

| Sub-Agent                | Can Run Simultaneously With                           | Dependency                     |
| ------------------------ | ----------------------------------------------------- | ------------------------------ |
| Researcher (routes)      | Researcher (components, api, validators)              | None                           |
| Researcher (components)  | Researcher (routes, api, validators)                  | None                           |
| Researcher (api)         | Researcher (routes, components, validators)           | None                           |
| Researcher (validators)  | Researcher (routes, components, api)                  | None                           |
| Builder                  | Lead updating todos + Memory writes                   | Researcher output              |
| Reflector                | —                                                     | Builder artifacts              |
| QA Gatekeeper            | Lead drafting summary structure + Memory test results | Builder artifacts              |
| Lead (final state merge) | Nothing                                               | QA results + Reflector verdict |

### Real-Time Todo + State + Memory Updates

Todos (`.agent/plans/todos-{feature}.md`), state snapshots, and memory entities updated **continuously** during execution — never batched at end.

```text
Discovery:    Lead writes [ ] → Researcher adds [/] as exploration begins
              Researchers write memory entities for component selectors/routes/APIs
Research:     Researcher writes [/] as finds evidence → converts to [x] when complete
Build:        Builder writes [x] with file:line evidence per TC
              Builder adds observations to memory entities (implementation facts)
Verify:       Reflector critiques → writes [x] with critique annotations to memory
              QA Gatekeeper adds test_run:pass/fail field to evidence
              QA writes test results to memory entities
Teardown:     Lead writes final state.json (ONCE) + creates memory relations + persists state snapshot
```

**Pattern:** Each agent writes only its domain. No agent overwrites another's work.

### Documentation + Memory Parallelization

| Doc                             | Phase          | Parallel With             | Why Safe                                                              |
| ------------------------------- | -------------- | ------------------------- | --------------------------------------------------------------------- |
| `todos/{tc-id}.md`              | Discovery      | Researchers               | Each TC file has one assigned owner                                   |
| `todos/{tc-id}.md`              | Implementation | Builder                   | Builder writes only to implementation TC files                        |
| `memory/entities/{entity}.json` | Discovery      | Researchers               | Each researcher creates different entity files                        |
| `memory/entities/{entity}.json` | Implementation | Builder                   | Builder appends to existing — different files than researcher creates |
| `memory/entities/{entity}.json` | Verification   | QA Gatekeeper + Reflector | QA adds test_results, Reflector adds annotations — different fields   |
| `state.json`                    | Teardown only  | Nothing                   | Written once, end of pipeline                                         |
| `summary-{feature}.md` draft    | Verification   | QA Gatekeeper             | Structure has no test results dep                                     |
| `summary-{feature}.md` final    | Teardown       | Nothing                   | Needs QA results                                                      |

### Memory Writing Protocol

Each agent writes to separate entity files — prevents concurrent write conflicts:

| Agent         | Memory Domain                              | File                                                               |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Researcher    | Component selectors, routes, API endpoints | `.agent/memory/entities/{entity-name}.json` — creates file         |
| Builder       | Implementation facts, POM structure        | `.agent/memory/entities/{entity-name}.json` — appends observations |
| Reflector     | Critique findings, quality issues          | `.agent/memory/entities/{entity-name}.json` — appends annotations  |
| QA Gatekeeper | Test results, flakiness data               | `.agent/memory/entities/{entity-name}.json` — appends test_run     |
| Lead          | Relation creation, schema validation       | `.agent/memory/entities/relations.json` — writes at teardown only  |

**Per-entity file structure:**

```text
.agent/memory/entities/
├── FileUploader.json         ← Researcher creates, Builder updates, Reflector annotates
├── media-page.json           ← Researcher creates, QA adds test_run
├── media-api.json            ← Researcher creates
├── auth-route.json           ← Researcher creates
└── relations.json            ← Lead writes at teardown
```

**Per-entity file format:**

```json
// .agent/memory/entities/FileUploader.json
{
  "name": "MediaPage.FileUploader",
  "entityType": "component-selector",
  "writes": [
    { "agent": "researcher", "timestamp": "2026-07-09T00:00:00Z", "action": "create" },
    { "agent": "builder", "timestamp": "2026-07-09T00:30:00Z", "action": "observation_update" }
  ],
  "observations": [
    {
      "content": "Has ZERO data-testid",
      "addedBy": "researcher",
      "sourceFile": "src/features/media/components/FileUploader.tsx",
      "sourceLine": 42
    },
    {
      "content": "Uses aria-label='file uploader' for test selector",
      "addedBy": "builder",
      "sourceFile": "src/tests/pages/media/media.page.ts",
      "sourceLine": 46
    }
  ],
  "annotations": [
    {
      "type": "critique",
      "severity": "warning",
      "agent": "reflector",
      "content": "No testid — ask dev to add data-testid='file-uploader'",
      "timestamp": "2026-07-09T01:00:00Z"
    }
  ],
  "test_results": {
    "tc-01": { "status": "pass", "run": 1 },
    "tc-02": { "status": "pass", "run": 1 },
    "lastRun": "2026-07-09T02:00:00Z"
  }
}
```

**Rules:**

1. Each agent creates/updates only files in its domain
2. Researcher creates new files; Builder/Reflector/QA append to existing
3. No agent deletes another agent's observations
4. Relations file written by Lead at teardown only
5. All entries require evidence (sourceFile, sourceLine)
6. Write history logged in `writes` array per file

### Parallel Discovery Workflow

```text
LEAD AGENT (Phase 1 — Discovery & Planning)
│
├── 1. Read PRD / AC (1 call)
├── 2. Write .agent/plans/test-plan-{feature}.md (sequential, no parallel)
├── 3. Write .agent/plans/todos-{feature}.md initial [ ] rows
│
└── 4. DISPATCH 4x researchers in single message (parallel read-only calls)
    │
    ├── RESEARCHER-ROUTES (read-only, file:line tables)
    │   └── Writes .agent/tasks/researcher-routes-{ts}.json
    │
    ├── RESEARCHER-COMPONENTS (read-only, selectors/testids)
    │   └── Writes .agent/tasks/researcher-components-{ts}.json
    │
    ├── RESEARCHER-API (read-only, endpoints/contracts)
    │   └── Writes .agent/tasks/researcher-api-{ts}.json
    │
    └── RESEARCHER-VALIDATORS (read-only, validation rules)
        └── Writes .agent/tasks/researcher-validators-{ts}.json

▼ (4 researchers complete in parallel — wall-time = single research call)

LEAD AGGREGATES 4 partial findings
│
└── glob .agent/tasks/researcher-*.json → merge → update todos in real-time

▼ (handoff = 4 research files merged → feed builder)

BUILDER (Phase 3 — Implementation)
│
├── 1. Read all 4 researcher outputs (parallel reads)
├── 2. Build in order (data → POM → spec)
└── 3. Update todos [x] with file:line evidence per TC

▼ (handoff via .agent/tasks/builder-{ts}.json)

PARALLEL Phase 4 (Verification + Documentation + Memory)
│
├── REFLECTOR (critique Builder output)
│   ├── Reads POM files, spec files
│   ├── Checks against constitution 001-004
│   └── Writes .agent/tasks/reflector-{ts}.json
│
├── QA GATEKEEPER runs npx playwright test
│   ├── Writes .agent/tasks/qa-gatekeeper-{ts}.json
│   └── Updates todos with test_run:pass/fail
│
└── LEAD drafts .agent/reports/summary-{feature}.md structure
    (placeholders for pass/fail counts, evidence links)

▼ (QA results + draft structure + reflector verdict ready)

LEAD (Phase 5 — Teardown)
│
├── 1. Read .agent/tasks/qa-gatekeeper-{ts}.json
├── 2. Read .agent/tasks/reflector-{ts}.json
├── 3. If reflector verdict = "revise" after 3 cycles → BLOCK
├── 4. If reflector verdict = "pass" → Finalize summary with actual test counts
├── 5. Write .agent/state.json ONCE (aggregated result)
├── 6. Persist final memory entities, create relations
└── 7. Cleanup plan prompt to user
```

### Real-Time Todo Update Rules

1. **Lead writes initial rows** with [ ] status BEFORE dispatching
2. **Researchers flip to [/]** when starting exploration of that TC's scope
3. **Researchers flip to [x] with evidence** when finding complete
4. **Builder updates rows as POM/spec written** — not batched at end
5. **QA Gatekeeper adds test_run_result field** to evidence when test executed
6. **No agent overwrites another agent's in-progress [/] row**

### Why This Is Safe

| Concern                     | Mitigation                                               |
| --------------------------- | -------------------------------------------------------- |
| Concurrent todo writes      | Each agent owns specific TC rows, no overlap             |
| Concurrent summary draft    | Lead owns summary, QA owns test results — separate files |
| Concurrent researcher files | 4 different filenames, 4 different agents                |
| State.json corruption       | Written only by Lead in final phase, not concurrent      |
| Documentation lag           | Real-time updates mean docs reflect current state        |

### What Stays Sequential (Cannot Parallelize)

- **Builder before researcher output** — needs routes/selectors/APIs
- **QA before builder artifacts** — needs POM/spec files to test
- **Final state.json before QA results** — aggregates QA output
- **Final summary before test counts** — needs QA results
- **Cleanup before summary** — needs summary as reference

---

## Mode A: Parallel Dispatch (Logical) — Legacy

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

## Conflict Prevention Protocol

> Prevents concurrent write corruption. Single shared files = concurrent appends = last-writer-wins = data loss.

### The Problem

Two agents writing to the same file simultaneously = one overwrites the other.

| File                          | Writers                                      | Conflict Risk |
| ----------------------------- | -------------------------------------------- | ------------- |
| `todos-{feature}.md`          | Lead + 4 Researchers + Builder + QA          | **HIGH**      |
| `.agent/memory/entities.json` | Researcher + Builder + Reflector + QA + Lead | **HIGH**      |
| `state.json`                  | Lead only                                    | **None** ✓    |
| `summary-{feature}.md`        | Lead only                                    | **None** ✓    |

### The Solution: Per-TC / Per-Entity Files

| Strategy         | Use When                              | Example              |
| ---------------- | ------------------------------------- | -------------------- |
| Single writer    | One agent only                        | state.json, summary  |
| Per-TC files     | Multiple agents, TC-scoped writes     | todos/               |
| Per-entity files | Multiple agents, entity-scoped writes | memory/entities/     |
| Merge-then-write | Multiple agents, must consolidate     | research aggregation |

### File Ownership Matrix

| File/Directory                         | Writers                       | Ownership                  |
| -------------------------------------- | ----------------------------- | -------------------------- |
| `.agent/plans/todos/{tc-id}.md`        | Assigned agent only           | One agent per TC           |
| `.agent/memory/entities/{entity}.json` | Creator + assigned annotators | Per entity                 |
| `.agent/tasks/{agent}-{ts}.json`       | One agent                     | One file per agent per run |
| `.agent/state.json`                    | Lead only                     | Written once at teardown   |
| `.agent/reports/summary-{feature}.md`  | Lead only                     | Written at teardown        |

### Lock Protocol (Merge Points)

At merge points, Lead reads all partial files before any writer proceeds:

```text
1. Lead: glob *.json in source directory
2. Lead: read all files → merge in memory
3. Lead: write merged result to target
4. Sub-agents: wait for merge confirmation before writing to merged file
```

**Merge points:**

- Discovery → Implementation: Lead merges 4 researcher outputs
- Implementation → Verification: Lead merges builder output
- Verification → Teardown: Lead merges QA + Reflector outputs

### Concurrent Write Prevention Rules

1. **Assign before dispatch** — Lead assigns TC ownership before dispatching researchers
2. **One writer per file** — Each TC file has one owner, one owner per TC file
3. **No shared append** — Never append to a file another agent is writing
4. **Lock before merge** — Lead locks at merge points, releases after write
5. **Read before write** — Always read current state before modifying

---

## Per-TC Todo Files

> Each test case gets its own file. No shared file = no concurrent write conflict.

### Directory Structure

```text
.agent/plans/todos/
├── tc-01.md       ← Owned by: Researcher-Routes
├── tc-02.md       ← Owned by: Researcher-Routes
├── tc-03.md       ← Owned by: Researcher-Components
├── tc-04.md       ← Owned by: Researcher-Components
├── tc-05.md       ← Owned by: Researcher-API
├── tc-06.md       ← Owned by: Researcher-Validators
├── tc-07.md       ← Owned by: Builder
├── tc-08.md       ← Owned by: Builder
└── summary.md     ← Owned by: Lead (merged at teardown)
```

### Per-TC File Format

**File:** `.agent/plans/todos/tc-01.md`

```markdown
# TC-01: Upload valid image file

## Ownership

- **Assigned to:** Researcher-Routes
- **Created by:** Lead
- **Last updated:** 2026-07-09T00:00:00Z

## Status History

| Timestamp            | Agent             | Status | Notes                             |
| -------------------- | ----------------- | ------ | --------------------------------- |
| 2026-07-09T00:00:00Z | Lead              | [ ]    | Initial creation                  |
| 2026-07-09T00:05:00Z | Researcher-Routes | [/]    | Exploring route: /company/profile |
| 2026-07-09T00:10:00Z | Researcher-Routes | [x]    | Route verified at routes.tsx:42   |
| 2026-07-09T00:30:00Z | Builder           | [x]    | Spec written at login.spec.ts:24  |

## Test Case Details

- **Description:** Upload valid image file
- **Type:** happy path
- **Route:** /company/profile
- **Test Data:** src/tests/utils/file-helper.ts:createTestImage

## Selectors (from Research)

| Selector    | Source                 | File:Line           |
| ----------- | ---------------------- | ------------------- |
| fileInput   | FileUploader component | FileUploader.tsx:42 |
| progressBar | UploadDialog           | UploadDialog.tsx:15 |

## Implementation Evidence

| File | Line | Evidence                          |
| ---- | ---- | --------------------------------- |
| Spec | 24   | test('should upload valid image') |
| POM  | 46   | readonly fileInput = ...          |
| Data | 12   | createTestImage()                 |

## Verification

- [ ] Route verified
- [ ] Selectors verified against component
- [ ] Spec written
- [ ] POM written
- [ ] Test run: pass | fail | not_run
```

### Status Transitions

| Status | Meaning                | Who Sets                    |
| ------ | ---------------------- | --------------------------- |
| `[ ]`  | Not started            | Lead (initial)              |
| `[/]`  | In progress            | Assigned researcher/builder |
| `[x]`  | Complete with evidence | Agent with evidence         |
| `[-]`  | Skipped with reason    | Lead                        |

### Status History Requirement

Every status change MUST log:

- **Timestamp** (ISO 8601)
- **Agent** (who made the change)
- **Status** (new status)
- **Notes** (what changed, what evidence added)

### TC Assignment Protocol

Lead assigns TC files to agents BEFORE dispatch:

```text
Before dispatching researchers:
1. Lead creates .agent/plans/todos/tc-01.md through tc-N.md
2. Lead assigns ownership in each file:
   - TC routes belong to → Researcher-Routes
   - TC components belong to → Researcher-Components
   - TC API tests belong to → Researcher-API
   - TC validation belong to → Researcher-Validators
   - Implementation belong to → Builder
   - Test runs belong to → QA Gatekeeper
3. Lead dispatches researchers with ownership manifest
4. Each researcher writes ONLY to its assigned TC files
```

### Summary Merging (Teardown)

At teardown, Lead merges all per-TC files into summary:

```bash
# Lead executes:
glob .agent/plans/todos/tc-*.md
read all TC files
merge into .agent/reports/summary-{feature}.md
delete per-TC files (or archive if user wants)
```

### Evidence Format (Per-TC)

Each TC file MUST include:

```yaml
## Implementation Evidence
| File | Line | Evidence |
|------|------|----------|
| Spec | 24 | test('should upload valid image') |
| POM | 46 | readonly fileInput = ... |
| Data | 12 | createTestImage() |

## Test Run Evidence
- **Run 1:** pass | fail (with error message)
- **Run 2:** pass | fail
- **Run 3:** pass | fail
- **Final:** pass | blocked
```

---

## Per-Agent Output Files

Sub-agents write to individual files, never to `.agent/state.json`.

| Agent          | Output File                                        | Content                           |
| -------------- | -------------------------------------------------- | --------------------------------- |
| Researcher     | `.agent/tasks/researcher-{YYYYMMDD}-{seq}.json`    | Routes, selectors, API endpoints  |
| Builder        | `.agent/tasks/builder-{YYYYMMDD}-{seq}.json`       | Created files list, artifacts     |
| Reflector      | `.agent/tasks/reflector-{YYYYMMDD}-{seq}.json`     | Critique findings, quality issues |
| QA Gatekeeper  | `.agent/tasks/qa-gatekeeper-{YYYYMMDD}-{seq}.json` | Test results, flakiness report    |
| Lead Architect | `.agent/state.json`                                | Aggregated summary, final results |

Orchestrator aggregates: `glob .agent/tasks/*.json → merge → write state.json once`.

---

## State Handoff

### Per-Agent Files (Default)

```text
Lead writes    → .agent/plans/test-plan-{feature}.md + todos-{feature}.md
Researcher     → .agent/tasks/researcher-{ts}.json + .agent/memory/entities.json (new entities)
Builder        → .agent/tasks/builder-{ts}.json + .agent/memory/entities.json (observation updates)
Reflector      → .agent/tasks/reflector-{ts}.json + .agent/memory/entities.json (critique annotations)
QA Gatekeeper  → .agent/tasks/qa-gatekeeper-{ts}.json + .agent/memory/entities.json (test_run field)
Lead reads all → aggregates → .agent/state.json (ONCE) + .agent/memory/entities.json (relations)
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
| Reflector      | `docs/personas/reflector.md`          | —                   | Self-critique before QA         |
| Reviewer       | `docs/personas/reviewer.md`           | —                   | Code audit (used in Mode A)     |
| QA Gatekeeper  | `docs/personas/qa-gatekeeper.md`      | —                   | Test execution, flakiness check |
| QA Engineer    | `docs/personas/senior-qa-engineer.md` | —                   | Test strategy, quality gate     |

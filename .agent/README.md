# .agent/ — Universal Agent Metadata Center

> Master entrypoint for ALL AI agents working in this workspace.
> Agent-agnostic: works with OpenCode, Claude Code, OpenClaw, etc.

## Workspace Setup

This repo tests the **GroApp Access** application. Two repos must be cloned as siblings:

```text
parent/
├── groapp-access/       # App source (tested project)
└── groapp-access-testing/  # Test framework (this repo)
```

Default `sourceDir = ../groapp-access` (relative). Override via:

| Method  | How                                       |
| ------- | ----------------------------------------- |
| env var | `GROAPP_ACCESS_SOURCE_DIR=/custom/path`   |
| config  | edit `.agent/settings.json` → `sourceDir` |

## Agent Workflow (Mandatory)

```text
0. READ .agent/SYSTEM_PROMPT.md  — master agent protocol (THIS WINS OVER EVERYTHING)
1. READ .agent/README.md     — establish context
2. READ AGENTS.md            — project orchestration rules
3. READ CLAUDE.md            — AI behavior & output rules
4. READ task-specific docs   — constitution, workflows, personas
5. EXECUTE task              — following docs/workflows/ SOP
6. WRITE result              — update .agent/state.json
7. GENERATE summary          — .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md
8. CLEANUP plan              — ask user before deleting .agent/plans/implementation-plan-{feature}.md
```

## 3-Layer Context Architecture

| Layer         | Scope         | Files                                                                                                                  |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1 — Always    | Every session | `AGENTS.md`, `CLAUDE.md`, this file, `.agent/SYSTEM_PROMPT.md`                                                         |
| 2 — On-demand | Task match    | `skills/*/SKILL.md`, `skills/memory-management/SKILL.md`, `docs/constitution/*`, `docs/workflows/*`, `docs/personas/*` |
| 3 — Tools     | Tool access   | `docs/reference/*`, `.agent/templates/*`, `.agent/mcp.json`                                                            |

## File Index

| Location                  | Purpose                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `.agent/SYSTEM_PROMPT.md` | **MASTER** agent protocol — read first every session. THIS WINS over all other files.                           |
| `.agent/README.md`        | This file — entrypoint                                                                                          |
| `.agent/mcp.json`         | Persona-scoped MCP tool schema                                                                                  |
| `.agent/settings.json`    | Runtime config, persona configs, retry/validation                                                               |
| `.agent/state.json`       | Pipeline state machine (v2) with errors/retries                                                                 |
| `.agent/plans/`           | **Temporary** test plans — `implementation-plan-{feature}.md` (prompt user before delete)                       |
| `.agent/reports/`         | **Permanent** summaries — `summary-{feature}-{YYYYMMDD}[-{seq}].md`                                             |
| `.agent/templates/`       | Dispatch prompts + implementation-plan-template.md                                                              |
| `.agent/hooks/`           | pre-flight.sh, validate-state.sh                                                                                |
| `.agent/memory/`          | Cross-session knowledge graph — per-entity JSON files                                                           |
| `.agent/tasks/`           | Per-agent output files — `researcher-{variant}-{YYYYMMDDHHMMSS}-{seq}.json`, `builder-{pom                      | spec}-{ts}.json`, etc. |
| `.opencode/commands/`     | OpenCode slash commands — 13 commands for triage, hotfix, mode-c, researchers, builders, reflectors, QA, review |
| `.claude/commands/`       | Claude Code slash commands — 13 commands mirroring OpenCode set                                                 |

## Commands

| Command           | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `/triage`         | Phase 0: classify request → hotfix/mode-c/epic |
| `/hotfix`         | Level 1: fast-track single file fix            |
| `/mode-c`         | Level 2: full Mode C pipeline                  |
| `/researcher-a`   | Routes & navigation                            |
| `/researcher-b`   | Components & selectors                         |
| `/researcher-c`   | Validators & error states                      |
| `/researcher-d`   | POM patterns                                   |
| `/builder-pom`    | Create/update POM files                        |
| `/builder-spec`   | Create/update test specs                       |
| `/reflector-pom`  | Critique POM structure                         |
| `/reflector-spec` | Critique spec quality                          |
| `/qa-gatekeeper`  | Run tests, verdict                             |
| `/review`         | Full audit (Stage 1 + Stage 2)                 |

## Conflict Prevention

| File Pattern                     | Strategy             | Writers                           |
| -------------------------------- | -------------------- | --------------------------------- |
| `.agent/state.json`              | Single writer (Lead) | Lead only                         |
| `.agent/plans/todos/tc-*.md`     | Per-TC files         | One agent per TC file             |
| `.agent/memory/entities/*.json`  | Per-entity files     | One creator + assigned annotators |
| `.agent/tasks/{agent}-{ts}.json` | One file per agent   | One agent per file                |
| `.agent/reports/summary-*.md`    | Single writer (Lead) | Lead only                         |

**No concurrent writes to same file.** Per-TC and per-entity splitting prevents last-writer-wins data loss.

## Directory Lifecycle

| Directory         | When Populated                                 |
| ----------------- | ---------------------------------------------- |
| `.agent/plans/`   | Lead writes before dispatching                 |
| `.agent/tasks/`   | Sub-agents write during pipeline execution     |
| `.agent/reports/` | Lead generates after verification              |
| `.agent/memory/`  | Cross-session knowledge (entities + relations) |
| `.agent/hooks/`   | Pre/post validation (always present)           |

Empty directories between sessions are expected — they are populated during active task execution.

## Parallel Execution Model

This codebase implements **Mode C: Maximum Parallelism** — the optimal mode for reducing wall-clock time.

### What Runs in Parallel

| Phase          | Parallel Tasks                                                        |
| -------------- | --------------------------------------------------------------------- |
| Research       | 4× Researcher sub-agents discover routes, components, validators, POM |
| Planning       | Lead aggregates research → writes plan + todos (sequential)           |
| Implementation | Builder writes code + Lead updates todos + Memory writes              |
| Verification   | QA Gatekeeper runs tests + Lead drafts summary + Reflector critiques  |
| Teardown       | Lead writes final state + persists memory relations (sequential)      |

### What Stays Sequential

| Task                            | Why                           |
| ------------------------------- | ----------------------------- |
| Planning before Researcher      | Needs findings to write plan  |
| Builder before Plan approval    | Needs approved plan           |
| Reflector before Builder revise | Needs output to critique      |
| state.json merge                | Written once, end of pipeline |

### Real-Time Documentation

Documentation (todos, state snapshots, memory) updates in REAL-TIME during execution, NOT batched at end.

```text
Research:   Researchers flip to [/] → flip to [x] with evidence
Planning:   Lead writes todos/tc-*.md [ ] (after research)
Build:      Builder writes [x] with file:line per TC → Memory observations updated
Verify:     QA adds test_run:pass/fail → Memory test results updated
Teardown:   Lead writes final state → Memory relations created
```

### Memory Writes (Parallel with Sub-Agents)

Memory writes run parallel with sub-agents. Each agent owns its domain:

| Agent         | Memory Domain                              | File Pattern                            |
| ------------- | ------------------------------------------ | --------------------------------------- |
| Researcher    | Component selectors, routes, API endpoints | `.agent/memory/entities/{entity}.json`  |
| Builder       | Implementation observations                | `.agent/memory/entities/{entity}.json`  |
| Reflector     | Critique annotations                       | `.agent/memory/entities/{entity}.json`  |
| QA Gatekeeper | Test results                               | `.agent/memory/entities/{entity}.json`  |
| Lead          | Relations + final persistence              | `.agent/memory/entities/relations.json` |

### State Writes

| State                                  | When                           | Who                           |
| -------------------------------------- | ------------------------------ | ----------------------------- |
| `.agent/state.json`                    | ONCE at teardown               | Lead only                     |
| `.agent/state/pipeline-{ts}.json`      | Snapshot during implementation | Lead only (optional)          |
| `.agent/tasks/{agent}-{ts}.json`       | Per agent run                  | Each agent                    |
| `.agent/memory/entities/{entity}.json` | Real-time per phase            | Creator + assigned annotators |
| `.agent/plans/todos/tc-{id}.md`        | Real-time per phase            | Assigned agent per TC         |

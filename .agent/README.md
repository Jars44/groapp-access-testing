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
1. READ .agent/README.md     — establish context
2. READ AGENTS.md            — project orchestration rules
3. READ CLAUDE.md            — AI behavior & output rules
4. READ task-specific docs   — constitution, workflows, personas
5. EXECUTE task              — following docs/workflows/ SOP
6. WRITE result              — update .agent/state.json
7. GENERATE summary          — .agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md
8. CLEANUP plan              — ask user before deleting .agent/plans/test-plan-{feature}.md
```

## 3-Layer Context Architecture

| Layer         | Scope         | Files                                                                             |
| ------------- | ------------- | --------------------------------------------------------------------------------- |
| 1 — Always    | Every session | `AGENTS.md`, `CLAUDE.md`, this file                                               |
| 2 — On-demand | Task match    | `skills/*/SKILL.md`, `docs/constitution/*`, `docs/workflows/*`, `docs/personas/*` |
| 3 — Tools     | Tool access   | `docs/reference/*`, `.agent/templates/*`, `.agent/mcp.json`                       |

## File Index

| Location               | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `.agent/README.md`     | This file — entrypoint                                                          |
| `.agent/mcp.json`      | Persona-scoped MCP tool schema                                                  |
| `.agent/settings.json` | Runtime config, persona configs, retry/validation                               |
| `.agent/state.json`    | Pipeline state machine (v2) with errors/retries                                 |
| `.agent/plans/`        | **Temporary** test plans — `test-plan-{feature}.md` (prompt user before delete) |
| `.agent/reports/`      | **Permanent** summaries — `summary-{feature}-{YYYYMMDD}[-{seq}].md`             |
| `.agent/templates/`    | Dispatch prompts + test-plan-template.md                                        |
| `.agent/hooks/`        | pre-flight.sh, validate-state.sh                                                |
| `.agent/memory/`       | Cross-session knowledge graph                                                   |
| `.agent/tasks/`        | Active task tracking                                                            |

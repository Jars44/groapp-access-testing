# AGENTS.md — Cross-Tool Discovery

> This file is discovered by OpenCode, Claude Code, OpenClaw, Antigravity, and other AI coding tools.

## Entry Sequence (All Tools)

```text
1. READ AGENTS.md            — this file, orchestration entry point
2. READ CLAUDE.md            — AI behavior & output rules
3. READ .agent/README.md     — agent metadata center
4. READ task-specific docs   — constitution, workflows, personas, skills
5. EXECUTE task              — following SOP in docs/workflows/
6. WRITE result              — update .agent/state.json
7. RUN quality gate          — docs/constitution/004-quality-gate.md
```

## Multi-Agent Orchestration

This project implements **Mode C: Maximum Parallelism** for reducing wall-clock time.

Read `docs/workflows/002-multi-agent-orchestration.md` for full pipeline.

## Tool Discovery Map

| Tool            | Config File                      | How to Load                       |
| --------------- | -------------------------------- | --------------------------------- |
| **OpenCode**    | `opencode.json` + `.opencode/`   | Auto-discovered from project root |
| **Claude Code** | `CLAUDE.md` + `.claude/`         | Read from project root            |
| **OpenClaw**    | `AGENTS.md`                      | Read from project root            |
| **Antigravity** | `antigravity.json` + `AGENTS.md` | Read from project root            |
| **Hermes**      | `AGENTS.md`                      | Read from project root            |

## Directory Architecture

```text
project/
├── AGENTS.md                    ← Entry point for all tools
├── CLAUDE.md                    ← AI behavior rules (Claude Code, others)
├── opencode.json               ← OpenCode config (agents, commands, permissions)
├── antigravity.json            ← Antigravity config (agents, goals)
├── .opencode/                  ← OpenCode custom agents + commands
│   ├── agents/
│   │   ├── lead.md             ← Orchestrator (primary agent)
│   │   ├── researcher.md       ← Code explorer (subagent)
│   │   ├── builder.md          ← Test implementor (subagent)
│   │   ├── reflector.md        ← Self-critique (subagent)
│   │   └── qa-gatekeeper.md    ← Test runner (subagent)
│   ├── commands/
│   └── skills/
├── .agent/                     ← Universal metadata center
│   ├── README.md               ← Master entrypoint
│   ├── state.json              ← Pipeline state machine
│   ├── settings.json           ← Runtime config, persona tool restrictions
│   ├── memory/                 ← Cross-session knowledge graph
│   ├── plans/                  ← Test plans + per-TC todos
│   ├── tasks/                  ← Per-agent output files
│   ├── reports/                ← Implementation summaries
│   ├── templates/              ← Dispatch prompts + test-plan template
│   └── hooks/                  ← Pre/post validation scripts
├── docs/
│   ├── constitution/           ← Non-negotiable rules (001-005)
│   ├── workflows/              ← SOPs (001-003)
│   ├── personas/               ← Agent role definitions
│   └── reference/              ← Tech stack, directory, test data
└── skills/                     ← Specialized skills
    ├── dispatching-e2e-tests/
    ├── auditing-selector-quality/
    └── memory-management/
```

## Agent Personas

| Persona           | File                                 | Role                            |
| ----------------- | ------------------------------------ | ------------------------------- |
| Lead Orchestrator | `docs/personas/orchestrator-lead.md` | Planning, delegation, teardown  |
| Researcher        | `docs/personas/researcher.md`        | Read-only code exploration      |
| Builder           | `docs/personas/builder.md`           | POM + spec implementation       |
| Reflector         | `docs/personas/reflector.md`         | Self-critique before QA         |
| QA Gatekeeper     | `docs/personas/qa-gatekeeper.md`     | Test execution, flakiness check |

## Conflict Prevention

| File                                   | Strategy             | Why                                     |
| -------------------------------------- | -------------------- | --------------------------------------- |
| `.agent/plans/todos/tc-*.md`           | Per-TC files         | One agent per TC = no concurrent writes |
| `.agent/memory/entities/{entity}.json` | Per-entity files     | One agent owns entity = no corruption   |
| `.agent/state.json`                    | Single writer (Lead) | Written once at teardown                |
| `.agent/tasks/{agent}-*.json`          | One file per agent   | Isolated outputs                        |

## Design Patterns

This project implements all 7 industry-standard agent patterns:

1. **Reflection** → `docs/personas/reflector.md`
2. **ReAct** → `docs/personas/researcher.md`
3. **Plan-and-Execute** → `docs/workflows/001-test-task-sop.md`
4. **Tool Use** → `.agent/mcp.json` + `.agent/settings.json`
5. **Multi-Agent Collaboration** → `docs/workflows/002-multi-agent-orchestration.md` Mode C
6. **Memory Management** → `.agent/memory/` + `skills/memory-management/SKILL.md`
7. **Human-in-the-Loop** → `docs/personas/qa-gatekeeper.md`

Read `docs/constitution/005-design-patterns.md` for full mapping.

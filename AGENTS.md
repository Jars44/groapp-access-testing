# AGENTS.md — Project Orchestration & Agent Governance

GroApp Access E2E test suite. Playwright + POM + React/TypeScript.

**Commands:** `npx playwright test` · `npx playwright test --grep "name"` · `npx playwright test --reporter=list`

## Entry Sequence

1. `.agent/README.md` — universal metadata
2. `AGENTS.md` (this file) — orchestration
3. `CLAUDE.md` — AI behavior rules

## Task Execution

1. Read relevant `docs/constitution/`, `docs/workflows/`, `docs/reference/`
2. Identify persona from `docs/personas/`
3. Load matching skill from `skills/`
4. Execute task following SOP in `docs/workflows/`
5. Write result to `.agent/state.json`
6. Run quality gate (`docs/constitution/004-quality-gate.md`)

## Cross-Reference

| Topic                   | Path                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| Non-negotiables         | `docs/constitution/002-coding-standards.md`                            |
| POM architecture        | `docs/constitution/001-pom-architecture.md`                            |
| Anti-hallucination      | `docs/constitution/003-anti-hallucination.md`                          |
| Quality gate            | `docs/constitution/004-quality-gate.md`                                |
| Tech stack              | `docs/reference/tech-stack.md`                                         |
| Directory structure     | `docs/reference/directory-structure.md`                                |
| Test data               | `docs/reference/test-data.md`                                          |
| SOP: test task          | `docs/workflows/001-test-task-sop.md`                                  |
| SOP: multi-agent        | `docs/workflows/002-multi-agent-orchestration.md`                      |
| SOP: bugfix             | `docs/workflows/003-bugfix-sop.md`                                     |
| Persona: senior QA      | `docs/personas/senior-qa-engineer.md`                                  |
| Persona: lead architect | `docs/personas/orchestrator-lead.md`                                   |
| Persona: researcher     | `docs/personas/researcher.md`                                          |
| Persona: builder        | `docs/personas/builder.md`                                             |
| Persona: reviewer       | `docs/personas/reviewer.md`                                            |
| Persona: QA gatekeeper  | `docs/personas/qa-gatekeeper.md`                                       |
| Skill: E2E tests        | `skills/dispatching-e2e-tests/SKILL.md`                                |
| Skill: selectors        | `skills/auditing-selector-quality/SKILL.md`                            |
| Template: test-plan     | `.agent/templates/test-plan-template.md`                               |
| Template: summary       | `docs/personas/orchestrator-lead.md#implementation-summary-generation` |
| Hook: pre-flight        | `.agent/hooks/pre-flight.sh`                                           |
| Hook: validate-state    | `.agent/hooks/validate-state.sh`                                       |

# OpenCode Skills Index

> Specialized skills for Playwright E2E testing and agent orchestration.

## Available Skills

| Skill                     | Location                                    | Purpose                             |
| ------------------------- | ------------------------------------------- | ----------------------------------- |
| Memory Management         | `skills/memory-management/SKILL.md`         | Cross-session knowledge persistence |
| Dispatching E2E Tests     | `skills/dispatching-e2e-tests/SKILL.md`     | Test dispatching patterns           |
| Auditing Selector Quality | `skills/auditing-selector-quality/SKILL.md` | Selector quality verification       |

## Usage

Load a skill when the task matches its description:

```bash
@skill memory-management
@skill dispatching-e2e-tests
```

## Skill Descriptions

### Memory Management

**Trigger:** Task involves knowledge that persists across sessions.

**What it does:**

- Cross-session context via `.agent/memory/`
- Entity/relation schema for selectors, routes, APIs
- 4 memory types: in-context, external, episodic, procedural

### Dispatching E2E Tests

**Trigger:** Running multiple test agents in parallel.

**What it does:**

- Test dispatch patterns
- Parallel execution coordination
- Handoff protocols

### Auditing Selector Quality

**Trigger:** Verifying selectors are stable and accessible.

**What it does:**

- testid > role > label > placeholder > text > css priority
- Accessibility verification
- Stability scoring

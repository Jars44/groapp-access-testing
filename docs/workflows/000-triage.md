# SOP 000 — Phase 0: Triage & Dynamic Routing

> **CRITICAL:** This is the FIRST step for ANY user request. Skip all other phases until triage is complete.

## Decision Tree

```text
USER REQUEST RECEIVED
│
├── Analyze complexity:
│   ├── Single file target (one .spec.ts or one POM file)?
│   ├── TC count estimate: < 3 | 3-50 | > 50?
│   └── Scope: isolated fix | feature addition | module overhaul?
│
├── LEVEL 1 — Hotfix (Micro-Task)
│   Trigger: Single selector fix, tiny refactor, < 3 TCs, one file
│   → Execute Hotfix Workflow (see below)
│
├── LEVEL 2 — Standard Feature (Mode C)
│   Trigger: Normal feature creation, 3-50 TCs
│   → Execute Mode C Pipeline (SOP 002)
│
└── LEVEL 3 — Epic (DEFERRED)
    Trigger: > 50 TCs, complete module overhaul
    → Deferred. Implement in future sprint.
```

## Level Definitions

| Level | Name     | TC Count | Trigger Conditions                                          | Time Budget | Complexity | AIEffort      |
| ----- | -------- | -------- | ----------------------------------------------------------- | ----------- | ---------- | ------------- |
| 1     | Hotfix   | < 3      | Single file edit, selector fix, tiny refactor, isolated bug | < 15 min    | Simple     | Minimal       |
| 2     | Standard | 3–50     | New feature, new page, form validation flow                 | 30-90 min   | Moderate   | Full pipeline |
| 3     | Epic     | > 50     | Module overhaul, massive injection, full suite rewrite      | TBD         | High       | Deferred      |

**Decision heuristics:**

- If user mentions a specific file path → likely L1
- If user says "fix" or "update" singular element → likely L1
- If user says "create tests for [feature]" → likely L2
- If user says "all tests for [module]" or "migrate [entire thing]" → could be L3

## 4-Researcher Mapping (Mode C)

Lead dispatches 4 researchers CONCURRENTLY in a single message with 4 separate `task()` calls (one per variant). They run in parallel — wall-time = single longest call. Each call is independent (different domain, different output file), so there are no race conditions between calls.

| Agent                       | Letter | Domain                         | Scopes                                                                    | Output File                                           |
| --------------------------- | ------ | ------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| **researcher-routes**       | A      | Page Routes & Navigation       | Route paths, URL patterns, navigation flow, guards                        | `researcher-routes-{YYYYMMDDHHMMSS}-{seq}.json`       |
| **researcher-components**   | B      | UI Components & Selectors      | Component JSX, selectors, testids, aria-labels, CSS classes               | `researcher-components-{YYYYMMDDHHMMSS}-{seq}.json`   |
| **researcher-validators**   | C      | Form Validation & Error States | Validation rules, error messages, form fields, input constraints          | `researcher-validators-{YYYYMMDDHHMMSS}-{seq}.json`   |
| **researcher-pom-patterns** | D      | Existing POM Patterns (DRY)    | BasePage classes, POM naming conventions, existing selectors in test repo | `researcher-pom-patterns-{YYYYMMDDHHMMSS}-{seq}.json` |

**Why 4 agents (not 3):** Granularity reduces context per agent. Each researcher handles one domain, keeping prompts focused and outputs smaller. The 4-agent model fits better within context limits than a single mega-researcher.

**Why validators ≠ routes:** Validation rules are in component JSX/forms, not in route files. Separating them ensures validation errors get proper scrutiny without noise from route definitions.

## Timestamp Standards

| Context              | Format             | Example                | Where Used                              |
| -------------------- | ------------------ | ---------------------- | --------------------------------------- |
| **Human-readable**   | `dd-mm-yyyy:hh:mm` | `09-07-2026:14:30`     | Plans, summaries, todos (user-facing)   |
| **Machine/internal** | `YYYYMMDDHHMMSS`   | `20260709143052`       | Agent output filenames, task JSON files |
| **JSON metadata**    | ISO 8601           | `2026-07-09T14:30:52Z` | `timestamp` fields inside JSON files    |

**Rationale:**

- `dd-mm-yyyy:hh:mm` — Indonesian locale preference, no colons in filenames
- `YYYYMMDDHHMMSS` — OS-safe, lexicographically sortable, no special chars
- ISO 8601 — Standard JSON format, timezone-aware, machine parseable

## Hotfix Workflow (Level 1)

```text
1. TRIAGE: Confirm < 3 TCs, single file target
2. DISPATCH: Single Builder agent with direct file path
3. BUILD: Open file, make minimal fix
4. QA: Run .agent/hooks/test.sh test --grep "<target>" --reporter=list
5. OUTPUT: Brief status message to user
   Example: "Fixed selector in login.spec.ts:42. QA: 1/1 pass."
```

**Rules:**

- NO implementation-plan.md (skip planning phase)
- NO per-TC todo files (overhead not justified)
- NO mandatory halt (user requested direct fix)
- Still run QA Gatekeeper before reporting done
- Still append to `.agent/state.json` errors if test fails

## Standard Mode C Workflow (Level 2)

See SOP 002 — Multi-Agent Orchestration for full pipeline.

## Routing Table

| User Input Pattern               | Likely Level    | Action                 |
| -------------------------------- | --------------- | ---------------------- |
| "fix selector X in file Y"       | Hotfix          | Direct Builder         |
| "update login button text"       | Hotfix          | Direct Builder         |
| "refactor POM for X"             | Hotfix          | Direct Builder         |
| "create tests for [feature]"     | Standard        | Mode C pipeline        |
| "test the [page/component]"      | Standard        | Mode C pipeline        |
| "add validation tests for X"     | Standard        | Mode C pipeline        |
| "all tests for [module/feature]" | Epic (deferred) | Ask user to scope down |

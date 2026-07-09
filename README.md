# GroApp Access — E2E Test Suite

Playwright + Page Object Model E2E tests for [GroApp Access](https://groapp.id), an Indonesian business management platform providing user access control, company management, role-based permissions, accounting integration, and multi-tenant workspace administration using React 19 SPA with Firebase auth, Zustand state, and a Go/Gin backend.

## Quick Start

```bash
# Prerequisites: Node.js 20+, app source cloned as sibling
git clone <this-repo> groapp-access-testing
cd groapp-access-testing
cp .env.example .env        # edit credentials
npm install
npx playwright install --with-deps
npx playwright test --reporter=list
```

**Workspace layout (sibling repos):**

```text
parent/
├── groapp-access/             # App source (tested project)
└── groapp-access-testing/     # Test framework (this repo)
```

## Available Commands

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm test`              | Run all tests (headless, all browsers) |
| `npm run test:list`     | Run all tests, list reporter           |
| `npm run test:ui`       | Playwright UI mode                     |
| `npm run test:debug`    | Debug mode with inspector              |
| `npm run test:headed`   | Run with browser visible               |
| `npm run test:chromium` | Chromium only (fastest)                |
| `npm run typecheck`     | TypeScript check (no emit)             |

Run a single test: `npx playwright test --grep "test name" --reporter=list`

## Test Architecture

### Page Object Model

Every route has a dedicated Page Object class extending `BasePage`. Selectors are readonly properties, actions return `this` or the target page. No assertions in POM files.

```text
src/tests/pages/
├── base.page.ts                # Shared: goto, waitForLoad, toast, modal, navbar
├── components/                 # Reusable UI component POMs
│   ├── modal.component.ts
│   ├── toast.component.ts
│   ├── table.component.ts
│   ├── navbar.component.ts
│   └── ...
├── auth/                       # login.page.ts, register.page.ts
├── company/                    # company-list.page.ts, company-detail.page.ts
├── dashboard/                  # dashboard.page.ts
├── notification/               # notification-list.page.ts
├── onboarding/                 # onboarding.page.ts
├── profile/                    # profile.page.ts
├── user/                       # user-list.page.ts
└── workspace/                  # workspace-list.page.ts
```

### Test Data Factories

```text
src/tests/data/
├── constants.ts                # Shared env vars: TEST_USER_EMAIL, TEST_USER_PASSWORD
├── auth.data.ts                # Login/register payloads
├── company.data.ts
├── workspace.data.ts
├── user.data.ts
└── unit.data.ts
```

### Fixtures

`src/tests/fixtures/auth.fixture.ts` — authenticated browser context with stored session.

### Selector Priority

`data-testid` > `getByRole` > `getByLabel` > CSS > never XPath.

## Config

| Variable                   | Default             | Purpose                                               |
| -------------------------- | ------------------- | ----------------------------------------------------- |
| `GROAPP_ACCESS_SOURCE_DIR` | `../groapp-access`  | Path to app source (used for `webServer.command`)     |
| `TEST_USER_EMAIL`          | `REDACTED_EMAIL`    | Auth credentials                                      |
| `TEST_USER_PASSWORD`       | `REDACTED_PASSWORD` | Auth credentials                                      |
| `CI`                       | —                   | Enables retries, single worker, disables server reuse |

Set via `.env` or environment variables.

## Multi-Agent QA System

This project includes a structured multi-agent workflow for AI-assisted test development. The system is organized across three layers:

### 1. Agent Infrastructure (`.agent/`)

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `README.md`               | Entrypoint — workspace setup, agent workflow, file index |
| `settings.json`           | Runtime config, persona tool ACLs, retry policies        |
| `state.json`              | Pipeline state machine with error recovery               |
| `hooks/pre-flight.sh`     | Environment validation                                   |
| `hooks/validate-state.sh` | State consistency checks                                 |

### 2. Rules & Workflows (`docs/`)

- **Constitution** — non-negotiable rules: POM architecture, coding standards, anti-hallucination guardrails, two-stage quality gate
- **Personas** — 6 roles: lead architect, researcher, builder, reviewer, QA gatekeeper, senior QA
- **Workflows** — SOPs for test task execution, multi-agent orchestration (parallel + pipeline), bugfix resolution

### 3. Skills (`skills/`)

- **dispatching-e2e-tests** — SOP for delegating test implementation to subagents
- **auditing-selector-quality** — SOP for reviewing selector robustness

### Two-Stage Review

Every implementation goes through:

1. **Stage 1 — Spec Compliance** (blocking): every AC tested, no scope drift, all plan items marked with evidence
2. **Stage 2 — Code Quality** (non-blocking): POM structure, spec hygiene, no flakiness patterns

### Artifact Lifecycle

| Artifact  | Path                                                     | Lifecycle                                          |
| --------- | -------------------------------------------------------- | -------------------------------------------------- |
| Test plan | `.agent/plans/test-plan-{feature}.md`                    | Temporary — user prompted to keep/delete           |
| Summary   | `.agent/reports/summary-{feature}-{YYYYMMDD}[-{seq}].md` | Permanent — seq auto-increments on same-day reruns |

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Test runner   | Playwright ^1.61                     |
| Language      | TypeScript ^6.0                      |
| App framework | React 19 + Vite 8                    |
| App backend   | Go/Gin + MariaDB + Firebase Auth     |
| Unit testing  | Vitest ^3.2 + @testing-library/react |

## Development

```bash
# TypeScript check
npm run typecheck

# Run full test suite
npm test

# Run with visible browser
npm run test:headed -- --grep "register"

# Debug a specific test
npx playwright test --grep "register" --debug
```

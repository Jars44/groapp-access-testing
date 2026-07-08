---
name: dispatching-e2e-tests
description: Use when running, debugging, or writing Playwright E2E tests for this project. Covers test commands, POM architecture, selector strategy, and common patterns.
---

# Dispatching E2E Tests

## Commands

| Command                                                  | Purpose                     |
| -------------------------------------------------------- | --------------------------- |
| `npx playwright test`                                    | Full suite                  |
| `npx playwright test --grep "test name" --reporter=list` | Single test                 |
| `npx playwright test --reporter=list`                    | Full suite with list output |

## Test Architecture

- **Page Object Model** — Every spec uses POM. No `page.locator()` in spec files.
- **BasePage** → Component POMs → Feature Page Objects
- **Data factories** in `data/` — never hardcoded test data
- **Fixtures** in `fixtures/` — auth setup, pre-created entities

## Selector Priority

`getByTestId` > `getByRole` > `getByLabel` > `getByText` > `locator(css)` > never XPath

## Anti-Patterns

- No `page.waitFor(ms)` — use auto-wait, `waitForResponse`, `waitForURL`, `toPass()`
- No shared state between tests — each test is independent
- No assertions in page objects — only in spec files

## Verification

Run quality gate before claiming completion:

- `docs/constitution/004-quality-gate.md`

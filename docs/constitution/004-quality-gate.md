# Constitution 004 — Quality Gate

Source: AGENTS.md §10

Two-stage review. Stage 1 runs first — if it fails, Stage 2 is skipped. Blocking issues must be resolved before proceeding.

## Stage 1: Spec Compliance (Blocking)

Verify code matches plan. Every requirement covered. No scope drift.

- [ ] Re-read `.agent/plans/test-plan-{feature}.md` — scope confirmed
- [ ] Every AC / user story point has a corresponding test
- [ ] No tests outside agreed scope (gold-plating guard)
- [ ] All test-plan.md `[ ]` marked `[x]` with file:line evidence
- [ ] Evidence points to real code (spec file + line exists)
- [ ] Test names describe intent matching requirement
- [ ] No leftover TODO or placeholder tests

**If any item fails → BLOCK. Return to Builder. Do not proceed to Stage 2.**

## Stage 2: Code Quality (Non-Blocking)

### Test Changes

- [ ] `npx playwright test --reporter=list` — all pass
- [ ] No new flaky tests (run 3x)
- [ ] POM structure follows constitution 001
- [ ] No hardcoded timeouts (`page.waitFor(ms)`)
- [ ] No inline locators in spec files
- [ ] All tests have assertions
- [ ] Test data from factories/constants only
- [ ] Selectors follow priority strategy
- [ ] Tests are independent (any order)
- [ ] `test.describe.configure({ mode: 'parallel' })` for independent tests

### POM Changes

- [ ] Page Object extends BasePage
- [ ] All selectors = readonly class properties
- [ ] Action methods return `this` or target page
- [ ] No assertions in page objects
- [ ] Component POMs used for shared UI

### Security

- [ ] No test credentials in spec files (use env/constants)
- [ ] No API keys or secrets in test code
- [ ] No production URLs in test config

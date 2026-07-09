# SOP 001 — Test Task Execution

> **Workspace setup:** App source in `../groapp-access/` (configurable via `GROAPP_ACCESS_SOURCE_DIR` env or `.agent/settings.json` → `sourceDir`).

## Phase 1: Requirement & Code Discovery

**STEP 1: UNDERSTAND business needs** (NEW)

- Read User Stories, Acceptance Criteria (AC), or PR descriptions
- Identify the core business value and expected user flow
- Define out-of-scope scenarios

**STEP 2: EXPLORE target feature & technical context**

- Read page/component source in `{sourceDir}/src/features/{feature}/`
- Identify URLs, buttons, forms, states from component JSX
- Trace data flow: page → state → API call
- Read existing test files in `src/tests/specs/` to ensure no overlap

## Phase 2: Stateful Planning

**STEP 3: WRITE test plan artifact** (UPDATED)

- Create `implementation-plan-{feature}.md` in the working directory
- Document test scenarios (happy path, error, edge case)
- Identify test data & environment requirements
- Create a strict Markdown To-Do list `[ ]` for each test case

## Phase 3: Implement (POM & Specs)

**STEP 4: CREATE/UPDATE POM files**

- BasePage → Component POMs → Feature Page Objects
- All selectors = class properties (no hardcoded strings in tests)
- Action methods return UI states (no assertions in POM)

**STEP 5: CREATE test spec**

- Translate To-Do list from `implementation-plan.md` into `test.describe` blocks
- Arrange → Act → Assert logic
- Descriptive test names (should...)
- Check off `[x]` in `implementation-plan-{feature}.md` after writing each test

## Phase 3b: Update Selector Cache (NEW)

**STEP 5b: UPDATE selector cache if POM changed**

- If POM added/updated selectors, update `.agent/selector-cache.json`
- Run `npx playwright test --grep "smoke"` to validate cached selectors

## Phase 4: Review & Verify

**STEP 6: TWO-STAGE REVIEW** (NEW — replaces single-pass review)

**Stage 1 — Spec Compliance (Blocking):**

- Re-read implementation-plan.md — confirm scope
- Every AC has a test? Every test maps to an AC?
- No tests outside scope? (gold-plating guard)
- Check off each item in constitution 004 → Stage 1
- **If any fail → BLOCK. Return to implementation phase.**

**Stage 2 — Code Quality (Non-Blocking):**

- Audit POM structure (extends BasePage? readonly selectors?)
- Audit spec quality (no inline locators? all assertions?)
- Check off each item in constitution 004 → Stage 2
- Report findings — non-blocking, fix before final merge

**STEP 7: RUN AND VERIFY**

- `npx playwright test --grep "test name" --reporter=list`
- Fix failures: selector issues, timing, test data
- Check flakiness: run 3x

**STEP 8: QUALITY GATE**

- `npx playwright test` — all pass
- POM strictly follows architectural separation
- No hardcoded timeouts (`page.waitForTimeout`)

## Phase 5: Documentation & Teardown (NEW)

**STEP 9: UPDATE documentation and cleanup**

- Update `.agent/state.json` with completed status and coverage notes
- Delete the temporary `implementation-plan-{feature}.md` file
- Generate a short markdown summary of the test coverage achieved

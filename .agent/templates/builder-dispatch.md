# Builder Dispatch Prompt

You are a **Builder** — implement POM files and spec files. Check off todos as you go.

## Pre-flight

1. Read `.agent/state.json` — confirm phase=exploration, artifacts.research_findings populated
2. Read `test-plan.md` — todo list per test case
3. List `src/tests/specs/` — check for overlap with existing tests
4. Run `.agent/hooks/validate-state.sh implementation`

## Task

Implement the following based on the researcher's findings:

1. **Test data factories** → `src/tests/data/{feature}.data.ts` (if needed)
2. **Page Objects** → `src/tests/pages/{feature}/{file}.page.ts`
3. **Component POMs** → `src/tests/pages/components/{component}.component.ts` (if reusable)
4. **Spec files** → `src/tests/specs/{feature}/{file}.spec.ts`
5. **Fixtures** → `src/tests/fixtures/{fixture}.fixture.ts` (if needed)

## Rules

- Every selector = `readonly` class property. No inline locators.
- Action methods return `this` or target page object for chaining.
- No assertions in page objects. Only specs assert.
- Specs follow Arrange → Act → Assert pattern.
- Every test has at least one assertion.
- No `page.waitFor(ms)` — use auto-waiting, `waitForResponse`, `waitForURL`.
- No hardcoded test data — use factories from `src/tests/data/`.
- Use `test.describe('Feature Name', ...)` for grouping.
- Test names: `'should [behavior] when [condition]'`.
- Update test-plan.md: mark `[ ]` → `[x]` after each test case implemented.

## State Update

After completing all files, update `.agent/state.json`:

```json
{
  "pipeline": { "phase": "implementation", "status": "completed" },
  "artifacts": {
    "pom_files": ["paths to created page objects"],
    "spec_files": ["paths to created specs"],
    "data_factories": ["paths to created data files"],
    "fixtures": ["paths to created fixtures"]
  }
}
```

## Self-Check (pre-handoff)

- [ ] All test-plan.md todos marked [x]
- [ ] No TODO/FIXME comments in code
- [ ] Files exist on disk at expected paths
- [ ] state.json updated with artifact paths

## Error Recovery

| Scenario                | Action                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| File already exists     | Read it, update incrementally, don't overwrite blindly                         |
| TypeScript import error | Check imports match project convention                                         |
| Researcher data missing | Re-read state.json, report to Lead if empty                                    |
| State validation fails  | Run `.agent/hooks/validate-state.sh implementation` to identify missing fields |

## Researcher Findings

```text
{paste researcher output here}
```

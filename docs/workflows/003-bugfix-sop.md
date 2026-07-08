# SOP 003 — Bugfix / Test Failure Resolution

> Systematic debugging for failing or flaky tests.

## Workflow

```text
1. REPRODUCE
   ├── Run failing test: npx playwright test --grep "test name"
   └── Capture error output, screenshot, trace

2. DIAGNOSE
   ├── Read test-results/*/error-context.md if available
   ├── Check selector: does element exist? correct role?
   ├── Check timing: auto-wait sufficient? response slow?
   ├── Check state: test data unique? no cross-test pollution?
   └── Check component: has component changed? new rendering?

3. FIX
   ├── Selector wrong? → update POM (consult researcher output)
   ├── Timing flaky? → use waitForResponse/waitForURL/toPass()
   ├── State pollution? → use unique data per test
   └── Component changed? → read new source, update POM

4. VERIFY
   ├── Run test 3x — all pass?
   ├── Run full suite — no regression?
   └── Update .agent/state.json
```

## Common Root Causes

| Symptom                                  | Likely Cause               | Fix                                 |
| ---------------------------------------- | -------------------------- | ----------------------------------- |
| `getByRole('button')` fails              | Element has different role | Use correct role (e.g., `radio`)    |
| `waitForURL` times out                   | Navigation not triggered   | Check click/submit performed        |
| `toBeVisible` fails                      | Element not rendered       | Check condition, loading state      |
| Test passes in isolation, fails in suite | Shared state               | Unique data per test                |
| Intermittent failure                     | Race condition             | Use `toPass()` or `waitForResponse` |

---
description: Run full test suite and generate report
---

## MANDATORY: System Protocol

> **STOP.** Read `.agent/SYSTEM_PROMPT.md` NOW. This entire session follows that protocol.
> Phase 0 Triage is non-negotiable. Test execution goes through `.agent/hooks/test.sh`.
> If this file conflicts with SYSTEM_PROMPT.md, SYSTEM_PROMPT.md wins.

# Command: test

Run the complete Playwright test suite for GroApp Access.

## Steps

1. Execute `.agent/hooks/test.sh test --reporter=list`
2. Check for failures
3. If failures found, provide detailed error summary
4. Generate test report with pass/fail counts

## Output

- Total tests run
- Passed count
- Failed count (with error details)
- Skipped count
- Execution time

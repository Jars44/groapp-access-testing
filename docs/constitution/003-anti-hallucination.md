# Constitution 003 — Anti-Hallucination Guardrails

Source: AGENTS.md §8

## Code Generation Rules

| #   | Rule                                   | How                                                 |
| --- | -------------------------------------- | --------------------------------------------------- |
| A1  | Never write test for nonexistent route | Verify in `routes.tsx`                              |
| A2  | Never invent selectors                 | Read component source for testid/role/label         |
| A3  | Never guess API endpoints              | Verify in feature's `infrastructure/api/`           |
| A4  | Never invent test data requirements    | Read domain types and validation rules              |
| A5  | Never assume component behavior        | Read component for conditional rendering            |
| A6  | Never skip page objects                | No `page.locator()` in spec files                   |
| A7  | Never invent URL patterns              | Read route definitions                              |
| A8  | Never guess error messages             | Read component for error rendering                  |
| A9  | Never invent form validation rules     | Read form validator/schema files                    |
| A10 | Never use patterns from other projects | This app uses Either monad, DataState, interruption |

## Verification Checklist

Before outputting ANY test code:

- [ ] Target page/component exists in `src/features/`
- [ ] Route path matches `routes.tsx`
- [ ] Selectors match actual component rendering
- [ ] API endpoints match feature's infrastructure files
- [ ] Test data matches domain validation rules
- [ ] All imports exist in `package.json`
- [ ] POM follows constitution 001
- [ ] Spec has at least one assertion
- [ ] No hardcoded timeouts
- [ ] No inline locators in spec files
- [ ] Test is independent

## When Uncertain

| Situation               | Action                               |
| ----------------------- | ------------------------------------ |
| Unknown component       | Read component source file           |
| Unknown route           | Read `routes.tsx`                    |
| Unknown API             | Read infrastructure API files        |
| Unknown form validation | Read form validator/schema           |
| Unknown error state     | Read component JSX                   |
| Unknown selector        | Read component for testid/role/label |

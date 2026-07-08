# Constitution 002 — Coding Standards

Source: AGENTS.md §6

## Naming Conventions

| Context             | Convention                  | Example                                   |
| ------------------- | --------------------------- | ----------------------------------------- |
| Test spec           | kebab-case, `.spec.ts`      | `login-manual.spec.ts`                    |
| Page Object         | kebab-case, `.page.ts`      | `company-list.page.ts`                    |
| Component POM       | kebab-case, `.component.ts` | `toast.component.ts`                      |
| Test data           | kebab-case, `.data.ts`      | `company.data.ts`                         |
| Fixture             | kebab-case, `.fixture.ts`   | `auth.fixture.ts`                         |
| Describe block      | PascalCase                  | `test.describe('Company List', ...)`      |
| Test name           | lowercase sentence          | `'should create company with valid data'` |
| Page Object class   | PascalCase + Page           | `CompanyListPage`                         |
| Component class     | PascalCase + Component      | `ToastComponent`                          |
| Selector properties | camelCase                   | `emailInput`, `submitButton`              |
| Test data functions | camelCase                   | `generateCompanyPayload()`                |

## Assertion Rules

1. **Use soft assertions sparingly** — only for non-critical checks
2. **Prefer specific matchers** — `toBeVisible()` > `toBeTruthy()`
3. **Use `toContainURL()`** — more flexible than exact URL match
4. **Use `toPass()` for polling** — for async state changes
5. **One logical assertion per test** — multiple `expect()` OK if one behavior

## Selector Priority

| Priority | Method                          | Stability                    |
| -------- | ------------------------------- | ---------------------------- |
| 1        | `getByTestId(testId)`           | Most stable                  |
| 2        | `getByRole(role, { name })`     | Accessible, resilient        |
| 3        | `locator('input[name="..."]')`  | Stable despite copy changes  |
| 4        | `getByLabel(label)`             | Vulnerable to locale changes |
| 5        | `getByPlaceholder(placeholder)` | Fragile                      |
| 6        | `locator(css)`                  | Last resort                  |
| 7        | `locator(xpath)`                | FORBIDDEN                    |

## Absolute Non-Negotiables

| #   | Rule                                  |
| --- | ------------------------------------- |
| N1  | Read CLAUDE.md BEFORE code generation |
| N2  | All scripts use POM                   |
| N3  | Never hardcode selectors              |
| N4  | Never hardcode test data              |
| N5  | Never use `page.waitFor(timeout)`     |
| N6  | Never share state between tests       |
| N7  | Never test against production         |
| N8  | Every test needs assertion            |
| N9  | Never ignore failures                 |
| N10 | Never test nonexistent components     |

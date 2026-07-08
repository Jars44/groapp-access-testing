# Reference: Test Data & Fixtures

Source: AGENTS.md §7

## Fixture Rules

| Rule                  | Detail                                                     |
| --------------------- | ---------------------------------------------------------- |
| Authenticated fixture | `auth.setup.ts` logs in once per worker via `storageState` |
| Isolation             | Each test creates its own data. Never reuse mutable data.  |
| Cleanup               | `global-teardown.ts` removes test data after run           |
| Env config            | Test users, URLs, keys in `data/constants.ts`              |

## Test Data Factories

All factories in `src/tests/data/`. Factory pattern:

```typescript
function generateCompanyPayload(overrides?: Partial<CompanyCreatePayload>): CompanyCreatePayload {
  return {
    workspaceId: "default",
    name: `Test Company ${Date.now()}`,
    businessType: "jasa",
    countryCode: "ID",
    currencyCode: "IDR",
    ...overrides,
  };
}
```

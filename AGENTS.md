# AGENT.md — GroApp Testing Agent Protocol

> **Purpose:** Authoritative instruction set for AI agent generating Playwright E2E test scripts for GroApp Access. Governs thinking, planning, coding, and verification. Every rule below is a direct, executable constraint.

---

## 1. Agent Persona & Core Directives

**Role:** Senior QA Engineer specializing in Playwright E2E testing for React/TypeScript web applications. Deep expertise in Page Object Model (POM), test architecture, selector strategy, flakiness prevention, and CI/CD test integration.

### 1.1 Absolute Non-Negotiables

| #   | Rule                                                                                                                                                                                                                              | Violation = Reject             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| N1  | **CLAUDE.md must be read BEFORE any code generation.** AGENTS.md dictates WHAT to test and HOW to structure. CLAUDE.md dictates HOW the AI thinks and outputs. Both are mandatory.                                                | Skipping CLAUDE.md             |
| N2  | **All test scripts use POM.** Feature pages extend base Page class. Components reuse shared POM fragments. Raw `page.locator()` in spec files is forbidden except for one-off assertions.                                         | Spec file with locators        |
| N3  | **Never use hardcoded selectors.** Define all selectors in Page Object classes. Use data-testid attributes where available; fall back to semantic roles (getByRole) before CSS/XPath. CSS/XPath only when no other option exists. | Inline selectors in tests      |
| N4  | **Never hardcode test data.** Use `test-data/` factories or `test.use({ storageState })` for auth state. Test user credentials in env config only.                                                                                | Hardcoded emails/passwords     |
| N5  | **Never use `page.waitFor(timeout)`.** Use Playwright auto-waiting (actions auto-wait), `waitForSelector`, `waitForResponse`, `waitForURL`, or `expect().toPass()`. Arbitrary timeouts cause flakiness.                           | `page.waitFor(2000)`           |
| N6  | **Never share state between tests.** Each test must be independent. Use `test.beforeEach` for setup, never rely on test ordering.                                                                                                 | Tests depending on prior state |
| N7  | **Never test against production.** Tests run against preview/dev environment via `baseURL`. API calls go through app's Axios client, not direct.                                                                                  | Direct API calls to production |
| N8  | **Every test must have at least one assertion.** Tests without assertions are invalid. Use `expect().toBeVisible()`, `expect().toHaveText()`, `expect().toContainURL()`, etc.                                                     | Assertion-less tests           |
| N9  | **Never ignore test failures.** Flaky tests must be fixed, not retried infinitely. Max 2 retries on CI only. Infinite retries mask real bugs.                                                                                     | `retries: 5+`                  |
| N10 | **Never add tests for nonexistent components/pages.** Verify component/page exists in `src/` before writing test. Read the actual component code for correct selectors and behavior.                                              | Hallucinated test targets      |

### 1.2 Decision Hierarchy

When writing tests, prioritize:

1. **Correctness** — test must verify actual behavior, not assumed behavior
2. **Reliability** — no flakiness, deterministic selectors, proper waits
3. **Readability** — descriptive test names, Arrange-Act-Assert pattern, clear failure messages
4. **Maintainability** — POM isolation, shared fixtures, minimal spec logic
5. **Coverage** — happy path first, edge cases second, error states third

---

## 2. Tech Stack & Architecture Context

### 2.1 Application Stack

| Layer      | Technology                                   | Notes                                            |
| ---------- | -------------------------------------------- | ------------------------------------------------ |
| Framework  | React 19 + TypeScript 6 + Vite 8             | SPA, no SSR                                      |
| State      | Zustand 5 + React Context                    | Auth session, profile, company, media, workspace |
| Routing    | React Router DOM 7                           | AuthGuard, VerificationSecondGuard               |
| API Client | Axios (http-client + api-client)             | JWT Bearer, 401 refresh queue                    |
| Auth       | Firebase 11 (Google, Apple, email/phone OTP) | Popup-based OAuth, email/OTP verification        |
| Styling    | Tailwind CSS 4                               | Utility classes, no BEM                          |
| UI         | Custom atomic design (shared/ui/)            | Atoms, Molecules, Organisms, Patterns            |

### 2.2 Test Stack

| Tool                   | Version | Purpose                        |
| ---------------------- | ------- | ------------------------------ |
| Playwright             | ^1.61   | E2E test runner                |
| Vitest                 | ^3.2    | Unit/integration (non-E2E)     |
| @testing-library/react | Latest  | Component unit tests           |
| happy-dom              | Latest  | DOM environment for unit tests |

### 2.3 Architecture Summary

```text
Browser → React SPA (Vite dev / nginx preview)
            ↓ Axios http-client (Bearer token + 401 retry)
         Go/Gin Backend (api-test.groapp.id / api-stg.groapp.id)
            ↓
         MariaDB + Firebase Auth
```

### 2.4 Route Structure (Key for Test Navigation)

| Path                          | Guard                   | Layout              | Feature                                       |
| ----------------------------- | ----------------------- | ------------------- | --------------------------------------------- |
| `/auth/*`                     | Public                  | AuthLayout          | Login, Register, Verification, Password Reset |
| `/accounting/*`               | Public                  | None                | Marketing pages                               |
| `/` (root)                    | AuthGuard               | AppMainAccessLayout | Redirects to dashboard                        |
| `/dashboard`                  | AuthGuard               | AppMainAccessLayout | Dashboard                                     |
| `/workspaces`                 | AuthGuard               | AppMainAccessLayout | Workspace list                                |
| `/companies/*`                | AuthGuard               | AppMainAccessLayout | Company CRUD                                  |
| `/companies/:id/users/*`      | AuthGuard               | AppMainAccessLayout | User management                               |
| `/companies/:id/roles/*`      | AuthGuard               | AppMainAccessLayout | Role management                               |
| `/companies/:id/units/*`      | AuthGuard               | AppMainAccessLayout | Business units                                |
| `/users/*`                    | AuthGuard               | AppMainAccessLayout | User profile                                  |
| `/roles/*`                    | AuthGuard               | AppMainAccessLayout | Role list                                     |
| `/profile/*`                  | AuthGuard               | AppMainAccessLayout | Profile edit                                  |
| `/notifications/*`            | AuthGuard               | AppMainAccessLayout | Notifications                                 |
| `/onboarding/*`               | AuthGuard               | None (no sidebar)   | Onboarding flow                               |
| `/auth/second-verification/*` | VerificationSecondGuard | AuthLayout          | Re-verification                               |

---

## 3. Test Directory Structure

```text
tests/
├── auth.setup.ts                 # Global auth fixture (login once per worker)
├── global-setup.ts               # Environment validation, seed data check
├── global-teardown.ts            # Cleanup test data
│
├── pages/                        # Page Object Model
│   ├── base.page.ts              # Abstract BasePage: navigate, wait, common assertions
│   ├── components/               # Shared UI component POMs
│   │   ├── navbar.component.ts
│   │   ├── sidebar.component.ts
│   │   ├── modal.component.ts    # Generic modal (adaptive, dialog, consent)
│   │   ├── toast.component.ts
│   │   ├── table.component.ts
│   │   ├── breadcrumb.component.ts
│   │   └── pagination.component.ts
│   ├── layout/
│   │   ├── auth-layout.page.ts
│   │   └── main-layout.page.ts
│   ├── auth/                     # Auth feature pages
│   │   ├── login.page.ts
│   │   ├── register.page.ts
│   │   ├── forgot-password/
│   │   │   ├── channel.page.ts
│   │   │   ├── email.page.ts
│   │   │   └── whatsapp.page.ts
│   │   ├── reset-password.page.ts
│   │   ├── verification/
│   │   │   ├── choose-method.page.ts
│   │   │   ├── email-verification.page.ts
│   │   │   └── otp-verification.page.ts
│   │   └── re-auth.page.ts
│   ├── company/
│   │   ├── company-list.page.ts
│   │   ├── company-detail.page.ts
│   │   ├── company-profile.page.ts
│   │   └── company-form-modal.page.ts
│   ├── user/
│   │   ├── user-list.page.ts
│   │   ├── user-detail.page.ts
│   │   └── user-invite-modal.page.ts
│   ├── role/
│   │   ├── role-list.page.ts
│   │   └── role-detail.page.ts
│   ├── workspace/
│   │   ├── workspace-list.page.ts
│   │   └── workspace-form-modal.page.ts
│   ├── dashboard/
│   │   └── dashboard.page.ts
│   ├── onboarding/
│   │   └── onboarding.page.ts
│   ├── profile/
│   │   ├── profile.page.ts
│   │   ├── edit-profile.page.ts
│   │   ├── change-password.page.ts
│   │   ├── email-change.page.ts
│   │   └── delete-account.page.ts
│   ├── notification/
│   │   └── notification-list.page.ts
│   └── unit/
│       ├── unit-list.page.ts
│       ├── unit-detail.page.ts
│       └── unit-form-modal.page.ts
│
├── fixtures/                     # Test fixtures
│   ├── auth.fixture.ts           # Authenticated page fixture
│   ├── company.fixture.ts        # Pre-created company context
│   └── index.ts                  # Combined fixture exports
│
├── data/                         # Test data factories
│   ├── auth.data.ts
│   ├── company.data.ts
│   ├── workspace.data.ts
│   ├── user.data.ts
│   ├── unit.data.ts
│   └── constants.ts              # Test users, URLs, timeouts
│
├── utils/                        # Shared test utilities
│   ├── api-helper.ts             # Direct API calls for test setup
│   ├── db-helper.ts              # Database seed/cleanup (if available)
│   ├── token-helper.ts           # JWT manipulation for auth bypass
│   └── file-helper.ts            # Test file generation
│
├── specs/                        # Test spec files by feature
│   ├── auth/
│   │   ├── login-manual.spec.ts
│   │   ├── login-google.spec.ts
│   │   ├── register.spec.ts
│   │   ├── password-recovery.spec.ts
│   │   ├── verification.spec.ts
│   │   ├── re-auth.spec.ts
│   │   └── logout.spec.ts
│   ├── company/
│   │   ├── company-list.spec.ts
│   │   ├── company-create.spec.ts
│   │   ├── company-detail.spec.ts
│   │   ├── company-update.spec.ts
│   │   ├── company-delete.spec.ts
│   │   └── company-logo.spec.ts
│   ├── user/
│   │   ├── user-list.spec.ts
│   │   ├── invitation-create.spec.ts
│   │   ├── invitation-accept.spec.ts
│   │   └── user-role-update.spec.ts
│   ├── role/
│   │   ├── role-list.spec.ts
│   │   └── role-detail.spec.ts
│   ├── workspace/
│   │   ├── workspace-list.spec.ts
│   │   ├── workspace-create.spec.ts
│   │   ├── workspace-update.spec.ts
│   │   └── workspace-delete.spec.ts
│   ├── dashboard/
│   │   └── dashboard.spec.ts
│   ├── onboarding/
│   │   └── onboarding.spec.ts
│   ├── profile/
│   │   ├── profile-edit.spec.ts
│   │   ├── change-password.spec.ts
│   │   ├── email-change.spec.ts
│   │   ├── whatsapp-change.spec.ts
│   │   └── delete-account.spec.ts
│   ├── notification/
│   │   ├── notification-list.spec.ts
│   │   └── invitation-action.spec.ts
│   └── unit/
│       ├── unit-list.spec.ts
│       ├── unit-create.spec.ts
│       ├── unit-update.spec.ts
│       └── unit-delete.spec.ts
│
└── types/                        # Shared type definitions for tests
    └── index.ts
```

---

## 4. Page Object Model (POM) Architecture

### 4.1 Base Page Class

Every Page Object extends `BasePage`. BasePage provides:

```typescript
// BasePage contract (conceptual)
class BasePage {
  readonly page: Page;
  readonly url: string;

  // Navigation
  async goto(subpath?: string): Promise<void>;
  async waitForLoad(): Promise<void>;

  // Common elements (present on every page)
  readonly toast: ToastComponent;
  readonly modal: ModalComponent;
  readonly navbar: NavbarComponent;
  readonly sidebar: SidebarComponent;

  // Utilities
  async getPageTitle(): Promise<string>;
  async waitForResponse(endpoint: string): Promise<Response>;
  async waitForToast(): Promise<void>;
  async pressEscape(): Promise<void>;
  async screenshot(name: string): Promise<void>;
}
```

### 4.2 Page Object Rules

| #   | Rule                                            | Detail                                                                                                               |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| P1  | **One page object per route/page**              | LoginPage, CompanyListPage, etc. No monolithic page objects                                                          |
| P2  | **Selectors as readonly properties**            | `readonly emailInput = this.page.getByRole('textbox', { name: 'Email' })`                                            |
| P3  | **Action methods return `this` or page object** | For method chaining: `await loginPage.fillEmail(email).fillPassword(password).clickLogin()`                          |
| P4  | **Page transitions return the target page**     | `async submitLogin(): Promise<DashboardPage>` — navigate and return new page                                         |
| P5  | **No assertions in page objects**               | Page objects provide state/actions. Specs do assertions. Exception: waitForLoad() can verify expected elements exist |
| P6  | **Component POMs for reusable UI**              | Modal, Toast, Table, Navbar, Sidebar — shared across feature pages                                                   |
| P7  | **Data attributes preferred over CSS**          | Use `getByTestId('company-name')` where available. Fall back: `getByRole`, `getByLabel`, `getByText`, then CSS       |

### 4.3 Component POM Example Structure

```typescript
class ModalComponent {
  constructor(readonly page: Page, readonly root: Locator);

  readonly closeButton = this.root.getByRole('button', { name: /close/i });
  readonly title = this.root.getByRole('heading');
  readonly confirmButton = this.root.getByRole('button', { name: /confirm|ya|simpan/i });
  readonly cancelButton = this.root.getByRole('button', { name: /cancel|batal/i });

  async waitForOpen(): Promise<void>;
  async waitForClose(): Promise<void>;
  async close(): Promise<void>;
  async confirm(): Promise<void>;
}
```

---

## 5. Standard Operating Procedure (SOP) for Test Tasks

Every test task must follow this exact loop:

### Phase 1: Discovery

```text
STEP 1: READ context files
├── Read CLAUDE.md (thinking framework, output rules)
├── Read AGENTS.md (this file — structure, rules, coverage)
├── Read test-coverage-plan.md (detailed test scenarios)
└── Read playwright.config.ts (existing config)

STEP 2: EXPLORE target feature
├── Read the page/component source code in src/features/{feature}/
├── Identify all URLs, buttons, forms, states
├── Trace the data flow: page → state → API call
├── Read existing test files for patterns (if any)
└── Note: what can be tested via UI vs API
```

### Phase 2: Plan

```text
STEP 3: WRITE test plan
├── List specific test scenarios (happy path, error, edge case)
├── Identify POM files needed (new or existing)
├── Identify test data required
└── Confirm no overlap with existing tests
```

### Phase 3: Implement

```text
STEP 4: CREATE/UPDATE POM files
├── BasePage → Component POMs → Feature Page Objects
├── All selectors defined as class properties
├── Action methods chain or return new page
└── No assertions in POM

STEP 5: CREATE test spec
├── Use test.describe for feature grouping
├── Use test.beforeEach for navigation/setup
├── Arrange → Act → Assert pattern
├── Descriptive test names (should...)
├── One clear assertion per test (or related group)
└── Use fixtures for authenticated state
```

### Phase 4: Verify

```text
STEP 6: RUN AND VERIFY
├── npx playwright test --grep "test name" --reporter=list
├── Fix failures: selector issues, timing, test data
├── Check for flakiness: run 3x
└── Verify no other tests broken: run full suite

STEP 7: QUALITY GATE
├── npx playwright test — all pass
├── POM structure follows conventions
├── No hardcoded timeouts
├── No inline selectors in specs
├── All tests have assertions
└── Tests are independent (no shared mutable state)
```

---

## 6. Coding Standards

### 6.1 Test Spec Conventions

```typescript
// CORRECT pattern
test.describe("Company List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/companies");
  });

  test("should display company list with correct columns", async ({ page }) => {
    const companyList = new CompanyListPage(page);
    await expect(companyList.table).toBeVisible();
    await expect(companyList.companyRows.first()).toBeVisible();
  });

  test("should navigate to company detail on row click", async ({ page }) => {
    const companyList = new CompanyListPage(page);
    const firstCompany = await companyList.getFirstCompanyName();
    await companyList.clickFirstRow();

    await expect(page).toHaveURL(/\/companies\/.+/);
    const detail = new CompanyDetailPage(page);
    await expect(detail.companyName).toHaveText(firstCompany);
  });
});
```

### 6.2 Selector Strategy Priority

| Priority | Method                          | When                                   |
| -------- | ------------------------------- | -------------------------------------- |
| 1        | `getByTestId(testId)`           | Component has `data-testid` attribute  |
| 2        | `getByRole(role, { name })`     | Semantic role + accessible name        |
| 3        | `getByLabel(label)`             | Form inputs with labels                |
| 4        | `getByPlaceholder(placeholder)` | Inputs with unique placeholder         |
| 5        | `getByText(text)`               | Unique visible text                    |
| 6        | `getByTitle(title)`             | Elements with title attribute          |
| 7        | `locator(css)`                  | Last resort — fragile to style changes |
| 8        | `locator(xpath)`                | Never — most fragile                   |

### 6.3 Naming Conventions

| Context             | Convention                  | Example                                   |
| ------------------- | --------------------------- | ----------------------------------------- |
| Test spec files     | kebab-case, `.spec.ts`      | `login-manual.spec.ts`                    |
| Page Object files   | kebab-case, `.page.ts`      | `company-list.page.ts`                    |
| Component POM files | kebab-case, `.component.ts` | `toast.component.ts`                      |
| Test data files     | kebab-case, `.data.ts`      | `company.data.ts`                         |
| Fixture files       | kebab-case, `.fixture.ts`   | `auth.fixture.ts`                         |
| Test describe block | PascalCase, feature name    | `test.describe('Company List', ...)`      |
| Test name           | lowercase sentence          | `'should create company with valid data'` |
| Page Object class   | PascalCase + Page           | `CompanyListPage`                         |
| Component class     | PascalCase + Component      | `ToastComponent`                          |
| Selector properties | camelCase                   | `emailInput`, `submitButton`              |
| Test data functions | camelCase                   | `generateCompanyPayload()`                |

### 6.4 Assertion Rules

| Rule                                    | Detail                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------- |
| **Use soft assertions sparingly**       | `expect.soft()` only for non-critical checks in a single logical test  |
| **Prefer specific matchers**            | `toBeVisible()` > `toBeTruthy()`, `toHaveText()` > `toContainText()`   |
| **Use `toContainURL()` for navigation** | More flexible than exact URL matching                                  |
| **Use `toPass()` for polling**          | `await expect(async () => { ... }).toPass()` for async state changes   |
| **One logical assertion per test**      | Multiple `expect()` calls in one test are OK if they test one behavior |

---

## 7. Test Data & Fixtures

### 7.1 Fixture Rules

| Rule                      | Detail                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Authenticated fixture** | `auth.setup.ts` logs in once per worker via `storageState`. All authenticated tests use this. |
| **Isolation**             | Each test creates its own test data. Never reuse mutable data between tests.                  |
| **Cleanup**               | `global-teardown.ts` removes test data created during test run.                               |
| **Env config**            | Test users, URLs, and keys in `data/constants.ts`. Never hardcoded in specs.                  |

### 7.2 Test Data Factories

Factory functions generate domain-valid payloads:

```typescript
// data/company.data.ts
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

---

## 8. Anti-Hallucination Guardrails

### 8.1 Code Generation Rules

| #   | Rule                                       | Enforcement                                                                                      |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| A1  | **Never write test for nonexistent route** | Verify route exists in `routes.tsx` before writing navigation code                               |
| A2  | **Never invent selectors**                 | Read component source to find actual data-testid, roles, or labels                               |
| A3  | **Never guess API endpoints**              | Verify in feature's `infrastructure/api/` or `endpoint` files                                    |
| A4  | **Never invent test data requirements**    | Read domain types and validation rules before writing factory defaults                           |
| A5  | **Never assume component behavior**        | Read the component implementation for conditional rendering, loading states, error displays      |
| A6  | **Never skip page objects**                | Every spec must use POM. No `page.locator()` in spec files                                       |
| A7  | **Never invent URL patterns**              | Read the actual route path definitions from feature's route files                                |
| A8  | **Never guess error messages**             | Read the component code for error state rendering                                                |
| A9  | **Never invent form validation rules**     | Read form validator/schema files in feature's `presentation/forms/`                              |
| A10 | **Never use patterns from other projects** | This app has specific patterns (Either monad, DataState, interruption system). Read actual code. |

### 8.2 Verification Checklist

Before outputting any test code, verify:

- [ ] Target page/component exists in `src/features/` (grep verified)
- [ ] Route path matches `routes.tsx` or feature route file
- [ ] Selectors match actual component rendering (read source code)
- [ ] API endpoints match feature's infrastructure files
- [ ] Test data matches domain validation rules
- [ ] All imports exist in `package.json` (Playwright built-in or installed)
- [ ] Page Object follows POM conventions defined in Section 4
- [ ] Spec has at least one assertion
- [ ] No hardcoded timeouts (`page.waitFor(ms)`)
- [ ] No inline locators in spec files
- [ ] Test is independent (no reliance on other test state)

### 8.3 When Uncertain

| Situation                     | Action                                   |
| ----------------------------- | ---------------------------------------- |
| Unknown component behavior    | Read component source file               |
| Unknown route path            | Read `routes.tsx` or feature route file  |
| Unknown API endpoint          | Read infrastructure API files            |
| Unknown form validation       | Read form validator/schema               |
| Unknown error display         | Read component for error states          |
| Unknown selector availability | Read component JSX for testid/role/label |

**Never guess. Never assume. Always verify by reading source code.**

---

## 9. Feature Coverage Reference

Full coverage plan in `test-coverage-plan.md`. Summary:

| Feature      | Priority | Test Suites                                                                                        |
| ------------ | -------- | -------------------------------------------------------------------------------------------------- |
| Auth         | Critical | 8 (login manual/google/apple/firebase, register, verification, password recovery, re-auth, logout) |
| Company      | Critical | 12 (CRUD, sections, logo, geo cascade, delete)                                                     |
| User         | High     | 10 (profile, memberships, invitation flow, roles)                                                  |
| Role         | High     | 4 (list, detail, permissions, guard)                                                               |
| Workspace    | High     | 6 (infinite-scroll list, CRUD, type-to-confirm delete)                                             |
| Profile      | High     | 8 (edit, photo, email/WhatsApp change, password, delete)                                           |
| Notification | Medium   | 5 (list, detail, mark read, invitation actions)                                                    |
| Unit         | Medium   | 8 (CRUD, geo cascade, status toggle, delete impact)                                                |
| Dashboard    | Medium   | 2 (welcome, quick actions)                                                                         |
| Onboarding   | Medium   | 2 (stepper, submission)                                                                            |
| Media        | Low      | 2 (upload, get/delete)                                                                             |

---

## 10. Quality Gate

### Test Changes

- [ ] `npx playwright test --reporter=list` — all pass (or documented
- [ ] No new flaky tests identified (run 3x)
- [ ] POM structure follows Section 4 conventions
- [ ] No hardcoded timeouts (`page.waitFor(ms)`)
- [ ] No inline locators in spec files
- [ ] All tests have at least one assertion
- [ ] Test data uses factory functions or constants, no hardcoded values
- [ ] Selectors follow priority strategy (Section 6.2)
- [ ] Tests are independent (can run in any order)
- [ ] `test.describe.configure({ mode: 'parallel' })` for independent tests

### POM Changes

- [ ] Page Object extends BasePage (or uses composition)
- [ ] All selectors are readonly class properties
- [ ] Action methods return `this` or target page object
- [ ] No assertions in page objects
- [ ] Component POMs used for shared UI (modal, toast, table, etc.)

### Security

- [ ] No test credentials committed in spec files (use env/constants)
- [ ] No API keys or secrets in test code
- [ ] No production URLs in test config

---

## 11. Reference to CLAUDE.md

This `AGENTS.md` governs **WHAT to test and HOW to structure tests.**
`CLAUDE.md` governs **HOW the AI thinks and outputs.**

AI must read BOTH files before any code generation.

For the following topics, always consult `CLAUDE.md`:

| Topic                   | CLAUDE.md Section |
| ----------------------- | ----------------- |
| System persona          | Section 1         |
| XML reasoning framework | Section 2         |
| Anti-laziness protocol  | Section 3         |
| Output format rules     | Section 4         |
| Verification matrix     | Section 5         |

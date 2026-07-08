# Constitution 001 — Page Object Model Architecture

Source: AGENTS.md §4

## P1 — One page object per route/page

LoginPage, CompanyListPage, etc. No monolithic page objects.

## P2 — Selectors as readonly properties

```text
readonly emailInput = this.page.getByRole('textbox', { name: 'Email' })
```

## P3 — Action methods return `this` or page object

Method chaining: `fillEmail(email).fillPassword(password).clickLogin()`

## P4 — Page transitions return target page

`async submitLogin(): Promise<DashboardPage>` — navigate and return page.

## P5 — No assertions in page objects

Page objects provide state/actions. Specs do assertions.
Exception: `waitForLoad()` can verify expected elements exist.

## P6 — Component POMs for reusable UI

Modal, Toast, Table, Navbar, Sidebar — shared across feature pages.

## P7 — Data attributes preferred over CSS

Priority: `getByTestId` > `getByRole` > `getByLabel` > `getByText` > `locator(css)` > never XPath.

## BasePage Contract

Every Page Object extends BasePage with:

| Method                      | Purpose                     |
| --------------------------- | --------------------------- |
| `goto(subpath?)`            | Navigate to page URL        |
| `waitForLoad()`             | Wait for page ready         |
| `toast`                     | ToastComponent instance     |
| `modal`                     | ModalComponent instance     |
| `navbar`                    | NavbarComponent instance    |
| `sidebar`                   | SidebarComponent instance   |
| `getPageTitle()`            | Page heading text           |
| `waitForResponse(endpoint)` | Wait for API response       |
| `waitForToast()`            | Wait for toast notification |
| `pressEscape()`             | Dismiss modal               |
| `screenshot(name)`          | Debug screenshot            |

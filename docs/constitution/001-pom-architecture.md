# Constitution 001 — Page Object Model Architecture

Source: AGENTS.md §4

## P1 — One page object per route/page

LoginPage, CompanyListPage, etc. No monolithic page objects.

## P2 — Selectors as `readonly` properties

Use `readonly` field declaration. Do NOT use getter methods.

```typescript
// ✅ CORRECT — readonly field
readonly emailInput = this.page.getByRole('textbox', { name: 'Email' })

// ❌ WRONG — getter method
get emailInput(): Locator { return this.page.getByRole('textbox', { name: 'Email' }) }
```

All selectors are initialized once in the constructor as `readonly` properties. This ensures locators are captured at page object creation time and remain stable.

## P3 — Action methods return `this`

Method chaining is required for all fluent operations.

```typescript
// ✅ CORRECT — returns this for chaining
async fillEmail(email: string): Promise<this> {
  await this.emailInput.fill(email);
  return this;
}

// Usage: registerPage.fillEmail(e).fillPassword(p).clickSubmit()
```

## P4 — Page transitions return target page

When an action causes navigation, return the target page object.

```typescript
// ✅ CORRECT — returns target page
async clickLogin(): Promise<DashboardPage> {
  await this.submitButton.click();
  return new DashboardPage(this.page);
}

// Usage: const dashboard = await loginPage.login(email, password)
```

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
| `waitForURL(url, options?)` | Wait for URL match          |
| `toast`                     | ToastComponent instance     |
| `modal`                     | ModalComponent instance     |
| `navbar`                    | NavbarComponent instance    |
| `sidebar`                   | SidebarComponent instance   |
| `breadcrumb`                | BreadcrumbComponent instance|
| `getPageTitle()`            | Page heading text           |
| `waitForResponse(endpoint)` | Wait for API response       |
| `waitForToast()`            | Wait for toast notification |
| `pressEscape()`             | Dismiss modal               |
| `screenshot(name)`          | Debug screenshot            |

import { type Locator, type Page } from '@playwright/test';

export class NavbarComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.locator('[data-testid="navbar"], nav:has([data-testid])');
  }

  get notificationBadge(): Locator {
    return this.page.getByTestId('notification-badge');
  }

  get profileDropdown(): Locator {
    return this.page.getByTestId('profile-dropdown');
  }

  get languageSwitcher(): Locator {
    return this.page.getByTestId('language-switcher');
  }

  async clickNotification(): Promise<void> {
    await this.notificationBadge.click();
  }

  async clickProfile(): Promise<void> {
    await this.profileDropdown.click();
  }

  async getTitle(): Promise<string> {
    return await this.root.locator('h1, h2, [data-testid="page-title"]').innerText();
  }
}

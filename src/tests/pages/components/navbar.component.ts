import { type Locator, type Page } from '@playwright/test';
import { SEL } from '../../data/selectors';

export class NavbarComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId('navbar');
  }

  get notificationBadge(): Locator {
    return this.page.locator(SEL.indicator.badge);
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
    return await this.root.getByTestId('page-title').innerText();
  }
}

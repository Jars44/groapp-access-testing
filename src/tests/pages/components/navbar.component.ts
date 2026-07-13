import { type Locator, type Page } from '@playwright/test';
import { SEL } from '../../utils/selectors';

export class NavbarComponent {
  readonly root: Locator;
  readonly notificationBadge: Locator;
  readonly profileDropdown: Locator;
  readonly languageSwitcher: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId(SEL.testid.navbar);
    this.notificationBadge = this.page.getByTestId(SEL.testid.notificationBadge);
    this.profileDropdown = this.page.getByTestId(SEL.testid.profileDropdown);
    this.languageSwitcher = this.page.getByTestId(SEL.testid.languageSwitcher);
  }

  async clickNotification(): Promise<this> {
    await this.notificationBadge.click();
    return this;
  }

  async clickProfile(): Promise<this> {
    await this.profileDropdown.click();
    return this;
  }

  async getTitle(): Promise<string> {
    return await this.root.getByTestId(SEL.testid.pageTitle).innerText();
  }
}

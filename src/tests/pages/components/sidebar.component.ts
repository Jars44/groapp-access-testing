import { type Locator, type Page } from '@playwright/test';

export class SidebarComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId('sidebar');
  }

  get menuItems(): Locator {
    return this.root.getByRole('link');
  }

  async navigateTo(label: string | RegExp): Promise<void> {
    await this.root.getByText(label).click();
  }

  async getActiveItem(): Promise<string | null> {
    const active = this.root.locator('[data-active="true"], [aria-current="page"]');
    const isVisible = await active.isVisible();
    return isVisible ? await active.innerText() : null;
  }
}

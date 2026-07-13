import { type Locator, type Page } from '@playwright/test';

export class BreadcrumbComponent {
  readonly root: Locator;
  readonly items: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByRole('navigation', { name: /breadcrumb/i });
    this.items = this.root.locator('a, span, button');
  }

  async clickItem(label: string | RegExp): Promise<this> {
    await this.root.getByText(label).click();
    return this;
  }

  async getLastItemText(): Promise<string> {
    const allItems = await this.items.all();
    return await allItems[allItems.length - 1].innerText();
  }
}

import { type Locator, type Page, expect } from '@playwright/test';

export class BreadcrumbComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByRole('navigation', { name: /breadcrumb/i });
  }

  get items(): Locator {
    return this.root.locator('a, span, button');
  }

  async clickItem(label: string | RegExp): Promise<void> {
    await this.root.getByText(label).click();
  }

  async getLastItemText(): Promise<string> {
    const allItems = await this.items.all();
    return await allItems[allItems.length - 1].innerText();
  }
}

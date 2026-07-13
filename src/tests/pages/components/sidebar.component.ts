import { type Locator, type Page } from '@playwright/test';
import { SEL } from '../../utils/selectors';

export class SidebarComponent {
  readonly root: Locator;
  readonly menuItems: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId(SEL.testid.sidebar);
    this.menuItems = this.root.getByRole('link');
  }

  async navigateTo(label: string | RegExp): Promise<this> {
    await this.root.getByText(label).click();
    return this;
  }

  async getActiveItem(): Promise<string | null> {
    const active = this.root.locator('[aria-current="page"]');
    const isVisible = await active.isVisible();
    return isVisible ? await active.innerText() : null;
  }
}

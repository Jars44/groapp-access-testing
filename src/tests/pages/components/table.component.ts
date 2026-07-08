import { type Locator, type Page, expect } from '@playwright/test';
import { SEL } from '../../data/selectors';

export class TableComponent {
  readonly root: Locator;

  constructor(readonly page: Page, root?: Locator) {
    this.root = root ?? page.getByRole('table');
  }

  get rows(): Locator {
    return this.root.locator('tbody tr');
  }

  get headers(): Locator {
    return this.root.locator('thead th');
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  async clickRow(index: number): Promise<void> {
    await this.rows.nth(index).click();
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    return await this.rows.nth(rowIndex).locator('td').nth(colIndex).innerText();
  }

  async sortBy(columnIndex: number): Promise<void> {
    await this.headers.nth(columnIndex).click();
  }

  async waitForRows(min = 1): Promise<void> {
    await expect(this.rows.first()).toBeVisible();
    if (min > 1) {
      await expect(this.rows).toHaveCount(min);
    }
  }
}

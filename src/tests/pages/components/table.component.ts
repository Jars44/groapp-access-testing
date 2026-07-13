import { type Locator, type Page, expect } from '@playwright/test';
import { SEL } from '../../utils/selectors';

export class TableComponent {
  readonly root: Locator;
  readonly rows: Locator;
  readonly headers: Locator;

  constructor(readonly page: Page, root?: Locator) {
    this.root = root ?? page.getByRole('table');
    this.rows = this.root.locator('tbody').getByRole('row');
    this.headers = this.root.locator('thead').getByRole('columnheader');
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  async clickRow(index: number): Promise<this> {
    await this.rows.nth(index).click();
    return this;
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    return await this.rows.nth(rowIndex).locator('td').nth(colIndex).innerText();
  }

  async sortBy(columnIndex: number): Promise<this> {
    await this.headers.nth(columnIndex).click();
    return this;
  }

  async waitForRows(min = 1): Promise<void> {
    await expect(this.rows.first()).toBeVisible();
    if (min > 1) {
      await expect(this.rows).toHaveCount(min);
    }
  }
}

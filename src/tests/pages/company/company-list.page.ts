import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent } from '../components/table.component';
import { SEL } from '../../utils/selectors';

export class CompanyListPage extends BasePage {
  readonly url = '/companies';
  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: SEL.button.tambah });
  }
  get searchInput(): Locator {
    return this.page.locator(SEL.form.search);
  }
  get emptyState(): Locator {
    return this.page.getByTestId('empty-data');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.page.waitForResponse(/\/access\/v1\/companies/);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickFirstRow(): Promise<void> {
    await this.table.clickRow(0);
  }

  async getFirstCompanyName(): Promise<string> {
    return await this.table.getCellText(0, 0);
  }
}

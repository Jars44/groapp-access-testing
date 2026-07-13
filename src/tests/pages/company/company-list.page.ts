import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent } from '../components/table.component';
import { SEL } from '../../utils/selectors';

export class CompanyListPage extends BasePage {
  readonly url = '/companies';
  readonly table: TableComponent;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.createButton = this.page.getByRole('button', { name: SEL.button.tambah });
    this.searchInput = this.page.getByRole('searchbox');
    this.emptyState = this.page.getByTestId(SEL.testid.emptyData);
  }

  async search(keyword: string): Promise<this> {
    await this.searchInput.fill(keyword);
    await this.page.waitForResponse(/\/access\/v1\/companies/);
    return this;
  }

  async clickCreate(): Promise<this> {
    await this.createButton.click();
    return this;
  }

  async clickFirstRow(): Promise<this> {
    await this.table.clickRow(0);
    return this;
  }

  async getFirstCompanyName(): Promise<string> {
    return await this.table.getCellText(0, 0);
  }
}

import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent } from '../components/table.component';
import { SEL } from '../../data/selectors';

export class UserListPage extends BasePage {
  readonly table: TableComponent;

  constructor(page: Page, companyId?: string) {
    super(page, companyId ? `/companies/${companyId}/users` : '/companies/:id/users');
    this.table = new TableComponent(page);
  }

  get inviteButton(): Locator {
    return this.page.getByRole('button', { name: /undang|invite/i });
  }
  get searchInput(): Locator {
    return this.page.locator(SEL.form.search);
  }
  get filterByRole(): Locator {
    return this.page.getByTestId('filter-role');
  }
  get filterByStatus(): Locator {
    return this.page.getByTestId('filter-status');
  }
  get emptyState(): Locator {
    return this.page.getByTestId('empty-data');
  }

  async clickInvite(): Promise<void> {
    await this.inviteButton.click();
  }
  async clickFirstRow(): Promise<void> {
    await this.table.clickRow(0);
  }
}

export class UserDetailPage extends BasePage {
  constructor(page: Page, companyId?: string, invitationId?: string) {
    super(page, companyId && invitationId
      ? `/companies/${companyId}/users/${invitationId}`
      : '/companies/:id/users/:invitationId');
  }

  get userName(): Locator {
    return this.page.getByTestId('user-name');
  }
  get profileSection(): Locator {
    return this.page.getByTestId('user-profile');
  }
  get membershipTable(): Locator {
    return this.page.getByRole('table');
  }
  get roleDropdown(): Locator {
    return this.page.getByTestId('role-select');
  }
  get statusToggle(): Locator {
    return this.page.getByRole('switch');
  }
}

export class UserInviteModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get emailInput(): Locator {
    return this.page.getByRole('dialog').locator(SEL.form.email);
  }
  get roleDropdown(): Locator {
    return this.page.getByRole('dialog').getByTestId('role-select');
  }
  get inviteButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: /undang|invite|kirim/i });
  }
  get errorText(): Locator {
    return this.page.getByRole('dialog').locator(SEL.state.error);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }
  async submit(): Promise<void> {
    await this.inviteButton.click();
  }
}

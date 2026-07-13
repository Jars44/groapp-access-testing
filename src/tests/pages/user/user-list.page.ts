import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent } from '../components/table.component';
import { SEL } from '../../utils/selectors';

export class UserListPage extends BasePage {
  readonly table: TableComponent;
  readonly inviteButton: Locator;
  readonly searchInput: Locator;
  readonly filterByRole: Locator;
  readonly filterByStatus: Locator;
  readonly emptyState: Locator;

  constructor(page: Page, companyId?: string) {
    super(page, companyId ? `/companies/${companyId}/users` : '/companies/:id/users');
    this.table = new TableComponent(page);
    this.inviteButton = this.page.getByRole('button', { name: /undang|invite/i });
    this.searchInput = this.page.getByRole('searchbox');
    this.filterByRole = this.page.getByTestId(SEL.testid.filterRole);
    this.filterByStatus = this.page.getByTestId(SEL.testid.filterStatus);
    this.emptyState = this.page.getByTestId(SEL.testid.emptyData);
  }

  async clickInvite(): Promise<this> {
    await this.inviteButton.click();
    return this;
  }

  async clickFirstRow(): Promise<this> {
    await this.table.clickRow(0);
    return this;
  }
}

export class UserDetailPage extends BasePage {
  readonly userName: Locator;
  readonly profileSection: Locator;
  readonly membershipTable: Locator;
  readonly roleDropdown: Locator;
  readonly statusToggle: Locator;

  constructor(page: Page, companyId?: string, invitationId?: string) {
    super(page, companyId && invitationId
      ? `/companies/${companyId}/users/${invitationId}`
      : '/companies/:id/users/:invitationId');
    this.userName = this.page.getByTestId(SEL.testid.userName);
    this.profileSection = this.page.getByTestId(SEL.testid.userProfile);
    this.membershipTable = this.page.getByRole('table');
    this.roleDropdown = this.page.getByTestId(SEL.testid.roleSelect);
    this.statusToggle = this.page.getByRole('switch');
  }
}

export class UserInviteModalPage extends BasePage {
  readonly emailInput: Locator;
  readonly roleDropdown: Locator;
  readonly inviteButton: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.getByRole('dialog').getByRole('textbox', { name: /email/i });
    this.roleDropdown = this.page.getByRole('dialog').getByTestId(SEL.testid.roleSelect);
    this.inviteButton = this.page.getByRole('dialog').getByRole('button', { name: /undang|invite|kirim/i });
    this.errorText = this.page.getByRole('dialog').locator(SEL.state.error);
  }

  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  async submit(): Promise<this> {
    await this.inviteButton.click();
    return this;
  }
}

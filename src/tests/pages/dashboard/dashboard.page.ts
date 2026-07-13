import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class DashboardPage extends BasePage {
  readonly url = '/dashboard';
  readonly welcomeSection: Locator;
  readonly moduleCards: Locator;
  readonly quickActions: Locator;
  readonly inviteTeamButton: Locator;
  readonly manageRoleButton: Locator;
  readonly auditLogButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeSection = this.page.getByTestId(SEL.testid.welcomeSection);
    this.moduleCards = this.page.getByTestId(SEL.testid.moduleCard);
    this.quickActions = this.page.getByTestId(SEL.testid.quickAction);
    this.inviteTeamButton = this.page.getByRole('button', { name: /undang tim|invite team/i });
    this.manageRoleButton = this.page.getByRole('button', { name: /kelola peran|manage role/i });
    this.auditLogButton = this.page.getByRole('button', { name: /audit log/i });
  }
}

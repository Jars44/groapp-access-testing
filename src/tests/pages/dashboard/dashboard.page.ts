import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  constructor(page: Page) {
    super(page);
  }

  get welcomeSection(): Locator {
    return this.page.getByTestId('welcome-section');
  }
  get moduleCards(): Locator {
    return this.page.getByTestId('module-card');
  }
  get quickActions(): Locator {
    return this.page.getByTestId('quick-action');
  }
  get inviteTeamButton(): Locator {
    return this.page.getByRole('button', { name: /undang tim|invite team/i });
  }
  get manageRoleButton(): Locator {
    return this.page.getByRole('button', { name: /kelola peran|manage role/i });
  }
  get auditLogButton(): Locator {
    return this.page.getByRole('button', { name: /audit log/i });
  }
}

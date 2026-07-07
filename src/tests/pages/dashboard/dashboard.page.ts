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
    return this.page.locator('[data-testid="module-card"]');
  }
  get quickActions(): Locator {
    return this.page.locator('[data-testid="quick-action"]');
  }
  get inviteTeamButton(): Locator {
    return this.page.getByText(/undang tim|invite team/i);
  }
  get manageRoleButton(): Locator {
    return this.page.getByText(/kelola peran|manage role/i);
  }
  get auditLogButton(): Locator {
    return this.page.getByText(/audit log/i);
  }
}

import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../data/selectors';

export class NotificationListPage extends BasePage {
  readonly url = '/notifications';

  constructor(page: Page) {
    super(page);
  }

  get notificationList(): Locator {
    return this.page.getByTestId('notification-item');
  }
  get emptyState(): Locator {
    return this.page.locator(SEL.state.empty);
  }
  get filterButton(): Locator {
    return this.page.getByTestId('filter-button');
  }
  get loadMoreTrigger(): Locator {
    return this.page.getByTestId('infinite-scroll-trigger');
  }

  async clickNotification(index = 0): Promise<void> {
    await this.notificationList.nth(index).click();
  }

  async clickAcceptInvitation(): Promise<void> {
    await this.page.getByRole('button', { name: /terima|accept/i }).click();
  }

  async clickDeclineInvitation(): Promise<void> {
    await this.page.getByRole('button', { name: /tolak|decline/i }).click();
  }
}

export class NotificationDetailModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.locator(SEL.modal.title);
  }
  get body(): Locator {
    return this.page.getByRole('dialog').getByTestId('notification-body');
  }
  get closeButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: /close|tutup/i });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}

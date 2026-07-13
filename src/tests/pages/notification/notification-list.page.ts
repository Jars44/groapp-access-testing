import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class NotificationListPage extends BasePage {
  readonly url = '/notifications';
  readonly notificationList: Locator;
  readonly emptyState: Locator;
  readonly filterButton: Locator;
  readonly loadMoreTrigger: Locator;

  constructor(page: Page) {
    super(page);
    this.notificationList = this.page.getByTestId(SEL.testid.notificationItem);
    this.emptyState = this.page.getByTestId(SEL.testid.emptyData);
    this.filterButton = this.page.getByTestId(SEL.testid.filterButton);
    this.loadMoreTrigger = this.page.getByTestId(SEL.testid.infiniteScrollTrigger);
  }

  async clickNotification(index = 0): Promise<this> {
    await this.notificationList.nth(index).click();
    return this;
  }

  async clickAcceptInvitation(): Promise<this> {
    await this.page.getByRole('button', { name: /terima|accept/i }).click();
    return this;
  }

  async clickDeclineInvitation(): Promise<this> {
    await this.page.getByRole('button', { name: /tolak|decline/i }).click();
    return this;
  }
}

export class NotificationDetailModalPage extends BasePage {
  readonly title: Locator;
  readonly body: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.page.getByRole('dialog').getByRole('heading');
    this.body = this.page.getByRole('dialog').getByTestId(SEL.testid.notificationBody);
    this.closeButton = this.page.getByRole('dialog').getByRole('button', { name: /close|tutup/i });
  }

  async close(): Promise<this> {
    await this.closeButton.click();
    return this;
  }
}

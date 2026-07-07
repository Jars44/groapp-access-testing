import { type Locator, type Page, expect } from '@playwright/test';

export class ToastComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByRole('status');
  }

  get message(): Locator {
    return this.root.locator('p, [data-toast-message]');
  }

  get dismissButton(): Locator {
    return this.root.getByRole('button', { name: /dismiss|tutup/i });
  }

  async waitForToast(timeout = 10000): Promise<void> {
    await expect(this.root.first()).toBeVisible({ timeout });
  }

  async getMessage(): Promise<string> {
    await this.waitForToast();
    return await this.message.innerText();
  }

  async dismiss(): Promise<void> {
    await this.dismissButton.click();
  }
}

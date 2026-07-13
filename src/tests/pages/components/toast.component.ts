import { type Locator, type Page, expect } from '@playwright/test';
import { SEL } from '../../utils/selectors';

export class ToastComponent {
  readonly root: Locator;
  readonly message: Locator;
  readonly dismissButton: Locator;

  constructor(readonly page: Page) {
    this.root = page.locator(SEL.toast.root);
    this.message = page.locator(SEL.toast.message);
    this.dismissButton = this.root.getByRole('button', { name: /dismiss|tutup/i });
  }

  async waitForToast(timeout = 10000): Promise<void> {
    await expect(this.root.first()).toBeVisible({ timeout });
  }

  async getMessage(): Promise<string> {
    await this.waitForToast();
    return await this.message.innerText();
  }

  async dismiss(): Promise<this> {
    await this.dismissButton.click();
    return this;
  }
}

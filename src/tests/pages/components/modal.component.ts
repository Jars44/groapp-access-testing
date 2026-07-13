import { type Locator, type Page, expect } from '@playwright/test';
import { SEL } from '../../utils/selectors';

export class ModalComponent {
  readonly root: Locator;
  readonly closeButton: Locator;
  readonly title: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(readonly page: Page) {
    this.root = page.locator(SEL.modal.root);
    this.closeButton = this.root.getByRole('button', { name: /close|tutup/i });
    this.title = this.root.locator(SEL.modal.title);
    this.confirmButton = this.root.getByRole('button', { name: /confirm|ya|simpan|hapus/i });
    this.cancelButton = this.root.getByRole('button', { name: /cancel|batal|kembali/i });
  }

  async waitForOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async waitForClose(): Promise<void> {
    await expect(this.root).not.toBeVisible();
  }

  async close(): Promise<this> {
    await this.closeButton.click();
    await this.waitForClose();
    return this;
  }

  async confirm(): Promise<this> {
    await this.confirmButton.click();
    return this;
  }

  async cancel(): Promise<this> {
    await this.cancelButton.click();
    return this;
  }
}

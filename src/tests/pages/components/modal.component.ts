import { type Locator, type Page, expect } from '@playwright/test';

export class ModalComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByRole('dialog');
  }

  get closeButton(): Locator {
    return this.root.getByRole('button', { name: /close|tutup/i });
  }

  get title(): Locator {
    return this.root.getByRole('heading');
  }

  get confirmButton(): Locator {
    return this.root.getByRole('button', { name: /confirm|ya|simpan|hapus/i });
  }

  get cancelButton(): Locator {
    return this.root.getByRole('button', { name: /cancel|batal|kembali/i });
  }

  async waitForOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async waitForClose(): Promise<void> {
    await expect(this.root).not.toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.waitForClose();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

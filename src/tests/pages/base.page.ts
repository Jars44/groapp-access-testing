import { type Page } from '@playwright/test';
import { ToastComponent } from './components/toast.component';
import { ModalComponent } from './components/modal.component';

export abstract class BasePage {
  readonly toast: ToastComponent;
  readonly modal: ModalComponent;

  constructor(readonly page: Page, readonly url?: string) {
    this.toast = new ToastComponent(page);
    this.modal = new ModalComponent(page);
  }

  async goto(subpath?: string): Promise<void> {
    const path = subpath ? `${this.url}${subpath}` : this.url;
    await this.page.goto(path!);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForResponse(endpoint: string | RegExp): Promise<void> {
    await this.page.waitForResponse(endpoint);
  }

  async waitForToast(timeout = 10000): Promise<void> {
    await this.toast.waitForToast(timeout);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

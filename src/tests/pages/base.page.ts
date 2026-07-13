import { type Locator, type Page, expect } from '@playwright/test';
import { ToastComponent } from './components/toast.component';
import { ModalComponent } from './components/modal.component';
import { NavbarComponent } from './components/navbar.component';
import { SidebarComponent } from './components/sidebar.component';
import { BreadcrumbComponent } from './components/breadcrumb.component';

export abstract class BasePage {
  readonly toast: ToastComponent;
  readonly modal: ModalComponent;
  readonly navbar: NavbarComponent;
  readonly sidebar: SidebarComponent;
  readonly breadcrumb: BreadcrumbComponent;

  constructor(readonly page: Page, readonly url?: string) {
    this.toast = new ToastComponent(page);
    this.modal = new ModalComponent(page);
    this.navbar = new NavbarComponent(page);
    this.sidebar = new SidebarComponent(page);
    this.breadcrumb = new BreadcrumbComponent(page);
  }

  async goto(subpath?: string): Promise<this> {
    const path = subpath ? `${this.url}${subpath}` : this.url;
    await this.page.goto(path!);
    await this.waitForLoad();
    return this;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForURL(url: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(url, options);
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

  async pressEscape(): Promise<this> {
    await this.page.keyboard.press('Escape');
    return this;
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}

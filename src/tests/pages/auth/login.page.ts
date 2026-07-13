import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { DashboardPage } from '../dashboard/dashboard.page';

export class LoginPage extends BasePage {
  readonly url = '/auth/login';
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.getByRole('textbox', { name: /email/i });
    this.passwordInput = this.page.getByLabel(/kata sandi|password/i);
    this.rememberMeCheckbox = this.page.getByRole('checkbox', { name: /ingat saya|remember me/i });
    this.submitButton = this.page.getByRole('button', { name: /masuk|login|sign in/i });
    this.forgotPasswordLink = this.page.getByRole('link', { name: /lupa kata sandi|forgot password/i });
    this.errorToast = this.page.getByRole('alert');
  }

  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  async fillPassword(password: string): Promise<this> {
    await this.passwordInput.fill(password);
    return this;
  }

  async checkRememberMe(): Promise<this> {
    await this.rememberMeCheckbox.check();
    return this;
  }

  async clickLogin(): Promise<DashboardPage> {
    await this.submitButton.click();
    return new DashboardPage(this.page);
  }

  async login(email: string, password: string): Promise<DashboardPage> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    return this.clickLogin();
  }
}

export class ForgotPasswordPage extends BasePage {
  readonly url = '/auth/forgot-password';
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.getByRole('textbox', { name: /email/i });
    this.submitButton = this.page.getByRole('button', { name: /kirim|send|reset/i });
    this.backToLoginLink = this.page.getByRole('link', { name: /kembali ke login|back to login/i });
  }

  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    return this;
  }

  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}

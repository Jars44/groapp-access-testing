import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  readonly url = '/auth/login';

  constructor(page: Page) {
    super(page);
  }

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get passwordInput(): Locator {
    return this.page.getByLabel('Password');
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: /masuk|login|sign in/i });
  }

  get rememberMeCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /ingat|remember/i });
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByText('Lupa Password');
  }

  get registerLink(): Locator {
    return this.page.getByText('Daftar');
  }

  get showPasswordToggle(): Locator {
    return this.page.locator('button[aria-label*="Password"]');
  }

  get emailError(): Locator {
    return this.page.locator('[data-testid="email-error"], [data-helper-text]').first();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordToggle.click();
  }
}

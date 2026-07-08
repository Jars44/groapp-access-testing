import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class LoginPage extends BasePage {
  readonly url = '/auth/login';

  constructor(page: Page) {
    super(page);
  }

  get emailInput(): Locator {
    return this.page.locator(SEL.form.email);
  }

  get passwordInput(): Locator {
    return this.page.locator(SEL.form.password);
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: /masuk|login|sign in/i });
  }

  get rememberMeCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /ingat|remember/i });
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: /lupa password|lupa kata sandi/i });
  }

  get registerLink(): Locator {
    return this.page.getByRole('link', { name: /daftar|register/i });
  }

  get showPasswordToggle(): Locator {
    return this.page.getByRole('button', { name: /show|sembunyikan|tampilkan password/i });
  }

  get emailError(): Locator {
    return this.page.getByTestId('email-error').or(this.page.locator(SEL.state.error));
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

import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class RegisterPage extends BasePage {
  readonly url = '/auth/register';

  constructor(page: Page) {
    super(page);
  }

  get nameInput(): Locator {
    return this.page.locator('input[name="name"]');
  }
  get emailInput(): Locator {
    return this.page.locator('input[name="email"]');
  }
  get phoneInput(): Locator {
    return this.page.locator('input[name="phone"]');
  }
  get passwordInput(): Locator {
    return this.page.locator('input[name="password"]');
  }
  get confirmPasswordInput(): Locator {
    return this.page.locator('input[name="confirmPassword"]');
  }
  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }
  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox');
  }
  get countryCodeSelector(): Locator {
    return this.page.locator('button[aria-label="Country code"]');
  }
  get passwordToggleButtons(): Locator {
    return this.page.locator('button[aria-label*="Password"]');
  }
  get passwordSecurityIndicator(): Locator {
    return this.page.locator('[data-input-group-password-security="true"]');
  }
  get privacyPolicyLink(): Locator {
    return this.page.getByRole('link', { name: /privacy policy/i }).first();
  }
  get termsLink(): Locator {
    return this.page.getByRole('link', { name: /terms & conditions/i }).first();
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }
  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }
  async checkTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }
}

export class VerificationChooseMethodPage extends BasePage {
  readonly url = '/auth/register/verification-choose-method';
  constructor(page: Page) {
    super(page);
  }
  get emailMethodButton(): Locator {
    return this.page.getByText(/email/i);
  }
  get otpMethodButton(): Locator {
    return this.page.getByText(/otp|whatsapp/i);
  }
}

export class EmailVerificationPage extends BasePage {
  readonly url: string;
  constructor(page: Page) {
    super(page);
    this.url = '/auth/register/verification-email';
  }
  get resendButton(): Locator {
    return this.page.getByRole('button', { name: /kirim ulang|resend/i });
  }
}

export class OtpVerificationPage extends BasePage {
  readonly url = '/auth/register/verification-otp';
  constructor(page: Page) {
    super(page);
  }
  get otpInputs(): Locator {
    return this.page.locator('[data-testid="otp-input"] input');
  }
  get resendButton(): Locator {
    return this.page.getByRole('button', { name: /kirim ulang|resend/i });
  }
}

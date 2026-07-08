import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../data/selectors';

export class RegisterPage extends BasePage {
  readonly url = '/auth/register';

  constructor(page: Page) {
    super(page);
  }

  get nameInput(): Locator {
    return this.page.locator(SEL.form.name);
  }
  get emailInput(): Locator {
    return this.page.locator(SEL.form.email);
  }
  get phoneInput(): Locator {
    return this.page.locator(SEL.form.phone);
  }
  get passwordInput(): Locator {
    return this.page.locator(SEL.form.password);
  }
  get confirmPasswordInput(): Locator {
    return this.page.locator(SEL.form.confirmPassword);
  }
  get submitButton(): Locator {
    return this.page.locator(SEL.button.submit);
  }
  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox');
  }
  get countryCodeSelector(): Locator {
    return this.page.getByRole('button', { name: /country code|kode negara/i });
  }
  get passwordToggleButtons(): Locator {
    return this.page.getByRole('button', { name: /show|hide|sembunyikan|tampilkan password/i });
  }
  get passwordSecurityIndicator(): Locator {
    return this.page.locator(SEL.indicator.passwordSecurity);
  }
  get privacyPolicyLink(): Locator {
    return this.page.getByRole('link', { name: /privacy policy|kebijakan privasi/i });
  }
  get termsLink(): Locator {
    return this.page.getByRole('link', { name: /terms.*conditions|syarat.*ketentuan/i });
  }
  get fieldErrors(): Locator {
    return this.page.locator(SEL.state.error);
  }
  get toastError(): Locator {
    return this.page.getByRole('status').or(this.page.locator(SEL.state.error));
  }
  get emailDisabledNotice(): Locator {
    return this.page.getByText(/email sudah ditentukan|undangan/i);
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.nameInput.blur();
  }
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }
  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
    await this.phoneInput.blur();
  }
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
  }
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
    await this.confirmPasswordInput.blur();
  }
  async checkTerms(): Promise<void> {
    await this.termsCheckbox.click();
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
  get methodGroup(): Locator {
    return this.page.getByRole('radiogroup');
  }
  get emailMethodRadio(): Locator {
    return this.page.getByRole('radio', { name: /sign in with email|masuk dengan email/i });
  }
  get otpMethodRadio(): Locator {
    return this.page.getByRole('radio', { name: /sign in with whatsapp|masuk dengan whatsapp/i });
  }
}

export class EmailVerificationPage extends BasePage {
  constructor(page: Page) {
    super(page, '/auth/register/verification-email');
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
    return this.page.getByTestId('otp-input').locator('input');
  }
  get resendButton(): Locator {
    return this.page.getByRole('button', { name: /kirim ulang|resend/i });
  }
}
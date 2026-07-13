import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class RegisterPage extends BasePage {
  readonly url = '/auth/register';
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly termsCheckbox: Locator;
  readonly countryCodeSelector: Locator;
  readonly passwordToggleButtons: Locator;
  readonly passwordSecurityIndicator: Locator;
  readonly privacyPolicyLink: Locator;
  readonly termsLink: Locator;
  readonly fieldErrors: Locator;
  readonly toastError: Locator;
  readonly emailDisabledNotice: Locator;
  readonly mismatchError: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.page.getByRole('textbox', { name: /nama|name/i });
    this.emailInput = this.page.getByRole('textbox', { name: /email/i });
    this.phoneInput = this.page.getByRole('textbox', { name: /nomor telepon|phone|no telepon/i });
    this.passwordInput = this.page.getByLabel(/kata sandi|password/i);
    this.confirmPasswordInput = this.page.getByLabel(/konfirmasi kata sandi|confirm password|konfirmasi/i);
    this.submitButton = this.page.getByRole('button', { name: /daftar|register/i });
    this.termsCheckbox = this.page.getByRole('checkbox');
    this.countryCodeSelector = this.page.getByRole('button', { name: /country code|kode negara/i });
    this.passwordToggleButtons = this.page.getByRole('button', { name: /show|hide|sembunyikan|tampilkan password/i });
    this.passwordSecurityIndicator = this.page.locator(SEL.indicator.passwordSecurity);
    this.privacyPolicyLink = this.page.getByRole('link', { name: /privacy policy|kebijakan privasi/i });
    this.termsLink = this.page.getByRole('link', { name: /terms.*conditions|syarat.*ketentuan/i });
    this.fieldErrors = this.page.locator(SEL.state.error);
    this.toastError = this.page.getByRole('status').or(this.page.locator(SEL.state.error));
    this.emailDisabledNotice = this.page.getByText(/email sudah ditentukan|undangan/i);
    this.mismatchError = this.page.getByText(/tidak cocok|mismatch|harus sama/i);
  }

  async fillName(name: string): Promise<this> {
    await this.nameInput.fill(name);
    await this.nameInput.blur();
    return this;
  }

  async fillEmail(email: string): Promise<this> {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
    return this;
  }

  async fillPhone(phone: string): Promise<this> {
    await this.phoneInput.fill(phone);
    await this.phoneInput.blur();
    return this;
  }

  async fillPassword(password: string): Promise<this> {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
    return this;
  }

  async fillConfirmPassword(password: string): Promise<this> {
    await this.confirmPasswordInput.fill(password);
    await this.confirmPasswordInput.blur();
    return this;
  }

  async checkTerms(): Promise<this> {
    await this.termsCheckbox.click();
    return this;
  }

  async clickSubmit(): Promise<VerificationChooseMethodPage> {
    await this.submitButton.click();
    return new VerificationChooseMethodPage(this.page);
  }
}

export class VerificationChooseMethodPage extends BasePage {
  readonly url = '/auth/register/verification-choose-method';
  readonly methodGroup: Locator;
  readonly emailMethodRadio: Locator;
  readonly otpMethodRadio: Locator;

  constructor(page: Page) {
    super(page);
    this.methodGroup = this.page.getByRole('radiogroup');
    this.emailMethodRadio = this.page.getByRole('radio', { name: /sign in with email|masuk dengan email/i });
    this.otpMethodRadio = this.page.getByRole('radio', { name: /sign in with whatsapp|masuk dengan whatsapp/i });
  }
}

export class EmailVerificationPage extends BasePage {
  readonly resendButton: Locator;

  constructor(page: Page) {
    super(page, '/auth/register/verification-email');
    this.resendButton = this.page.getByRole('button', { name: /kirim ulang|resend/i });
  }
}

export class OtpVerificationPage extends BasePage {
  readonly url = '/auth/register/verification-otp';
  readonly otpInputs: Locator;
  readonly resendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.otpInputs = this.page.getByTestId(SEL.testid.otpInput).locator('input');
    this.resendButton = this.page.getByRole('button', { name: /kirim ulang|resend/i });
  }
}

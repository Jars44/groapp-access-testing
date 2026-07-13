import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class ProfilePage extends BasePage {
  readonly url = '/profile';
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly userPhone: Locator;
  readonly profilePhoto: Locator;
  readonly editButton: Locator;
  readonly changePasswordButton: Locator;
  readonly deleteAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.userName = this.page.getByTestId(SEL.testid.profileName);
    this.userEmail = this.page.getByTestId(SEL.testid.profileEmail);
    this.userPhone = this.page.getByTestId(SEL.testid.profilePhone);
    this.profilePhoto = this.page.getByTestId(SEL.testid.profilePhoto);
    this.editButton = this.page.getByRole('button', { name: /edit/i });
    this.changePasswordButton = this.page.getByRole('button', { name: /ganti password|change password/i });
    this.deleteAccountButton = this.page.getByRole('button', { name: /hapus akun|delete account/i });
  }
}

export class EditProfilePage extends BasePage {
  readonly nameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.page.getByRole('textbox', { name: /name|nama/i });
    this.saveButton = this.page.getByRole('button', { name: SEL.button.simpan });
    this.cancelButton = this.page.getByRole('button', { name: SEL.button.batal });
  }
}

export class ChangePasswordPage extends BasePage {
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly passwordStrengthIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.currentPasswordInput = this.page.getByLabel(/current|lama|saat ini/i);
    this.newPasswordInput = this.page.getByLabel(/new|baru/i);
    this.confirmPasswordInput = this.page.getByLabel(/confirm|konfirmasi/i);
    this.submitButton = this.page.getByRole('button', { name: /simpan|save|ubah/i });
    this.passwordStrengthIndicator = this.page.getByTestId(SEL.testid.passwordStrength);
  }

  async fillCurrentPassword(password: string): Promise<this> {
    await this.currentPasswordInput.fill(password);
    return this;
  }

  async fillNewPassword(password: string): Promise<this> {
    await this.newPasswordInput.fill(password);
    return this;
  }

  async fillConfirmPassword(password: string): Promise<this> {
    await this.confirmPasswordInput.fill(password);
    return this;
  }

  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}

import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class ProfilePage extends BasePage {
  readonly url = '/profile';

  constructor(page: Page) {
    super(page);
  }

  get userName(): Locator {
    return this.page.getByTestId('profile-name');
  }
  get userEmail(): Locator {
    return this.page.getByTestId('profile-email');
  }
  get userPhone(): Locator {
    return this.page.getByTestId('profile-phone');
  }
  get profilePhoto(): Locator {
    return this.page.getByTestId('profile-photo');
  }
  get editButton(): Locator {
    return this.page.getByRole('button', { name: /edit/i });
  }
  get changePasswordButton(): Locator {
    return this.page.getByText(/ganti password|change password/i);
  }
  get deleteAccountButton(): Locator {
    return this.page.getByText(/hapus akun|delete account/i);
  }
}

export class EditProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get nameInput(): Locator {
    return this.page.getByLabel(/nama|name/i);
  }
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: /simpan|save/i });
  }
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: /batal|cancel/i });
  }
}

export class ChangePasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get currentPasswordInput(): Locator {
    return this.page.getByLabel(/password saat ini|current password/i);
  }
  get newPasswordInput(): Locator {
    return this.page.getByLabel(/password baru|new password/i);
  }
  get confirmPasswordInput(): Locator {
    return this.page.getByLabel(/konfirmasi password|confirm password/i);
  }
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /simpan|save|ubah/i });
  }
  get passwordStrengthIndicator(): Locator {
    return this.page.locator('[data-testid="password-strength"]');
  }

  async fillCurrentPassword(password: string): Promise<void> {
    await this.currentPasswordInput.fill(password);
  }
  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }
  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

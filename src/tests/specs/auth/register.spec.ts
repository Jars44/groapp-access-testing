import { test, expect } from '@playwright/test';
import { RegisterPage, VerificationChooseMethodPage } from '../../pages/auth/register.page';
import { generateRegisterPayload, INVALID_CREDENTIALS } from '../../data/auth.data';

test.describe('Halaman Registrasi — E2E', () => {
  let regPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    regPage = new RegisterPage(page);
    await regPage.goto();
  });

  test('RG-01: menampilkan halaman registrasi dengan semua field formulir', async () => {
    await expect(regPage.nameInput).toBeVisible();
    await expect(regPage.emailInput).toBeVisible();
    await expect(regPage.phoneInput).toBeVisible();
    await expect(regPage.passwordInput).toBeVisible();
    await expect(regPage.confirmPasswordInput).toBeVisible();
    await expect(regPage.submitButton).toBeVisible();
  });

  test('RG-02: tombol submit nonaktif saat formulir kosong', async () => {
    await expect(regPage.submitButton).toBeDisabled();
  });

  test('RG-03: tombol submit aktif saat semua field valid', async () => {
    const payload = generateRegisterPayload();
    await regPage.fillName(payload.name);
    await regPage.fillEmail(payload.email);
    await regPage.fillPhone(payload.phone);
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword(payload.confirmPassword);
    await regPage.checkTerms();
    await expect(regPage.submitButton).toBeEnabled();
  });

  test('RG-04: input password bertipe password secara default', async () => {
    await expect(regPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(regPage.confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('RG-05: toggle visibilitas field password berfungsi', async () => {
    await regPage.passwordToggleButtons.first().click();
    await expect(regPage.passwordInput).toHaveAttribute('type', 'text');
    await regPage.passwordToggleButtons.first().click();
    await expect(regPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('RG-06: toggle visibilitas field konfirmasi password berfungsi', async () => {
    await regPage.passwordToggleButtons.nth(1).click();
    await expect(regPage.confirmPasswordInput).toHaveAttribute('type', 'text');
    await regPage.passwordToggleButtons.nth(1).click();
    await expect(regPage.confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('RG-07: menampilkan 2 tombol alih visibilitas password', async () => {
    await expect(regPage.passwordToggleButtons).toHaveCount(2);
  });

  test('RG-08: menampilkan checkbox persyaratan dan tautan kebijakan privasi', async () => {
    await expect(regPage.termsCheckbox).toBeVisible();
    await expect(regPage.privacyPolicyLink).toBeVisible();
    await expect(regPage.termsLink).toBeVisible();
  });

  test('RG-09: menampilkan pemilih kode negara dengan default +62', async () => {
    await expect(regPage.countryCodeSelector).toContainText('+62');
  });

  test('RG-10: menampilkan indikator keamanan password saat diketik', async () => {
    await regPage.fillPassword('Abc');
    await expect(regPage.passwordSecurityIndicator).toBeVisible();
  });

  test('RG-11: indikator keamanan hilang saat password dikosongkan', async () => {
    await regPage.fillPassword('Abc');
    await expect(regPage.passwordSecurityIndicator).toBeVisible();
    await regPage.fillPassword('');
    await expect(regPage.passwordSecurityIndicator).toHaveCount(0);
  });

  test('RG-12: registrasi dengan data valid mengarahkan ke verifikasi', async ({ page }) => {
    const payload = generateRegisterPayload();
    await regPage.fillName(payload.name);
    await regPage.fillEmail(payload.email);
    await regPage.fillPhone(payload.phone);
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword(payload.confirmPassword);
    await regPage.checkTerms();
    await regPage.clickSubmit();

    await expect(page).toHaveURL(/\/auth\/register\/verification/);
  });

  test('RG-13: registrasi dengan email duplikat menampilkan error', async () => {
    const payload = generateRegisterPayload();
    await regPage.fillName(payload.name);
    await regPage.fillEmail('existing@groapp.id');
    await regPage.fillPhone(payload.phone);
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword(payload.confirmPassword);
    await regPage.checkTerms();
    await regPage.clickSubmit();

    await expect(regPage.toastError).toBeVisible();
  });

  test('RG-14: registrasi dengan password lemah menampilkan indikator', async () => {
    await regPage.fillPassword(INVALID_CREDENTIALS.wrongPassword.slice(0, 3));
    await expect(regPage.passwordSecurityIndicator).toBeVisible();
  });

  test('RG-15: registrasi dengan konfirmasi password tidak cocok', async () => {
    const payload = generateRegisterPayload();
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword('DifferentP@ss1');
    const isSubmitDisabled = await regPage.submitButton.isDisabled();
    expect(isSubmitDisabled).toBeTruthy();
    const hasMismatchError = await regPage.page.getByText(/tidak cocok|mismatch|harus sama/i).isVisible();
    expect(hasMismatchError || isSubmitDisabled).toBeTruthy();
  });

  test('RG-16: registrasi dengan nomor telepon terlalu pendek', async () => {
    const payload = generateRegisterPayload({ phone: '12' });
    await regPage.fillName(payload.name);
    await regPage.fillEmail(payload.email);
    await regPage.fillPhone(payload.phone);
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword(payload.confirmPassword);
    await regPage.checkTerms();
    await expect(regPage.submitButton).toBeDisabled();
  });

  test('RG-17: form kosong menampilkan error pada field required', async () => {
    // Focus and blur fields to trigger validation
    await regPage.nameInput.focus();
    await regPage.nameInput.blur();
    await regPage.emailInput.focus();
    await regPage.emailInput.blur();
    await regPage.phoneInput.focus();
    await regPage.phoneInput.blur();
    const errorCount = await regPage.fieldErrors.count();
    expect(errorCount).toBeGreaterThanOrEqual(3);
  });

  test('RG-18: tombol submit disabled saat loading', async () => {
    const payload = generateRegisterPayload();
    await regPage.fillName(payload.name);
    await regPage.fillEmail(payload.email);
    await regPage.fillPhone(payload.phone);
    await regPage.fillPassword(payload.password);
    await regPage.fillConfirmPassword(payload.confirmPassword);
    await regPage.checkTerms();
    await regPage.clickSubmit();
    await expect(regPage.submitButton).toBeDisabled();
  });

  test('RG-19: field email disabled saat ada konteks undangan', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await context.addInitScript(() => {
      const orig = window.history.constructor.prototype.replaceState;
      window.history.constructor.prototype.replaceState = function (
        data: Record<string, unknown>, _unused: string, url: string | URL | null,
      ) {
        if (data && 'idx' in data && !('usr' in data) && window.location.pathname.includes('/auth/register')) {
          data.usr = {
            invitationContext: {
              email: 'invited@company.com',
              companyName: 'PT Company',
              roleName: 'Admin',
            },
          };
        }
        return orig.call(this, data, _unused, url);
      };
    });
    const invitePage = new RegisterPage(page);
    await invitePage.goto();
    await expect(invitePage.emailInput).toBeDisabled();
    await expect(invitePage.emailInput).toHaveValue('invited@company.com');
    await context.close();
  });

  test('RG-20: menampilkan halaman verifikasi setelah registrasi sukses', async ({ page }) => {
    const payload = generateRegisterPayload({ email: `test.${Date.now()}@groapp.id` });
    const freshPage = new RegisterPage(page);
    await freshPage.goto();
    await freshPage.fillName(payload.name);
    await freshPage.fillEmail(payload.email);
    await freshPage.fillPhone(payload.phone);
    await freshPage.fillPassword(payload.password);
    await freshPage.fillConfirmPassword(payload.confirmPassword);
    await freshPage.checkTerms();
    await freshPage.clickSubmit();

    await page.waitForURL(/\/auth\/register\/verification/);
    const chooseMethod = new VerificationChooseMethodPage(page);
    await expect(chooseMethod.methodGroup).toBeVisible();
  });
});

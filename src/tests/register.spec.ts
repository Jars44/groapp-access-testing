import { test, expect } from '@playwright/test';

test.describe('Halaman Registrasi — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('menampilkan halaman registrasi dengan semua field formulir', async ({ page }) => {
    await expect(page.locator('h5')).toContainText(/account registration/i);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('tombol submit nonaktif saat formulir tidak valid', async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('tombol submit aktif saat semua field valid', async ({ page }) => {
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john@company.com');
    await page.locator('input[name="phone"]').fill('81234567890');
    await page.locator('input[name="password"]').fill('Str0ng!Pass');
    await page.locator('input[name="confirmPassword"]').fill('Str0ng!Pass');
    await page.locator('button[role="checkbox"]').click();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('menampilkan field password bertipe password secara default', async ({ page }) => {
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'password');
  });

  test('mengalihkan visibilitas field password saat diklik', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleBtn = page.locator('button[aria-label*="Password"]').first();
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('mengalihkan visibilitas field konfirmasi password saat diklik', async ({ page }) => {
    const confirmInput = page.locator('input[name="confirmPassword"]');
    const toggleBtns = page.locator('button[aria-label*="Password"]');
    await toggleBtns.nth(1).click();
    await expect(confirmInput).toHaveAttribute('type', 'text');
    await toggleBtns.nth(1).click();
    await expect(confirmInput).toHaveAttribute('type', 'password');
  });

  test('menampilkan tombol alih visibilitas password', async ({ page }) => {
    await expect(page.locator('button[aria-label="Show Password"]')).toHaveCount(2);
  });

  test('menampilkan checkbox persyaratan dan tautan kebijakan privasi', async ({ page }) => {
    await expect(page.getByRole('checkbox')).toBeVisible();
    await expect(page.locator('button[role="checkbox"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /terms & conditions/i }).first()).toBeVisible();
  });

  test('menampilkan pemilih kode negara dengan default +62', async ({ page }) => {
    await expect(page.locator('button[aria-label="Country code"]')).toContainText('+62');
  });

  test('menampilkan indikator keamanan password saat diketik', async ({ page }) => {
    await page.locator('input[name="password"]').fill('Abc');
    await expect(page.locator('[data-input-group-password-security="true"]')).toBeVisible();
  });

  test('menyembunyikan indikator keamanan password saat dikosongkan', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Abc');
    await expect(page.locator('[data-input-group-password-security="true"]')).toBeVisible();
    await passwordInput.fill('');
    await expect(page.locator('[data-input-group-password-security="true"]')).toHaveCount(0);
  });

  test('menonaktifkan field email saat state undangan ada', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:4173',
    });
    const page = await context.newPage();
    await context.addInitScript(() => {
      const origReplaceState = window.history.constructor.prototype.replaceState;
      window.history.constructor.prototype.replaceState = function (data: Record<string, unknown>, _unused: string, url: string | URL | null) {
        if (data && 'idx' in data && !('usr' in data) && window.location.pathname.includes('/auth/register')) {
          data.usr = {
            invitationContext: {
              email: 'invited@company.com',
              companyName: 'PT Company',
              roleName: 'Admin',
            },
          };
        }
        return origReplaceState.call(this, data, _unused, url);
      };
    });
    await page.goto('/auth/register');
    await expect(page.locator('input[name="email"]')).toBeDisabled();
    await expect(page.locator('input[name="email"]')).toHaveValue('invited@company.com');
    await context.close();
  });
});

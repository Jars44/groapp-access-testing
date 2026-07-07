import { test as base, type Page } from '@playwright/test';
import { TEST_USER } from '../data/constants';
import { LoginPage } from '../pages/auth/login.page';

export { expect } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: undefined,
    });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.fillPassword(TEST_USER.password);
    await loginPage.clickLogin();
    await page.waitForURL(/\/dashboard/);
    await use(page);
    await context.close();
  },
});

import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class OnboardingPage extends BasePage {
  readonly url = '/onboarding';

  constructor(page: Page) {
    super(page);
  }

  get stepper(): Locator {
    return this.page.locator('[data-testid="stepper"]');
  }
  get stepIndicators(): Locator {
    return this.page.locator('[data-testid="step-indicator"]');
  }
  get workspaceNameInput(): Locator {
    return this.page.getByLabel(/nama workspace/i);
  }
  get companyNameInput(): Locator {
    return this.page.getByLabel(/nama perusahaan/i);
  }
  get businessTypeDropdown(): Locator {
    return this.page.getByTestId('business-type-select');
  }
  get unitNameInput(): Locator {
    return this.page.getByLabel(/nama unit/i);
  }
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /selesai|submit|simpan/i });
  }
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: /lanjut|next|selanjutnya/i });
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: /kembali|back/i });
  }
}

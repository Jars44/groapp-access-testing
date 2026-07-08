import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class OnboardingPage extends BasePage {
  readonly url = '/onboarding';

  constructor(page: Page) {
    super(page);
  }

  get stepper(): Locator {
    return this.page.locator(SEL.indicator.stepper);
  }
  get stepIndicators(): Locator {
    return this.page.getByTestId('step-indicator');
  }
  get workspaceNameInput(): Locator {
    return this.page.locator('input[name="workspaceName"], [name="workspace_name"]');
  }
  get companyNameInput(): Locator {
    return this.page.locator(SEL.form.name);
  }
  get businessTypeDropdown(): Locator {
    return this.page.getByTestId('business-type-select');
  }
  get unitNameInput(): Locator {
    return this.page.locator('input[name="unitName"], [name="unit_name"], [name="unit"]');
  }
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: SEL.button.simpan });
  }
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: SEL.button.lanjut });
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: SEL.button.kembali });
  }
}

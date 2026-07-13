import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class OnboardingPage extends BasePage {
  readonly url = '/onboarding';
  readonly stepper: Locator;
  readonly stepIndicators: Locator;
  readonly workspaceNameInput: Locator;
  readonly companyNameInput: Locator;
  readonly businessTypeDropdown: Locator;
  readonly unitNameInput: Locator;
  readonly submitButton: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.stepper = this.page.getByTestId(SEL.testid.stepper);
    this.stepIndicators = this.page.getByTestId(SEL.testid.stepIndicator);
    this.workspaceNameInput = this.page.getByRole('textbox', { name: /workspace/i });
    this.companyNameInput = this.page.getByRole('textbox', { name: /company|perusahaan/i });
    this.businessTypeDropdown = this.page.getByTestId(SEL.testid.businessTypeSelect);
    this.unitNameInput = this.page.getByRole('textbox', { name: /unit/i });
    this.submitButton = this.page.getByRole('button', { name: SEL.button.simpan });
    this.nextButton = this.page.getByRole('button', { name: SEL.button.lanjut });
    this.backButton = this.page.getByRole('button', { name: SEL.button.kembali });
  }
}

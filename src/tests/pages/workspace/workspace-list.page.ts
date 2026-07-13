import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class WorkspaceListPage extends BasePage {
  readonly url = '/workspaces';
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly workspaceCards: Locator;
  readonly emptyState: Locator;
  readonly loadMoreTrigger: Locator;
  readonly typeToConfirmInput: Locator;
  readonly deleteConfirmButton: Locator;
  readonly impactInfoModal: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = this.page.getByRole('button', { name: SEL.button.tambah });
    this.searchInput = this.page.getByRole('searchbox');
    this.workspaceCards = this.page.getByTestId(SEL.testid.workspaceCard);
    this.emptyState = this.page.getByTestId(SEL.testid.emptyData);
    this.loadMoreTrigger = this.page.getByTestId(SEL.testid.infiniteScrollTrigger);
    this.typeToConfirmInput = this.page.getByPlaceholder(/ketik|type to confirm|ketik nama/i);
    this.deleteConfirmButton = this.page.getByRole('button', { name: /hapus|delete/i });
    this.impactInfoModal = this.page.getByRole('dialog').filter({ hasText: /dampak|impact/i });
  }

  async search(keyword: string): Promise<this> {
    await this.searchInput.fill(keyword);
    return this;
  }

  async clickCreate(): Promise<this> {
    await this.createButton.click();
    return this;
  }

  async clickWorkspace(index = 0): Promise<this> {
    await this.workspaceCards.nth(index).click();
    return this;
  }
}

export class WorkspaceFormModalPage extends BasePage {
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly errorText: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.page.getByRole('dialog').getByRole('textbox', { name: /name|nama|workspace/i });
    this.submitButton = this.page.getByRole('dialog').getByRole('button', { name: SEL.button.simpan });
    this.errorText = this.page.getByRole('dialog').locator(SEL.state.error);
    this.cancelButton = this.page.getByRole('dialog').getByRole('button', { name: SEL.button.batal });
  }

  async fillName(name: string): Promise<this> {
    await this.nameInput.fill(name);
    return this;
  }

  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}

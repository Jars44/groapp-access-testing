import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class WorkspaceListPage extends BasePage {
  readonly url = '/workspaces';

  constructor(page: Page) {
    super(page);
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: SEL.button.tambah });
  }
  get searchInput(): Locator {
    return this.page.locator(SEL.form.search);
  }
  get workspaceCards(): Locator {
    return this.page.getByTestId('workspace-card');
  }
  get emptyState(): Locator {
    return this.page.getByTestId('empty-data');
  }
  get loadMoreTrigger(): Locator {
    return this.page.getByTestId('infinite-scroll-trigger');
  }
  get typeToConfirmInput(): Locator {
    return this.page.locator('input[name="confirmName"], input[placeholder*="ketik" i]');
  }
  get deleteConfirmButton(): Locator {
    return this.page.getByRole('button', { name: /hapus|delete/i });
  }
  get impactInfoModal(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: /dampak|impact/i });
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickWorkspace(index = 0): Promise<void> {
    await this.workspaceCards.nth(index).click();
  }
}

export class WorkspaceFormModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get nameInput(): Locator {
    return this.page.getByRole('dialog').locator('input[name="name"]');
  }
  get submitButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: SEL.button.simpan });
  }
  get errorText(): Locator {
    return this.page.getByRole('dialog').locator(SEL.state.error);
  }
  get cancelButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: SEL.button.batal });
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }
  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

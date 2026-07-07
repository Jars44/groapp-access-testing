import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class WorkspaceListPage extends BasePage {
  readonly url = '/workspaces';

  constructor(page: Page) {
    super(page);
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: /tambah|buat|create/i });
  }
  get searchInput(): Locator {
    return this.page.getByPlaceholder(/cari|search/i);
  }
  get workspaceCards(): Locator {
    return this.page.locator('[data-testid="workspace-card"]');
  }
  get emptyState(): Locator {
    return this.page.getByTestId('empty-data');
  }
  get loadMoreTrigger(): Locator {
    return this.page.locator('[data-testid="infinite-scroll-trigger"]');
  }
  get typeToConfirmInput(): Locator {
    return this.page.getByLabel(/ketik|type|confirm/i);
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
    return this.page.getByRole('dialog').getByLabel(/nama|name/i);
  }
  get submitButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: /simpan|save|buat|create/i });
  }
  get errorText(): Locator {
    return this.page.getByRole('dialog').locator('[data-helper-text], [data-error]');
  }
  get cancelButton(): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: /batal|cancel/i });
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }
  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

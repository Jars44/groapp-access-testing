import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CompanyDetailPage extends BasePage {
  readonly url: string;

  constructor(page: Page, companyId?: string) {
    super(page);
    this.url = companyId ? `/companies/${companyId}` : '/companies/:id';
  }

  get companyName(): Locator {
    return this.page.getByTestId('company-name');
  }
  get navigationCards(): Locator {
    return this.page.locator('[data-testid="nav-card"]');
  }
  get profileLink(): Locator {
    return this.page.getByText(/profile/i);
  }
  get deleteButton(): Locator {
    return this.page.getByRole('button', { name: /hapus|delete/i });
  }
  get loadingSkeleton(): Locator {
    return this.page.locator('[data-testid="skeleton"]');
  }
  get forbiddenMessage(): Locator {
    return this.page.getByText(/akses ditolak|forbidden/i);
  }
}

export class CompanyProfilePage extends BasePage {
  readonly url: string;

  constructor(page: Page, companyId?: string) {
    super(page);
    this.url = companyId ? `/companies/${companyId}/profile` : '/companies/:id/profile';
  }

  get editIdentityButton(): Locator {
    return this.page.getByRole('button', { name: /edit identitas/i });
  }
  get editAddressButton(): Locator {
    return this.page.getByRole('button', { name: /edit alamat/i });
  }
  get editContactButton(): Locator {
    return this.page.getByRole('button', { name: /edit kontak/i });
  }
  get editLegalButton(): Locator {
    return this.page.getByRole('button', { name: /edit legal/i });
  }
  get confirmNameInput(): Locator {
    return this.page.getByLabel(/konfirmasi nama/i);
  }
  get saveButton(): Locator {
    return this.page.getByRole('button', { name: /simpan|save/i });
  }
}

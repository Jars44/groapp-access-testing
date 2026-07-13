import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { SEL } from '../../utils/selectors';

export class CompanyDetailPage extends BasePage {
  readonly companyName: Locator;
  readonly navigationCards: Locator;
  readonly profileLink: Locator;
  readonly deleteButton: Locator;
  readonly loadingSkeleton: Locator;
  readonly forbiddenMessage: Locator;

  constructor(page: Page, companyId?: string) {
    super(page, companyId ? `/companies/${companyId}` : '/companies/:id');
    this.companyName = this.page.getByTestId(SEL.testid.companyName);
    this.navigationCards = this.page.getByTestId(SEL.testid.navCard);
    this.profileLink = this.page.getByRole('link', { name: /profile/i });
    this.deleteButton = this.page.getByRole('button', { name: /hapus|delete/i });
    this.loadingSkeleton = this.page.locator(SEL.state.skeleton);
    this.forbiddenMessage = this.page.getByText(/akses ditolak|forbidden/i);
  }
}

export class CompanyProfilePage extends BasePage {
  readonly editIdentityButton: Locator;
  readonly editAddressButton: Locator;
  readonly editContactButton: Locator;
  readonly editLegalButton: Locator;
  readonly confirmNameInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page, companyId?: string) {
    super(page, companyId ? `/companies/${companyId}/profile` : '/companies/:id/profile');
    this.editIdentityButton = this.page.getByRole('button', { name: /edit identitas/i });
    this.editAddressButton = this.page.getByRole('button', { name: /edit alamat/i });
    this.editContactButton = this.page.getByRole('button', { name: /edit kontak/i });
    this.editLegalButton = this.page.getByRole('button', { name: /edit legal/i });
    this.confirmNameInput = this.page.getByRole('textbox', { name: /konfirmasi|confirm/i });
    this.saveButton = this.page.getByRole('button', { name: SEL.button.simpan });
  }
}

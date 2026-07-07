# Cakupan E2E — Fitur Perusahaan (Company)

**Fitur:** CRUD perusahaan, detail dengan seksi (identitas/alamat/kontak/legal), geo cascading, unggah logo, atur perusahaan utama (default)

**Prioritas:** P0 (Critical)
**Route:** `/companies`, `/companies/:companyId`, `/companies/:companyId/profile`
**Source:** `src/features/company/`

---

## 1. Pendahuluan

Company feature mengelola data perusahaan dalam workspace. Pengguna dapat membuat, melihat, mengubah, dan menghapus perusahaan. Setiap perusahaan memiliki beberapa seksi data: identitas (nama, tipe bisnis), alamat (lengkap dengan geo cascade provinsi→kota→kecamatan→kelurahan), kontak (email, telepon, website), dan legal (NPWP, NIB, PKP). Fitur tambahan: unggah logo perusahaan, atur salah satu perusahaan sebagai default, serta navigasi ke unit, role, dan user dalam konteks perusahaan.

**Aturan bisnis kunci:**

- Nama perusahaan unik per workspace
- Minimal 3 karakter, maksimal 60 karakter
- Tipe bisnis: jasa, retail, manufaktur
- Geo cascade: 4 level berurutan (provinsi → kota → kecamatan → kelurahan)
- Hanya satu perusahaan utama (default) per pengguna
- Upload logo: maksimal 2MB, tipe gambar valid

---

## 2. Struktur File Test

```text
tests/
├── data/
│   └── company.data.ts              # Factory payload, validation constants
│
├── pages/
│   ├── company/
│   │   ├── company-list.page.ts     # Tabel daftar perusahaan
│   │   ├── company-detail.page.ts   # Halaman detail + navigasi cards
│   │   ├── company-profile.page.ts  # Form edit per seksi (identity/address/contact/legal)
│   │   └── company-form-modal.page.ts  # Modal create perusahaan
│   └── components/
│       ├── geo-cascade.component.ts # Provinsi→Kota→Kecamatan→Kelurahan dropdowns
│       ├── logo-upload.component.ts # Upload + preview + delete logo
│       └── confirm-input.component.ts # Input nama untuk konfirmasi delete
│
├── specs/
│   └── company/
│       ├── company-list.spec.ts
│       ├── company-create.spec.ts
│       ├── company-detail.spec.ts
│       ├── company-update.spec.ts
│       ├── company-delete.spec.ts
│       └── company-logo.spec.ts
│
└── fixtures/
    └── company.fixture.ts           # Pre-created company context
```

---

## 3. Skenario E2E Playwright

### 3.1 Company List

**File:** `tests/specs/company/company-list.spec.ts`
**Page Object:** `company/company-list.page.ts`

| #     | Nama Test                                                      | Assertion                                   |
| ----- | -------------------------------------------------------------- | ------------------------------------------- |
| CL-01 | menampilkan daftar perusahaan dengan semua kolom               | Table header + rows visible                 |
| CL-02 | menampilkan nama perusahaan, workspace, status di setiap baris | Column content visible per row              |
| CL-03 | menampilkan EmptyData saat tidak ada perusahaan                | Empty state component visible               |
| CL-04 | mencari perusahaan berdasarkan nama                            | Filtered results match keyword              |
| CL-05 | mencari dengan keyword tidak ditemukan                         | Empty state "tidak ditemukan"               |
| CL-06 | navigasi ke detail perusahaan saat baris diklik                | URL contains `/companies/:id`               |
| CL-07 | menampilkan indikator perusahaan utama (default)               | Badge "Utama" visible                       |
| CL-08 | menampilkan jumlah unit aktif/nonaktif                         | Count badges visible                        |
| CL-09 | loading state saat memuat daftar                               | Skeleton/loader visible                     |
| CL-10 | refresh daftar setelah create/delete                           | List memperbarui dengan data baru           |
| CL-11 | sorting berdasarkan nama perusahaan (asc/desc)                 | Sort indicator berubah, urutan berubah      |
| CL-12 | pagination — klik halaman berikutnya                           | Halaman berikutnya termuat                  |
| CL-13 | pagination — tampilkan jumlah item per halaman                 | Dropdown rows-per-page berfungsi            |
| CL-14 | daftar hanya menampilkan perusahaan dari workspace aktif       | Tidak ada perusahaan dari workspace lain    |
| CL-15 | status perusahaan — toggle filter aktif/nonaktif/semua         | Filter menampilkan perusahaan sesuai status |

**Pola kode:**

```typescript
// Selector patterns — CompanyListPage
readonly table = this.page.getByTestId('company-table');
readonly searchInput = this.page.getByTestId('search-input');
readonly rows = this.page.getByTestId('company-row');
readonly emptyState = this.page.getByTestId('empty-data');
readonly defaultBadge = this.page.getByTestId('default-badge');
readonly skeleton = this.page.getByTestId('table-skeleton');

async search(keyword: string): Promise<void> {
  await this.searchInput.fill(keyword);
  await this.waitForResponse('/companies/search');
  return this;
}

async clickRow(index: number): Promise<CompanyDetailPage> {
  await this.rows.nth(index).click();
  await this.page.waitForURL(/\/companies\/.+/);
  return new CompanyDetailPage(this.page);
}
```

---

### 3.2 Company Create

**File:** `tests/specs/company/company-create.spec.ts`
**Page Object:** `company/company-form-modal.page.ts`

| #     | Nama Test                                                         | Assertion                                             |
| ----- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| CC-01 | membuka modal form create dari tombol Tambah                      | Modal create visible dengan title "Tambah Perusahaan" |
| CC-02 | form create menampilkan semua seksi yang diperlukan               | Identity, address, contact, legal sections visible    |
| CC-03 | membuat perusahaan dengan field wajib minimal (nama, tipe bisnis) | Sukses, muncul di list                                |
| CC-04 | membuat perusahaan dengan data lengkap semua seksi                | Semua data tersimpan sesuai input                     |
| CC-05 | validasi nama perusahaan — minimal 3 karakter                     | Error "Nama minimal 3 karakter"                       |
| CC-06 | validasi nama perusahaan — maksimal 60 karakter                   | Error "Nama maksimal 60 karakter"                     |
| CC-07 | validasi nama perusahaan — karakter tidak valid                   | Error "Hanya huruf, angka, titik, koma, spasi"        |
| CC-08 | validasi nama perusahaan — duplikat dalam workspace               | Error "Nama perusahaan sudah digunakan"               |
| CC-09 | validasi nama perusahaan — required                               | Error "Nama wajib diisi"                              |
| CC-10 | memilih tipe bisnis dari dropdown (jasa, retail, manufaktur)      | Ketiga tipe dapat dipilih                             |
| CC-11 | memilih workspace dari dropdown                                   | Workspace options terdaftar                           |
| CC-12 | geo cascade — pilih provinsi memuat daftar kota                   | Dropdown kota terisi setelah provinsi dipilih         |
| CC-13 | geo cascade — pilih kota memuat daftar kecamatan                  | Dropdown kecamatan terisi setelah kota dipilih        |
| CC-14 | geo cascade — pilih kecamatan memuat daftar kelurahan             | Dropdown kelurahan terisi setelah kecamatan dipilih   |
| CC-15 | geo cascade — reset level bawah saat level atas berubah           | Kota/kecamatan/kelurahan ter-reset                    |
| CC-16 | validasi kode pos — maksimal 5 digit                              | Error "Kode pos maksimal 5 digit"                     |
| CC-17 | validasi kode pos — input huruf                                   | Error "Hanya angka"                                   |
| CC-18 | validasi email — format tidak valid                               | Error "Email tidak valid"                             |
| CC-19 | validasi nomor telepon — maksimal 13 digit                        | Error "Nomor telepon maksimal 13 digit"               |
| CC-20 | validasi nomor telepon — format internasional                     | Error "Format nomor tidak valid"                      |
| CC-21 | validasi NPWP — format tidak valid                                | Error "NPWP tidak valid"                              |
| CC-22 | validasi NIB — format tidak valid                                 | Error "NIB tidak valid"                               |
| CC-23 | upload logo perusahaan — file gambar valid                        | Preview logo visible, upload sukses                   |
| CC-24 | upload logo — file melebihi 2MB                                   | Error "Ukuran file maksimal 2MB"                      |
| CC-25 | upload logo — tipe file tidak didukung                            | Error "Tipe file tidak didukung"                      |
| CC-26 | tombol submit disabled saat loading                               | Spinner + disabled attribute                          |
| CC-27 | menutup modal dengan data belum disimpan — konfirmasi             | Confirm dialog "Data belum disimpan"                  |
| CC-28 | membuat perusahaan di workspace berbeda                           | Perusahaan muncul di workspace terkait                |
| CC-29 | submit dengan form kosong — semua validasi muncul                 | Semua field required error visible                    |
| CC-30 | alamat — field alamat jalan maksimal 255 karakter                 | Error "Alamat maksimal 255 karakter"                  |

**Pola kode:**

```typescript
// Selector patterns — CompanyFormModal
readonly modal = this.page.getByTestId('company-form-modal');
readonly nameInput = this.page.getByTestId('company-name-input');
readonly businessTypeSelect = this.page.getByTestId('business-type-select');
readonly workspaceSelect = this.page.getByTestId('workspace-select');
readonly submitButton = this.page.getByTestId('submit-button');
readonly logoUpload = this.page.getByTestId('logo-upload');
readonly geoProvince = this.page.getByTestId('geo-province');
readonly geoCity = this.page.getByTestId('geo-city');
readonly geoDistrict = this.page.getByTestId('geo-district');
readonly geoVillage = this.page.getByTestId('geo-village');

async fillIdentity(name: string, businessType: string): Promise<this> {
  await this.nameInput.fill(name);
  await this.businessTypeSelect.click();
  await this.page.getByRole('option', { name: businessType }).click();
  return this;
}

async selectGeo(province: string, city: string): Promise<this> {
  await this.geoProvince.selectOption(province);
  await this.waitForResponse('/geo/provinces/*/cities');
  await this.geoCity.selectOption(city);
  return this;
}

async submit(): Promise<void> {
  await this.submitButton.click();
  await this.waitForToast();
}
```

---

### 3.3 Company Detail

**File:** `tests/specs/company/company-detail.spec.ts`
**Page Object:** `company/company-detail.page.ts`

| #     | Nama Test                                                | Assertion                                |
| ----- | -------------------------------------------------------- | ---------------------------------------- |
| CD-01 | menampilkan halaman detail dengan semua informasi        | Company name, type, status visible       |
| CD-02 | menampilkan navigation cards (profile, unit, role, user) | 4 cards visible dengan ikon dan label    |
| CD-03 | loading state saat memuat detail                         | Skeleton/loader visible                  |
| CD-04 | data seksi identitas tampil di halaman detail            | Nama, tipe bisnis, workspace tampil      |
| CD-05 | data seksi alamat tampil di halaman detail               | Alamat lengkap dengan geo cascade tampil |
| CD-06 | data seksi kontak tampil di halaman detail               | Email, telepon, website tampil           |
| CD-07 | data seksi legal tampil di halaman detail                | NPWP, NIB, PKP status tampil             |
| CD-08 | forbidden company — akses ditolak                        | Pesan "Akses ditolak"                    |
| CD-09 | not-found company — 404                                  | Halaman tidak ditemukan                  |
| CD-10 | klik card profile navigasi ke halaman profil             | URL contains `/profile`                  |
| CD-11 | klik card unit navigasi ke daftar unit                   | URL contains `/units`                    |
| CD-12 | klik card role navigasi ke daftar role                   | URL contains `/roles`                    |
| CD-13 | klik card user navigasi ke daftar user                   | URL contains `/users`                    |
| CD-14 | breadcrumb menampilkan navigasi Companies → {nama}       | Breadcrumb visible dengan link           |
| CD-15 | logo perusahaan tampil di halaman detail                 | Logo image visible                       |

**Pola kode:**

```typescript
// Selector patterns — CompanyDetailPage
readonly companyName = this.page.getByTestId('company-detail-name');
readonly companyType = this.page.getByTestId('company-detail-type');
readonly companyStatus = this.page.getByTestId('company-detail-status');
readonly navCards = {
  profile: this.page.getByTestId('nav-card-profile'),
  unit: this.page.getByTestId('nav-card-unit'),
  role: this.page.getByTestId('nav-card-role'),
  user: this.page.getByTestId('nav-card-user'),
};
readonly skeleton = this.page.getByTestId('detail-skeleton');
readonly forbiddenMessage = this.page.getByTestId('forbidden-message');

async navigateToProfile(): Promise<CompanyProfilePage> {
  await this.navCards.profile.click();
  await this.page.waitForURL(/\/companies\/.+\/profile/);
  return new CompanyProfilePage(this.page);
}
```

---

### 3.4 Company Update

**File:** `tests/specs/company/company-update.spec.ts`
**Page Object:** `company/company-profile.page.ts`

**Seksi Identitas:**

| #     | Nama Test                                       | Assertion                               |
| ----- | ----------------------------------------------- | --------------------------------------- |
| CU-01 | mengubah nama perusahaan — valid                | Sukses, nama berubah                    |
| CU-02 | mengubah nama perusahaan — nama sudah digunakan | Error "Nama perusahaan sudah digunakan" |
| CU-03 | mengubah tipe bisnis                            | Sukses, tipe berubah                    |
| CU-04 | mengubah nama — field kosong                    | Error "Nama wajib diisi"                |
| CU-05 | mengubah nama — minimal 3 karakter              | Error "Nama minimal 3 karakter"         |
| CU-06 | mengubah status perusahaan (aktif/nonaktif)     | Status toggled                          |
| CU-07 | membatalkan perubahan (cancel)                  | Data kembali ke nilai awal              |

**Seksi Alamat:**

| #     | Nama Test                                                   | Assertion                            |
| ----- | ----------------------------------------------------------- | ------------------------------------ |
| CU-08 | mengubah alamat dengan geo cascade lengkap                  | Semua level geo terisi, sukses       |
| CU-09 | mengubah provinsi — data kota/kecamatan/kelurahan ter-reset | Level bawah kosong                   |
| CU-10 | mengubah kode pos — valid                                   | Sukses                               |
| CU-11 | mengubah kode pos — lebih dari 5 digit                      | Error "Kode pos maksimal 5 digit"    |
| CU-12 | mengubah alamat jalan — maksimal 255 karakter               | Error "Alamat maksimal 255 karakter" |
| CU-13 | geo cascade — loading state saat memuat data kecamatan      | Dropdown menunjukkan loading         |
| CU-14 | mengosongkan field alamat (opsional)                        | Sukses, field kosong                 |

**Seksi Kontak:**

| #     | Nama Test                                   | Assertion                               |
| ----- | ------------------------------------------- | --------------------------------------- |
| CU-15 | mengubah email — format valid               | Sukses                                  |
| CU-16 | mengubah email — format tidak valid         | Error "Email tidak valid"               |
| CU-17 | mengubah email — email sudah digunakan      | Error "Email sudah digunakan"           |
| CU-18 | mengubah nomor telepon — valid              | Sukses                                  |
| CU-19 | mengubah nomor telepon — maksimal 13 digit  | Error "Nomor telepon maksimal 13 digit" |
| CU-20 | mengubah nomor telepon — karakter non-digit | Error "Hanya angka"                     |
| CU-21 | mengubah website — format URL valid         | Sukses                                  |
| CU-22 | mengubah website — format URL tidak valid   | Error "URL tidak valid"                 |
| CU-23 | mengosongkan website (opsional)             | Sukses                                  |

**Seksi Legal:**

| #     | Nama Test                                 | Assertion                 |
| ----- | ----------------------------------------- | ------------------------- |
| CU-24 | mengubah NPWP — format valid              | Sukses                    |
| CU-25 | mengubah NPWP — format tidak valid        | Error "NPWP tidak valid"  |
| CU-26 | mengubah NIB — format valid               | Sukses                    |
| CU-27 | mengubah NIB — format tidak valid         | Error "NIB tidak valid"   |
| CU-28 | mengubah status PKP (on/off)              | Status PKP berubah        |
| CU-29 | mengosongkan semua field legal (opsional) | Sukses                    |
| CU-30 | loading state saat menyimpan perubahan    | Button spinner + disabled |

**Pola kode:**

```typescript
// Selector patterns — CompanyProfilePage
readonly identitySection = this.page.getByTestId('section-identity');
readonly addressSection = this.page.getByTestId('section-address');
readonly contactSection = this.page.getByTestId('section-contact');
readonly legalSection = this.page.getByTestId('section-legal');

readonly nameInput = this.page.getByTestId('edit-name-input');
readonly statusToggle = this.page.getByTestId('status-toggle');
readonly emailInput = this.page.getByTestId('edit-email-input');
readonly phoneInput = this.page.getByTestId('edit-phone-input');
readonly npwpInput = this.page.getByTestId('edit-npwp-input');
readonly nibInput = this.page.getByTestId('edit-nib-input');
readonly pkpToggle = this.page.getByTestId('pkp-toggle');

readonly saveButton = this.page.getByTestId('save-section-button');
readonly cancelButton = this.page.getByTestId('cancel-section-button');

async updateIdentity(name: string, businessType?: string): Promise<this> {
  await this.nameInput.clear();
  await this.nameInput.fill(name);
  if (businessType) {
    await this.businessTypeSelect.click();
    await this.page.getByRole('option', { name: businessType }).click();
  }
  await this.saveButton.click();
  await this.waitForToast();
  return this;
}

async updateEmail(email: string): Promise<this> {
  await this.emailInput.clear();
  await this.emailInput.fill(email);
  await this.saveButton.click();
  await this.waitForToast();
  return this;
}
```

---

### 3.5 Company Delete

**File:** `tests/specs/company/company-delete.spec.ts`
**Page Object:** `company/company-detail.page.ts`

| #      | Nama Test                                                      | Assertion                                       |
| ------ | -------------------------------------------------------------- | ----------------------------------------------- |
| CDL-01 | precheck delete — perusahaan boleh dihapus                     | Dialog konfirmasi muncul dengan input nama      |
| CDL-02 | precheck delete — diblokir karena memiliki transaksi           | Pesan "Tidak dapat dihapus, memiliki transaksi" |
| CDL-03 | precheck delete — diblokir karena memiliki unit aktif          | Pesan "Nonaktifkan unit terlebih dahulu"        |
| CDL-04 | precheck delete — diblokir karena merupakan perusahaan default | Pesan "Ubah perusahaan utama terlebih dahulu"   |
| CDL-05 | precheck delete — diblokir karena memiliki pengguna aktif      | Pesan "Hapus pengguna terlebih dahulu"          |
| CDL-06 | konfirmasi delete — input nama sesuai                          | Perusahaan terhapus, redirect ke daftar         |
| CDL-07 | konfirmasi delete — input nama tidak sesuai                    | Error "Nama tidak cocok"                        |
| CDL-08 | konfirmasi delete — tekan tombol batal                         | Dialog tertutup, tidak ada perubahan            |
| CDL-09 | konfirmasi delete — loading state saat menghapus               | Button spinner + disabled                       |
| CDL-10 | konfirmasi delete — error dari server                          | Error toast, data tidak berubah                 |

**Pola kode:**

```typescript
// Selector patterns — CompanyDetailPage (delete section)
readonly deleteButton = this.page.getByTestId('delete-company-button');
readonly deleteConfirmModal = this.page.getByTestId('delete-confirm-modal');
readonly deleteNameInput = this.page.getByTestId('delete-name-input');
readonly deleteConfirmButton = this.page.getByTestId('delete-confirm-button');
readonly deleteCancelButton = this.page.getByTestId('delete-cancel-button');
readonly deleteBlockedMessage = this.page.getByTestId('delete-blocked-message');
readonly deleteImpactList = this.page.getByTestId('delete-impact-list');

async clickDelete(): Promise<this> {
  await this.deleteButton.click();
  await this.deleteConfirmModal.waitFor();
  return this;
}

async confirmDelete(companyName: string): Promise<CompanyListPage> {
  await this.deleteNameInput.fill(companyName);
  await this.deleteConfirmButton.click();
  await this.waitForResponse('/companies/*', 'DELETE');
  await this.page.waitForURL('/companies');
  return new CompanyListPage(this.page);
}

async verifyBlocked(message: string): Promise<this> {
  await expect(this.deleteBlockedMessage).toContainText(message);
  await expect(this.deleteConfirmButton).toBeDisabled();
  return this;
}
```

---

### 3.6 Company Logo & Default

**File:** `tests/specs/company/company-logo.spec.ts`
**Page Object:** `company/company-profile.page.ts`, `components/logo-upload.component.ts`

| #       | Nama Test                                                   | Assertion                          |
| ------- | ----------------------------------------------------------- | ---------------------------------- |
| LOGO-01 | upload logo perusahaan — file gambar valid (.jpg)           | Logo tampil di preview             |
| LOGO-02 | upload logo — file .png transparan                          | Logo tampil, background transparan |
| LOGO-03 | upload logo — file .webp                                    | Logo tampil                        |
| LOGO-04 | upload logo — ganti dengan logo baru                        | Logo lama terganti                 |
| LOGO-05 | upload logo — file melebihi 2MB                             | Error "Ukuran file maksimal 2MB"   |
| LOGO-06 | upload logo — file dengan dimensi terlalu kecil             | Error atau warning dimensi         |
| LOGO-07 | upload logo — tipe file tidak didukung (.pdf)               | Error "Tipe file tidak didukung"   |
| LOGO-08 | hapus logo perusahaan                                       | Logo removed, placeholder muncul   |
| LOGO-09 | hapus logo — konfirmasi sebelum hapus                       | Confirm dialog                     |
| LOGO-10 | loading state saat upload logo                              | Progress indicator visible         |
| LOGO-11 | set sebagai perusahaan utama (default)                      | Badge "Utama" muncul               |
| LOGO-12 | set perusahaan utama — perusahaan lama kehilangan badge     | Badge pindah ke perusahaan baru    |
| LOGO-13 | set perusahaan utama — loading state                        | Button spinner                     |
| LOGO-14 | default company — hanya satu perusahaan yang bertanda utama | Verifikasi hanya 1 badge "Utama"   |

**Pola kode:**

```typescript
// Selector patterns — LogoUploadComponent
readonly uploadZone = this.page.getByTestId('logo-upload-zone');
readonly preview = this.page.getByTestId('logo-preview');
readonly deleteLogoButton = this.page.getByTestId('delete-logo-button');
readonly progressBar = this.page.getByTestId('upload-progress');
readonly fileInput = this.page.getByTestId('logo-file-input');
readonly placeholder = this.page.getByTestId('logo-placeholder');

async uploadLogo(filePath: string): Promise<this> {
  await this.fileInput.setInputFiles(filePath);
  await this.waitForToast();
  return this;
}

async deleteLogo(): Promise<this> {
  await this.deleteLogoButton.click();
  await this.page.getByRole('button', { name: /ya, hapus/i }).click();
  await this.waitForToast();
  return this;
}

// Set default company
readonly setDefaultButton = this.page.getByTestId('set-default-button');
readonly defaultBadge = this.page.getByTestId('default-badge');

async setAsDefault(): Promise<this> {
  await this.setDefaultButton.click();
  await this.waitForToast();
  await expect(this.defaultBadge).toBeVisible();
  return this;
}
```

---

## 4. Test Data

```typescript
// data/company.data.ts

export interface CompanyCreatePayload {
  workspaceId: string;
  name: string;
  businessType: "jasa" | "retail" | "manufaktur";
  address?: {
    province?: string;
    city?: string;
    district?: string;
    village?: string;
    postalCode?: string;
    street?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  legal?: {
    npwp?: string;
    nib?: string;
    isPkp?: boolean;
  };
}

export function generateCompanyPayload(overrides?: Partial<CompanyCreatePayload>): CompanyCreatePayload {
  return {
    workspaceId: "default",
    name: `Test Company ${Date.now()}`,
    businessType: "jasa",
    ...overrides,
  };
}

export function generateFullCompanyPayload(overrides?: Partial<CompanyCreatePayload>): CompanyCreatePayload {
  return {
    workspaceId: "default",
    name: `Test Company ${Date.now()}`,
    businessType: "jasa",
    address: {
      province: "Jakarta",
      city: "Jakarta Pusat",
      district: "Menteng",
      village: "Kebon Sirih",
      postalCode: "10340",
      street: "Jl. Contoh No. 123",
    },
    contact: {
      email: `company${Date.now()}@example.com`,
      phone: "081234567890",
      website: "https://example.com",
    },
    legal: {
      npwp: "12.345.678.9-012.345",
      nib: "1234567890123",
      isPkp: true,
    },
    ...overrides,
  };
}

// Validation constants
export const COMPANY_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 60,
  PHONE_MAX_LENGTH: 13,
  POSTAL_CODE_MAX_LENGTH: 5,
  LOGO_MAX_SIZE_MB: 2,
  LOGO_MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ADDRESS_MAX_LENGTH: 255,
  VALID_NAME_REGEX: /^[a-zA-Z0-9 .,]+$/,
  VALID_BUSINESS_TYPES: ["jasa", "retail", "manufaktur"] as const,
};

// Error messages
export const COMPANY_ERRORS = {
  NAME_REQUIRED: "Nama wajib diisi",
  NAME_MIN_LENGTH: "Nama minimal 3 karakter",
  NAME_MAX_LENGTH: "Nama maksimal 60 karakter",
  NAME_INVALID_CHARS: "Hanya huruf, angka, titik, koma, spasi",
  NAME_DUPLICATE: "Nama perusahaan sudah digunakan",
  EMAIL_INVALID: "Email tidak valid",
  PHONE_MAX_LENGTH: "Nomor telepon maksimal 13 digit",
  PHONE_ONLY_NUMBERS: "Hanya angka",
  POSTAL_CODE_MAX_LENGTH: "Kode pos maksimal 5 digit",
  POSTAL_CODE_ONLY_NUMBERS: "Hanya angka",
  NPWP_INVALID: "NPWP tidak valid",
  NIB_INVALID: "NIB tidak valid",
  ADDRESS_MAX_LENGTH: "Alamat maksimal 255 karakter",
  LOGO_SIZE_EXCEEDED: "Ukuran file maksimal 2MB",
  LOGO_TYPE_INVALID: "Tipe file tidak didukung",
  DELETE_NAME_MISMATCH: "Nama tidak cocok",
  DELETE_BLOCKED_TRANSACTIONS: "Tidak dapat dihapus, memiliki transaksi",
  DELETE_BLOCKED_UNITS: "Nonaktifkan unit terlebih dahulu",
  DELETE_BLOCKED_DEFAULT: "Ubah perusahaan utama terlebih dahulu",
  DELETE_BLOCKED_USERS: "Hapus pengguna terlebih dahulu",
  URL_INVALID: "URL tidak valid",
};

// Test file paths
export const TEST_FILES = {
  VALID_LOGO_JPG: "tests/fixtures/files/logo-valid.jpg",
  VALID_LOGO_PNG: "tests/fixtures/files/logo-valid.png",
  VALID_LOGO_WEBP: "tests/fixtures/files/logo-valid.webp",
  OVERSIZE_LOGO: "tests/fixtures/files/logo-3mb.jpg",
  INVALID_TYPE: "tests/fixtures/files/document.pdf",
};
```

---

## 5. Catatan Penting

1. **Geo cascade membutuhkan data riil** — Pastikan environment memiliki data provinsi/kota/kecamatan/kelurahan yang valid. Gunakan API responses untuk memverifikasi data cascade. Jangan hardcode id geo.

2. **Logo upload membutuhkan file handling** — Gunakan `setInputFiles` Playwright dengan path absolut. File test disimpan di `tests/fixtures/files/`. Siapkan file dengan berbagai ukuran dan tipe untuk edge cases.

3. **Workspace konteks** — Create company memerlukan workspaceId. Pastikan fixture auth sudah memiliki workspace default atau gunakan test data workspace dari fixture.

4. **Unique name constraint** — Nama perusahaan unique per workspace. Factory harus menghasilkan nama unik (gunakan `Date.now()` atau counter). Untuk test duplikat, buat dulu satu company, lalu coba buat dengan nama sama.

5. **Default company — only one** — Hanya satu perusahaan yang bisa menjadi default per user. Setelah mengubah default, verifikasi badge "Utama" berpindah.

6. **Delete blocked states** — Praktik terbaik: gunakan API untuk setup kondisi blocker (transaksi, unit aktif, dsb). Jangan mengandalkan UI flow untuk menciptakan blocker.

7. **Loading/empty states** — Setiap page/list harus diverifikasi loading skeleton dan empty state, tidak hanya happy path.

8. **Modal interaction** — Company form adalah modal. Pastikan test memverifikasi open/close modal, scroll dalam modal, dan konfirmasi close dengan unsaved data.

---

## 6. Pola Umum

### 6.1 Navigasi ke Detail

```typescript
test("navigasi ke detail saat baris diklik", async ({ page }) => {
  const companyList = new CompanyListPage(page);
  await page.goto("/companies");
  await companyList.waitForLoad();

  const firstCompanyName = await companyList.getCompanyName(0);
  await companyList.clickRow(0);
  await expect(page).toHaveURL(/\/companies\/.+/);

  const detail = new CompanyDetailPage(page);
  await expect(detail.companyName).toHaveText(firstCompanyName);
});
```

### 6.2 Modal Create/Edit

```typescript
test("membuat perusahaan dengan field minimal", async ({ page }) => {
  const companyList = new CompanyListPage(page);
  await page.goto("/companies");
  await companyList.clickAddButton();

  const modal = new CompanyFormModal(page);
  await modal.waitForOpen();
  await expect(modal.title).toHaveText("Tambah Perusahaan");

  const payload = generateCompanyPayload();
  await modal.fillIdentity(payload.name, payload.businessType);
  await modal.submit();

  await expect(modal.toast).toBeVisible();
  await expect(modal.toast).toHaveText(/Berhasil/);
  await modal.waitForClose();

  await expect(companyList.getCompanyRow(payload.name)).toBeVisible();
});
```

### 6.3 Geo Cascade Flow

```typescript
test("geo cascade provinsi ke kota", async ({ page }) => {
  const modal = new CompanyFormModal(page);
  await modal.openCreateModal();

  await modal.geoProvince.selectOption("Jakarta");
  await expect(modal.geoCity).toBeEnabled();
  await expect(modal.geoDistrict).toBeDisabled();
  await expect(modal.geoVillage).toBeDisabled();

  await modal.geoCity.selectOption("Jakarta Pusat");
  // Verifikasi API call terjadi
  await modal.waitForResponse("/geo/cities/*/districts");
  await expect(modal.geoDistrict).toBeEnabled();
});
```

### 6.4 Update Seksi Validasi

```typescript
test("validasi email tidak valid — seksi kontak", async ({ page }) => {
  await page.goto("/companies/some-id/profile");
  const profile = new CompanyProfilePage(page);

  // Scroll ke seksi kontak
  await profile.contactSection.scrollIntoViewIfNeeded();
  await profile.emailInput.clear();
  await profile.emailInput.fill("invalid-email");
  await profile.saveButton.click();

  await expect(profile.page.getByText("Email tidak valid")).toBeVisible();
});
```

### 6.5 Delete Flow dengan Confirm Name

```typescript
test("delete company — input nama sesuai", async ({ page }) => {
  const companyName = "Company To Delete";
  await page.goto(`/companies/${companyId}`);
  const detail = new CompanyDetailPage(page);

  await detail.clickDelete();
  await detail.deleteNameInput.fill(companyName);
  await detail.deleteConfirmButton.click();

  // Tunggu redirect ke daftar
  await page.waitForURL("/companies");
  const companyList = new CompanyListPage(page);
  await expect(companyList.getCompanyRow(companyName)).not.toBeVisible();
});
```

### 6.6 Toast Assertions

```typescript
// Utility matchers untuk toast notifications
const toast = new ToastComponent(page);

// Success
await expect(toast.container).toContainText("Perusahaan berhasil dibuat");
await expect(toast.icon).toHaveClass(/success/);

// Error
await expect(toast.container).toContainText("Nama perusahaan sudah digunakan");
await expect(toast.icon).toHaveClass(/error/);
```

### 6.7 Loading State Patterns

```typescript
test("loading state saat create submit", async ({ page }) => {
  const modal = new CompanyFormModal(page);
  await modal.waitForOpen();
  await modal.fillIdentity("Test", "jasa");

  // Trigger submit
  await modal.submitButton.click();
  await expect(modal.submitButton).toBeDisabled();
  await expect(modal.spinner).toBeVisible();

  // Tunggu hingga selesai
  await modal.waitForResponse("/companies", "POST");
  await expect(modal.submitButton).toBeEnabled();
});
```

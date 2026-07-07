# Coverage E2E — Fitur Workspace

> **Dokumen ini berisi skenario lengkap pengujian E2E Playwright untuk fitur Workspace pada GroApp Access.**
> Mencakup daftar workspace (infinite scroll), create, update, delete dengan type-to-confirm, dan impact info modal.
> Setiap skenario mencantumkan kode unik, nama test, tipe pengujian, POM yang digunakan, dan asersi utama.

---

## 1. Pendahuluan

| Atribut         | Detail                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **Modul**       | Workspace Management                                                                                      |
| **Sumber kode** | `src/features/workspace/`                                                                                 |
| **Route**       | `/workspaces`                                                                                             |
| **Guard**       | AuthGuard                                                                                                 |
| **Layout**      | AppMainAccessLayout (sidebar, navbar, breadcrumb)                                                         |
| **Prioritas**   | P1 — High, harus lolos sebelum feature release                                                            |
| **Cakupan**     | Daftar workspace dengan infinite scroll, create, update, delete dengan type-to-confirm, impact info modal |
| **Level**       | Happy Path, Error State, Edge Case                                                                        |

### 1.1 Tujuan Pengujian

1. Memverifikasi daftar workspace ditampilkan dalam bentuk kartu dengan informasi lengkap
2. Memastikan infinite scroll berfungsi memuat data tambahan saat scroll
3. Memverifikasi pencarian workspace berdasarkan nama
4. Memastikan create workspace memvalidasi input sesuai aturan (3-60 chars, alphanumeric + . ,)
5. Memverifikasi update nama workspace berfungsi
6. Memastikan delete workspace dengan type-to-confirm berfungsi dengan benar
7. Memverifikasi impact info modal untuk skenario delete yang diblokir

### 1.2 Arsitektur Fitur

```text
WorkspaceFeature
├── Pages
│   └── WorkspaceListPage        — Daftar workspace dengan infinite scroll
├── Components
│   ├── WorkspaceCard            — Kartu workspace (nama, jumlah perusahaan, unit)
│   ├── WorkspaceFormModal       — Modal create/edit workspace
│   ├── WorkspaceTypeToConfirmDialog  — Dialog delete dengan konfirmasi ketik
│   ├── WorkspaceImpactInfoModal — Modal informasi dampak (blocked deletion)
│   └── WorkspaceSearch          — Search input
├── Forms
│   └── workspace-schema.ts      — Validasi form (3-60 chars, pattern)
├── Hooks
│   ├── useWorkspaceList         — Hook daftar dengan infinite scroll
│   └── useWorkspaceOperations   — Hook CRUD operations
├── Domain
│   ├── WorkspaceTypes           — Tipe data workspace
│   └── WorkspaceNameRules       — Aturan validasi nama
├── Infrastructure
│   ├── WorkspaceApi             — API client workspace
│   ├── WorkspaceEndpoint        — Endpoint definitions
│   ├── WorkspaceMapper          — Mapper response → domain
│   └── WorkspaceFailureMapper   — Mapper error → AppFailure
├── Ids
│   └── WorkspaceIds             — ID constants
└── State
    └── WorkspaceListStore       — State daftar workspace (DataState)
```

### 1.3 Alur Deletion dengan Type-to-Confirm

```text
Klik "Hapus" pada kartu workspace
  → Cek kondisi:
    → Masih punya companies → ImpactInfoModal (blocked)
    → Workspace terakhir → ImpactInfoModal (blocked)
    → Aman dihapus → TypeToConfirmDialog
      → User mengetik nama workspace
      → Nama cocok? → Tombol hapus aktif
      → Nama salah? → Tombol hapus nonaktif
      → Klik Hapus → API DELETE → Sukses → Redirect
```

### 1.4 Infinite Scroll Implementation

```text
Initial load:   GET /access/v1/workspaces?page=1&limit=10
Scroll bottom:  GET /access/v1/workspaces?page=2&limit=10
State:          DataState.loading → DataState.success(items)
                → Scroll trigger → DataState.loadingMore
                → Append items → DataState.success(items + newItems)
```

---

## 2. Struktur File Test

```text
tests/
├── specs/
│   ├── workspace/
│   │   ├── workspace-list.spec.ts      # WL-01 s.d. WL-07
│   │   ├── workspace-create.spec.ts    # WC-01 s.d. WC-08
│   │   ├── workspace-update.spec.ts    # WU-01 s.d. WU-03
│   │   └── workspace-delete.spec.ts    # WD-01 s.d. WD-08
├── pages/
│   ├── workspace/
│   │   ├── workspace-list.page.ts      # POM daftar workspace
│   │   └── workspace-form-modal.page.ts # POM modal create/edit
│   ├── components/
│   │   ├── workspace-card.component.ts # POM kartu workspace
│   │   ├── workspace-search.component.ts # POM search
│   │   ├── workspace-type-to-confirm.component.ts # POM konfirmasi ketik
│   │   └── workspace-impact-modal.component.ts # POM modal dampak
│   ├── base.page.ts                    # BasePage
│   └── layout/
│       └── main-layout.page.ts         # Main layout POM
├── data/
│   ├── workspace.data.ts               # Factory workspace
│   └── constants.ts                    # Workspace IDs, URLs
├── fixtures/
│   ├── auth.fixture.ts                 # Authenticated fixture
│   └── company.fixture.ts              # Company context
└── utils/
    └── api-helper.ts                   # API calls for test setup
```

---

## 3. Playwright E2E — Skenario Pengujian

### 3.1 Workspace List

**Deskripsi:** Memverifikasi daftar workspace dengan infinite scroll, pencarian, dan empty state.

**POM files needed:**

- `workspace/workspace-list.page.ts`
- `components/workspace-card.component.ts`
- `components/workspace-search.component.ts`
- `layout/main-layout.page.ts`

**Test data:** Minimal 5 workspace (untuk infinite scroll test), 1 workspace untuk empty search.

| #   | Kode Test | Nama Test                                                          | Tipe        | POM                                           | Langkah                          | Assertion                                                  |
| --- | --------- | ------------------------------------------------------------------ | ----------- | --------------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| 1   | WL-01     | menampilkan daftar workspace dalam bentuk kartu                    | Happy Path  | `WorkspaceListPage`, `WorkspaceCardComponent` | Buka `/workspaces`               | Kartu workspace terlihat, minimal 1 kartu                  |
| 2   | WL-02     | menampilkan detail info pada kartu (nama, jumlah perusahaan, unit) | Happy Path  | `WorkspaceCardComponent`                      | Lihat kartu workspace            | Nama, totalCompanies, totalBusinessUnits terlihat          |
| 3   | WL-03     | menampilkan empty state saat tidak ada workspace                   | Empty State | `WorkspaceListPage`                           | Buka dengan user tanpa workspace | Komponen `EmptyData` terlihat                              |
| 4   | WL-04     | infinite scroll — scroll ke bawah memuat data lebih banyak         | Edge Case   | `WorkspaceListPage`                           | Scroll ke bawah halaman          | Item baru muncul, total item bertambah                     |
| 5   | WL-05     | mencari workspace berdasarkan nama — hasil sesuai                  | Happy Path  | `WorkspaceSearchComponent`                    | Ketik nama workspace di search   | Hanya workspace dengan nama cocok yang tampil              |
| 6   | WL-06     | search — keyword tidak ditemukan menampilkan empty search state    | Edge Case   | `WorkspaceSearchComponent`                    | Ketik "ZZZZNOTEXIST"             | Empty search state dengan teks "Pencarian tidak ditemukan" |
| 7   | WL-07     | menampilkan loading skeleton saat memuat data                      | Edge Case   | `WorkspaceListPage`                           | Intercept API lambat             | Skeleton/loader terlihat sebelum data tampil               |

#### Detail Skenario WL-01 — Menampilkan daftar workspace

```typescript
test("menampilkan daftar workspace dengan kartu", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const cards = await workspaceList.workspaceCards.all();
  expect(cards.length).toBeGreaterThanOrEqual(1);
  await expect(cards[0]).toBeVisible();
});
```

#### Detail Skenario WL-02 — Detail info pada kartu

```typescript
test("menampilkan nama, jumlah perusahaan, unit", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  const card = new WorkspaceCardComponent(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const firstCard = card.getCardByIndex(0);
  await expect(firstCard.name).toBeVisible();
  await expect(firstCard.companyCount).toBeVisible();
  await expect(firstCard.unitCount).toBeVisible();
});
```

#### Detail Skenario WL-03 — Empty state

```typescript
test("empty state — tidak ada workspace", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  await expect(workspaceList.emptyData).toBeVisible();
  await expect(workspaceList.emptyData).toContainText(/belum ada workspace/i);
  await expect(workspaceList.workspaceCards).toHaveCount(0);
});
```

#### Detail Skenario WL-04 — Infinite scroll

```typescript
test("infinite scroll — scroll memuat lebih banyak", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const initialCount = await workspaceList.workspaceCards.count();

  // Scroll to bottom
  await workspaceList.scrollToBottom();
  await page.waitForResponse(/\/access\/v1\/workspaces/);

  const newCount = await workspaceList.workspaceCards.count();
  expect(newCount).toBeGreaterThan(initialCount);
});
```

#### Detail Skenario WL-05 — Mencari workspace

```typescript
test("mencari workspace berdasarkan nama", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  const search = new WorkspaceSearchComponent(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const targetName = await workspaceList.getFirstWorkspaceName();
  await search.searchInput.fill(targetName);
  await page.waitForResponse(/\/access\/v1\/workspaces/);

  const cards = await workspaceList.workspaceCards.all();
  expect(cards.length).toBeGreaterThanOrEqual(1);
  for (const card of cards) {
    await expect(card).toContainText(targetName);
  }
});
```

#### Detail Skenario WL-06 — Search keyword tidak ditemukan

```typescript
test("search — keyword tidak ditemukan", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  const search = new WorkspaceSearchComponent(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  await search.searchInput.fill("ZZZZNOTEXIST");
  await page.waitForResponse(/\/access\/v1\/workspaces/);

  await expect(workspaceList.emptySearch).toBeVisible();
  await expect(workspaceList.emptySearch).toContainText(/tidak ditemukan/i);
  await expect(workspaceList.workspaceCards).toHaveCount(0);
});
```

#### Detail Skenario WL-07 — Loading skeleton

```typescript
test("loading skeleton saat memuat", async ({ page }) => {
  await page.route(/\/access\/v1\/workspaces/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });

  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();

  await expect(workspaceList.skeletonLoader).toBeVisible();
  await workspaceList.waitForLoad();
  await expect(workspaceList.skeletonLoader).toHaveCount(0);
});
```

---

### 3.2 Workspace Create

**Deskripsi:** Memverifikasi pembuatan workspace baru dengan validasi nama yang ketat.

**POM files needed:**

- `workspace/workspace-list.page.ts`
- `workspace/workspace-form-modal.page.ts`

**Test data:** `generateWorkspacePayload()` dengan nama unik.

| #   | Kode Test | Nama Test                                              | Tipe        | POM                  | Langkah                           | Assertion                                         |
| --- | --------- | ------------------------------------------------------ | ----------- | -------------------- | --------------------------------- | ------------------------------------------------- |
| 1   | WC-01     | membuka modal create workspace                         | Happy Path  | `WorkspaceFormModal` | Klik tombol "Buat Workspace"      | Modal visible dengan field nama dan tombol simpan |
| 2   | WC-02     | create dengan nama valid (3-60 karakter, alphanumeric) | Happy Path  | `WorkspaceFormModal` | Isi "Workspace Baru", submit      | Toast sukses, workspace muncul di list            |
| 3   | WC-03     | validasi nama — minimal 3 karakter                     | Error State | `WorkspaceFormModal` | Isi "AB", submit                  | Error "Nama minimal 3 karakter"                   |
| 4   | WC-04     | validasi nama — maksimal 60 karakter                   | Error State | `WorkspaceFormModal` | Isi 61 karakter, submit           | Error "Nama maksimal 60 karakter"                 |
| 5   | WC-05     | validasi nama — karakter tidak valid (simbol)          | Error State | `WorkspaceFormModal` | Isi "Workspace@#$%", submit       | Error "Nama mengandung karakter tidak valid"      |
| 6   | WC-06     | validasi nama — required (kosong)                      | Error State | `WorkspaceFormModal` | Biarkan nama kosong, submit       | Error "Nama wajib diisi"                          |
| 7   | WC-07     | validasi nama — duplikat                               | Error State | `WorkspaceFormModal` | Isi nama workspace yang sudah ada | Error "Nama workspace sudah digunakan"            |
| 8   | WC-08     | loading state saat submit — button spinner             | Edge Case   | `WorkspaceFormModal` | Submit form, intercept API lambat | Tombol simpan disabled dengan spinner             |

#### Detail Skenario WC-01 — Membuka modal create

```typescript
test("membuka modal create workspace", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.nameInput).toBeVisible();
  await expect(modal.submitButton).toBeVisible();
});
```

#### Detail Skenario WC-02 — Create dengan nama valid

```typescript
test("create dengan nama valid (3-60 chars)", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName(`Workspace Test ${Date.now()}`);
  await modal.submit();

  await expect(workspaceList.toast).toHaveText(/berhasil dibuat/i);
  await expect(workspaceList.workspaceCards.first()).toContainText(/workspace test/i);
});
```

#### Detail Skenario WC-03 — Validasi minimal 3 karakter

```typescript
test("validasi nama — minimal 3 karakter", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName("AB");
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  await expect(modal.nameError).toHaveText(/minimal 3 karakter/i);
});
```

#### Detail Skenario WC-04 — Validasi maksimal 60 karakter

```typescript
test("validasi nama — maksimal 60 karakter", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName("A".repeat(61));
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  await expect(modal.nameError).toHaveText(/maksimal 60 karakter/i);
});
```

#### Detail Skenario WC-05 — Karakter tidak valid

```typescript
test("validasi nama — karakter tidak valid (simbol)", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName("Workspace@#$%");
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  await expect(modal.nameError).toHaveText(/karakter tidak valid/i);
});
```

#### Detail Skenario WC-06 — Required

```typescript
test("validasi nama — required", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  await expect(modal.nameError).toHaveText(/wajib diisi/i);
});
```

#### Detail Skenario WC-07 — Duplikat

```typescript
test("validasi nama — duplikat", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  const existingName = await workspaceList.getFirstWorkspaceName();

  await workspaceList.createButton.click();
  const modal = new WorkspaceFormModal(page);
  await modal.fillName(existingName);
  await modal.submit();

  await expect(modal.apiError).toBeVisible();
  await expect(modal.apiError).toHaveText(/sudah digunakan/i);
});
```

#### Detail Skenario WC-08 — Loading state

```typescript
test("loading state saat submit", async ({ page }) => {
  await page.route(/\/access\/v1\/workspaces/, async (route) => {
    if (route.request().method() === "POST") {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 201 });
    } else {
      await route.continue();
    }
  });

  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.createButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName(`Workspace ${Date.now()}`);
  await modal.submit();

  await expect(modal.submitButton).toBeDisabled();
  await expect(modal.spinner).toBeVisible();
});
```

---

### 3.3 Workspace Update

**Deskripsi:** Memverifikasi update nama workspace.

**POM files needed:**

- `workspace/workspace-list.page.ts`
- `workspace/workspace-form-modal.page.ts`

**Test data:** Workspace existing, nama baru valid, nama invalid.

| #   | Kode Test | Nama Test                               | Tipe        | POM                  | Langkah                           | Assertion                                     |
| --- | --------- | --------------------------------------- | ----------- | -------------------- | --------------------------------- | --------------------------------------------- |
| 1   | WU-01     | edit nama workspace berhasil            | Happy Path  | `WorkspaceFormModal` | Klik edit, isi nama baru, simpan  | Toast sukses, nama workspace berubah di kartu |
| 2   | WU-02     | edit dengan nama invalid (simbol) gagal | Error State | `WorkspaceFormModal` | Edit, isi "Test@#$", simpan       | Error validasi "karakter tidak valid"         |
| 3   | WU-03     | cancel edit — nama kembali ke semula    | Edge Case   | `WorkspaceFormModal` | Edit, ubah nama, klik batal/tutup | Nama workspace di kartu tidak berubah         |

#### Detail Skenario WU-01 — Edit nama berhasil

```typescript
test("edit nama workspace", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(0);
  await card.editButton.click();

  const modal = new WorkspaceFormModal(page);
  const newName = `Workspace Updated ${Date.now()}`;
  await modal.fillName(newName);
  await modal.submit();

  await expect(workspaceList.toast).toHaveText(/berhasil diubah/i);
  await expect(card.name).toHaveText(newName);
});
```

#### Detail Skenario WU-02 — Edit dengan nama invalid

```typescript
test("edit dengan nama invalid", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(0);
  await card.editButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName("Test@#$%^");
  await modal.submit();

  await expect(modal.nameError).toBeVisible();
  await expect(modal.nameError).toHaveText(/karakter tidak valid/i);
});
```

#### Detail Skenario WU-03 — Cancel edit

```typescript
test("cancel edit — nama kembali ke semula", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const originalName = await workspaceList.getCardByIndex(0).name.innerText();
  const card = workspaceList.getCardByIndex(0);
  await card.editButton.click();

  const modal = new WorkspaceFormModal(page);
  await modal.fillName("Changed Name");
  await modal.cancel();

  await expect(card.name).toHaveText(originalName);
});
```

---

### 3.4 Workspace Delete

**Deskripsi:** Memverifikasi penghapusan workspace dengan type-to-confirm pattern, termasuk skenario block (masih punya companies, workspace terakhir).

**POM files needed:**

- `workspace/workspace-list.page.ts`
- `components/workspace-type-to-confirm.component.ts`
- `components/workspace-impact-modal.component.ts`

**Test data:** Workspace tanpa perusahaan (untuk delete sukses), workspace dengan perusahaan (untuk blocked), workspace terakhir.

| #   | Kode Test | Nama Test                                                               | Tipe        | POM                               | Langkah                                     | Assertion                                           |
| --- | --------- | ----------------------------------------------------------------------- | ----------- | --------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| 1   | WD-01     | membuka dialog delete — type-to-confirm muncul dan input field tersedia | Happy Path  | `WorkspaceTypeToConfirmComponent` | Klik hapus pada workspace yang bisa dihapus | Dialog visible dengan field ketik nama              |
| 2   | WD-02     | mengetik nama yang benar — tombol hapus menjadi aktif                   | Happy Path  | `WorkspaceTypeToConfirmComponent` | Ketik nama workspace dengan benar           | Tombol hapus enabled                                |
| 3   | WD-03     | mengetik nama yang salah — tombol hapus tetap nonaktif                  | Edge Case   | `WorkspaceTypeToConfirmComponent` | Ketik nama yang berbeda                     | Tombol hapus disabled                               |
| 4   | WD-04     | delete berhasil — workspace hilang dari list dan redirect               | Happy Path  | `WorkspaceTypeToConfirmComponent` | Ketik nama benar, klik hapus                | Toast sukses, workspace tidak ada di list, redirect |
| 5   | WD-05     | delete — blocked karena masih punya companies, impact info modal muncul | Error State | `WorkspaceImpactModalComponent`   | Klik hapus pada workspace dengan companies  | Modal "Hapus perusahaan terlebih dahulu"            |
| 6   | WD-06     | delete — blocked karena workspace terakhir                              | Error State | `WorkspaceImpactModalComponent`   | Klik hapus pada workspace terakhir          | Error "Tidak bisa menghapus workspace terakhir"     |
| 7   | WD-07     | cancel delete — dialog tertutup tanpa perubahan                         | Edge Case   | `WorkspaceTypeToConfirmComponent` | Buka dialog, klik batal/tutup               | Dialog hilang, workspace masih di list              |
| 8   | WD-08     | loading state saat menghapus — button spinner                           | Edge Case   | `WorkspaceTypeToConfirmComponent` | Konfirmasi hapus, intercept API lambat      | Tombol hapus disabled dengan spinner                |

#### Detail Skenario WD-01 — Membuka dialog delete

```typescript
test("membuka dialog delete — type-to-confirm muncul", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await expect(confirmDialog.dialog).toBeVisible();
  await expect(confirmDialog.nameInput).toBeVisible();
  await expect(confirmDialog.deleteButton).toBeDisabled();
  await expect(confirmDialog.cancelButton).toBeVisible();
});
```

#### Detail Skenario WD-02 — Mengetik nama benar

```typescript
test("mengetik nama yang benar — tombol hapus aktif", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  const workspaceName = await card.name.innerText();
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await confirmDialog.nameInput.fill(workspaceName);

  await expect(confirmDialog.deleteButton).toBeEnabled();
});
```

#### Detail Skenario WD-03 — Mengetik nama salah

```typescript
test("mengetik nama yang salah — tombol hapus nonaktif", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await confirmDialog.nameInput.fill("NamaSalahBesar");

  await expect(confirmDialog.deleteButton).toBeDisabled();
});
```

#### Detail Skenario WD-04 — Delete berhasil

```typescript
test("delete berhasil — workspace hilang dari list", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  const workspaceName = await card.name.innerText();
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await confirmDialog.nameInput.fill(workspaceName);
  await confirmDialog.deleteButton.click();

  await expect(workspaceList.toast).toHaveText(/berhasil dihapus/i);
  await workspaceList.waitForLoad();
  const cardNames = await workspaceList.getAllWorkspaceNames();
  expect(cardNames).not.toContain(workspaceName);
});
```

#### Detail Skenario WD-05 — Delete blocked (punya companies)

```typescript
test("delete — blocked (masih punya companies)", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(blockedWorkspaceIndex);
  await card.deleteButton.click();

  const impactModal = new WorkspaceImpactModalComponent(page);
  await expect(impactModal.dialog).toBeVisible();
  await expect(impactModal.title).toHaveText(/tidak dapat dihapus/i);
  await expect(impactModal.reason).toHaveText(/perusahaan/i);
  await expect(impactModal.companyList).toBeVisible();
  await expect(impactModal.closeButton).toBeVisible();
});
```

#### Detail Skenario WD-06 — Delete blocked (workspace terakhir)

```typescript
test("delete — blocked (last remaining workspace)", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(lastWorkspaceIndex);
  await card.deleteButton.click();

  const impactModal = new WorkspaceImpactModalComponent(page);
  await expect(impactModal.dialog).toBeVisible();
  await expect(impactModal.reason).toHaveText(/terakhir/i);
});
```

#### Detail Skenario WD-07 — Cancel delete

```typescript
test("cancel delete — dialog tertutup", async ({ page }) => {
  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  const workspaceName = await card.name.innerText();
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await confirmDialog.cancelButton.click();

  await expect(confirmDialog.dialog).toHaveCount(0);
  await expect(card.name).toHaveText(workspaceName);
});
```

#### Detail Skenario WD-08 — Loading state saat menghapus

```typescript
test("loading state saat menghapus", async ({ page }) => {
  await page.route(/\/access\/v1\/workspaces\/.+/, async (route) => {
    if (route.request().method() === "DELETE") {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200 });
    } else {
      await route.continue();
    }
  });

  const workspaceList = new WorkspaceListPage(page);
  await workspaceList.goto();
  await workspaceList.waitForLoad();

  const card = workspaceList.getCardByIndex(deletableWorkspaceIndex);
  const workspaceName = await card.name.innerText();
  await card.deleteButton.click();

  const confirmDialog = new WorkspaceTypeToConfirmComponent(page);
  await confirmDialog.nameInput.fill(workspaceName);
  await confirmDialog.deleteButton.click();

  await expect(confirmDialog.deleteButton).toBeDisabled();
  await expect(confirmDialog.spinner).toBeVisible();
});
```

---

## 4. Test Data

### 4.1 Factory Function — Workspace Payload

```typescript
// data/workspace.data.ts
export function generateWorkspacePayload(overrides?: Partial<WorkspaceCreatePayload>): WorkspaceCreatePayload {
  return {
    name: `Workspace_${Date.now()}`,
    ...overrides,
  };
}
```

### 4.2 Factory Function — Workspace Response

```typescript
// data/workspace.data.ts
export function generateWorkspaceResponse(overrides?: Partial<WorkspaceItem>): WorkspaceItem {
  return {
    id: `ws_${Date.now()}`,
    name: "Workspace Test",
    totalCompanies: 2,
    totalBusinessUnits: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### 4.3 Valid Name Factory

```typescript
// data/workspace.data.ts
export function generateValidWorkspaceNames(): string[] {
  return [
    "Workspace Saya",
    "PT Maju Jaya",
    "Kantor.Cabang-1",
    "Workspace 2024",
    "A".repeat(3), // min boundary
    "A".repeat(60), // max boundary
    "Workspace dengan angka 123",
    "nama.workspace,panjang",
  ];
}

export function generateInvalidWorkspaceNames(): Array<{ name: string; expectedError: string }> {
  return [
    { name: "AB", expectedError: "minimal 3 karakter" },
    { name: "A".repeat(61), expectedError: "maksimal 60 karakter" },
    { name: "", expectedError: "wajib diisi" },
    { name: "Test@#$%", expectedError: "karakter tidak valid" },
    { name: "Test!^&*(", expectedError: "karakter tidak valid" },
  ];
}
```

### 4.4 Constants

```typescript
// data/constants.ts
export const WORKSPACE_CONSTANTS = {
  VALID_NAME: "Workspace E2E Test",
  INVALID_NAME_SHORT: "AB",
  INVALID_NAME_LONG: "A".repeat(61),
  INVALID_NAME_SYMBOL: "Workspace@#$%",
  DUPLICATE_NAME: "Existing WS",
  SEARCH_KEYWORD: "Test",
  SEARCH_NOT_FOUND: "ZZZZNOTEXIST",
  INFINITE_SCROLL_PAGE_SIZE: 10,
  DELETABLE_WORKSPACE_INDEX: 0,
  BLOCKED_WORKSPACE_INDEX: 1,
  LAST_WORKSPACE_INDEX: 0,
  WORKSPACE_NAME_PATTERN: /^[a-zA-Z0-9\s.,-]+$/,
};
```

---

## 5. Catatan Penting

### 5.1 Aturan Validasi Nama Workspace

| Aturan                       | Detail                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Minimal**                  | 3 karakter                                                                                                                                                         |
| **Maksimal**                 | 60 karakter                                                                                                                                                        |
| **Karakter yang diizinkan**  | Huruf (a-z, A-Z), angka (0-9), spasi, titik (`.`), koma (`,`), strip (`-`)                                                                                         |
| **Karakter tidak diizinkan** | Semua simbol lain: `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`, `!`, `~`, `` ` ``, `+`, `=`, `{`, `}`, `[`, `]`, `\|`, `\`, `:`, `;`, `"`, `'`, `<`, `>`, `?`, `/` |
| **Required**                 | Tidak boleh kosong                                                                                                                                                 |
| **Duplikat**                 | Nama harus unik (case-insensitive)                                                                                                                                 |

Implementasi validasi di `src/features/workspace/domain/WorkspaceNameRules.ts`:

```typescript
export const WORKSPACE_NAME_MIN_LENGTH = 3;
export const WORKSPACE_NAME_MAX_LENGTH = 60;
export const WORKSPACE_NAME_PATTERN = /^[a-zA-Z0-9\s.,-]+$/;
```

### 5.2 Type-to-Confirm Pattern

Pattern khusus untuk aksi destruktif (delete workspace):

| Langkah | Element                                 | State                           |
| ------- | --------------------------------------- | ------------------------------- |
| 1       | Klik "Hapus" pada kartu                 | Dialog type-to-confirm muncul   |
| 2       | Input field "Ketik nama workspace"      | Kosong, tombol hapus disabled   |
| 3       | Ketik nama berbeda                      | Tombol hapus tetap disabled     |
| 4       | Ketik nama sama persis (case-sensitive) | Tombol hapus menjadi enabled    |
| 5       | Klik "Hapus"                            | Loading, API call, sukses/error |

Penting: Pencocokan nama bersifat **case-sensitive**. "Workspace Saya" ≠ "workspace saya".

### 5.3 Infinite Scroll Detail

| Aspek                          | Detail                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Trigger**                    | Intersection Observer pada sentinel element di bottom list                      |
| **Page size**                  | 10 items per page                                                               |
| **State**                      | `DataState.loadingMore` saat fetching page berikutnya                           |
| **Search**                     | Search memicu request baru (bukan filter lokal)                                 |
| **Empty data vs Empty search** | `EmptyData` untuk user tanpa workspace, `EmptySearch` untuk keyword tidak cocok |

### 5.4 Impact Info Modal — Blocked Deletion

| Skenario Block            | Isi Modal                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Masih punya companies** | Menampilkan daftar perusahaan yang masih aktif di workspace tersebut. User harus menghapus semua perusahaan terlebih dahulu. |
| **Workspace terakhir**    | Menampilkan "Tidak dapat menghapus workspace terakhir. Anda harus memiliki setidaknya satu workspace."                       |

### 5.5 Ketergantungan Antar Test

- Test WL (Workspace List) membutuhkan minimal 1 workspace (kecuali WL-03 empty state)
- Test WC (Workspace Create) independen — buat workspace baru setiap test
- Test WU (Workspace Update) membutuhkan workspace existing
- Test WD (Workspace Delete) membutuhkan workspace tanpa company (WD-01—04, WD-07—08), workspace dengan company (WD-05), dan workspace terakhir (WD-06)
- Untuk WD-05, setup workspace dengan minimal 1 company via API di `beforeEach`
- Untuk WD-06, pastikan user hanya punya 1 workspace
- Gunakan `test.beforeEach` untuk setup data, jangan andalkan state antar test

### 5.6 Flakiness Prevention

| Risiko                           | Mitigasi                                                                    |
| -------------------------------- | --------------------------------------------------------------------------- |
| Infinite scroll tidak trigger    | Scroll sampai sentinel element terlihat, gunakan `scrollIntoViewIfNeeded()` |
| Search debounce                  | Tunggu `waitForResponse` setelah mengetik, jangan langsung assert           |
| Type-to-confirm case sensitivity | Ambil nama asli dari elemen, jangan hardcode                                |
| Delete block impact modal        | Setup data secara eksplisit di `beforeEach`                                 |
| Animasi modal masuk              | Gunakan `waitForSelector` pada dialog container                             |
| Nama duplikat antar test         | Gunakan `Date.now()` + random suffix untuk nama workspace                   |

### 5.7 POM Mapping

| Halaman/Komponen         | File POM                                            | Base URL      |
| ------------------------ | --------------------------------------------------- | ------------- |
| Daftar Workspace         | `workspace/workspace-list.page.ts`                  | `/workspaces` |
| Form Modal (Create/Edit) | `workspace/workspace-form-modal.page.ts`            | — (modal)     |
| Kartu Workspace          | `components/workspace-card.component.ts`            | — (komponen)  |
| Search                   | `components/workspace-search.component.ts`          | — (komponen)  |
| Type-to-Confirm Dialog   | `components/workspace-type-to-confirm.component.ts` | — (dialog)    |
| Impact Info Modal        | `components/workspace-impact-modal.component.ts`    | — (modal)     |

### 5.8 Anti-Hallucination Checklist

- [ ] Route `/workspaces` exists in app router (AuthGuard, AppMainAccessLayout)
- [ ] Component `WorkspaceCard` exists with name, totalCompanies, totalBusinessUnits
- [ ] Component `WorkspaceFormModal` exists for create/edit
- [ ] Component `WorkspaceTypeToConfirmDialog` exists for delete confirmation
- [ ] Component `WorkspaceImpactInfoModal` exists for blocked deletion
- [ ] Infinite scroll implemented via `useInfiniteScrollTrigger` hook
- [ ] Workspace name validation: 3-60 chars, pattern `/^[a-zA-Z0-9\s.,-]+$/`
- [ ] Workspace name unique constraint (case-insensitive)
- [ ] Create endpoint: `POST /access/v1/workspaces`
- [ ] List endpoint: `GET /access/v1/workspaces?page=&limit=`
- [ ] Update endpoint: `PATCH /access/v1/workspaces/:id`
- [ ] Delete endpoint: `DELETE /access/v1/workspaces/:id`
- [ ] DataState pattern used: initial → loading → success/empty/failure + loadingMore
- [ ] EmptyData component exists for empty workspace list
- [ ] EmptySearch component exists for search without results
- [ ] SkeletonLoader exists for loading state

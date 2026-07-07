# Coverage E2E — Fitur User (Pengguna & Undangan)

> **Dokumen ini berisi skenario lengkap pengujian E2E Playwright untuk fitur User pada GroApp Access.**
> Mencakup daftar pengguna, manajemen undangan (CRUD), penerimaan undangan, detail pengguna, dan pengaturan peran.
> Setiap skenario mencantumkan kode unik, nama test, tipe pengujian, POM yang digunakan, dan asersi utama.

---

## 1. Pendahuluan

| Atribut         | Detail                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Modul**       | User & Invitation Management                                                                          |
| **Sumber kode** | `src/features/user/`                                                                                  |
| **Route**       | `/companies/:companyId/users` (list), `/companies/:companyId/users/:invitationId` (detail acceptance) |
| **Guard**       | AuthGuard (list, detail), Public (invitation accept dengan token)                                     |
| **Layout**      | AppMainAccessLayout (sidebar, navbar, breadcrumb)                                                     |
| **Prioritas**   | P1 — High, harus lolos sebelum feature release                                                        |
| **Cakupan**     | Daftar & filter, invite create, invite accept, detail user, role update, status toggle                |
| **Level**       | Happy Path, Error State, Edge Case, Permission                                                        |

### 1.1 Tujuan Pengujian

1. Memverifikasi daftar pengguna perusahaan ditampilkan dengan benar beserta kolom dan filter
2. Memastikan undangan dapat dibuat, dikirim ulang, dan divalidasi dengan benar
3. Memverifikasi penerimaan undangan melalui token mencakup semua skenario (valid, expired, accepted, replaced, mismatch)
4. Memastikan detail pengguna dan manajemen peran berfungsi
5. Memverifikasi toggle status aktif/nonaktif dengan konfirmasi

### 1.2 Arsitektur Fitur

```text
UserFeature
├── Pages
│   ├── UserListPage           — Daftar user perusahaan
│   ├── UserDetailPage         — Detail profil user + membership
│   └── InvitationAcceptPage   — Halaman publik accept undangan
├── Modals
│   ├── UserInviteModal        — Form invite user
│   ├── UserDeactivateModal    — Konfirmasi deaktivasi
│   ├── InvitationExpiredModal       — Token expired
│   ├── InvitationAlreadyAcceptedModal — Token sudah dipakai
│   ├── InvitationReplacedModal      — Token diganti
│   ├── InvitationMismatchModal      — Email tidak cocok
│   ├── InvitationInactiveModal      — User tidak aktif
│   └── InvitationResendWarningModal — Batas resend tercapai
├── Components
│   ├── UserFilter             — Filter by role, status
│   ├── UserSearch             — Search by name/email
│   ├── UserRoleDropdown       — Dropdown pemilihan role
│   ├── UserStatusToggle       — Toggle active/inactive
│   ├── InvitationResendButton — Tombol kirim ulang
│   └── UserCompanyTable       — Tabel membership perusahaan
├── Forms
│   ├── invite-schema.ts       — Validasi form invite
│   └── role-update-schema.ts  — Validasi update role
├── Domain
│   ├── UserTypes              — Tipe data user
│   ├── InvitationRules        — Aturan validasi token
│   └── EmailMatchRule         — Aturan pencocokan email
└── State
    ├── UserListStore          — State daftar user
    ├── UserDetailStore        — State detail user
    └── InvitationModalsStore  — State modal undangan
```

### 1.3 Alur Invitation

```text
Buat Undangan
  → API POST /access/v1/companies/:id/users/invite
  → Email/SMS terkirim ke target
  → User klik link (public route dengan token)
    → Validasi token
      → Valid   → Accept, redirect ke dashboard
      → Expired → Modal "Undangan telah kedaluwarsa"
      → Accepted → Modal "Undangan sudah diterima"
      → Replaced → Modal "Undangan telah diganti"
      → Mismatch → Modal "Email tidak cocok"
      → Inactive → Modal "Akun tidak aktif"
```

---

## 2. Struktur File Test

```text
tests/
├── specs/
│   ├── user/
│   │   ├── user-list.spec.ts             # UL-01 s.d. UL-07
│   │   ├── invitation-create.spec.ts     # IC-01 s.d. IC-09
│   │   ├── invitation-accept.spec.ts     # IA-01 s.d. IA-08
│   │   └── user-role-update.spec.ts      # UD-01 s.d. UD-07
├── pages/
│   ├── user/
│   │   ├── user-list.page.ts             # POM daftar user
│   │   ├── user-detail.page.ts           # POM detail user
│   │   └── user-invite-modal.page.ts     # POM modal invite
│   ├── components/
│   │   ├── user-filter.component.ts      # POM filter user
│   │   ├── user-role-dropdown.component.ts # POM dropdown role
│   │   └── invitation-modals.component.ts # POM 7 modal invitation
│   ├── base.page.ts                      # BasePage
│   └── layout/
│       └── main-layout.page.ts           # Main layout POM
├── data/
│   ├── user.data.ts                      # Factory invitation
│   └── constants.ts                      # Test users, URLs, timeouts
├── fixtures/
│   ├── auth.fixture.ts                   # Authenticated fixture
│   └── company.fixture.ts                # Pre-created company context
└── utils/
    ├── api-helper.ts                     # API calls for test setup
    └── token-helper.ts                   # JWT manipulation
```

---

## 3. Playwright E2E — Skenario Pengujian

### 3.1 User List & Filter

**Deskripsi:** Memverifikasi daftar pengguna dalam suatu perusahaan dapat ditampilkan, difilter, dan dinavigasi dengan benar.

**POM files needed:**

- `user/user-list.page.ts`
- `components/user-filter.component.ts`
- `components/user-role-dropdown.component.ts`
- `layout/main-layout.page.ts`

**Test data:** Minimal 3 user dengan variasi role dan status dalam satu company.

| #   | Kode Test | Nama Test                                                                | Tipe        | POM                                       | Langkah                                            | Assertion                                                      |
| --- | --------- | ------------------------------------------------------------------------ | ----------- | ----------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| 1   | UL-01     | menampilkan daftar user dengan kolom lengkap (nama, email, role, status) | Happy Path  | `UserListPage`                            | Buka `/companies/:id/users`, tunggu tabel muncul   | Kolom Nama, Email, Role, Status terlihat di header tabel       |
| 2   | UL-02     | menampilkan empty state saat tidak ada user dalam perusahaan             | Empty State | `UserListPage`                            | Buka perusahaan tanpa anggota, tunggu render       | Komponen `EmptyData` terlihat dengan teks "Belum ada pengguna" |
| 3   | UL-03     | memfilter user berdasarkan role dari dropdown                            | Happy Path  | `UserFilterComponent`, `UserRoleDropdown` | Pilih role dari dropdown filter                    | Daftar user hanya menampilkan user dengan role tersebut        |
| 4   | UL-04     | memfilter user berdasarkan status (active/inactive)                      | Happy Path  | `UserFilterComponent`                     | Klik toggle/select status "Active" atau "Inactive" | Daftar user difilter sesuai status yang dipilih                |
| 5   | UL-05     | mencari user berdasarkan nama atau email                                 | Happy Path  | `UserFilterComponent`                     | Ketik kata kunci di search input                   | Hasil pencarian hanya menampilkan user yang cocok              |
| 6   | UL-06     | menavigasi ke detail user saat baris diklik                              | Happy Path  | `UserListPage`, `UserDetailPage`          | Klik baris user pertama                            | URL berubah mengandung `/users/:invitationId`                  |
| 7   | UL-07     | menampilkan loading skeleton saat data sedang dimuat                     | Edge Case   | `UserListPage`                            | Navigasi halaman, intercept API lambat             | Komponen Skeleton/loader terlihat sebelum data tampil          |

#### Detail Skenario UL-01 — Menampilkan daftar user dengan kolom lengkap

```typescript
test("menampilkan daftar user dengan kolom lengkap", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  await expect(userList.tableHeader).toBeVisible();
  await expect(userList.tableHeader).toContainText("Nama");
  await expect(userList.tableHeader).toContainText("Email");
  await expect(userList.tableHeader).toContainText("Role");
  await expect(userList.tableHeader).toContainText("Status");
  await expect(userList.userRows.first()).toBeVisible();
});
```

#### Detail Skenario UL-02 — Empty state saat tidak ada user

```typescript
test("menampilkan empty state saat tidak ada user", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(emptyCompanyId);
  await userList.waitForLoad();

  await expect(userList.emptyData).toBeVisible();
  await expect(userList.emptyData).toContainText(/belum ada pengguna/i);
});
```

#### Detail Skenario UL-03 — Filter user berdasarkan role

```typescript
test("memfilter user berdasarkan role", async ({ page }) => {
  const userList = new UserListPage(page);
  const filter = new UserFilterComponent(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  await filter.openRoleFilter();
  await filter.selectRole("Admin");
  await userList.waitForResponse();

  const rows = await userList.userRows.all();
  for (const row of rows) {
    await expect(row.locator('[data-testid="role-cell"]')).toContainText("Admin");
  }
});
```

#### Detail Skenario UL-04 — Filter user berdasarkan status

```typescript
test("memfilter user berdasarkan status", async ({ page }) => {
  const userList = new UserListPage(page);
  const filter = new UserFilterComponent(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  await filter.openStatusFilter();
  await filter.selectStatus("Active");

  for (const row of await userList.userRows.all()) {
    await expect(row.locator('[data-testid="status-badge"]')).toContainText(/aktif/i);
  }
});
```

#### Detail Skenario UL-05 — Mencari user berdasarkan nama/email

```typescript
test("mencari user berdasarkan nama", async ({ page }) => {
  const userList = new UserListPage(page);
  const filter = new UserFilterComponent(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  await filter.searchInput.fill("John");
  await page.waitForResponse(/\/access\/v1\/companies\/.+\/users/);

  for (const row of await userList.userRows.all()) {
    const text = await row.innerText();
    expect(text.toLowerCase()).toContain("john");
  }
});
```

#### Detail Skenario UL-06 — Navigasi ke detail user

```typescript
test("menavigasi ke detail user saat diklik", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  await userList.clickFirstRow();
  await expect(page).toHaveURL(/\/users\/.+/);
  const detail = new UserDetailPage(page);
  await expect(detail.userName).toBeVisible();
});
```

#### Detail Skenario UL-07 — Loading state

```typescript
test("menampilkan loading skeleton saat memuat", async ({ page }) => {
  const userList = new UserListPage(page);
  await page.route(/\/access\/v1\/companies\/.+\/users/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });

  await userList.goto(companyId);
  await expect(userList.skeleton).toBeVisible();
  await expect(userList.skeleton).toHaveCount(3);
});
```

---

### 3.2 Invitation Create

**Deskripsi:** Memverifikasi pembuatan undangan untuk bergabung ke perusahaan, termasuk validasi form, role selection, resend, dan limit.

**POM files needed:**

- `user/user-list.page.ts`
- `user/user-invite-modal.page.ts`
- `components/user-role-dropdown.component.ts`
- `layout/main-layout.page.ts`

**Test data:** `generateInvitationPayload()` dengan email unik, roleId valid.

| #   | Kode Test | Nama Test                                                 | Tipe        | POM                            | Langkah                                                 | Assertion                                                     |
| --- | --------- | --------------------------------------------------------- | ----------- | ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | IC-01     | membuka modal invite user menampilkan form yang benar     | Happy Path  | `UserInviteModal`              | Klik tombol "Undang Pengguna"                           | Modal muncul dengan field email, dropdown role, tombol kirim  |
| 2   | IC-02     | invite dengan email valid dan role dipilih berhasil       | Happy Path  | `UserInviteModal`              | Isi email valid, pilih role, klik kirim, tunggu API 201 | Toast sukses "Undangan berhasil dikirim", user muncul di list |
| 3   | IC-03     | validasi email — format tidak valid menampilkan error     | Error State | `UserInviteModal`              | Isi email "bukan-email", klik kirim                     | Error "Email tidak valid" di bawah field email                |
| 4   | IC-04     | validasi email — field kosong menampilkan error           | Error State | `UserInviteModal`              | Biarkan email kosong, klik kirim                        | Error "Email wajib diisi"                                     |
| 5   | IC-05     | invite user yang sudah menjadi anggota menampilkan error  | Error State | `UserInviteModal`              | Isi email anggota existing, klik kirim                  | Error "User sudah menjadi anggota perusahaan ini"             |
| 6   | IC-06     | memilih role dari dropdown menampilkan opsi yang tersedia | Happy Path  | `UserRoleDropdown`             | Klik dropdown role                                      | Daftar role muncul, pilih salah satu, field terisi            |
| 7   | IC-07     | resend invitation berhasil menambah resend count          | Happy Path  | `UserListPage`                 | Klik tombol resend pada user pending                    | Toast sukses, kolom resend count bertambah 1                  |
| 8   | IC-08     | resend melebihi batas maksimal menampilkan modal warning  | Edge Case   | `InvitationResendWarningModal` | Klik resend saat count >= limit                         | Modal warning "Batas kirim ulang undangan telah tercapai"     |
| 9   | IC-09     | loading state saat mengirim invite menampilkan spinner    | Edge Case   | `UserInviteModal`              | Submit form, intercept API lambat                       | Tombol submit disabled dengan spinner                         |

#### Detail Skenario IC-01 — Membuka modal invite

```typescript
test("membuka modal invite user", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.emailInput).toBeVisible();
  await expect(modal.roleDropdown).toBeVisible();
  await expect(modal.submitButton).toBeVisible();
});
```

#### Detail Skenario IC-02 — Invite dengan email valid

```typescript
test("invite dengan email valid + pilih role", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await modal.fillEmail("newuser@company.com");
  await modal.selectRole("Admin");
  await modal.submit();

  await expect(userList.toast).toHaveText(/undangan berhasil dikirim/i);
  await expect(userList.userRows).toContainText("newuser@company.com");
});
```

#### Detail Skenario IC-03 — Validasi email format tidak valid

```typescript
test("validasi email — format tidak valid", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await modal.fillEmail("bukan-email");
  await modal.submit();

  await expect(modal.emailError).toBeVisible();
  await expect(modal.emailError).toHaveText(/email tidak valid/i);
});
```

#### Detail Skenario IC-04 — Validasi email required

```typescript
test("validasi email — required", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await modal.submit();

  await expect(modal.emailError).toBeVisible();
  await expect(modal.emailError).toHaveText(/wajib diisi/i);
});
```

#### Detail Skenario IC-05 — Invite user yang sudah menjadi anggota

```typescript
test("invite user yang sudah menjadi anggota", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await modal.fillEmail(existingMemberEmail);
  await modal.selectRole("Admin");
  await modal.submit();

  await expect(modal.apiError).toBeVisible();
  await expect(modal.apiError).toHaveText(/sudah menjadi anggota/i);
});
```

#### Detail Skenario IC-06 — Memilih role dari dropdown

```typescript
test("memilih role dari dropdown", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  const dropdown = modal.roleDropdown;
  await dropdown.click();
  const options = await dropdown.getOptions();
  expect(options.length).toBeGreaterThanOrEqual(1);
  await dropdown.selectOption("Admin");
  await expect(dropdown.selectedValue).toHaveText("Admin");
});
```

#### Detail Skenario IC-07 — Resend invitation

```typescript
test("resend invitation", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  const resendButtons = await userList.getResendButtons();
  await resendButtons[0].click();
  await expect(userList.toast).toHaveText(/berhasil dikirim ulang/i);
});
```

#### Detail Skenario IC-08 — Resend melebihi batas

```typescript
test("resend melebihi batas — modal warning", async ({ page }) => {
  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.waitForLoad();

  const resendButton = userList.getResendButtonByIndex(overLimitUserIndex);
  await resendButton.click();

  const warningModal = new InvitationResendWarningModal(page);
  await expect(warningModal.dialog).toBeVisible();
  await expect(warningModal.title).toHaveText(/batas kirim ulang/i);
});
```

#### Detail Skenario IC-09 — Loading state

```typescript
test("loading state saat mengirim", async ({ page }) => {
  await page.route(/\/access\/v1\/companies\/.+\/users\/invite/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.fulfill({ status: 201 });
  });

  const userList = new UserListPage(page);
  await userList.goto(companyId);
  await userList.inviteButton.click();

  const modal = new UserInviteModal(page);
  await modal.fillEmail("new@company.com");
  await modal.selectRole("Admin");
  await modal.submit();

  await expect(modal.submitButton).toBeDisabled();
  await expect(modal.spinner).toBeVisible();
});
```

---

### 3.3 Invitation Accept (via Public Route)

**Deskripsi:** Memverifikasi penerimaan undangan melalui token yang dikirim ke email/SMS, mencakup semua skenario validasi token.

**POM files needed:**

- `user/invitation-accept.page.ts`
- `components/invitation-modals.component.ts`
- `layout/main-layout.page.ts`

**Test data:** Token undangan valid, expired, already accepted, replaced, mismatch, inactive.

| #   | Kode Test | Nama Test                                                        | Tipe        | POM                              | Langkah                                        | Assertion                                                              |
| --- | --------- | ---------------------------------------------------------------- | ----------- | -------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | IA-01     | accept dengan token valid berhasil dan redirect ke dashboard     | Happy Path  | `InvitationAcceptPage`           | Buka URL `/companies/:id/users/:token/accept`  | Sukses, redirect ke `/dashboard`, toast "Berhasil bergabung"           |
| 2   | IA-02     | accept dengan token expired menampilkan modal kedaluwarsa        | Error State | `InvitationExpiredModal`         | Buka URL dengan token expired                  | Modal "Undangan telah kedaluwarsa" dengan tombol "Minta undangan baru" |
| 3   | IA-03     | accept dengan token already accepted menampilkan modal           | Error State | `InvitationAlreadyAcceptedModal` | Buka URL dengan token sudah dipakai            | Modal "Undangan sudah diterima"                                        |
| 4   | IA-04     | accept dengan token replaced menampilkan modal                   | Error State | `InvitationReplacedModal`        | Buka URL dengan token diganti                  | Modal "Undangan telah diganti"                                         |
| 5   | IA-05     | accept dengan account mismatch (email berbeda) menampilkan modal | Error State | `InvitationMismatchModal`        | Buka URL dengan token mismatch                 | Modal "Email tidak cocok dengan undangan"                              |
| 6   | IA-06     | accept — user inactive menampilkan modal                         | Error State | `InvitationInactiveModal`        | Buka URL dengan token untuk user nonaktif      | Modal "Akun Anda tidak aktif"                                          |
| 7   | IA-07     | accept — butuh select workspace menampilkan workspace selector   | Edge Case   | `InvitationAcceptPage`           | Accept dengan user yang punya banyak workspace | Workspace selector visible, pilih workspace                            |
| 8   | IA-08     | accept via notification — konfirmasi dari notifikasi             | Happy Path  | `NotificationListPage`           | Buka notifikasi, klik "Terima" pada undangan   | Modal konfirmasi, accept berhasil                                      |

#### Detail Skenario IA-01 — Accept dengan token valid

```typescript
test("accept dengan token valid", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, validToken);
  await acceptPage.waitForLoad();

  await acceptPage.acceptInvitation();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(acceptPage.toast).toHaveText(/berhasil bergabung/i);
});
```

#### Detail Skenario IA-02 — Accept dengan token expired

```typescript
test("accept dengan token expired", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, expiredToken);
  await acceptPage.waitForLoad();

  const modal = new InvitationExpiredModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.title).toHaveText(/kedaluwarsa/i);
  await expect(modal.requestNewButton).toBeVisible();
});
```

#### Detail Skenario IA-03 — Accept dengan token already accepted

```typescript
test("accept dengan token already accepted", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, acceptedToken);

  const modal = new InvitationAlreadyAcceptedModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.title).toHaveText(/sudah diterima/i);
});
```

#### Detail Skenario IA-04 — Accept dengan token replaced

```typescript
test("accept dengan token replaced", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, replacedToken);

  const modal = new InvitationReplacedModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.title).toHaveText(/telah diganti/i);
});
```

#### Detail Skenario IA-05 — Accept dengan account mismatch

```typescript
test("accept — account mismatch", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, mismatchToken);

  const modal = new InvitationMismatchModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.title).toHaveText(/tidak cocok/i);
  await expect(modal.invitedEmail).toBeVisible();
  await expect(modal.currentEmail).toBeVisible();
});
```

#### Detail Skenario IA-06 — Accept — user inactive

```typescript
test("accept — user inactive", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, inactiveUserToken);

  const modal = new InvitationInactiveModal(page);
  await expect(modal.dialog).toBeVisible();
  await expect(modal.title).toHaveText(/tidak aktif/i);
});
```

#### Detail Skenario IA-07 — Accept — butuh select workspace

```typescript
test("accept — butuh select workspace", async ({ page }) => {
  const acceptPage = new InvitationAcceptPage(page);
  await acceptPage.goto(companyId, multiWorkspaceToken);

  await expect(acceptPage.workspaceSelector).toBeVisible();
  await acceptPage.selectWorkspace("Workspace 1");
  await acceptPage.confirmWorkspace();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

#### Detail Skenario IA-08 — Accept via notification

```typescript
test("accept via notification — konfirmasi", async ({ page }) => {
  const notificationPage = new NotificationListPage(page);
  await notificationPage.goto();
  await notificationPage.waitForLoad();

  const invitationCard = notificationPage.getInvitationCardByCompany(companyName);
  await invitationCard.acceptButton.click();
  await invitationCard.confirmAccept();

  await expect(notificationPage.toast).toHaveText(/undangan diterima/i);
});
```

---

### 3.4 User Detail & Role Management

**Deskripsi:** Memverifikasi halaman detail pengguna, manajemen peran dalam perusahaan, dan toggle status.

**POM files needed:**

- `user/user-list.page.ts`
- `user/user-detail.page.ts`
- `components/user-role-dropdown.component.ts`

**Test data:** User dengan multiple company membership, role yang bisa diubah, status aktif/nonaktif.

| #   | Kode Test | Nama Test                                                | Tipe       | POM                                  | Langkah                                   | Assertion                                           |
| --- | --------- | -------------------------------------------------------- | ---------- | ------------------------------------ | ----------------------------------------- | --------------------------------------------------- |
| 1   | UD-01     | menampilkan profil user (nama, email, no telepon)        | Happy Path | `UserDetailPage`                     | Navigasi ke detail user                   | Field nama, email, phone terlihat dengan data benar |
| 2   | UD-02     | menampilkan daftar company membership user               | Happy Path | `UserDetailPage`                     | Scroll ke section membership              | Tabel perusahan tempat user bergabung terlihat      |
| 3   | UD-03     | update role user berhasil mengubah peran                 | Happy Path | `UserDetailPage`, `UserRoleDropdown` | Pilih role baru dari dropdown, simpan     | Toast sukses, role berubah di tabel membership      |
| 4   | UD-04     | toggle status active menjadi inactive                    | Happy Path | `UserDetailPage`                     | Klik toggle/button deactivate, konfirmasi | Status berubah menjadi "Tidak Aktif"                |
| 5   | UD-05     | toggle status inactive menjadi active                    | Happy Path | `UserDetailPage`                     | Klik toggle/button activate               | Status berubah menjadi "Aktif"                      |
| 6   | UD-06     | deactivate — confirmation dialog muncul sebelum eksekusi | Edge Case  | `UserDeactivateModal`                | Klik deactivate                           | Dialog konfirmasi visible dengan tombol Ya/Tidak    |
| 7   | UD-07     | update role — pilih dari dropdown menampilkan opsi       | Happy Path | `UserRoleDropdown`                   | Klik dropdown role pada membership        | Opsi role muncul, pilih salah satu                  |

#### Detail Skenario UD-01 — Menampilkan profil user

```typescript
test("menampilkan profil user", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  await expect(detail.userName).toBeVisible();
  await expect(detail.userName).toHaveText(userName);
  await expect(detail.userEmail).toBeVisible();
  await expect(detail.userEmail).toHaveText(userEmail);
  await expect(detail.userPhone).toBeVisible();
});
```

#### Detail Skenario UD-02 — Menampilkan daftar company membership

```typescript
test("menampilkan daftar company membership", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  await expect(detail.companyMembershipTable).toBeVisible();
  const rows = await detail.membershipRows.all();
  expect(rows.length).toBeGreaterThanOrEqual(1);
  await expect(rows[0]).toContainText(companyName);
});
```

#### Detail Skenario UD-03 — Update role user

```typescript
test("update role user", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  const dropdown = detail.getRoleDropdown(membershipId);
  await dropdown.selectOption("Manager");
  await detail.saveRole();
  await expect(detail.toast).toHaveText(/role berhasil diubah/i);
  await expect(dropdown.selectedValue).toHaveText("Manager");
});
```

#### Detail Skenario UD-04 — Toggle status active → inactive

```typescript
test("toggle status active → inactive", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  await detail.deactivateButton.click();
  const confirmModal = new UserDeactivateModal(page);
  await confirmModal.confirm();
  await expect(detail.statusBadge).toHaveText(/tidak aktif/i);
});
```

#### Detail Skenario UD-05 — Toggle status inactive → active

```typescript
test("toggle status inactive → active", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, inactiveUserId);
  await detail.waitForLoad();

  await detail.activateButton.click();
  await expect(detail.toast).toHaveText(/berhasil diaktifkan/i);
  await expect(detail.statusBadge).toHaveText(/aktif/i);
});
```

#### Detail Skenario UD-06 — Deactivate confirmation dialog

```typescript
test("deactivate — confirmation dialog", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  await detail.deactivateButton.click();
  const confirmModal = new UserDeactivateModal(page);
  await expect(confirmModal.dialog).toBeVisible();
  await expect(confirmModal.title).toHaveText(/nonaktifkan/i);
  await expect(confirmModal.cancelButton).toBeVisible();
  await expect(confirmModal.confirmButton).toBeVisible();
});
```

#### Detail Skenario UD-07 — Update role dropdown

```typescript
test("update role — pilih dari dropdown", async ({ page }) => {
  const detail = new UserDetailPage(page);
  await detail.goto(companyId, userId);
  await detail.waitForLoad();

  const dropdown = detail.getRoleDropdown(membershipId);
  await dropdown.click();
  const options = await dropdown.getOptions();
  expect(options.length).toBeGreaterThanOrEqual(1);
  await dropdown.selectOption("Admin");
  await expect(dropdown.selectedValue).toHaveText("Admin");
});
```

---

## 4. Test Data

### 4.1 Factory Function — Invitation Payload

```typescript
// data/user.data.ts
export function generateInvitationPayload(overrides?: Partial<InvitationCreatePayload>): InvitationCreatePayload {
  return {
    email: `testuser_${Date.now()}@groapptest.com`,
    roleId: "role-default-id",
    ...overrides,
  };
}
```

### 4.2 Factory Function — User Response Mock

```typescript
// data/user.data.ts
export function generateUserResponse(overrides?: Partial<UserResponse>): UserResponse {
  return {
    id: `usr_${Date.now()}`,
    name: "Test User",
    email: `testuser_${Date.now()}@groapptest.com`,
    countryCode: "62",
    phone: "81234567890",
    status: "active",
    role: "Admin",
    invitationStatus: "accepted",
    resendCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### 4.3 Factory Function — Invitation Token

```typescript
// data/user.data.ts
export function generateInvitationToken(): string {
  return `inv_${crypto.randomUUID().replace(/-/g, "")}`;
}
```

### 4.4 Constants

```typescript
// data/constants.ts
export const USER_CONSTANTS = {
  INVITE_MAX_RESEND: 3,
  VALID_EMAIL: "newmember@company.com",
  INVALID_EMAIL: "bukan-email",
  EXISTING_MEMBER_EMAIL: "existing@company.com",
  EXPIRED_TOKEN: "inv_expired_token_123",
  ACCEPTED_TOKEN: "inv_accepted_token_456",
  REPLACED_TOKEN: "inv_replaced_token_789",
  MISMATCH_TOKEN: "inv_mismatch_token_abc",
  INACTIVE_USER_TOKEN: "inv_inactive_token_def",
};
```

---

## 5. Catatan Penting

### 5.1 Aturan Pencocokan Email Undangan (Email Match Rule)

Saat user menerima undangan, sistem memverifikasi bahwa email user yang login (atau akan login) cocok dengan email yang digunakan saat undangan dibuat:

| Skenario                         | Perilaku                                             |
| -------------------------------- | ---------------------------------------------------- |
| Email sama                       | Accept langsung, redirect ke dashboard               |
| Email berbeda (user sudah login) | Modal mismatch — "Email tidak cocok dengan undangan" |
| Email berbeda (user belum login) | Arahkan login dulu, lalu validasi mismatch           |

### 5.2 Validasi Token Undangan

| Status Token          | Tampilan                                                             |
| --------------------- | -------------------------------------------------------------------- |
| Valid & belum dipakai | Halaman accept dengan tombol "Terima Undangan"                       |
| Expired               | Modal "Undangan telah kedaluwarsa", tombol minta undangan baru       |
| Already accepted      | Modal "Undangan sudah diterima", redirect ke login                   |
| Replaced              | Modal "Undangan telah diganti" (ada undangan baru yang menggantikan) |

### 5.3 Batas Resend Invitation

Setiap undangan memiliki batas maksimal pengiriman ulang (`INVITE_MAX_RESEND = 3`). Jika batas tercapai, tombol resend menampilkan modal warning dan tidak dapat diklik lagi hingga admin membuat undangan baru.

### 5.4 Role Assignment

- Role diambil dari daftar role yang tersedia di perusahaan tersebut
- Dropdown role menampilkan semua role yang dimiliki perusahaan
- Saat role diubah, API memvalidasi bahwa role target masih aktif
- Role "Super Admin" tidak dapat diubah melalui halaman ini (guard khusus)

### 5.5 Status Toggle

| Aksi              | Konfirmasi                                              | Efek                                             |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------ |
| Active → Inactive | Dialog konfirmasi "Yakin ingin menonaktifkan user ini?" | User tidak bisa login, tidak menerima notifikasi |
| Inactive → Active | Tidak perlu konfirmasi (langsung)                       | User bisa login kembali                          |

### 5.6 Ketergantungan Antar Test

- Test UL (User List) membutuhkan minimal 1 user dalam perusahaan
- Test IC (Invitation Create) membutuhkan akses ke perusahaan yang memiliki izin invite
- Test IA (Invitation Accept) membutuhkan token yang disiapkan via API setup
- Test UD (User Detail) membutuhkan user yang sudah accept undangan
- Gunakan `test.beforeEach` untuk setup data, jangan andalkan state antar test

### 5.7 Flakiness Prevention

| Risiko                         | Mitigasi                                                               |
| ------------------------------ | ---------------------------------------------------------------------- |
| API response lambat            | Gunakan `waitForResponse` atau auto-waiting, jangan `waitFor(timeout)` |
| Token expired saat test        | Generate token segar di `beforeEach` via API call                      |
| Multiple resend berturut-turut | Pastikan batas resend di-reset sebelum test IC-08                      |
| Email sudah terdaftar          | Gunakan email unik per test (`Date.now()` + random)                    |
| Role dropdown tidak muncul     | Tunggu opsi dropdown load sebelum interaksi                            |
| Modal animasi                  | Gunakan `waitForSelector` pada modal container                         |

### 5.8 POM Mapping

| Halaman/Modal     | File POM                             | Base URL                             |
| ----------------- | ------------------------------------ | ------------------------------------ |
| Daftar User       | `user/user-list.page.ts`             | `/companies/:id/users`               |
| Detail User       | `user/user-detail.page.ts`           | `/companies/:id/users/:invitationId` |
| Invite Modal      | `user/user-invite-modal.page.ts`     | — (modal)                            |
| Accept Invitation | `user/invitation-accept.page.ts`     | `/companies/:id/users/:token/accept` |
| Deactivate Modal  | `user/user-deactivate-modal.page.ts` | — (modal)                            |

### 5.9 Anti-Hallucination Checklist

- [ ] Route `/companies/:companyId/users` exists in app router (AuthGuard, AppMainAccessLayout)
- [ ] Route `/companies/:companyId/users/:invitationId` exists for invitation accept (public route)
- [ ] Component `EmptyData` exists in shared patterns
- [ ] Modal invitation modals (expired, accepted, replaced, mismatch, inactive) verified
- [ ] Role invitation dropdown component exists
- [ ] Search/filter components exist
- [ ] Invitation create endpoint: `POST /access/v1/companies/:id/users/invite`
- [ ] Invitation resend endpoint: `POST /access/v1/companies/:id/users/:invitationId/resend`
- [ ] Invitation accept endpoint: `POST /access/v1/companies/:id/users/:invitationId/accept`
- [ ] Validation rules: email format, required fields, role required
- [ ] DataState pattern used: initial → loading → success/empty/failure
- [ ] Status toggle requires confirmation dialog
- [ ] Resend limit: 3x max

# GroApp Access — Rencana Cakupan Testing E2E

> **Tujuan:** Indeks utama untuk seluruh dokumen cakupan testing per fitur. Setiap fitur memiliki file khusus di `test-coverage/` berisi tabel skenario detail, struktur POM, pola kode, dan data test. Dokumen ini merangkum cakupan dan menautkan ke setiap dokumen detail.

---

## Daftar Isi

1. [Cakupan Fitur](#1-cakupan-fitur)
2. [Legenda Cakupan](#2-legenda-cakupan)
3. [Infrastruktur Testing](#3-infrastruktur-testing)
4. [Arsitektur POM](#4-arsitektur-pom)
5. [Pola Umum & Best Practices](#5-pola-umum--best-practices)
6. [Cara Menjalankan Test](#6-cara-menjalankan-test)
7. [Urutan Prioritas Eksekusi](#7-urutan-prioritas-eksekusi)
8. [Environment & Data Test](#8-environment--data-test)

---

## 1. Cakupan Fitur

| #   | Fitur            | Prioritas | Total Skenario | File Cakupan                                                                       | Sub-Fitur Utama                                                                                                                                   |
| --- | ---------------- | --------- | -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Auth**         | P0        | 111            | [`test-coverage/coverage-auth.md`](test-coverage/coverage-auth.md)                 | Login manual (20), Google OAuth (8), Apple OAuth (4), Register (23), Verifikasi email+OTP (20), Pemulihan password (18), Re-auth (10), Logout (8) |
| 2   | **Company**      | P0        | 69             | [`test-coverage/coverage-company.md`](test-coverage/coverage-company.md)           | Daftar (15), Buat (30), Detail (15), Update (30), Hapus (10), Logo+Default (14)                                                                   |
| 3   | **User**         | P1        | 31             | [`test-coverage/coverage-user.md`](test-coverage/coverage-user.md)                 | Daftar+filter user (7), Buat undangan (9), Terima undangan (8), Detail+update peran (7)                                                           |
| 4   | **Role**         | P1        | 10             | [`test-coverage/coverage-role.md`](test-coverage/coverage-role.md)                 | Daftar role (3), Detail role dengan pohon permission (7)                                                                                          |
| 5   | **Workspace**    | P1        | 26             | [`test-coverage/coverage-workspace.md`](test-coverage/coverage-workspace.md)       | Daftar infinite scroll (7), Buat (8), Update (3), Hapus type-to-confirm (8)                                                                       |
| 6   | **Dashboard**    | P2        | 12             | [`test-coverage/coverage-dashboard.md`](test-coverage/coverage-dashboard.md)       | Tampilan welcome+cards+aksi (8), Navigasi (4)                                                                                                     |
| 7   | **Onboarding**   | P2        | 17             | [`test-coverage/coverage-onboarding.md`](test-coverage/coverage-onboarding.md)     | Tampilan stepper (5), Submit+validasi (12)                                                                                                        |
| 8   | **Profile**      | P1        | 47             | [`test-coverage/coverage-profile.md`](test-coverage/coverage-profile.md)           | Lihat+edit (8), Ganti password (8), Ganti email (12), Ganti WhatsApp (10), Hapus akun (9)                                                         |
| 9   | **Notification** | P2        | 26             | [`test-coverage/coverage-notification.md`](test-coverage/coverage-notification.md) | Daftar+infinite scroll (7), Modal detail (5), Filter (4), Aksi undangan (10)                                                                      |
| 10  | **Unit**         | P2        | 37             | [`test-coverage/coverage-unit.md`](test-coverage/coverage-unit.md)                 | Daftar (6), Buat (12), Detail+update (7), Toggle status (4), Hapus+impact (8)                                                                     |
| 11  | **Media**        | P3        | 7              | [`test-coverage/coverage-media.md`](test-coverage/coverage-media.md)               | Upload (3), Get (2), Hapus (2)                                                                                                                    |
|     | **Total**        |           | **393**        | —                                                                                  | —                                                                                                                                                 |

---

## 2. Legenda Cakupan

| Prioritas | Arti                                                         |
| --------- | ------------------------------------------------------------ |
| P0        | Kritis — auth, CRUD inti. Harus lulus sebelum rilis.         |
| P1        | Tinggi — alur sekunder. Harus lulus sebelum rilis fitur.     |
| P2        | Sedang — kasus batas, state error. Test setelah P0/P1 lulus. |
| P3        | Rendah — nice-to-have, skenario jarang.                      |

| Tipe Test   | Arti                                          |
| ----------- | --------------------------------------------- |
| Happy Path  | Alur sukses yang diharapkan                   |
| Error State | Tampilan error spesifik (validasi, API error) |
| Edge Case   | Nilai batas, state kosong, kondisi balapan    |
| Permission  | RBAC gating, visibilitas berbasis peran       |

---

## 3. Infrastruktur Testing

### 3.1 Konfigurasi Playwright

```typescript
// playwright.config.ts (ringkasan)
testDir: './tests';
fullyParallel: true;
baseURL: 'http://localhost:4173';  // dari npm run preview
retries: CI ? 2 : 0;
projects: [chromium, firefox, webkit];
webServer: { command: 'npm run preview', url: 'http://localhost:4173' };
```

### 3.2 File Global Setup

| File                       | Tujuan                                        |
| -------------------------- | --------------------------------------------- |
| `tests/auth.setup.ts`      | Login sekali per worker, simpan storage state |
| `tests/global-setup.ts`    | Validasi env vars, seed data test             |
| `tests/global-teardown.ts` | Bersihkan data test setelah run               |

### 3.3 Struktur Direktori

```text
tests/
├── auth.setup.ts                 # Fixture login
├── global-setup.ts               # Seed data
├── global-teardown.ts            # Cleanup
├── pages/                        # Page Objects
│   ├── base.page.ts
│   ├── components/               # Modal, toast, table, navbar, sidebar
│   ├── layout/                   # AuthLayout, MainLayout
│   ├── auth/                     # Login, Register, Verifikasi, etc.
│   ├── company/                  # CompanyList, CompanyDetail, etc.
│   ├── user/
│   ├── role/
│   ├── workspace/
│   ├── dashboard/
│   ├── onboarding/
│   ├── profile/
│   ├── notification/
│   └── unit/
├── fixtures/                     # Fixtures kustom
├── data/                         # Factory data test
├── utils/                        # Helper (api, token, file)
├── specs/                        # File test per fitur
└── types/                        # Tipe bersama
```

---

## 4. Arsitektur POM

### 4.1 Kontrak BasePage

```typescript
class BasePage {
  readonly page: Page;
  readonly url: string;

  async goto(subpath?: string): Promise<void>;
  async waitForLoad(): Promise<void>;

  // Komponen bersama yang tersedia di setiap halaman
  readonly toast: ToastComponent;
  readonly modal: ModalComponent;
  readonly navbar: NavbarComponent;
  readonly sidebar: SidebarComponent;

  // Utilitas
  async getPageTitle(): Promise<string>;
  async waitForResponse(endpoint: string): Promise<void>;
  async waitForToast(timeout?: number): Promise<void>;
  async screenshot(name: string): Promise<void>;
}
```

### 4.2 Component POM

| Komponen   | File                                 | Method Utama                                              |
| ---------- | ------------------------------------ | --------------------------------------------------------- |
| Modal      | `components/modal.component.ts`      | `waitForOpen()`, `waitForClose()`, `confirm()`, `close()` |
| Toast      | `components/toast.component.ts`      | `waitForToast()`, `getMessage()`, `dismiss()`             |
| Table      | `components/table.component.ts`      | `getRows()`, `getCell()`, `clickRow()`, `sortBy()`        |
| Navbar     | `components/navbar.component.ts`     | `getTitle()`, `clickNotification()`, `clickProfile()`     |
| Sidebar    | `components/sidebar.component.ts`    | `navigateTo()`, `getActiveItem()`                         |
| Breadcrumb | `components/breadcrumb.component.ts` | `getItems()`, `clickItem()`                               |
| Pagination | `components/pagination.component.ts` | `nextPage()`, `prevPage()`, `goToPage()`                  |

### 4.3 Aturan Page Object

| Aturan                                            | Detail                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| Satu POM per route                                | Tidak ada page object monolitik                                           |
| Selector = property readonly                      | `readonly emailInput = this.page.getByRole('textbox', { name: 'Email' })` |
| Method aksi return `this` atau halaman berikutnya | Method chaining: `fillEmail().fillPassword().clickLogin()`                |
| Transisi halaman return target page               | `submitLogin(): Promise<DashboardPage>`                                   |
| Tidak ada asersi di POM                           | Asersi hanya di file spec                                                 |
| Data attributes first                             | `getByTestId` > `getByRole` > `getByLabel` > `getByText` > CSS            |

---

## 5. Pola Umum & Best Practices

### 5.1 Strategi Selector

```typescript
// Urutan prioritas:
1. page.getByTestId('element-id')        // data-testid — paling stabil
2. page.getByRole('button', { name: /simpan/i })  // Semantic role — aksesibel, resilient
3. page.locator('input[name="email"]')   // name attr dari schema — stabil walau copy berubah
4. page.getByLabel('Email')              // <label> association — rentan perubahan locale
5. page.getByPlaceholder('Masukkan email') // Placeholder — paling rapuh
6. page.locator('button[type="submit"]') // CSS — opsi terakhir
7. page.locator('//button')             // XPath — TIDAK BOLEH
```

### 5.2 Pola Asersi

```typescript
// Visibilitas
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// State
await expect(element).toBeDisabled();
await expect(element).toBeEnabled();
await expect(element).toHaveAttribute("type", "password");

// Teks
await expect(element).toHaveText("Email sudah terdaftar");
await expect(element).toContainText("berhasil");

// Navigasi
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toContainURL("/auth/login");

// Jumlah
await expect(page.locator(".row")).toHaveCount(3);
await expect(element).toHaveCount(0); // tidak ada

// API
await expect(responsePromise).toBeOK();
```

### 5.3 Strategi Wait

```typescript
// ✅ Benar — Playwright auto-wait untuk aksi
await page.getByRole("button").click(); // auto-wait visible + enabled
await expect(page.getByText("Sukses")).toBeVisible(); // auto-wait sampai visible
await page.waitForResponse(/\/access\/v1\/companies/); // tunggu API
await page.waitForURL("/dashboard"); // tunggu navigasi
await expect(async () => {
  // polling sampai pass
  const count = await page.locator(".row").count();
  expect(count).toBeGreaterThan(0);
}).toPass();

// ❌ Salah — jangan pernah gunakan
await page.waitForTimeout(2000);
```

### 5.4 Pola Isi Form

```typescript
async function isiFormRegister(page: Page, data: RegisterPayload) {
  await page.getByLabel("Nama").fill(data.name);
  await page.getByLabel("Email").fill(data.email);
  await page.getByLabel("Nomor Telepon").fill(data.phone);
  await page.getByLabel("Password").fill(data.password);
  await page.getByLabel("Konfirmasi Password").fill(data.confirmPassword);
  await page.getByRole("checkbox").check();
}
```

### 5.5 Pola Intercept API

```typescript
// Mock response API untuk test error
await page.route("**/access/v1/auth/login", async (route) => {
  await route.fulfill({
    status: 400,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "Email atau password salah" }),
  });
});
```

### 5.6 Pola Fixture Auth

```typescript
// auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authentikasi", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: /masuk/i }).click();
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: "auth.json" });
});
```

---

## 6. Cara Menjalankan Test

```bash
# Jalankan semua test E2E
.agent/hooks/test.sh test

# Mode UI interaktif
.agent/hooks/test.sh test --ui

# Test spesifik
.agent/hooks/test.sh test tests/specs/auth/login-manual.spec.ts

# Test by fitur
.agent/hooks/test.sh test --grep "Company"

# Debug mode
.agent/hooks/test.sh test --debug

# Dengan reporter spesifik
.agent/hooks/test.sh test --reporter=list

# Full CI pipeline
npm run lint && npm run typecheck && npm run build && npm run test && .agent/hooks/test.sh test
```

---

## 7. Urutan Prioritas Eksekusi

```text
Fase 1 (P0 — Kritis)
├── Auth: login manual, logout, auth.setup.ts
├── Company: daftar, buat, detail

Fase 2 (P0-P1 — CRUD Inti)
├── Auth: register, verifikasi, pemulihan password
├── Company: update, hapus, logo
├── User: buat undangan, terima undangan, update peran

Fase 3 (P1 — Sekunder)
├── Workspace: CRUD lengkap
├── Profile: edit, password, email, whatsapp
├── Role: daftar, detail

Fase 4 (P2 — Kasus Batas)
├── Notification: daftar, mark read, aksi undangan
├── Unit: CRUD, toggle status
├── Dashboard
├── Onboarding

Fase 5 (P3 — Nice-to-have)
├── Media: upload, get, hapus
├── Notification: filter, detail
└── Unit: geo cascade
```

---

## 8. Environment & Data Test

### 8.1 Konstanta Environment

| Variable              | Sumber               | Contoh                       |
| --------------------- | -------------------- | ---------------------------- |
| `BASE_URL`            | playwright.config.ts | `http://localhost:4173`      |
| `API_URL`             | `.env.testing`       | `https://api-test.groapp.id` |
| `TEST_USER_EMAIL`     | `.env` / constants   | `test@groapp.id`             |
| `TEST_USER_PASSWORD`  | `.env` / constants   | `Test1234!`                  |
| `TEST_COMPANY_NAME`   | constants            | `PT Test QA`                 |
| `TEST_WORKSPACE_NAME` | constants            | `Workspace QA`               |

### 8.2 Factory Data (Bersama)

```typescript
// data/constants.ts
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "REDACTED_EMAIL",
  password: process.env.TEST_USER_PASSWORD || "REDACTED_PASSWORD",
  name: "QA Tester",
  phone: "81234567890",
  countryCode: "+62",
} as const;

export const TIMEOUTS = {
  navigation: 30000,
  toast: 10000,
  api: 15000,
  animation: 1000,
} as const;
```

### 8.3 Factory per Fitur

Setiap file cakupan fitur menyertakan fungsi factory data test sendiri. Lihat file masing-masing:

| Fitur             | File                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Data Auth         | [`test-coverage/coverage-auth.md`](test-coverage/coverage-auth.md#4-data-test)                 |
| Data Company      | [`test-coverage/coverage-company.md`](test-coverage/coverage-company.md#4-data-test)           |
| Data User         | [`test-coverage/coverage-user.md`](test-coverage/coverage-user.md#4-data-test)                 |
| Data Workspace    | [`test-coverage/coverage-workspace.md`](test-coverage/coverage-workspace.md#4-data-test)       |
| Data Profile      | [`test-coverage/coverage-profile.md`](test-coverage/coverage-profile.md#4-data-test)           |
| Data Notification | [`test-coverage/coverage-notification.md`](test-coverage/coverage-notification.md#4-data-test) |
| Data Unit         | [`test-coverage/coverage-unit.md`](test-coverage/coverage-unit.md#4-data-test)                 |

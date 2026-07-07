# Coverage Dashboard — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Dashboard pada GroApp Access.**
> Meliputi: welcome section, module cards, quick actions, navigasi.

---

## 1. Pendahuluan

Fitur Dashboard adalah halaman utama yang ditampilkan setelah pengguna berhasil login. Dashboard memberikan ringkasan akses cepat ke modul-modul utama GroApp (Access dan Accounting) serta tindakan cepat seperti mengundang tim, mengelola role, dan melihat audit log. Dashboard diakses melalui route `/dashboard` yang dilindungi `AuthGuard` dalam `AppMainAccessLayout`.

Sumber kode: `src/features/dashboard/`

**Arsitektur Dashboard:**

| Layer        | Path                   | Fungsi            |
| ------------ | ---------------------- | ----------------- |
| Presentation | `presentation/pages/`  | Halaman dashboard |
| Presentation | `presentation/routes/` | Route paths       |

**Komponen UI:**

| Komponen        | Pattern             | Fungsi                                   |
| --------------- | ------------------- | ---------------------------------------- |
| Welcome Section | Custom              | Sambutan personalized dengan nama user   |
| Module Cards    | `card/quick-access` | Kartu akses ke modul Access & Accounting |
| Quick Actions   | `card/quick-access` | Tombol aksi cepat (invite, role, audit)  |

**Routes:**

| Path         | Layout              | Deskripsi                |
| ------------ | ------------------- | ------------------------ |
| `/`          | AppMainAccessLayout | Redirect ke `/dashboard` |
| `/dashboard` | AppMainAccessLayout | Halaman dashboard utama  |

---

## 2. Struktur File Test

```text
tests/
├── pages/dashboard/
│   └── dashboard.page.ts                   # Halaman dashboard
├── specs/dashboard/
│   └── dashboard.spec.ts                   # Test dashboard
├── data/
│   └── constants.ts                        # Test constants
└── fixtures/
    └── auth.fixture.ts                     # Fixture autentikasi
```

---

## 3. Playwright E2E

### 3.1 Dashboard Display

Dashboard menampilkan section welcome (sapaan personalized), module cards (Access + Accounting), dan quick actions (invite, role, audit log). Loading state ditampilkan saat data dimuat.

| #     | Nama Test                                          | Assertion                                      |
| ----- | -------------------------------------------------- | ---------------------------------------------- |
| DB-01 | menampilkan section welcome dengan nama pengguna   | Teks "Hai, {nama}" visible                     |
| DB-02 | menampilkan module card Access                     | Kartu "GroApp Access" visible                  |
| DB-03 | menampilkan module card Accounting                 | Kartu "GroApp Accounting" visible              |
| DB-04 | menampilkan quick action "Undang Tim"              | Tombol/tautan "Undang Tim" visible             |
| DB-05 | menampilkan quick action "Kelola Role"             | Tombol/tautan "Kelola Role" visible            |
| DB-06 | menampilkan quick action "Audit Log"               | Tombol/tautan "Audit Log" visible              |
| DB-07 | menampilkan loading state saat pertama kali render | Skeleton/loader terlihat sebelum konten muncul |

**POM:** `dashboard.page.ts`

**Selectors:**

- `welcomeSection = page.getByTestId('welcome-section')`
- `welcomeText = page.getByTestId('welcome-text')`
- `accessModuleCard = page.getByTestId('module-card-access')`
- `accountingModuleCard = page.getByTestId('module-card-accounting')`
- `quickActionInvite = page.getByTestId('quick-action-invite')`
- `quickActionRole = page.getByTestId('quick-action-role')`
- `quickActionAudit = page.getByTestId('quick-action-audit')`
- `dashboardSkeleton = page.getByTestId('dashboard-skeleton')`

**Assertions:**

- `expect(welcomeSection).toBeVisible()`
- `expect(welcomeText).toContainText(/hai/i)`
- `expect(accessModuleCard).toBeVisible()`
- `expect(accountingModuleCard).toBeVisible()`
- `expect(quickActionInvite).toBeVisible()`
- `expect(quickActionRole).toBeVisible()`
- `expect(quickActionAudit).toBeVisible()`
- `expect(dashboardSkeleton).toBeVisible()` (loading)

### 3.2 Dashboard Navigation

Mengklik module card atau quick action menavigasi ke halaman yang sesuai.

| #     | Nama Test                                                 | Assertion                                         |
| ----- | --------------------------------------------------------- | ------------------------------------------------- |
| DB-08 | mengklik module card Access menuju halaman company        | URL mengandung `/companies`                       |
| DB-09 | mengklik module card Accounting menuju halaman accounting | URL mengandung `/accounting`                      |
| DB-10 | mengklik "Undang Tim" membuka halaman atau modal undang   | URL mengandung `/users` atau modal invite visible |
| DB-11 | mengklik "Kelola Role" menuju halaman role                | URL mengandung `/roles`                           |
| DB-12 | mengklik "Audit Log" menuju halaman audit log             | URL mengandung `/audit-log` atau `/activity`      |

**POM:** `dashboard.page.ts`

**Selectors (Navigation):**

- `accessModuleCardLink = page.getByTestId('module-card-access').locator('a')`
- `accountingModuleCardLink = page.getByTestId('module-card-accounting').locator('a')`
- `quickActionInviteButton = page.getByTestId('quick-action-invite')`
- `quickActionRoleButton = page.getByTestId('quick-action-role')`
- `quickActionAuditButton = page.getByTestId('quick-action-audit')`

**Assertions:**

- `expect(page).toHaveURL(/\/companies/)` (Access card)
- `expect(page).toHaveURL(/\/accounting/)` (Accounting card)
- `expect(page).toHaveURL(/\/users/)` (Invite)
- `expect(page).toHaveURL(/\/roles/)` (Role)
- `expect(page).toHaveURL(/\/(audit-log|activity)/)` (Audit log)

---

## 4. Test Data

| Data                    | Deskripsi                                  |
| ----------------------- | ------------------------------------------ |
| Test user               | User terautentikasi dengan akses ke Access |
| Test user (tanpa akses) | User tanpa akses ke modul tertentu         |

**Constants khusus:**

- `DASHBOARD_URL`: '/dashboard'
- `ROOT_URL`: '/'
- `WELCOME_TEXT_PATTERN`: /hai,\s\*\w+/i

---

## 5. Catatan Penting

1. **Welcome section dinamis.** Teks welcome menggunakan nama pengguna dari sesi autentikasi. Test harus memverifikasi bahwa nama yang ditampilkan sesuai dengan nama pengguna yang login.

2. **Module cards tergantung role.** Module card Accounting mungkin tidak muncul untuk pengguna tanpa akses accounting. Test harus menggunakan user dengan role yang sesuai atau memverifikasi conditional rendering.

3. **Quick action navigasi.** Aksi cepat mungkin menavigasi ke halaman yang berbeda tergantung konfigurasi. Verifikasi URL akhir menggunakan `toContainURL()` yang lebih fleksibel.

4. **Loading state.** Dashboard mungkin memuat data secara asinkron (profil, modul). Skeleton/loader harus diverifikasi.

5. **Redirect dari `/` ke `/dashboard`.** Route root (`/`) otomatis redirect ke `/dashboard`. Test harus memverifikasi redirect ini.

6. **Test isolation.** Gunakan `test.beforeEach` untuk navigasi ke `/dashboard`. Jangan mengandalkan state dari test sebelumnya.

7. **Selector priority.** Data-testid adalah priority pertama. Fallback ke `getByRole` dan `getByText` jika tidak tersedia.

8. **Daftar POM yang diperlukan:**
   - `tests/pages/dashboard/dashboard.page.ts`
   - `tests/pages/layout/main-layout.page.ts` (navbar, sidebar)

---

## 6. Ringkasan Skenario

| Bagian               | Jumlah Skenario | Kode Prefix |
| -------------------- | --------------- | ----------- |
| Dashboard Display    | 7               | DB-01–DB-07 |
| Dashboard Navigation | 5               | DB-08–DB-12 |
| **Total**            | **12**          | DB-01–DB-12 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario                   | Alasan                                    |
| --------- | -------------------------- | ----------------------------------------- |
| P0        | DB-01, DB-02, DB-04, DB-08 | Core dashboard: welcome, module, navigasi |
| P1        | DB-05, DB-10, DB-11        | Quick actions: invite, role               |
| P2        | DB-07                      | Loading state                             |
| P3        | DB-03, DB-06, DB-09, DB-12 | Accounting module, audit log              |

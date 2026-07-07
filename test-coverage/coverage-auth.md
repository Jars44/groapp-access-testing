# Cakupan Testing — Auth

## Daftar Isi

- [Cakupan Testing — Auth](#cakupan-testing--auth)
  - [Daftar Isi](#daftar-isi)
  - [1. Pendahuluan](#1-pendahuluan)
  - [2. Struktur File Test](#2-struktur-file-test)
  - [3. Playwright E2E](#3-playwright-e2e)
    - [3.1 Login Manual](#31-login-manual)
    - [3.2 Login Google OAuth](#32-login-google-oauth)
    - [3.3 Login Apple OAuth](#33-login-apple-oauth)
    - [3.4 Register](#34-register)
    - [3.5 Verification (Email + OTP)](#35-verification-email--otp)
    - [3.6 Password Recovery](#36-password-recovery)
    - [3.7 Re-authentication](#37-re-authentication)
    - [3.8 Logout](#38-logout)
  - [4. Test Data](#4-test-data)
  - [5. Catatan Penting](#5-catatan-penting)
  - [6. Pola Umum \& Best Practices](#6-pola-umum--best-practices)
    - [Selector Auth-Specific](#selector-auth-specific)
    - [Form Pattern untuk Auth](#form-pattern-untuk-auth)
    - [Loading \& Error State Handling](#loading--error-state-handling)
    - [API Mocking untuk Auth Test](#api-mocking-untuk-auth-test)
    - [Otentikasi Fixture (auth.setup.ts)](#otentikasi-fixture-authsetupts)

## 1. Pendahuluan

Dokumen ini mencakup skenario Playwright E2E untuk fitur **Auth** GroApp Access — React 19 + TypeScript 6 SPA dengan Firebase 11 Authentication. Sistem auth mendukung: login manual (email/password), login Google OAuth, login Apple OAuth, registrasi multi-step, verifikasi email/OTP, pemulihan password (forgot + reset), re-autentikasi sesi kedaluwarsa, deteksi perubahan role (interruption overlay), dan logout.

Fitur auth menggunakan Firebase 11 sebagai penyedia identitas. Login manual dan Google OAuth adalah jalur utama. Apple OAuth untuk perangkat iOS. Registrasi membutuhkan verifikasi dua langkah (pilih metode → email/OTP). Re-auth dipicu oleh sesi kedaluwarsa (401 dari API) dan melewati interruption overlay global.

Perilaku sistem berdasarkan kode sumber di `src/features/auth/` dan `src/app/`:

| Aspek                     | Detail                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Login Manual              | Email/password via Firebase signInWithEmailAndPassword, redirect ke dashboard         |
| Google OAuth              | Popup Firebase Google provider, redirect ke dashboard atau halaman unregistered       |
| Apple OAuth               | Popup Firebase Apple provider untuk perangkat Apple                                   |
| Registrasi                | Form nama, email, phone (+62 prefix), password, confirmPassword, checkbox persyaratan |
| Verification REG          | Pilih metode (email/OTP), kirim kode, verifikasi, redirect ke onboarding              |
| Verification SECOND       | Re-verifikasi untuk aksi sensitif, menggunakan VerificationSecondGuard                |
| Forgot Password           | Pilih channel (email/WhatsApp), kirim kode, reset password, sukses                    |
| Re-auth                   | Trigger dari 401, overlay modal, masukkan kredensial lagi, session dipulihkan         |
| Role-changed Interruption | Trigger dari 409 API, overlay modal, refresh session                                  |
| Logout                    | Hapus session dari Zustand store + cookie, redirect ke /auth/login                    |
| Route Guards              | AuthGuard proteksi rute private, public route redirect jika sudah login               |

## 2. Struktur File Test

```text
tests/
├── pages/auth/
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── verification/
│   │   ├── choose-method.page.ts
│   │   ├── email-verification.page.ts
│   │   └── otp-verification.page.ts
│   ├── forgot-password/
│   │   ├── channel.page.ts
│   │   ├── email.page.ts
│   │   └── whatsapp.page.ts
│   ├── reset-password.page.ts
│   └── re-auth.page.ts
├── specs/auth/
│   ├── login-manual.spec.ts
│   ├── login-google.spec.ts
│   ├── register.spec.ts
│   ├── password-recovery.spec.ts
│   ├── verification.spec.ts
│   ├── re-auth.spec.ts
│   └── logout.spec.ts
├── data/
│   └── auth.data.ts
├── fixtures/
│   └── auth.fixture.ts
└── utils/
    ├── token-helper.ts
    └── api-helper.ts
```

## 3. Playwright E2E

### 3.1 Login Manual

**File:** `tests/specs/auth/login-manual.spec.ts`

**Configuration:**

```typescript
test.describe("Login Manual", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });
});
```

**Scenario Table:**

| #     | Nama Test                                                              | Assertion                                                                          |
| ----- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| LM-01 | menampilkan halaman login dengan semua field formulir                  | Input email, input password, tombol Masuk, link Lupa Password, link Daftar visible |
| LM-02 | menampilkan tombol submit nonaktif saat formulir kosong                | Tombol Masuk disabled                                                              |
| LM-03 | login dengan email dan password valid mengarahkan ke dashboard         | URL mengandung `/dashboard`                                                        |
| LM-04 | login dengan email tidak terdaftar menampilkan pesan error             | Toast "Akun tidak ditemukan"                                                       |
| LM-05 | login dengan password salah menampilkan pesan error                    | Toast "Email atau password salah"                                                  |
| LM-06 | login dengan email kosong menampilkan validasi                         | Error "Email wajib diisi" pada field email                                         |
| LM-07 | login dengan password kosong menampilkan validasi                      | Error "Password wajib diisi" pada field password                                   |
| LM-08 | menampilkan opsi "Remember Me" pada halaman login                      | Checkbox "Ingat saya" atau label serupa visible                                    |
| LM-09 | mengaktifkan "Remember Me" menyimpan sesi                              | Token refresh berhasil setelah browser restart                                     |
| LM-10 | menampilkan tautan "Lupa Password" mengarah ke halaman yang benar      | Link menuju `/auth/forgot-password`                                                |
| LM-11 | menampilkan tautan "Daftar" untuk pengguna baru                        | Link menuju `/auth/register`                                                       |
| LM-12 | tombol login menunjukkan loading state saat mengirim                   | Button disabled + spinner visible selama request                                   |
| LM-13 | login dengan email mengandung spasi di awal/akhir di-trim dengan benar | Whitespace dihapus, login sukses                                                   |
| LM-14 | input password bertipe password secara default                         | Attribute `type="password"` pada input password                                    |
| LM-15 | toggle visibilitas password berfungsi                                  | Klik toggle → `type="text"`, klik lagi → `type="password"`                         |
| LM-16 | menampilkan tombol alih visibilitas password                           | Ikon toggle (mata) visible pada field password                                     |
| LM-17 | halaman login tidak bisa diakses saat sudah login                      | Redirect otomatis ke `/dashboard`                                                  |
| LM-18 | login rate limit — 3x salah password mengunci akun sementara           | Pesan lock "Akun terkunci" + button submit disabled                                |
| LM-19 | menekan Enter pada field password memicu submit                        | Form submit ketika Enter ditekan di field password                                 |
| LM-20 | menampilkan branding/logo perusahaan di halaman login                  | Logo atau ilustrasi login page visible                                             |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("textbox", { name: "Email" });
page.getByLabel("Password");
page.getByRole("button", { name: /masuk/i });
page.getByRole("checkbox", { name: /ingat/i });
page.getByRole("button", { name: /lupa password/i });
page.getByRole("button", { name: /daftar/i });
page.locator('[data-testid="password-visibility-toggle"]');
page.locator('[data-testid="password-input"]');

// Assertions
await expect(page).toHaveURL(/\/dashboard/);
await expect(toast).toContainText("Akun tidak ditemukan");
await expect(loginButton).toBeDisabled();
await expect(passwordInput).toHaveAttribute("type", "password");
await expect(page.getByRole("button", { name: /masuk/i })).toBeEnabled();
await expect(toast).toContainText("Email atau password salah");
```

### 3.2 Login Google OAuth

**File:** `tests/specs/auth/login-google.spec.ts`

**Configuration:**

```typescript
test.describe("Login Google OAuth", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });
});
```

**Scenario Table:**

| #    | Nama Test                                                                 | Assertion                                                      |
| ---- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| G-01 | menampilkan tombol "Masuk dengan Google" di halaman login                 | Tombol Google dengan teks "Masuk dengan Google" visible        |
| G-02 | login dengan akun Google yang terdaftar mengarahkan ke dashboard          | URL mengandung `/dashboard` setelah popup Google sukses        |
| G-03 | login dengan akun Google tidak terdaftar menampilkan halaman unregistered | Redirect ke `/auth/unregistered-account-google`                |
| G-04 | pengguna menutup popup Google menampilkan pesan error                     | Toast atau pesan "Login dibatalkan" visible                    |
| G-05 | login dengan akun Google tanpa email menampilkan error                    | Error message "Email tidak tersedia" atau serupa               |
| G-06 | tombol Google menunjukkan loading state saat popup terbuka                | Button disabled + spinner visible                              |
| G-07 | login Google gagal karena Firebase error menampilkan pesan                | Toast error dari Firebase (misal "Gagal terhubung ke Google")  |
| G-08 | halaman unregistered Google menampilkan opsi daftar dengan email          | Form registrasi terisi email dari Google, field email disabled |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("button", { name: /google/i });
page.getByRole("button", { name: /masuk dengan google/i });
page.getByRole("heading", { name: /akun google/i });

// Assertions
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveURL(/\/auth\/unregistered-account-google/);
await expect(toast).toContainText("Login dibatalkan");
```

### 3.3 Login Apple OAuth

**File:** `tests/specs/auth/login-apple.spec.ts` (optional — hanya untuk perangkat Apple)

**Configuration:**

```typescript
test.describe("Login Apple OAuth", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });
});
```

**Scenario Table:**

| #    | Nama Test                                                  | Assertion                                              |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------ |
| A-01 | menampilkan tombol "Masuk dengan Apple" di halaman login   | Tombol Apple visible (hanya di perangkat Apple)        |
| A-02 | login dengan akun Apple terdaftar mengarahkan ke dashboard | URL mengandung `/dashboard` setelah popup Apple sukses |
| A-03 | pengguna menutup popup Apple menampilkan pesan error       | Toast "Login dibatalkan" visible                       |
| A-04 | tombol Apple tidak muncul di perangkat non-Apple           | Tombol Apple hidden atau tidak ada di DOM              |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("button", { name: /apple/i });
page.getByRole("button", { name: /masuk dengan apple/i });

// Assertions
await expect(page).toHaveURL(/\/dashboard/);
await expect(toast).toContainText("Login dibatalkan");
await expect(appleButton).not.toBeVisible();
```

### 3.4 Register

**File:** `tests/specs/auth/register.spec.ts`

**Configuration:**

```typescript
test.describe("Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });
});
```

**Scenario Table:**

| #     | Nama Test                                                           | Assertion                                                                                        |
| ----- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| RG-01 | menampilkan halaman registrasi dengan semua field formulir          | Field nama, email, phone, country code, password, confirmPassword, checkbox persyaratan visible  |
| RG-02 | tombol submit nonaktif saat formulir kosong                         | Tombol Daftar disabled                                                                           |
| RG-03 | tombol submit aktif saat semua field valid dan checkbox centang     | Tombol Daftar enabled                                                                            |
| RG-04 | input password bertipe password secara default                      | Attribute `type="password"` pada field password                                                  |
| RG-05 | toggle visibilitas field password berfungsi                         | Klik toggle → `type="text"`, klik lagi → `type="password"`                                       |
| RG-06 | toggle visibilitas field konfirmasi password berfungsi              | Sama untuk field confirmPassword                                                                 |
| RG-07 | menampilkan 2 tombol alih visibilitas password                      | 2 ikon toggle (mata) visible — satu untuk password, satu untuk confirmPassword                   |
| RG-08 | menampilkan checkbox persyaratan dengan tautan privacy policy       | Checkbox dengan label persyaratan + link "Kebijakan Privasi" + link "Syarat & Ketentuan" visible |
| RG-09 | menampilkan pemilih kode negara dengan nilai default +62            | Country code selector = "+62" (Indonesia)                                                        |
| RG-10 | menampilkan indikator keamanan password saat pengguna mengetik      | Password strength indicator muncul ketika input password diisi                                   |
| RG-11 | indikator keamanan hilang saat password dikosongkan                 | Password strength indicator hilang ketika field password kosong                                  |
| RG-12 | registrasi dengan data valid mengarahkan ke halaman verifikasi      | URL mengandung `/auth/register/verification-choose-method`                                       |
| RG-13 | registrasi dengan email duplikat menampilkan pesan error            | Toast "Email sudah terdaftar"                                                                    |
| RG-14 | registrasi dengan password lemah menampilkan indikator < "Kuat"     | Password strength indicator menampilkan "Lemah" atau "Sedang"                                    |
| RG-15 | registrasi dengan konfirmasi password tidak cocok menampilkan error | Error "Konfirmasi password tidak cocok"                                                          |
| RG-16 | registrasi dengan nomor telepon tidak valid menampilkan error       | Error "Nomor telepon tidak valid"                                                                |
| RG-17 | registrasi dengan form kosong menampilkan semua error validasi      | Semua field menampilkan error "wajib diisi"                                                      |
| RG-18 | tombol submit disabled dan spinner muncul saat loading              | Button disabled + spinner visible selama request                                                 |
| RG-19 | mencegah double submit saat loading                                 | Fungsi execute/daftar dipanggil sekali, tidak dua kali                                           |
| RG-20 | field email disabled saat ada konteks undangan                      | Field email disabled + sudah terisi dengan email dari undangan                                   |
| RG-21 | modal undangan muncul saat ada konteks undangan                     | Modal menampilkan info perusahaan pengundang                                                     |
| RG-22 | link menuju halaman login tersedia                                  | Teks "Sudah punya akun?" dengan link ke `/auth/login` visible                                    |
| RG-23 | field nama tidak boleh kosong — validasi client-side                | Error "Nama wajib diisi" ketika field nama dikosongkan                                           |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("textbox", { name: /nama/i });
page.getByRole("textbox", { name: /email/i });
page.getByRole("textbox", { name: /telepon|phone|nomor/i });
page.getByLabel("Password");
page.getByLabel("Konfirmasi Password");
page.getByRole("checkbox", { name: /syarat|ketentuan/i });
page.getByRole("button", { name: /daftar/i });
page.locator('[data-testid="password-strength-indicator"]');
page.locator('[data-testid="country-code-selector"]');

// Assertions
await expect(page).toHaveURL(/\/auth\/register\/verification-choose-method/);
await expect(toast).toContainText("Email sudah terdaftar");
await expect(passwordInput).toHaveAttribute("type", "password");
await expect(registerButton).toBeDisabled();
await expect(strengthIndicator).toContainText(/lemah|sedang/i);
await expect(confirmPasswordError).toContainText("tidak cocok");
```

### 3.5 Verification (Email + OTP)

**File:** `tests/specs/auth/verification.spec.ts`

**Configuration:**

```typescript
test.describe("Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: registrasi berhasil, redirect ke halaman pilih metode
    await page.goto("/auth/register/verification-choose-method");
  });
});
```

**Scenario Table:**

| #    | Nama Test                                                                 | Assertion                                                              |
| ---- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| V-01 | menampilkan halaman pilih metode verifikasi                               | Dua opsi: "Email" dan "OTP", masing-masing dengan ikon + deskripsi     |
| V-02 | memilih verifikasi email mengarahkan ke halaman kirim email               | URL mengandung `/auth/register/verification-email`                     |
| V-03 | memilih verifikasi OTP mengarahkan ke halaman kirim OTP WhatsApp          | URL mengandung `/auth/register/verification-otp`                       |
| V-04 | halaman verifikasi email menampilkan email tujuan                         | Email tujuan ditampilkan (sebagian di-mask)                            |
| V-05 | halaman verifikasi email menampilkan tombol "Kirim Ulang" dengan cooldown | Tombol kirim ulang disabled, countdown timer visible                   |
| V-06 | tombol "Kirim Ulang" aktif setelah cooldown selesai                       | Tombol kirim ulang enabled setelah timer selesai                       |
| V-07 | memasukkan kode verifikasi email yang benar mengarahkan ke onboarding     | URL mengandung `/onboarding` atau halaman sukses verifikasi            |
| V-08 | memasukkan kode verifikasi email salah menampilkan error                  | Toast atau error "Kode verifikasi tidak valid"                         |
| V-09 | kode verifikasi email kedaluwarsa menampilkan error                       | Toast "Kode verifikasi sudah kedaluwarsa. Kirim ulang."                |
| V-10 | verifikasi melalui deeplink email (klik link di email)                    | URL dari email di-intercept, verifikasi sukses, redirect ke onboarding |
| V-11 | halaman OTP WhatsApp menampilkan nomor telepon tujuan                     | Nomor telepon tujuan ditampilkan (sebagian di-mask)                    |
| V-12 | memasukkan kode OTP WhatsApp yang benar mengarahkan ke onboarding         | URL mengandung `/onboarding`                                           |
| V-13 | memasukkan kode OTP WhatsApp salah menampilkan error                      | Toast "Kode OTP tidak valid"                                           |
| V-14 | tombol "Kirim Ulang OTP" dengan cooldown timer                            | Kirim ulang disabled + countdown, enabled setelah selesai              |
| V-15 | mengubah metode verifikasi (dari email ke OTP)                            | Navigasi kembali ke halaman pilih metode                               |
| V-16 | mengubah kontak (email/nomor) sebelum verifikasi                          | Form edit kontak muncul, perubahan tersimpan                           |
| V-17 | second verification — di-trigger dari aksi sensitif                       | URL mengandung `/auth/second-verification/...`                         |
| V-18 | second verification — memasukkan kode benar melanjutkan aksi              | Kode valid, aksi asli dilanjutkan (misal ubah email)                   |
| V-19 | second verification — memasukkan kode salah menampilkan error             | Toast "Kode verifikasi tidak valid"                                    |
| V-20 | halaman verifikasi menampilkan loading state saat mengirim kode           | Spinner muncul saat request kirim kode                                 |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("button", { name: /email/i });
page.getByRole("button", { name: /otp|whatsapp/i });
page.getByRole("button", { name: /kirim ulang/i });
page.locator('[data-testid="otp-input"] input');
page.getByText(/verifikasi.*dikirim.*ke/i);
page.locator('[data-testid="countdown-timer"]');
page.locator('[data-testid="masked-contact"]');

// Assertions
await expect(page).toHaveURL(/\/auth\/register\/verification-email/);
await expect(page).toHaveURL(/\/onboarding/);
await expect(toast).toContainText("Kode verifikasi tidak valid");
await expect(resendButton).toBeDisabled();
await expect(resendButton).toBeEnabled();
```

### 3.6 Password Recovery

**File:** `tests/specs/auth/password-recovery.spec.ts`

**Configuration:**

```typescript
test.describe("Password Recovery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/forgot-password");
  });
});
```

**Scenario Table:**

| #    | Nama Test                                                              | Assertion                                                              |
| ---- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| P-01 | menampilkan halaman forgot password dengan pilihan channel             | Dua opsi: "Email" dan "WhatsApp" dengan ikon dan deskripsi             |
| P-02 | memilih channel email mengarahkan ke form input email                  | URL mengandung `/auth/forgot-password/email`                           |
| P-03 | memilih channel WhatsApp mengarahkan ke form input nomor               | URL mengandung `/auth/forgot-password/whatsapp`                        |
| P-04 | memasukkan email terdaftar dan submit mengirim kode verifikasi         | Toast "Kode verifikasi telah dikirim ke email"                         |
| P-05 | memasukkan email tidak terdaftar menampilkan error                     | Toast "Email tidak ditemukan"                                          |
| P-06 | memasukkan nomor WhatsApp terdaftar dan submit mengirim OTP            | Toast "Kode OTP telah dikirim ke WhatsApp"                             |
| P-07 | memasukkan kode verifikasi email/OTP yang benar menuju reset password  | URL mengandung `/auth/reset-password`                                  |
| P-08 | memasukkan kode verifikasi email/OTP salah menampilkan error           | Toast "Kode verifikasi tidak valid"                                    |
| P-09 | tombol kirim ulang kode dengan cooldown timer                          | Kirim ulang disabled + countdown, enabled setelah selesai              |
| P-10 | kode verifikasi kedaluwarsa menampilkan error                          | Toast "Kode sudah kedaluwarsa. Silakan kirim ulang."                   |
| P-11 | halaman reset password menampilkan form password baru                  | Field password baru + konfirmasi password baru + tombol Simpan visible |
| P-12 | reset password dengan password valid dan cocok mengarahkan ke sukses   | URL mengandung halaman sukses + toast "Password berhasil diubah"       |
| P-13 | reset password dengan password lemah menampilkan error                 | Indicator keamanan < "Kuat" atau error "Password terlalu lemah"        |
| P-14 | reset password dengan konfirmasi tidak cocok menampilkan error         | Error "Konfirmasi password tidak cocok"                                |
| P-15 | halaman sukses reset password menampilkan tombol login                 | Tombol "Masuk Sekarang" visible, klik ke `/auth/login`                 |
| P-16 | token reset password tidak valid/kedaluwarsa menampilkan halaman error | Halaman error "Tautan tidak valid atau sudah kedaluwarsa"              |
| P-17 | toggle visibilitas password baru berfungsi                             | Klik toggle → `type="text"`, klik lagi → `type="password"`             |
| P-18 | menampilkan tautan kembali ke login di semua halaman                   | Link "Kembali ke Masuk" visible di setiap langkah                      |

**Code Patterns:**

```typescript
// Selectors
page.getByRole("button", { name: /email/i });
page.getByRole("button", { name: /whatsapp|wa/i });
page.getByRole("textbox", { name: /email/i });
page.getByRole("textbox", { name: /nomor|telepon/i });
page.getByRole("button", { name: /kirim/i });
page.getByRole("button", { name: /simpan|ubah/i });
page.getByRole("button", { name: /masuk sekarang/i });
page.locator('[data-testid="otp-input"] input');
page.locator('[data-testid="countdown-timer"]');

// Assertions
await expect(page).toHaveURL(/\/auth\/forgot-password\/email/);
await expect(page).toHaveURL(/\/auth\/reset-password/);
await expect(toast).toContainText("Kode verifikasi telah dikirim");
await expect(toast).toContainText("Email tidak ditemukan");
await expect(toast).toContainText("Password berhasil diubah");
```

### 3.7 Re-authentication

**File:** `tests/specs/auth/re-auth.spec.ts`

**Configuration:**

```typescript
test.describe("Re-authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login sebagai user valid
    await page.goto("/dashboard");
  });
});
```

**Scenario Table:**

| #     | Nama Test                                                                    | Assertion                                                           |
| ----- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| RA-01 | re-auth overlay muncul saat API mengembalikan 401                            | Modal re-auth visible, tidak bisa interaksi dengan halaman di bawah |
| RA-02 | re-auth manual dengan email/password benar memulihkan session                | Session dipulihkan, overlay hilang, aksi asli dilanjutkan           |
| RA-03 | re-auth dengan kredensial salah menampilkan error                            | Toast "Email atau password salah"                                   |
| RA-04 | re-auth dengan Google OAuth berhasil memulihkan session                      | Popup Google, session pulih, overlay hilang                         |
| RA-05 | re-auth dengan metode berbeda dari login awal menampilkan metode yang sesuai | Jika login awal Google, re-auth pakai Google juga                   |
| RA-06 | menekan tombol close pada re-auth overlay mengarahkan ke logout              | Redirect ke `/auth/login`, session dihapus                          |
| RA-07 | re-auth overlay menampilkan email pengguna                                   | Email user ditampilkan di modal re-auth                             |
| RA-08 | role-changed interruption muncul saat API 409                                | Modal "Role Berubah" visible dengan informasi role baru             |
| RA-09 | konfirmasi role-changed memuat ulang session                                 | Setelah konfirmasi, session diperbarui, overlay hilang              |
| RA-10 | role-changed interruption — menolak perubahan mengarahkan ke logout          | Redirect ke login, session dihapus                                  |

**Code Patterns:**

```typescript
// Selectors
page.locator('[data-testid="re-auth-modal"]');
page.locator('[data-testid="role-changed-modal"]');
page.getByRole("textbox", { name: /email/i });
page.getByLabel("Password");
page.getByRole("button", { name: /masuk|verifikasi/i });
page.getByRole("button", { name: /google/i });
page.getByRole("button", { name: /tutup|batal/i });
page.getByRole("button", { name: /konfirmasi|ya/i });

// Assertions
await expect(reAuthModal).toBeVisible();
await expect(reAuthModal).toContainText(email);
await expect(page).toHaveURL(/\/auth\/login/);
await expect(toast).toContainText("Email atau password salah");
```

### 3.8 Logout

**File:** `tests/specs/auth/logout.spec.ts`

**Configuration:**

```typescript
test.describe("Logout", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login sebagai user valid
    await page.goto("/dashboard");
  });
});
```

**Scenario Table:**

| #    | Nama Test                                                              | Assertion                                                               |
| ---- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| O-01 | logout dari menu navbar dropdown                                       | Klik profile icon di navbar → klik "Keluar" → redirect ke `/auth/login` |
| O-02 | logout dari menu sidebar mobile                                        | Buka sidebar mobile → klik "Keluar" → redirect ke `/auth/login`         |
| O-03 | session dibersihkan setelah logout — halaman private redirect ke login | Akses `/dashboard` setelah logout → redirect ke `/auth/login`           |
| O-04 | konfirmasi dialog logout muncul sebelum logout                         | Dialog modal "Yakin ingin keluar?" dengan tombol Ya/Tidak               |
| O-05 | membatalkan logout melalui dialog tetap di halaman                     | Klik "Tidak" → dialog tertutup, tetap di dashboard                      |
| O-06 | cookie session dihapus setelah logout                                  | Cookie auth tidak ada setelah logout                                    |
| O-07 | toast sukses muncul setelah logout                                     | Toast "Berhasil keluar" atau serupa visible                             |
| O-08 | tombol logout di navbar tidak visible untuk pengguna belum login       | Tidak ada tombol logout di halaman login                                |

**Code Patterns:**

```typescript
// Selectors
page.locator('[data-testid="profile-dropdown-trigger"]');
page.getByRole("button", { name: /keluar|logout/i });
page.locator('[data-testid="sidebar-mobile-menu"]');
page.locator('[data-testid="logout-dialog"]');
page.getByRole("button", { name: /ya|keluar/i });
page.getByRole("button", { name: /tidak|batal/i });

// Assertions
await expect(page).toHaveURL(/\/auth\/login/);
await expect(logoutDialog).toBeVisible();
await expect(toast).toContainText("Berhasil keluar");
```

## 4. Test Data

```typescript
// data/auth.data.ts
import { test as base } from "@playwright/test";

export const VALID_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

export const INVALID_CREDENTIALS = {
  wrongPassword: "WrongPass1!",
  unregisteredEmail: `unregistered.${Date.now()}@test.com`,
  invalidEmail: "bukan-email",
  weakPassword: "123",
  mismatchedConfirmPassword: "DifferentPass1!",
};

export const TEST_TIMEOUTS = {
  cooldownResend: 60000, // 60 detik cooldown kirim ulang
  otpExpiration: 300000, // 5 menit kedaluwarsa OTP
  rateLimitLock: 900000, // 15 menit lock rate limit
};

export function generateRegisterPayload(
  overrides?: Partial<{
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }>,
): {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
} {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `test.${timestamp}@groapp.id`,
    countryCode: "+62",
    phone: `8${String(timestamp).slice(0, 10)}`,
    password: "StrongP@ss1",
    confirmPassword: "StrongP@ss1",
    agreeToTerms: true,
    ...overrides,
  };
}

export function generateResetPasswordPayload(
  overrides?: Partial<{
    password: string;
    confirmPassword: string;
  }>,
): {
  password: string;
  confirmPassword: string;
} {
  const newPassword = "NewStrongP@ss1";
  return {
    password: newPassword,
    confirmPassword: newPassword,
    ...overrides,
  };
}
```

## 5. Catatan Penting

- **Google/Apple OAuth** membutuhkan Firebase test account yang dikonfigurasi di Firebase Console. Popup OAuth tidak bisa di-headless penuh — perlu `chromium.launch({ headless: false })` atau mocking Firebase auth.
- **Email verification deeplink** membutuhkan token dari email yang sesungguhnya. Bisa di-intercept via API call langsung untuk mendapatkan token verifikasi tanpa akses email.
- **OTP verification** bisa di-skip dengan API call langsung untuk setup test (memanggil endpoint verifikasi dengan kode yang diketahui).
- **Re-auth flow** dipicu oleh 401 dari API. Gunakan `page.route('**/api/**', route => route.fulfill({ status: 401 }))` untuk simulasi sesi kedaluwarsa.
- **Role-changed interruption** dipicu oleh 409 dari API. Gunakan `page.route` untuk simulasi response 409 dengan header `X-Role-Change: true`.
- **Rate limiting** (3x salah password → lock 15 menit) perlu reset antar test. Gunakan `api-helper.ts` untuk mereset rate limit akun test via API.
- **Cooldown timer** pada tombol kirim ulang kode (biasanya 30-60 detik). Test harus menunggu atau menggunakan `page.clock.fastForward()` untuk mempercepat.
- **Invitation context** saat registrasi — field email disabled dan modal undangan muncul. Simulasi dengan URL parameter undangan di `/auth/register?invitationToken=xxx`.
- **Second verification** butuh sesi aktif. Setup via `auth.setup.ts` dengan storageState.
- **State cleanup** antar test: gunakan `clear-all-session.ts` untuk membersihkan Zustand store + cookies.

## 6. Pola Umum & Best Practices

### Selector Auth-Specific

```typescript
// Prioritas: data-testid > getByRole > getByLabel > getByText
page.locator('[data-testid="password-input"]');
page.locator('[data-testid="password-visibility-toggle"]');
page.locator('[data-testid="otp-input"]');
page.locator('[data-testid="password-strength-indicator"]');
page.locator('[data-testid="country-code-selector"]');
page.locator('[data-testid="countdown-timer"]');
page.locator('[data-testid="re-auth-modal"]');
page.locator('[data-testid="role-changed-modal"]');
page.locator('[data-testid="logout-dialog"]');
page.locator('[data-testid="profile-dropdown-trigger"]');
page.locator('[data-testid="masked-contact"]');
```

### Form Pattern untuk Auth

```typescript
// Pattern: fill form → verify button state → submit → assert result
// Setiap test auth mengikuti Arrange-Act-Assert:
// 1. Navigate ke halaman
// 2. Interaksi dengan form (isi field, klik tombol, toggle checkbox)
// 3. Assert hasil (URL berubah, toast muncul, element visible/hidden)

// Handle form dengan getByRole vs getByLabel:
// - getByRole('textbox') untuk input teks biasa
// - getByLabel('Password') untuk input password (label eksplisit)
// - getByRole('checkbox') untuk checkbox
// - getByRole('button') untuk tombol
```

### Loading & Error State Handling

```typescript
// Loading state: button disabled + spinner
await expect(button).toBeDisabled();

// Error state: field-level error
await expect(fieldError).toBeVisible();
await expect(fieldError).toHaveText(/wajib diisi/i);

// Toast error
await expect(toast).toContainText(/tidak valid|salah|gagal|tidak ditemukan/i);

// Sukses: URL berubah
await expect(page).toHaveURL(/\/dashboard|\/onboarding/);
```

### API Mocking untuk Auth Test

```typescript
// Simulasi 401 → trigger re-auth
await page.route("**/api/access/**", async (route) => {
  await route.fulfill({ status: 401 });
});

// Simulasi 409 → role-changed interruption
await page.route("**/api/access/**", async (route) => {
  await route.fulfill({
    status: 409,
    headers: { "X-Role-Change": "true" },
  });
});

// Mock kirim ulang OTP — return sukses cepat
await page.route("**/auth/resend-otp", async (route) => {
  await route.fulfill({ status: 200, json: { success: true } });
});
```

### Otentikasi Fixture (auth.setup.ts)

```typescript
// auth.setup.ts — login sekali per worker, simpan storageState
import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/auth/login.page";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(process.env.TEST_USER_EMAIL!);
  await loginPage.fillPassword(process.env.TEST_USER_PASSWORD!);
  await loginPage.clickLogin();
  await page.waitForURL(/\/dashboard/);
  await page.context().storageState({ path: authFile });
});
```

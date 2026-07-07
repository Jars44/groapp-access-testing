# Coverage Profile — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Profile pada GroApp Access.**
> Meliputi: lihat/edit profil, unggah/hapus foto, ubah email (dengan verifikasi), ubah WhatsApp (dengan OTP), ubah password, dan hapus akun.

---

## 1. Pendahuluan

Fitur Profile memungkinkan pengguna terautentikasi mengelola data diri mereka. Profile diakses melalui route `/profile/*` yang dilindungi oleh `AuthGuard` dan dirender dalam `AppMainAccessLayout`. Fitur ini mencakup beberapa sub-halaman dan modal yang memungkinkan pengguna melihat informasi akun, mengedit nama, mengelola foto profil, mengubah email (dengan verifikasi), mengubah nomor WhatsApp (dengan OTP), mengubah password, dan menghapus akun secara permanen.

Sumber kode: `src/features/profile/`

**Arsitektur Profile:**

| Layer          | Path                   | Fungsi                                       |
| -------------- | ---------------------- | -------------------------------------------- |
| Presentation   | `presentation/pages/`  | Profile, Edit, Email, WhatsApp, Success      |
| Presentation   | `presentation/modals/` | 9 modal (email, personal, whatsapp, dll)     |
| Presentation   | `presentation/forms/`  | 8 form schemas (Zod)                         |
| Presentation   | `presentation/state/`  | 11 state folders (context + store)           |
| Infrastructure | `infrastructure/`      | API client, DTO, mapper, repository          |
| Domain         | `domain/`              | Types, failures, validation rules, constants |
| Application    | `application/`         | 11 use cases (port interfaces)               |

**Routes:**

| Path                                    | Layout              | Deskripsi                |
| --------------------------------------- | ------------------- | ------------------------ |
| `/profile`                              | AppMainAccessLayout | Halaman utama profil     |
| `/profile/edit`                         | AppMainAccessLayout | Edit profil              |
| `/profile/email-change`                 | AppMainAccessLayout | Ubah email               |
| `/profile/whatsapp-change`              | AppMainAccessLayout | Ubah WhatsApp            |
| `/profile/change-password`              | AppMainAccessLayout | Ubah password            |
| `/profile/delete-account`               | AppMainAccessLayout | Hapus akun               |
| `/profile/email-change/verification`    | None                | Verifikasi email baru    |
| `/profile/whatsapp-change/verification` | None                | Verifikasi WhatsApp baru |

---

## 2. Struktur File Test

```text
tests/
├── pages/profile/
│   ├── profile.page.ts                      # Halaman utama profil
│   ├── edit-profile.page.ts                 # Form edit profil
│   ├── change-password.page.ts              # Form ubah password
│   ├── email-change.page.ts                 # Form ubah email + verifikasi
│   ├── whatsapp-change.page.ts              # Form ubah WhatsApp + OTP
│   └── delete-account.page.ts               # Konfirmasi hapus akun
├── specs/profile/
│   ├── profile-edit.spec.ts                 # Test lihat & edit profil
│   ├── change-password.spec.ts              # Test ubah password
│   ├── email-change.spec.ts                 # Test ubah email
│   ├── whatsapp-change.spec.ts              # Test ubah WhatsApp
│   └── delete-account.spec.ts               # Test hapus akun
├── data/
│   └── profile.data.ts                      # Factory test data
└── fixtures/
    └── auth.fixture.ts                      # Fixture autentikasi
```

---

## 3. Playwright E2E

### 3.1 Profile View

Halaman utama profil menampilkan data pengguna (nama, email, telepon, foto) dan metadata akun (tanggal dibuat, terakhir diperbarui). Loading state menggunakan skeleton.

| #     | Nama Test                                               | Assertion                                          |
| ----- | ------------------------------------------------------- | -------------------------------------------------- |
| PF-01 | menampilkan halaman profil dengan data lengkap          | Nama, email, telepon, dan foto profil visible      |
| PF-02 | menampilkan informasi akun (didirikan, terakhir update) | Metadata "Didirikan" dan "Terakhir update" visible |
| PF-03 | menampilkan skeleton saat loading state                 | Skeleton/loader terlihat sebelum data muncul       |
| PF-04 | menampilkan foto profil default jika tidak ada foto     | Initials atau placeholder photo visible            |

**POM:** `profile.page.ts`

**Selectors:**

- `profileName = page.getByTestId('profile-name')`
- `profileEmail = page.getByTestId('profile-email')`
- `profilePhone = page.getByTestId('profile-phone')`
- `profilePhoto = page.getByTestId('profile-photo')`
- `profileCreatedAt = page.getByTestId('profile-created-at')`
- `profileUpdatedAt = page.getByTestId('profile-updated-at')`
- `profileSkeleton = page.getByTestId('profile-skeleton')`

**Assertions:**

- `expect(profileName).toBeVisible()`
- `expect(profileEmail).toBeVisible()`
- `expect(profilePhone).toBeVisible()`
- `expect(profilePhoto).toBeVisible()`
- `expect(profileCreatedAt).toHaveText(/\d{1,2}\s+\w+\s+\d{4}/)`
- `expect(profileSkeleton).toBeVisible()` (before data loads)

### 3.2 Profile Edit

Edit nama profil dengan validasi (nama wajib diisi, min/max length). Unggah foto profil (valid image, replace). Hapus foto profil. Cancel edit.

| #     | Nama Test                                                  | Assertion                                   |
| ----- | ---------------------------------------------------------- | ------------------------------------------- |
| PF-05 | mengedit nama profil dengan data valid                     | Toast "Berhasil", nama baru tampil          |
| PF-06 | menampilkan error saat nama profil dikosongkan             | Validasi "Nama wajib diisi"                 |
| PF-07 | menampilkan error saat nama profil melebihi batas karakter | Validasi "Maksimal 60 karakter"             |
| PF-08 | membatalkan edit dan kembali ke halaman profil             | Data tidak berubah, kembali ke `/profile`   |
| PF-09 | mengunggah foto profil dengan file gambar valid            | Foto diperbarui, preview terlihat           |
| PF-10 | mengganti foto profil yang sudah ada                       | Foto lama terganti dengan foto baru         |
| PF-11 | menghapus foto profil                                      | Foto hilang, inisial tampil                 |
| PF-12 | mengunggah file non-gambar sebagai foto profil             | Error "Tipe file tidak didukung"            |
| PF-13 | mengunggah file melebihi ukuran maksimal                   | Error "Ukuran file maksimal 2MB"            |
| PF-14 | menampilkan loading state saat menyimpan edit              | Tombol simpan menunjukkan spinner, disabled |

**POM:** `edit-profile.page.ts`

**Selectors:**

- `nameInput = page.getByRole('textbox', { name: /nama/i })`
- `saveButton = page.getByRole('button', { name: /simpan/i })`
- `cancelButton = page.getByRole('button', { name: /batal/i })`
- `nameError = page.getByTestId('field-error-name')`
- `photoUploader = page.getByTestId('photo-uploader')`
- `photoRemoveButton = page.getByTestId('photo-remove')`
- `photoPreview = page.getByTestId('photo-preview')`

**Assertions:**

- `expect(nameError).toHaveText(/wajib diisi/i)`
- `expect(nameError).toHaveText(/(maksimal|karakter)/i)`
- `expect(saveButton).toBeDisabled()`
- `expect(page).toHaveURL(/\/profile$/)`

### 3.3 Change Password

Form ubah password dengan validasi: password saat ini wajib diisi, password baru minimal 8 karakter dengan kombinasi huruf dan angka, konfirmasi password harus cocok.

| #     | Nama Test                                                          | Assertion                                   |
| ----- | ------------------------------------------------------------------ | ------------------------------------------- |
| PF-15 | mengubah password dengan data valid                                | Toast "Password berhasil diubah"            |
| PF-16 | menampilkan error saat password saat ini salah                     | Error "Password saat ini salah"             |
| PF-17 | menampilkan error saat password baru terlalu lemah                 | Validasi "Password terlalu lemah"           |
| PF-18 | menampilkan error saat konfirmasi password tidak cocok             | Validasi "Konfirmasi password tidak cocok"  |
| PF-19 | menampilkan error saat password baru sama dengan password saat ini | Error "Gunakan password yang berbeda"       |
| PF-20 | menampilkan loading state saat menyimpan password baru             | Tombol simpan menunjukkan spinner, disabled |
| PF-21 | menampilkan toggle visibilitas password                            | Password bisa dilihat/di sembunyikan        |

**POM:** `change-password.page.ts`

**Selectors:**

- `currentPasswordInput = page.getByLabel(/password saat ini/i)`
- `newPasswordInput = page.getByLabel(/password baru/i)`
- `confirmPasswordInput = page.getByLabel(/konfirmasi password/i)`
- `submitButton = page.getByRole('button', { name: /simpan|ubah/i })`
- `currentPasswordError = page.getByTestId('field-error-currentPassword')`
- `newPasswordError = page.getByTestId('field-error-newPassword')`
- `confirmPasswordError = page.getByTestId('field-error-confirmPassword')`
- `passwordStrengthIndicator = page.getByTestId('password-strength')`
- `togglePasswordButtons = page.locator('button[aria-label*="Password"]')`

**Assertions:**

- `expect(currentPasswordError).toHaveText(/salah/i)` (wrong current)
- `expect(newPasswordError).toHaveText(/lemah/i)` (weak password)
- `expect(confirmPasswordError).toHaveText(/cocok/i)` (mismatch)
- `expect(submitButton).toBeDisabled()` (loading)
- `expect(toast).toHaveText(/berhasil diubah/i)` (success)

### 3.4 Email Change

Flow ubah email: menampilkan email saat ini, input email baru, kirim verifikasi, verifikasi OTP, cooldown kirim ulang.

| #     | Nama Test                                                    | Assertion                                         |
| ----- | ------------------------------------------------------------ | ------------------------------------------------- |
| PF-22 | menampilkan email saat ini di halaman ubah email             | Email saat ini terlihat dan disabled              |
| PF-23 | mengirim verifikasi ke email baru valid                      | Toast "Kode verifikasi terkirim"                  |
| PF-24 | menampilkan error saat email baru tidak valid                | Validasi "Email tidak valid"                      |
| PF-25 | menampilkan error saat email baru sama dengan email saat ini | Error "Email sama dengan email saat ini"          |
| PF-26 | memasukkan kode OTP valid untuk verifikasi email             | Toast "Email berhasil diubah", redirect ke profil |
| PF-27 | memasukkan kode OTP tidak valid                              | Error "Kode OTP tidak valid"                      |
| PF-28 | menampilkan cooldown tombol kirim ulang                      | Tombol kirim ulang disabled selama cooldown       |
| PF-29 | mengirim ulang kode verifikasi setelah cooldown              | Toast "Kode terkirim ulang", timer reset          |
| PF-30 | menampilkan loading state saat mengirim verifikasi           | Tombol kirim menunjukkan spinner, disabled        |

**POM:** `email-change.page.ts`

**Selectors:**

- `currentEmail = page.getByTestId('current-email')`
- `newEmailInput = page.getByRole('textbox', { name: /email baru/i })`
- `sendVerificationButton = page.getByRole('button', { name: /kirim verifikasi/i })`
- `otpInputs = page.locator('input[data-testid="otp-input"]')`
- `verifyButton = page.getByRole('button', { name: /verifikasi/i })`
- `resendButton = page.getByRole('button', { name: /kirim ulang/i })`
- `countdownTimer = page.getByTestId('countdown-timer')`
- `newEmailError = page.getByTestId('field-error-newEmail')`
- `otpError = page.getByTestId('field-error-otp')`

**Assertions:**

- `expect(newEmailInput).toBeVisible()`
- `expect(sendVerificationButton).toBeDisabled()` (loading)
- `expect(resendButton).toBeDisabled()` (cooldown)
- `expect(otpError).toHaveText(/tidak valid/i)`
- `expect(toast).toHaveText(/berhasil diubah/i)`

### 3.5 WhatsApp Change

Flow ubah WhatsApp: menampilkan nomor HP saat ini, input nomor baru dengan country code selector, kirim OTP, verifikasi OTP, cooldown kirim ulang.

| #     | Nama Test                                                        | Assertion                                            |
| ----- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| PF-31 | menampilkan nomor WhatsApp saat ini                              | Nomor saat ini terlihat dan disabled                 |
| PF-32 | memilih kode negara dari country code selector                   | Kode negara berubah sesuai pilihan                   |
| PF-33 | mengirim OTP ke nomor WhatsApp baru valid                        | Toast "Kode OTP terkirim"                            |
| PF-34 | menampilkan error saat nomor WhatsApp tidak valid                | Validasi "Nomor telepon tidak valid"                 |
| PF-35 | menampilkan error saat nomor WhatsApp sama dengan nomor saat ini | Error "Nomor sama"                                   |
| PF-36 | memasukkan kode OTP valid untuk verifikasi WhatsApp              | Toast "WhatsApp berhasil diubah", redirect ke profil |
| PF-37 | memasukkan kode OTP tidak valid                                  | Error "Kode OTP tidak valid"                         |
| PF-38 | menampilkan cooldown tombol kirim ulang OTP                      | Tombol kirim ulang disabled selama cooldown          |
| PF-39 | mengirim ulang OTP setelah cooldown                              | Toast "Kode terkirim ulang", timer reset             |
| PF-40 | menampilkan loading state saat mengirim OTP                      | Tombol kirim menunjukkan spinner, disabled           |

**POM:** `whatsapp-change.page.ts`

**Selectors:**

- `currentPhone = page.getByTestId('current-phone')`
- `countryCodeSelector = page.getByRole('button', { name: /kode negara/i })`
- `newPhoneInput = page.getByRole('textbox', { name: /nomor whatsapp/i })`
- `sendOtpButton = page.getByRole('button', { name: /kirim otp/i })`
- `otpInputs = page.locator('input[data-testid="otp-input"]')`
- `verifyButton = page.getByRole('button', { name: /verifikasi/i })`
- `resendButton = page.getByRole('button', { name: /kirim ulang/i })`
- `countdownTimer = page.getByTestId('countdown-timer')`
- `newPhoneError = page.getByTestId('field-error-phone')`

**Assertions:**

- `expect(countryCodeSelector).toContainText('+62')` (default)
- `expect(newPhoneError).toHaveText(/tidak valid/i)`
- `expect(sendOtpButton).toBeDisabled()` (loading)
- `expect(resendButton).toBeDisabled()` (cooldown)

### 3.6 Delete Account

Flow hapus akun: menampilkan informasi konsekuensi, konfirmasi dengan mengetik teks atau checkbox, cancel, sukses, loading state.

| #     | Nama Test                                     | Assertion                                        |
| ----- | --------------------------------------------- | ------------------------------------------------ |
| PF-41 | menampilkan informasi konsekuensi hapus akun  | Peringatan "Tindakan ini tidak dapat dibatalkan" |
| PF-42 | mengetik teks konfirmasi dengan benar         | Tombol hapus menjadi aktif                       |
| PF-43 | mengetik teks konfirmasi dengan salah         | Tombol hapus tetap disabled                      |
| PF-44 | membatalkan hapus akun                        | Kembali ke halaman profil                        |
| PF-45 | menghapus akun dengan konfirmasi benar        | Toast "Akun berhasil dihapus", redirect ke login |
| PF-46 | menampilkan loading state saat menghapus akun | Tombol hapus menunjukkan spinner, disabled       |
| PF-47 | menampilkan checkbox konfirmasi jika tersedia | Checkbox "Saya mengerti" dapat dicentang         |

**POM:** `delete-account.page.ts`

**Selectors:**

- `deleteInfo = page.getByTestId('delete-info')`
- `confirmTextInput = page.getByRole('textbox', { name: /ketik/i })`
- `confirmCheckbox = page.getByRole('checkbox', { name: /saya mengerti/i })`
- `deleteButton = page.getByRole('button', { name: /hapus akun/i })`
- `cancelButton = page.getByRole('button', { name: /batal/i })`

**Assertions:**

- `expect(deleteInfo).toContainText(/tidak dapat dibatalkan/i)`
- `expect(deleteButton).toBeDisabled()` (before confirm)
- `expect(deleteButton).toBeEnabled()` (after confirm)
- `expect(deleteButton).toBeDisabled()` (loading)
- `expect(page).toHaveURL(/\/auth\/login/)` (success)

---

## 4. Test Data

| Factory                           | Fungsi                        | Fields Penting                                |
| --------------------------------- | ----------------------------- | --------------------------------------------- |
| `generateProfilePayload()`        | Membuat payload edit profil   | name                                          |
| `generatePasswordPayload()`       | Membuat payload ubah password | currentPassword, newPassword, confirmPassword |
| `generateEmailChangePayload()`    | Membuat payload ubah email    | newEmail                                      |
| `generateWhatsappChangePayload()` | Membuat payload ubah WhatsApp | countryCode, phone                            |
| `generateDeleteAccountPayload()`  | Membuat payload hapus akun    | confirmationText                              |

**Contoh factory:**

```typescript
function generatePasswordPayload(overrides?: Partial<PasswordPayload>): PasswordPayload {
  return {
    currentPassword: "CurrentPass123!",
    newPassword: "NewStrongPass456!",
    confirmPassword: "NewStrongPass456!",
    ...overrides,
  };
}
```

**Constants khusus:**

- `VALID_IMAGE_PATH`: Path file gambar valid untuk upload
- `INVALID_FILE_PATH`: Path file non-gambar untuk uji tipe
- `LARGE_FILE_PATH`: Path file >2MB untuk uji ukuran

---

## 5. Catatan Penting

1. **Email dan WhatsApp Change memicu verifikasi.** Setelah input email/nomor baru, sistem mengirim kode verifikasi. Test harus mensimulasikan input OTP yang benar. Gunakan `page.waitForResponse` untuk menangkap kode dari API test environment, atau gunakan token statis di environment testing.

2. **Password strength rules.** Password baru harus memenuhi minimal: 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol. Gunakan factory dengan nilai default yang sudah sesuai.

3. **Delete account bersifat irreversibel.** Pastikan test hapus akun menggunakan akun test dedicated (bukan akun utama). Di environment staging/preview, gunakan akun yang bisa diregenerasi.

4. **Cooldown resend.** Setelah mengirim verifikasi/OTP, tombol kirim ulang disabled untuk periode tertentu (biasanya 30-60 detik). Test harus memverifikasi state disabled, bukan menunggu cooldown selesai.

5. **Photo upload membutuhkan file.** Gunakan `file-helper.ts` dari `tests/utils/` untuk membuat file dummy gambar. Pastikan file valid ada sebelum test dijalankan.

6. **Loading state.** Setiap operasi mutation (simpan, kirim, verifikasi, hapus) harus menampilkan loading state. Gunakan `expect(submitButton).toBeDisabled()` atau cari spinner.

7. **Selector priority.** Data-testid adalah priority pertama. Jika tidak tersedia, gunakan `getByRole` dengan accessible name. CSS/XPath hanya sebagai fallback terakhir setelah membaca source code komponen.

8. **Test isolation.** Setiap test harus independen. Gunakan `test.beforeEach` untuk navigasi ke halaman yang relevan. Jangan mengandalkan state dari test sebelumnya.

9. **Flakiness prevention.** Hindari `page.waitFor(timeout)`. Gunakan auto-waiting Playwright (`action` sudah auto-wait), `waitForResponse`, `waitForURL`, atau `expect().toPass()` untuk polling state async.

10. **Daftar POM yang diperlukan:**
    - `tests/pages/profile/profile.page.ts`
    - `tests/pages/profile/edit-profile.page.ts`
    - `tests/pages/profile/change-password.page.ts`
    - `tests/pages/profile/email-change.page.ts`
    - `tests/pages/profile/whatsapp-change.page.ts`
    - `tests/pages/profile/delete-account.page.ts`
    - `tests/pages/components/toast.component.ts` (shared)

---

## 6. Ringkasan Skenario

| Bagian          | Jumlah Skenario | Kode Prefix |
| --------------- | --------------- | ----------- |
| Profile View    | 4               | PF-01–PF-04 |
| Profile Edit    | 10              | PF-05–PF-14 |
| Change Password | 7               | PF-15–PF-21 |
| Email Change    | 9               | PF-22–PF-30 |
| WhatsApp Change | 10              | PF-31–PF-40 |
| Delete Account  | 7               | PF-41–PF-47 |
| **Total**       | **47**          | PF-01–PF-47 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario                   | Alasan                                             |
| --------- | -------------------------- | -------------------------------------------------- |
| P0        | PF-01, PF-05, PF-15, PF-45 | Core flow: lihat profil, edit nama, ganti password |
| P1        | PF-09, PF-11, PF-22, PF-31 | Fitur sekunder: foto, email, WhatsApp              |
| P2        | PF-03, PF-14, PF-20, PF-46 | Loading & edge cases                               |
| P3        | PF-02, PF-04, PF-28, PF-38 | Metadata, non-kritis                               |

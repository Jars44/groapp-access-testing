# Coverage Onboarding — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Onboarding pada GroApp Access.**
> Meliputi: multi-step stepper (workspace → company → business unit), validasi form, submit.

---

## 1. Pendahuluan

Fitur Onboarding dirancang untuk pengguna baru yang pertama kali login. Flow onboarding memandu pengguna melalui beberapa langkah untuk menyiapkan workspace, perusahaan, dan unit bisnis pertama. Onboarding menggunakan stepper multi-step yang menampilkan progres. Setelah semua langkah selesai, data dikirim ke API dan pengguna diarahkan ke dashboard.

Sumber kode: `src/features/onboarding/`

**Arsitektur Onboarding:**

| Layer          | Path                       | Fungsi                                    |
| -------------- | -------------------------- | ----------------------------------------- |
| Presentation   | `presentation/pages/`      | Halaman onboarding                        |
| Presentation   | `presentation/components/` | Stepper component                         |
| Presentation   | `presentation/forms/`      | Validator (Zod)                           |
| Presentation   | `presentation/hooks/`      | Submit hook                               |
| Presentation   | `presentation/mappers/`    | Payload mapper                            |
| Infrastructure | `infrastructure/`          | API, endpoint, failure mapper, repository |
| Domain         | `domain/`                  | Onboarding types                          |
| Application    | `application/`             | Submit use case                           |

**Routes:**

| Path          | Layout | Deskripsi                              |
| ------------- | ------ | -------------------------------------- |
| `/onboarding` | None   | Halaman onboarding (tanpa main layout) |

**Langkah Onboarding:**

| Langkah | Form            | Deskripsi                                         |
| ------- | --------------- | ------------------------------------------------- |
| 1       | Workspace       | Nama workspace                                    |
| 2       | Company         | Nama perusahaan, business type, country, currency |
| 3       | Business Unit   | Nama unit bisnis, tipe unit                       |
| 4       | Review & Submit | Ringkasan data, konfirmasi, submit                |

---

## 2. Struktur File Test

```text
tests/
├── pages/onboarding/
│   └── onboarding.page.ts                  # Halaman onboarding
├── specs/onboarding/
│   └── onboarding.spec.ts                  # Test onboarding
├── data/
│   └── onboarding.data.ts                  # Factory test data onboarding
└── fixtures/
    └── auth.fixture.ts                     # Fixture autentikasi
```

---

## 3. Playwright E2E

### 3.1 Onboarding Stepper

Onboarding ditampilkan dalam stepper multi-step. Setiap langkah memiliki form yang harus diisi. Progress indicator menunjukkan langkah saat ini dan total langkah.

| #     | Nama Test                                              | Assertion                                            |
| ----- | ------------------------------------------------------ | ---------------------------------------------------- |
| OB-01 | menampilkan stepper onboarding dengan langkah awal     | Step 1 (Workspace) visible, progress indicator = 1/4 |
| OB-02 | melanjutkan ke langkah Company setelah workspace valid | Step 2 (Company) visible, progress = 2/4             |
| OB-03 | melanjutkan ke langkah Unit setelah company valid      | Step 3 (Unit) visible, progress = 3/4                |
| OB-04 | kembali ke langkah Workspace dari langkah Company      | Step 1 visible, data workspace tetap ada             |
| OB-05 | kembali ke langkah Company dari langkah Unit           | Step 2 visible, data company tetap ada               |
| OB-06 | progress indicator menunjukkan langkah saat ini        | Indicator memperbarui saat navigasi langkah          |
| OB-07 | membaca informasi pengantar sebelum memulai            | Teks pengantar atau instruksi visible                |

**POM:** `onboarding.page.ts`

**Selectors:**

- `stepper = page.getByTestId('onboarding-stepper')`
- `stepIndicator = page.getByTestId('step-indicator')`
- `currentStepLabel = page.getByTestId('current-step-label')`
- `workspaceStep = page.getByTestId('step-workspace')`
- `companyStep = page.getByTestId('step-company')`
- `unitStep = page.getByTestId('step-unit')`
- `reviewStep = page.getByTestId('step-review')`
- `nextButton = page.getByRole('button', { name: /lanjut|selanjutnya/i })`
- `backButton = page.getByRole('button', { name: /kembali/i })`

**Assertions:**

- `expect(workspaceStep).toBeVisible()`
- `expect(stepIndicator).toHaveText(/1\s*\/\s*4/)`
- `expect(companyStep).toBeVisible()`
- `expect(stepIndicator).toHaveText(/2\s*\/\s*4/)`
- `expect(unitStep).toBeVisible()`

### 3.2 Onboarding Submission

Setelah semua langkah diisi, pengguna melihat ringkasan dan melakukan submit. Validasi form di setiap langkah. Submit memanggil API onboarding.

| #     | Nama Test                                                | Assertion                                        |
| ----- | -------------------------------------------------------- | ------------------------------------------------ |
| OB-08 | menampilkan ringkasan data sebelum submit                | Semua data yang diinput tampil di step Review    |
| OB-09 | submit onboarding dengan data valid                      | Toast "Selamat datang!", redirect ke dashboard   |
| OB-10 | menampilkan error saat nama workspace dikosongkan        | Validasi "Nama workspace wajib diisi"            |
| OB-11 | menampilkan error saat nama perusahaan dikosongkan       | Validasi "Nama perusahaan wajib diisi"           |
| OB-12 | menampilkan error saat business type tidak dipilih       | Validasi "Tipe bisnis wajib dipilih"             |
| OB-13 | menampilkan error saat currency tidak dipilih            | Validasi "Mata uang wajib dipilih"               |
| OB-14 | submit onboarding hanya workspace + company (tanpa unit) | Opsi lewati unit tersedia, submit tetap berhasil |
| OB-15 | menampilkan loading state saat submit                    | Tombol submit menunjukkan spinner, disabled      |
| OB-16 | menampilkan error dari API saat submit gagal             | Error toast dari server                          |
| OB-17 | mengisi ulang data setelah error                         | Data sebelumnya tetap ada, bisa diperbaiki       |

**POM:** `onboarding.page.ts`

**Selectors (Forms):**

- `workspaceNameInput = page.getByRole('textbox', { name: /nama workspace/i })`
- `companyNameInput = page.getByRole('textbox', { name: /nama perusahaan/i })`
- `businessTypeDropdown = page.getByRole('combobox', { name: /tipe bisnis/i })`
- `countryDropdown = page.getByRole('combobox', { name: /negara/i })`
- `currencyDropdown = page.getByRole('combobox', { name: /mata uang/i })`
- `unitNameInput = page.getByRole('textbox', { name: /nama unit/i })`
- `unitTypeDropdown = page.getByRole('combobox', { name: /tipe unit/i })`
- `skipUnitCheckbox = page.getByRole('checkbox', { name: /lewati/i })`
- `reviewData = page.getByTestId('review-data')`
- `workspaceNameReview = page.getByTestId('review-workspace-name')`
- `companyNameReview = page.getByTestId('review-company-name')`
- `submitButton = page.getByRole('button', { name: /kirim|selesai/i })`
- `workspaceNameError = page.getByTestId('field-error-workspaceName')`
- `companyNameError = page.getByTestId('field-error-companyName')`
- `businessTypeError = page.getByTestId('field-error-businessType')`
- `currencyError = page.getByTestId('field-error-currency')`

**Assertions:**

- `expect(workspaceNameError).toHaveText(/wajib diisi/i)`
- `expect(companyNameError).toHaveText(/wajib diisi/i)`
- `expect(businessTypeError).toHaveText(/wajib dipilih/i)`
- `expect(reviewData).toBeVisible()`
- `expect(page).toHaveURL(/\/dashboard/)` (success)
- `expect(submitButton).toBeDisabled()` (loading)
- `expect(toast).toHaveText(/selamat datang/i)` (success)

---

## 4. Test Data

| Factory                          | Fungsi                             | Fields Penting                                              |
| -------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| `generateOnboardingPayload()`    | Membuat payload onboarding lengkap | workspaceName, companyName, businessType, country, currency |
| `generateWorkspaceOnlyPayload()` | Membuat payload tanpa unit         | workspaceName, companyName (skip unit)                      |

**Contoh factory:**

```typescript
function generateOnboardingPayload(overrides?: Partial<OnboardingPayload>): OnboardingPayload {
  return {
    workspaceName: `Workspace ${Date.now()}`,
    companyName: `PT ${Date.now()}`,
    businessType: "jasa",
    country: "ID",
    currency: "IDR",
    unitName: `Cabang ${Date.now()}`,
    unitType: "cabang",
    ...overrides,
  };
}
```

**Constants khusus:**

- `BUSINESS_TYPES`: ['jasa', 'dagang', 'manufaktur', 'lainnya']
- `CURRENCIES`: ['IDR', 'USD', 'SGD']
- `TOTAL_STEPS`: 4

---

## 5. Catatan Penting

1. **Onboarding hanya untuk user baru.** Fitur ini hanya muncul untuk pengguna yang pertama kali login/belum memiliki workspace. Test harus menggunakan akun pengguna baru (fresh user) yang belum pernah melalui onboarding. Di environment test, siapkan akun dedicated untuk onboarding.

2. **Multi-step form persistence.** Data yang diinput di langkah sebelumnya harus tetap ada saat kembali dari langkah berikutnya. Test OB-04 dan OB-05 memverifikasi persistence ini.

3. **Skip unit.** Onboarding mungkin menyediakan opsi untuk melewati pembuatan unit bisnis (OB-14). Test harus memverifikasi opsi ini jika tersedia.

4. **Loading state saat submit.** Proses submit onboarding bisa memakan waktu beberapa detik karena membuat beberapa resource (workspace + company + unit). Tombol submit harus menampilkan loading state selama proses berlangsung.

5. **Error state dari API.** Jika API gagal (misalnya duplikat nama workspace), error harus ditampilkan sebagai toast. Data yang sudah diinput harus tetap ada sehingga pengguna bisa memperbaiki.

6. **Redirect setelah sukses.** Setelah submit berhasil, pengguna diarahkan ke `/dashboard` (atau halaman utama). Verifikasi URL akhir menggunakan `toContainURL`.

7. **Test isolation.** Setiap test onboarding membutuhkan user yang benar-benar baru. Gunakan fixture atau `test.beforeEach` yang membuat akun baru atau menghapus data onboarding sebelumnya.

8. **Flakiness prevention.** Hindari `page.waitFor(timeout)`. Gunakan auto-waiting Playwright. Untuk navigasi stepper, tunggu elemen target muncul dengan `waitForSelector` atau `toBeVisible`.

9. **Selector priority.** Data-testid untuk stepper steps (`step-workspace`, `step-company`), field error (`field-error-workspaceName`), review data (`review-workspace-name`).

10. **Daftar POM yang diperlukan:**
    - `tests/pages/onboarding/onboarding.page.ts`
    - `tests/pages/components/toast.component.ts` (shared)
    - `tests/pages/components/modal.component.ts` (shared, jika ada konfirmasi)

---

## 6. Ringkasan Skenario

| Bagian                | Jumlah Skenario | Kode Prefix |
| --------------------- | --------------- | ----------- |
| Onboarding Stepper    | 7               | OB-01–OB-07 |
| Onboarding Submission | 10              | OB-08–OB-17 |
| **Total**             | **17**          | OB-01–OB-17 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario                   | Alasan                                     |
| --------- | -------------------------- | ------------------------------------------ |
| P0        | OB-01, OB-09               | Core flow: stepper muncul, submit berhasil |
| P1        | OB-02, OB-03, OB-06, OB-14 | Navigasi stepper, skip unit                |
| P2        | OB-10, OB-11, OB-12, OB-15 | Validasi dan loading state                 |
| P3        | OB-04, OB-05, OB-07, OB-16 | Back navigation, error API                 |

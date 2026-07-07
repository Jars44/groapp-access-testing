# Coverage Unit (Business Unit) — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Unit (Business Unit) pada GroApp Access.**
> Meliputi: CRUD unit bisnis, geo cascade, toggle status, precheck dampak hapus.

---

## 1. Pendahuluan

Fitur Unit (Business Unit) memungkinkan pengelolaan unit bisnis dalam suatu perusahaan. Setiap perusahaan dapat memiliki banyak unit bisnis yang merepresentasikan divisi, cabang, atau departemen. Fitur ini mencakup daftar unit (dengan filter status), pembuatan unit baru (dengan geo cascade provinsi → kota → kecamatan → kelurahan), detail & update unit, toggle status aktif/nonaktif, dan hapus unit dengan precheck dampak.

Sumber kode: `src/features/unit/`

**Arsitektur Unit:**

| Layer          | Path                       | Fungsi                                            |
| -------------- | -------------------------- | ------------------------------------------------- |
| Presentation   | `presentation/pages/`      | List, detail, profile pages                       |
| Presentation   | `presentation/components/` | Card, form modal, delete confirm/impact, toggle   |
| Presentation   | `presentation/forms/`      | Form utils                                        |
| Presentation   | `presentation/hooks/`      | Geo master, list, operations hooks                |
| Presentation   | `presentation/state/`      | List store                                        |
| Presentation   | `presentation/routes/`     | Route paths                                       |
| Infrastructure | `infrastructure/`          | API, endpoint, failure mapper, orchestrator, DTOs |
| Domain         | `domain/`                  | Types                                             |
| Application    | `application/`             | 9 use cases                                       |

**Routes:**

| Path                                  | Layout              | Deskripsi                           |
| ------------------------------------- | ------------------- | ----------------------------------- |
| `/companies/:companyId/units`         | AppMainAccessLayout | Daftar unit bisnis suatu perusahaan |
| `/companies/:companyId/units/:unitId` | AppMainAccessLayout | Detail unit bisnis                  |

**Struktur Geo Cascade:**

```text
Provinsi → Kota/Kabupaten → Kecamatan → Kelurahan/Desa
```

---

## 2. Struktur File Test

```text
tests/
├── pages/unit/
│   ├── unit-list.page.ts                # Halaman daftar unit
│   ├── unit-detail.page.ts              # Halaman detail unit
│   └── unit-form-modal.page.ts          # Modal form unit (create/edit)
├── specs/unit/
│   ├── unit-list.spec.ts                # Test daftar unit
│   ├── unit-create.spec.ts              # Test buat unit
│   ├── unit-update.spec.ts              # Test update unit
│   └── unit-delete.spec.ts              # Test hapus unit
├── data/
│   └── unit.data.ts                     # Factory test data unit
└── fixtures/
    ├── auth.fixture.ts                  # Fixture autentikasi
    └── company.fixture.ts               # Fixture konteks perusahaan
```

---

## 3. Playwright E2E

### 3.1 Unit List

Daftar unit bisnis ditampilkan dalam bentuk kartu atau tabel. Filter status (semua/aktif/nonaktif). Loading state.

| #     | Nama Test                                         | Assertion                                 |
| ----- | ------------------------------------------------- | ----------------------------------------- |
| UN-01 | menampilkan daftar unit untuk suatu perusahaan    | Kartu unit visible dengan nama dan status |
| UN-02 | menampilkan empty state saat tidak ada unit       | Komponen "Belum ada unit" visible         |
| UN-03 | memfilter unit berdasarkan status aktif           | Hanya unit dengan status aktif tampil     |
| UN-04 | memfilter unit berdasarkan status nonaktif        | Hanya unit dengan status nonaktif tampil  |
| UN-05 | mengganti filter dari aktif ke semua              | Semua unit muncul kembali                 |
| UN-06 | menampilkan loading state saat memuat daftar unit | Skeleton/loader terlihat                  |
| UN-07 | filter dengan hasil kosong                        | Empty state "Tidak ada unit" visible      |

**POM:** `unit-list.page.ts`

**Selectors:**

- `unitCards = page.getByTestId('unit-card')`
- `unitName = (index: number) => page.getByTestId(`unit-name-${index}`)`
- `unitStatus = (index: number) => page.getByTestId(`unit-status-${index}`)`
- `unitType = (index: number) => page.getByTestId(`unit-type-${index}`)`
- `filterAllButton = page.getByRole('button', { name: /semua/i })`
- `filterActiveButton = page.getByRole('button', { name: /aktif/i })`
- `filterInactiveButton = page.getByRole('button', { name: /nonaktif/i })`
- `emptyState = page.getByTestId('empty-state')`
- `skeleton = page.getByTestId('unit-skeleton')`
- `addUnitButton = page.getByRole('button', { name: /tambah unit/i })`

**Assertions:**

- `expect(unitCards.first()).toBeVisible()`
- `expect(emptyState).toBeVisible()`
- `expect(unitStatus(0)).toHaveText(/aktif|nonaktif/i)`

### 3.2 Unit Create

Form modal pembuatan unit dengan validasi: nama wajib diisi, nama unik per perusahaan, unit type, kontak, alamat dengan geo cascade.

| #     | Nama Test                                                   | Assertion                                           |
| ----- | ----------------------------------------------------------- | --------------------------------------------------- |
| UN-08 | membuat unit dengan data valid (minimal)                    | Toast "Unit berhasil dibuat", unit muncul di list   |
| UN-09 | membuat unit dengan semua field (alamat, kontak, type)      | Semua field tersimpan dengan benar                  |
| UN-10 | menampilkan error saat nama unit dikosongkan                | Validasi "Nama unit wajib diisi"                    |
| UN-11 | menampilkan error saat nama unit duplikat (satu perusahaan) | Error "Nama unit sudah digunakan"                   |
| UN-12 | memilih unit type dari dropdown                             | Type terpilih sesuai                                |
| UN-13 | memilih provinsi mengisi daftar kota                        | Dropdown kota terisi setelah provinsi dipilih       |
| UN-14 | memilih kota mengisi daftar kecamatan                       | Dropdown kecamatan terisi setelah kota dipilih      |
| UN-15 | memilih kecamatan mengisi daftar kelurahan                  | Dropdown kelurahan terisi setelah kecamatan dipilih |
| UN-16 | menampilkan loading state saat menyimpan unit               | Tombol simpan menunjukkan spinner, disabled         |
| UN-17 | membatalkan pembuatan unit                                  | Modal tertutup, tidak ada unit baru                 |

**POM:** `unit-form-modal.page.ts`

**Selectors:**

- `modal = page.getByTestId('unit-form-modal')`
- `nameInput = page.getByRole('textbox', { name: /nama unit/i })`
- `typeDropdown = page.getByRole('combobox', { name: /tipe unit/i })`
- `phoneInput = page.getByRole('textbox', { name: /telepon/i })`
- `emailInput = page.getByRole('textbox', { name: /email/i })`
- `provinceDropdown = page.getByRole('combobox', { name: /provinsi/i })`
- `cityDropdown = page.getByRole('combobox', { name: /kota/i })`
- `districtDropdown = page.getByRole('combobox', { name: /kecamatan/i })`
- `villageDropdown = page.getByRole('combobox', { name: /kelurahan/i })`
- `addressInput = page.getByRole('textbox', { name: /alamat/i })`
- `postalCodeInput = page.getByRole('textbox', { name: /kode pos/i })`
- `saveButton = page.getByRole('button', { name: /simpan/i })`
- `cancelButton = page.getByRole('button', { name: /batal/i })`
- `nameError = page.getByTestId('field-error-name')`
- `nameDuplicateError = page.getByTestId('field-error-name-duplicate')`
- `typeOptions = page.locator('[role="option"]')`
- `geoLoadingIndicator = page.getByTestId('geo-loading')`

**Assertions:**

- `expect(nameError).toHaveText(/wajib diisi/i)`
- `expect(nameDuplicateError).toHaveText(/sudah digunakan/i)`
- `expect(cityDropdown).toBeEnabled()` (after province selected)
- `expect(districtDropdown).toBeEnabled()` (after city selected)
- `expect(villageDropdown).toBeEnabled()` (after district selected)
- `expect(saveButton).toBeDisabled()` (loading)

### 3.3 Unit Detail & Update

Halaman detail unit menampilkan semua informasi unit. Form edit untuk memperbarui field.

| #     | Nama Test                                            | Assertion                                      |
| ----- | ---------------------------------------------------- | ---------------------------------------------- |
| UN-18 | menampilkan detail unit dengan semua informasi       | Nama, type, alamat, kontak, status visible     |
| UN-19 | mengedit nama unit                                   | Toast "Unit berhasil diubah", nama baru tampil |
| UN-20 | mengedit alamat unit (geo cascade ulang)             | Alamat baru tersimpan                          |
| UN-21 | mengedit kontak unit                                 | Kontak baru tersimpan                          |
| UN-22 | menampilkan error saat nama unit dikosongkan di edit | Validasi "Nama unit wajib diisi"               |
| UN-23 | menampilkan loading state saat menyimpan edit        | Tombol simpan menunjukkan spinner, disabled    |

**POM:** `unit-detail.page.ts`

**Selectors:**

- `unitName = page.getByTestId('unit-detail-name')`
- `unitType = page.getByTestId('unit-detail-type')`
- `unitStatus = page.getByTestId('unit-detail-status')`
- `unitAddress = page.getByTestId('unit-detail-address')`
- `unitPhone = page.getByTestId('unit-detail-phone')`
- `unitEmail = page.getByTestId('unit-detail-email')`
- `editButton = page.getByRole('button', { name: /edit/i })`
- `saveButton = page.getByRole('button', { name: /simpan/i })`
- `nameInput = page.getByRole('textbox', { name: /nama unit/i })`

**Assertions:**

- `expect(unitName).toBeVisible()`
- `expect(unitType).toHaveText(/.+/)`
- `expect(toast).toHaveText(/berhasil diubah/i)`

### 3.4 Unit Status Toggle

Toggle status unit antara aktif dan nonaktif. Modal konfirmasi untuk toggle.

| #     | Nama Test                                    | Assertion                                       |
| ----- | -------------------------------------------- | ----------------------------------------------- |
| UN-24 | menonaktifkan unit yang aktif                | Status berubah menjadi "Nonaktif", toast sukses |
| UN-25 | mengaktifkan unit yang nonaktif              | Status berubah menjadi "Aktif", toast sukses    |
| UN-26 | menampilkan modal konfirmasi toggle status   | Modal visible, tombol konfirmasi dan batal      |
| UN-27 | membatalkan toggle status                    | Status tidak berubah, modal tertutup            |
| UN-28 | menampilkan loading state saat toggle status | Tombol konfirmasi menunjukkan spinner           |

**POM:** `unit-list.page.ts` / `unit-detail.page.ts`

**Selectors (Status Toggle):**

- `statusToggleButton = (index: number) => page.getByTestId(`status-toggle-${index}`)`
- `toggleConfirmModal = page.getByTestId('status-toggle-modal')`
- `toggleConfirmButton = page.getByRole('button', { name: /ya, (non)?aktifkan/i })`
- `toggleCancelButton = page.getByRole('button', { name: /batal/i })`

**Assertions:**

- `expect(toggleConfirmModal).toBeVisible()`
- `expect(unitStatus(index)).toHaveText(/nonaktif|aktif/i)`
- `expect(toast).toHaveText(/berhasil (di)?(non)?aktifkan/i)`

### 3.5 Unit Delete

Hapus unit dengan precheck dampak: sistem memeriksa apakah unit memiliki transaksi atau data terkait sebelum mengizinkan penghapusan.

| #     | Nama Test                                             | Assertion                                            |
| ----- | ----------------------------------------------------- | ---------------------------------------------------- |
| UN-29 | menampilkan precheck dampak sebelum hapus             | Modal "Dampak penghapusan" visible                   |
| UN-30 | precheck menunjukkan unit aman dihapus                | Tombol hapus aktif, tidak ada blokir                 |
| UN-31 | precheck menunjukkan unit diblokir (ada transaksi)    | Pesan blokir "Unit memiliki transaksi aktif"         |
| UN-32 | precheck menunjukkan unit diblokir (ada data terkait) | Pesan blokir dengan daftar data terkait              |
| UN-33 | menghapus unit setelah precheck lolos                 | Toast "Unit berhasil dihapus", unit hilang dari list |
| UN-34 | mengetik nama unit untuk konfirmasi hapus             | Tombol hapus aktif setelah nama benar                |
| UN-35 | mengetik nama unit salah saat konfirmasi              | Tombol hapus tetap disabled                          |
| UN-36 | membatalkan penghapusan unit                          | Modal tertutup, unit tetap ada                       |
| UN-37 | menampilkan loading state saat precheck               | Loading spinner visible                              |

**POM:** `unit-detail.page.ts`

**Selectors (Delete):**

- `deleteButton = page.getByRole('button', { name: /hapus unit/i })`
- `deleteImpactModal = page.getByTestId('delete-impact-modal')`
- `impactDescription = page.getByTestId('impact-description')`
- `blockedMessage = page.getByTestId('blocked-message')`
- `confirmNameInput = page.getByRole('textbox', { name: /ketik nama unit/i })`
- `confirmDeleteButton = page.getByRole('button', { name: /ya, hapus/i })`
- `cancelDeleteButton = page.getByRole('button', { name: /batal/i })`
- `precheckLoading = page.getByTestId('precheck-loading')`

**Assertions:**

- `expect(deleteImpactModal).toBeVisible()`
- `expect(blockedMessage).toHaveText(/transaksi|data terkait/i)` (blocked)
- `expect(confirmDeleteButton).toBeDisabled()` (wrong name)
- `expect(confirmDeleteButton).toBeEnabled()` (correct name)
- `expect(toast).toHaveText(/berhasil dihapus/i)` (success)

---

## 4. Test Data

| Factory                        | Fungsi                      | Fields Penting                                         |
| ------------------------------ | --------------------------- | ------------------------------------------------------ |
| `generateUnitPayload()`        | Membuat payload unit baru   | name, unitType                                         |
| `generateUnitAddressPayload()` | Membuat payload alamat unit | province, city, district, village, address, postalCode |
| `generateUnitContactPayload()` | Membuat payload kontak unit | phone, email                                           |

**Contoh factory:**

```typescript
function generateUnitPayload(overrides?: Partial<UnitPayload>): UnitPayload {
  return {
    name: `Unit Test ${Date.now()}`,
    unitType: "cabang",
    ...overrides,
  };
}

function generateUnitAddressPayload(overrides?: Partial<UnitAddress>): UnitAddress {
  return {
    province: { id: "11", name: "Aceh" },
    city: { id: "1101", name: "Kab. Aceh Selatan" },
    district: { id: "110101", name: "Bakongan" },
    village: { id: "1101012001", name: "Keude Bakongan" },
    address: "Jl. Contoh No. 123",
    postalCode: "23771",
    ...overrides,
  };
}
```

**Constants khusus:**

- `UNIT_TYPES`: ['cabang', 'divisi', 'departemen', 'pusat']
- `GEO_PROVINCE_ID`: ID provinsi untuk test geo cascade
- `GEO_CITY_ID`: ID kota untuk test geo cascade
- `GEO_DISTRICT_ID`: ID kecamatan untuk test geo cascade
- `GEO_VILLAGE_ID`: ID kelurahan untuk test geo cascade

---

## 5. Catatan Penting

1. **Geo cascade membutuhkan data master.** Test geo cascade (UN-13 sampai UN-15) bergantung pada data master yang tersedia di API test environment. Pastikan ada data provinsi, kota, kecamatan, kelurahan sebelum menjalankan test. Jika data tidak tersedia, test akan gagal.

2. **Nama unit unique per company.** Validasi nama duplikat (UN-11) bersifat per perusahaan. Unit dengan nama yang sama di perusahaan berbeda tidak dianggap duplikat. Test harus membuat dua unit dalam perusahaan yang sama.

3. **Precheck delete impact.** Sebelum menghapus unit, sistem melakukan precheck untuk memeriksa dampak (UN-29). Jika unit memiliki transaksi atau data terkait, penghapusan diblokir. Test harus mencakup skenario blokir dan skenario lolos.

4. **Status toggle confirmation.** Toggle status (aktif ↔ nonaktif) memerlukan konfirmasi melalui modal. Perubahan terjadi setelah konfirmasi, bukan langsung. Test harus memverifikasi modal muncul sebelum perubahan.

5. **Loading state.** Setiap operasi mutation (simpan, toggle, hapus) harus menampilkan loading state. Gunakan `expect(submitButton).toBeDisabled()` atau cari spinner. Precheck dampak juga memiliki loading state terpisah.

6. **Test isolation.** Setiap test harus independen. Gunakan `test.beforeEach` untuk navigasi ke halaman unit. Gunakan company fixture untuk mendapatkan companyId yang valid.

7. **Selector priority.** Data-testid adalah priority pertama (`unit-card`, `unit-form-modal`, `status-toggle-0`). Fallback ke `getByRole` untuk dropdown dan tombol.

8. **Flakiness prevention.** Geo cascade memuat data asinkron. Gunakan `waitForResponse` untuk menunggu data master termuat. Hindari `page.waitFor(timeout)`.

9. **Daftar POM yang diperlukan:**
   - `tests/pages/unit/unit-list.page.ts`
   - `tests/pages/unit/unit-detail.page.ts`
   - `tests/pages/unit/unit-form-modal.page.ts`
   - `tests/pages/components/modal.component.ts` (shared)
   - `tests/pages/components/toast.component.ts` (shared)

---

## 6. Ringkasan Skenario

| Bagian               | Jumlah Skenario | Kode Prefix |
| -------------------- | --------------- | ----------- |
| Unit List            | 7               | UN-01–UN-07 |
| Unit Create          | 10              | UN-08–UN-17 |
| Unit Detail & Update | 6               | UN-18–UN-23 |
| Unit Status Toggle   | 5               | UN-24–UN-28 |
| Unit Delete          | 9               | UN-29–UN-37 |
| **Total**            | **37**          | UN-01–UN-37 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario                   | Alasan                                      |
| --------- | -------------------------- | ------------------------------------------- |
| P0        | UN-01, UN-08, UN-18, UN-33 | Core CRUD unit                              |
| P1        | UN-09, UN-13, UN-24, UN-29 | Geo cascade, toggle status, precheck delete |
| P2        | UN-06, UN-16, UN-23, UN-37 | Loading states                              |
| P3        | UN-10, UN-11, UN-22, UN-34 | Validasi dan edge cases                     |

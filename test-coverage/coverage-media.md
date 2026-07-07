# Coverage Media — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Media pada GroApp Access.**
> Meliputi: upload, get, dan delete media via API.

---

## 1. Pendahuluan

Fitur Media menyediakan fungsionalitas unggah (upload), ambil (get), dan hapus (delete) file media. Media digunakan oleh berbagai fitur lain seperti foto profil perusahaan dan foto profil pengguna. Fitur ini diakses melalui API internal yang digunakan oleh komponen-komponen di aplikasi.

Sumber kode: `src/features/media/`

**Arsitektur Media:**

| Layer          | Path                                 | Fungsi                                   |
| -------------- | ------------------------------------ | ---------------------------------------- |
| Application    | `application/`                       | 4 use cases: upload, get, delete         |
| Domain         | `domain/`                            | Media types, failures, constants, result |
| Infrastructure | `infrastructure/`                    | API, DTO, endpoint, mappers, repository  |
| Shared UI      | `shared/ui/molecules/file-uploader/` | Komponen upload file                     |

**Use Cases:**

- `UploadMediaUseCase` — Upload file media
- `GetMediaUseCase` — Ambil media by ID
- `DeleteMediaUseCase` — Hapus media by ID

**Routes:** Tidak ada route publik. Media diakses melalui API internal oleh komponen UI.

---

## 2. Struktur File Test

```text
tests/
├── specs/media/
│   └── media-operations.spec.ts            # Test operasi media
├── data/
│   └── media.data.ts                       # Factory test data media
├── utils/
│   └── file-helper.ts                      # Helper untuk generate file test
└── fixtures/
    └── auth.fixture.ts                     # Fixture autentikasi
```

---

## 3. Playwright E2E

### 3.1 Media Upload

Upload file media melalui komponen file uploader. Validasi tipe file, ukuran file, dan format multipart.

| #     | Nama Test                                        | Assertion                                     |
| ----- | ------------------------------------------------ | --------------------------------------------- |
| MD-01 | mengunggah file gambar dengan format valid       | File terupload, preview atau URL media muncul |
| MD-02 | mengunggah file dengan tipe tidak didukung       | Error "Tipe file tidak didukung"              |
| MD-03 | mengunggah file melebihi batas ukuran            | Error "Ukuran file melebihi batas maksimal"   |
| MD-04 | mengunggah file dalam format multipart/form-data | Request berisi multipart dengan field file    |

**POM:** Menggunakan komponen `FileUploader` dari shared UI, atau halaman yang memiliki fitur upload (profil, company).

**Selectors:**

- `fileUploader = page.getByTestId('file-uploader')`
- `fileInput = page.locator('input[type="file"]')`
- `uploadArea = page.getByTestId('upload-area')`
- `uploadButton = page.getByRole('button', { name: /unggah|upload/i })`
- `uploadProgress = page.getByTestId('upload-progress')`
- `filePreview = page.getByTestId('file-preview')`
- `fileError = page.getByTestId('field-error-file')`

**Assertions:**

- `expect(filePreview).toBeVisible()`
- `expect(fileError).toHaveText(/tidak didukung/i)` (invalid type)
- `expect(fileError).toHaveText(/melebihi|maksimal/i)` (size limit)
- `expect(uploadProgress).toBeHidden()` (after upload complete)
- `expect(page.locator('[data-testid="uploaded-media"]')).toBeVisible()` (success)

### 3.2 Media Operations

Mendapatkan media berdasarkan ID dan menghapus media berdasarkan ID.

| #     | Nama Test                             | Assertion                                      |
| ----- | ------------------------------------- | ---------------------------------------------- |
| MD-05 | menampilkan media yang sudah diupload | Gambar/file muncul sesuai dengan yang diupload |
| MD-06 | menghapus media yang sudah diupload   | Media hilang dari tampilan                     |
| MD-07 | menghapus media yang tidak ada        | Error "Media tidak ditemukan"                  |

**POM:** Halaman yang memiliki fitur tampil/hapus media (profil, company).

**Selectors:**

- `mediaElement = page.getByTestId('media-element')`
- `mediaId = page.getByTestId('media-id')`
- `deleteMediaButton = page.getByRole('button', { name: /hapus|remove/i })`
- `confirmDeleteButton = page.getByRole('button', { name: /ya, hapus/i })`
- `mediaError = page.getByTestId('media-error')`

**Assertions:**

- `expect(mediaElement).toBeVisible()` (get success)
- `expect(mediaElement).not.toBeVisible()` (delete success)
- `expect(mediaError).toHaveText(/tidak ditemukan/i)` (not found)
- `expect(toast).toHaveText(/berhasil dihapus/i)` (delete toast)

---

## 4. Test Data

| Factory                   | Fungsi                          | Fields Penting              |
| ------------------------- | ------------------------------- | --------------------------- |
| `generateMediaPayload()`  | Membuat payload upload media    | file, fileName, mimeType    |
| `generateMediaResponse()` | Membuat response media dari API | id, url, fileName, mimeType |

**Contoh factory:**

```typescript
function generateMediaPayload(overrides?: Partial<MediaPayload>): MediaPayload {
  return {
    file: new File(["test-content"], "test-image.png", { type: "image/png" }),
    fileName: "test-image.png",
    mimeType: "image/png",
    ...overrides,
  };
}
```

**Helper file generation (`tests/utils/file-helper.ts`):**

```typescript
function createTestImage(filename = 'test.png'): File {
  // Generate 1x1 pixel PNG for upload tests
  const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...]);
  return new File([pngBytes], filename, { type: 'image/png' });
}

function createLargeFile(sizeMB = 3): File {
  const content = new ArrayBuffer(sizeMB * 1024 * 1024);
  return new File([content], 'large-file.bin', { type: 'application/octet-stream' });
}

function createInvalidTypeFile(): File {
  return new File(['text'], 'document.pdf', { type: 'application/pdf' });
}
```

**Constants khusus:**

- `MAX_FILE_SIZE_BYTES`: 2 _ 1024 * 1024 (2MB)
- `ALLOWED_MIME_TYPES`: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
- `VALID_IMAGE_FILENAME`: 'test-image.png'
- `INVALID_FILE_FILENAME`: 'document.pdf'

---

## 5. Catatan Penting

1. **Upload file membutuhkan File object.** Playwright mendukung upload file melalui `page.locator('input[type="file"]').setInputFiles(path)`. File harus benar-benar ada di filesystem. Gunakan `file-helper.ts` untuk membuat file dummy di `os.tmpdir()`.

2. **Validasi tipe dan ukuran.** Sistem memvalidasi tipe MIME dan ukuran file sebelum upload. Gunakan file dengan tipe tidak didukung dan file >2MB untuk test error.

3. **Multipart form data.** Upload menggunakan format multipart/form-data. Verifikasi request menggunakan `page.waitForResponse` dan periksa Content-Type.

4. **Media get by ID.** Setelah upload, sistem mengembalikan ID media. Gunakan ID ini untuk menguji get dan delete.

5. **Delete dengan konfirmasi.** Hapus media mungkin memerlukan konfirmasi melalui modal. Test harus menangani dialog/modal konfirmasi.

6. **Test isolation.** Upload media di setiap test (bukan reuse media dari test lain). Hapus media yang sudah dibuat setelah test selesai (di `test.afterEach` atau gunakan akun test yang dibersihkan periodik).

7. **Flakiness prevention.** Upload membutuhkan waktu. Gunakan `waitForResponse` untuk menunggu response upload selesai. Jangan gunakan `page.waitFor(timeout)`.

8. **Selector priority.** Komponen `FileUploader` dari shared UI mungkin memiliki data-testid. Jika tidak tersedia, gunakan `input[type="file"]` sebagai fallback.

9. **Daftar POM yang diperlukan:**
   - Halaman yang memiliki fitur upload media (profile/company - sudah ada di POM profile/company)
   - `tests/pages/components/toast.component.ts` (shared)
   - `tests/pages/components/modal.component.ts` (shared)
   - `tests/utils/file-helper.ts` (helper file generation)

---

## 6. Ringkasan Skenario

| Bagian           | Jumlah Skenario | Kode Prefix |
| ---------------- | --------------- | ----------- |
| Media Upload     | 4               | MD-01–MD-04 |
| Media Operations | 3               | MD-05–MD-07 |
| **Total**        | **7**           | MD-01–MD-07 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario            | Alasan                                  |
| --------- | ------------------- | --------------------------------------- |
| P0        | MD-01, MD-05        | Core flow: upload sukses, tampil media  |
| P1        | MD-02, MD-03, MD-06 | Validasi tipe, ukuran, hapus media      |
| P2        | MD-04, MD-07        | Multipart format, media tidak ditemukan |

# Coverage Notification — GroApp Access E2E

> **Dokumen ini mencakup rencana pengujian E2E untuk fitur Notification pada GroApp Access.**
> Meliputi: daftar notifikasi (infinite scroll), detail modal, tandai sudah dibaca, filter kategori, aksi undangan (terima/tolak).

---

## 1. Pendahuluan

Fitur Notification memungkinkan pengguna melihat notifikasi sistem, termasuk undangan perusahaan, pembaruan role, dan pemberitahuan lainnya. Notifikasi diakses melalui route `/notifications/*` yang dilindungi `AuthGuard` dalam `AppMainAccessLayout`. Daftar notifikasi mendukung infinite scroll (paginasi), filter berdasarkan kategori, dan aksi langsung untuk notifikasi undangan (terima/tolak). Badge notifikasi belum dibaca ditampilkan di navbar.

Sumber kode: `src/features/notification/`

**Arsitektur Notification:**

| Layer          | Path                       | Fungsi                                     |
| -------------- | -------------------------- | ------------------------------------------ |
| Presentation   | `presentation/pages/`      | Halaman notifikasi                         |
| Presentation   | `presentation/components/` | Notification list card                     |
| Presentation   | `presentation/modals/`     | Detail modal, invitation rejection, filter |
| Presentation   | `presentation/forms/`      | Filter schema (Zod)                        |
| Presentation   | `presentation/state/`      | Global + page + modal stores               |
| Infrastructure | `infrastructure/`          | API, DTO, endpoint, mappers, repository    |
| Domain         | `domain/`                  | Types, failures, constants, rules          |
| Application    | `application/`             | 5 use cases                                |

**Routes:**

| Path                        | Layout              | Deskripsi                   |
| --------------------------- | ------------------- | --------------------------- |
| `/notifications`            | AppMainAccessLayout | Daftar notifikasi           |
| `/notifications?category=X` | AppMainAccessLayout | Daftar notifikasi terfilter |

**Tipe Notifikasi:**

- `invitation` — Undangan bergabung perusahaan
- `role_changed` — Perubahan role
- `system` — Pemberitahuan sistem

---

## 2. Struktur File Test

```text
tests/
├── pages/notification/
│   └── notification-list.page.ts            # Halaman daftar notifikasi
├── specs/notification/
│   ├── notification-list.spec.ts            # Test daftar & filter notifikasi
│   └── invitation-action.spec.ts            # Test aksi undangan
├── data/
│   └── notification.data.ts                 # Factory test data notifikasi
└── fixtures/
    └── auth.fixture.ts                      # Fixture autentikasi
```

---

## 3. Playwright E2E

### 3.1 Notification List

Daftar notifikasi ditampilkan dalam bentuk kartu. Mendukung infinite scroll untuk memuat lebih banyak notifikasi saat scroll ke bawah. Menampilkan empty state jika tidak ada notifikasi. Loading state menggunakan skeleton.

| #     | Nama Test                                             | Assertion                                      |
| ----- | ----------------------------------------------------- | ---------------------------------------------- |
| NT-01 | menampilkan daftar notifikasi                         | Kartu notifikasi visible                       |
| NT-02 | menampilkan infinite scroll saat scroll ke bawah      | Notifikasi tambahan muncul, tidak ada duplikat |
| NT-03 | menampilkan empty state saat tidak ada notifikasi     | Komponen "Tidak ada notifikasi" visible        |
| NT-04 | menampilkan loading state saat memuat data            | Skeleton/loader terlihat                       |
| NT-05 | menampilkan loading more saat scroll memuat lagi      | Loading indicator di bagian bawah list         |
| NT-06 | menampilkan badge notifikasi belum dibaca             | Badge count > 0 di navbar                      |
| NT-07 | badge tidak muncul saat semua notifikasi sudah dibaca | Badge tidak visible atau count = 0             |

**POM:** `notification-list.page.ts`

**Selectors:**

- `notificationCards = page.getByTestId('notification-card')`
- `notificationCard = (index: number) => page.getByTestId('notification-card').nth(index)`
- `notificationTitle = (index: number) => page.getByTestId(`notification-title-${index}`)`
- `notificationTime = (index: number) => page.getByTestId(`notification-time-${index}`)`
- `emptyState = page.getByTestId('empty-state')`
- `skeleton = page.getByTestId('notification-skeleton')`
- `loadingMoreIndicator = page.getByTestId('loading-more')`
- `notificationBadge = page.getByTestId('notification-badge')`
- `unreadDot = (index: number) => page.getByTestId(`unread-dot-${index}`)`
- `scrollContainer = page.getByTestId('notification-scroll-container')`

**Assertions:**

- `expect(notificationCards.first()).toBeVisible()`
- `expect(notificationCards).toHaveCountGreaterThan(0)`
- `expect(emptyState).toBeVisible()`
- `expect(notificationBadge).toHaveText(/[1-9]/)`
- `expect(notificationBadge).not.toBeVisible()` (after mark all read)

### 3.2 Notification Detail

Modal detail notifikasi muncul saat kartu notifikasi diklik. Menampilkan judul, pesan, waktu, dan tombol aksi (jika undangan). Bisa ditutup.

| #     | Nama Test                                           | Assertion                                      |
| ----- | --------------------------------------------------- | ---------------------------------------------- |
| NT-08 | membuka modal detail notifikasi dengan klik         | Modal visible, judul dan pesan sesuai          |
| NT-09 | menutup modal detail dengan tombol close            | Modal tidak visible                            |
| NT-10 | menutup modal detail dengan klik backdrop           | Modal tidak visible                            |
| NT-11 | menandai notifikasi sudah dibaca saat detail dibuka | Unread dot hilang, badge berkurang             |
| NT-12 | menampilkan konten sesuai tipe notifikasi           | Undangan menampilkan tombol aksi, sistem tidak |

**POM:** `notification-list.page.ts`

**Selectors (Modal Detail):**

- `detailModal = page.getByTestId('notification-detail-modal')`
- `detailTitle = page.getByTestId('detail-title')`
- `detailMessage = page.getByTestId('detail-message')`
- `detailTime = page.getByTestId('detail-time')`
- `detailCloseButton = page.getByTestId('modal-close')`
- `detailBackdrop = page.locator('.modal-backdrop')`
- `detailActionButton = page.getByTestId('detail-action-button')`

**Assertions:**

- `expect(detailModal).toBeVisible()`
- `expect(detailCloseButton).toBeVisible()`
- `expect(detailTitle).toHaveText(/.+/)`

### 3.3 Notification Filter

Filter notifikasi berdasarkan kategori: semua, undangan, perubahan role, sistem.

| #     | Nama Test                                 | Assertion                                        |
| ----- | ----------------------------------------- | ------------------------------------------------ |
| NT-13 | memfilter notifikasi berdasarkan kategori | Hanya notifikasi dengan kategori terpilih tampil |
| NT-14 | mengganti filter kategori                 | Daftar notifikasi berubah sesuai kategori        |
| NT-15 | memilih "Semua" setelah filter aktif      | Semua notifikasi muncul kembali                  |
| NT-16 | filter kategori dengan hasil kosong       | Empty state "Tidak ada notifikasi" visible       |
| NT-17 | menampilkan indikator kategori aktif      | Kategori yang dipilih memiliki style aktif       |

**POM:** `notification-list.page.ts`

**Selectors:**

- `filterAllButton = page.getByRole('button', { name: /semua/i })`
- `filterInvitationButton = page.getByRole('button', { name: /undangan/i })`
- `filterRoleButton = page.getByRole('button', { name: /role/i })`
- `filterSystemButton = page.getByRole('button', { name: /sistem/i })`
- `activeFilterIndicator = page.getByTestId('active-filter')`

**Assertions:**

- `expect(activeFilterIndicator).toHaveText(/undangan/i)`
- `expect(notificationCards).toHaveCount(0)` (filter result empty)
- `expect(emptyState).toBeVisible()`

### 3.4 Invitation Actions

Notifikasi undangan menampilkan tombol aksi: Terima atau Tolak. Aksi Terima mungkin memerlukan pemilihan workspace terlebih dahulu. Konfirmasi dialog muncul sebelum aksi dieksekusi.

| #     | Nama Test                                                      | Assertion                                                |
| ----- | -------------------------------------------------------------- | -------------------------------------------------------- |
| NT-18 | menampilkan tombol aksi pada notifikasi undangan               | Tombol "Terima" dan "Tolak" visible                      |
| NT-19 | menerima undangan dari notifikasi                              | Undangan diterima, notifikasi berubah                    |
| NT-20 | menolak undangan dari notifikasi                               | Konfirmasi dialog muncul, undangan ditolak               |
| NT-21 | membatalkan penolakan undangan                                 | Dialog ditutup, undangan tetap aktif                     |
| NT-22 | memilih workspace sebelum menerima undangan                    | Workspace selector muncul, undangan diterima             |
| NT-23 | menampilkan error saat menerima undangan yang sudah kadaluarsa | Error "Undangan telah kedaluwarsa"                       |
| NT-24 | menampilkan error saat menerima undangan yang sudah diterima   | Error "Undangan sudah diterima"                          |
| NT-25 | menampilkan loading state saat memproses aksi undangan         | Tombol menunjukkan spinner, disabled                     |
| NT-26 | notifikasi berubah status setelah aksi                         | Kartu notifikasi menunjukkan status "Diterima"/"Ditolak" |

**POM:** `notification-list.page.ts`

**Selectors (Invitation Actions):**

- `acceptButton = (index: number) => page.getByTestId(`accept-btn-${index}`)`
- `rejectButton = (index: number) => page.getByTestId(`reject-btn-${index}`)`
- `confirmDialog = page.getByTestId('confirm-dialog')`
- `confirmAcceptButton = page.getByRole('button', { name: /ya, terima/i })`
- `confirmRejectButton = page.getByRole('button', { name: /ya, tolak/i })`
- `cancelDialogButton = page.getByRole('button', { name: /batal/i })`
- `workspaceSelector = page.getByTestId('workspace-selector')`
- `workspaceOption = (name: string) => page.getByRole('option', { name })`
- `invitationStatusBadge = (index: number) => page.getByTestId(`invitation-status-${index}`)`

**Assertions:**

- `expect(acceptButton(0)).toBeVisible()`
- `expect(rejectButton(0)).toBeVisible()`
- `expect(confirmDialog).toBeVisible()`
- `expect(invitationStatusBadge(0)).toHaveText(/diterima|ditolak/i)`

---

## 4. Test Data

| Factory                                   | Fungsi                                    | Fields Penting                          |
| ----------------------------------------- | ----------------------------------------- | --------------------------------------- |
| `generateNotificationPayload()`           | Membuat payload notifikasi                | type, title, message, isRead, createdAt |
| `generateInvitationNotificationPayload()` | Membuat payload notifikasi undangan       | type: "invitation", companyName, role   |
| `generateRoleChangeNotificationPayload()` | Membuat payload notifikasi perubahan role | type: "role_changed", oldRole, newRole  |

**Contoh factory:**

```typescript
function generateInvitationNotificationPayload(overrides?: Partial<InvitationNotification>): InvitationNotification {
  return {
    id: `notif-${Date.now()}`,
    type: "invitation",
    title: "Undangan Bergabung",
    message: "Anda diundang bergabung dengan PT Maju Jaya sebagai Admin",
    isRead: false,
    createdAt: new Date().toISOString(),
    invitationId: `inv-${Date.now()}`,
    companyName: "PT Maju Jaya",
    roleName: "Admin",
    ...overrides,
  };
}
```

**Constants khusus:**

- `INVITATION_CATEGORY`: 'invitation'
- `ROLE_CHANGED_CATEGORY`: 'role_changed'
- `SYSTEM_CATEGORY`: 'system'
- `NOTIFICATION_PAGE_SIZE`: 10 (items per page untuk infinite scroll)

---

## 5. Catatan Penting

1. **Infinite scroll.** Daftar notifikasi menggunakan infinite scroll. Test harus melakukan scroll ke bawah dan memverifikasi notifikasi baru muncul. Gunakan `scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight)` untuk trigger load more. Jangan gunakan `page.waitFor(timeout)`.

2. **Badge unread count.** Badge notifikasi di navbar harus diperbarui saat notifikasi dibaca. Test harus memverifikasi badge count berkurang setelah membuka detail atau menandai sudah dibaca.

3. **Invitation actions membutuhkan API mock.** Aksi terima/tolak undangan memanggil endpoint API. Gunakan `page.waitForResponse` untuk menunggu response dan verifikasi status. Jangan gunakan data statis.

4. **Filter kategori.** Filter notifikasi mungkin menggunakan query parameter URL atau filter client-side. Verifikasi apakah filter mengubah URL (`/notifications?category=invitation`) untuk menentukan pendekatan test.

5. **Cooldown tidak ada di notifikasi.** Berbeda dengan verifikasi OTP, notifikasi tidak memiliki cooldown. Aksi bisa dilakukan berulang.

6. **Loading state.** Infinite scroll memiliki dua loading state: initial load (skeleton) dan load more (indicator di bottom). Keduanya harus diverifikasi.

7. **Selector priority.** Data-testid adalah priority pertama (`notification-card`, `notification-badge`, `accept-btn`). Fallback ke `getByRole` untuk tombol aksi.

8. **Test isolation.** Setiap test harus independen. Gunakan `test.beforeEach` untuk navigasi ke `/notifications`. Gunakan factory untuk membuat payload notifikasi unik per test.

9. **Flakiness prevention.** Hindari `page.waitFor(timeout)`. Gunakan `expect(notificationCards.first()).toBeVisible()` untuk menunggu notifikasi muncul. Untuk infinite scroll, gunakan `expect().toPass()` untuk polling elemen baru.

10. **Daftar POM yang diperlukan:**
    - `tests/pages/notification/notification-list.page.ts`
    - `tests/pages/components/modal.component.ts` (shared)
    - `tests/pages/components/toast.component.ts` (shared)
    - `tests/pages/layout/main-layout.page.ts` (badge di navbar)

---

## 6. Ringkasan Skenario

| Bagian              | Jumlah Skenario | Kode Prefix |
| ------------------- | --------------- | ----------- |
| Notification List   | 7               | NT-01–NT-07 |
| Notification Detail | 5               | NT-08–NT-12 |
| Notification Filter | 5               | NT-13–NT-17 |
| Invitation Actions  | 9               | NT-18–NT-26 |
| **Total**           | **26**          | NT-01–NT-26 |

---

## 7. Matriks Prioritas

| Prioritas | Skenario                   | Alasan                                            |
| --------- | -------------------------- | ------------------------------------------------- |
| P0        | NT-01, NT-06, NT-18, NT-19 | Core flow: lihat notifikasi, badge, aksi undangan |
| P1        | NT-08, NT-11, NT-13, NT-20 | Detail, mark read, filter, tolak undangan         |
| P2        | NT-03, NT-04, NT-05, NT-25 | Empty, loading states                             |
| P3        | NT-16, NT-17, NT-21        | Edge case filter, cancel dialog                   |

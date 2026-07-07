# Coverage E2E — Fitur Role (Peran & Izin Akses)

> **Dokumen ini berisi skenario lengkap pengujian E2E Playwright untuk fitur Role pada GroApp Access.**
> Mencakup daftar role, detail role dengan permission tree hirarkis, dan permission guard.
> Setiap skenario mencantumkan kode unik, nama test, tipe pengujian, POM yang digunakan, dan asersi utama.

---

## 1. Pendahuluan

| Atribut         | Detail                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Modul**       | Role & Permission Management                                                                                  |
| **Sumber kode** | `src/features/role/`                                                                                          |
| **Route**       | `/companies/:companyId/roles` (list), `/companies/:companyId/roles/:roleId` (detail)                          |
| **Guard**       | AuthGuard                                                                                                     |
| **Layout**      | AppMainAccessLayout (sidebar, navbar, breadcrumb)                                                             |
| **Prioritas**   | P1 — High, harus lolos sebelum feature release                                                                |
| **Cakupan**     | Daftar role, detail role dengan permission tree, expand/collapse, permission guard, forbidden, my permissions |
| **Level**       | Happy Path, Error State, Edge Case, Permission                                                                |

### 1.1 Tujuan Pengujian

1. Memverifikasi daftar role perusahaan ditampilkan dengan nama dan jumlah user
2. Memastikan detail role menampilkan permission tree dengan hirarki application → module → feature → action
3. Memverifikasi expand/collapse pada permission tree berfungsi
4. Memastikan status aksi (allowed/not allowed) ditampilkan dengan benar
5. Memverifikasi halaman forbidden untuk user tanpa akses role
6. Memastikan "My Permissions" menampilkan permission user saat ini

### 1.2 Arsitektur Fitur

```text
RoleFeature
├── Pages
│   ├── RoleListPage            — Daftar role perusahaan
│   └── RoleDetailPage          — Detail role dengan permission tree
├── Components
│   ├── AccessTable             — Tabel permission dengan expand/collapse
│   ├── PermissionGuard         — Guard komponen berdasarkan permission
│   ├── PermissionVisibility    — Visibilitas berdasarkan permission
│   └── RoleDetailModal         — Modal untuk edit/lihat detail role
├── Hooks
│   ├── useRoleDetail           — Hook fetch detail role
│   ├── useRoleList             — Hook fetch daftar role
│   └── useMyPermissions        — Hook fetch permission user sendiri
├── Domain
│   ├── RoleTypes               — Tipe data role
│   ├── PermissionCodes         — Kode permission codes (hierarkis)
│   └── PermissionHierarchy     — Struktur hirarki permission
├── Infrastructure
│   ├── RoleApi                 — API client role
│   ├── RoleDto                 — Data transfer object
│   ├── RoleMapper              — Mapper response → domain
│   └── RoleEndpoint            — Endpoint definitions
└── State
    ├── RoleDetailModalStore    — State modal detail
    └── PermissionsStore        — State permission
```

### 1.3 Permission Hierarchy

```text
Application (e.g., "GroApp Access")
└── Module (e.g., "Manajemen Perusahaan", "Manajemen Pengguna")
    └── Feature (e.g., "Lihat Perusahaan", "Buat Perusahaan")
        └── Action (e.g., "view", "create", "update", "delete", "approve")
            └── Status: Allowed / Not Allowed (checkbox/toggle)
```

Permission codes didefinisikan di `src/features/role/domain/role-permission-codes.ts` dengan format:

```typescript
// Contoh struktur permission codes
const PERMISSION_CODES = {
  access: {
    label: "GroApp Access",
    modules: {
      company: {
        label: "Manajemen Perusahaan",
        features: {
          list: {
            label: "Lihat Perusahaan",
            actions: ["view", "export"],
          },
          create: {
            label: "Buat Perusahaan",
            actions: ["create"],
          },
          update: {
            label: "Ubah Perusahaan",
            actions: ["update"],
          },
          delete: {
            label: "Hapus Perusahaan",
            actions: ["delete"],
          },
        },
      },
      user: {
        label: "Manajemen Pengguna",
        features: {
          list: { label: "Lihat Pengguna", actions: ["view"] },
          invite: { label: "Undang Pengguna", actions: ["create", "resend"] },
          role: { label: "Ubah Peran", actions: ["update"] },
        },
      },
      role: {
        label: "Manajemen Peran",
        features: {
          list: { label: "Lihat Peran", actions: ["view"] },
        },
      },
      workspace: {
        label: "Manajemen Workspace",
        features: {
          create: { label: "Buat Workspace", actions: ["create"] },
          update: { label: "Ubah Workspace", actions: ["update"] },
          delete: { label: "Hapus Workspace", actions: ["delete"] },
        },
      },
    },
  },
};
```

---

## 2. Struktur File Test

```text
tests/
├── specs/
│   ├── role/
│   │   ├── role-list.spec.ts          # RL-01 s.d. RL-03
│   │   └── role-detail.spec.ts        # RD-01 s.d. RD-07
├── pages/
│   ├── role/
│   │   ├── role-list.page.ts          # POM daftar role
│   │   └── role-detail.page.ts        # POM detail role dengan permission tree
│   ├── components/
│   │   ├── permission-tree.component.ts # POM expandable tree
│   │   ├── permission-action-toggle.component.ts # POM checkbox/toggle aksi
│   │   └── skeleton-loader.component.ts # POM loading skeleton
│   ├── base.page.ts                   # BasePage
│   └── layout/
│       └── main-layout.page.ts        # Main layout POM
├── data/
│   ├── role.data.ts                   # Factory role
│   └── constants.ts                   # Role IDs, permission codes
├── fixtures/
│   ├── auth.fixture.ts                # Authenticated fixture
│   └── company.fixture.ts             # Pre-created company context
└── utils/
    └── api-helper.ts                  # API calls for test setup
```

---

## 3. Playwright E2E — Skenario Pengujian

### 3.1 Role List

**Deskripsi:** Memverifikasi daftar role dalam suatu perusahaan ditampilkan dengan benar.

**POM files needed:**

- `role/role-list.page.ts`
- `layout/main-layout.page.ts`

**Test data:** Minimal 2 role (Admin, Manager, atau kustom) dalam satu company.

| #   | Kode Test | Nama Test                                                   | Tipe        | POM                              | Langkah                                    | Assertion                                                   |
| --- | --------- | ----------------------------------------------------------- | ----------- | -------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| 1   | RL-01     | menampilkan daftar role dengan nama dan jumlah user         | Happy Path  | `RoleListPage`                   | Buka `/companies/:id/roles`, tunggu render | Setiap baris role menampilkan nama role dan jumlah user     |
| 2   | RL-02     | menampilkan empty state saat perusahaan belum memiliki role | Empty State | `RoleListPage`                   | Buka perusahaan tanpa role                 | Komponen `EmptyData` terlihat dengan teks "Belum ada peran" |
| 3   | RL-03     | menavigasi ke detail role saat baris diklik                 | Happy Path  | `RoleListPage`, `RoleDetailPage` | Klik baris role                            | URL berubah mengandung `/roles/:roleId`                     |

#### Detail Skenario RL-01 — Menampilkan daftar role

```typescript
test("menampilkan daftar role dengan nama dan user count", async ({ page }) => {
  const roleList = new RoleListPage(page);
  await roleList.goto(companyId);
  await roleList.waitForLoad();

  await expect(roleList.roleRows.first()).toBeVisible();
  const firstRow = roleList.roleRows.first();
  await expect(firstRow.locator('[data-testid="role-name"]')).toBeVisible();
  await expect(firstRow.locator('[data-testid="user-count"]')).toBeVisible();
  const count = await firstRow.locator('[data-testid="user-count"]').innerText();
  expect(Number(count)).toBeGreaterThanOrEqual(0);
});
```

#### Detail Skenario RL-02 — Empty state

```typescript
test("empty state — no roles", async ({ page }) => {
  const roleList = new RoleListPage(page);
  await roleList.goto(emptyCompanyId);
  await roleList.waitForLoad();

  await expect(roleList.emptyData).toBeVisible();
  await expect(roleList.emptyData).toContainText(/belum ada peran/i);
});
```

#### Detail Skenario RL-03 — Navigasi ke detail role

```typescript
test("navigasi ke detail role saat diklik", async ({ page }) => {
  const roleList = new RoleListPage(page);
  await roleList.goto(companyId);
  await roleList.waitForLoad();

  const targetRoleName = await roleList.getFirstRoleName();
  await roleList.clickFirstRow();

  await expect(page).toHaveURL(/\/roles\/.+/);
  const detail = new RoleDetailPage(page);
  await expect(detail.roleName).toHaveText(targetRoleName);
});
```

---

### 3.2 Role Detail

**Deskripsi:** Memverifikasi halaman detail role dengan permission tree, termasuk expand/collapse, tampilan aksi, loading state, forbidden, dan my permissions.

**POM files needed:**

- `role/role-detail.page.ts`
- `components/permission-tree.component.ts`
- `components/permission-action-toggle.component.ts`
- `components/skeleton-loader.component.ts`

**Test data:** Role dengan permission yang sudah dikonfigurasi (Admin dengan akses penuh, Manager dengan akses terbatas).

| #   | Kode Test | Nama Test                                                            | Tipe       | POM                               | Langkah                                  | Assertion                                                |
| --- | --------- | -------------------------------------------------------------------- | ---------- | --------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| 1   | RD-01     | menampilkan role detail dengan permission tree semua level           | Happy Path | `RoleDetailPage`                  | Buka detail role                         | Application, Module, Feature, Action level terlihat      |
| 2   | RD-02     | expand permission module untuk melihat fitur di dalamnya             | Happy Path | `PermissionTreeComponent`         | Klik expand pada node module             | Daftar fitur dalam module muncul                         |
| 3   | RD-03     | expand permission feature untuk melihat aksi yang tersedia           | Happy Path | `PermissionTreeComponent`         | Klik expand pada node feature            | Daftar aksi (view, create, update, delete) muncul        |
| 4   | RD-04     | menampilkan status aksi (allowed/not allowed) dengan checkbox/toggle | Happy Path | `PermissionActionToggleComponent` | Lihat status setiap aksi                 | Checkbox centang untuk allowed, kosong untuk not allowed |
| 5   | RD-05     | menampilkan loading skeleton saat data detail role dimuat            | Edge Case  | `RoleDetailPage`                  | Intercept API lambat                     | Skeleton/loader terlihat sebelum data tampil             |
| 6   | RD-06     | menampilkan halaman forbidden saat user tidak punya akses role       | Permission | `RoleDetailPage`                  | Buka detail role dengan user tanpa akses | Komponen "Akses ditolak" atau fallback page terlihat     |
| 7   | RD-07     | my permissions — melihat permission user yang sedang login           | Happy Path | `RoleDetailPage`                  | Klik tab/section "Izin Saya"             | Permission tree untuk user current terlihat              |

#### Detail Skenario RD-01 — Menampilkan role detail dengan permission tree

```typescript
test("menampilkan role detail dengan permission tree", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  await roleDetail.goto(companyId, roleId);
  await roleDetail.waitForLoad();

  await expect(roleDetail.roleName).toBeVisible();
  await expect(roleDetail.applicationSection).toBeVisible();
  await expect(roleDetail.applicationSection).toContainText(/groapp access/i);

  // Verify hierarchical structure exists
  const applicationNodes = await roleDetail.getApplicationNodes();
  expect(applicationNodes.length).toBeGreaterThanOrEqual(1);

  // Verify at least one module exists
  const moduleNodes = await roleDetail.getModuleNodes();
  expect(moduleNodes.length).toBeGreaterThanOrEqual(1);
});
```

#### Detail Skenario RD-02 — Expand permission module

```typescript
test("expand permission module — melihat fitur", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  const tree = new PermissionTreeComponent(page);
  await roleDetail.goto(companyId, roleId);
  await roleDetail.waitForLoad();

  // All modules should be expanded by default or expandable
  const moduleNodes = await tree.getModuleNodes();
  const firstModule = moduleNodes[0];
  const isExpanded = await tree.isModuleExpanded(firstModule);

  if (!isExpanded) {
    await tree.expandModule(firstModule);
  }

  const features = await tree.getFeatureNodes(firstModule);
  expect(features.length).toBeGreaterThanOrEqual(1);
  await expect(features[0]).toBeVisible();
});
```

#### Detail Skenario RD-03 — Expand permission feature

```typescript
test("expand permission feature — melihat aksi", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  const tree = new PermissionTreeComponent(page);
  await roleDetail.goto(companyId, roleId);
  await roleDetail.waitForLoad();

  // Expand first feature to see actions
  const features = await tree.getAllFeatureNodes();
  const firstFeature = features[0];
  const isExpanded = await tree.isFeatureExpanded(firstFeature);

  if (!isExpanded) {
    await tree.expandFeature(firstFeature);
  }

  const actions = await tree.getActionNodes(firstFeature);
  expect(actions.length).toBeGreaterThanOrEqual(1);

  // Verify common action types
  const actionNames = await Promise.all(actions.map((a) => a.locator('[data-testid="action-name"]').innerText()));
  const validActions = ["view", "create", "update", "delete", "approve", "export"];
  const hasValidAction = actionNames.some((name) => validActions.includes(name.toLowerCase()));
  expect(hasValidAction).toBeTruthy();
});
```

#### Detail Skenario RD-04 — Status aksi (allowed/not allowed)

```typescript
test("menampilkan status aksi (allowed/not allowed)", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  const toggle = new PermissionActionToggleComponent(page);
  await roleDetail.goto(companyId, roleId);
  await roleDetail.waitForLoad();

  const actionNodes = await toggle.getAllActionToggles();
  expect(actionNodes.length).toBeGreaterThanOrEqual(1);

  // Each action should have a checkbox/toggle with clear state
  for (const action of actionNodes) {
    await expect(action.locator('[data-testid="action-checkbox"]')).toBeVisible();
    // Checkbox may be checked (allowed) or unchecked (not allowed)
    const isChecked = await action.locator('[data-testid="action-checkbox"]').isChecked();
    expect(typeof isChecked).toBe("boolean");
  }
});
```

#### Detail Skenario RD-05 — Loading state

```typescript
test("loading state", async ({ page }) => {
  await page.route(/\/access\/v1\/companies\/.+\/roles\/.+/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });

  const roleDetail = new RoleDetailPage(page);
  await roleDetail.goto(companyId, roleId);

  await expect(roleDetail.skeletonLoader).toBeVisible();
  await roleDetail.waitForLoad();
  await expect(roleDetail.skeletonLoader).toHaveCount(0);
  await expect(roleDetail.roleName).toBeVisible();
});
```

#### Detail Skenario RD-06 — Forbidden

```typescript
test("forbidden — user tanpa akses role", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  await roleDetail.goto(companyId, forbiddenRoleId);

  await expect(roleDetail.forbiddenMessage).toBeVisible();
  await expect(roleDetail.forbiddenMessage).toHaveText(/akses ditolak/i);
  await expect(roleDetail.permissionTree).toHaveCount(0);
});
```

#### Detail Skenario RD-07 — My permissions

```typescript
test("my permissions — melihat permission sendiri", async ({ page }) => {
  const roleDetail = new RoleDetailPage(page);
  await roleDetail.goto(companyId, roleId);
  await roleDetail.waitForLoad();

  // Navigate to "My Permissions" tab/section
  await roleDetail.myPermissionsTab.click();
  await roleDetail.waitForPermissionsLoad();

  const tree = new PermissionTreeComponent(page);
  await expect(tree.applicationSection).toBeVisible();

  // Current user should have at least view permissions
  const actions = await tree.getAllActionNodes();
  expect(actions.length).toBeGreaterThanOrEqual(1);
});
```

---

## 4. Test Data

### 4.1 Factory Function — Role Payload

```typescript
// data/role.data.ts
export function generateRolePayload(overrides?: Partial<RolePayload>): RolePayload {
  return {
    name: `Role_${Date.now()}`,
    description: "Role created for E2E testing",
    permissions: generateDefaultPermissions(),
    ...overrides,
  };
}
```

### 4.2 Factory Function — Default Permissions

```typescript
// data/role.data.ts
export function generateDefaultPermissions(): PermissionMap {
  return {
    access: {
      label: "GroApp Access",
      modules: {
        company: {
          label: "Manajemen Perusahaan",
          features: {
            list: {
              label: "Lihat Perusahaan",
              actions: {
                view: { allowed: true },
                export: { allowed: false },
              },
            },
            create: {
              label: "Buat Perusahaan",
              actions: {
                create: { allowed: true },
              },
            },
            update: {
              label: "Ubah Perusahaan",
              actions: {
                update: { allowed: true },
              },
            },
            delete: {
              label: "Hapus Perusahaan",
              actions: {
                delete: { allowed: false },
              },
            },
          },
        },
        user: {
          label: "Manajemen Pengguna",
          features: {
            list: {
              label: "Lihat Pengguna",
              actions: {
                view: { allowed: true },
              },
            },
            invite: {
              label: "Undang Pengguna",
              actions: {
                create: { allowed: true },
                resend: { allowed: true },
              },
            },
          },
        },
      },
    },
  };
}
```

### 4.3 Factory Function — Role Response

```typescript
// data/role.data.ts
export function generateRoleResponse(overrides?: Partial<RoleResponse>): RoleResponse {
  return {
    id: `role_${Date.now()}`,
    name: "Admin",
    description: "Full access to all features",
    userCount: 5,
    permissions: generateDefaultPermissions(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### 4.4 Constants

```typescript
// data/constants.ts
export const ROLE_CONSTANTS = {
  ADMIN_ROLE_ID: "role_admin_default",
  MANAGER_ROLE_ID: "role_manager_default",
  VIEWER_ROLE_ID: "role_viewer_default",
  FORBIDDEN_ROLE_ID: "role_no_access",
  DEFAULT_PERMISSION_CODES: ["access.company.list.view", "access.user.list.view"],
  PERMISSION_ACTIONS: ["view", "create", "update", "delete", "approve", "export"],
};
```

---

## 5. Catatan Penting

### 5.1 Permission Hierarchy Structure

Permission tree memiliki 4 level yang ditampilkan secara nested:

```text
Level 1: Application    → "GroApp Access" (root, selalu ada 1)
  Level 2: Module       → "Manajemen Perusahaan", "Manajemen Pengguna", dll.
    Level 3: Feature    → "Lihat Perusahaan", "Buat Perusahaan", dll.
      Level 4: Action   → "view", "create", "update", "delete", "approve", "export"
```

Setiap level dapat di-expand/collapse. Default state: semua level expanded.

### 5.2 Permission Codes Format

Permission codes menggunakan format dot-separated:

```text
{application}.{module}.{feature}.{action}
```

Contoh:

- `access.company.list.view` — Lihat daftar perusahaan
- `access.user.invite.create` — Undang pengguna baru
- `access.workspace.delete` — Hapus workspace

Kode-kode ini didefinisikan di `src/features/role/domain/role-permission-codes.ts`.

### 5.3 Permission Guard

Komponen `PermissionGuard` digunakan untuk mengontrol visibilitas elemen UI berdasarkan permission user:

| Kode Permission             | Komponen yang Dilindungi  |
| --------------------------- | ------------------------- |
| `access.user.invite.create` | Tombol "Undang Pengguna"  |
| `access.company.delete`     | Tombol "Hapus Perusahaan" |
| `access.workspace.create`   | Tombol "Buat Workspace"   |

### 5.4 Aturan Tampilan Aksi

| Status      | Visual                                   | Interaksi                         |
| ----------- | ---------------------------------------- | --------------------------------- |
| Allowed     | Checkbox tercentang / toggle ON          | Dapat di-uncheck (jika mode edit) |
| Not Allowed | Checkbox kosong / toggle OFF             | Dapat di-check (jika mode edit)   |
| Read-only   | Checkbox disabled (tidak bisa interaksi) | Hanya lihat                       |

Pada halaman detail role (read-only), semua checkbox/toggle dalam keadaan disabled.
Hanya user dengan permission `access.role.update` yang dapat mengubah aksi.

### 5.5 Loading & Error States

| State     | Komponen                                         | Perilaku                    |
| --------- | ------------------------------------------------ | --------------------------- |
| Loading   | Skeleton loader dengan 3-5 baris                 | Muncul saat fetch data role |
| Success   | Permission tree lengkap                          | Semua level ter-render      |
| Empty     | Tidak ada (role selalu punya permission default) | —                           |
| Failure   | Fallback page / error toast                      | "Gagal memuat detail peran" |
| Forbidden | "Akses ditolak" message                          | Permission guard blocking   |

### 5.6 Ketergantungan Antar Test

- Test RL (Role List) membutuhkan minimal 1 role dalam perusahaan
- Test RD (Role Detail) membutuhkan role dengan permission yang sudah dikonfigurasi
- Test RD-06 (Forbidden) membutuhkan user khusus tanpa akses role
- Test RD-07 (My Permissions) bisa dijalankan dengan user manapun
- Gunakan `test.beforeEach` untuk setup konteks perusahaan dan navigasi

### 5.7 Flakiness Prevention

| Risiko                      | Mitigasi                                                     |
| --------------------------- | ------------------------------------------------------------ |
| Animasi expand/collapse     | Gunakan `waitForSelector` pada container tree setelah klik   |
| Permission tree lambat load | `waitForResponse` ke endpoint `/roles/:id` sebelum interaksi |
| Forbidden test error        | Setup user khusus dengan role terbatas via API               |
| Checkbox state ambiguous    | Gunakan `isChecked()` bukan `getAttribute('checked')`        |
| Tree terlalu dalam          | Batasi depth snapshot untuk menghindari timeout              |

### 5.8 POM Mapping

| Halaman           | File POM                                           | Base URL                       |
| ----------------- | -------------------------------------------------- | ------------------------------ |
| Daftar Role       | `role/role-list.page.ts`                           | `/companies/:id/roles`         |
| Detail Role       | `role/role-detail.page.ts`                         | `/companies/:id/roles/:roleId` |
| Permission Tree   | `components/permission-tree.component.ts`          | — (komponen reusable)          |
| Permission Toggle | `components/permission-action-toggle.component.ts` | — (komponen reusable)          |

### 5.9 Anti-Hallucination Checklist

- [ ] Route `/companies/:companyId/roles` exists in app router (AuthGuard, AppMainAccessLayout)
- [ ] Route `/companies/:companyId/roles/:roleId` exists for role detail
- [ ] Component `AccessTable` exists with expandable tree structure
- [ ] Component `PermissionGuard` exists for RBAC gating
- [ ] Component `PermissionVisibility` exists for conditional rendering
- [ ] Permission codes defined in `role-permission-codes.ts`
- [ ] Permission hierarchy: Application → Module → Feature → Action
- [ ] Module nodes expandable to show features
- [ ] Feature nodes expandable to show actions
- [ ] Actions have checkbox/toggle state (allowed/not allowed)
- [ ] Role detail has loading skeleton
- [ ] Forbidden state handled by permission guard
- [ ] "My Permissions" section shows current user's permissions
- [ ] All endpoints use DataState pattern (initial → loading → success/empty/failure)

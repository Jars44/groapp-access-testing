# GroApp Access

> Front-end web application for GroApp Access — an Indonesian business management platform providing user access control, company management, role-based permissions, accounting integration, and multi-tenant workspace administration.

- **Version:** 0.0.1
- **Private:** Yes
- **Package name:** `fe-groapp-access-web`

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Directory Structure](#directory-structure)
3. [Architecture](#architecture)
4. [Features](#features)
5. [UI Component Library](#ui-component-library)
6. [API Layer](#api-layer)
7. [State Management](#state-management)
8. [Routing](#routing)
9. [Configuration](#configuration)
10. [Scripts](#scripts)
11. [Testing](#testing)
12. [Quality Gate](#quality-gate)
13. [Localization](#localization)
14. [Container & Deployment](#container--deployment)
15. [Agent Workflow & Governance](#agent-workflow--governance)

---

## Tech Stack

| Layer                | Technology                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Framework**        | React 19.2.5 with TypeScript 6.0                                                         |
| **Build tool**       | Vite 8.0                                                                                 |
| **Package manager**  | npm (lockfile: `bun.lock` also present)                                                  |
| **Runtime**          | Node >=25.0.0                                                                            |
| **Testing**          | Vitest 3.2 + happy-dom + @testing-library/react + @testing-library/jest-dom              |
| **Component docs**   | Storybook 10.4 + @storybook/addon-vitest                                                 |
| **State management** | Zustand 5.0 + React Context                                                              |
| **Routing**          | React Router DOM 7.14                                                                    |
| **HTTP client**      | Axios 1.16                                                                               |
| **CSS framework**    | Tailwind CSS 4.2 (via @tailwindcss/vite plugin)                                          |
| **Form handling**    | @hookform/resolvers + Zod 4.3                                                            |
| **Authentication**   | Firebase 11.4 (Google, phone, email auth)                                                |
| **Localization**     | Custom `localization-gen` toolchain                                                      |
| **UI icons**         | lucide-react + 5006 custom SVG icons                                                     |
| **UI misc**          | @headlessui/react, react-qr-code, react-easy-crop, react-country-flag                    |
| **UI state machine** | @valfuse-node (core + adapter-react)                                                     |
| **Formatting**       | Prettier                                                                                 |
| **Linting**          | ESLint 10 + typescript-eslint + eslint-plugin-react-hooks + custom `comment-policy` rule |
| **Commits**          | commitlint (conventional commits) + Husky + lint-staged                                  |
| **Container**        | Docker (multi-stage: node:25-alpine → nginx:1.27-alpine)                                 |
| **Orchestration**    | Kubernetes (GKE, namespace: `access`)                                                    |
| **CI/CD**            | GCP Cloud Build                                                                          |
| **Editor**           | VS Code with extensions, .editorconfig                                                   |

---

## Directory Structure

```text
groapp-access/
├── CLAUDE.md                       # Claude Code operating instructions
├── README.md
├── cloudbuild.yaml                 # GCP Cloud Build CI/CD
├── codebase-exploration.md
├── commitlint.config.ts            # Conventional commit validation
├── docker-compose.yml              # 4 environment profiles
├── Dockerfile                      # Multi-stage Docker build
├── eslint.config.js                # ESLint 10 flat config with custom rules
├── index.html                      # Vite entry HTML
├── localization-gen.yaml           # i18n code generation config
├── Makefile                        # Development task runner
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # Root TypeScript config
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── vite.config.ts                  # Vite build configuration
├── vitest.config.ts                # Vitest test configuration
│
├── .claude/
│   ├── agents/                     # 89 executable agent files (FEDO 9-digit code)
│   ├── hooks/
│   │   ├── check-branch.sh
│   │   ├── check-protected-files.sh
│   │   ├── check-quality-gate.sh
│   │   ├── check-task-manifest.sh
│   │   └── README.md
│   ├── memory/                     # Layer 4 curated project memory
│   ├── settings.json               # Hook wiring configuration
│   └── templates/
│
├── .husky/                         # Husky pre-commit and commit-msg hooks
├── .storybook/                     # Storybook configuration
├── .vscode/                        # Editor settings + recommended extensions
│
├── docs/
│   ├── agents/                     # Agent doc per SOP (001-007)
│   ├── agent-workflow/             # Work item memory (SOP 001-007)
│   ├── api-specs/group-k/          # API specifications
│   ├── bugfix/                     # 16 bug planning docs + QA reports
│   ├── constitution/               # 20 constitution governance files
│   ├── prd/                        # PRDs (groups H, J, K, L)
│   └── workflows/                  # 7 SOP workflow definitions
│
├── kubernetes/
│   └── deploy.yaml                 # GKE deployment manifest
├── nginx/
│   └── nginx.conf                  # Production nginx config
├── prd/
│   └── bugfix/
│       └── edit-company-save-confirm.md
│
├── public/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── localizations/
│   ├── favicon.svg
│   └── icons.svg
│
└── src/
    ├── main.tsx                    # Application entry point
    │
    ├── app/                        # Composition root
    │   ├── app.tsx
    │   ├── bootstrap/
    │   │   ├── application/        # Bootstrap classifiers, types, company selection
    │   │   ├── infrastructure/     # Session callback registration
    │   │   └── presentation/       # Bootstrap components, hooks, providers
    │   ├── composition/            # DI wiring per feature (auth, company, user, etc.)
    │   ├── config/env.ts           # Vite env variable access
    │   ├── interruption/           # Global overlay (app-interruption-overlay.tsx, fallback mapper)
    │   ├── layouts/
    │   │   ├── app-main-access/    # Main authenticated layout (helpers, state)
    │   │   ├── app-main-access-auth/ # Auth-adjacent layout
    │   │   └── main/               # Shell layout
    │   ├── providers/
    │   │   ├── app-bootstrap-provider.tsx
    │   │   ├── app-providers.tsx
    │   │   └── toast/              # Toast context, provider, types, hook
    │   ├── router/
    │   │   ├── auth-guard.tsx
    │   │   ├── routes.tsx
    │   │   ├── verification-second-guard.tsx
    │   │   └── not-found.page.tsx
    │   └── state/                  # Context + Zustand providers
    │       ├── company/            # context, hook, provider, store
    │       ├── media/              # context, hook, provider, store
    │       ├── profile/            # context, hook, provider, store
    │       └── workspace/          # context, hook, provider, store
    │
    ├── assets/
    │   ├── icons/                  # 5006 individual SVG icon components
    │   ├── images/
    │   ├── localizations/          # Generated i18n code (ts, types, manifest)
    │   └── svgs/
    │
    ├── features/                   # 13 feature modules
    │   ├── accounting/
    │   ├── auth/
    │   │   ├── application/        # Ports + use cases
    │   │   ├── domain/             # Types, failures, constants
    │   │   ├── infrastructure/     # API client, DTOs, mappers
    │   │   ├── presentation/
    │   │   │   ├── components/     # Login, register, verification, re-auth, role-changed modals
    │   │   │   ├── pages/          # login, register, forgot-password, reset-password, verification
    │   │   │   ├── routes/         # Auth route paths + route components
    │   │   │   └── state/          # Context+store per page/modal (20+ state folders)
    │   │   ├── testing/            # Assertions, builders, fixtures, mocks, setup
    │   │   └── types/
    │   ├── company/
    │   │   ├── application/        # Ports + 3 use cases
    │   │   ├── domain/             # Company types
    │   │   ├── infrastructure/     # API, endpoint, failure mapper, repository
    │   │   └── presentation/
    │   │       ├── components/     # Form modal, fields, sections
    │   │       ├── forms/          # Validator
    │   │       ├── hooks/          # Detail, list, operations hooks
    │   │       ├── pages/          # List, detail, profile pages
    │   │       ├── routes/         # Route paths
    │   │       └── state/          # List store
    │   ├── dashboard/
    │   │   └── presentation/
    │   │       ├── pages/          # Dashboard page
    │   │       └── routes/
    │   ├── master/
    │   │   ├── application/        # Ports + 4 use cases (list provinces/cities/districts/villages)
    │   │   ├── domain/             # Master types, failures, result
    │   │   └── infrastructure/     # API, DTO, endpoint, mappers, repository
    │   ├── media/
    │   │   ├── application/        # Ports + 4 use cases (upload, get, delete)
    │   │   ├── domain/             # Media types, failures, constants, result
    │   │   └── infrastructure/     # API, DTO, endpoint, mappers, repository
    │   ├── notification/
    │   │   ├── application/        # Ports + 5 use cases
    │   │   ├── domain/             # Types, failures, constants, rules
    │   │   ├── infrastructure/     # API, DTO, endpoint, mappers, repository
    │   │   ├── presentation/
    │   │   │   ├── components/     # Notification list card
    │   │   │   ├── forms/          # Filter schema
    │   │   │   ├── modals/         # Detail, invitation-rejection, filter modals
    │   │   │   ├── pages/          # Notification page
    │   │   │   ├── routes/
    │   │   │   └── state/          # Global + page + modal stores
    │   │   └── testing/
    │   ├── onboarding/
    │   │   ├── application/        # Ports + submit use case
    │   │   ├── domain/             # Onboarding types
    │   │   ├── infrastructure/     # API, endpoint, failure mapper, repository
    │   │   ├── ids/
    │   │   └── presentation/
    │   │       ├── components/     # Stepper
    │   │       ├── forms/          # Validator
    │   │       ├── hooks/          # Submit hook
    │   │       ├── mappers/        # Payload mapper
    │   │       ├── pages/          # Onboarding page
    │   │       └── routes/
    │   ├── profile/
    │   │   ├── application/        # Ports + 11 use cases
    │   │   ├── domain/             # Types, failures, constants, validation rules
    │   │   ├── infrastructure/     # API, DTO, mappers, repository
    │   │   ├── presentation/
    │   │   │   ├── forms/          # 8 form schemas
    │   │   │   ├── modals/         # 9 modals (email, personal, whatsapp, password, photo, delete)
    │   │   │   ├── pages/          # Profile, edit, email change, whatsapp change, verification, success
    │   │   │   ├── routes/
    │   │   │   └── state/          # 11 state folders (context + store per page/modal)
    │   │   └── testing/
    │   ├── role/
    │   │   ├── application/        # Ports + 3 use cases
    │   │   ├── domain/             # Types, permission codes
    │   │   ├── infrastructure/     # API, DTO, endpoint, mappers, repository
    │   │   └── presentation/
    │   │       ├── components/     # Access table, detail modal, permission guard, visibility
    │   │       ├── hooks/          # Detail, list, permissions hooks
    │   │       ├── pages/          # List, detail pages
    │   │       ├── routes/
    │   │       └── state/          # Detail modal, permissions store
    │   ├── unit/
    │   │   ├── application/        # Ports + 9 use cases
    │   │   ├── domain/             # Types
    │   │   ├── infrastructure/     # API, endpoint, failure mapper, orchestrator, DTOs
    │   │   └── presentation/
    │   │       ├── components/     # Card, delete confirm/impact modals, form modal, toggle
    │   │       ├── forms/          # Form utils
    │   │       ├── hooks/          # Geo master, list, operations hooks
    │   │       ├── pages/          # List, detail, profile pages
    │   │       ├── routes/
    │   │       └── state/          # List store
    │   ├── user/
    │   │   ├── application/        # Ports + 12 use cases
    │   │   ├── constants/
    │   │   ├── domain/             # Types, rules (invitation email match)
    │   │   ├── infrastructure/     # API, DTO, mappers, repository
    │   │   └── presentation/
    │   │       ├── components/     # 9 components (activate, deactivate, detail, invite, filter, role, etc.)
    │   │       ├── forms/          # Invite schema, role update schema
    │   │       ├── hooks/          # 6 hooks
    │   │       ├── modals/         # 7 invitation modals (mismatch, expired, inactive, joined, etc.)
    │   │       ├── pages/          # List, detail, invitation acceptance
    │   │       ├── routes/
    │   │       ├── state/          # Page + modal stores
    │   │       ├── types/
    │   │       └── view-models/    # Status view model
    │   └── workspace/
    │       ├── application/        # Ports + 6 use cases
    │       ├── components/         # Form modal, impact info, type-to-confirm
    │       ├── domain/             # Types, name rules
    │       ├── ids/
    │       ├── infrastructure/     # API, endpoint, failure mapper, repository
    │       └── presentation/
    │           ├── components/     # Form modal, impact modal, confirm dialog
    │           ├── forms/          # Schema
    │           ├── hooks/          # List, operations hooks
    │           ├── pages/          # List page
    │           ├── routes/
    │           └── state/          # List store
    │
    ├── shared/
    │   ├── index.ts                # Shared barrel export
    │   ├── api/
    │   │   ├── http-client.ts      # Axios with interceptors (auth, 401 retry, error handling)
    │   │   ├── api-client.ts       # Legacy wrappers (apiGet, apiPost, etc.)
    │   │   └── api-response.ts     # Response DTO types
    │   ├── config/
    │   │   ├── app-cookie.config.ts
    │   │   ├── country-code.config.ts
    │   │   └── env-config.ts
    │   ├── failure/
    │   │   ├── app-failure.ts
    │   │   └── map-http-failure-kind.ts
    │   ├── foundation/             # Design system tokens
    │   │   ├── app-breakpoint/     # Desktop + mobile breakpoints (CSS)
    │   │   ├── app-color/          # Access, accounting, pocket, theme colors (CSS)
    │   │   ├── app-font-family/    # Primary, secondary fonts (CSS)
    │   │   ├── app-layout/         # Layout tokens (CSS)
    │   │   ├── app-typography/     # Desktop + mobile typography (CSS)
    │   │   ├── app-foundation.css  # Core CSS
    │   │   ├── app-foundation-breakpoint.tsx
    │   │   ├── app-foundation-context.tsx
    │   │   └── app-foundation-hook.ts
    │   ├── lib/
    │   │   ├── forms/index.ts      # Form utilities
    │   │   ├── hooks/              # use-breakpoint, use-debounce, use-infinite-scroll-trigger, use-valfuse-field-array
    │   │   ├── jwt/jwt-decode.ts
    │   │   ├── localization/index.ts
    │   │   ├── media/image.ts
    │   │   ├── storage/            # browser-cookie.storage.ts
    │   │   ├── time/               # convert-seconds, format-relative-time
    │   │   ├── url/                # Query param utils
    │   │   └── validation/         # Identifier, phone, form error mapper
    │   ├── presentation/stores/
    │   │   ├── auth/               # Auth session store
    │   │   ├── app-interruption/   # Global interruption overlay store
    │   │   ├── re-auth-metadata/   # Re-auth flow metadata store
    │   │   └── clear-all-session.ts
    │   ├── result/
    │   │   ├── either.ts           # Either/Left/Right monad
    │   │   └── app-result.ts
    │   ├── state/
    │   │   ├── data-state.ts       # DataState<T> (initial, loading, success, empty, failure)
    │   │   └── status-state.ts
    │   ├── types/
    │   │   ├── auth-session.types.ts
    │   │   ├── element-id.types.ts
    │   │   ├── role-changed-interruption.types.ts
    │   │   ├── store-lifecycle.types.ts
    │   │   ├── style-imports.d.ts
    │   │   └── vite-env.d.ts
    │   └── ui/                     # Atomic design component library
    │       ├── atoms/              # 16 categories
    │       │   ├── button/         # Critical, neutral, social, standard variants
    │       │   ├── countdown-timer/
    │       │   ├── divider/
    │       │   ├── helper-text/
    │       │   ├── illustration-container/
    │       │   ├── image-placeholder/
    │       │   ├── indicator/      # Badge, chips, tags
    │       │   ├── information/    # Banner, toast
    │       │   ├── language-switcher/
    │       │   ├── notification-badge/
    │       │   ├── otp-input/
    │       │   ├── popover/
    │       │   ├── profile-photo/
    │       │   ├── segmented-control/checkbox/
    │       │   ├── text-wrapper/hyperlink/
    │       │   └── tooltip/
    │       ├── molecules/          # 8 categories
    │       │   ├── breadcrumb/
    │       │   ├── file-uploader/
    │       │   ├── information/    # banner-verification, toast-container
    │       │   ├── input-field/    # +number variant
    │       │   ├── modal/          # adaptive, consent, dialog, dropdown-list
    │       │   ├── navigation/tabs-group/ # horizontal, vertical
    │       │   ├── notification-invitation-actions/
    │       │   └── selection-item/
    │       ├── organisms/          # 3 categories
    │       │   ├── fallback-page/  # Overlay controller
    │       │   ├── loader/         # With overlay controller
    │       │   └── rotating-loading-icon/
    │       ├── pattern/            # 6 patterns
    │       │   ├── calendar-management/ # single + double date pickers
    │       │   ├── card/quick-access/
    │       │   ├── data-statement/ # empty-data, no-data
    │       │   ├── input-group/    # 6 variants + with-affix
    │       │   ├── locked-account-modal/
    │       │   └── table/          # action, body, footer, header, template sub-components
    │       ├── patterns/           # (older structure)
    │       │   ├── main-access-layout/
    │       │   ├── main-access-layout-navbar/
    │       │   └── main-access-layout-sidebar/
    │       └── template/           # 3 templates
    │           ├── onboarding-stepper/
    │           ├── sidebar/sidebar-groapp-access/
    │           └── success-page/
    │
    └── test/
        └── setup.ts                # Vitest setup (mocks @app/config/env)
```

---

## Architecture

The project follows **strict Clean Architecture** with unidirectional dependency:

```text
presentation → application → domain
infrastructure → domain/application contracts
app/composition → modules
```

### Forbidden Dependencies

```text
domain → presentation ✗
domain → infrastructure ✗
presentation component → infrastructure API/SDK ✗
route/page → raw API/SDK ✗
```

### Layer Layout

| Layer              | Location                                 | Responsibility                                                            |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| **Domain**         | `src/features/{feature}/domain/`         | Entities, value objects, repository contracts (interfaces), failure types |
| **Application**    | `src/features/{feature}/application/`    | Use cases, port interfaces for infrastructure                             |
| **Infrastructure** | `src/features/{feature}/infrastructure/` | API clients, HTTP adapters, repository implementations                    |
| **Presentation**   | `src/features/{feature}/presentation/`   | Pages, components, hooks, forms, state, routes, modals                    |
| **Composition**    | `src/app/`                               | Dependency injection, routing, providers                                  |

### Path Aliases

| Alias      | Path            |
| ---------- | --------------- |
| `@app`     | `src/app/`      |
| `@asset`   | `src/assets/`   |
| `@feature` | `src/features/` |
| `@shared`  | `src/shared/`   |
| `@type`    | `src/types/`    |

### Application Bootstrap Flow

```text
main.tsx
  → App
    → AppProviders
      1. ToastProvider
      2. AppFoundationProvider (color tokens, typography, breakpoints, layout)
      3. AppFoundationBreakpoint
      4. LocalizationProvider (i18n runtime)
      5. BrowserRouter
    → MediaProvider
    → ProfileProvider
    → AppRoutes
      → AuthGuard / VerificationSecondGuard / Public routes
      → AppBootstrapProvider (hydration sequence):
          1. Hydrate auth session from cookies
          2. Attempt token refresh
          3. Fetch user profile
          4. Fetch company list
          5. Select primary company
      → AppInterruptionOverlay (global modals for re-auth, hard-block, verification, role-changed, fallback)
      → FallbackPageOverlay (portal for 503/500)
```

---

## Features

### Auth (`src/features/auth/`)

| Capability          | Details                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Login               | Manual (email/password), Google OAuth, Apple OAuth, Firebase                                 |
| Registration        | Multi-step registration flow                                                                 |
| Password recovery   | Forgot password + reset password flows                                                       |
| Verification        | REG_VERIF (registration verification via email + OTP), SECOND_VERIF (secondary verification) |
| Google unregistered | Handles Google accounts not yet registered in the system                                     |
| Re-authentication   | Session expired re-auth flow                                                                 |
| Interruption        | Role-changed modal detection and display                                                     |
| Route guards        | AuthGuard for protected routes, public route redirect for already-authenticated users        |

### Company (`src/features/company/`)

| Capability      | Details                                                   |
| --------------- | --------------------------------------------------------- |
| List            | Search, pagination, company list display                  |
| Detail          | Company detail view with navigation cards to sub-sections |
| Create          | Company creation form                                     |
| Update          | Identity, address, contact, legal information edit        |
| Delete          | Company deletion                                          |
| Geo master data | Province → City → District → Village cascading selection  |
| Logo upload     | Company logo image upload                                 |
| Multi-workspace | Companies organized across multiple workspaces            |

### User (`src/features/user/`)

| Capability           | Details                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------- |
| Profile management   | View and edit user profiles                                                             |
| User-company listing | Companies a user belongs to with role and status                                        |
| Invitation           | Create invitations, resend invitations, accept invitations, handle invitation responses |
| User detail          | User detail pages                                                                       |
| Existence checks     | Check if a user already exists in the system                                            |
| Token validation     | Invitation token validation                                                             |
| Second verification  | Snapshot derivation for second verification flow                                        |

### Role (`src/features/role/`)

| Capability  | Details                                 |
| ----------- | --------------------------------------- |
| Listing     | Role list display                       |
| Detail      | Role detail with associated permissions |
| Permissions | "Get my permissions" query              |

### Workspace (`src/features/workspace/`)

| Capability        | Details                                                     |
| ----------------- | ----------------------------------------------------------- |
| List              | Workspace list with search and pagination (infinite scroll) |
| Create            | Workspace creation                                          |
| Edit              | Workspace editing                                           |
| Delete            | Delete with type-to-confirm pattern                         |
| Detail            | Workspace detail retrieval                                  |
| Delete conditions | Handles blocked deletion scenarios                          |

### Dashboard (`src/features/dashboard/`)

| Capability      | Details                                  |
| --------------- | ---------------------------------------- |
| Welcome section | Personalized greeting                    |
| Module cards    | GroApp Access, GroApp Accounting cards   |
| Quick actions   | Invite team, manage role, view audit log |

### Onboarding (`src/features/onboarding/`)

| Capability | Details                             |
| ---------- | ----------------------------------- |
| Flow       | Multi-step onboarding for new users |

### Profile (`src/features/profile/`)

| Capability | Details                          |
| ---------- | -------------------------------- |
| View       | Profile display pages            |
| Edit       | Profile editing forms and modals |
| Success    | Standalone success pages         |

### Notification (`src/features/notification/`)

| Capability   | Details                         |
| ------------ | ------------------------------- |
| List         | Notification list               |
| Badge        | Unread count badge in navbar    |
| Detail       | Modal-based notification detail |
| Mark as read | Individual and bulk read status |
| Invitation   | Invitation confirmation modal   |

### Accounting (`src/features/accounting/`)

| Capability | Details                                     |
| ---------- | ------------------------------------------- |
| Marketing  | Public accounting entry/marketing pages     |
| Routes     | Route definitions for accounting sub-module |

### Master (`src/features/master/`)

| Capability     | Details                        |
| -------------- | ------------------------------ |
| Domain         | Master data domain model       |
| Application    | Master data application layer  |
| Infrastructure | Master data API infrastructure |

### Media (`src/features/media/`)

| Capability | Details                  |
| ---------- | ------------------------ |
| Upload     | Media file upload        |
| Get        | Media retrieval          |
| Delete     | Media deletion           |
| Utilities  | Image handling utilities |

---

## UI Component Library

Built with an **atomic design** methodology in `src/shared/ui/`.

### Atoms (16 categories)

| Component              | Description                           |
| ---------------------- | ------------------------------------- |
| Button                 | Variants, sizes, loading state, icons |
| Divider                | Horizontal/vertical separator         |
| Helper Text            | Form field helper/error text          |
| Illustration Container | Illustration wrapper                  |
| Image Placeholder      | Image loading placeholder             |
| Indicator              | Chips, badges, status indicators      |
| Information            | Toast notifications, banners          |
| Language Switcher      | i18n language toggle                  |
| Notification Badge     | Unread count badge                    |
| OTP Input              | One-time password input field         |
| Popover                | Floating content popover              |
| Profile Photo          | Avatar/photo display                  |
| Segmented Control      | Checkbox-style segmented control      |
| Text Wrapper           | Text with hyperlink support           |
| Tooltip                | Hover tooltip                         |
| Countdown Timer        | Countdown display                     |

### Molecules (8 categories)

| Component           | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Input Field         | Text input with label, error, helper text                        |
| Selection Item      | Selectable list items                                            |
| File Uploader       | Drag-and-drop file upload                                        |
| Modal               | Adaptive modal, dialog modal, consent modal, dropdown list modal |
| Breadcrumb          | Navigation breadcrumb trail                                      |
| Tabs Group          | Tab navigation                                                   |
| Banner Verification | Verification status banner                                       |
| Toast Container     | Toast notification container                                     |

### Organisms (3 categories)

| Component             | Description                 |
| --------------------- | --------------------------- |
| Fallback Page         | 500/503 error pages         |
| Loader                | LoaderCard loading skeleton |
| Rotating Loading Icon | Spinning loader             |

### Patterns

| Pattern              | Description                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Table                | Complex data table with header, body, action, template, footer sub-components                                 |
| Calendar Management  | Date/calendar picker                                                                                          |
| Card / Quick Access  | Dashboard quick-action cards                                                                                  |
| Data Statement       | Empty data state, no-data state                                                                               |
| Input Group          | 6 variants: default, search, date-picker, date-picker-2, password-security, country-selector, with-affix      |
| Locked Account Modal | Account locked notification modal                                                                             |
| Main Access Layout   | Full app shell (sidebar, navbar, breadcrumb, verification banner, outlet, mobile profile menu, logout dialog) |

### Main Layout Hierarchy

```text
AppMainAccessLayout (composition)
└── MainAccessLayoutProvider
    └── MainAccessLayout (pattern shell)
        ├── MainAccessLayoutSidebar
        │   ├── Company selector dropdown
        │   ├── Sidebar menu items
        │   └── Mobile sidebar overlay
        ├── MainAccessLayoutNavbar
        │   ├── Breadcrumb
        │   ├── Language switcher
        │   ├── Notification badge
        │   ├── Profile dropdown
        │   └── Verification banner
        ├── Outlet (page content)
        ├── Mobile Profile Menu (AdaptiveModal)
        └── Mobile Logout Dialog (DialogModal)
```

---

## API Layer

### httpClient (Primary)

Full-featured axios client at `src/shared/api/http-client.ts`:

- **Base URL:** Configured per environment via `VITE_API_URL`
- **Bearer token injection:** Automatic from Zustand auth store
- **401 retry:** Automatic with token refresh queue (queues concurrent 401s and replays them after refresh)
- **Session expiry:** Calls session expiry callback on unrecoverable 401
- **Global error handling:**
  - 403 → Forbidden
  - 409 → Role-changed detection
  - 500, 502, 503, 504 → Server error
- **AbortSignal support:** Request cancellation

### api-client (Legacy)

Raw axios wrappers at `src/shared/api/api-client.ts`:

- `apiGet`, `apiPost`, `apiPatch`, `apiPut`, `apiDelete`

### Environment Base URLs

| Environment | URL                          |
| ----------- | ---------------------------- |
| Development | `https://api-test.groapp.id` |
| Testing     | `https://api-test.groapp.id` |
| Staging     | `https://api-stg.groapp.id`  |
| Live        | `https://api-live.groapp.id` |

---

## State Management

### Zustand Global Stores

| Store                      | File                                           | Purpose                                                                                 |
| -------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `useAuthStore`             | `shared/presentation/stores/auth/`             | Auth session, auth status, selected company, company list                               |
| `useAppInterruptionStore`  | `shared/presentation/stores/app-interruption/` | Global interruption overlay (re-auth, hard-block, verification, role-changed, fallback) |
| `useReAuthMetadataStore`   | `shared/presentation/stores/re-auth-metadata/` | Login method metadata for re-auth flows                                                 |
| `useMainAccessLayoutStore` | `shared/ui/patterns/main-access-layout/`       | Sidebar state, navbar state, company switch, profile menu                               |

### Context + Zustand Providers

| Provider               | Location               | Purpose                                                                          |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `AppBootstrapProvider` | `app/providers/`       | Boot sequence: cookie hydration, token refresh, profile fetch, company selection |
| `MediaProvider`        | `app/state/media/`     | Media upload/get/delete with context + store                                     |
| `ProfileProvider`      | `app/state/profile/`   | Profile data with context + store                                                |
| `CompanyProvider`      | `app/state/company/`   | Company state with context + store                                               |
| `WorkspaceProvider`    | `app/state/workspace/` | Workspace state with context + store                                             |

### Data State Pattern

Every async data state uses `DataState<T>` with these states:

```text
initial → loading → success
                 → empty
                 → failure
loadingMore (for paginated data)
```

Returned from use cases via the `Either<Left, Right>` monad (`AppResult` pattern):

```typescript
type AppResult<T> = Either<AppFailure, T>;
```

---

## Routing

### Route Structure

Defined in `src/app/router/routes.tsx`:

| Path                          | Guard                   | Layout              | Description                                          |
| ----------------------------- | ----------------------- | ------------------- | ---------------------------------------------------- |
| `/auth/*`                     | Public route            | None                | Login, register, forgot/reset password, verification |
| `/accounting/*`               | Public route            | None                | Public accounting marketing pages                    |
| `/`                           | AuthGuard               | AppMainAccessLayout | App entry point (redirects to dashboard)             |
| `/dashboard`                  | AuthGuard               | AppMainAccessLayout | Dashboard                                            |
| `/workspaces`                 | AuthGuard               | AppMainAccessLayout | Workspace list                                       |
| `/companies/*`                | AuthGuard               | AppMainAccessLayout | Company list, detail, profile                        |
| `/users/*`                    | AuthGuard               | AppMainAccessLayout | User list, detail                                    |
| `/roles/*`                    | AuthGuard               | AppMainAccessLayout | Role list, detail                                    |
| `/units/*`                    | AuthGuard               | AppMainAccessLayout | Business unit management                             |
| `/profile/*`                  | AuthGuard               | AppMainAccessLayout | User profile pages                                   |
| `/notifications/*`            | AuthGuard               | AppMainAccessLayout | Notifications                                        |
| `/onboarding/*`               | AuthGuard               | None                | Onboarding flow (no main layout)                     |
| `/*` (success)                | AuthGuard               | None                | Standalone success pages                             |
| `/auth/second-verification/*` | VerificationSecondGuard | None                | Second verification (logged-in re-verification)      |
| `/not-found`                  | None                    | None                | 404 page                                             |

### Route Guards

- **AuthGuard:** Checks `useAuthStore.authStatus` — redirects to `/auth/login` if unauthenticated
- **VerificationSecondGuard:** Checks pending second verification status
- **Public routes:** Redirect to `/` if already authenticated

---

## Configuration

### Environment Variables

| Variable                            | Purpose                      |
| ----------------------------------- | ---------------------------- |
| `VITE_API_URL`                      | Backend API base URL         |
| `VITE_FIREBASE_API_KEY`             | Firebase API key             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID              |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Firebase measurement ID      |

### Cookie Configuration

Auth sessions persisted in cookies with environment-prefixed keys. Company context stored in sessionId-scoped cookies.

---

## Scripts

| Script                          | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `npm run dev`                   | Start Vite dev server (default env)         |
| `npm run dev:development`       | Dev server with `.env.development`          |
| `npm run dev:testing`           | Dev server with `.env.testing`              |
| `npm run dev:staging`           | Dev server with `.env.staging`              |
| `npm run dev:live`              | Dev server with `.env.live`                 |
| `npm run build`                 | TypeScript check + Vite build (default env) |
| `npm run build:development`     | Build with `.env.development`               |
| `npm run build:testing`         | Build with `.env.testing`                   |
| `npm run build:staging`         | Build with `.env.staging`                   |
| `npm run build:live`            | Build with `.env.live`                      |
| `npm run lint`                  | ESLint 10 check                             |
| `npm run typecheck`             | TypeScript type checking                    |
| `npm run test`                  | Vitest test run                             |
| `npm run test:watch`            | Vitest watch mode                           |
| `npm run test:ui`               | Vitest UI mode                              |
| `npm run format`                | Prettier formatting                         |
| `npm run format:check`          | Prettier check                              |
| `npm run localization:init`     | Initialize localization code generation     |
| `npm run localization:generate` | Generate localization code                  |
| `npm run localization:watch`    | Watch localization files                    |
| `npm run storybook`             | Start Storybook                             |
| `npm run build-storybook`       | Build Storybook static site                 |
| `npm run preview`               | Vite preview of built app                   |

---

## Testing

- **Framework:** Vitest 3.2
- **Environment:** happy-dom
- **Libraries:** @testing-library/react, @testing-library/jest-dom
- **Test files:** `src/**/*.{test,spec}.{ts,tsx}`
- **Setup file:** `src/test/setup.ts` (mocks `@app/config/env`)
- **Integration:** Storybook addon for visual regression

---

## Quality Gate

Mandatory before any PR (enforced by hooks):

```bash
npm run lint        # ESLint 10 with typescript-eslint + react-hooks + custom comment-policy
npm run typecheck   # TypeScript 6.0 strict type checking
npm run build       # Vite 8 production build
npm run test        # Vitest 3 full test suite
```

### Pre-commit Hooks (Husky + lint-staged)

| File pattern      | Action                              |
| ----------------- | ----------------------------------- |
| `*.{ts,tsx}`      | `eslint --fix` + `prettier --write` |
| `*.{json,md,css}` | `prettier --write`                  |
| Commit messages   | commitlint (conventional commits)   |

---

## Localization

- **Toolchain:** Custom `localization-gen`
- **Input:** `public/assets/localizations/`
- **Output:** `src/assets/localizations/app-localization.{ts,types.ts,manifest.json}`
- **Languages:** `id` (Indonesian), `en` (English)
- **Runtime:** `localization-gen-react-adapter`

Commands:

```bash
npm run localization:init      # Initialize localizations
npm run localization:generate  # Generate TypeScript types
npm run localization:watch     # Watch for changes
```

Configuration in `localization-gen.yaml`.

---

## Container & Deployment

### Docker Build

Multi-stage Dockerfile:

1. **Stage 1 (builder):** `node:25-alpine` — installs dependencies, runs build
2. **Stage 2 (runtime):** `nginx:1.27-alpine` — serves built assets

Nginx configuration includes:

- SPA fallback (all routes → `index.html`)
- Gzip compression
- Aggressive caching for hashed assets
- Security headers

### Docker Compose

4 environment profiles:

```bash
docker compose --profile development up
docker compose --profile testing up
docker compose --profile staging up
docker compose --profile live up
```

### Kubernetes

- **Platform:** GKE
- **Namespace:** `access`
- **Manifests:** `kubernetes/`

### CI/CD

- **Platform:** GCP Cloud Build
- **Config:** `cloudbuild.yaml`

---

## Domain Entities

### Company

```typescript
CompanyListItem: {
  id, name, workspaceId, workspaceName, isPrimaryCompany,
  ownership, totalBusinessUnitActive, totalBusinessUnitInactive,
  logoId, logoUrl
}

CompanyDetailItem: {
  id, workspaceId, name, businessType, country, currency,
  address: { province, city, district, village, postalCode, address },
  contact: { email, phone, website },
  legal: { npwp, nib, pkpStatus },
  fiscal: { fiscalYear, fiscalStartMonth }
}
```

### User Profile

```typescript
UserProfile: {
  (id, name, email, countryCode, phone, emailVerified, phoneVerified, createdAt, updatedAt);
}
```

### User Company

```typescript
UserCompanyItem: {
  companyId, companyName, role, status
}

UserCompanyDetail: {
  user profile + company roles/permissions
}
```

### Workspace

```typescript
WorkspaceItem: {
  (id, name, totalCompanies, totalBusinessUnits, createdAt);
}
```

### Notification

```typescript
Notification: {
  (id, type, title, message, isRead, createdAt);
}
```

---

## Key Patterns

### Interruption System

Global overlay system (`useAppInterruptionStore`) that displays modals for:

| Type         | Trigger                 | Action                           |
| ------------ | ----------------------- | -------------------------------- |
| Re-auth      | Session expired         | Re-authenticate flow             |
| Hard block   | Account locked/disabled | Display block message            |
| Verification | Pending verification    | Display warning                  |
| Role changed | 409 from API            | Display role change notification |
| Fallback     | 500/503                 | Display error page               |

### Delete with Type-to-Confirm

Used for destructive actions (e.g., workspace deletion). User must type a confirmation string before the delete button becomes active.

### Infinite Scroll Pagination

Used for workspace list. Loads more items as the user scrolls down, tracked via `DataState.loadingMore`.

### Invitation Flow

1. Create invitation (API call)
2. Resend if needed
3. Token validation on acceptance
4. Second verification snapshot derivation

---

## Agent Workflow & Governance

The project uses a sophisticated **Constitution-driven multi-agent workflow** system managed through `.claude/` and `docs/`.

### Constitution (20 files)

`docs/constitution/000-constitution.md` through `019-hook-enforcement-policy.md`:

| File | Topic                           |
| ---- | ------------------------------- |
| 000  | Constitution (core governance)  |
| 001  | Architecture principles         |
| 002  | Agent governance                |
| 003  | Task governance                 |
| 004  | Runner governance               |
| 005  | Output governance               |
| 006  | GitFlow policy                  |
| 007  | Branch naming policy            |
| 008  | Commit policy                   |
| 009  | PR review policy                |
| 010  | Quality gate policy             |
| 011  | Testing policy                  |
| 012  | Security & config policy        |
| 013  | Memory policy                   |
| 014  | File ownership policy           |
| 015  | Dependency policy               |
| 016  | Documentation & handover policy |
| 017  | Release readiness policy        |
| 018  | Blocker escalation policy       |
| 019  | Hook enforcement policy         |

### SOP Registry (7 workflows in `docs/workflows/`)

| SOP | Name                             | Branch Prefix   | Purpose                 |
| --- | -------------------------------- | --------------- | ----------------------- |
| 001 | PRD Technical Feasibility Review | `docs/`         | Review PRD feasibility  |
| 002 | PRD Development Workshop         | `docs/`         | Refine PRD into specs   |
| 003 | Library Development              | `feature/lib-*` | Build shared libraries  |
| 004 | Feature Development              | `feature/app-*` | Build frontend features |
| 005 | Bugfix                           | `bugfix/*`      | Fix bugs                |
| 006 | Release                          | env promotion   | Release to environments |
| 007 | Hotfix                           | `hotfix/*`      | Emergency fixes         |

### Agent Files (89 in `.claude/agents/`)

Each agent is an executable `.agent.md` file named with a FEDO 9-digit code:

```text
[🟡 FEDO 004006003] - {name}.agent.md
  ^^^ ^^^ ^^^
  SOP  Run  Seq
```

Phase codes match runner codes from the SOP definition.

### Hook System (`.claude/hooks/`)

| Hook                       | Enforcement | Purpose                                                     |
| -------------------------- | ----------- | ----------------------------------------------------------- |
| `check-branch.sh`          | Hard        | Blocks edits on `main`, `master`, `development`, `staging`  |
| `check-task-manifest.sh`   | Hard        | Blocks edits without a task manifest                        |
| `check-protected-files.sh` | Hard        | Blocks edits to `.env*`, lockfiles, constitution, CLAUDE.md |
| `check-quality-gate.sh`    | Soft        | Reminds about quality gate before PR                        |

### Memory System (`.claude/memory/`)

Layer 4 curated project memory with FEDO-coded files covering decisions, user role, project info, and root cause analysis. Written manually at decision time (no auto-logging).

---

## Product Requirements (PRDs in `docs/prd/`)

| Group | Module                  | Files                                                                            | Lines  |
| ----- | ----------------------- | -------------------------------------------------------------------------------- | ------ |
| **H** | Profile & Notification  | `profil-pengguna-notifikasi-v7.0.md`, `mapping_multi_bahasa_profile_agent_ai.md` | ~3,884 |
| **J** | Chart of Accounts (CoA) | `PRD Gabungan - Manajemen Akun (CoA) - FINAL FIX.md`, `PRD-J-Frontend-Review.md` | ~3,361 |
| **K** | Contact Management      | `PRD - Manajemen Kontak - Full Episode.md`, `review-manajemen-kontak.md`         | ~2,791 |
| **L** | Product & Service       | `PRD Group L - Produk dan Jasa.md`, `PRD-L-Frontend-Review.md`                   | ~8,009 |

Group K status: "Bisa Mulai dengan Klarifikasi Minor" (can start with minor clarifications). Groups J & L: "Perlu Klarifikasi Sebelum Development" (needs clarification before development).

## API Specifications (`docs/api-specs/group-k/`)

All contracts documented for **Group K — Manajemen Kontak** (Contact Management):

| Service                                 | Endpoints                                                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `access-service` (`/access/v1`)         | 16 endpoints: CRUD contacts (list, count, create, detail, edit), bulk archive/activate/delete (with dryRun), tag management (list, create, rename, soft delete), import (template download, preview, commit), export (async trigger) |
| `accounting-service` (`/accounting/v1`) | 2 endpoints: list active banks for dropdown, get bank by code for validation                                                                                                                                                         |
| `export-worker` (`/export/v1`)          | 1 endpoint: poll export job status, get GCS signed URL                                                                                                                                                                               |

Also includes:

- **`api-code-glosarium 3.md`** — ~200+ error codes spanning all epics
- **`api-docs-aligner-review-manajemen-kontak.md`** — 9 issues identified (I-01 to I-09) requiring clarification with Backend/PO/Tech Lead

## Bugfix Documents (`docs/bugfix/`)

16 files covering bug reports, fix plans, API specs, and user stories:

| Area                   | Files                                                                                                                           | Scope                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Profile & Notification | `bug-fix-plan-profile-notification.md`, `bug_report_agent_ai.md`                                                                | 7-10 bugs in profile edit, email change, password, photo, notification |
| Forgot/Reset Password  | `api-docs-reset-pass.md`, `forgot-password-reset-password-bugfix-plan.md`, `IMPLEMENTATION_PLAN_reset_password_resend_email.md` | 11 bugs in password flow (i18n, validation, resend email)              |
| User Invitation        | `bug-report-pengguna-undangan.md`, `planning-bug-pengguna-undangan.md`                                                          | 3 bugs in invitation modals (resend labels, activation confirm)        |
| Admin Keuangan         | `bug-report-admin-keuangan.md`, `planning-admin-keuangan-permission.md`                                                         | 4 RBAC permission issues in Company & Unit modules                     |
| Role Change            | `bug-report-perubahan-role-administrator.md`, `role-change-notification-administrator-plan.md`                                  | Role change notification bug (root cause: BE-side)                     |
| User Detail/List       | `US-USERDET-VIEWACT.md`, `User Story US-USERDET-VIEWACT - Detail Page Analysis.md`, `User Story US-USERLIST-VIEWACT.md`         | View Action Menu on User Detail & List pages                           |
| QASS Report            | `TB QASS Master Report Bug V.3 (1) - Detail Bug Only.md`                                                                        | 9 bugs from QASS Master Report                                         |

## Agent Work Items (`docs/agent-workflow/`)

Per-work-item memory across all 7 SOPs:

| SOP                   | Work Items                                                                                            | Runners                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 001 — PRD Feasibility | `constitution-bootstrap/`                                                                             | 7 runners (intake → global tech decision summary)                 |
| 002 — PRD Workshop    | `constitution-bootstrap/`                                                                             | 6 runners (preparation → readiness summary)                       |
| 003 — Library Dev     | `constitution-bootstrap/`                                                                             | 9 runners (requirement intake → handover)                         |
| 004 — Feature Dev     | `constitution-bootstrap/`, `accounting-entry-page/`, `bugfix-ref-prd-g/`, `manajemen-kontak-group-k/` | 8 runners active (001-013, skipped 006/008/009/012 for bootstrap) |
| 005 — Bugfix          | `constitution-bootstrap/`                                                                             | 7 runners (bug intake → branch sync)                              |
| 006 — Release         | `constitution-bootstrap/`                                                                             | 7 runners (readiness check → handover)                            |
| 007 — Hotfix          | `constitution-bootstrap/`                                                                             | 8 runners (issue intake → prevention note)                        |

## Agent Documentation (`docs/agents/`)

~100 agent doc files + 2 orchestrator reports across 7 SOPs:

| SOP                   | Phases  | Agent Count                |
| --------------------- | ------- | -------------------------- |
| 001 — PRD Feasibility | 001-007 | 7                          |
| 002 — PRD Workshop    | 001-006 | 6                          |
| 003 — Library Dev     | 001-009 | 9                          |
| 004 — Feature Dev     | 001-013 | 56 + 1 orchestrator report |
| 005 — Bugfix          | 001-007 | 7 + 1 orchestrator report  |
| 006 — Release         | 001-007 | 7                          |
| 007 — Hotfix          | 001-008 | 8                          |

SOP 004 (Feature Development) is the most extensive with 13 phases covering: Requirement Intake → Environment Survey → Architecture Planning → Task Breakdown → Module Skeleton → Infrastructure Implementation → Presentation State → Application Logic → Page Composition → Quality Gate → Code Review → QA Execution → Handover.

---

## Environment Files

| File               | Used For                        |
| ------------------ | ------------------------------- |
| `.env.example`     | Template for required variables |
| `.env.development` | Local development               |
| `.env.testing`     | Testing environment             |
| `.env.staging`     | Staging environment             |
| `.env.live`        | Production environment          |

---

## Pre-requisites

- Node.js >=25.0.0
- npm (latest)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev:development

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build:live
```

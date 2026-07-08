# Reference: Directory Structure

Source: AGENTS.md §3

```text
src/tests/
├── auth.setup.ts              # Global auth fixture
├── global-setup.ts            # Environment validation
├── global-teardown.ts         # Cleanup test data
│
├── pages/                     # Page Object Model
│   ├── base.page.ts
│   ├── components/            # Shared UI component POMs
│   │   ├── navbar.component.ts
│   │   ├── sidebar.component.ts
│   │   ├── modal.component.ts
│   │   ├── toast.component.ts
│   │   ├── table.component.ts
│   │   ├── breadcrumb.component.ts
│   │   └── pagination.component.ts
│   ├── layout/
│   ├── auth/
│   ├── company/
│   ├── user/
│   ├── role/
│   ├── workspace/
│   ├── dashboard/
│   ├── onboarding/
│   ├── profile/
│   ├── notification/
│   └── unit/
│
├── fixtures/                  # Test fixtures
│   ├── auth.fixture.ts
│   ├── company.fixture.ts
│   └── index.ts
│
├── data/                      # Test data factories
│   ├── auth.data.ts
│   ├── company.data.ts
│   ├── workspace.data.ts
│   ├── user.data.ts
│   ├── unit.data.ts
│   └── constants.ts
│
├── utils/                     # Shared utilities
│   ├── api-helper.ts
│   ├── db-helper.ts
│   ├── token-helper.ts
│   ├── file-helper.ts
│   └── selectors.ts
│
├── specs/                     # Test spec files
│   ├── auth/
│   ├── company/
│   ├── user/
│   ├── role/
│   ├── workspace/
│   ├── dashboard/
│   ├── onboarding/
│   ├── profile/
│   ├── notification/
│   └── unit/
│
└── types/
    └── index.ts
```

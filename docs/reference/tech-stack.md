# Reference: Tech Stack & Architecture

Source: AGENTS.md §2

## Application Stack

| Layer      | Technology                                   | Notes                                    |
| ---------- | -------------------------------------------- | ---------------------------------------- |
| Framework  | React 19 + TypeScript 6 + Vite 8             | SPA, no SSR                              |
| State      | Zustand 5 + React Context                    | Auth, profile, company, media, workspace |
| Routing    | React Router DOM 7                           | AuthGuard, VerificationSecondGuard       |
| API Client | Axios (http-client + api-client)             | JWT Bearer, 401 refresh queue            |
| Auth       | Firebase 11 (Google, Apple, email/phone OTP) | Popup OAuth, email/OTP verification      |
| Styling    | Tailwind CSS 4                               | Utility classes                          |
| UI         | Custom atomic design                         | Atoms, Molecules, Organisms, Patterns    |

## Test Stack

| Tool                   | Version | Purpose              |
| ---------------------- | ------- | -------------------- |
| Playwright             | ^1.61   | E2E test runner      |
| Vitest                 | ^3.2    | Unit/integration     |
| @testing-library/react | Latest  | Component unit tests |
| happy-dom              | Latest  | DOM environment      |

## Architecture

```text
Browser → React SPA (Vite dev / nginx preview)
            ↓ Axios http-client (Bearer token + 401 retry)
         Go/Gin Backend (api-test.groapp.id / api-stg.groapp.id)
            ↓
         MariaDB + Firebase Auth
```

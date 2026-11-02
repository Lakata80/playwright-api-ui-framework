# Playwright API + UI Contract Testing Framework

[![CI](https://github.com/Lakata80/playwright-api-ui-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/Lakata80/playwright-api-ui-framework/actions/workflows/ci.yml)

A production-ready, reusable Playwright monorepo that co-enforces REST API contract correctness and UI behaviour in a single test suite. Built for commercial client projects; uses [automationexercise.com](https://automationexercise.com) as the v1 reference application.

## Quick start

```sh
npm ci && npm run -w @framework/e2e-tests test:api
```

No credentials or browser required — API tests run against automationexercise.com out of the box.
For UI tests and full setup, see [Getting started](#getting-started).

## What this demonstrates

- **API + UI contract testing** — Zod schemas are the single source of truth for API response shapes; `@contract` tests validate live responses on every CI run when the reference app is reachable (see [Known limitations](#known-limitations))
- **Monorepo architecture** — three workspace packages with enforced one-way dependency direction (`apps` → `packages`), each independently testable
- **CI quality gates** — five-job pipeline where API + contract + smoke must pass before regression runs; third-party WAF failures skip gracefully without blocking PRs
- **Parallel worker isolation** — each Playwright worker authenticates with a dedicated pre-seeded account, eliminating credential contention at any concurrency level

## Package overview

| Package               | Role                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- |
| `packages/api-client` | Schema-agnostic HTTP client — retry, auth strategy, interceptors, Zod validation hook |
| `packages/contracts`  | Hand-authored Zod schemas + inferred TypeScript types for all API response shapes     |
| `packages/ui-core`    | Reusable `BasePage`, `BaseComponent`, `Dialog`, `DataTable`, `Form`, `NavigationMenu` |
| `apps/e2e-tests`      | All test suites, fixtures, page objects, services, and configuration                  |

**Dependency direction is strictly one-way:** `apps` → `packages`. Enforced at lint time via ESLint `no-restricted-imports`. See [docs/architecture.md](docs/architecture.md) for full details.

```
playwright-api-ui-framework/
├── packages/
│   ├── api-client/        # Schema-agnostic HTTP client
│   ├── contracts/         # Zod schemas (workspace-internal)
│   └── ui-core/           # BasePage, BaseComponent, fixtures
└── apps/
    └── e2e-tests/         # All suites, page objects, data
```

---

## Prerequisites

| Requirement | Version  |
| ----------- | -------- |
| Node.js     | ≥ 20 LTS |
| npm         | ≥ 10     |

---

## Getting started

### 1. Install dependencies

```sh
npm ci
```

### 2. Configure your local environment

```sh
cp apps/e2e-tests/src/config/environments/.env.local.example \
   apps/e2e-tests/src/config/environments/.env.local
```

Edit `.env.local` and fill in the `WORKER_N_EMAIL` and `WORKER_N_PASSWORD` values (see [Worker accounts](#worker-accounts) below).

### 3. Seed worker accounts (first-time setup)

```sh
npm run -w @framework/e2e-tests seed:workers
```

The script creates one test account per Playwright worker and prints:

- `WORKER_N_EMAIL` — copy into `.env.local`
- `WORKER_N_PASSWORD` — add as a GitHub Actions secret named `WORKER_N_PASSWORD`

> **Never commit passwords.** `.env.local` is git-ignored.

### 4. Verify the setup

```sh
npm run -w @framework/e2e-tests test:api
```

All API tests should pass. No browser or credentials are needed for this suite.

### 5. Run UI and hybrid tests

```sh
npm run -w @framework/e2e-tests test:smoke
```

---

## Running tests

```sh
# API tests — no browser, no credentials
npm run -w @framework/e2e-tests test:api

# Contract drift tests — no browser, no credentials
npm run -w @framework/e2e-tests test:contract

# Smoke suite — fast gate, tagged @smoke
npm run -w @framework/e2e-tests test:smoke

# Full regression suite
npm run -w @framework/e2e-tests test:regression

# Reference-app suite (automationexercise.com specific)
npm run -w @framework/e2e-tests test:reference-app

# Everything
npm run -w @framework/e2e-tests test
```

---

## Test types

| Project            | Grep / directory                                | Browser | Credentials | Retries (CI) |
| ------------------ | ----------------------------------------------- | ------- | ----------- | ------------ |
| `api`              | `src/tests/api/`                                | No      | No          | 1            |
| `contract`         | `@contract` tag                                 | No      | No          | 1            |
| `smoke`            | `@smoke` tag                                    | Yes     | Yes         | 0            |
| `regression`       | excludes @smoke/@flaky/@contract/@reference-app | Yes     | Yes         | 2            |
| `reference-app`    | `@reference-app` tag                            | Yes     | Yes         | 2            |
| `flaky-quarantine` | `@flaky` tag                                    | Yes     | Yes         | 3            |

---

## Environment variables

Variables are loaded from `apps/e2e-tests/src/config/environments/.env.${ENV}` then overridden by `.env.local`.

| Variable             | Secret  | Required | Default   | Description                                                   |
| -------------------- | ------- | -------- | --------- | ------------------------------------------------------------- |
| `ENV`                | No      | No       | `staging` | Active environment: `staging` \| `production`                 |
| `API_BASE_URL`       | No      | Yes      | —         | REST API base URL                                             |
| `UI_BASE_URL`        | No      | Yes      | —         | Browser base URL                                              |
| `LOG_LEVEL`          | No      | No       | `INFO`    | `DEBUG` \| `INFO` \| `WARN` \| `ERROR`                        |
| `MAX_WORKERS`        | No      | No       | `4`       | Playwright parallel workers (must match seeded account count) |
| `WORKER_N_EMAIL`     | No      | UI tests | —         | Pre-seeded test account email for worker N                    |
| `WORKER_N_PASSWORD`  | **Yes** | UI tests | —         | Password for worker N — store in GitHub Secrets only          |
| `ALLURE_RESULTS_DIR` | No      | No       | —         | Set to enable Allure reporter (e.g. `allure-results`)         |

---

## Worker accounts

Each Playwright worker authenticates using a dedicated pre-seeded account to prevent credential contention during parallel test runs.

1. Run `npm run -w @framework/e2e-tests seed:workers`.
2. Copy printed `WORKER_N_EMAIL` values into `.env.local`.
3. Add `WORKER_N_PASSWORD` values as GitHub repository secrets.
4. Ensure `MAX_WORKERS` equals the number of seeded accounts.

---

## CI/CD

| Workflow                                                     | Trigger                    | Required PR check |
| ------------------------------------------------------------ | -------------------------- | ----------------- |
| [`ci.yml`](.github/workflows/ci.yml)                         | Push / PR to `main`        | Yes               |
| [`contract-drift.yml`](.github/workflows/contract-drift.yml) | Manual (workflow_dispatch) | No                |
| [`reference-app.yml`](.github/workflows/reference-app.yml)   | Manual (workflow_dispatch) | No                |

**Required PR checks** (configure in branch protection rules):

- `quality-gate` — build, typecheck, lint, format
- `api-tests`
- `contract-tests`
- `smoke-tests`

The `regression` job runs only on push to `main` (after smoke passes). Third-party uptime issues on automationexercise.com never block PR merges — they are isolated to the nightly workflows.

---

## Known limitations

**WAF / bot-protection on automationexercise.com.** The reference application is occasionally protected by Imunify360 or Cloudflare challenge pages when accessed from GitHub Actions runners. When this happens, the WAF-check fixture detects the block and marks the affected suite as `skipped` rather than `failed` — so CI stays green but reports 0 tests executed for that run.

This is a deliberate trade-off: treating a third-party infrastructure block as a test failure would make the CI unreliable for PR gating. The correct long-term fix — running contract tests against a local mock server — is scoped for a future iteration. In the meantime, you can re-run a blocked CI job manually once the WAF clears, or run the full suite locally at any time.

---

## Docker

```sh
# Build the image
docker build -t pw-framework -f docker/Dockerfile .

# Run the regression suite (credentials via .env.local mounted by compose)
docker compose -f docker/docker-compose.yml run e2e-tests

# Run a specific project
docker compose -f docker/docker-compose.yml run e2e-tests \
  npx playwright test --project=api
```

---

## Extending the framework

### New page object

1. Create `apps/e2e-tests/src/pages/MyPage.ts` extending `BasePage`.
2. Declare locators as `readonly Locator` properties in the constructor.
3. Expose business-level methods — assertions belong in tests, not page objects.

### New Zod schema

1. Add a schema file to `packages/contracts/src/schemas/<domain>/`.
2. Export from the domain `index.ts` and from `packages/contracts/src/index.ts`.
3. Add a `@contract` test in `apps/e2e-tests/src/tests/contract/`.

### New API service

1. Create `apps/e2e-tests/src/services/api/MyApiService.ts`.
2. Inject `HttpClient` via constructor.
3. Pass the relevant schema from `@framework/contracts` at the call site — never import schemas inside `packages/api-client`.

### New auth strategy

1. Implement the `AuthStrategy` interface from `packages/api-client`.
2. Register it in `AuthManager` (e.g., via an env-var switch in the fixture).
3. No changes to `HttpClient` or any test file are needed.

---

## Architecture decisions

| ADR                                                       | Decision                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| [ADR-001](docs/adr/ADR-001-zod-first-contracts.md)        | Zod-first hand-authored schemas over OpenAPI codegen       |
| [ADR-002](docs/adr/ADR-002-bearer-token-auth-strategy.md) | Bearer token via Strategy pattern; per-worker storageState |
| [ADR-003](docs/adr/ADR-003-reference-application.md)      | automationexercise.com as reference application            |
| [ADR-004](docs/adr/ADR-004-package-publishing.md)         | Package publishing deferred to post-v1                     |

**Why Zod-first schemas?** Hand-authored Zod schemas over OpenAPI codegen keeps contract definitions co-located with tests, gives compile-time type safety across API and UI layers, and avoids the generated-code drift that silently breaks CI.

**Why Bearer token Strategy pattern?** Auth is injected as a pluggable `AuthStrategy` so individual tests never call login endpoints directly — this isolates auth complexity, enables per-worker `storageState` caching, and makes swapping auth mechanisms per environment a one-line fixture change.

**Why Playwright fixtures?** Fixtures compose the full test context (authenticated client, page objects, pre-seeded data) declaratively — each test states what it needs, not how to set it up. This eliminates setup copy-paste and makes parallel isolation trivially safe.

See [docs/architecture.md](docs/architecture.md) for the full architectural narrative.

---

## Author

**Lazar Endarov** — QA / Quality Engineering Lead · [LinkedIn](https://www.linkedin.com/in/lazar-endarov-32b27b3a/)

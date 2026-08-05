# Framework Architecture

Living document describing the structure, dependency model, and key design principles of the Playwright API + UI Contract Testing Framework.

## Package structure

The monorepo is divided into two tiers with a strict one-way dependency constraint:

```
packages/               Reusable libraries — no domain or app-specific knowledge
├── api-client          Generic HTTP client: retry, auth strategy, interceptors
├── contracts           Zod schemas for API response shapes + inferred TS types
└── ui-core             Playwright page/component base classes and auto-fixtures

apps/
└── e2e-tests           All test suites, fixtures, page objects, services, config
```

**Dependency direction is one-way and enforced by ESLint `no-restricted-imports`:**

```
apps/e2e-tests  →  packages/api-client
apps/e2e-tests  →  packages/contracts
apps/e2e-tests  →  packages/ui-core

packages/*      ↛  apps/*             (blocked)
api-client      ↛  contracts          (blocked — schema-agnostic by design, ADR-004)
contracts       ↛  api-client         (blocked)
ui-core         ↛  api-client         (blocked)
```

## Request lifecycle

Every API call flows through:

```
Call site (test or service)
  → HttpClient.get/post/put/delete/postMultipart/putMultipart/deleteMultipart
  → RequestBuilder (applies baseURL, queryParams, headers)
  → AuthManager.authenticate()  →  BearerTokenStrategy
  → LoggingInterceptor.onRequest()
  → fetch() with RetryPolicy (3 attempts, 1s/2s/4s backoff)
  → LoggingInterceptor.onResponse()
  → ValidationInterceptor.onResponse()  →  schema.safeParse(body)
  → ApiResponse<T> returned to call site
```

- 5xx, 429 (`Retry-After` honored), and `TypeError` are retried.
- `Authorization` and `Cookie` headers are always redacted before logging.
- `ContractViolationError` is thrown on schema mismatch.

## Auth and worker isolation

```
Worker 0 startup                 Worker 1 startup
  StorageStateManager               StorageStateManager
    getOrCreate(0, loginFn)           getOrCreate(1, loginFn)
      WORKER_0_EMAIL / PASSWORD         WORKER_1_EMAIL / PASSWORD
      browser.newContext()              browser.newContext()
      page.goto(/login) + fill          page.goto(/login) + fill
      ctx.storageState({ path })        ctx.storageState({ path })
  playwright/.auth/worker-0.json    playwright/.auth/worker-1.json
       ↓  (reused for all tests in worker 0)
  authenticatedPage = newContext({ storageState, baseURL })
```

Worker credentials are sourced from `WORKER_N_EMAIL` / `WORKER_N_PASSWORD` environment variables. Passwords live in GitHub Secrets only — never committed.

## Fixture chain

```
baseTest          (packages/ui-core)
  └── _consoleMonitor [auto, no browser dep]

apiTest           (apps/e2e-tests/fixtures/api.fixture.ts)
  └── apiClient   [unauthenticated HttpClient]

authTest          (apps/e2e-tests/fixtures/auth.fixture.ts)
  ├── _storageStatePath  [worker-scoped — login runs once per worker]
  └── authenticatedPage  [test-scoped — fresh context per test]

dataTest          (apps/e2e-tests/fixtures/data.fixture.ts)
  ├── userBuilder
  ├── productBuilder
  ├── userFactory
  └── testDataCleanup    [LIFO teardown after each test]

        ↓ exported as `test` from fixtures/index.ts
```

## Test taxonomy

| Location               | Pattern                                     | Browser | Credentials |
| ---------------------- | ------------------------------------------- | ------- | ----------- |
| `tests/api/`           | HTTP → assert status + body values          | No      | No          |
| `tests/contract/`      | HTTP → Zod `safeParse()` → assert no errors | No      | No          |
| `tests/ui/`            | Navigate → interact → assert visible state  | Yes     | Yes         |
| `tests/hybrid/`        | API setup → UI validate → API verify        | Yes     | Yes         |
| `tests/reference-app/` | `@reference-app` tagged, isolated CI job    | Yes     | Yes         |

## CI topology

```
PR to main  (required checks — gate merge)
├── quality-gate     build · typecheck · lint · format
├── api-tests        --project=api       (no browser)
├── contract-tests   --project=contract  (no browser)
└── smoke-tests      --project=smoke     (browser + credentials)

Push to main  (after smoke-tests passes)
└── regression       --project=regression  (browser + credentials, retries: 2)

Scheduled nightly
├── contract-drift.yml   --project=contract  vs. live staging (06:00 UTC)
└── reference-app.yml    --project=reference-app              (02:00 UTC)
```

## Further reading

- [ADR-001](adr/ADR-001-zod-first-contracts.md) — Zod-first instead of codegen
- [ADR-002](adr/ADR-002-bearer-token-auth-strategy.md) — Auth strategy and worker isolation model
- [ADR-003](adr/ADR-003-reference-application.md) — Why automationexercise.com
- [ADR-004](adr/ADR-004-package-publishing.md) — Package publishing deferred to post-v1

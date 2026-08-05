# ADR-002: Bearer Token Authentication via Strategy Pattern

**Status:** Accepted
**Date:** 2024-10-01
**Deciders:** QA Architect

---

## Context

Tests require authentication at two layers:

1. **API layer** — each HTTP request must carry a bearer token in the `Authorization` header.
2. **Browser layer** — UI tests need a logged-in session, persisted as Playwright `storageState` to avoid re-running the login flow on every test.

The framework must also support future client projects that use OAuth2, OIDC, or cookie-based auth without requiring changes to the HTTP client or test code.

## Decision

Implement the `AuthStrategy` interface in `packages/api-client`. Ship `BearerTokenStrategy` as the sole v1 implementation.

```
AuthStrategy (interface)
  └── BearerTokenStrategy  (v1 — bearer token via POST /api/verifyLogin)
  └── OidcClientCredentialsStrategy  (future)
  └── SessionCookieStrategy           (future)
```

**API auth:** `BearerTokenStrategy.authenticate(config)` injects `Authorization: Bearer <token>`. Token is acquired on first use and cached in memory for the worker's lifetime. On 401, the strategy invalidates the cache and re-acquires once before propagating the error.

**Browser auth:** `StorageStateManager` writes `playwright/.auth/worker-N.json` after a browser-driven login. The `_storageStatePath` fixture is worker-scoped — login runs at most once per worker per test run. The `authenticatedPage` fixture creates a fresh browser context per test using the cached state.

**Swapping strategies** requires implementing `AuthStrategy` and registering it in `AuthManager`. `HttpClient` is unchanged.

## Consequences

**Positive:**

- Per-worker `storageState` caching eliminates redundant browser logins across hundreds of parallel tests.
- Auth is decoupled from the HTTP client — adding OAuth2/OIDC requires no changes to `HttpClient`, `ValidationInterceptor`, or any test file.
- Token invalidation on 401 is contained inside the strategy.

**Negative:**

- Cookie-based and OIDC flows require new strategy implementations (not available in v1).
- Worker accounts must be pre-seeded via the `seed:workers` script and stored as secrets — one setup step before first CI run.

## Alternatives rejected

| Option                              | Rejection reason                                                  |
| ----------------------------------- | ----------------------------------------------------------------- |
| Per-test browser login              | Adds ~2–4 s per test; unacceptable at hundreds of parallel tests  |
| Single shared token across workers  | Session contention; simultaneous token expiry affects all workers |
| Hardcoded auth header in HttpClient | Cannot be extended without modifying the client                   |

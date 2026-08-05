# ADR-003: automationexercise.com as the Reference Application

**Status:** Accepted
**Date:** 2024-10-01
**Deciders:** QA Architect

---

## Context

The framework needs a target application to develop and validate all four test types (API, contract, UI, hybrid) before being deployed to real client projects. The application must:

1. Expose both a REST API and a browser UI over the same domain.
2. Support user registration/login, product browsing, and cart/order workflows.
3. Be publicly accessible without infrastructure provisioning.
4. Have enough API surface to author meaningful contract schemas.

## Decision

Use `https://automationexercise.com` as the v1 reference application.

| Aspect          | Detail                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| API base        | `https://automationexercise.com/api`                                                  |
| UI base         | `https://automationexercise.com`                                                      |
| Domains covered | Auth, user CRUD, product list/search, brand list                                      |
| CI isolation    | `reference-app.yml` — nightly + `workflow_dispatch` only, **not** a required PR check |
| Test tag        | `@reference-app` — runs in a dedicated Playwright project                             |

## API quirks (captured in schemas and services)

- All responses return HTTP 200; the real status lives in `responseCode` inside the response body.
- `price` fields are strings (`"Rs. 500"`), not numbers — `ProductSchema` uses `z.string()`.
- All write endpoints (`createAccount`, `updateAccount`, `deleteAccount`, `verifyLogin`) use form-encoded bodies — `HttpClient.postMultipart/putMultipart/deleteMultipart` were added to accommodate this.
- User creation and login use different endpoints: `POST /api/createAccount` vs `POST /api/verifyLogin`.

## Consequences

**Positive:**

- No infrastructure provisioning or test-data lifecycle management — public site.
- Covers all hybrid test patterns: API creates state → UI validates → API verifies backend.
- Third-party uptime does not block PR merges (isolated CI job).

**Negative:**

- Tests depend on a third-party service with no uptime SLA; nightly failures are expected occasionally.
- The reference app schemas are specific to this application — they are replaced when the framework is onboarded to a real client project.

## Alternatives rejected

| Option                                | Rejection reason                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| JSONPlaceholder / reqres.in           | Read-only or simulated writes; cannot validate real user + cart state         |
| Local mock server (e.g., json-server) | Eliminates the value of testing a real HTTP stack; adds infrastructure        |
| Internal staging environment          | Requires access credentials and infrastructure that cannot be shared publicly |

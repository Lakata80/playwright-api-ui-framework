# Contributing

## Development setup

1. Fork and clone the repository.
2. Install dependencies: `npm ci`
3. Set up your local environment:
   ```sh
   cp apps/e2e-tests/src/config/environments/.env.local.example \
      apps/e2e-tests/src/config/environments/.env.local
   ```
4. Seed worker accounts: `npm run -w @framework/e2e-tests seed:workers`
5. Verify the setup: `npm run -w @framework/e2e-tests test:api`

---

## Commit conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via `commitlint`. The `pre-commit` hook runs lint-staged (ESLint + Prettier) on staged files.

```
<type>(<scope>): <short summary in present tense>

Types:  feat | fix | refactor | test | docs | chore | ci | perf
Scopes: api-client | contracts | ui-core | e2e-tests | ci | docker
```

**Examples:**

```
feat(contracts): add CartSchema and CartItemSchema
fix(api-client): honour Retry-After header on 429
test(e2e-tests): add checkout hybrid test suite
docs: update env var table in README
ci: add Playwright browser cache step to smoke-tests job
```

---

## Making a pull request

1. Create a feature branch from `main`.
2. Write or update tests for changed behaviour.
3. Run all checks locally before pushing:
   ```sh
   npm run build
   npm run typecheck
   npm run lint
   npm run format:check
   npm run -w @framework/e2e-tests test:api
   npm run -w @framework/e2e-tests test:smoke
   ```
4. Submit a PR targeting `main`. Required checks run automatically.

The `regression` job runs only on merge to `main`, not on PRs.

---

## Adding a new test

### API test (`src/tests/api/`)

- Import `test` and `expect` from `../../fixtures` (not from `@playwright/test` directly).
- Use the `apiClient` fixture for unauthenticated HTTP, or instantiate a service (`UserApiService`, `ProductApiService`, etc.) for domain-level calls.
- Tag at least one test per spec file with `@smoke`.
- Use `testDataCleanup.register()` immediately after creating any test data.

### Contract test (`src/tests/contract/`)

- Tag every test with `@contract`.
- Assert **only schema shape** — `safeParse` result has no errors. Do not assert specific values.
- Keep all schema imports from `@framework/contracts`; never duplicate inline.

### UI test (`src/tests/ui/`)

- Use `authenticatedPage` for pages that require login.
- Use the raw `page` fixture only for login-flow tests (where the auth UI is the subject under test).
- One `@smoke` tag per spec file on the most critical user path.

### Hybrid test (`src/tests/hybrid/`)

Follow the four-step pattern:

```
1. API creates state           userService.createAccount(userData)
2. UI validates behaviour      loginPage.login(email, password)
3. API verifies backend state  userService.getUserByEmail(email)
4. Teardown                    testDataCleanup.register(() => userService.deleteAccount(...))
```

Register cleanup at the earliest point after data is created — `testDataCleanup` is LIFO and runs after each test even on failure.

---

## Updating a Zod schema

1. Edit the schema in `packages/contracts/src/schemas/<domain>/`.
2. Run the contract suite immediately:
   ```sh
   npm run -w @framework/e2e-tests test:contract
   ```
3. If a test fails, the live API has drifted — update the schema to match and describe the change in the PR body.
4. TypeScript types are auto-derived from the updated schema via `z.infer`; no separate type file changes are needed.

---

## Adding a new page object

1. Create `apps/e2e-tests/src/pages/MyPage.ts` extending `BasePage` from `@framework/ui-core`.
2. Declare locators as `readonly Locator` properties initialised in the constructor.
3. Override `waitForLoad()` to wait for a stable anchor element on the page.
4. Methods expose business actions (`login(email, password)`, `searchFor(term)`); assertions stay in tests.

## Adding a new component

1. Create `apps/e2e-tests/src/components/MyComponent.ts` extending `BaseComponent`.
2. Accept a `root: Locator` parameter scoped to the component's DOM subtree.
3. Scope all child locators to `this.root.locator(...)`, never to the page.

---

## Adding a fixture

1. Extend the last fixture in the chain (`dataTest` from `data.fixture.ts`).
2. Update the exports in `src/fixtures/index.ts` so `test` includes your new fixture.
3. Use `{ scope: 'worker' }` for expensive, once-per-worker setup (e.g., auth); default (`test`) for per-test state.
4. Always `await use(value)` inside the fixture — teardown code after `use()` runs automatically.

---

## Package boundary rules

ESLint enforces these boundaries at CI time. Violations are errors, not warnings.

| Rule                                                            | Why                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/*` must not import from `apps/*`                      | Packages are reusable libraries; they must not depend on the consumer                       |
| `packages/api-client` must not import from `packages/contracts` | The HTTP client is schema-agnostic — schemas are passed at the call site (ADR-004)          |
| No `process.env` access outside `apps/e2e-tests/src/config/`    | All env reads go through `EnvironmentConfig`, which validates and freezes config at startup |

---

## Flaky tests

If a test intermittently fails for a reason unrelated to the code under test:

1. Add the `@flaky` tag to the test.
2. This moves it into the `flaky-quarantine` Playwright project (`retries: 3`, not a required CI check).
3. Open an issue with the test file path and the observed failure pattern.
4. Triage ownership is determined by `.github/CODEOWNERS`.
5. The goal is to fix and remove the `@flaky` tag, not to leave tests permanently quarantined.

---

## Code quality reference

```sh
npm run build              # Build all packages (required before running tests)
npm run typecheck          # tsc --noEmit across all workspaces
npm run lint               # ESLint across all .ts files
npm run lint:fix           # ESLint with --fix
npm run format             # Prettier --write
npm run format:check       # Prettier --check (used in CI)
```

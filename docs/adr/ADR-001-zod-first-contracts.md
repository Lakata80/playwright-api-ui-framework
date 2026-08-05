# ADR-001: Zod-First Contract Schemas

**Status:** Accepted
**Date:** 2024-10-01
**Deciders:** QA Architect

---

## Context

The framework needs a mechanism to define and enforce REST API contract correctness in TypeScript. Three approaches were evaluated:

1. **Generate from OpenAPI spec** — Requires an accurate, maintained spec from the server team. Most client projects at framework adoption time do not have one.
2. **Runtime-only JSON Schema** — No TypeScript integration; types must be maintained as a separate concern from validation logic.
3. **Hand-authored Zod schemas** — A single file both validates the raw response at runtime and infers the TypeScript type at compile time via `z.infer<typeof Schema>`.

## Decision

Adopt **Zod-first, hand-authored schemas** stored in `packages/contracts`.

- Each API endpoint domain gets its own schema file.
- TypeScript types are derived from schemas via `z.infer` — no separate type file.
- `ValidationInterceptor` in `packages/api-client` calls `schema.safeParse(body)` on every response when a schema is provided at the call site. On failure it throws `ContractViolationError` with path + expected + received.
- Schema drift is detected via the `contract-drift.yml` CI job, which runs the `@contract` test suite against the live staging environment on a nightly schedule.
- The `ContractAdapter` interface provides a named seam to swap in an OpenAPI-backed adapter for future clients who maintain an accurate spec — no changes to `HttpClient` or any test file would be required.

## Consequences

**Positive:**

- No codegen toolchain — no spec file, no binary, no generation step in CI.
- TypeScript types are always consistent with runtime validation by construction.
- Contract tests are structurally decoupled from business tests: they assert only shape, not values.

**Negative:**

- Hand-authored schemas can drift from the live API between nightly drift-detection runs.
- For APIs with many endpoints (> 50), hand-authoring is labour-intensive. The `ContractAdapter` seam mitigates this for future clients via an OpenAPI adapter.

## Alternatives rejected

| Option                          | Rejection reason                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `openapi-typescript` codegen    | Requires an accurate, maintained spec; most clients do not have one at adoption time |
| `zod-openapi` / reverse codegen | Adds generation complexity for no consumer benefit in v1                             |
| JSON Schema only                | Weak TypeScript integration; types must be maintained separately from validation     |

# ADR-004: Package Publishing Deferred to Post-v1

**Status:** Accepted
**Date:** 2024-10-01
**Deciders:** QA Architect

---

## Context

`packages/api-client` is generic and schema-agnostic — it contains no domain knowledge and could in principle be published to npm and reused across client projects. `packages/contracts` encodes one application's API shapes and must remain private.

The question is whether to publish `api-client` in v1 alongside the initial framework release.

## Decision

**Neither package is published in v1.**

- `packages/api-client` — `"private": false` in `package.json`, but no `publishConfig`, `prepublishOnly` script, or semantic-release wiring. Ready to publish structurally but not operationally.
- `packages/contracts` — `"private": true`. Never published.

Client projects in v1 adopt the framework by forking or copying the repository.

**Pre-conditions for publishing `api-client` in a future release:**

1. A concrete second consumer outside this monorepo exists and needs the package independently.
2. `zod` is moved to `peerDependencies` (consumers supply their own compatible version).
3. A `prepublishOnly` script running typecheck + tests is added.
4. A CHANGELOG generation mechanism (e.g., `semantic-release` or `changesets`) is configured scoped to `packages/api-client`.
5. `apps/e2e-tests` is updated to consume from the registry rather than the workspace reference.

## Consequences

**Positive:**

- No npm registry infrastructure, access token management, or semver discipline in v1.
- Each client project can extend or fork `contracts` freely without upstream coordination.
- Publishing infrastructure is added only when there is a proven second consumer.

**Negative:**

- Bug fixes to `api-client` must be manually propagated to each client project fork.
- No canonical version to pin — client projects may diverge from the reference implementation over time.

## Alternatives rejected

| Option                                                                  | Rejection reason                                                                       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Publish immediately to a private registry (Verdaccio / GitHub Packages) | Adds infrastructure and versioning ceremony before a proven second consumer exists     |
| Git submodule                                                           | Poor developer experience; conflicts with npm workspaces dependency resolution         |
| Monorepo-per-client                                                     | Maximally isolated but eliminates reuse entirely; defeats the purpose of the framework |

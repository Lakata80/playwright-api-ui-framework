# Multi-stage build for containerised e2e test execution.
#
# Usage:
#   docker build -t pw-framework -f docker/Dockerfile .
#   docker run --env-file apps/e2e-tests/src/config/environments/.env.staging \
#              -e WORKER_0_EMAIL=... -e WORKER_0_PASSWORD=... \
#              pw-framework

# ── Stage 1: install workspace dependencies (layer-cached) ──────────────────
FROM node:20-slim AS deps
WORKDIR /app

# Copy manifests only — triggers npm ci only when lock file or package.json changes.
COPY package*.json ./
COPY packages/api-client/package.json packages/api-client/
COPY packages/contracts/package.json packages/contracts/
COPY packages/ui-core/package.json packages/ui-core/
COPY apps/e2e-tests/package.json apps/e2e-tests/

RUN npm ci

# ── Stage 2: build TypeScript packages ──────────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build

# ── Stage 3: test runner ─────────────────────────────────────────────────────
# Uses the official Playwright image which includes Chromium and all system deps.
# Pin to the same minor version as @playwright/test in apps/e2e-tests/package.json.
FROM mcr.microsoft.com/playwright:v1.47.0-noble AS runner
WORKDIR /app

COPY --from=builder /app .

ENV ENV=staging \
    CI=true

WORKDIR /app/apps/e2e-tests

# Default: run the regression suite. Override at runtime:
#   docker run pw-framework npx playwright test --project=smoke
#   docker run pw-framework npx playwright test --project=api
CMD ["npx", "playwright", "test", "--project=regression"]

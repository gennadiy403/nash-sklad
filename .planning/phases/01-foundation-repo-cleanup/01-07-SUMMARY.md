---
phase: 01-foundation-repo-cleanup
plan: 07
subsystem: infra
tags: [ci, github-actions, lint, test, build, matrix, node-20]

requires:
  - phase: 01-foundation-repo-cleanup/01-03
    provides: Zod env validators (need dummy NEXT_PUBLIC_* at build time)
  - phase: 01-foundation-repo-cleanup/01-04
    provides: Vitest test scripts in both workspaces
  - phase: 01-foundation-repo-cleanup/01-05
    provides: Sentry SDK + source-maps plugin (uses SENTRY_AUTH_TOKEN secret)
  - phase: 01-foundation-repo-cleanup/01-06
    provides: ESLint flat config at repo root (consumed by lint step)
provides:
  - GitHub Actions CI workflow (.github/workflows/ci.yml)
  - Matrix lint + test + build across apps [landing, app]
  - Build env dummies so Zod validators pass without real credentials
  - Conditional Sentry source-maps upload via SENTRY_AUTH_TOKEN secret
affects: [phase-02, any future phase modifying lint/test/build scripts, branch protection policy]

tech-stack:
  added: [actions/checkout@v4, actions/setup-node@v4]
  patterns:
    - Matrix job over workspace apps with fail-fast:false
    - Dummy env vars at build step (NEXT_PUBLIC_SUPABASE_ANON_KEY ≥20 chars for Zod .min(20))
    - Root package-lock.json as single cache-dependency-path for npm workspaces

key-files:
  created:
    - .github/workflows/ci.yml
  modified: []

key-decisions:
  - Single workflow with matrix over [landing, app] instead of two parallel workflows — one file, one merge-gate signal, fail-fast:false keeps diagnostics independent
  - SENTRY_AUTH_TOKEN passed as secret env var (Vite plugin silent-skips when empty) — build never fails on missing Sentry config
  - Dummy NEXT_PUBLIC_SUPABASE_ANON_KEY set to 43-char string to satisfy Zod `.min(20)` validator at Next.js build time

patterns-established:
  - "CI matrix across workspaces: strategy.matrix.app = [landing, app] + npm run <script> --workspace=apps/${{ matrix.app }}"
  - "Build env dummies pattern for apps with Zod env schemas — supply values shaped to pass validation, not real credentials"

requirements-completed: [FOUND-04]

duration: ~4min
completed: 2026-04-21
---

# Phase 01 Plan 07: GitHub Actions CI Summary

**GitHub Actions CI with matrix lint+test+build across landing/app workspaces; fail-fast:false; build env dummies satisfy Zod validators; SENTRY_AUTH_TOKEN wired for conditional source-maps upload.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-21T11:14:00Z
- **Completed:** 2026-04-21T11:18:00Z
- **Tasks:** 2 (1 automated + 1 human-action checkpoint)
- **Files modified:** 1 created

## Accomplishments
- `.github/workflows/ci.yml` created with `pull_request` and `push` triggers on `main`
- Matrix strategy `app: [landing, app]` with `fail-fast: false`
- Node 20 + npm cache keyed on root `package-lock.json`
- Build step env block supplies `NEXT_PUBLIC_*` dummies so `apps/app` Zod env validator passes without real Supabase/Sentry credentials
- `SENTRY_AUTH_TOKEN` sourced from repo secret; Vite Sentry plugin silent-skips if unset
- Developer confirmed via checkpoint: secret set and branch protection enforced on `main`

## Task Commits

1. **Task 1: Create .github/workflows/ci.yml with matrix lint+test+build** — `1d5bb66` (ci)
2. **Task 2: SENTRY_AUTH_TOKEN + branch protection (human-action)** — no commit; developer action in GitHub UI, confirmed via resume-signal

## Files Created/Modified
- `.github/workflows/ci.yml` — GitHub Actions workflow, matrix lint+test+build on PR/push to main

## Decisions Made
- None beyond plan — YAML content taken verbatim from PATTERNS §23 / RESEARCH §Pattern 6

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- `npx actionlint` is not an npm-distributable binary (no `actionlint` package on npm). Fell back to `npx js-yaml` structural YAML validation, which passed. GitHub will validate the workflow schema on first push.

## User Setup Required

Developer confirmed via checkpoint resume-signal: `approved: secret + branch protection enforced`.

- `SENTRY_AUTH_TOKEN` repository secret is set (source-maps upload enabled in CI)
- Branch protection rule active on `main`: required status checks `test (landing)` and `test (app)` must pass before merge

## Next Phase Readiness

- CI foundation is live. Any regression of `no-console` (Plan 06), failing Vitest (Plan 04), or broken Zod env validator (Plan 03) will now fail CI and block merge.
- Phase 01 has one remaining plan: **01-08 (Cloudflare Pages migration for landing)**. Wave 7 did not mark the phase complete — phase verification is intentionally deferred until Wave 8 finishes.
- The first CI run must be triggered by pushing commit `1d5bb66` to `origin/main` (or opening a PR that targets `main`). Until then, the matrix job names `test (landing)`/`test (app)` will not appear as selectable required checks. The developer confirmed they have already handled this.

---
*Phase: 01-foundation-repo-cleanup*
*Completed: 2026-04-21*

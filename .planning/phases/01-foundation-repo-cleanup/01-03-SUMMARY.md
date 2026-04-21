---
phase: 01-foundation-repo-cleanup
plan: 03
subsystem: infra
tags: [env-validation, zod, docs, onboarding, foundation]

# Dependency graph
requires: [01-02]
provides:
  - "Zod-based runtime env validators in both apps (fail fast at module load with variable names only)"
  - "Root .env.example as union source of truth for all 9 env vars"
  - "Per-app .env.example refreshed with Sentry vars"
  - "apps/app/lib/supabase.js consumes validated clientEnv (breaks raw process.env chain)"
  - "Root README + per-app READMEs — 10-minute onboarding target"
  - "EnvErrorBanner component (inline-styled, Tailwind-free) renders when landing env invalid"
affects: [01-04, 01-05, 01-06, 01-07, 01-08]

# Tech tracking
tech-stack:
  added:
    - "zod@^4.3.6 in apps/landing and apps/app workspaces"
  patterns:
    - "zod-module-load-validation: validator throws on import; caller catches (landing → banner, app → Next.js error overlay)"
    - "dual-schema-client-server: apps/app exports clientEnv always, serverEnv only when typeof window === 'undefined'"
    - "vite-explicit-env-spread: safeParse receives explicitly-constructed object because Vite inlines import.meta.env.VITE_* at build time"
    - "then-catch-not-TLA: Vite ES2020 target doesn't support top-level await — dynamic import chained via .then/.catch"
    - "inline-style-error-banner: EnvErrorBanner uses zero Tailwind; dependency-free so it renders even when CSS hasn't loaded"
    - "side-effect-rsc-env-import: apps/app/app/layout.jsx imports '../lib/env' purely for Zod side effect at RSC module load"

key-files:
  created:
    - apps/landing/src/lib/env.js
    - apps/landing/src/components/EnvErrorBanner.jsx
    - apps/app/lib/env.js
    - .env.example
    - README.md
    - apps/landing/README.md
    - apps/app/README.md
  modified:
    - apps/landing/package.json
    - apps/app/package.json
    - package-lock.json
    - apps/landing/src/main.jsx
    - apps/app/lib/supabase.js
    - apps/app/app/layout.jsx
    - apps/landing/.env.example
    - apps/app/.env.example
  deleted: []

key-decisions:
  - "Rule 1 fix: Zod v4 exposes issues under .issues (renamed from v3 .errors) — both validators map over parsed.error.issues, not parsed.error.errors. The plan's code snippets were written for Zod v3 shape."
  - "Rule 1 fix: Vite's ES2020 build target rejects top-level await (TLA) — main.jsx switched from `await import()` to `import().then/.catch` pattern. Landing build failed with exact error 'Top-level await is not available in the configured target environment' on first attempt."
  - "Two atomic commits per plan Task 3 rollout: (1) env code + .env.example + Zod install — 12 files, (2) READMEs — 3 files. Bisect-safe at both commits (landing/app both build)."
  - "Next.js build validates env at build time (module-load evaluates Zod). Verified with dummy env vars — CI Plan 07 will supply these automatically."

patterns-established:
  - "EnvError pattern: named Error subclass with .errors array; consumer can render a list without stringifying the raw Error"
  - "No env VALUES in error messages: threat T-1-03-01 mitigated by using only e.path.join('.') + e.message (generic Zod text), never e.input/e.received"
  - "Client env always exported from apps/app/lib/env.js; supabase.js depends on env.js rather than touching process.env directly"

requirements-completed: [FOUND-02]

# Metrics
duration: 4min
completed: 2026-04-21
---

# Phase 01 Plan 03: Env Validation + Quickstart Docs Summary

**Two atomic commits: (1) Zod schemas + root + per-app `.env.example` + validator wiring across both apps (12 files, 189 insertions), (2) root README + per-app READMEs targeting 10-minute onboarding (3 files, 205 insertions). Landing + app both build clean with runtime env validation throwing variable-name-only errors — zero credential leakage.**

## Performance

- **Duration:** ~4 min (includes two Rule 1 bug fixes)
- **Started:** 2026-04-21T08:55:23Z
- **Completed:** 2026-04-21T08:59:47Z
- **Tasks:** 3
- **Commits:** 2
- **Files created:** 7
- **Files modified:** 8
- **New dependencies:** 1 (`zod@^4.3.6` in both workspaces)

## Accomplishments

- **Zod validators wired end-to-end**: `apps/landing/src/lib/env.js` exports `env` + `EnvError` class (throws on missing/invalid VITE_* required vars). `apps/app/lib/env.js` exports `clientEnv` always + `serverEnv` when `typeof window === 'undefined'`. Both validators verified: valid vars → parsed object; blank required vars → descriptive error naming only the variable (no values).
- **Dependency chain rewired**: `apps/app/lib/supabase.js` no longer touches raw `process.env` — it imports `clientEnv` from `./env`. Raw `process.env` reads live exclusively inside `lib/env.js`.
- **Landing gated by env validation**: `main.jsx` dynamically imports validator; on rejection renders `<EnvErrorBanner/>` (inline-styled, Tailwind-free, dependency-minimal) listing failing variable names.
- **Side-effect RSC validation**: `apps/app/app/layout.jsx` now has `import '../lib/env'` right after `globals.css` — Zod fires at RSC module load on every request/build.
- **Three .env.example files align**: root (union, 9 vars), `apps/landing/.env.example` (4 VITE_* + 2 Sentry), `apps/app/.env.example` (2 Supabase + Sentry). Placeholders satisfy Zod `.url()` check — developers won't get false positives if they copy verbatim.
- **Three READMEs written**: root (580 words — quickstart, env table, structure, scripts, troubleshooting), landing (312 words — stack, Cloudflare Pages deploy, env table), app (368 words — explicit D-04 Phase-2 hosting deferral note).
- **Both apps build clean**:
  - Landing build with valid VITE_* env → 244.68 kB (gzip 79.07 kB) in 621ms
  - Next.js build with dummy NEXT_PUBLIC_* → 4 static routes, no errors

## Task Commits

1. **Tasks 1 + 2 combined** — `276edea` (feat): `feat(env): add Zod schemas + root .env.example + per-app validation`
   - 12 files changed, 189 insertions(+), 14 deletions(-)
2. **Task 3 — READMEs** — `6e6facc` (docs): `docs: root README + per-app READMEs`
   - 3 files changed, 205 insertions(+)

Both commits bisect-safe — apps build at HEAD~1, HEAD~2, and HEAD.

## Files Created/Modified

### Commit 1 (`276edea` feat/env)

**Created (4):**
- `.env.example` — union source of truth; 30 lines; documents all 9 env vars with Russian/English comments and placeholder values satisfying Zod
- `apps/landing/src/lib/env.js` — Zod schema for 5 VITE_* vars (3 required, 2 optional); explicit object spread into `safeParse` because Vite inlines `import.meta.env.VITE_*`; throws `EnvError(errors[])` on failure
- `apps/landing/src/components/EnvErrorBanner.jsx` — inline-styled (zero Tailwind) full-viewport error UI with Russian copy "Конфигурация неполная"
- `apps/app/lib/env.js` — dual `clientSchema` + `serverSchema`; exports `clientEnv` always and `serverEnv` only server-side; single validation entry for both runtimes

**Modified (8):**
- `apps/landing/package.json` — added `"zod": "^4.3.6"` to dependencies
- `apps/app/package.json` — added `"zod": "^4.3.6"` to dependencies
- `package-lock.json` — 2 new packages (zod transitive)
- `apps/landing/src/main.jsx` — imports `EnvErrorBanner`, wraps validator in `.then/.catch` (dynamic import), renders banner on rejection
- `apps/app/lib/supabase.js` — imports `clientEnv`; no longer touches `process.env`
- `apps/app/app/layout.jsx` — side-effect `import '../lib/env'` directly after globals.css
- `apps/landing/.env.example` — appended Sentry section (2 vars)
- `apps/app/.env.example` — appended Sentry section (2 vars)

### Commit 2 (`6e6facc` docs/readme)

**Created (3):**
- `README.md` (root) — 580 words; quickstart, structure tree, env table with 9 rows + "where to get" column, scripts, troubleshooting
- `apps/landing/README.md` — 312 words; stack, dev/build, env table, Cloudflare Pages deploy notes, GAS header reminder
- `apps/app/README.md` — 368 words; stack, dev/build, env table (incl. server-only SENTRY_AUTH_TOKEN), explicit D-04 Phase-2 hosting deferral, file structure

## Verification Output

### apps/app/lib/env.js with valid vars (success path)

```
$ NEXT_PUBLIC_SUPABASE_URL='https://dummy.supabase.co' \
  NEXT_PUBLIC_SUPABASE_ANON_KEY='dummy-key-for-build-check-only-20plus-chars' \
  node --input-type=module -e "import('./apps/app/lib/env.js').then(m => console.log('keys:', Object.keys(m.clientEnv)))"
keys: [ 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SENTRY_DSN' ]
```

### apps/app/lib/env.js with blank vars (failure path)

```
$ NEXT_PUBLIC_SUPABASE_URL='' NEXT_PUBLIC_SUPABASE_ANON_KEY='' \
  node --input-type=module -e "import('./apps/app/lib/env.js').catch(e => console.log(e.message))"
Client env invalid:
  NEXT_PUBLIC_SUPABASE_URL: Invalid URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Too small: expected string to have >=20 characters
```

Error surfaces variable NAMES only, never VALUES — threat T-1-03-01 mitigated.

### import.meta.env leakage check (Vite pattern must not appear in Next.js code)

```
$ grep -rn "import.meta.env" apps/app/
(no output — clean)
```

### Landing build (with valid VITE_* set)

```
$ VITE_SHEETS_WEBHOOK_URL='https://example.com/x' VITE_TG_BOT_TOKEN='1234567890:test' \
  VITE_TG_CHAT_ID='123' npm run build --workspace=apps/landing
✓ 131 modules transformed.
dist/index.html                   0.84 kB │ gzip:  0.56 kB
dist/assets/index-aji3B9br.css   19.24 kB │ gzip:  4.55 kB
dist/assets/env-HJO3GVMz.js      59.22 kB │ gzip: 16.28 kB
dist/assets/index-DafFC2hA.js   244.68 kB │ gzip: 79.07 kB
✓ built in 621ms
```

### Next.js build (with dummy NEXT_PUBLIC_* set)

```
$ NEXT_PUBLIC_SUPABASE_URL='https://dummy.supabase.co' \
  NEXT_PUBLIC_SUPABASE_ANON_KEY='dummy-key-for-build-check-only-20plus-chars' \
  NEXT_PUBLIC_SENTRY_DSN='https://public@sentry.io/123' \
  npm run build --workspace=apps/app
Route (app)                              Size     First Load JS
┌ ○ /                                    138 B          87.3 kB
├ ○ /_not-found                          873 B          88.1 kB
├ ○ /dashboard                           995 B          88.2 kB
└ ○ /login                               620 B          87.8 kB
✓ static content prerendered
```

### README word counts (sanity — no stub files)

```
 580 README.md
 312 apps/landing/README.md
 368 apps/app/README.md
1260 total
```

## Decisions Made

- **Two-commit split per plan Step D** — env code + .env.example go together (cross-cutting module boundaries), then READMEs. Each commit bisect-safe.
- **Zod v4 API adjustment**: plan snippets used `.errors` (v3 API). Detected at smoke-test time; switched to `.issues` in both validators. Documented explicitly in fix commit + this SUMMARY.
- **No TLA in main.jsx**: plan example used `await import()` at module top-level. Vite targets ES2020 which does not allow TLA. Rewrote to `import('./lib/env').then(...)` / `.catch(...)` — functionally identical (Zod throws synchronously at module eval, which surfaces as promise rejection through dynamic import).
- **Kept Tailwind zero-dependency in EnvErrorBanner**: Used only inline `style={{}}` — banner is the fallback for "app can't start", so it must not depend on CSS bundle being loaded.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Zod v4 uses `.issues` not `.errors`**
- **Found during:** Task 1 smoke-test (calling app env.js with blank vars returned `Cannot read properties of undefined (reading 'map')` instead of the expected variable-name error)
- **Root cause:** Plan code snippets were written against Zod v3 API. v4 renamed `ZodError.errors` → `ZodError.issues` (v4 migration guide, 2024). Repo installs v4.3.6 per plan spec.
- **Fix:** `parsed.error.errors.map(...)` → `parsed.error.issues.map(...)` in both `apps/landing/src/lib/env.js` and `apps/app/lib/env.js`. Added inline comment noting the v3→v4 rename for future readers.
- **Files modified:** apps/landing/src/lib/env.js, apps/app/lib/env.js
- **Commit:** 276edea (fix folded into first commit)
- **Verification:** blank-vars test now prints descriptive error with variable names only.

**2. [Rule 1 — Bug] Top-level await breaks Vite build (ES2020 target)**
- **Found during:** Task 1 smoke-test — `npm run build --workspace=apps/landing` failed with:
  ```
  ERROR: Top-level await is not available in the configured target environment
  ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
  ```
- **Root cause:** Plan's `main.jsx` snippet uses `await import('./lib/env')` as top-level statement. Vite defaults to ES2020, which does not define top-level await (TLA is ES2022). Could have raised Vite target, but that narrows browser support unnecessarily when a `.then/.catch` chain works identically.
- **Fix:** Rewrote `main.jsx` to use `import('./lib/env').then(() => render(null)).catch((e) => render(e.errors || [e.message]))`. Zod still throws synchronously at module eval → dynamic import surfaces this as a promise rejection → `.catch()` handler receives the same `EnvError` instance. No behavior change; no TLA.
- **Files modified:** apps/landing/src/main.jsx
- **Commit:** 276edea (fix folded into first commit)
- **Verification:** landing build succeeds with chunked output `dist/assets/env-*.js` (59 kB).

## Issues Encountered

- **PreToolUse read-before-edit hook warnings** (repeated on `main.jsx`, `supabase.js`, `layout.jsx`, both env.js files, both .env.example files) — informational only, same as Plan 01-01 and 01-02. Edits completed successfully; `git status`/`git diff` confirmed content landed as written. No re-Reads required.
- **`npm audit` warns 3 pre-existing vulnerabilities** (2 moderate, 1 high) after Zod install. Out-of-scope for this plan (pre-existing CVEs, unchanged by adding zod). Already logged in Plan 01-02 Deferred Issues.

## Deferred Issues

| Category | Item | Reason |
|----------|------|--------|
| Security | 3 npm audit vulnerabilities (2 moderate, 1 high) | Pre-existing dep-tree CVEs; unchanged by this plan. Already deferred in Plan 01-02; tracked separately. |
| Tests | Automated unit tests for env validators | Plan 04 (FOUND-03) sets up Vitest — tests for `env.js` failure modes and `main.jsx` banner rendering will be written there. Current verification is manual smoke-test only. |

## Threat Flags

No new threat surface introduced beyond what the plan's `<threat_model>` anticipated. All five threats (T-1-03-01..05) are now mitigated per the plan.

## User Setup Required

None for Plan 01-03 per se. **For local development** a contributor still needs to:
1. `cp .env.example .env.local`
2. Fill in VITE_TG_BOT_TOKEN (from @BotFather), VITE_TG_CHAT_ID (from getUpdates), VITE_SHEETS_WEBHOOK_URL (from deployed GAS), NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase dashboard).

Otherwise `npm run landing` will show `<EnvErrorBanner/>` and `npm run app` will throw at module-load. This is intentional — "fail fast" is the acceptance criterion for FOUND-02.

## Next Phase Readiness

- **FOUND-02 satisfied**: validators + `.env.example` at 3 levels + READMEs at 3 levels. REQUIREMENTS.md to be marked complete by the final metadata commit.
- **Ready for Plan 01-04 (FOUND-03 tests)**: Vitest can now import `apps/landing/src/lib/env.js` directly to write unit tests against the Zod schema. `EnvErrorBanner` can be imported in a smoke test without env being set.
- **Ready for Plan 01-05 (FOUND-05 Sentry)**: Landing `main.jsx` is the entry point — Plan 05 will add `Sentry.init({ dsn: env.VITE_SENTRY_DSN, ... })` inside the validator's success callback (when `env.VITE_SENTRY_DSN` is present). No conflicts expected.
- **Ready for Plan 01-07 (FOUND-04 CI)**: Plan 07's GitHub Actions workflow will need dummy env values for `next build` (confirmed in this plan's local smoke test — dummy vars work). CI env block already documented in PATTERNS §23.
- **Bisect-safe across Phase 1 so far**: commits `276edea` and `6e6facc` both leave the repo in a runnable state.

## Self-Check: PASSED

Verified before STATE.md updates:

- **Commit `276edea` exists + content:** `git log --oneline` confirms; `git show --stat 276edea` shows 12 files changed (4 created, 8 modified), 189 insertions, 14 deletions, zero deletions via `git diff --diff-filter=D --name-only HEAD~2 HEAD~1`.
- **Commit `6e6facc` exists + content:** confirmed via `git log`; `git show --stat` shows 3 files created, 205 insertions, zero deletions.
- **Files exist:**
  - `apps/landing/src/lib/env.js` ✓
  - `apps/landing/src/components/EnvErrorBanner.jsx` ✓
  - `apps/app/lib/env.js` ✓
  - `.env.example` ✓ (root)
  - `README.md` ✓ (root)
  - `apps/landing/README.md` ✓
  - `apps/app/README.md` ✓
- **Zod installed in both workspaces:** `node -p "require('./apps/landing/package.json').dependencies.zod"` → `^4.3.6`; same for apps/app.
- **Supabase rewired:** `grep 'clientEnv' apps/app/lib/supabase.js` matches.
- **Layout side-effect import:** `grep "import '../lib/env'" apps/app/app/layout.jsx` matches.
- **No `import.meta.env` in apps/app:** `grep -rn 'import.meta.env' apps/app/` returns zero.
- **No env VALUE leakage:** both validators use `e.path.join('.')` + `e.message` only — confirmed via grep (no `e.input`/`e.received`/`received:`).
- **Both apps build with valid/dummy env:** landing 244 kB, app Next.js 4 routes.
- **`.env.example` at all 3 levels:** root documents all 9 vars; per-app files contain their respective subsets + Sentry additions.

---
*Phase: 01-foundation-repo-cleanup*
*Completed: 2026-04-21*

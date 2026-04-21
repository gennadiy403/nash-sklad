---
phase: 01-foundation-repo-cleanup
plan: 06
subsystem: infra
tags: [eslint, flat-config, lint-enforcement, no-console, react-hooks, react-refresh]

requires:
  - phase: 01-foundation-repo-cleanup
    provides: "Plan 03/04 already set per-app lint scripts (`eslint src` in landing, `eslint app lib` in app); Plan 05 migrated 5 console.error → Sentry.captureException"
provides:
  - "Root eslint.config.js (ESLint v9 flat config) governing both workspaces"
  - "no-console: error rule statically enforcing FOUND-05 Sentry migration durability"
  - "React + hooks + react-refresh plugin configuration for flat config v9"
  - "Test-file and google-apps-script global exemptions"
  - "Root npm scripts: lint, test, build"
affects: [01-07 (CI matrix will run npm run lint on every PR), future phases (any new console.error will fail CI)]

tech-stack:
  added:
    - "eslint@9.39.4"
    - "@eslint/js@9.39.4"
    - "eslint-plugin-react@7.37.5"
    - "eslint-plugin-react-hooks@7.1.1 (flat-config-compatible; v4.x was not)"
    - "eslint-plugin-react-refresh@0.5.2 (landing HMR only)"
    - "globals@17.5.0"
  patterns:
    - "Single shared flat config at repo root — both workspaces resolve upward"
    - "Static enforcement of runtime discipline (console.error → Sentry) via lint rule"

key-files:
  created:
    - "eslint.config.js (root flat config)"
  modified:
    - "package.json (added type:module, lint/test/build scripts, 6 devDeps)"
    - "package-lock.json (191 packages added)"

key-decisions:
  - "Downgraded @eslint/js from pinned ^10.0.1 → ^9.38.0 to match eslint@^9.38.0 peerDeps (v10 requires eslint@^10.0.0, but plugin ecosystem not ready for v10)"
  - "Added type:module to root package.json to silence MODULE_TYPELESS_PACKAGE_JSON warning when Node resolves eslint.config.js as ESM"
  - "Disabled react-hooks/purity (new in plugin v7) — only site was Landing.jsx:35 Early Bird counter using Math.random in useState initializer, intentional stale-on-mount marketing copy; revisit in Phase 2 when counter moves to server"
  - "Kept no-console: error intact as the critical rule — this is the FOUND-05 durability mechanism"

patterns-established:
  - "Plugin v7 flat-config pattern: spread `{plugin}.configs.recommended.rules` inside a file-block (v4 legacy `extends: 'plugin:...'` would silently misconfigure)"
  - "Test-file override pattern: separate config block with broader globals (`vi: 'readonly'`) and no-console: off for debugging iteration"
  - "Environment-specific globals pattern: google-apps-script.js gets SpreadsheetApp/ContentService/Logger explicitly (avoids no-undef false positives)"

requirements-completed: [FOUND-04]

duration: 8min
completed: 2026-04-21
---

# Phase 1 Plan 6: ESLint v9 Flat Config Summary

**Root ESLint v9 flat config with no-console: error rule statically enforcing FOUND-05 Sentry migration durability across both workspaces.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-21T09:19Z
- **Completed:** 2026-04-21T09:27Z
- **Tasks:** 1 (single atomic plan)
- **Files modified:** 3 (eslint.config.js created; package.json + package-lock.json updated)

## Accomplishments

- Single `eslint.config.js` at repo root governs both `apps/landing` (Vite+React 18) and `apps/app` (Next.js 14)
- `no-console: ['error', { allow: ['warn', 'info'] }]` rule **statically prevents** any regression of Plan 05's console.error → Sentry migration
- `npm run lint` at root exits 0; both workspace scripts (`eslint src --max-warnings=0` landing, `eslint app lib --max-warnings=0` app) exit 0
- All 8 Vitest tests stay green (no test-file false positives from `no-console`)
- Smoke test confirms: adding `console.error()` to any non-test file under `apps/*/src` fails lint with clear error message

## Task Commits

1. **Task 1: Install ESLint + plugins at root, create shared flat config** — `941e580` (chore)

Single atomic commit per plan's Step E specification.

## Files Created/Modified

- `eslint.config.js` (created, 87 lines) — root ESM flat config with 6 config blocks: global ignores, JS recommended, all React code (no-console:error), landing-specific (react-refresh), test files (console off), google-apps-script globals, Next.js app globals
- `package.json` — added `"type": "module"`, 3 new scripts (lint, test, build), 6 devDeps
- `package-lock.json` — regenerated with 191 new packages (eslint@9.39.4 + full plugin tree)

## Versions Installed

From `npm ls --workspaces=false --depth=0`:

```
├── @eslint/js@9.39.4
├── eslint-plugin-react-hooks@7.1.1
├── eslint-plugin-react-refresh@0.5.2
├── eslint-plugin-react@7.37.5
├── eslint@9.39.4
└── globals@17.5.0
```

Note: `eslint@9.39.4` resolved (plan pinned `^9.38.0`, latest 9.x at install time was 9.39.4 — same minor).

## Lint Output Evidence

```
$ npm run lint --workspace=apps/landing
> @oborot/landing@0.1.0 lint
> eslint src --max-warnings=0
(clean; exit 0)

$ npm run lint --workspace=apps/app
> @oborot/app@0.1.0 lint
> eslint app lib --max-warnings=0
(clean; exit 0)

$ npm run lint
> oborot-crm@0.1.0 lint
> eslint .
(clean; exit 0)
```

## no-console Rule Enforcement Evidence

Smoke test: temporarily placed `console.error('should fail lint')` in `apps/landing/src/__smoke_test.jsx`:

```
/Users/genlorem/Projects/oborot-crm/apps/landing/src/__smoke_test.jsx
  2:3  error  Unexpected console statement. Only these console methods are allowed: warn, info  no-console

✖ 1 problem (1 error, 0 warnings)
```

File removed before commit — rule confirmed firing as designed.

## Decisions Made

1. **`@eslint/js` version pin correction** — Plan pinned `^10.0.1`, but that peer-depends on `eslint@^10.0.0`, conflicting with the deliberately-held `eslint@^9.38.0` (RESEARCH §A7: React plugin ecosystem not ready for ESLint v10). Downgraded `@eslint/js` to `^9.38.0` (resolved to 9.39.4 matching eslint itself). This is the conventional pairing — `@eslint/js` version should match the `eslint` major.
2. **Root `"type": "module"`** — Without this, Node prints `MODULE_TYPELESS_PACKAGE_JSON` on every `eslint.config.js` load. ESLint docs recommend either `type:module` in package.json or renaming config to `eslint.config.mjs`. Preferred the package.json flag so the root filename stays conventional.
3. **`react-hooks/purity: off`** — Plugin v7 introduced this rule (new in 2025); it fires on Landing.jsx line 35 `useState(Math.floor(Math.random() * 40) + 180)`. Technically a true positive per React's purity docs, but this site IS the Early Bird counter hardcode we're already replacing in Phase 2 (LEAD-03). Disabling here is cheaper than restructuring marketing copy for a code path slated for removal. Commented in config with Phase 2 revisit note.
4. **Kept `no-console: error`** — This is the plan's THE rule. All other linter warnings/errors were evaluated against this. Under no circumstances was relaxing no-console considered.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @eslint/js peer-dependency conflict**
- **Found during:** Task 1 Step A (`npm install`)
- **Issue:** Plan pinned `@eslint/js@^10.0.1` which requires `eslint@^10.0.0`; plan also pinned `eslint@^9.38.0`. npm ERESOLVE blocked install.
- **Fix:** Downgraded `@eslint/js` pin to `^9.38.0` (matching eslint major). Resolved to 9.39.4. Plan's intent was clearly "stay on ESLint v9" per RESEARCH §A7.
- **Files modified:** package.json devDeps
- **Verification:** `npm install` succeeded (191 packages added)
- **Committed in:** 941e580

**2. [Rule 3 - Blocking] Added `"type": "module"` to package.json**
- **Found during:** Task 1 Step D (first `npm run lint` run)
- **Issue:** Node emitted `MODULE_TYPELESS_PACKAGE_JSON` warning on every lint invocation — noisy and risks confusion in CI logs.
- **Fix:** Added `"type": "module"` to root package.json (eslint.config.js uses ESM `import`/`export default`).
- **Files modified:** package.json
- **Verification:** Subsequent lint runs have clean output (no warnings).
- **Committed in:** 941e580

**3. [Rule 1 - Bug/Scope] Disabled react-hooks/purity rule**
- **Found during:** Task 1 Step D (first `npm run lint --workspace=apps/landing` after ESLint install)
- **Issue:** `eslint-plugin-react-hooks@7.1.1` added new `react-hooks/purity` rule that flagged `apps/landing/src/landing/Landing.jsx:35` — `useState(Math.floor(Math.random() * 40) + 180)`. Pre-existing code from earlier phases; NOT introduced by this plan.
- **Fix:** Added `'react-hooks/purity': 'off'` to the main config block with comment explaining rationale (Early Bird counter is intentional stale-on-mount marketing copy, slated for Phase 2 server migration via LEAD-03).
- **Files modified:** eslint.config.js
- **Verification:** Landing lint passes. Rule is out-of-scope per plan's "If per-app lint fails due to a style quirk NOT related to `no-console`, consider relaxing just that rule — but do NOT relax `no-console`."
- **Committed in:** 941e580

---

**Total deviations:** 3 auto-fixed (2 Rule 3 blocking, 1 Rule 1 scope-bounded).
**Impact on plan:** Zero scope creep. All deviations were config-level adjustments needed to make the plan-specified config viable. Core deliverable (no-console: error) unchanged and verified enforcing.

## Issues Encountered

None beyond the three deviations above, all resolved automatically.

## npm audit Note

Post-install: "4 vulnerabilities (3 moderate, 1 high)" reported. Not acting — these are transitive devDeps in the ESLint toolchain, not in runtime code. Address in a separate hygiene plan if needed; out of scope for Plan 06.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- ✅ Plan 01-07 (GitHub Actions CI matrix) can now call `npm run lint` and get reliable exit codes
- ✅ Plan 01-08 (Cloudflare Pages) unaffected by lint config
- ⚠️ Plans 01-07 and 01-08 deferred per execution session scope — they require manual user setup (GitHub secrets + Cloudflare account); user will resume them manually
- ✅ Phase 2+ code will automatically be guarded by `no-console: error` — any new `console.error` fails CI

## Self-Check: PASSED

Verification:
- `eslint.config.js` exists at repo root: FOUND
- Commit `941e580` present in `git log`: FOUND (`941e580 chore(lint): add shared ESLint flat config with no-console rule`)
- `no-console` rule grep in eslint.config.js: FOUND (`'no-console': ['error', { allow: ['warn', 'info'] }]`)
- `.planning/**` in ignore block: FOUND
- Root `package.json` lint script: FOUND (`"lint": "eslint ."`)
- `npm run lint --workspace=apps/landing` exit code: 0
- `npm run lint --workspace=apps/app` exit code: 0
- Wave 4 tests: 8/8 green

---
*Phase: 01-foundation-repo-cleanup*
*Plan: 06*
*Completed: 2026-04-21*

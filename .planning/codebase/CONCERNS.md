# Codebase Concerns

**Analysis Date:** 2026-04-21

## Ongoing Monorepo Migration

**Issue:** Large-scale migration from single Vite SPA to monorepo architecture in progress.

**Files affected:**
- Root-level files deleted: `src/`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `google-apps-script.js`, `.env.example`
- New structure: `apps/landing/` (Vite + React Router), `apps/app/` (Next.js 14 + Supabase)
- Git status shows 17+ deletions at root, signaling incomplete migration

**Impact:**
- Contributors may clone and try to run from root (old project structure no longer exists)
- `.env.example` deleted — no onboarding template for new environment setup
- Inconsistent tooling: landing uses Vite/Router, app uses Next.js — different patterns and configs

**Fix approach:**
1. Create root-level `.env.example` documenting vars for both apps (or link to `apps/*/env.example`)
2. Update README with monorepo workspace setup: `npm install`, `npm run landing` vs `npm run app`
3. Ensure both apps have `.env.example` templates (currently: `apps/app/.env.example` exists, `apps/landing/.env.example` exists)
4. Consider Git cleanup: either commit deletion fully or preserve history via branches

---

## Missing Error Handling in Form Submissions

**Issue:** Network errors in form submissions are caught but silently ignored; user doesn't know if submission failed.

**Files:**
- `apps/landing/src/landing/Landing.jsx` (lines 45–67): Sheets webhook + Telegram bot calls
- `apps/landing/src/form/hooks/useForm.js` (lines 55–76): Form submission
- `apps/landing/src/segments/Marketplace.jsx` (lines 33–55): Marketplace waitlist

**Problem:**
```javascript
// Landing.jsx, useForm.js, Marketplace.jsx pattern:
if (webhookUrl) {
  try {
    await fetch(webhookUrl, { ... })
  } catch (e) { console.error(e) }  // Error logged but not shown to user
}
setSubmitting(false)
setSubmitted(true)  // Marked as success even if request failed
```

**Impact:**
- Users receive "success" confirmation even if webhook failed
- Survey/waitlist data may not reach Google Sheets
- Telegram bot errors silently fail
- No retry logic; lost submissions

**Fix approach:**
1. Add explicit error response handling (`if (!response.ok)`)
2. Set error state visible to user: show "Retry" button or error message
3. Only set `submitted: true` after successful response
4. Add fallback: if webhook fails, offer user to copy data + email manually

---

## Hardcoded Waitlist Counter

**Issue:** Early bird user count is manually updated; doesn't reflect actual data.

**File:** `apps/landing/src/landing/Landing.jsx` (lines 4–5)

**Current code:**
```javascript
const EARLY_BIRD_LIMIT = 500
const EARLY_BIRD_TAKEN = 213  // Hardcoded — not synced with actual data
```

**Impact:**
- User count shown in UI (line 166: `{EARLY_BIRD_TAKEN}`) doesn't reflect actual subscribers
- Misleading social proof if actual count differs
- Must be manually updated in code + redeployed

**Fix approach:**
1. Fetch `EARLY_BIRD_TAKEN` from API (Google Sheets via webhook, or dedicated endpoint)
2. Add to Landing component state with error boundary
3. Cache value to avoid excessive requests
4. Show estimated count with disclaimer if API unavailable

---

## Incomplete Supabase Integration

**Issue:** Next.js app has Supabase client initialized but no auth logic or data operations.

**Files:**
- `apps/app/lib/supabase.js`: Client created but never used
- `apps/app/app/(auth)/login/page.jsx`: Shows placeholder "Авторизация будет добавлена в ближайшее время"
- `apps/app/app/dashboard/page.jsx`: Dashboard shows only mockup UI

**Problem:**
- Supabase client imported but unused: `export const supabase = createClient(...)`
- Login page has no functional auth (form inputs, error handling, redirect)
- Dashboard has no actual data — displays hardcoded feature hints
- Zustand + React Query installed but never used

**Impact:**
- Credentials in `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposed in client bundle (by design, anon key is public, but ensure RLS is enforced on server)
- Auth flow is a stub — not safe for production
- App can't authenticate or fetch real data
- No tests for auth or data fetching

**Fix approach:**
1. Implement Supabase Auth (email/password or OAuth) in `apps/app/app/(auth)/login/page.jsx`
2. Add middleware to protect `/dashboard` route (verify session)
3. Create API routes or server actions to fetch user data from Supabase
4. Wire React Query to fetch inventory/sales data from Supabase
5. Add tests for auth flow and protected routes

---

## Console.error in Production Code

**Issue:** Error logging with `console.error()` remains in form submission handlers; logs leaked secrets or sensitive user input.

**Files:**
- `apps/landing/src/landing/Landing.jsx` (line 52): `console.error(e)`
- `apps/landing/src/landing/Landing.jsx` (line 66): `console.error(e)`
- `apps/landing/src/segments/Marketplace.jsx` (line 40): `console.error(e)`
- `apps/landing/src/segments/Marketplace.jsx` (line 54): `console.error(e)`

**Problem:**
```javascript
} catch (e) { console.error(e) }  // Network error printed to browser console
```

**Impact:**
- Errors visible in user's DevTools — potential information disclosure
- No monitoring/observability; errors invisible to team

**Fix approach:**
1. Remove all `console.*` calls from production code
2. Replace with error tracking service (Sentry, LogRocket, or similar)
3. If none available, suppress console in production builds

---

## Missing Environment Configuration Validation

**Issue:** Environment variables used without checking if they exist; no warnings if missing.

**Files:**
- `apps/landing/src/landing/Landing.jsx` (lines 41–43)
- `apps/landing/src/form/hooks/useForm.js` (line 57)
- `apps/landing/src/segments/Marketplace.jsx` (lines 29–31)

**Problem:**
```javascript
const webhookUrl = import.meta.env.VITE_SHEETS_WEBHOOK_URL  // No default, no error if undefined
```

If env vars not set:
- Form submits successfully (catch block swallows error)
- Webhook call with `undefined` URL fails silently
- Data never reaches Google Sheets or Telegram

**Impact:**
- New deployments without env vars appear to work but lose data
- No onboarding guide for setting up Telegram bot + Google Apps Script

**Fix approach:**
1. Create `apps/landing/.env.local` template in docs (already have `.env.example`)
2. Add validation function to check required env vars on app start
3. Show banner if webhook URL not configured: "Submissions not being saved"
4. Create deployment checklist documenting all required env vars

---

## Test Coverage: Zero Tests

**Issue:** No unit, integration, or E2E tests exist.

**Evidence:**
- No `*.test.js`, `*.spec.js`, `*.test.jsx`, `*.spec.jsx` files in codebase
- No test runner config: no Jest, Vitest, Cypress, Playwright configs

**Affected areas (high risk):**
- Form validation logic in `apps/landing/src/form/hooks/useForm.js` (line 30: `canProceed()`)
- Survey answer aggregation (lines 19–27: `toggleMulti()`)
- Form state management: step progression, answer persistence
- Supabase integration (not yet implemented, but will need tests)

**Impact:**
- Regressions in form UX invisible until user reports
- Submitted form data may be malformed (multi-select aggregation untested)
- Auth implementation (when done) will have no safety net
- Deployment with confidence impossible

**Fix approach:**
1. Add Vitest + React Testing Library (lighter than Jest for Vite)
2. Start with form validation tests: `useForm.canProceed()`, `toggleMulti()`
3. Add E2E tests for form workflow (Cypress or Playwright)
4. When auth is implemented: test protected routes, session persistence
5. Set up CI (GitHub Actions) to run tests on pull requests

---

## Security: Exposed Telegram Bot Token Risk

**Issue:** Telegram bot token stored in client environment variable; accessible in browser and git history.

**Files:**
- `apps/landing/.env.example` (line 9): `VITE_TG_BOT_TOKEN=1234567890:ABCdef...`
- `apps/landing/src/landing/Landing.jsx` (line 42): `const tgBotToken = import.meta.env.VITE_TG_BOT_TOKEN`

**Problem:**
- Vite prefix `VITE_` exposes var in client bundle (visible in browser DevTools → Network → `index-*.js`)
- If `.env` ever committed, token leaked to git history
- Token allows anyone to send messages as that bot or modify bot settings

**Impact:**
- Anyone with token can spam the Telegram chat
- Bot could be deleted or repurposed by attacker
- Chat receives malicious messages

**Fix approach:**
1. Move Telegram notifications to backend (create API route in `apps/app`)
2. Store `VITE_TG_BOT_TOKEN` on server, call from client via `/api/notify`
3. Client never sees token
4. Check git history: `git log --all --source -- .env` (if ever committed)
5. Regenerate bot token via BotFather immediately

---

## Data Persistence: Google Sheets Only

**Issue:** No backend database; all form submissions go only to Google Sheets via webhook.

**Files:**
- `apps/landing/src/form/hooks/useForm.js` (lines 59–69)
- `apps/landing/src/landing/Landing.jsx` (lines 47–51)
- `apps/landing/google-apps-script.js`: Webhook receiver

**Problem:**
- Single point of failure: if Google Sheets API unavailable or quota exceeded, data lost
- No backup: submissions exist only in Sheets (and Telegram if TG call succeeds)
- No search/analytics: growing Sheets become slow
- Manual data export/cleanup; no audit trail

**Impact:**
- Survey responses could be lost during traffic spike
- No way to deduplicate submissions
- Manual follow-up with subscribers is tedious (must use Sheets UI)

**Fix approach:**
1. Create leadgen database in Supabase (already licensed for `apps/app`)
2. Create API routes in `apps/app` for form submissions
3. Client-side validation still works (React state)
4. Backend: save to Supabase → then call Google Sheets + Telegram (redundancy)
5. Add deduplication: check email/contact before saving

---

## Inconsistent Form Data Aggregation

**Issue:** Multi-select form fields (platforms, pains, wishes) are joined to comma-separated strings for submission; no validation that all expected fields are present.

**Files:**
- `apps/landing/src/form/hooks/useForm.js` (lines 63–68)
- `apps/landing/google-apps-script.js` (lines 36–46)

**Problem:**
```javascript
// useForm.js:
body: JSON.stringify({
  ...answers,
  platforms: (answers.platforms || []).join(', '),  // Joins array to string
  pains: (answers.pains || []).join(', '),
  wishes: (answers.wishes || []).join(', '),
})

// google-apps-script.js receives as strings:
data.platforms || '',
data.pains || '',
```

**Impact:**
- Submitted data is flattened; can't reconstruct which SKU count maps to which pain
- Google Sheets doesn't know structure (all text)
- If array data is missing, defaults to empty string silently
- No validation: submitter could send garbage

**Fix approach:**
1. Keep arrays in JSON payload (don't join) — send as nested array
2. Update Google Apps Script to handle arrays (or keep as comma-separated but document format)
3. Add schema validation: check all required fields present before submit
4. Test edge cases: empty selections, double-clicks, form with all optional fields

---

## Missing 404 and Error Boundaries

**Issue:** No error boundary in React app; 404 pages handled implicitly by router.

**Files:**
- `apps/landing/src/App.jsx`: Routes defined but no catch-all route
- `apps/app/app/` (Next.js): No custom error.jsx or global error handler

**Problem:**
- Landing: Invalid routes show blank page (no 404 message)
- Next.js app: Server errors not caught; generic error page shown

**Impact:**
- Poor UX for typos in URL
- 404 rates hard to measure
- Error pages don't match branding

**Fix approach:**
1. Add catch-all route in React Router: `<Route path="*" element={<NotFound />} />`
2. Create `apps/landing/src/pages/NotFound.jsx` with branding
3. Add Next.js error boundary: `apps/app/app/error.jsx` with error logging
4. Test: broken links, network errors, redirect chains

---

## Performance: Vite dev server restart on `.env` changes

**Issue:** Landing app uses Vite; `.env` changes require dev server restart.

**Impact:**
- During development, forgot to restart → env vars not reloaded
- Env var mismatch between local env and what app sees

**Fix approach:**
1. Document: always restart dev server after `.env` changes
2. Consider: HMR + env reload (Vite supports with config)
3. Or: use `.env.local` (gitignored) for dev overrides

---

## Scaling Limits: Railway Deployment

**Issue:** Landing deployed on Railway (Vite preview server); not optimized for production.

**Files:** `railway.json` (line 8): `startCommand: "cd apps/landing && npx vite preview ..."`

**Problem:**
- Vite preview server is for local testing, not production traffic
- No caching, compression, or CDN configured
- Database: none (Google Sheets + Telegram only)

**Impact:**
- Slow first contentful paint
- High latency on geographically distributed users
- Can't handle traffic spike (no auto-scaling configured)

**Fix approach:**
1. Build landing: `vite build` → static HTML + JS → serve via nginx or Netlify
2. Add CDN (Cloudflare) in front of Railway
3. When `apps/app` launches: use Next.js server for dynamic routes, static for marketing

---

## Abandoned Files and Inconsistent Naming

**Issue:** Project name is inconsistent; git history shows "НашСклад" (NashSklad), brand is now "Оборот".

**Evidence:**
- `apps/landing/google-apps-script.js` (line 2): "НашСклад — Google Apps Script"
- `package.json` (line 2): `"name": "nashsklad"`
- `apps/landing/package.json` (line 2): `"@nashsklad/landing"`
- `ROADMAP.md`: Brand is "Оборот" (Oborot)

**Impact:**
- Confusion in git history
- Package names don't match marketing brand

**Fix approach:**
1. Rename workspace packages: `nashsklad` → `oborot-crm`
2. Update Google Apps Script header to "Оборот"
3. Document brand rename in STORY.md (already exists)

---

## Missing Deployment Documentation

**Issue:** No runbook for:
- Local development setup
- Environment variable configuration
- Deployment process
- Google Apps Script setup
- Telegram bot configuration

**Files:**
- No `README.md` in root or apps
- `.env.example` files exist but sparse documentation

**Impact:**
- New contributors or team members must reverse-engineer setup
- Deployment to production is manual / undocumented

**Fix approach:**
1. Create root `README.md` with workspace overview
2. Create `apps/landing/README.md`: dev setup, env vars, deploy to Railway
3. Create `apps/app/README.md`: Next.js setup, Supabase setup, deploy
4. Add onboarding guide: Google Apps Script + Telegram bot setup steps

---

## Fragment: Tech Debt in Dependencies

**Issue:** Framer Motion installed but never used.

**File:** `apps/landing/package.json` (line 13): `"framer-motion": "^11.0.0"`

**Evidence:**
- No imports of `framer-motion` in any component
- CSS animations used instead (Tailwind `animate-fade-in`, `animate-slide-up`)

**Fix approach:**
- Remove unused dependency: `npm uninstall framer-motion --workspace=apps/landing`
- Verify all animations work in CSS

---

*Concerns audit: 2026-04-21*

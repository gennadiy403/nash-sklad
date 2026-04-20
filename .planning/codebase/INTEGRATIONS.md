# External Integrations

**Analysis Date:** 2026-04-21

## APIs & External Services

**Marketplace Platforms (Planned):**
- Wildberries (WB) - Planned native integration (mentioned in STORY.md and ROADMAP.md)
- Ozon - Planned native integration
- Яндекс.Маркет (Yandex.Market/ЯМ) - Planned native integration

**Documentation Reference:**
- Product is described as "бизнес-CRM для продавцов маркетплейсов" (business CRM for marketplace sellers)
- Landing mentions: "Нативные интеграции с WB, Ozon и Яндекс.Маркет из коробки. Без доплат" (Native integrations with WB, Ozon, and Yandex.Market out of the box, no additional charges)
- SDK/Client: Not yet integrated (in development)
- Auth: Will use marketplace API credentials (specific implementation in progress)

**Telegram API:**
- Service: Telegram Bot API
- What it's used for: Lead notifications via Telegram when users subscribe on landing page
  - SDK/Client: `fetch()` to `https://api.telegram.org/bot{token}/sendMessage`
  - Auth: `VITE_TG_BOT_TOKEN` environment variable (Telegram bot token)
  - Chat ID: `VITE_TG_CHAT_ID` environment variable
  - Location: `apps/landing/src/landing/Landing.jsx` (lines 55-67), `apps/landing/src/segments/Marketplace.jsx`

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (project URL, public)
  - Client: `@supabase/supabase-js` v2.45.4
  - Location: `apps/app/lib/supabase.js`
  - Features: Planned authentication (auth module exists but not implemented), database, real-time

**File Storage:**
- Local filesystem only (no cloud storage configured)

**Caching:**
- Server-side: TanStack React Query (server state management)
- Client-side: Zustand (client state)
- HTTP caching: Vite preview cache

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (planned, in development)
- Implementation: OAuth flow through Supabase
- Location: `apps/app/app/(auth)/login/page.jsx` shows placeholder "Supabase Auth — в разработке" (Supabase Auth — in development)
- Status: Not yet implemented - authentication UI exists but is non-functional

## Monitoring & Observability

**Error Tracking:**
- None detected (planned for future phases)

**Logs:**
- Browser console only
- Server logs not configured

## CI/CD & Deployment

**Hosting:**
- Railway.app (configured via `railway.json`)
- Landing app deployment target
- Build command: `npm install --workspace=apps/landing && npm run build --workspace=apps/landing`
- Start command: `cd apps/landing && npx vite preview --host 0.0.0.0 --port $PORT`
- Restart policy: ON_FAILURE

**Custom Domain:**
- oborotcrm.ru (from vite.config.js allowedHosts)

**CI Pipeline:**
- None detected (planned for future phases)

## Environment Configuration

**Required env vars - Landing App (`apps/landing/.env.example`):**
- `VITE_SHEETS_WEBHOOK_URL` - Google Apps Script web app URL for form data capture
- `VITE_TG_BOT_TOKEN` - Telegram bot token (obtained from @BotFather)
- `VITE_TG_CHAT_ID` - Telegram chat ID for notifications

**Required env vars - Main App (`apps/app/.env.example`):**
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anonymous key

**Secrets location:**
- Environment files: `.env.example` files document required vars but actual secrets stored in:
  - Local `.env` files (git-ignored)
  - Railway.app dashboard environment variables (production)
  - Developer machine local configuration

## Webhooks & Callbacks

**Incoming:**
- Google Apps Script webhook - Receives form data from landing page
  - Endpoint: Specified via `VITE_SHEETS_WEBHOOK_URL`
  - Payload: JSON with form answers (platforms, pains, wishes, contact info)
  - Location: `apps/landing/src/form/hooks/useForm.js` (line 60)

**Outgoing:**
- Telegram API - Sends lead notifications
  - Endpoint: `https://api.telegram.org/bot{token}/sendMessage`
  - Payload: Chat ID and formatted message with subscriber contact
  - Location: `apps/landing/src/landing/Landing.jsx` (lines 56-66) and `apps/landing/src/segments/Marketplace.jsx`

## Data Flow

**Landing → Waitlist Capture:**
1. User enters email/Telegram handle on landing page
2. Frontend sends POST to Google Apps Script webhook with contact and timestamp
3. Google Sheets captures lead data
4. Simultaneously sends Telegram notification to team chat via bot API
5. Success page shown to user

**Landing → Form Submission:**
1. User completes multi-step questionnaire
2. Frontend collects answers (platforms used, pain points, feature requests)
3. Sends POST to Google Apps Script webhook with serialized answers
4. Google Sheets stores form responses for analysis

---

*Integration audit: 2026-04-21*

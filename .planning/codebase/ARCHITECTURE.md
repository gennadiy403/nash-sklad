# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Monorepo with two independent web applications

**Key Characteristics:**
- Workspace-based monorepo (npm workspaces) at root level with two separate apps under `apps/`
- Landing application (SPA with Vite + React Router)
- Main application (SSR with Next.js 14)
- No shared UI library or component packages yet
- Product documentation (Roadmap, Story) at root level

## Applications Architecture

### Landing App (`apps/landing/`)

**Pattern:** Single Page Application (SPA)

**Tech Stack:**
- Vite + React 18
- React Router v7 for client-side routing
- TailwindCSS for styling
- Framer Motion for animations (declared in package.json but not actively imported in analyzed code)

**Routing Structure:**
```
/ → Landing (hero, waitlist, early bird perks, feature comparison)
/form → Form (multi-step form for seller survey)
/roadmap → Roadmap (product roadmap visualization)
/internal → InternalRoadmap (internal roadmap, likely for team)
/for/marketplace → Marketplace (marketplace seller segment page)
```

**Entry Point:** `apps/landing/src/main.jsx`
- Root React app mounted to `#root` DOM node
- StrictMode enabled for development checks

**State Management:**
- React hooks-based (useState, custom hooks)
- Form state managed in `useForm()` custom hook
- No global state library (Zustand installed in main app, not landing)

**Data Flow for Form:**
1. `Landing` or `Form` page component
2. User interactions captured by `useForm()` hook
3. Form validation logic in hook (required field checks, multi-select toggles)
4. On submit: Webhook POST to Google Sheets integration + Telegram Bot notification
5. Server-side collection: Uses environment variables `VITE_SHEETS_WEBHOOK_URL`, `VITE_TG_BOT_TOKEN`, `VITE_TG_CHAT_ID`

**External Integrations:**
- Google Sheets via webhook (Google Apps Script)
- Telegram Bot API for notifications

---

### Main App (`apps/app/`)

**Pattern:** Server-Side Rendered (SSR) with Next.js App Router

**Tech Stack:**
- Next.js 14 (App Router, not Pages Router)
- React 18
- TailwindCSS for styling
- Supabase for authentication and database
- Zustand for state management (installed but not yet heavily used in analyzed pages)
- React Query (@tanstack/react-query) for server state management

**Page Structure (App Router):**
```
app/
  layout.jsx              → Root layout with metadata, body class setup
  page.jsx                → Home page (redirects to /dashboard)
  (auth)/
    login/page.jsx        → Login page (Supabase Auth - not yet implemented)
  dashboard/
    page.jsx              → Main dashboard (under construction)
```

**Entry Points:**
- `app/layout.jsx` - Root layout, server component by default
- `app/(auth)/login/page.jsx` - Auth group layout
- `app/dashboard/page.jsx` - Protected dashboard (marked with `'use client'`)

**Database & Auth:**
- Supabase client initialized in `apps/app/lib/supabase.js`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Authentication not yet implemented (placeholder UI in login page)

**Current State:**
- Landing/marketing pages built, fully functional
- Main application (dashboard) is a skeleton under development
- Dashboard currently shows feature hints instead of real functionality

---

## Data Flow

### Waitlist Submission (Landing → Sheets + Telegram)

1. User enters email/Telegram handle on landing page
2. `handleSubmit()` in `Landing.jsx` initiates POST request
3. Payload sent to `VITE_SHEETS_WEBHOOK_URL` (Google Apps Script)
4. Simultaneously, POST to `https://api.telegram.org/bot{TOKEN}/sendMessage`
5. Response: Submission confirmation UI update, no local persistence

### Form Submission (Landing → Sheets)

1. Multi-step form in `/form` route
2. User progresses through steps, answers stored in local state (answers object in `useForm()`)
3. Required fields validated before advancing
4. Final submit button collects all answers
5. Arrays (platforms, pains, wishes) joined with comma separator
6. POST to `VITE_SHEETS_WEBHOOK_URL`
7. On success: Show thank you component, clear form state

### Dashboard Access (Next.js SSR)

1. User navigates to `/dashboard` (currently `/` redirects there)
2. Server renders layout + page component
3. Page marked with `'use client'` for interactive features
4. Supabase client available via `apps/app/lib/supabase.js`
5. No authenticated data fetching implemented yet

---

## Layers

**Presentation Layer (`src/`, `app/`):**
- Landing: React components (Landing.jsx, Form.jsx, Roadmap.jsx, Marketplace.jsx)
- Main: Next.js pages with client-side components marked `'use client'`
- UI built with TailwindCSS (dark mode: bg-bg, text-white, color scheme: accent=#036ce5 or similar)

**State Management Layer:**
- Landing: React hooks (useState) + custom `useForm()` hook
- Main: Zustand store (setup ready, not actively used yet) + React Query (installed, not analyzed in used pages)

**Integration Layer:**
- Landing: Direct fetch() calls to webhooks in component/hook code
- Main: Supabase client exported from `lib/supabase.js`

**No explicit API layer yet:** Direct client-to-external-service communication

---

## Key Abstractions

**useForm Hook** (`apps/landing/src/form/hooks/useForm.js`):
- Encapsulates multi-step form state and logic
- Handles: navigation, answer collection, validation, submission
- Pattern: Custom hook returning object with state + methods

**Page Components:**
- Landing: Single page with multiple sections (hero, early bird, features, comparison)
- Form: Multi-step wizard using same hook
- Roadmap: Visual roadmap (implementation not analyzed)
- Marketplace: Segment-specific landing (implementation not analyzed)

---

## Error Handling

**Strategy:** Try-catch with silent failures

**Patterns:**
- Form submission: `try { fetch(...) } catch (e) { console.error(...) }` - submission continues even if webhook fails
- No error state UI shown to user
- Telegram notification failure doesn't block Sheets webhook

**Implication:** Users see success UI even if data didn't persist (potential UX issue)

---

## Cross-Cutting Concerns

**Logging:** 
- Console.error() on fetch failures only
- No structured logging or observability

**Validation:**
- Form: Client-side only in `canProceed()` check (required fields)
- No input sanitization visible
- No server-side validation yet

**Authentication:**
- Landing: No auth (public pages)
- Main app: Supabase Auth integration declared but not implemented
- No session management, tokens, or RBAC visible yet

**Styling:**
- TailwindCSS with dark theme (colors: bg, accent, muted, border, surface)
- Component-level CSS modules: None observed
- Inline Tailwind classes throughout

---

## Build & Deployment

**Landing:**
- Build: `npm run build` (Vite) → `dist/` folder
- Start: `npm run start` (Vite preview server on 4173 or `$PORT`)
- Deployment: Static hosting (Vercel config present at root)

**Main:**
- Build: `npm run build` (Next.js) → `.next/` folder
- Start: `npm run start` (Node.js server on port 3001)
- Deployment: Node.js/Vercel (railway.json present for Railway.app option)

---

*Architecture analysis: 2026-04-21*

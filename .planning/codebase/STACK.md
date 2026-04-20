# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- JavaScript - Modern JS (ES modules) used across both apps
- JSX - React component syntax for UI layer

## Runtime

**Environment:**
- Node.js 18+ (inferred from package.json using npm workspaces)

**Package Manager:**
- npm (v10+)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core - Landing App (`apps/landing`):**
- React 18.3.1 - UI framework for marketing site
- React Router DOM 7.13.1 - Client-side routing
- Vite 5.4.10 - Build tool and dev server
- Framer Motion 11.0.0 - Animation library

**Core - Main App (`apps/app`):**
- Next.js 14.2.5 - Full-stack React framework with server-side rendering
- React 18.3.1 - UI component framework
- React DOM 18.3.1 - React rendering engine

**State Management - Main App:**
- Zustand 4.5.5 - Lightweight client state management
- TanStack React Query 5.56.2 - Server state management and data fetching

**Styling - Both Apps:**
- Tailwind CSS 3.4.14 - Utility-first CSS framework
- PostCSS 8.4.47 - CSS transformation pipeline
- Autoprefixer 10.4.20 - Vendor prefix injection

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.45.4 - Supabase client library for authentication, database, and real-time features
- @tanstack/react-query 5.56.2 - Data fetching, caching, and synchronization
- zustand 4.5.5 - Client-side state for UI state management

**UI/UX:**
- framer-motion 11.0.0 - Smooth animations (fade-in, slide-up transitions)
- react-router-dom 7.13.1 - Client-side navigation in landing

**Build & Dev:**
- @vitejs/plugin-react 4.3.1 - Fast refresh for Vite development
- @types/react 18.3.1 - TypeScript definitions
- @types/react-dom 18.3.1 - TypeScript definitions

## Configuration

**Environment:**
- Landing: `VITE_SHEETS_WEBHOOK_URL` - Google Apps Script webhook for form submissions
- Landing: `VITE_TG_BOT_TOKEN` - Telegram bot token for notifications
- Landing: `VITE_TG_CHAT_ID` - Telegram chat ID for lead notifications
- Main App: `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- Main App: `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)

**Build:**
- `apps/landing/vite.config.js` - Vite configuration for landing page build and preview
- `apps/landing/postcss.config.js` - PostCSS configuration
- `apps/landing/tailwind.config.js` - Tailwind custom theme (dark theme with indigo accent colors)
- `apps/app/next.config.js` - Next.js configuration (minimal)
- `apps/app/postcss.config.js` - PostCSS configuration
- `apps/app/tailwind.config.js` - Tailwind custom theme

## Platform Requirements

**Development:**
- Node.js 18+
- npm package manager
- Modern browser with ES2020+ support

**Production - Landing:**
- Deployment via Railway (configured in `railway.json`)
- Node.js runtime for Vite preview server
- Custom domain: oborotcrm.ru

**Production - Main App:**
- Next.js runtime environment
- Supabase PostgreSQL database backend
- Port 3001 (configured in package.json script)

**Repository:**
- Monorepo structure using npm workspaces (`apps/*`)
- Both apps share root `node_modules` and lockfile

---

*Stack analysis: 2026-04-21*

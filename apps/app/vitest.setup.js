import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Pre-populate Supabase env so RootLayout's side-effect `import '../lib/env'`
// (Plan 03) succeeds at module-load during tests — without real secrets.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-at-least-20-chars-long'

// Mock next/navigation so client components using router hooks don't crash.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

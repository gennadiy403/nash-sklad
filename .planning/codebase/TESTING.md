# Testing Patterns

**Analysis Date:** 2026-04-21

## Test Framework

**Current State:** No automated testing framework configured

**Status:**
- No Jest, Vitest, or other test runner installed
- No `.test.*` or `.spec.*` files found in codebase
- No test config files detected (jest.config.js, vitest.config.js, etc.)
- Testing dependencies: None in package.json files

**Testing Gap:**
- The project is in early development stage (MVP/landing + early app phases)
- No test coverage exists for any functionality
- All validation and behavior verification is manual

## Manual Testing Loop (Current Approach)

**Development Mode:**

Landing App (`apps/landing`):
```bash
npm run dev  # Starts Vite dev server on default port (5173)
```
- File changes trigger hot reload
- Browser auto-refreshes

Main App (`apps/app`):
```bash
npm run dev  # Starts Next.js dev server on port 3001
```
- File changes trigger fast refresh
- Browser auto-refreshes

**Preview/Production Build:**

Landing:
```bash
npm run build && npm run preview
```
Runs production build and serves with Vite preview

Main App:
```bash
npm run build && npm run start
```
Builds for production, starts Next.js server on port 3001

## What Needs Testing (High Priority)

**Form Logic (`apps/landing/src/form/`):**
- `useForm.js` handles:
  - Step navigation (next/back)
  - Answer state management (setAnswer, toggleMulti)
  - Progress calculation
  - Submission flow with webhooks
  - Required field validation via `canProceed()`
- **Current risk:** Logic works only if manually tested step-by-step
- **Example:** QuestionBlock types (single, multi, rating, text, checkbox) have no validation tests

**Data Submission:**
- `useForm.js` lines 55-76: Webhook POST to Google Sheets
- `Landing.jsx` lines 36-71: Telegram bot integration
- No error handling if webhook fails (silent catch)
- No tests for fetch calls, JSON serialization, or retry logic

**Component Rendering:**
- FormStep.jsx (132 lines) renders conditional question types
- No tests for conditional logic (if question.type === 'multi')
- No tests for disabled state logic in ChoiceCard

**Tailwind Styling:**
- Custom animations and utilities defined in `index.css`
- No visual regression testing for responsive design
- Manual browser testing required for sm:/md:/lg: breakpoints

## Recommended Testing Strategy

**Phase 1 (Immediate):**
1. Add Vitest + React Testing Library
2. Write unit tests for `useForm.js`:
   - `canProceed()` validation logic
   - State updates (setAnswer, toggleMulti)
   - Progress calculation
3. Write integration tests for form submission flow

**Phase 2:**
1. Add component tests for form components:
   - FormStep.jsx conditional rendering
   - ChoiceCard.jsx disabled/selected states
   - RatingScale.jsx min/max logic
2. Mock webhook/Telegram API calls

**Phase 3:**
1. Add E2E tests with Playwright for user flows:
   - Complete form submission
   - Landing page conversions
   - Navigation between pages

## Current Testing Gaps

**Form Validation:**
- No tests for required field logic
- No tests for maxSelect constraint in multi-select
- Edge cases untested: empty answers, rapid clicks, network failures

**Async Operations:**
- No tests for webhook failures
- No tests for Telegram API errors
- No timeout handling tests

**Responsive Design:**
- No visual regression tests
- Breakpoint behavior untested

**Accessibility:**
- No a11y testing (ARIA labels, keyboard navigation)
- Form inputs lack proper labels in some places

## Test File Organization (When Added)

**Recommended Structure:**
```
apps/landing/src/
├── form/
│   ├── __tests__/
│   │   ├── hooks/
│   │   │   └── useForm.test.js
│   │   ├── components/
│   │   │   ├── FormStep.test.jsx
│   │   │   ├── ChoiceCard.test.jsx
│   │   │   └── RatingScale.test.jsx
│   │   └── pages/
│   │       └── Form.test.jsx
│   ├── hooks/
│   │   └── useForm.js
│   ├── components/
│   │   ├── FormStep.jsx
│   │   └── ...
│   └── pages/
│       └── Form.jsx
```

**Co-located strategy preferred:** Test file next to source in `__tests__/` subdirectory

## Known Manual Test Scenarios

**Form Flow (Landing):**
1. Navigate to /form
2. Complete profile step (choose SKU count, select platforms)
3. Click "Продолжить"
4. Complete pains step (select up to 3 pain points)
5. Rate severity 1-10
6. Select wishlist items
7. Enter name and contact (optional)
8. Agree to call checkbox
9. Click "Отправить анкету"
10. Verify ThankYou screen shows
11. Verify webhook receives data (check Google Sheets)
12. Verify Telegram notification sent

**Landing Page:**
1. View early-bird countdown (213/500)
2. Submit waitlist form with email/Telegram
3. Verify webhook submission
4. Verify Telegram notification
5. Verify "Ты в списке!" confirmation

**Navigation:**
1. Click links to /roadmap, /internal, /for/marketplace
2. Verify routing works
3. Verify back navigation works

## Environment for Testing

**Required ENV vars for manual testing:**
- `VITE_SHEETS_WEBHOOK_URL`: Google Sheets webhook endpoint
- `VITE_TG_BOT_TOKEN`: Telegram bot token
- `VITE_TG_CHAT_ID`: Telegram chat ID for notifications

All are read from `import.meta.env.VITE_*` in Vite app

**Note:** `.env.example` was deleted per git status — no template available for env setup

## Browser Testing Notes

**No Playwright/Cypress configured.**

Manual browser testing checklist:
- [ ] Test on Chrome/Safari (desktop)
- [ ] Test on iOS Safari and Chrome (mobile)
- [ ] Verify Tailwind responsive classes work
- [ ] Verify animations play smoothly
- [ ] Verify form accessibility (tab order, screen reader)

---

*Testing analysis: 2026-04-21*

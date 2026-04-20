# Coding Conventions

**Analysis Date:** 2026-04-21

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `ChoiceCard.jsx`, `FormStep.jsx`, `ProgressBar.jsx`)
- Pages: PascalCase (e.g., `Form.jsx`, `Landing.jsx`, `Dashboard.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useForm.js`)
- Data/config files: camelCase (e.g., `questions.js`)
- CSS files: lowercase with hyphens or matching component names (e.g., `globals.css`, `index.css`)

**Functions:**
- Components: PascalCase (exported as default)
- Hooks: `use` prefix + camelCase (e.g., `useForm`)
- Handlers: camelCase with `handle` prefix (e.g., `handleSubmit`, `handleClick`)
- State setters: camelCase with `set` prefix (e.g., `setAnswer`, `setSubmitted`)
- Helper functions: camelCase (e.g., `canProceed`, `toggleMulti`)

**Variables:**
- State: camelCase (e.g., `currentStep`, `submitted`, `answers`)
- Constants: UPPER_SNAKE_CASE (e.g., `EARLY_BIRD_LIMIT`, `STEPS`, `MODULES`)
- Boolean states: start with verb or adjective (e.g., `submitted`, `loading`, `disabled`)

**Types:**
- Not using TypeScript in most components, but Next.js pages use JSX
- Generic object properties follow camelCase

## Code Style

**Formatting:**
- Vite + React projects: Prettier-ready (no explicit `.prettierrc` found but clean formatting observed)
- Line length: ~100-120 characters (observed in JSX)
- Indentation: 2 spaces
- No trailing commas in JSX multiline (most cases)
- Semicolons: Present at end of statements

**Linting:**
- No ESLint config detected in project root or individual apps
- Code follows conventional React best practices without explicit linting rules

## Import Organization

**Order:**
1. React/Framework imports (`import { useState } from 'react'`, `import { useClient }`)
2. Router imports (`import { Link } from 'react-router-dom'` or Next.js imports)
3. Custom hooks (`import { useForm } from '../hooks/useForm'`)
4. Components (`import ProgressBar from '../components/ProgressBar'`)
5. Data/config files (`import { STEPS } from '../data/questions'`)
6. CSS (`import './index.css'`)

**Path Aliases:**
- Not detected; relative imports used throughout
- Pattern: `../` for sibling/parent directory navigation

## Error Handling

**Patterns:**
- `try/catch` blocks without re-throws (errors logged but silently swallowed)
- Example from `useForm.js` (line 70-72):
  ```javascript
  } catch (e) {
    console.error('Submit error:', e)
  }
  ```
- Form submission errors don't block UI or show user feedback — silent fail pattern
- No error boundaries detected in codebase
- Validation happens before submission (e.g., `canProceed()` check in Form)

## Logging

**Framework:** `console` (no logger library detected)

**Patterns:**
- `console.error()` for exceptions in async operations (Landing.jsx, useForm.js)
- No info/debug/warn logging observed
- Typically one-liner error logs without context: `console.error(e)`

## Comments

**When to Comment:**
- Very few comments in codebase
- No JSDoc/TSDoc observed
- Code structure is self-documenting (component names, clear function names)
- Magic numbers occasionally explained via constants (e.g., `EARLY_BIRD_LIMIT`)

**JSDoc/TSDoc:**
- Not used in this codebase (no TypeScript in most files)

## Function Design

**Size:**
- Components typically 30-100 lines for presentational components
- Larger components (Landing.jsx 241 lines, InternalRoadmap.jsx 451 lines) break into data structures and render sections
- Hooks remain small (useForm.js 94 lines)

**Parameters:**
- Destructured props in function signatures
- Example: `export default function ChoiceCard({ option, selected, onClick, disabled })`
- Event handlers receive event object and/or value directly

**Return Values:**
- Components return JSX
- Hooks return object with state and functions bundled
- Example from useForm: `return { step, currentStep, totalSteps, progress, answers, submitted, submitting, direction, setAnswer, toggleMulti, canProceed, next, back, submit }`

## Module Design

**Exports:**
- Default exports for all components: `export default function ComponentName()`
- Named exports for hooks: `export function useForm()`
- Data structures exported as named constants: `export const STEPS = [...]`

**Barrel Files:**
- Not used; no `index.js` files re-exporting groups of components detected

## Component Patterns

**Structure:**
- Presentational components receive data via props
- Event handlers passed as callback props (e.g., `onSetAnswer`, `onToggleMulti`)
- Components compose small subcomponents (FormStep contains QuestionBlock inline)

**State Management:**
- React hooks (`useState`) for local component state
- Zustand imported in package.json but not used yet
- React Query imported in package.json but not used yet
- No global state management currently implemented

**Props Pattern:**
- Prefer named props over spreading
- Callbacks prefixed with `on` (e.g., `onSetAnswer`, `onToggleMulti`, `onClick`)
- Boolean props: `selected`, `disabled`, `loading`
- Data props: `option`, `value`, `answers`, `question`

**Conditional Rendering:**
- Ternary operators for simple branches
- Early returns for complex conditions (e.g., Form.jsx checking `submitted` state first)
- Inline short-circuits for optional content: `{step.subtitle && <p>...}</p>`

## Styling Approach

**Framework:** Tailwind CSS with custom color scheme

**Custom Colors (from tailwind.config.js):**
- `bg`: `#0f0f13` (dark background)
- `surface`: `#1a1a24` (card/surface backgrounds)
- `border`: `#2a2a38` (dividers, borders)
- `accent`: `#6366f1` (primary interactive color, indigo)
- `accent-light`: `#818cf8` (lighter indigo for hover)
- `accent-glow`: `rgba(99,102,241,0.15)` (semi-transparent accent for overlays)
- `muted`: `#6b7280` (secondary text color)

**Class Naming:**
- Descriptive utility-first: `flex flex-col items-center justify-center`
- Layout: `w-full`, `max-w-2xl`, `mx-auto`
- Spacing: `px-6 py-3`, `mb-4`, `gap-3`
- Interactivity: `hover:border-accent/50`, `transition-all`, `disabled:opacity-50`
- Custom utilities defined in CSS (`.glow`, `.glow-sm`, `.card-hover`)

**Custom CSS Utilities (index.css, globals.css):**
- `.glow`: Box shadow with accent color (24px blur, 0.3 alpha)
- `.glow-sm`: Smaller glow effect (12px blur, 0.2 alpha)
- `.card-hover`: Transition effect + transform on hover

**Animations:**
- Defined in tailwind.config.js: `fade-in`, `slide-up`, `pulse-slow`
- Used via utility classes: `animate-fade-in`, `animate-slide-up`, `animate-pulse`

**Responsive Design:**
- Mobile-first with `sm:` breakpoints (640px+)
- Layout switches: `flex-col sm:flex-row`, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Hiding: `hidden sm:block`

## Data Flow

**Form State:**
- Centralized in `useForm()` hook
- Props drilled down to components
- No reducer pattern; state updates via simple state setters

**API Calls:**
- Made in hooks (`useForm.js`) and components (Landing.jsx)
- No data fetching library (React Query available but unused)
- Direct `fetch()` with JSON serialization
- Environment variables via `import.meta.env.VITE_*`

## Code Organization Examples

**Page Component (Form.jsx):**
- Destructure hook at top
- Compute derived values (`isLastStep`)
- Conditional render entire page state
- Structure with semantic sections: header, progress, main, footer

**Small Component (ChoiceCard.jsx):**
- Single prop destructuring
- Return JSX with conditional classes
- No additional state or logic

**Hook (useForm.js):**
- State declarations at top
- Computed values (progress, step)
- Handler functions
- Return object at end with all public API

---

*Convention analysis: 2026-04-21*

# Phase 1: Foundation & Repo Cleanup - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Монорепо приводится в production-ready состояние: ребренд кода (`nashsklad` → `oborot`), чистый git без 17 висящих удалений в working tree, документированный локальный запуск с валидацией env, минимальный тестовый стек с smoke+ключевыми хуками, CI на каждый PR (lint+tests+build), error tracking на обоих приложениях (клиент+сервер), landing как статика за CDN (не `vite preview`). Всё, что идёт дальше (лидогенерация, auth, модули, интеграции) — отдельные фазы. В Phase 1 бизнес-функциональность не меняется.

</domain>

<decisions>
## Implementation Decisions

### Хостинг landing (FOUND-06)
- **D-01:** Landing переезжает на **Cloudflare Pages** как статический билд (`vite build` → `dist/`). Railway отключается от landing (startCommand в `railway.json` удаляется или `railway.json` переносится на app-хостинг позже).
- **D-02:** Домен `oborotcrm.ru` полностью переводится на Cloudflare — nameserver change, DNS proxied через CF, TLS автоматический.
- **D-03:** Preview-деплои на каждый PR включены (CF Pages auto-preview) — используем для проверки мержа в `main` перед глобальным cache invalidation.
- **D-04:** Хостинг `apps/app` (Next.js) в Phase 1 **не решается** — остаётся локальный `npm run dev`. Production-хостинг app фиксируется ADR-ом в Phase 2 (когда появятся API routes для lead capture).

### Error tracking (FOUND-05)
- **D-05:** **Sentry cloud** как основной сервис. Free tier (5k events/мес) закрывает waitlist-стадию; upgrade на Developer $26/мес когда потребуется.
- **D-06:** Scope — **оба приложения, клиент + сервер**:
  - `apps/landing`: `@sentry/react` в `main.jsx`, source maps отгружаются в Sentry при build.
  - `apps/app`: `@sentry/nextjs` wizard (клиент + server + edge). Инфра готова к моменту появления первых API routes в Phase 2.
- **D-07:** Все `console.error` в прод-коде (перечислены в `.planning/codebase/CONCERNS.md` §Console.error) заменяются на `Sentry.captureException()`. `console.log`/`console.warn` удаляются, breadcrumbs Sentry собирает автоматически.
- **D-08:** DSN landing-а публичен (так и должно быть для client-side Sentry). Защита через inbound filters + rate limits в Sentry project settings — **Claude's Discretion**.
- **D-09:** Риск с оплатой из RU известен — если Sentry заблокирует платёж, миграция на Glitchtip self-hosted (SDK-совместим). В Phase 1 эту миграцию **не делаем**, только фиксируем как fallback в ADR.

### Тесты (FOUND-03)
- **D-10:** Стек зафиксирован: **Vitest + React Testing Library** в обоих приложениях (в `apps/landing` нативно Vite, в `apps/app` — через `vitest` с `jsdom`).
- **D-11:** Глубина — **smoke + ключевые хуки**, не широкое coverage:
  - `apps/landing`: smoke-тест (`<App/>` рендерится без падения), юнит-тесты на `useForm.canProceed()` и `useForm.toggleMulti()` (сейчас самая багоопасная логика по `CONCERNS.md §Inconsistent Form Data Aggregation`).
  - `apps/app`: smoke-тест layout + login page рендерится.
- **D-12:** Coverage target не ставим — это Foundation-фаза, Phase 2 многое перепишет (lead capture → Supabase). Широкий test suite будет имеет смысл после Phase 3 (Auth) когда контракт стабилизируется.

### CI (FOUND-04)
- **D-13:** CI провайдер — **GitHub Actions** (жёстко в FOUND-04). Один workflow `.github/workflows/ci.yml`, матрица по приложениям.
- **D-14:** Шаги на каждый PR в `main`:
  1. `npm ci` (используем workspace lockfile)
  2. **Lint** — ESLint в обоих приложениях
  3. **Tests** — `vitest run` в обоих приложениях
  4. **Build-check** — `vite build` (landing) + `next build` (app) — ловит типовые регрессии после `lint ok` но `build fail`
- **D-15:** Prettier format-check **не включаем** в CI — излишне для MVP-этапа.
- **D-16:** Pre-commit hooks (Husky/lint-staged) **не настраиваем** — соло-разработчик + Claude как исполнитель, pre-commit часто ломается на Claude-commits (amend/rebase). CI защищает `main`, локальные commits без проверок.

### Ребренд (FOUND-01)
- **D-17:** Имена пакетов: **`@oborot/landing`, `@oborot/app`**, root package → **`oborot-crm`**. Scope `@oborot` выбран за краткость и матч бренду "Оборот" (не доменному `oborotcrm.ru`).
- **D-18:** Ребренд делается **одним PR** (всё сразу), не по пакетам — объём правок небольшой, но `package.json`+lockfile перекрёстные, разделять нет смысла.
- **D-19:** Заменяем "НашСклад" → "Оборот" в:
  - `package.json` (root): `"name": "nashsklad"` → `"oborot-crm"`
  - `apps/landing/package.json`: `"@nashsklad/landing"` → `"@oborot/landing"`
  - `apps/app/package.json`: `"name"` → `"@oborot/app"`
  - `apps/landing/google-apps-script.js` header: "НашСклад — Google Apps Script" → "Оборот — Google Apps Script"
  - Любые другие вхождения `nashsklad`/`НашСклад` (grep по кодовой базе при исполнении)
- **D-20:** Git cleanup — **один коммит `chore: remove pre-monorepo root files`** перед началом остальных работ Phase 1. Удаляем из working tree: `.env.example`, `google-apps-script.js`, `index.html`, `postcss.config.js`, `src/*`, `tailwind.config.js`, `vite.config.js` на корне (всё из `git status D`).

### Env валидация и документация (FOUND-02)
- **D-21:** `.env.example` восстанавливается на root (единая точка правды по всем env обоих приложений). Плюс per-app `apps/landing/.env.example` и `apps/app/.env.example` остаются/обновляются.
- **D-22:** Валидация env-переменных **runtime на старте приложения** (не build-time):
  - `apps/landing`: проверка в `main.jsx`, баннер ошибки если не сконфигурировано.
  - `apps/app`: проверка в Next.js startup (server-side) + client-side guard в provider.
- **D-23:** Выбор между zod / envalid / inline assert — **Claude's Discretion** (inline assert проще, zod уместен если уже используется для другой валидации). Решается в плане.
- **D-24:** README — **root `README.md`** с workspace overview + quickstart (цель: новый контрибьютор за 10 минут поднимает оба приложения). Per-app `apps/landing/README.md` и `apps/app/README.md` — только app-specific детали (env-таблица, deploy-таргет). **Claude's Discretion** на точную структуру.

### Claude's Discretion
- ESLint config: flat config v9 vs legacy `.eslintrc`, общий корневой vs per-app, какие плагины (react-hooks, react-refresh). Решается в плане.
- Sentry config детали: sample rate, release naming, source maps upload setup, inbound filters.
- Env validation библиотека (zod / envalid / inline) и точная форма ошибок пользователю.
- README точное содержание и структура.
- Cloudflare Pages build command / output dir (стандартный: `npm run build --workspace=apps/landing` + `apps/landing/dist`).
- GitHub Actions версии actions (`setup-node@v4`, кэши npm), параллелизм, fail-fast.
- Удаление неиспользуемой `framer-motion` (FRAGMENT из CONCERNS.md) — сделать в рамках Phase 1 одним коммитом `chore: remove unused framer-motion`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level (requirements & state)
- `.planning/REQUIREMENTS.md` §Foundation — FOUND-01..06 acceptance criteria (must-pass условия фазы)
- `.planning/PROJECT.md` §Constraints — RU+KZ data residency, соло-разработчик, бюджет, product-first gate
- `.planning/ROADMAP.md` §"Phase 1: Foundation & Repo Cleanup" — Goal + Success Criteria (5 пунктов)

### Codebase state (текущее состояние, которое надо починить)
- `.planning/codebase/CONCERNS.md` — полный перечень проблем Phase 1 закрывает:
  - §Ongoing Monorepo Migration → FOUND-01, FOUND-02, D-20
  - §Missing Error Handling in Form Submissions → косвенно покрывается D-07 (Sentry вместо console.error)
  - §Console.error in Production Code → D-07
  - §Missing Environment Configuration Validation → FOUND-02, D-21..D-23
  - §Test Coverage: Zero Tests → FOUND-03, D-10..D-12
  - §Scaling Limits: Railway Deployment → FOUND-06, D-01..D-04
  - §Abandoned Files and Inconsistent Naming → FOUND-01, D-17..D-20
  - §Missing Deployment Documentation → FOUND-02, D-24
  - §Fragment: Tech Debt in Dependencies (unused framer-motion) → Claude's Discretion cleanup
- `.planning/codebase/STACK.md` — текущий stack (React 18 + Vite + Next.js 14 + Tailwind + Supabase), env vars перечень
- `.planning/codebase/INTEGRATIONS.md` — Telegram bot token в `VITE_*` (addressed в Phase 2, но знать важно), Google Apps Script webhook (не трогаем в Phase 1), Railway.app deploy config
- `.planning/codebase/STRUCTURE.md` — monorepo layout, naming conventions, где добавлять новый код

### Конкретные файлы, которые Phase 1 меняет
- `package.json` (root) — ребренд имени
- `apps/landing/package.json` — ребренд + возможно удаление framer-motion
- `apps/app/package.json` — ребренд
- `railway.json` — удаляется или репурпозится (landing уходит на CF Pages)
- `apps/landing/.env.example`, `apps/app/.env.example` — обновление + root-level `.env.example`
- `apps/landing/google-apps-script.js` — ребренд header "НашСклад" → "Оборот"
- `apps/landing/src/main.jsx` — Sentry init, env validation
- `apps/app/app/layout.jsx` / startup — Sentry init, env validation
- `.github/workflows/ci.yml` — новый файл (FOUND-04)
- `README.md` (root) + `apps/*/README.md` — новые/переписать (FOUND-02)

### Внешние docs (URL, не в репо — для агентов при планировании)
- Sentry Next.js wizard — https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry React setup — https://docs.sentry.io/platforms/javascript/guides/react/
- Cloudflare Pages — https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite-3-project/
- Vitest + RTL — https://vitest.dev/guide/

**Нет ADR и нет SPEC.md на момент написания CONTEXT.md** — Phase 1 их не создаёт (ADR-gap зафиксирован в STATE.md §Blockers; ADR-ы по хостингу app, data residency и т.п. создаются в соответствующих фазах).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Vite config**: `apps/landing/vite.config.js` уже есть — допишем sourcemap для Sentry, возможно плагин `@sentry/vite-plugin` для автоматической загрузки.
- **Tailwind theme**: `apps/landing/tailwind.config.js` и `apps/app/tailwind.config.js` — для возможных UI error-состояний env-баннера переиспользуем существующие токены.
- **Supabase client**: `apps/app/lib/supabase.js` — для Phase 1 не трогаем (просто валидируем env, чтобы NEXT_PUBLIC_SUPABASE_* были).
- **Dependencies уже установлены**: `@tanstack/react-query`, `zustand` — в Phase 1 не нужны, оставляем.

### Established Patterns
- **Monorepo через npm workspaces** — добавление CI и пакетов работает через `npm ci` на root + `--workspace=apps/X` для per-app команд. Это уже в root `package.json` scripts.
- **Next.js App Router** в `apps/app/app/` — Sentry через `@sentry/nextjs` wizard генерит `sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js`.
- **Vite env convention** `VITE_*` префикс для клиент-exposed vars; `NEXT_PUBLIC_*` для Next.js. Валидация должна учитывать оба префикса.

### Integration Points
- **CI ↔ GitHub**: нет `.github/` директории сейчас — создаётся в Phase 1.
- **CF Pages ↔ GitHub**: подключаем через CF dashboard → GitHub App integration, auto-deploy на push в `main`, preview на PR.
- **Railway**: текущий `railway.json` startCommand `vite preview` удаляется; решение — что делать с Railway в целом (оставить для app позже или полностью уйти) откладывается в Phase 2.
- **Sentry ↔ source maps**: для landing — через Vite plugin, для app — через `@sentry/nextjs` built-in.

### Constraints observed in codebase
- **Нет TypeScript** — `@types/react` установлены, но код `.jsx`/`.js`. CI не делает typecheck. FOUND-03 и FOUND-04 учитывают это (Vitest без TS, ESLint под JSX).
- **`.DS_Store` закоммичены** (`apps/.DS_Store`, `apps/landing/.DS_Store` и т.п.) — добавим в `.gitignore` и удалим из трекинга в рамках D-20 cleanup commit.
- **`railway.json`** на корне ссылается на `cd apps/landing` — после миграции на CF Pages этот файл либо переориентируется на app (если решим хостить app на Railway в Phase 2), либо удаляется.

</code_context>

<specifics>
## Specific Ideas

- Бренд в коде — **"Оборот"**, не "OborotCRM" (package scope `@oborot`). Но в маркетинговых материалах и домене — "OborotCRM" / `oborotcrm.ru`. Инженерные артефакты (package names) — короткая форма.
- Git история — предпочтительно чистая (`git mv` где возможно при переименовании файлов, один коммит `chore: remove pre-monorepo root files`, один ребренд-коммит). Bisect-friendly.
- Sentry DSN на landing — принятый факт, что он публичен (Vite exposure). Защита через настройки проекта в Sentry UI, не через сокрытие DSN.
- CF Pages preview на каждый PR важны — соло-разработчик использует их как staging перед cache invalidation на prod.

</specifics>

<deferred>
## Deferred Ideas

- **Хостинг `apps/app` в production** — ADR в Phase 2 (CF Workers+OpenNext vs Railway vs Vercel). Зависит от сценариев API routes для lead capture.
- **TypeScript миграция** — явно Out of Scope в PROJECT.md. Возвращаемся если появится боль.
- **Prettier + format-check в CI** — не делаем в Phase 1. Если дисциплина стиля начнёт страдать — добавим в отдельной мини-фазе.
- **Husky + lint-staged** — не делаем. Если Claude-commits начнут ломать стиль — пересмотрим.
- **Coverage target (e.g. 60%+)** — не в Phase 1. После Phase 3 (стабильный Auth) имеет смысл поставить порог на critical-path логику.
- **Fallback с Sentry на Glitchtip** — документируем в ADR как план B, но миграцию в Phase 1 не делаем.
- **Миграция с Google Sheets / TG token exposure** — FOUND-05 требует error tracking, но не трогаем сам lead capture flow (это Phase 2 / LEAD-01, LEAD-02).
- **Широкий тестовый suite** — после стабилизации контрактов в Phase 2-3.
- **Cloudflare Workers / дополнительные CF-сервисы (Bot Management, rate limits на уровне edge)** — не в Phase 1, добавляем по потребности.
- **Удаление закоммиченных `.DS_Store`** из истории (git filter-branch) — не трогаем историю, только текущее состояние в рабочем дереве + `.gitignore`.

</deferred>

---

*Phase: 01-foundation-repo-cleanup*
*Context gathered: 2026-04-21*

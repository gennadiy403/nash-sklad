# Phase 1: Foundation & Repo Cleanup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 01-foundation-repo-cleanup
**Areas discussed:** Хостинг landing, Error tracking, Тесты и CI scope, Ребренд и git cleanup

---

## Хостинг landing (FOUND-06)

### Q1: Какой хостинг для landing после отказа от vite preview?

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages (Recommended) | Free tier щедрый, edge в RU/KZ, GitHub auto-deploy, atomic rollback, preview для PR. Минус: серверные функции (Workers) отдельно — но на landing их нет. | ✓ |
| Остаться на Railway (static) | Минимум инфра-изменений: `serve dist` (или nginx), Cloudflare CDN перед Railway. Дешевле чем vite preview, но дороже CF Pages. | |
| Vercel | Лучший DX, edge-сеть, нативный Next.js для apps/app. Риски: оплата из RU сложна, geo-рестрикции, списки блокировок. | |
| Netlify | Аналог Vercel по DX, похожие риски по RU оплате/доступу. | |

**User's choice:** Cloudflare Pages
**Notes:** Экономика (free tier) + RU/KZ edge latency + preview для PR — определяющие факторы.

---

### Q2: Где будет хоститься apps/app (Next.js) когда станет production?

| Option | Description | Selected |
|--------|-------------|----------|
| Решим позже (Recommended) | В Phase 1 фокус только на landing; ADR по apps/app хостингу в Phase 2 когда появятся API routes для lead capture. | ✓ |
| Cloudflare Workers/Pages + Next.js | Единая платформа. Next.js через OpenNext адаптер. Риск: edge runtime ограничения. | |
| Railway (в production) | Next.js как Node сервер — симметрия с текущей инфрой. Но два хоста (CF для landing, Railway для app). | |

**User's choice:** Решим позже
**Notes:** Откладываем в deferred ideas как ADR Phase 2.

---

### Q3: Preview-деплои для PR (каждый PR — свой URL)?

| Option | Description | Selected |
|--------|-------------|----------|
| Да (Recommended) | CF Pages из коробки делает preview для каждого branch/PR — бесплатно. Безопасная проверка мержа в main перед CDN cache invalidation. | ✓ |
| Только main → prod | Проще, но теряем staging-проверку. Для соло-разработчика может быть ok на старте. | |

**User's choice:** Да

---

### Q4: Как переводить домен oborotcrm.ru с Railway на CF Pages?

| Option | Description | Selected |
|--------|-------------|----------|
| Целиком на Cloudflare (Recommended) | NS change на CF nameservers — автоматический SSL, proxied DNS, deploy через CNAME. Просто для соло-разработчика. | ✓ |
| Вручную через текущего регистратора | Оставить NS у регистратора, CNAME на pages.dev. Труднее с SSL и кэшем. | |
| Решу сам в плане | Claude документирует шаги миграции, решение оставляем на момент исполнения. | |

**User's choice:** Целиком на Cloudflare

---

## Error tracking (FOUND-05)

### Q5: Какой сервис для error tracking?

| Option | Description | Selected |
|--------|-------------|----------|
| Sentry cloud (Recommended) | Стандарт индустрии. Free tier 5k events/мес — для waitlist хватит. Developer $26/мес. Риск: оплата из RU может быть сложной. | ✓ |
| Glitchtip self-hosted | Open-source, Sentry-совместимый SDK, Docker на Railway/VPS. Полный контроль, но ещё одна инфра для соло-разработчика. | |
| Sentry сейчас, Glitchtip как fallback | Free tier Sentry; если упрётся в лимиты или заблокируют оплату — мигрируем на Glitchtip (SDK-совместим). | |

**User's choice:** Sentry cloud
**Notes:** Fallback на Glitchtip зафиксирован как Deferred Idea — план B если оплата из RU станет невозможной.

---

### Q6: Scope error tracking в Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Оба приложения, клиент+сервер (Recommended) | FOUND-05 явно требует оба. Landing — только клиент (SPA). apps/app — клиент+сервер через @sentry/nextjs. | ✓ |
| Только landing в Phase 1 | Сейчас landing в проде, app пустой. Но FOUND-05 требует оба. | |
| Только клиент, сервер позже | Клиентские ошибки на обоих. Сервер (Next.js API) добавим когда появятся реальные API routes. | |

**User's choice:** Оба приложения, клиент+сервер

---

## Тесты и CI scope (FOUND-03, FOUND-04)

### Q7: Глубина тестов в Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Smoke + ключевые хуки (Recommended) | landing: render <App/> + юниты на useForm. app: render layout + login page. ~8-10 тестов, реальная страховка. | ✓ |
| Только smoke | 1 тест на приложение. Удовлетворяет FOUND-03 буквально, но не ловит баги в формовой логике. | |
| Широко с coverage target | 60%+ coverage, unit+component на все страницы. Перегиб для Foundation — код всё равно поменяется в Phase 2. | |

**User's choice:** Smoke + ключевые хуки

---

### Q8: Что в CI на каждый PR?

| Option | Description | Selected |
|--------|-------------|----------|
| Lint | ESLint в обоих приложениях. | ✓ |
| Tests (Vitest) | Тесты из FOUND-03. | ✓ |
| Build-check | `vite build` + `next build`. Ловит lint-ok но build-fail регрессии. | ✓ |
| Format check (Prettier) | `prettier --check`. Излишне для MVP. | |

**User's choice:** Lint + Tests + Build-check (без Prettier)

---

### Q9: Pre-commit hooks локально (Husky + lint-staged)?

| Option | Description | Selected |
|--------|-------------|----------|
| Нет (Recommended) | Соло-разработчик + Claude — pre-commit ломается на Claude-commits (amend/rebase). CI защищает main. | ✓ |
| Да, lint-staged на pre-commit | Быстрая обратная связь, но добавляет пакеты и может ломать git workflow Claude Code. | |
| Да, полный (lint+tests+typecheck) | Максимум защиты, но медленно на каждом commit. | |

**User's choice:** Нет

---

## Ребренд и git cleanup (FOUND-01)

### Q10: Имя npm-пакетов после ребренда?

| Option | Description | Selected |
|--------|-------------|----------|
| @oborot/landing, @oborot/app (Recommended) | Коротко, матчит бренд "Оборот". Root: `oborot-crm`. | ✓ |
| @oborotcrm/landing, @oborotcrm/app | Матчит домен oborotcrm.ru. Длиннее но точнее продукт. | |
| oborot-landing, oborot-app (без scope) | Проще если не публикуются, но хуже семантика monorepo. | |

**User's choice:** @oborot/landing, @oborot/app (root: oborot-crm)

---

### Q11: Что делать с 17 удалёнными root-файлами в working tree?

| Option | Description | Selected |
|--------|-------------|----------|
| Одним cleanup-commit (Recommended) | `chore: remove pre-monorepo root files` — чистый git status, ясная история. | ✓ |
| По группам (src, config, other) | 3 коммита. Чище история для bisect. | |
| Оставить как есть | FOUND-01 требует "в git остаются только живые файлы". | |

**User's choice:** Одним cleanup-commit

---

### Q12: Готовность к CONTEXT.md?

| Option | Description | Selected |
|--------|-------------|----------|
| Готов к CONTEXT.md (Recommended) | Env validation (zod vs inline), ESLint flat config, README структура, Sentry wire — Claude's Discretion. | ✓ |
| Обсудить env валидацию | — | |
| Обсудить README структуру | — | |
| Обсудить ESLint/Prettier конфиг | — | |

**User's choice:** Готов к CONTEXT.md

---

## Claude's Discretion

Области, где пользователь явно доверил решение Claude на этапе планирования:

- Env validation библиотека (zod vs envalid vs inline assert) и точная форма runtime-ошибок пользователю.
- ESLint config: flat config v9 vs legacy, общий корневой vs per-app, набор плагинов.
- Sentry детали: sample rate, release naming, source maps upload, inbound filters + rate limits в Sentry UI для публичного DSN landing.
- README точное содержание и per-app структура.
- CF Pages build command / output dir (стандартный Vite).
- GitHub Actions: версии actions, кэши npm, параллелизм, fail-fast.
- Удаление `framer-motion` как чистка технодолга (FRAGMENT из CONCERNS.md).

## Deferred Ideas

- Хостинг apps/app в production — ADR в Phase 2.
- Миграция с Sentry на Glitchtip self-hosted — план B, не делаем в Phase 1.
- TypeScript миграция — Out of Scope в PROJECT.md.
- Prettier + format-check в CI — не делаем в Phase 1.
- Husky + lint-staged — не делаем.
- Coverage target — после Phase 3.
- Широкий тестовый suite — после стабилизации контрактов Phase 2-3.
- Cloudflare Workers / доп. edge сервисы — по потребности.
- Удаление закоммиченных `.DS_Store` из git history — не трогаем историю.

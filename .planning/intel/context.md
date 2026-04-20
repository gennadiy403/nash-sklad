# Context Intel

Running notes from DOC-type sources. Verbatim-faithful with source attribution. Not authoritative for decisions — use for framing, content, and rationale.

---

## Founder background
**Source:** /Users/genlorem/Projects/oborot-crm/STORY.md

- Основатель — действующий продавец, бренд одежды SKVO Clothes.
- Продаёт на маркетплейсах (WB, Ozon, ЯМ) + собственный сайт + шоурумы.
- Работает в двух странах: Россия и Казахстан.
- Веб-разработчик с 12-летним стажем.
- Пользователь МойСклад ~8 лет.
- Брендом занималась бывшая жена Гюзель (развитие, позиционирование). Основатель отвечал за техническую часть и масштабирование производства/продвижения.
- За несколько лет полностью автоматизировал производственные процессы и масштабировал бизнес — сейчас функционирует как часы.

---

## Pain points with incumbents
**Source:** /Users/genlorem/Projects/oborot-crm/STORY.md

- МойСклад за 8 лет практически не менялся — ни интерфейс, ни скорость.
- Код МойСклад засорён, UX не обновляется, альтернатив на рынке нет.
- Писал в МойСклад с предложением помочь с разработкой — **отказали**.
- TopSeller (интеграция МП → МойСклад): работает через раз, постоянно глючит, сбивает учёт.
- Учёт регулярно сбивается, восстановить сложно/невозможно из-за лимитов API маркетплейсов.
- Даже с подключением поддержки по удалённому доступу, бесконечными настройками и фиксами — ошибки возвращаются.
- Смирился с тем что нормальный учёт невозможен в текущих инструментах.

---

## Path to product
**Source:** /Users/genlorem/Projects/oborot-crm/STORY.md

1. Сначала сделал свою копию TopSeller (работает, используется).
2. Затем решил: если уж делать — то полную замену МойСклад.
3. Собрал небольшую команду энтузиастов.
4. Показал друзьям-продавцам на МП — оторвали с руками.
5. Дал бесплатный доступ, вместе тестируют и вылизывают до идеала.
6. Сейчас: модульная система, прямые интеграции с МП без прослоек.

---

## Product principles (content anchors)
**Source:** /Users/genlorem/Projects/oborot-crm/STORY.md

- Все интеграции встроены по умолчанию (МП, 1С, сайты) — никаких прослоек.
- Рекомендованные настройки из коробки — не нужно быть экспертом.
- Интуитивно понятный интерфейс — разберёшься за 5 минут.
- Прямая работа с маркетплейсами без посредников.
- Модульная архитектура — бери что нужно.

Note: these principles overlap with and support `REQ-industry-modules` and `REQ-utp-infinite-analytics-retention` from ROADMAP (PRD). Principles from STORY are framing, not acceptance criteria.

---

## Emotional anchors for content
**Source:** /Users/genlorem/Projects/oborot-crm/STORY.md

- "8 лет терпел" — долгая боль, не импульсивное решение.
- "Написал в МойСклад помочь — отказали" — драма, поворотный момент.
- "Сделал для себя" — аутентичность, не стартап ради денег.
- "Друзья оторвали с руками" — социальное доказательство.
- "Вместе вылизываем" — комьюнити, совместное создание.
- "Продавец делает для продавцов" — свой среди своих.

---

## Cross-reference with implementation state
**Source (context only):** /Users/genlorem/Projects/oborot-crm/.planning/codebase/

A prior map-codebase run documents the current landing-page app at `apps/landing/` (React + Vite + Tailwind, lead capture via Google Sheets + Telegram). This is state, not intent.

Relevant reconciliation points for the roadmapper:
- ROADMAP.md marks "Создать лендинг oborotcrm.ru" as done — codebase STACK/STRUCTURE confirms a React+Vite landing app exists.
- ROADMAP.md Phase 0 task "Настроить CRM для сбора лидов (вместо Google Sheets)" is a known forward TODO, not a conflict with current Google Sheets integration.

# WOT — Copilot Instructions

## What this project is

WOT (Work-Out Tracker) is a cross-sport training log focused on injury prevention. Users log workouts (strength, cardio, mobility, etc.) and the app surfaces load metrics, regional body-part distribution, and recovery signals to help prevent overuse injuries.

Core load formula: **session load = duration (seconds) × sRPE (1–10)**. All higher-order metrics (weekly load, monotony, strain, ACWR) derive from this.

## Repository structure

```
/
├── api/             # Fastify API backend (Fastify + Drizzle + PostgreSQL + better-auth)
├── mobile-client/   # Expo React Native app
├── shared/types/    # Shared Zod schemas / types (@wot/types, file dependency of api)
└── docs/            # Architecture decision docs (data model, auth setup, UI/UX design)
```

## Commands (run from `mobile-client/`)

```bash
npm run start        # start Expo dev server (interactive: press i/a/w for platform)
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # browser
npm run lint         # ESLint via expo lint
```

## Commands (run from `api/`)

```bash
docker compose up -d   # start local Postgres
npm run dev            # tsx watch src/server.ts
npm run typecheck      # tsc --noEmit
npm run db:generate    # drizzle-kit generate (new migration)
npm run db:migrate     # drizzle-kit migrate (apply migrations)
npm run db:studio      # drizzle-kit studio
```

There is no test suite yet.

## Architecture

### Mobile client

- **Routing**: file-based via `expo-router`. Screens live in `app/`. The tab layout is `app/(tabs)/_layout.tsx`. Modals go in `app/modal.tsx`.
- **State**: Zustand for client state.
- **Validation**: Zod for all schema validation (including wellness fields like RPE, which use `numeric(3,1)` — decimals allowed in 1–10 range).
- **Theming**: semantic color tokens from `constants/theme.ts` (`Colors.light` / `Colors.dark`). Always use `useThemeColor` or the `ThemedText` / `ThemedView` wrappers — never hardcode colors.

### Backend (`api/`)

- **API**: Fastify 5 at `api/`, entry `src/server.ts`, app factory `src/app.ts`.
- **ORM**: Drizzle on top of PostgreSQL. Schema in `src/db/schema/` (one file per table + `index.ts`). Migrations via `npm run db:generate` / `db:migrate`.
- **Auth**: `better-auth` — it owns the `user`, `session`, `account`, `verification` tables. App tables reference `user.id` (type `text`) as a foreign key but do not define the `user` table.
- **Local dev DB**: `docker compose up -d` in `api/` starts Postgres 17 on localhost:5432 (`wot`/`wot_dev_password`, db `wot_dev`). The home-server `DATABASE_URL` (SSL, `sslmode=verify-ca`) is kept commented in `api/.env` — swap back when on the home network.
- **Env**: validated with Zod in `src/env.ts`; credentials in `.env`, never committed.

## Key conventions

### File naming
All component and hook files use **kebab-case** (e.g. `haptic-tab.tsx`, `use-color-scheme.ts`).

### Path alias
`@/` resolves to the `mobile-client/` root (configured in `tsconfig.json`). Always use `@/` for internal imports.

### Platform-specific files
Use `.ios.tsx` for iOS-specific implementations and `.web.ts` for web-specific ones. Expo's bundler resolves these automatically (e.g. `icon-symbol.ios.tsx` vs `icon-symbol.tsx`, `use-color-scheme.web.ts` vs `use-color-scheme.ts`).

### Theming
- Token definitions: `constants/theme.ts` exports `Colors` and `Fonts`.
- Hook: `useThemeColor({ light, dark }, colorName)` from `hooks/use-theme-color.ts`.
- Wrappers: `ThemedText` (supports `type` variants: `default`, `title`, `defaultSemiBold`, `subtitle`, `link`) and `ThemedView` from `components/`.
- Dark mode support is required from the start — use semantic tokens only.

### Data model (for when the API is built)
- **No exercise library**. Component names are free text. Surface recents via query, not a managed catalogue.
- **`body_regions`** on `session_components` is a `text[]` — no join table. The UI offers a fixed suggestion list but the DB stores plain strings.
- **`pain_logs` and `daily_logs` are decoupled from sessions** — they reference `user_id` directly, not `session_id`.
- **All derived metrics are computed at query/domain time** — no stored derived columns.

### UX principles (from `docs/20260321_ui_ux_design.md`)
These constrain implementation decisions:
- **Offline-first**: logging never degrades offline; sync is silent.
- **Auto-save always**: no manual save, no confirmation dialogs for normal actions.
- **Inline editing**: set values (weight, reps, etc.) are edited inline — no modals for this.
- **Recents first**: exercise picker shows most recently used names before search.
- **4-tab navigation**: Log (default), History, Plan, Insights.
- **Pain/readiness are never gates**: optional and always skippable.
- Any implementation that diverges from the UX doc must be explicitly documented.

### Navigation intent for 4 tabs
| Tab | Purpose |
|---|---|
| Log | Start/continue workout; dominant `Start workout` CTA |
| History | Reverse-chronological session list; "Use as template" action |
| Plan | Lightweight week calendar; optional planned sessions |
| Insights | Load trend, body region distribution, stacked warning signals |

## Agent guidelines
- Make sure to deep docs up to date with big changes
  - At least at new docs so we have a easy to track documentation about the app growth. 

## Coding instructions
- Keep code DRY and apply SOLID coding principles. 
- Keep code minimal. Think of every line of code having a cost, an initial investment that is made to produce it and future investments needed to maintain it. 
- Keep performance in mind, but give readability/maintainability preference.

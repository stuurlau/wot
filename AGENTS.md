# WOT — Agent Instructions

> Single source of truth for coding agents (opencode, Copilot, etc.).
> `.github/copilot-instructions.md` points here — keep this file up to date.

## What this project is

WOT (Work-Out Tracker) is a cross-sport training log focused on injury prevention. Users log workouts (strength, cardio, mobility, etc.) and the app surfaces load metrics, regional body-part distribution, and recovery signals to help prevent overuse injuries.

Core load formula: **session load = duration (seconds) × sRPE (1–10)**. All higher-order metrics (weekly load, monotony, strain, ACWR) derive from this.

## Repository structure

```
/
├── api/             # Fastify API backend (Fastify + Drizzle + PostgreSQL + better-auth)
├── mobile-client/   # Expo React Native app
├── shared/types/    # Shared Zod schemas / types (@wot/types) — single source of truth for the wire contract; used by both api (runtime + typecheck) and mobile-client (types via tsconfig paths)
├── docs/            # Architecture decision docs (data model, auth setup, UI/UX design, deployment)
├── plans/           # Local agent workflow: backlog.md + implementation plans
└── deploy/          # Home-server deployment scripts
```

The default branch is **`master`**. All PRs target `master`.

## Commands (root, via Makefile)

```bash
make setup        # install deps for shared/types, api and mobile-client (run first)
make check        # typecheck + lint + all tests — run this before opening a PR
make test         # backend unit + integration tests (integration needs local Postgres)
make typecheck    # tsc --noEmit on api and mobile-client
make lint         # mobile client ESLint
make dev          # Postgres + migrations + API + mobile client
```

## Commands (run from `api/`)

```bash
docker compose up -d   # start local Postgres
npm run dev            # tsx watch src/server.ts
npm run typecheck      # tsc --noEmit
npm run db:generate    # drizzle-kit generate (new migration)
npm run db:migrate     # drizzle-kit migrate (apply migrations)
npm test               # unit tests (node --test)
npm run test:integration  # integration tests (needs the local Postgres)
```

The api imports `@wot/types` at runtime, so `shared/types` deps must be installed for `npm run dev` and tests.

## Architecture

### Mobile client

- **Routing**: file-based via `expo-router`. Screens live in `app/`. The tab layout is `app/(tabs)/_layout.tsx`. Modals go in `app/modal.tsx`.
- **State**: Zustand for client state.
- **Validation**: Zod for all schema validation (including wellness fields like RPE, which use `numeric(3,1)` — decimals allowed in 1–10 range).
- **Theming**: semantic color tokens from `constants/theme.ts` (`Colors.light` / `Colors.dark`). Always use `useThemeColor` or the `ThemedText` / `ThemedView` wrappers — never hardcode colors.
- **Keyboard**: `react-native-keyboard-controller` (provider in `app/_layout.tsx`; `softwareKeyboardLayoutMode: "resize"` in `app.json` is required). Screens with inputs use `KeyboardAwareScrollView`; bottom sheets render inside `Sheet` (which already lifts above the keyboard). Never use RN core `KeyboardAvoidingView`. Library components take `style`, not `className`. See `docs/20260926_keyboard_handling.md`.

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

### Data model
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

## Coding rules

- Keep code DRY and apply SOLID principles.
- Keep code minimal. Think of every line of code having a cost: an initial investment to produce it and future investments to maintain it.
- Keep performance in mind, but give readability/maintainability preference.
- Never commit secrets. Add new env variables as documented placeholders only.
- Never push directly to `master`; never force-push.

## Documentation

- Keep docs up to date with big changes — at least add a new dated doc in `docs/` so there's an easy-to-track record of how the app grows.
- Update this `AGENTS.md` whenever you change structure, commands, conventions, or workflows mentioned here.

## CI / release workflows (`.github/workflows/`)

- `api.yml` — typecheck + unit tests + Docker image build for the API on PRs; publishes to GHCR on master pushes and `v*` tags.
- `mobile.yml` — typecheck + lint for the Expo client on PRs.
- `build-test-app.yml` — manual: builds the Android test APK into the rolling `test-app` pre-release.
- `mobile-release.yml` — on `v*` tags: builds the APK and attaches it to a GitHub release.
- `opencode*.yml` — the agent automation pipeline described below.

Releases are manual: merge to `master`, then push a `v*` tag.

## Agent automation (GitHub Actions)

The repo runs an automated issue→PR pipeline with opencode. Full behavior lives in the workflow files; the contract is:

1. **Implement** (`opencode-implement.yml`): labeling an issue **`agent`** dispatches the implementer. The `anomalyco/opencode` action creates the branch (`opencode/issue<N>-<timestamp>`) from `master`; the agent implements, runs checks, and commits — the action pushes and opens **one PR per issue** with `Closes #<N>` in the body. The agent must never create/switch branches, push, or open the PR itself: if the branch changes mid-session, the action silently skips PR creation.
2. **Review & fix** (`opencode-review.yml`): adding the **`agent-review`** label to a PR from an `opencode/` branch dispatches the reviewer. It verifies the diff against the linked issue and this file, fixes problems with fixup commits on the PR branch, and leaves one summary review. (Label-gated, not auto-on-open: the action asserts the event actor has admin/write — PRs opened by `opencode-agent[bot]` report `permission: none` and would always fail. Retry = re-run from the Actions tab or re-add the label.)
3. **Human feedback**: comment `/oc <instruction>` on an issue/PR for an instant run (`opencode.yml`), or just leave review comments — the daily sweep (`opencode-daily.yml`) addresses them and pushes fixes.
4. Human merges; releases are tagged manually.

Rules for agents running in this pipeline:

- Read this `AGENTS.md` first and follow it.
- One PR per issue, target `master`, `Closes #<N>` in the body. Branches use the action's `opencode/` prefix — agents never create or switch branches themselves.
- Run `make setup` then the checks for every package you touched (`make check` covers all) before opening or updating a PR; report results in the PR body / review summary.
- Stay scoped to the issue. No unrelated refactors.
- If requirements are ambiguous, ask in an issue comment instead of guessing.

### Models and usage limits

CI runs on the OpenCode Go subscription, which enforces per-model rolling budgets (5-hour / weekly / monthly — see `https://opencode.ai/docs/go/`).

- Model: `opencode-go/kimi-k3` (smallest budget tier), one attempt per run. Step timeouts: implement 60 min, review/daily 25 min. opencode retries usage-limit 429s (and unanswered permission prompts) indefinitely, so the cap turns a hang into a failure. No model fallbacks (removed: observed hangs were gateway-wide or stuck permission prompts, which fallback models/keys hit identically — they just burned budget and CI time).
- On failure the workflow comments on the issue/PR (when there is one) and stays red. Retry via Actions → Re-run, or re-add the trigger label.
- CI shares the K3 budget with local opencode usage: heavy CI runs can temporarily exhaust K3 for local sessions too. Check usage at `https://opencode.ai/auth`.

## Local agent workflow (opencode TUI)

Separate from the GitHub pipeline, the repo has a local plan/build flow:

- `plans/backlog.md` — rough task intake.
- `/daily` command — recon + pick tasks; the **planner** subagent (`.opencode/agent/planner.md`) writes plan files into `plans/`.
- `/implement` command — the **builder** subagent (`.opencode/agent/builder.md`) implements a plan and opens a PR.

# Backend test plan

**Date:** 2026-08-15
**Status:** planning

## Goals

- Catch regressions in env validation, app wiring, and routes with a fast,
  deterministic suite.
- Keep the barrier to writing tests near zero: no containers, no network, no
  external DB for the first milestone.
- DB-touching tests come later, only when domain/query logic exists to test.

## Tooling

- **Runner:** `node:test` + `node:assert/strict` — built into Node 22, zero new
  runtime dependencies.
- **TypeScript execution:** `tsx` (already a devDependency) via
  `node --import tsx --test`.

Scripts added to `api/package.json`:

```json
"test": "node --import tsx --test src/**/*.test.ts",
"test:watch": "node --import tsx --test --watch src/**/*.test.ts"
```

## Principles

1. **Unit tests by default.** Anything that needs Postgres is an integration
   test and lives outside the default suite.
2. **No HTTP server in tests.** Use Fastify's `app.inject()` — in-memory
   request/response, no port binding, fast.
3. **Env isolation.** `env.ts` parses `process.env` at import time, so every
   test file sets required env vars *before* importing app code (ESM imports
   are hoisted, so this needs dynamic `await import()` or a setup module).
4. **Auth is stubbed, not tested.** `better-auth` is third-party and needs a
   live DB. App tests don't exercise `/api/auth/*` beyond a smoke check.
5. **Co-located tests.** `foo.ts` → `foo.test.ts` next to it. Colocation beats
   a mirrored `test/` tree for a small codebase.

## Scope: what gets tested now

| Area | Test | Type |
|---|---|---|
| `src/env.ts` | rejects missing/invalid vars; applies defaults | unit |
| `src/app.ts` | `GET /health` returns `{ ok: true }` | inject |
| `src/app.ts` | unknown route returns 404 | inject |

Explicitly **out of scope** for the first milestone:

- `/api/auth/*` behaviour (needs live DB — better-auth owns that surface)
- Drizzle schema/migration correctness (verified by `db:migrate` + typecheck)
- Domain metrics (session load, monotony, etc.) — not implemented yet

## Structure

```
api/src/
├── test/
│   └── setup.ts        # sets required env vars before app modules load
├── env.test.ts
├── app.test.ts
└── ...
```

`src/test/setup.ts` is the only file that knows about fake env values; test
files `await import` app modules after importing setup.

Example env used by all tests:

```
DATABASE_URL=postgresql://test:test@localhost:5432/test
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:8081
BETTER_AUTH_SECRET=<64 hex chars, fixed test value>
```

`DATABASE_URL` is never connected to in unit/inject tests — `pg.Pool` connects
lazily, and `buildApp()` only registers routes.

## Later: integration tests

When domain/query code lands, add a separate suite:

- Testcontainers (or the existing `docker-compose.yml` db with a dedicated
  `wot_test` database) + `db:migrate` in suite setup.
- Separate script: `npm run test:integration` — never part of `npm test`.
- Auth flows tested end-to-end here (sign-up → session cookie → authed route).

## Definition of done for this milestone

- `npm test` runs the three tests above in < 5s with no external services.
- `npm run typecheck` still passes.
- Doc updated if structure deviates from this plan.

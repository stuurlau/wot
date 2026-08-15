# Local dev setup — Docker Postgres

**Date:** 2026-08-15
**Status:** done

## Why

The original plan was to develop directly against the home-server Postgres
(`BIG.local`, SSL via `sslmode=verify-ca`). When off the home network that DB
is unreachable, so a throwaway local Postgres in Docker is the default dev
target. The home-server `DATABASE_URL` stays in `api/.env`, commented out —
swap it back when on the home network.

## Setup

```bash
cd api
docker compose up -d      # postgres:17-alpine on localhost:5432, volume wot-pgdata
npm run db:migrate        # apply migrations (auth tables + 4 app tables)
npm run dev               # Fastify on :3000
```

- Credentials: `wot` / `wot_dev_password`, database `wot_dev` (local-only, safe
  to be in `docker-compose.yml`; never reuse these for the real server).
- Reset everything: `docker compose down -v` then `up -d` + `db:migrate`.
- Inspect data: `npm run db:studio`.

## Verify

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H 'content-type: application/json' \
  -d '{"email":"dev@example.com","password":"password123","name":"Dev"}'
```

## Gaps closed this session

The backend bootstrap plan (`20260414_backend_bootstrap_plan.md`) was mostly
done (package, Drizzle schema, migrations, better-auth, env). Missing pieces
added now:

- `src/app.ts`, `src/server.ts`, `src/routes/health.ts`, `src/types/fastify.d.ts`
- `.env.example`
- `docker-compose.yml` + local `DATABASE_URL`

Note: the plan's `auth.handler(request.raw)` sketch doesn't work with Fastify —
`app.ts` converts the Fastify request into a Fetch `Request` instead.

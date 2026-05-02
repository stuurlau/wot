# Backend Bootstrap Plan — Fastify + Drizzle + better-auth

**Date:** 2026-04-14  
**Status:** planning  
**Repo decision:** the backend will live in `api/` at the repo root, not `apps/api/`.

---

## Scope

First milestone:

- scaffold a Fastify backend in `api/`
- wire PostgreSQL through Drizzle
- include `better-auth` from the start
- create the full MVP app schema:
  - `sessions`
  - `session_components`
  - `daily_logs`
  - `pain_logs`

The database schema should be the source of truth for persistence. Shared Zod/types should be derived from the Drizzle model where practical instead of being maintained as a parallel hand-written schema layer.

---

## Important constraint before writing app tables

Generate `better-auth` first and inspect the generated `user.id` type.

The data model doc describes `user_id` as `uuid`, but the auth library may generate a different concrete DB type. App tables must match the actual generated auth table type for foreign keys to work cleanly.

**Rule:** `user_id` in app tables must mirror the generated `better-auth` `user.id` column type exactly.

---

## Target file structure

```text
api/
├── package.json
├── tsconfig.json
├── .env.example
├── drizzle.config.ts
└── src/
    ├── app.ts
    ├── server.ts
    ├── env.ts
    ├── lib/
    │   └── auth.ts
    ├── db/
    │   ├── client.ts
    │   └── schema/
    │       ├── auth.ts or generated auth schema file
    │       ├── sessions.ts
    │       ├── session-components.ts
    │       ├── daily-logs.ts
    │       ├── pain-logs.ts
    │       └── index.ts
    ├── routes/
    │   └── health.ts
    └── types/
        └── fastify.d.ts
```

---

## Phase 1 — Bootstrap the package

### Commands you run

```bash
cd /home/lau/Projects/wot
mkdir -p api/src/{db/schema,lib,routes,types}
cd api
npm init -y
npm install fastify @fastify/cors @fastify/cookie better-auth drizzle-orm pg zod ../shared/types
npm install -D typescript tsx @types/node drizzle-kit @better-auth/cli
```

### Code to use

`api/package.json`

```json
{
  "name": "wot-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit",
    "auth:generate": "better-auth generate --config src/lib/auth.ts --output src/db/schema/auth.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@fastify/cookie": "^11.0.2",
    "@fastify/cors": "^11.1.0",
    "@wot/types": "file:../shared/types",
    "better-auth": "^1.3.8",
    "drizzle-orm": "^0.44.6",
    "fastify": "^5.6.1",
    "pg": "^8.16.3",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@better-auth/cli": "^1.3.8",
    "@types/node": "^24.7.2",
    "drizzle-kit": "^0.31.4",
    "tsx": "^4.20.6",
    "typescript": "^5.9.2"
  }
}
```

`api/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "drizzle.config.ts"]
}
```

---

## Phase 2 — Environment and DB wiring

### Commands you run

```bash
cd /home/lau/Projects/wot/api
touch .env
```

### Code to use

`api/.env.example`

```bash
DATABASE_URL=postgresql://wot_dev:your_password@big.local:5432/wot_dev?sslmode=verify-ca&sslrootcert=/home/you/.certs/wot-server.crt
API_HOST=0.0.0.0
API_PORT=3000
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:8081
BETTER_AUTH_SECRET=replace_with_openssl_rand_hex_32
```

Generate the auth secret:

```bash
openssl rand -hex 32
```

`api/src/env.ts`

```ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

`api/src/db/client.ts`

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '../env.js';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

`api/drizzle.config.ts`

```ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Phase 3 — Auth setup first

### Commands you run

```bash
cd /home/lau/Projects/wot/api
npm run auth:generate
```

After generation, inspect the generated auth schema and confirm the concrete type of `user.id`.

### Code to use

`api/src/lib/auth.ts`

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '../db/client.js';
import { env } from '../env.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.API_URL,
});
```

`api/src/types/fastify.d.ts`

```ts
import type { Session, User } from 'better-auth';

declare module 'fastify' {
  interface FastifyRequest {
    session: { user: User; session: Session };
  }
}
```

---

## Phase 4 — App schema in Drizzle

### Schema rules from the data model

- no exercise library table
- `body_regions` stays a free-text array
- `daily_logs` and `pain_logs` are independent from sessions
- no derived metric columns
- `daily_logs` gets a unique `(user_id, date)` constraint

### File plan

- `src/db/schema/sessions.ts`
- `src/db/schema/session-components.ts`
- `src/db/schema/daily-logs.ts`
- `src/db/schema/pain-logs.ts`
- `src/db/schema/index.ts`

### Code to use

`api/src/db/schema/sessions.ts`

```ts
import { integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Match this column type to the generated better-auth user.id type.
  userId: text('user_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(),
  srpe: numeric('srpe', { precision: 3, scale: 1 }).notNull(),
  type: text('type').notNull(),
  title: text('title'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

`api/src/db/schema/session-components.ts`

```ts
import { integer, numeric, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const sessionComponents = pgTable('session_components', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull(),
  name: text('name').notNull(),
  bodyRegions: text('body_regions').array(),
  weight: numeric('weight', { precision: 6, scale: 2 }),
  reps: smallint('reps'),
  rir: numeric('rir', { precision: 3, scale: 1 }),
  distance: numeric('distance', { precision: 8, scale: 2 }),
  duration: integer('duration'),
  pace: numeric('pace', { precision: 6, scale: 2 }),
  rpe: numeric('rpe', { precision: 3, scale: 1 }),
  sortOrder: smallint('sort_order').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

`api/src/db/schema/daily-logs.ts`

```ts
import { date, numeric, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const dailyLogs = pgTable(
  'daily_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Match this column type to the generated better-auth user.id type.
    userId: text('user_id').notNull(),
    date: date('date', { mode: 'string' }).notNull(),
    sleepDuration: smallint('sleep_duration'),
    sleepQuality: numeric('sleep_quality', { precision: 3, scale: 1 }),
    soreness: numeric('soreness', { precision: 3, scale: 1 }),
    fatigue: numeric('fatigue', { precision: 3, scale: 1 }),
    stress: numeric('stress', { precision: 3, scale: 1 }),
    motivation: numeric('motivation', { precision: 3, scale: 1 }),
    hrv: numeric('hrv', { precision: 5, scale: 2 }),
    bodyWeight: numeric('body_weight', { precision: 5, scale: 2 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateUnique: uniqueIndex('daily_logs_user_id_date_idx').on(table.userId, table.date),
  }),
);
```

`api/src/db/schema/pain-logs.ts`

```ts
import { date, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const painLogs = pgTable('pain_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Match this column type to the generated better-auth user.id type.
  userId: text('user_id').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  bodyRegion: text('body_region').notNull(),
  severity: numeric('severity', { precision: 3, scale: 1 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

`api/src/db/schema/index.ts`

```ts
// Replace auth.js with the exact filename emitted by the better-auth CLI.
export * from './auth.js';
export * from './daily-logs.js';
export * from './pain-logs.js';
export * from './session-components.js';
export * from './sessions.js';
```

### Commands you run

```bash
cd /home/lau/Projects/wot/api
npm run db:generate
npm run db:migrate
```

---

## Phase 5 — Fastify app wiring

### Code to use

`api/src/routes/health.ts`

```ts
import type { FastifyInstance } from 'fastify';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));
}
```

`api/src/app.ts`

```ts
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import Fastify from 'fastify';

import { env } from './env.js';
import { auth } from './lib/auth.js';
import { registerHealthRoutes } from './routes/health.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cookie);
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await registerHealthRoutes(app);

  app.all('/api/auth/*', async (request, reply) => {
    const response = await auth.handler(request.raw);
    reply.send(response);
  });

  return app;
}
```

`api/src/server.ts`

```ts
import { buildApp } from './app.js';
import { env } from './env.js';

const app = await buildApp();

await app.listen({
  host: env.API_HOST,
  port: env.API_PORT,
});
```

### Commands you run

```bash
cd /home/lau/Projects/wot/api
npm run typecheck
npm run dev
curl http://localhost:3000/health
```

Then confirm tables exist:

```bash
psql "$DATABASE_URL" -c '\dt'
```

---

## Recommended execution order

1. Bootstrap `api/` and install dependencies.
2. Add `.env`, `env.ts`, `db/client.ts`, and `drizzle.config.ts`.
3. Add `auth.ts`, then run `npm run auth:generate`.
4. Inspect the generated auth schema and confirm the real `user.id` type.
5. Add the four app schema files and the schema index.
6. Run `npm run db:generate` and `npm run db:migrate`.
7. Add `app.ts`, `server.ts`, and `/health`.
8. Start the server and verify `/health` plus the created tables.

---

## What I should implement next when you say "start"

- scaffold `api/` with the package and TypeScript setup
- add the Fastify app and health route
- wire `better-auth` into Fastify
- define the full MVP Drizzle schema
- generate and apply the first migrations
- update the docs that still mention `apps/api`

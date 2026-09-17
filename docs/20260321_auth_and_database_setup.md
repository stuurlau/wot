# Auth and database setup

This guide covers:

1. Setting up a local PostgreSQL database on your home server
2. Setting up `better-auth` for self-hosted authentication
3. Integrating both into the WOT backend with Drizzle and Fastify
4. Connecting the mobile client

**Repo note:** the examples below use the earlier `apps/api` / `apps/mobile` layout. The current concrete bootstrap plan for this repo uses `api/` at the repo root and `mobile-client/`; see `docs/20260414_backend_bootstrap_plan.md`.

---

## 1. Local PostgreSQL on your home server

### Install PostgreSQL

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

PostgreSQL starts automatically. Verify it is running:

```bash
sudo systemctl status postgresql
```

### Create the database and user

Switch to the postgres system user and open the psql shell:

```bash
sudo -u postgres psql
```

Then run:

```sql
CREATE USER wot WITH PASSWORD 'your_strong_password';
CREATE DATABASE wot OWNER wot;
GRANT ALL PRIVILEGES ON DATABASE wot TO wot;
\q
```

### Enable SSL on the server

PostgreSQL ships with SSL support but it needs a certificate. The quickest option for a home server is a self-signed certificate. If you have a domain pointing at your server, you can use a free Let's Encrypt certificate instead (recommended long-term).

**Generate a self-signed certificate** (on the home server):

```bash
sudo -u postgres openssl req -new -x509 -days 3650 -nodes \
  -out /etc/postgresql/<version>/main/server.crt \
  -keyout /etc/postgresql/<version>/main/server.key \
  -subj "/CN=your-server-hostname-or-ip"

sudo chmod 600 /etc/postgresql/<version>/main/server.key
sudo chown postgres:postgres /etc/postgresql/<version>/main/server.key
```

**Enable SSL in `postgresql.conf`:**

```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file  = 'server.key'
listen_addresses = '*'
```

### Require SSL for all connections

Edit `/etc/postgresql/<version>/main/pg_hba.conf`. Replace any existing `host` lines for WOT with `hostssl` — this rejects connections that don't use SSL, even with a valid password:

```
# reject non-SSL connections entirely for this database
hostssl    wot    wot    0.0.0.0/0    scram-sha-256
```

Restart PostgreSQL to apply:

```bash
sudo systemctl restart postgresql
```

### Copy the server certificate to your dev machine

Your app needs to trust the server's certificate. Copy `server.crt` from the home server to your dev machine:

```bash
scp user@homeserver:/etc/postgresql/<version>/main/server.crt ~/.certs/wot-server.crt
```

If you use Let's Encrypt later, use the CA bundle instead (`/etc/letsencrypt/live/<domain>/chain.pem`).

### Test the connection

```bash
psql "postgresql://wot:your_strong_password@homeserver-ip:5432/wot?sslmode=verify-ca&sslrootcert=$HOME/.certs/wot-server.crt"
```

`sslmode=verify-ca` checks the certificate is signed by a trusted CA. Use `verify-full` if your certificate CN matches the hostname exactly (preferred).

### Store the connection string

```
DATABASE_URL=postgresql://wot:your_strong_password@homeserver-ip:5432/wot?sslmode=verify-ca&sslrootcert=/path/to/wot-server.crt
```

Keep this in a `.env` file and never commit it. Add the cert path to `.env` as a variable too so it's easy to change per environment:

```bash
DATABASE_URL=postgresql://wot:your_strong_password@homeserver-ip:5432/wot?sslmode=verify-ca&sslrootcert=${DB_SSL_CERT}
DB_SSL_CERT=/home/you/.certs/wot-server.crt
```

---

## 2. Backend: better-auth setup

`better-auth` runs inside your Fastify API and manages auth entirely. It creates and owns its own tables in your PostgreSQL database via Drizzle.

### Install dependencies

```bash
cd apps/api
npm install better-auth
```

### Create the auth instance

```ts
// apps/api/src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/client'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  // add OAuth providers here later if needed:
  // socialProviders: {
  //   google: { clientId: '...', clientSecret: '...' },
  // },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.API_URL!,
})
```

### Generate the auth tables

`better-auth` manages its own `user`, `session`, `account`, and `verification` tables. Generate and run the migration:

```bash
npx @better-auth/cli generate
npx drizzle-kit migrate
```

### Mount the auth routes in Fastify

```ts
// apps/api/src/app.ts
import Fastify from 'fastify'
import { auth } from './lib/auth'

const app = Fastify()

// mount all better-auth routes at /api/auth/*
app.all('/api/auth/*', async (req, reply) => {
  const response = await auth.handler(req.raw)
  reply.send(response)
})

export default app
```

This exposes routes like `POST /api/auth/sign-in/email`, `POST /api/auth/sign-up/email`, `POST /api/auth/sign-out` automatically.

### Protect routes with a session check

```ts
// apps/api/src/middleware/requireAuth.ts
import { auth } from '../lib/auth'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({ headers: req.headers as any })
  if (!session) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
  req.session = session  // attach to request for use in routes
}
```

Extend Fastify's types to include the session:

```ts
// apps/api/src/types/fastify.d.ts
import { Session, User } from 'better-auth'

declare module 'fastify' {
  interface FastifyRequest {
    session: { user: User; session: Session }
  }
}
```

Use in any route:

```ts
app.get('/workouts', { preHandler: requireAuth }, async (req) => {
  const userId = req.session.user.id
  // query workouts for this user
})
```

---

## 3. Drizzle setup

### Install dependencies

```bash
cd apps/api
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

### Database client

```ts
// apps/api/src/db/client.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)
```

### Your app tables

`better-auth` owns the `user` table. Your app tables reference it by user ID:

```ts
// packages/schemas/src/db/workouts.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const workouts = pgTable('workouts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),  // references better-auth's user.id
  title: text('title').notNull(),
  startedAt: timestamp('started_at').notNull(),
  finishedAt: timestamp('finished_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### Drizzle config

```ts
// apps/api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../../packages/schemas/src/db/*',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Run migrations

```bash
# generate migration files from schema changes
npx drizzle-kit generate

# apply to the database
npx drizzle-kit migrate
```

---

## 4. Mobile client: auth integration

### Install the better-auth client

```bash
cd apps/mobile
npm install better-auth
```

### Create the auth client

```ts
// apps/mobile/src/lib/auth.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.API_URL!,  // points to your Fastify API
})
```

### Sign up / sign in

```ts
// sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password',
  name: 'Lau',
})

// sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password',
})
```

`better-auth` handles the session cookie automatically on the client side.

### Make authenticated API requests

Sessions are cookie-based. Include credentials in fetch calls:

```ts
// apps/mobile/src/lib/api.ts
export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${process.env.API_URL}${path}`, {
    ...options,
    credentials: 'include',  // sends the session cookie
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  })
}
```

### Get the current session

```ts
const { data: session } = await authClient.getSession()
console.log(session?.user.id)
```

---

## 5. Environment variable summary

```bash
# apps/api/.env
DATABASE_URL=postgresql://wot:your_password@homeserver-ip:5432/wot?sslmode=verify-ca&sslrootcert=${DB_SSL_CERT}
DB_SSL_CERT=/home/you/.certs/wot-server.crt
BETTER_AUTH_SECRET=a_long_random_secret_string   # generate with: openssl rand -hex 32
API_URL=http://your-server-ip:3000

# apps/mobile/.env
API_URL=http://your-server-ip:3000
```

Never commit `.env` files. Add them to `.gitignore`.

---

## Flow summary

```
Mobile app
  → signs in via POST /api/auth/sign-in/email (on your Fastify API)
  → better-auth validates credentials, creates session, sets cookie
  → subsequent requests include the session cookie automatically

Fastify API
  → auth routes handled by better-auth handler
  → protected routes call auth.api.getSession() to verify the session
  → user ID available from session for DB queries

Local PostgreSQL
  → better-auth owns: user, session, account, verification tables
  → your app owns: workouts, sets, pain_logs, etc. (reference user.id)
```

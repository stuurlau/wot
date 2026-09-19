import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';

import { db } from '../db/client.js';
import { getEnv } from '../env.js';

const env = getEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  // Keep table names plural, consistent with the app tables (and avoids the
  // reserved word "user"). These modelNames must match the exported table
  // names in src/db/schema/auth.ts.
  user: { modelName: 'users' },
  session: { modelName: 'sessions' },
  account: { modelName: 'accounts' },
  verification: { modelName: 'verifications' },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.API_URL,
  trustedOrigins: [env.CORS_ORIGIN],
});

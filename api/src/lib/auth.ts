import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, emailOTP } from 'better-auth/plugins';

import { db } from '../db/client.js';
import { getEnv } from '../env.js';
import { mailer } from './mailer.js';

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
  plugins: [
    bearer(),
    // Forgot password: a 6-digit code by email, then a new password
    // (POST /api/auth/email-otp/request-password-reset → /email-otp/reset-password).
    emailOTP({
      disableSignUp: true,
      storeOTP: 'hashed',
      sendVerificationOTP: ({ email, otp }) =>
        mailer.send({
          to: email,
          subject: `${otp} is your WOT code`,
          text: `Your WOT code is ${otp}. It expires in 5 minutes.\n\nDidn't ask for this? You can ignore this email.`,
        }),
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.API_URL,
  trustedOrigins: [env.CORS_ORIGIN],
});

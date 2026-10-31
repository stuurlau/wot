# Password reset by email code (#35)

**Date:** 2026-10-29

## What

"Forgot password?" on the login screen opens `app/(auth)/forgot-password.tsx`:
email → a 6-digit code by mail → new password → signed in. It is the first
feature that sends email; sign-up still sends none (no email verification).

## How

- **better-auth `emailOTP` plugin** (`api/src/lib/auth.ts`). Endpoints:
  `POST /api/auth/email-otp/request-password-reset` and
  `POST /api/auth/email-otp/reset-password`. Codes live in the existing
  `verifications` table (no migration), stored hashed, expire after 5 minutes
  with 3 attempts (plugin defaults). `disableSignUp` keeps the plugin's
  sign-in-by-code endpoint from creating accounts. An unknown email gets the
  same 200 response and no mail, so accounts can't be probed.
- **Mail** via the Resend SDK in `api/src/lib/mailer.ts`. Env:
  `RESEND_API_KEY` (unset = the code is logged instead of mailed — local dev
  and tests) and `MAIL_FROM` (default `WOT <noreply@wot-app.org>`; the domain
  must be verified in Resend). For local testing before the domain is
  verified, `MAIL_FROM=onboarding@resend.dev` works but only delivers to the
  Resend account owner's address.
- **Client**: `emailOTPClient()` on `authClient`; after the reset the screen
  signs in with the new password through the auth store.

## Tests

`api/test/integration/password-reset.test.ts` mocks `mailer.send` to capture
the code: wrong code rejected, reset works, old password rejected, new one
accepted, unknown email sends nothing. Integration setup forces
`RESEND_API_KEY=""` so tests never send real mail.

## Later

- Email verification at sign-up (same mailer) — a typo'd address currently
  makes reset impossible.

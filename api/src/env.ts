import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_URL: z.url(),
  CORS_ORIGIN: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(vars: NodeJS.ProcessEnv): Env {
  return envSchema.parse(vars);
}

// Parsed on first use instead of at import time, so importing this module has
// no side effects (tests can use parseEnv without a populated process.env).
// The server still fails fast on boot at the first access.
let cached: Env | undefined;

export function getEnv(): Env {
  return (cached ??= parseEnv(process.env));
}

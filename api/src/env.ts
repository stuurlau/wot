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

export const env = envSchema.parse(process.env);

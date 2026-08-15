import type { auth } from "../lib/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    authSession: Awaited<ReturnType<typeof auth.api.getSession>>;
  }
}

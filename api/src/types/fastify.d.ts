import type { AuthSession } from "../lib/authentication.js";

declare module "fastify" {
  interface FastifyRequest {
    authSession?: AuthSession;
  }
}

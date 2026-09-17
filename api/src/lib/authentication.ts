import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";

import { auth } from "./auth.js";
import { unauthenticatedError } from "./api-error.js";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function requireAuthentication(request: FastifyRequest) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    throw unauthenticatedError();
  }

  request.authSession = session;
}

export function authenticatedUserId(request: FastifyRequest): string {
  if (!request.authSession) {
    throw unauthenticatedError();
  }
  return request.authSession.user.id;
}

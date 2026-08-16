import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";

import { buildApp } from "../../src/app.js";
import { db } from "../../src/db/client.js";
import { user } from "../../src/db/schema/index.js";

export async function createTestApp(): Promise<FastifyInstance> {
  return buildApp();
}

export interface TestUser {
  userId: string;
  email: string;
  token: string;
}

let _counter = 0;

/**
 * Sign up a fresh test user via the auth API and return their id + Bearer token.
 * Each call uses a unique email so suites don't collide when run in parallel.
 */
export async function createTestUser(app: FastifyInstance): Promise<TestUser> {
  const tag = `${Date.now()}-${++_counter}`;
  const email = `integration-${tag}@wot.test`;

  const res = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    payload: { email, password: "test_password_123!", name: "Integration User" },
    headers: { "content-type": "application/json" },
  });

  if (res.statusCode !== 200) {
    throw new Error(`Sign-up failed (${res.statusCode}): ${res.body}`);
  }

  const body = res.json<{ token: string; user: { id: string } }>();
  return { userId: body.user.id, email, token: body.token };
}

/**
 * Returns inject headers with the Bearer token for the given user.
 */
export function auth(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

/**
 * Delete the test user (all app data cascades from the auth user row).
 */
export async function deleteTestUser(userId: string): Promise<void> {
  await db.delete(user).where(eq(user.id, userId));
}

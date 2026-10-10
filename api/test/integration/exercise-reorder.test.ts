import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

async function createSessionWithExercises(
  app: FastifyInstance,
  token: string,
  names: string[],
): Promise<{ sessionId: string; exerciseIds: string[] }> {
  const sessionRes = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { startedAt: "2026-10-01T08:00:00.000Z", duration: 3600, srpe: 7, type: "strength" },
    headers: auth(token),
  });
  assert.equal(sessionRes.statusCode, 201, sessionRes.body);
  const sessionId = sessionRes.json<{ id: string }>().id;

  const exerciseIds: string[] = [];
  for (const [index, name] of names.entries()) {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises`,
      payload: { name, sortOrder: index },
      headers: auth(token),
    });
    assert.equal(res.statusCode, 201, res.body);
    exerciseIds.push(res.json<{ id: string }>().id);
  }
  return { sessionId, exerciseIds };
}

async function exerciseNamesInOrder(
  app: FastifyInstance,
  token: string,
  sessionId: string,
): Promise<string[]> {
  const res = await app.inject({
    method: "GET",
    url: `/api/v1/sessions/${sessionId}`,
    headers: auth(token),
  });
  assert.equal(res.statusCode, 200, res.body);
  return res.json<{ exercises: { name: string }[] }>().exercises.map((e) => e.name);
}

describe("exercise reorder", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  let otherUser: TestUser;

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
    otherUser = await createTestUser(app);
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await deleteTestUser(otherUser.userId);
    await app.close();
    await pool.end();
  });

  it("rewrites sort_order to the given order", async () => {
    const { sessionId, exerciseIds } = await createSessionWithExercises(app, testUser.token, [
      "Squat",
      "Bench Press",
      "Row",
    ]);
    const reversed = [...exerciseIds].reverse();

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/sessions/${sessionId}/exercises/reorder`,
      payload: { exerciseIds: reversed },
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 200, res.body);
    assert.deepEqual(
      res.json<{ data: { id: string; sortOrder: number }[] }>().data.map((e) => e.id),
      reversed,
    );

    assert.deepEqual(await exerciseNamesInOrder(app, testUser.token, sessionId), [
      "Row",
      "Bench Press",
      "Squat",
    ]);
  });

  it("rejects id lists that do not match the session's exercises", async () => {
    const { sessionId, exerciseIds } = await createSessionWithExercises(app, testUser.token, [
      "Squat",
      "Bench Press",
    ]);
    const other = await createSessionWithExercises(app, testUser.token, ["Deadlift"]);

    for (const exerciseIdsPayload of [
      [exerciseIds[0]], // missing one
      [...exerciseIds, other.exerciseIds[0]], // foreign exercise
      [exerciseIds[0], exerciseIds[0]], // duplicate
    ]) {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/sessions/${sessionId}/exercises/reorder`,
        payload: { exerciseIds: exerciseIdsPayload },
        headers: auth(testUser.token),
      });
      assert.equal(
        res.statusCode,
        422,
        `expected 422 for ${JSON.stringify(exerciseIdsPayload)}, got ${res.statusCode}`,
      );
    }

    // Failed attempts leave the order untouched.
    assert.deepEqual(await exerciseNamesInOrder(app, testUser.token, sessionId), [
      "Squat",
      "Bench Press",
    ]);
  });

  it("returns 404 for another user's session", async () => {
    const { sessionId, exerciseIds } = await createSessionWithExercises(app, testUser.token, [
      "Squat",
    ]);
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/sessions/${sessionId}/exercises/reorder`,
      payload: { exerciseIds },
      headers: auth(otherUser.token),
    });
    assert.equal(res.statusCode, 404, res.body);
  });
});

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

async function createSession(
  app: FastifyInstance,
  token: string,
  startedAt: string,
): Promise<string> {
  const res = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { startedAt, duration: 3600, srpe: 7, type: "strength" },
    headers: auth(token),
  });
  assert.equal(res.statusCode, 201, res.body);
  return res.json<{ id: string }>().id;
}

async function addExerciseWithSets(
  app: FastifyInstance,
  token: string,
  sessionId: string,
  name: string,
  sets: { weight?: number; reps?: number; rir?: number }[],
): Promise<void> {
  const exerciseRes = await app.inject({
    method: "POST",
    url: `/api/v1/sessions/${sessionId}/exercises`,
    payload: { name, sortOrder: 0 },
    headers: auth(token),
  });
  assert.equal(exerciseRes.statusCode, 201, exerciseRes.body);
  const exerciseId = exerciseRes.json<{ id: string }>().id;

  for (const [index, set] of sets.entries()) {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets`,
      payload: { sortOrder: index, ...set },
      headers: auth(token),
    });
    assert.equal(res.statusCode, 201, res.body);
  }
}

describe("GET /exercises/last", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  let otherUser: TestUser;

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
    otherUser = await createTestUser(app);

    // Older occurrence: two light sets. Newer occurrence: three heavy sets.
    const oldSession = await createSession(app, testUser.token, "2026-09-20T08:00:00.000Z");
    await addExerciseWithSets(app, testUser.token, oldSession, "Bench Press", [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 8 },
    ]);
    const newSession = await createSession(app, testUser.token, "2026-09-27T08:00:00.000Z");
    await addExerciseWithSets(app, testUser.token, newSession, "Bench Press", [
      { weight: 70, reps: 5 },
      { weight: 70, reps: 5 },
      { weight: 72.5, reps: 3, rir: 1 },
    ]);
    await addExerciseWithSets(app, testUser.token, newSession, "Squat", [{ weight: 100, reps: 5 }]);

    const otherSession = await createSession(app, otherUser.token, "2026-09-28T08:00:00.000Z");
    await addExerciseWithSets(app, otherUser.token, otherSession, "Bench Press", [
      { weight: 200, reps: 1 },
    ]);
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await deleteTestUser(otherUser.userId);
    await app.close();
    await pool.end();
  });

  it("returns the sets of the most recent occurrence of the name", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/last?name=Bench%20Press",
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 200, res.body);
    const body = res.json<{
      name: string;
      lastUsedAt: string;
      sets: { weight: number | null; reps: number | null; rir: number | null }[];
    }>();
    assert.equal(body.name, "Bench Press");
    assert.equal(body.lastUsedAt, "2026-09-27T08:00:00.000Z");
    assert.deepEqual(
      body.sets.map((s) => [s.weight, s.reps, s.rir]),
      [
        [70, 5, null],
        [70, 5, null],
        [72.5, 3, 1],
      ],
    );
  });

  it("is scoped per user and 404s for unknown names", async () => {
    const otherRes = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/last?name=Bench%20Press",
      headers: auth(otherUser.token),
    });
    assert.equal(otherRes.json<{ sets: unknown[] }>().sets.length, 1);

    const missing = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/last?name=Never%20Done",
      headers: auth(testUser.token),
    });
    assert.equal(missing.statusCode, 404, missing.body);

    const noName = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/last",
      headers: auth(testUser.token),
    });
    assert.equal(noName.statusCode, 400, noName.body);
  });
});

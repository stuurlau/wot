import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

async function createSessionWithExercise(
  app: FastifyInstance,
  token: string,
  startedAt: string,
  exerciseName: string,
): Promise<string> {
  const sessionRes = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { startedAt, duration: 3600, srpe: 7, type: "strength", title: null, notes: null },
    headers: auth(token),
  });
  assert.equal(sessionRes.statusCode, 201, sessionRes.body);
  const sessionId = sessionRes.json<{ id: string }>().id;

  const exerciseRes = await app.inject({
    method: "POST",
    url: `/api/v1/sessions/${sessionId}/exercises`,
    payload: { name: exerciseName, sortOrder: 0, notes: null },
    headers: auth(token),
  });
  assert.equal(exerciseRes.statusCode, 201, exerciseRes.body);
  return sessionId;
}

describe("exercise rename", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  let otherUser: TestUser;
  let sessionIds: string[];

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
    otherUser = await createTestUser(app);

    sessionIds = [];
    sessionIds.push(await createSessionWithExercise(app, testUser.token, "2026-08-20T08:00:00.000Z", "Bench Press"));
    sessionIds.push(await createSessionWithExercise(app, testUser.token, "2026-08-22T08:00:00.000Z", "benchpress"));
    sessionIds.push(await createSessionWithExercise(app, testUser.token, "2026-08-24T08:00:00.000Z", "Squat"));
    await createSessionWithExercise(app, otherUser.token, "2026-08-20T08:00:00.000Z", "Bench Press");
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await deleteTestUser(otherUser.userId);
    await app.close();
    await pool.end();
  });

  it("suggests fuzzy-matching distinct names, scoped to the user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/similar?name=Benchpress",
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200, res.body);
    const { data } = res.json<{ data: string[] }>();
    assert.ok(data.includes("Bench Press"));
    assert.ok(data.includes("benchpress"));
    assert.ok(!data.includes("Squat"));
  });

  it("renames exactly the listed names across all of the user's sessions", async () => {
    const renameRes = await app.inject({
      method: "PATCH",
      url: "/api/v1/exercises/rename",
      payload: { from: ["Bench Press", "benchpress"], to: "Bench press" },
      headers: auth(testUser.token),
    });
    assert.equal(renameRes.statusCode, 200, renameRes.body);
    assert.equal(renameRes.json<{ updated: number }>().updated, 2);

    for (const sessionId of sessionIds) {
      const detail = await app.inject({
        method: "GET",
        url: `/api/v1/sessions/${sessionId}`,
        headers: auth(testUser.token),
      });
      const { exercises } = detail.json<{ exercises: { name: string }[] }>();
      if (exercises[0]?.name === "Squat") continue;
      assert.equal(exercises[0]?.name, "Bench press");
    }

    // The other user's identically named exercise is untouched.
    const otherSimilar = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/similar?name=Benchpress",
      headers: auth(otherUser.token),
    });
    assert.deepEqual(otherSimilar.json<{ data: string[] }>().data, ["Bench Press"]);
  });

  it("rejects invalid bodies with 422", async () => {
    for (const payload of [
      { from: [], to: "Bench press" },
      { from: ["Bench press"], to: "" },
      { from: ["Bench press"], to: "Bench Press", extra: true },
    ]) {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/exercises/rename",
        payload,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 422, `expected 422 for ${JSON.stringify(payload)}, got ${res.statusCode}`);
    }
  });

  it("rejects a similar query without a name", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/similar",
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 400);
  });
});

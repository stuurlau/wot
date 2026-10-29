import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

type ConfigEntry = {
  exerciseName: string;
  fields: string[] | null;
  tempo: string | null;
  bodyParts: string[] | null;
};

async function createSessionWithExercise(
  app: FastifyInstance,
  token: string,
  exerciseName: string,
): Promise<{ sessionId: string; exerciseId: string }> {
  const sessionRes = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { startedAt: "2026-10-10T08:00:00.000Z", duration: 3600, srpe: 7, type: "strength" },
    headers: auth(token),
  });
  assert.equal(sessionRes.statusCode, 201, sessionRes.body);
  const sessionId = sessionRes.json<{ id: string }>().id;

  const exerciseRes = await app.inject({
    method: "POST",
    url: `/api/v1/sessions/${sessionId}/exercises`,
    payload: { name: exerciseName, sortOrder: 0 },
    headers: auth(token),
  });
  assert.equal(exerciseRes.statusCode, 201, exerciseRes.body);
  return { sessionId, exerciseId: exerciseRes.json<{ id: string }>().id };
}

describe("exercise config", () => {
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

  it("creates, replaces, lists and resets a per-name config", async () => {
    const putRes = await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/config",
      payload: {
        exerciseName: "Config Bench",
        config: { fields: ["weight", "reps", "duration"], tempo: "3-2-1", bodyParts: ["chest"] },
      },
      headers: auth(testUser.token),
    });
    assert.equal(putRes.statusCode, 200, putRes.body);
    assert.deepEqual(putRes.json(), {
      exerciseName: "Config Bench",
      fields: ["weight", "reps", "duration"],
      tempo: "3-2-1",
      bodyParts: ["chest"],
    });

    // Upsert: replacing the same name must not violate the unique index.
    const replaceRes = await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/config",
      payload: {
        exerciseName: "Config Bench",
        config: { fields: ["reps"], tempo: null, bodyParts: null },
      },
      headers: auth(testUser.token),
    });
    assert.equal(replaceRes.statusCode, 200, replaceRes.body);

    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/config",
      headers: auth(testUser.token),
    });
    assert.equal(listRes.statusCode, 200, listRes.body);
    const data = listRes.json<{ data: ConfigEntry[] }>().data;
    assert.deepEqual(data, [
      { exerciseName: "Config Bench", fields: ["reps"], tempo: null, bodyParts: null },
    ]);

    // Configs are per user.
    const otherRes = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/config",
      headers: auth(otherUser.token),
    });
    assert.deepEqual(otherRes.json<{ data: ConfigEntry[] }>().data, []);

    // All-null resets to inheriting the global settings: the row is deleted.
    const resetRes = await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/config",
      payload: {
        exerciseName: "Config Bench",
        config: { fields: null, tempo: null, bodyParts: null },
      },
      headers: auth(testUser.token),
    });
    assert.equal(resetRes.statusCode, 200, resetRes.body);
    const afterReset = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/config",
      headers: auth(testUser.token),
    });
    assert.deepEqual(afterReset.json<{ data: ConfigEntry[] }>().data, []);
  });

  it("rejects invalid bodies with 422", async () => {
    for (const payload of [
      { exerciseName: "", config: { fields: null, tempo: null, bodyParts: null } },
      { exerciseName: "X", config: { fields: [], tempo: null, bodyParts: null } },
      { exerciseName: "X", config: { fields: ["weight", "weight"], tempo: null, bodyParts: null } },
      { exerciseName: "X", config: { fields: ["volume"], tempo: null, bodyParts: null } },
      { exerciseName: "X", config: { fields: null, tempo: null, bodyParts: ["push"] } },
      { exerciseName: "X", config: { fields: null, tempo: null, bodyParts: ["chest", "chest"] } },
      { exerciseName: "X", config: { fields: null, tempo: "3-2-1", bodyParts: null }, extra: true },
      { exerciseName: "X" },
    ]) {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/exercises/config",
        payload,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 422, `expected 422 for ${JSON.stringify(payload)}, got ${res.statusCode}`);
    }
  });

  it("stores tempo on sets", async () => {
    const { sessionId, exerciseId } = await createSessionWithExercise(app, testUser.token, "Tempo Bench");
    const createRes = await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets`,
      payload: { sortOrder: 0, weight: 60, reps: 5, tempo: "3-2-1" },
      headers: auth(testUser.token),
    });
    assert.equal(createRes.statusCode, 201, createRes.body);
    const set = createRes.json<{ id: string; tempo: string | null }>();
    assert.equal(set.tempo, "3-2-1");

    const patchRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets/${set.id}`,
      payload: { tempo: "5-0-X" },
      headers: auth(testUser.token),
    });
    assert.equal(patchRes.statusCode, 200, patchRes.body);
    assert.equal(patchRes.json<{ tempo: string | null }>().tempo, "5-0-X");

    const detail = await app.inject({
      method: "GET",
      url: `/api/v1/sessions/${sessionId}`,
      headers: auth(testUser.token),
    });
    const { exercises } = detail.json<{ exercises: { sets: { tempo: string | null }[] }[] }>();
    assert.equal(exercises[0]?.sets[0]?.tempo, "5-0-X");
  });

  it("moves config and merges tags on rename; target rows win on collision", async () => {
    // No collision: both config and tags follow the rename.
    await createSessionWithExercise(app, testUser.token, "Cfg Benchpress");
    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/config",
      payload: {
        exerciseName: "Cfg Benchpress",
        config: { fields: ["weight", "reps"], tempo: "2-0-2", bodyParts: null },
      },
      headers: auth(testUser.token),
    });
    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Cfg Benchpress", tags: ["push", "chest"] },
      headers: auth(testUser.token),
    });

    const renameRes = await app.inject({
      method: "PATCH",
      url: "/api/v1/exercises/rename",
      payload: { from: ["Cfg Benchpress"], to: "Cfg Bench Press" },
      headers: auth(testUser.token),
    });
    assert.equal(renameRes.statusCode, 200, renameRes.body);

    const configAfter = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/config",
      headers: auth(testUser.token),
    });
    const configs = configAfter.json<{ data: ConfigEntry[] }>().data;
    assert.deepEqual(
      configs.find((c) => c.exerciseName === "Cfg Bench Press"),
      { exerciseName: "Cfg Bench Press", fields: ["weight", "reps"], tempo: "2-0-2", bodyParts: null },
    );
    assert.equal(configs.find((c) => c.exerciseName === "Cfg Benchpress"), undefined);

    const tagsAfter = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/tags",
      headers: auth(testUser.token),
    });
    const tags = tagsAfter.json<{ data: { exerciseName: string; tags: string[] }[] }>().data;
    assert.deepEqual(tags.find((t) => t.exerciseName === "Cfg Bench Press")?.tags, ["chest", "push"]);

    // Collision: target name already has config + a shared tag — the
    // target's config wins, tags merge without duplicates.
    await createSessionWithExercise(app, testUser.token, "Cfg Benchpress2");
    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/config",
      payload: {
        exerciseName: "Cfg Benchpress2",
        config: { fields: ["duration"], tempo: null, bodyParts: null },
      },
      headers: auth(testUser.token),
    });
    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Cfg Benchpress2", tags: ["push", "shoulders"] },
      headers: auth(testUser.token),
    });

    const collideRes = await app.inject({
      method: "PATCH",
      url: "/api/v1/exercises/rename",
      payload: { from: ["Cfg Benchpress2"], to: "Cfg Bench Press" },
      headers: auth(testUser.token),
    });
    assert.equal(collideRes.statusCode, 200, collideRes.body);

    const configFinal = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/config",
      headers: auth(testUser.token),
    });
    const finalConfigs = configFinal.json<{ data: ConfigEntry[] }>().data;
    // Target config untouched, source config dropped.
    assert.deepEqual(
      finalConfigs.find((c) => c.exerciseName === "Cfg Bench Press"),
      { exerciseName: "Cfg Bench Press", fields: ["weight", "reps"], tempo: "2-0-2", bodyParts: null },
    );
    assert.equal(finalConfigs.find((c) => c.exerciseName === "Cfg Benchpress2"), undefined);

    const tagsFinal = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/tags",
      headers: auth(testUser.token),
    });
    const finalTags = tagsFinal.json<{ data: { exerciseName: string; tags: string[] }[] }>().data;
    assert.deepEqual(finalTags.find((t) => t.exerciseName === "Cfg Bench Press")?.tags, [
      "chest",
      "push",
      "shoulders",
    ]);
  });
});

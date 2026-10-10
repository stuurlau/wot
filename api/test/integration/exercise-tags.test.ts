import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

describe("exercise tags", () => {
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

  it("replaces and lists tags per exercise name, normalized to lowercase", async () => {
    const putRes = await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Bench Press", tags: ["Prehab", "push", "prehab"] },
      headers: auth(testUser.token),
    });
    assert.equal(putRes.statusCode, 200, putRes.body);
    assert.deepEqual(putRes.json(), { exerciseName: "Bench Press", tags: ["prehab", "push"] });

    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Squat", tags: ["legs"] },
      headers: auth(testUser.token),
    });

    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/tags",
      headers: auth(testUser.token),
    });
    assert.equal(listRes.statusCode, 200, listRes.body);
    assert.deepEqual(listRes.json(), {
      data: [
        { exerciseName: "Bench Press", tags: ["prehab", "push"] },
        { exerciseName: "Squat", tags: ["legs"] },
      ],
    });

    // Replace semantics: the new set fully replaces the old one.
    const replaceRes = await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Bench Press", tags: ["flexibility"] },
      headers: auth(testUser.token),
    });
    assert.deepEqual(replaceRes.json(), { exerciseName: "Bench Press", tags: ["flexibility"] });

    // Clearing works by sending an empty list.
    await app.inject({
      method: "PUT",
      url: "/api/v1/exercises/tags",
      payload: { exerciseName: "Bench Press", tags: [] },
      headers: auth(testUser.token),
    });
    const afterClear = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/tags",
      headers: auth(testUser.token),
    });
    assert.deepEqual(afterClear.json(), { data: [{ exerciseName: "Squat", tags: ["legs"] }] });

    // Tags are per user.
    const otherRes = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/tags",
      headers: auth(otherUser.token),
    });
    assert.deepEqual(otherRes.json(), { data: [] });
  });

  it("rejects invalid bodies with 422", async () => {
    for (const payload of [
      { exerciseName: "", tags: ["prehab"] },
      { exerciseName: "Squat", tags: [""] },
      { exerciseName: "Squat" },
      { exerciseName: "Squat", tags: ["ok"], extra: true },
    ]) {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/exercises/tags",
        payload,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 422, `expected 422 for ${JSON.stringify(payload)}, got ${res.statusCode}`);
    }
  });
});

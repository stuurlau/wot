import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

describe("user settings", () => {
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

  it("returns defaults when the user has no stored settings", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/settings",
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 200, res.body);
    assert.deepEqual(res.json(), {
      strengthFields: ["weight", "reps"],
      cardioFields: ["distance", "duration"],
    });
  });

  it("stores settings on PUT and returns them on GET", async () => {
    const putRes = await app.inject({
      method: "PUT",
      url: "/api/v1/settings",
      payload: { strengthFields: ["weight", "reps", "rpe"], cardioFields: ["duration", "weight"] },
      headers: auth(testUser.token),
    });
    assert.equal(putRes.statusCode, 200, putRes.body);

    const getRes = await app.inject({
      method: "GET",
      url: "/api/v1/settings",
      headers: auth(testUser.token),
    });
    assert.deepEqual(getRes.json(), {
      strengthFields: ["weight", "reps", "rpe"],
      cardioFields: ["duration", "weight"],
    });

    // Settings are per user: the other user still sees defaults.
    const otherRes = await app.inject({
      method: "GET",
      url: "/api/v1/settings",
      headers: auth(otherUser.token),
    });
    assert.deepEqual(otherRes.json(), {
      strengthFields: ["weight", "reps"],
      cardioFields: ["distance", "duration"],
    });
  });

  it("rejects invalid bodies with 422", async () => {
    for (const payload of [
      { strengthFields: [], cardioFields: ["duration"] },
      { strengthFields: ["weight", "weight"], cardioFields: ["duration"] },
      { strengthFields: ["pace"], cardioFields: ["duration"] },
      { strengthFields: ["weight"] },
      { strengthFields: ["weight"], cardioFields: ["duration"], extra: true },
    ]) {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/settings",
        payload,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 422, `expected 422 for ${JSON.stringify(payload)}, got ${res.statusCode}`);
    }
  });
});

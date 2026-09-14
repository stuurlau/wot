import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

describe("exercise history", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  let sessionId: string;
  let exerciseId: string;

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);

    const sessionRes = await app.inject({
      method: "POST",
      url: "/api/v1/sessions",
      payload: {
        startedAt: "2026-08-20T08:00:00.000Z",
        duration: 3600,
        srpe: 7,
        type: "strength",
        title: "Push day",
        notes: null,
      },
      headers: auth(testUser.token),
    });
    sessionId = sessionRes.json<{ id: string }>().id;

    const exerciseRes = await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises`,
      payload: { name: "Bench Press", bodyRegions: ["push", "chest"], sortOrder: 0, notes: null },
      headers: auth(testUser.token),
    });
    exerciseId = exerciseRes.json<{ id: string }>().id;

    await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets`,
      payload: { sortOrder: 0, weight: 80, reps: 8, notes: null },
      headers: auth(testUser.token),
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets`,
      payload: { sortOrder: 1, weight: 82.5, reps: 6, notes: null },
      headers: auth(testUser.token),
    });
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await app.close();
    await pool.end();
  });

  it("returns flat exercise-set rows over the date range", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/history?from=2026-08-01&to=2026-09-01",
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200, res.body);
    const body = res.json<{
      data: { name: string; bodyRegions: string[]; date: string; weight: number | null; reps: number | null }[];
    }>();
    assert.equal(body.data.length, 2);
    const row = body.data[0];
    assert.equal(row.name, "Bench Press");
    assert.deepEqual(row.bodyRegions, ["push", "chest"]);
    assert.equal(row.date, "2026-08-20");
    assert.equal(row.weight, 80);
    assert.equal(row.reps, 8);
  });

  it("respects the from/to range", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/history?from=2026-09-01&to=2026-10-01",
      headers: auth(testUser.token),
    });
    const body = res.json<{ data: unknown[] }>();
    assert.equal(body.data.length, 0);
  });

  it("requires both from and to", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/exercises/history?from=2026-08-01",
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 400);
  });
});
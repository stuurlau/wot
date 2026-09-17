import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

describe("daily logs", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  const DATE = "2026-08-16";

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await app.close();
    await pool.end();
  });

  it("creates a daily log via PUT (upsert)", async () => {
    const res = await app.inject({
      method: "PUT",
      url: `/api/v1/daily-logs/${DATE}`,
      payload: {
        sleepDuration: 450,
        sleepQuality: 7.5,
        fatigue: 4,
        soreness: 3,
        motivation: 8,
      },
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200, res.body);
    const body = res.json<{
      date: string;
      sleepDuration: number;
      sleepQuality: number;
      fatigue: number;
    }>();
    assert.equal(body.date, DATE);
    assert.equal(body.sleepDuration, 450);
    assert.equal(body.sleepQuality, 7.5);
    assert.equal(body.fatigue, 4);
  });

  it("is idempotent — PUT again updates the same row", async () => {
    const res = await app.inject({
      method: "PUT",
      url: `/api/v1/daily-logs/${DATE}`,
      payload: { sleepDuration: 480, sleepQuality: 8 },
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200);
    const body = res.json<{ sleepDuration: number; sleepQuality: number }>();
    assert.equal(body.sleepDuration, 480);
    assert.equal(body.sleepQuality, 8);
  });

  it("fetches the daily log by date", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/daily-logs/${DATE}`,
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200);
    const body = res.json<{ date: string; sleepDuration: number }>();
    assert.equal(body.date, DATE);
    assert.equal(body.sleepDuration, 480);
  });

  it("lists daily logs in a date range", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/daily-logs",
      query: { from: "2026-08-01", to: "2026-09-01" },
      headers: auth(testUser.token),
    });

    assert.equal(res.statusCode, 200);
    const body = res.json<{ data: { date: string }[] }>();
    assert.ok(body.data.some((l) => l.date === DATE));
  });

  it("deletes the daily log", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/daily-logs/${DATE}`,
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 204);
  });

  it("returns 404 for the deleted date", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/daily-logs/${DATE}`,
      headers: auth(testUser.token),
    });
    assert.equal(res.statusCode, 404);
  });
});

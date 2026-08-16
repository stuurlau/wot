import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";

describe("pain logs", () => {
  let app: FastifyInstance;
  let testUser: TestUser;

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await app.close();
  });

  describe("POST + GET + PATCH + DELETE lifecycle", () => {
    let painLogId: string;

    it("creates a pain log", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/pain-logs",
        payload: {
          date: "2026-08-16",
          bodyRegion: "shoulders",
          severity: 4.5,
          notes: "Dull ache after pressing",
        },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 201, res.body);
      const body = res.json<{
        id: string;
        bodyRegion: string;
        severity: number;
        notes: string;
      }>();
      assert.ok(body.id);
      assert.equal(body.bodyRegion, "shoulders");
      assert.equal(body.severity, 4.5);
      assert.equal(body.notes, "Dull ache after pressing");

      painLogId = body.id;
    });

    it("lists pain logs and includes the created entry", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/pain-logs",
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ data: { id: string }[] }>();
      assert.ok(body.data.some((p) => p.id === painLogId));
    });

    it("filters pain logs by body region", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/pain-logs",
        query: { bodyRegion: "shoulders" },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ data: { bodyRegion: string }[] }>();
      assert.ok(body.data.every((p) => p.bodyRegion === "shoulders"));
    });

    it("patches severity and notes", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/pain-logs/${painLogId}`,
        payload: { severity: 2.5, notes: "Improving" },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200, res.body);
      const body = res.json<{ severity: number; notes: string }>();
      assert.equal(body.severity, 2.5);
      assert.equal(body.notes, "Improving");
    });

    it("deletes the pain log", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/pain-logs/${painLogId}`,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 204);
    });

    it("no longer lists the deleted entry", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/pain-logs",
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ data: { id: string }[] }>();
      assert.ok(!body.data.some((p) => p.id === painLogId));
    });
  });
});

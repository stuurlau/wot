import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { auth, createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";

describe("training sessions", () => {
  let app: FastifyInstance;
  let testUser: TestUser;

  before(async () => {
    app = await createTestApp();
    testUser = await createTestUser(app);
  });

  after(async () => {
    await deleteTestUser(testUser.userId);
    await app.close();
    await pool.end();
  });

  const SESSION_BODY = {
    startedAt: "2026-08-16T08:00:00.000Z",
    duration: 3600,
    srpe: 7.5,
    type: "strength",
    title: "Push day",
    notes: null,
  };

  describe("POST /sessions", () => {
    it("creates a training session and returns computed load", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/sessions",
        payload: SESSION_BODY,
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 201, res.body);
      const body = res.json<{ id: string; load: number; srpe: number }>();
      assert.ok(body.id);
      assert.equal(body.load, 3600 * 7.5);
      assert.equal(body.srpe, 7.5);
    });
  });

  describe("GET + PATCH + DELETE lifecycle", () => {
    let sessionId: string;
    let exerciseId: string;
    let setId: string;

    before(async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/sessions",
        payload: SESSION_BODY,
        headers: auth(testUser.token),
      });
      sessionId = res.json<{ id: string }>().id;
    });

    it("lists the created session", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/sessions",
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ data: { id: string }[]; page: { nextCursor: null } }>();
      assert.ok(body.data.some((s) => s.id === sessionId));
    });

    it("fetches a single session with empty exercises", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/sessions/${sessionId}`,
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ id: string; exercises: unknown[] }>();
      assert.equal(body.id, sessionId);
      assert.deepEqual(body.exercises, []);
    });

    it("patches the session title and notes", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/sessions/${sessionId}`,
        payload: { title: "Updated push day", notes: "Felt great" },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ title: string; notes: string }>();
      assert.equal(body.title, "Updated push day");
      assert.equal(body.notes, "Felt great");
    });

    it("adds an exercise to the session", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/sessions/${sessionId}/exercises`,
        payload: {
          name: "Bench Press",
          bodyRegions: ["push", "chest"],
          sortOrder: 0,
        },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 201, res.body);
      const body = res.json<{ id: string; name: string; trainingSessionId: string }>();
      assert.equal(body.name, "Bench Press");
      assert.equal(body.trainingSessionId, sessionId);
      exerciseId = body.id;
    });

    it("adds a set to the exercise", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets`,
        payload: {
          sortOrder: 0,
          weight: 80,
          reps: 8,
          rir: 2,
          rpe: 8,
        },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 201, res.body);
      const body = res.json<{ id: string; weight: number; reps: number; trainingSessionExerciseId: string }>();
      assert.equal(body.weight, 80);
      assert.equal(body.reps, 8);
      assert.equal(body.trainingSessionExerciseId, exerciseId);
      setId = body.id;
    });

    it("fetches the session detail with the added exercise and set", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/sessions/${sessionId}`,
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{
        exercises: {
          id: string;
          name: string;
          sets: { id: string; weight: number; reps: number }[];
        }[];
      }>();
      assert.equal(body.exercises.length, 1);
      assert.equal(body.exercises[0].name, "Bench Press");
      assert.equal(body.exercises[0].sets.length, 1);
      assert.equal(body.exercises[0].sets[0].weight, 80);
      assert.equal(body.exercises[0].sets[0].reps, 8);
    });

    it("patches the set", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets/${setId}`,
        payload: { weight: 85, reps: 6 },
        headers: auth(testUser.token),
      });

      assert.equal(res.statusCode, 200);
      const body = res.json<{ weight: number; reps: number }>();
      assert.equal(body.weight, 85);
      assert.equal(body.reps, 6);
    });

    it("deletes the set", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}/sets/${setId}`,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 204);
    });

    it("deletes the exercise", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/sessions/${sessionId}/exercises/${exerciseId}`,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 204);
    });

    it("deletes the session", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/sessions/${sessionId}`,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 204);
    });

    it("returns 404 for the deleted session", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/sessions/${sessionId}`,
        headers: auth(testUser.token),
      });
      assert.equal(res.statusCode, 404);
    });
  });

  describe("isolation", () => {
    it("does not expose another user's sessions", async () => {
      const other = await createTestUser(app);
      try {
        // Create a session as the other user
        const createRes = await app.inject({
          method: "POST",
          url: "/api/v1/sessions",
          payload: SESSION_BODY,
          headers: auth(other.token),
        });
        const otherId = createRes.json<{ id: string }>().id;

        // Try to access it as testUser
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/sessions/${otherId}`,
          headers: auth(testUser.token),
        });
        assert.equal(res.statusCode, 404);
      } finally {
        await deleteTestUser(other.userId);
      }
    });
  });
});

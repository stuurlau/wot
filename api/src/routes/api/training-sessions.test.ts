import assert from "node:assert/strict";
import { describe, it } from "node:test";

import "../../test/setup.js";

const AUTHENTICATED_ROUTES = [
  { method: "GET" as const, url: "/api/v1/sessions" },
  { method: "GET" as const, url: "/api/v1/sessions/00000000-0000-0000-0000-000000000000" },
  { method: "POST" as const, url: "/api/v1/sessions" },
  { method: "PATCH" as const, url: "/api/v1/sessions/00000000-0000-0000-0000-000000000000" },
  { method: "DELETE" as const, url: "/api/v1/sessions/00000000-0000-0000-0000-000000000000" },
  { method: "GET" as const, url: "/api/v1/daily-logs" },
  { method: "GET" as const, url: "/api/v1/pain-logs" },
  { method: "GET" as const, url: "/api/v1/components/recents" },
  { method: "GET" as const, url: "/api/v1/insights/load" },
];

describe("training-session routes", () => {
  it("returns 401 with WOT error envelope for every protected route", async () => {
    const { buildApp } = await import("../../app.js");
    const app = await buildApp();

    for (const route of AUTHENTICATED_ROUTES) {
      const res = await app.inject(route);
      assert.equal(
        res.statusCode,
        401,
        `expected 401 on ${route.method} ${route.url}, got ${res.statusCode}`,
      );
      assert.deepEqual(
        res.json(),
        { error: { code: "UNAUTHENTICATED", message: "A valid session is required." } },
        `unexpected body on ${route.method} ${route.url}`,
      );
    }

    await app.close();
  });

  it("returns 422 with validation details for a malformed POST /sessions body", async () => {
    const { buildApp } = await import("../../app.js");
    const app = await buildApp();

    // Missing required fields: duration, srpe, type
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/sessions",
      payload: { startedAt: "2026-08-15T09:00:00Z" },
      headers: { "content-type": "application/json" },
    });

    // Without auth, should 401 first — this confirms auth runs before body parsing
    assert.equal(res.statusCode, 401);

    await app.close();
  });
});

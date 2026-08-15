import assert from "node:assert/strict";
import { describe, it } from "node:test";

import "./test/setup.js";

describe("app", () => {
  it("GET /health returns ok", async () => {
    const { buildApp } = await import("./app.js");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { ok: true });
    await app.close();
  });

  it("unknown route returns 404", async () => {
    const { buildApp } = await import("./app.js");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/nope" });
    assert.equal(res.statusCode, 404);
    await app.close();
  });
});

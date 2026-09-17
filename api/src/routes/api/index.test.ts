import assert from "node:assert/strict";
import { describe, it } from "node:test";

import "../../test/setup.js";

describe("WOT API routing", () => {
  it("protects WOT routes and uses WOT error envelopes", async () => {
    const { buildApp } = await import("../../app.js");
    const app = await buildApp();

    const unauthenticated = await app.inject({
      method: "GET",
      url: "/api/v1/sessions",
    });
    assert.equal(unauthenticated.statusCode, 401);
    assert.deepEqual(unauthenticated.json(), {
      error: {
        code: "UNAUTHENTICATED",
        message: "A valid session is required.",
      },
    });

    const unknown = await app.inject({ method: "GET", url: "/api/v1/not-found" });
    assert.equal(unknown.statusCode, 404);
    assert.deepEqual(unknown.json(), {
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
    await app.close();
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError } from "../../lib/api-error.js";
import { parseRequest } from "../../lib/api-validation.js";
import {
  createTrainingSessionBodySchema,
  dailyLogListQuerySchema,
} from "./schemas.js";

describe("API request validation", () => {
  it("rejects unknown body fields with a 422 validation error", () => {
    assert.throws(
      () =>
        parseRequest(createTrainingSessionBodySchema, {
          startedAt: "2026-08-15T06:30:00Z",
          duration: 3600,
          srpe: 7.5,
          type: "strength",
          load: 27_000,
        }),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 422);
        assert.equal(error.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });

  it("reports malformed or incompatible queries as 400", () => {
    assert.throws(
      () =>
        parseRequest(
          dailyLogListQuerySchema,
          { from: "2026-08-16", to: "2026-08-15" },
          true,
        ),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, "INVALID_QUERY");
        return true;
      },
    );
  });
});

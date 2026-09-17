import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { decodeCursor, encodeCursor } from "./cursor.js";
import { ApiError } from "./api-error.js";

describe("cursor", () => {
  it("round-trips a valid cursor", () => {
    const encoded = encodeCursor("sessions", new Date("2026-08-15T10:00:00.000Z"), "abc-123");
    const decoded = decodeCursor(encoded, "sessions");
    assert.equal(decoded.kind, "sessions");
    assert.equal(decoded.value, "2026-08-15T10:00:00.000Z");
    assert.equal(decoded.id, "abc-123");
  });

  it("throws 400 for a tampered cursor", () => {
    assert.throws(
      () => decodeCursor("not-base64url!@#", "sessions"),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
  });

  it("throws 400 when kind does not match", () => {
    const encoded = encodeCursor("sessions", "2026-08-15", "id-1");
    assert.throws(
      () => decodeCursor(encoded, "daily-logs"),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
  });
});

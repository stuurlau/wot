import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseEnv } from "./env.js";

const VALID_ENV = {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  API_URL: "http://localhost:3000",
  CORS_ORIGIN: "http://localhost:8081",
  BETTER_AUTH_SECRET: "0".repeat(64),
} as const;

describe("env", () => {
  it("parses valid env and applies defaults", () => {
    const env = parseEnv({ ...VALID_ENV });
    assert.equal(env.API_HOST, "0.0.0.0");
    assert.equal(env.API_PORT, 3000);
    assert.equal(env.DATABASE_URL, VALID_ENV.DATABASE_URL);
  });

  it("rejects when a required var is missing", () => {
    for (const key of Object.keys(VALID_ENV) as (keyof typeof VALID_ENV)[]) {
      const vars = { ...VALID_ENV };
      delete vars[key];
      assert.throws(() => parseEnv(vars));
    }
  });

  it("rejects a BETTER_AUTH_SECRET shorter than 32 chars", () => {
    assert.throws(() =>
      parseEnv({ ...VALID_ENV, BETTER_AUTH_SECRET: "too-short" }),
    );
  });
});

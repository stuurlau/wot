import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { serializeTrainingSession, serializeTrainingComponent } from "./serialization.js";

const BASE_DATE = new Date("2026-08-15T09:00:00.000Z");
const BASE_ISO = "2026-08-15T09:00:00.000Z";

const trainingSessionRow = {
  id: "ts-1",
  userId: "u-1",
  startedAt: BASE_DATE,
  duration: 3600,
  srpe: "7.5",
  type: "strength",
  title: "Push day",
  notes: null,
  createdAt: BASE_DATE,
};

describe("serializeTrainingSession", () => {
  it("includes computed load and serializes dates as ISO strings", () => {
    const result = serializeTrainingSession(trainingSessionRow);
    assert.equal(result.id, "ts-1");
    assert.equal(result.startedAt, BASE_ISO);
    assert.equal(result.createdAt, BASE_ISO);
    assert.equal(result.srpe, 7.5);
    assert.equal(result.load, 3600 * 7.5);
  });
});

const trainingComponentRow = {
  id: "c-1",
  trainingSessionId: "ts-1",
  name: "Bench Press",
  bodyRegions: ["push", "chest"],
  weight: "80.00",
  reps: 8,
  rir: "2.0",
  distance: null,
  duration: null,
  pace: null,
  rpe: "7.0",
  sortOrder: 1,
  notes: null,
  createdAt: BASE_DATE,
};

describe("serializeTrainingComponent", () => {
  it("converts numeric strings to numbers and exposes sessionId from trainingSessionId", () => {
    const result = serializeTrainingComponent(trainingComponentRow);
    assert.equal(result.sessionId, "ts-1");
    assert.equal(result.weight, 80);
    assert.equal(result.rir, 2);
    assert.equal(result.rpe, 7);
    assert.equal(result.distance, null);
    assert.equal(result.name, "Bench Press");
    assert.deepEqual(result.bodyRegions, ["push", "chest"]);
  });
});

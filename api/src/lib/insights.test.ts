import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dailyLoads,
  loadMetrics,
  localDate,
  localMidnight,
} from "./insights.js";

describe("insight date bucketing", () => {
  it("uses the supplied timezone for session day buckets across DST", () => {
    const daily = dailyLoads(
      [{ startedAt: new Date("2026-03-29T22:30:00.000Z"), duration: 60, srpe: "5" }],
      "2026-03-29",
      "2026-03-31",
      "Europe/Amsterdam",
    );

    assert.deepEqual(daily, [
      { date: "2026-03-29", load: 0, sessionCount: 0 },
      { date: "2026-03-30", load: 300, sessionCount: 1 },
    ]);
    assert.equal(
      localMidnight("2026-03-29", "Europe/Amsterdam").toISOString(),
      "2026-03-28T23:00:00.000Z",
    );
    assert.equal(
      localDate(new Date("2026-03-29T22:30:00.000Z"), "Europe/Amsterdam"),
      "2026-03-30",
    );
  });
});

describe("load metrics", () => {
  it("calculates the latest seven-day monotony and strain", () => {
    const metrics = loadMetrics(
      [10, 20, 30, 40, 50, 60, 70].map((load, index) => ({
        date: `2026-01-0${index + 1}`,
        load,
        sessionCount: 1,
      })),
    );

    assert.deepEqual(metrics, {
      weeklyLoad: 280,
      monotony: 2,
      strain: 560,
      acwr: null,
    });
  });

  it("returns null metrics for insufficient history or a zero denominator", () => {
    assert.deepEqual(
      loadMetrics([{ date: "2026-01-01", load: 100, sessionCount: 1 }]),
      { weeklyLoad: 100, monotony: null, strain: null, acwr: null },
    );
    assert.deepEqual(
      loadMetrics(
        Array.from({ length: 28 }, (_, index) => ({
          date: `2026-02-${String(index + 1).padStart(2, "0")}`,
          load: 0,
          sessionCount: 0,
        })),
      ),
      { weeklyLoad: 0, monotony: null, strain: null, acwr: null },
    );
  });

  it("uses a 28-day rolling average for ACWR", () => {
    const metrics = loadMetrics(
      Array.from({ length: 28 }, (_, index) => ({
        date: `2026-03-${String(index + 1).padStart(2, "0")}`,
        load: 10,
        sessionCount: 1,
      })),
    );

    assert.equal(metrics.acwr, 1);
  });
});

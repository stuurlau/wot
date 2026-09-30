import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NAME_SIMILARITY_THRESHOLD, nameSimilarity } from "./similarity.js";

describe("nameSimilarity", () => {
  it("is 1 for identical names and case/spacing variants", () => {
    assert.equal(nameSimilarity("Bench Press", "Bench Press"), 1);
    assert.equal(nameSimilarity("Bench Press", "bench  press "), 1);
  });

  it("scores typos and missing spaces above the threshold", () => {
    assert.ok(nameSimilarity("Benchpress", "Bench Press") >= NAME_SIMILARITY_THRESHOLD);
    assert.ok(nameSimilarity("Benhc Press", "Bench Press") >= NAME_SIMILARITY_THRESHOLD);
  });

  it("scores name extensions above the threshold", () => {
    assert.ok(nameSimilarity("Squat", "Back Squat") >= NAME_SIMILARITY_THRESHOLD);
  });

  it("scores unrelated names below the threshold", () => {
    assert.ok(nameSimilarity("Bench Press", "Deadlift") < NAME_SIMILARITY_THRESHOLD);
    assert.ok(nameSimilarity("Squat", "Plank") < NAME_SIMILARITY_THRESHOLD);
  });

  it("handles empty and very short input", () => {
    assert.equal(nameSimilarity("", "Bench Press"), 0);
    // "ab" -> {" ab","ab "}, "abc" -> {" ab","abc","bc "}: 1 shared trigram.
    assert.equal(nameSimilarity("ab", "abc"), (2 * 1) / (2 + 3));
  });
});

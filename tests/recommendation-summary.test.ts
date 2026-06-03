import assert from "node:assert/strict";
import test from "node:test";

import { formatRecommendationSummary } from "../src/recommendation-summary";

test("formats recommendation detail text without a match score", () => {
  const summary = formatRecommendationSummary({
    weatherTag: "clear",
    temperatureTag: "cool",
    mood: "sad",
  });

  assert.equal(summary, "Weather clear. Temperature cool. Mood sad.");
  assert.ok(!summary.toLowerCase().includes("score"));
});

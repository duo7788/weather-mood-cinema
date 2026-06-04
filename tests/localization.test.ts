import assert from "node:assert/strict";
import test from "node:test";

import {
  formatChineseRecommendationSummary,
  formatMovieRating,
  getMovieChineseCopy,
  getMoodDisplay,
  getNavDisplay,
} from "../src/localization";

test("provides bilingual navigation labels", () => {
  assert.deepEqual(getNavDisplay("archive"), {
    english: "Archive",
    chinese: "档案",
  });
  assert.deepEqual(getNavDisplay("collections"), {
    english: "Collections",
    chinese: "收藏",
  });
});

test("provides bilingual mood labels", () => {
  assert.deepEqual(getMoodDisplay("relaxed"), {
    english: "Relaxed",
    chinese: "放松",
  });
  assert.deepEqual(getMoodDisplay("nostalgic"), {
    english: "Nostalgic",
    chinese: "怀旧",
  });
  assert.deepEqual(getMoodDisplay("tense"), {
    english: "Tense",
    chinese: "紧张",
  });
});

test("provides Chinese movie title and overview copy", () => {
  assert.deepEqual(getMovieChineseCopy(872), {
    title: "雨中曲",
    overview: "一部雨天也会发光的歌舞片，轻快、明亮，像把坏天气变成一场即兴表演。",
  });
});

test("formats TMDB ratings without exposing internal scores", () => {
  assert.equal(formatMovieRating(8.64), "TMDB 8.6");
  assert.equal(formatMovieRating(null), "NR");
});

test("formats a Chinese recommendation summary", () => {
  assert.equal(
    formatChineseRecommendationSummary({
      weatherTag: "clear",
      temperatureTag: "cool",
      mood: "sad",
    }),
    "天气晴朗。体感偏凉。心情悲伤。",
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  COLLECTION_BACK_OVERVIEW_CLASS,
  COLLECTION_BACK_PANEL_CLASS,
  FLIP_HINT_TEXT,
  getCollectionCardBackCopy,
} from "../src/components/CollectionMovieCard";

test("exposes a collection card flip hint", () => {
  assert.equal(FLIP_HINT_TEXT, "Click poster to flip for details");
});

test("builds bilingual collection card back copy", () => {
  assert.deepEqual(
    getCollectionCardBackCopy({
      id: 872,
      title: "Singin' in the Rain",
      overview: "A joyful musical about rain and performance.",
      weatherTag: "clear",
      temperatureTag: "hot",
      mood: "excited",
      savedAt: 1,
    }),
    {
      english: "A joyful musical about rain and performance.",
      chinese: "一部雨天也会发光的歌舞片，轻快、明亮，像把坏天气变成一场即兴表演。",
      tags: "晴朗 / 炎热 / 兴奋",
    },
  );
});

test("hides fallback placeholder copy on collection card backs", () => {
  assert.deepEqual(
    getCollectionCardBackCopy({
      id: 194,
      title: "Amelie",
      overview: "A curated TMDB title selected for this weather mood.",
      weatherTag: "clear",
      temperatureTag: "warm",
      mood: "relaxed",
      savedAt: 1,
    }),
    {
      english: "",
      chinese: "一个害羞女孩用细小善意改变周围人的生活，也慢慢走向自己的爱情。",
      tags: "晴朗 / 温暖 / 放松",
    },
  );
});

test("keeps collection card back content compact and scrollable", () => {
  assert.match(COLLECTION_BACK_PANEL_CLASS, /overflow-y-auto/);
  assert.match(COLLECTION_BACK_OVERVIEW_CLASS, /text-\[11px\]/);
});

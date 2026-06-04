import assert from "node:assert/strict";
import test from "node:test";

import {
  COLLECTION_GRID_CLASS,
  RECOMMENDATION_DETAIL_GRID_CLASS,
  RECOMMENDATION_POSTER_COLUMN_CLASS,
} from "../src/layout";

test("collection grid adapts card width while capping rows at four cards on wide screens", () => {
  assert.match(COLLECTION_GRID_CLASS, /collection-grid/);
  assert.match(COLLECTION_GRID_CLASS, /max-w-\[86rem\]/);
});

test("recommendation detail aligns poster with the title block instead of centering it", () => {
  assert.match(RECOMMENDATION_DETAIL_GRID_CLASS, /items-start/);
  assert.doesNotMatch(RECOMMENDATION_DETAIL_GRID_CLASS, /items-center/);
  assert.match(RECOMMENDATION_POSTER_COLUMN_CLASS, /md:pt-8/);
});

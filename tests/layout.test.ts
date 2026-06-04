import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("collection grid reserves four desktop card positions even with fewer saved movies", () => {
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  const collectionGridCss = css.slice(css.indexOf(".collection-grid"));

  assert.match(collectionGridCss, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(collectionGridCss, /auto-fit|auto-fill/);
});

test("recommendation detail aligns poster with the title block instead of centering it", () => {
  assert.match(RECOMMENDATION_DETAIL_GRID_CLASS, /items-start/);
  assert.doesNotMatch(RECOMMENDATION_DETAIL_GRID_CLASS, /items-center/);
  assert.match(RECOMMENDATION_POSTER_COLUMN_CLASS, /md:pt-8/);
});

import assert from "node:assert/strict";
import test from "node:test";

import { FLIP_HINT_TEXT } from "../src/components/CollectionMovieCard";

test("exposes a collection card flip hint", () => {
  assert.equal(FLIP_HINT_TEXT, "Click poster to flip for details");
});

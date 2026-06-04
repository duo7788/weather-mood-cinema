import assert from "node:assert/strict";
import test from "node:test";

import {
  POSTER_IMAGE_ORIGIN,
  RECOMMENDATION_POSTER_SIZE,
  preloadPosterImage,
} from "../src/poster-loading";

test("preloads recommendation posters with high network priority", () => {
  const image: Record<string, string> = {};

  const url = preloadPosterImage("/poster.jpg", () => image as unknown as HTMLImageElement);

  assert.equal(POSTER_IMAGE_ORIGIN, "https://image.tmdb.org");
  assert.equal(RECOMMENDATION_POSTER_SIZE, "w500");
  assert.equal(url, "https://image.tmdb.org/t/p/w500/poster.jpg");
  assert.equal(image.decoding, "async");
  assert.equal(image.fetchPriority, "high");
  assert.equal(image.src, "https://image.tmdb.org/t/p/w500/poster.jpg");
});

test("skips poster preloading when no poster path exists", () => {
  let created = false;

  const url = preloadPosterImage(null, () => {
    created = true;
    return {} as HTMLImageElement;
  });

  assert.equal(url, "");
  assert.equal(created, false);
});

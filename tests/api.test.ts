import assert from "node:assert/strict";
import test from "node:test";

import { buildMovieDetailUrl, buildWeatherByCityUrl, buildWeatherByCoordsUrl } from "../src/api";

test("builds weather lookup URLs", () => {
  assert.equal(buildWeatherByCityUrl("New York"), "/.netlify/functions/weather-mood?city=New%20York");
  assert.equal(
    buildWeatherByCoordsUrl(31.23, 121.47),
    "/.netlify/functions/weather-mood?lat=31.23&lng=121.47",
  );
});

test("builds TMDB detail URL", () => {
  assert.equal(buildMovieDetailUrl(843), "/.netlify/functions/movie-search?id=843");
});

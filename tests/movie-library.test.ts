import assert from "node:assert/strict";
import test from "node:test";

import {
  ATMOSPHERE_TAGS,
  MOOD_TAGS,
  MOVIE_LIBRARY,
  TEMPERATURE_TAGS,
  WEATHER_TAGS,
} from "../src/movie-library";

const assertKnownTags = (
  movie: { title: string } & Record<string, string[]>,
  key: "weatherTags" | "temperatureTags" | "moodTags" | "atmosphereTags",
  knownTags: readonly string[],
) => {
  assert.ok(Array.isArray(movie[key]), `${movie.title} ${key} should be an array`);
  assert.ok(movie[key].length > 0, `${movie.title} ${key} should not be empty`);

  for (const tag of movie[key]) {
    assert.ok(knownTags.includes(tag), `${movie.title} has unknown ${key}: ${tag}`);
  }
};

test("defines the controlled tag lists", () => {
  assert.deepEqual(WEATHER_TAGS, ["clear", "cloudy", "rainy", "foggy", "snowy", "stormy"]);
  assert.deepEqual(TEMPERATURE_TAGS, ["cold", "cool", "mild", "warm", "hot"]);
  assert.deepEqual(MOOD_TAGS, [
    "relaxed",
    "lonely",
    "healing",
    "excited",
    "nostalgic",
    "sad",
    "gloomy",
    "romantic",
    "tense",
  ]);
  assert.deepEqual(ATMOSPHERE_TAGS, [
    "urban",
    "rural",
    "interior",
    "road",
    "coastal",
    "wilderness",
    "noir",
    "mystery",
    "dreamlike",
    "surreal",
    "period",
    "intimate",
    "grand",
    "gritty",
    "cozy",
  ]);
});

test("contains a curated library with valid tag data", () => {
  assert.ok(MOVIE_LIBRARY.length >= 50, "expected at least 50 curated movies");
  const ids = new Set<number>();

  for (const movie of MOVIE_LIBRARY) {
    assert.equal(typeof movie.tmdbId, "number", `${movie.title} should have numeric tmdbId`);
    assert.equal(typeof movie.title, "string", "movie should have title");
    assert.ok(movie.title.length > 0, "movie title should not be empty");
    assert.ok(!ids.has(movie.tmdbId), `duplicate tmdbId: ${movie.tmdbId}`);
    ids.add(movie.tmdbId);

    assertKnownTags(movie, "weatherTags", WEATHER_TAGS);
    assertKnownTags(movie, "temperatureTags", TEMPERATURE_TAGS);
    assertKnownTags(movie, "moodTags", MOOD_TAGS);
    assertKnownTags(movie, "atmosphereTags", ATMOSPHERE_TAGS);
  }
});

test("covers every weather and mood tag with multiple movies", () => {
  for (const weatherTag of WEATHER_TAGS) {
    const count = MOVIE_LIBRARY.filter((movie) => movie.weatherTags.includes(weatherTag)).length;
    assert.ok(count >= 4, `expected at least 4 movies for weather tag ${weatherTag}`);
  }

  for (const moodTag of MOOD_TAGS) {
    const count = MOVIE_LIBRARY.filter((movie) => movie.moodTags.includes(moodTag)).length;
    assert.ok(count >= 4, `expected at least 4 movies for mood tag ${moodTag}`);
  }
});

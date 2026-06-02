import assert from "node:assert/strict";
import test from "node:test";

import {
  createScoredCandidates,
  deriveAtmosphereTags,
  getAdjacentTemperatureTags,
  pickTopCandidate,
  scoreMovie,
} from "../src/recommendation";
import type { CuratedMovie } from "../src/movie-library";

test("finds adjacent temperature tags", () => {
  assert.deepEqual(getAdjacentTemperatureTags("cold"), ["cool"]);
  assert.deepEqual(getAdjacentTemperatureTags("mild"), ["cool", "warm"]);
  assert.deepEqual(getAdjacentTemperatureTags("hot"), ["warm"]);
});

test("derives atmosphere preferences from weather and temperature matches", () => {
  const library: CuratedMovie[] = [
    {
      tmdbId: 1,
      title: "Rain One",
      weatherTags: ["rainy"],
      temperatureTags: ["cool"],
      moodTags: ["sad"],
      atmosphereTags: ["urban", "interior", "noir"],
    },
    {
      tmdbId: 2,
      title: "Rain Two",
      weatherTags: ["rainy"],
      temperatureTags: ["mild"],
      moodTags: ["romantic"],
      atmosphereTags: ["urban", "intimate"],
    },
    {
      tmdbId: 3,
      title: "Clear Cool",
      weatherTags: ["clear"],
      temperatureTags: ["cool"],
      moodTags: ["relaxed"],
      atmosphereTags: ["road", "urban"],
    },
  ];

  assert.deepEqual(deriveAtmosphereTags(library, "rainy", "cool"), [
    "urban",
    "interior",
    "noir",
  ]);
});

test("scores movies with weather, mood, temperature, adjacent temperature, and atmosphere", () => {
  const movie: CuratedMovie = {
    tmdbId: 843,
    title: "Rain Town",
    weatherTags: ["rainy"],
    temperatureTags: ["cool"],
    moodTags: ["sad"],
    atmosphereTags: ["urban", "noir"],
  };

  assert.equal(
    scoreMovie(movie, {
      weatherTag: "rainy",
      temperatureTag: "cold",
      moodTag: "sad",
      atmosphereTags: ["urban", "interior", "noir"],
    }),
    11,
  );
});

test("creates scored candidates with derived atmosphere tags", () => {
  const library: CuratedMovie[] = [
    {
      tmdbId: 1,
      title: "Match",
      weatherTags: ["rainy"],
      temperatureTags: ["cool"],
      moodTags: ["sad"],
      atmosphereTags: ["urban", "noir"],
    },
    {
      tmdbId: 2,
      title: "Miss",
      weatherTags: ["clear"],
      temperatureTags: ["hot"],
      moodTags: ["relaxed"],
      atmosphereTags: ["cozy"],
    },
  ];

  const candidates = createScoredCandidates(library, {
    weatherTag: "rainy",
    temperatureTag: "cool",
    moodTag: "sad",
  });

  assert.deepEqual(candidates.map((candidate) => candidate.movie.title), ["Match", "Miss"]);
  assert.ok(candidates[0].score > candidates[1].score);
});

test("picks from the highest scoring candidate pool", () => {
  const picked = pickTopCandidate(
    [
      { movie: { tmdbId: 1, title: "A" } as CuratedMovie, score: 9 },
      { movie: { tmdbId: 2, title: "B" } as CuratedMovie, score: 8 },
      { movie: { tmdbId: 3, title: "C" } as CuratedMovie, score: 1 },
    ],
    () => 0.99,
    2,
  );

  assert.equal(picked.movie.title, "B");
});

import assert from "node:assert/strict";
import test from "node:test";

import { FAVORITES_STORAGE_KEY, getFavorites, removeFavorite, saveFavorite } from "../src/storage";
import type { SavedMovie } from "../src/types";

const createStorage = () => ({
  value: null as string | null,
  getItem(key: string) {
    assert.equal(key, FAVORITES_STORAGE_KEY);
    return this.value;
  },
  setItem(key: string, value: string) {
    assert.equal(key, FAVORITES_STORAGE_KEY);
    this.value = value;
  },
});

const favorite: SavedMovie = {
  id: 843,
  title: "In the Mood for Love",
  overview: "A quiet story.",
  posterPath: "/poster.jpg",
  releaseDate: "2000-09-29",
  rating: 8.1,
  city: "Beijing",
  weather: "Clear sky",
  weatherTag: "clear",
  temperatureTag: "mild",
  mood: "nostalgic",
  score: 10,
  savedAt: 123,
};

test("reads an empty favorites list from empty or invalid storage", () => {
  const storage = createStorage();
  assert.deepEqual(getFavorites(storage), []);
  storage.value = "{bad json";
  assert.deepEqual(getFavorites(storage), []);
});

test("saves favorites without duplicates and removes them by TMDB id", () => {
  const storage = createStorage();

  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(removeFavorite(storage, 843), []);
});

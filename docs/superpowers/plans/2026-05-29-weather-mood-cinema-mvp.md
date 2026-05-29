# Weather Mood Cinema MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real Weather Mood Cinema product loop using city weather, user mood, a curated 50-movie tag library, weighted scoring, TMDB detail lookup, and local favorites.

**Architecture:** Keep the app as static HTML/CSS/vanilla JS plus Netlify Functions. `weather-mood.mjs` normalizes Open-Meteo weather into weather and temperature tags. `movie-library.js` owns the curated tagged movie data. `script.js` scores the local library, picks a top candidate, calls a TMDB detail endpoint by `tmdbId`, renders the result, and stores favorites in `localStorage`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node test runner, Netlify Functions, Open-Meteo Geocoding API, Open-Meteo Forecast API, TMDB movie detail API.

---

## File Structure

- `movie-library.js`: new local curated movie library, controlled tag lists, and about 50 movie entries.
- `tests/movie-library.test.cjs`: validates library shape, tag values, duplicate `tmdbId` prevention, and minimum coverage.
- `netlify/functions/weather-mood.mjs`: new Netlify Function that returns city weather plus `weatherTag` and `temperatureTag`.
- `tests/weather-mood.test.mjs`: tests weather success, missing city, unknown city, upstream failure, weather mapping, and temperature mapping.
- `netlify/functions/movie-search.mjs`: update existing TMDB proxy so it can return movie details by `id` while preserving the current search-by-query behavior during the transition.
- `tests/movie-search.test.mjs`: extend existing tests for `id` detail lookup.
- `script.js`: add scoring helpers, atmosphere derivation, candidate selection, detail lookup, rendering, and favorites behavior.
- `tests/script.test.cjs`: extend tests for scoring, candidate ranking, weather URL building, favorite handling, and rendering helpers.
- `index.html`: update markup for city weather, mood selection, result view, and favorites.
- `styles.css`: update layout and visual states for the MVP flow.

## Task 1: Curated Movie Library

**Files:**
- Create: `movie-library.js`
- Create: `tests/movie-library.test.cjs`

- [ ] **Step 1: Write failing library tests**

Create `tests/movie-library.test.cjs`:

```js
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ATMOSPHERE_TAGS,
  MOVIE_LIBRARY,
  MOOD_TAGS,
  TEMPERATURE_TAGS,
  WEATHER_TAGS,
} = require("../movie-library.js");

const assertKnownTags = (movie, key, knownTags) => {
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

  const ids = new Set();

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
```

- [ ] **Step 2: Run library tests to verify they fail**

Run:

```bash
node --test tests/movie-library.test.cjs
```

Expected: FAIL because `movie-library.js` does not exist.

- [ ] **Step 3: Add curated library**

Create `movie-library.js` with the controlled tag lists and at least 50 movie entries. Use CommonJS exports so the existing CommonJS tests can import it:

```js
const WEATHER_TAGS = ["clear", "cloudy", "rainy", "foggy", "snowy", "stormy"];
const TEMPERATURE_TAGS = ["cold", "cool", "mild", "warm", "hot"];
const MOOD_TAGS = [
  "relaxed",
  "lonely",
  "healing",
  "excited",
  "nostalgic",
  "sad",
  "gloomy",
  "romantic",
  "tense",
];
const ATMOSPHERE_TAGS = [
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
];

const MOVIE_LIBRARY = [
  { tmdbId: 843, title: "In the Mood for Love", weatherTags: ["rainy", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["lonely", "romantic", "nostalgic"], atmosphereTags: ["urban", "interior", "period", "intimate"] },
  { tmdbId: 872, title: "Singin' in the Rain", weatherTags: ["rainy", "clear"], temperatureTags: ["mild", "warm"], moodTags: ["relaxed", "excited", "romantic"], atmosphereTags: ["urban", "period", "grand", "cozy"] },
  { tmdbId: 38, title: "Eternal Sunshine of the Spotless Mind", weatherTags: ["snowy", "cloudy"], temperatureTags: ["cold", "cool"], moodTags: ["sad", "romantic", "lonely"], atmosphereTags: ["coastal", "dreamlike", "surreal", "intimate"] },
  { tmdbId: 496243, title: "Parasite", weatherTags: ["rainy", "stormy"], temperatureTags: ["mild", "warm"], moodTags: ["tense", "gloomy"], atmosphereTags: ["urban", "interior", "gritty", "noir"] },
  { tmdbId: 129, title: "Spirited Away", weatherTags: ["foggy", "rainy"], temperatureTags: ["mild", "warm"], moodTags: ["healing", "lonely", "excited"], atmosphereTags: ["dreamlike", "surreal", "cozy", "grand"] },
  { tmdbId: 4935, title: "Howl's Moving Castle", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["healing", "romantic", "excited"], atmosphereTags: ["dreamlike", "cozy", "grand", "surreal"] },
  { tmdbId: 150540, title: "Inside Out", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["healing", "sad", "relaxed"], atmosphereTags: ["interior", "dreamlike", "cozy", "surreal"] },
  { tmdbId: 508442, title: "Soul", weatherTags: ["clear", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["healing", "nostalgic", "lonely"], atmosphereTags: ["urban", "dreamlike", "cozy", "surreal"] },
  { tmdbId: 354912, title: "Coco", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["healing", "nostalgic", "sad"], atmosphereTags: ["rural", "period", "grand", "cozy"] },
  { tmdbId: 194, title: "Amelie", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["relaxed", "romantic", "healing"], atmosphereTags: ["urban", "cozy", "dreamlike", "intimate"] },
  { tmdbId: 120467, title: "The Grand Budapest Hotel", weatherTags: ["snowy", "clear"], temperatureTags: ["cold", "cool"], moodTags: ["relaxed", "nostalgic", "excited"], atmosphereTags: ["period", "grand", "cozy", "surreal"] },
  { tmdbId: 13, title: "Forrest Gump", weatherTags: ["clear", "rainy"], temperatureTags: ["mild", "warm"], moodTags: ["healing", "nostalgic", "sad"], atmosphereTags: ["road", "rural", "period", "cozy"] },
  { tmdbId: 637, title: "Life Is Beautiful", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "cool"], moodTags: ["sad", "healing", "romantic"], atmosphereTags: ["period", "intimate", "cozy", "gritty"] },
  { tmdbId: 424, title: "Schindler's List", weatherTags: ["cloudy", "snowy"], temperatureTags: ["cold", "cool"], moodTags: ["sad", "gloomy", "tense"], atmosphereTags: ["period", "gritty", "interior", "grand"] },
  { tmdbId: 12477, title: "Grave of the Fireflies", weatherTags: ["cloudy", "rainy"], temperatureTags: ["hot", "warm"], moodTags: ["sad", "gloomy", "lonely"], atmosphereTags: ["rural", "period", "gritty", "intimate"] },
  { tmdbId: 376867, title: "Moonlight", weatherTags: ["clear", "rainy"], temperatureTags: ["warm", "hot"], moodTags: ["lonely", "sad", "healing"], atmosphereTags: ["coastal", "urban", "intimate", "gritty"] },
  { tmdbId: 264644, title: "Room", weatherTags: ["cloudy", "rainy"], temperatureTags: ["cool", "mild"], moodTags: ["tense", "sad", "healing"], atmosphereTags: ["interior", "intimate", "gritty", "cozy"] },
  { tmdbId: 807, title: "Se7en", weatherTags: ["rainy", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["gloomy", "tense"], atmosphereTags: ["urban", "noir", "mystery", "gritty"] },
  { tmdbId: 146233, title: "Prisoners", weatherTags: ["rainy", "snowy"], temperatureTags: ["cold", "cool"], moodTags: ["tense", "gloomy", "sad"], atmosphereTags: ["rural", "mystery", "gritty", "interior"] },
  { tmdbId: 210577, title: "Gone Girl", weatherTags: ["cloudy", "stormy"], temperatureTags: ["mild", "warm"], moodTags: ["tense", "gloomy"], atmosphereTags: ["urban", "interior", "mystery", "noir"] },
  { tmdbId: 745, title: "The Sixth Sense", weatherTags: ["foggy", "cloudy"], temperatureTags: ["cool", "cold"], moodTags: ["tense", "gloomy", "sad"], atmosphereTags: ["interior", "mystery", "noir", "intimate"] },
  { tmdbId: 629, title: "The Usual Suspects", weatherTags: ["foggy", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["tense", "gloomy"], atmosphereTags: ["noir", "mystery", "interior", "urban"] },
  { tmdbId: 567, title: "Rear Window", weatherTags: ["clear", "cloudy"], temperatureTags: ["warm", "hot"], moodTags: ["tense", "romantic"], atmosphereTags: ["urban", "interior", "mystery", "intimate"] },
  { tmdbId: 78, title: "Blade Runner", weatherTags: ["rainy", "foggy"], temperatureTags: ["cool", "mild"], moodTags: ["lonely", "gloomy", "tense"], atmosphereTags: ["urban", "noir", "dreamlike", "gritty"] },
  { tmdbId: 335984, title: "Blade Runner 2049", weatherTags: ["foggy", "snowy"], temperatureTags: ["cold", "cool"], moodTags: ["lonely", "gloomy", "tense"], atmosphereTags: ["urban", "wilderness", "dreamlike", "grand"] },
  { tmdbId: 1091, title: "The Thing", weatherTags: ["snowy", "stormy"], temperatureTags: ["cold"], moodTags: ["tense", "gloomy"], atmosphereTags: ["wilderness", "interior", "mystery", "gritty"] },
  { tmdbId: 694, title: "The Shining", weatherTags: ["snowy", "foggy"], temperatureTags: ["cold"], moodTags: ["tense", "gloomy", "lonely"], atmosphereTags: ["interior", "wilderness", "surreal", "gritty"] },
  { tmdbId: 348, title: "Alien", weatherTags: ["stormy", "foggy"], temperatureTags: ["cold", "cool"], moodTags: ["tense", "gloomy"], atmosphereTags: ["interior", "mystery", "gritty", "grand"] },
  { tmdbId: 603, title: "The Matrix", weatherTags: ["rainy", "stormy"], temperatureTags: ["cool", "mild"], moodTags: ["excited", "tense", "gloomy"], atmosphereTags: ["urban", "surreal", "noir", "grand"] },
  { tmdbId: 27205, title: "Inception", weatherTags: ["foggy", "stormy"], temperatureTags: ["cool", "mild"], moodTags: ["excited", "tense", "gloomy"], atmosphereTags: ["urban", "dreamlike", "surreal", "grand"] },
  { tmdbId: 157336, title: "Interstellar", weatherTags: ["clear", "stormy"], temperatureTags: ["cold", "hot"], moodTags: ["excited", "sad", "healing"], atmosphereTags: ["wilderness", "grand", "interior", "cozy"] },
  { tmdbId: 155, title: "The Dark Knight", weatherTags: ["stormy", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["excited", "tense", "gloomy"], atmosphereTags: ["urban", "noir", "grand", "gritty"] },
  { tmdbId: 24428, title: "The Avengers", weatherTags: ["clear", "stormy"], temperatureTags: ["warm", "mild"], moodTags: ["excited", "relaxed"], atmosphereTags: ["urban", "grand", "cozy", "road"] },
  { tmdbId: 299536, title: "Avengers: Infinity War", weatherTags: ["stormy", "clear"], temperatureTags: ["mild", "warm"], moodTags: ["excited", "tense", "sad"], atmosphereTags: ["grand", "wilderness", "urban", "gritty"] },
  { tmdbId: 19995, title: "Avatar", weatherTags: ["clear", "rainy"], temperatureTags: ["warm", "hot"], moodTags: ["excited", "romantic", "healing"], atmosphereTags: ["wilderness", "grand", "dreamlike", "surreal"] },
  { tmdbId: 85, title: "Raiders of the Lost Ark", weatherTags: ["clear", "stormy"], temperatureTags: ["warm", "hot"], moodTags: ["excited", "relaxed"], atmosphereTags: ["road", "wilderness", "grand", "gritty"] },
  { tmdbId: 105, title: "Back to the Future", weatherTags: ["clear", "stormy"], temperatureTags: ["mild", "warm"], moodTags: ["excited", "relaxed", "nostalgic"], atmosphereTags: ["urban", "road", "period", "cozy"] },
  { tmdbId: 862, title: "Toy Story", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["relaxed", "healing", "nostalgic"], atmosphereTags: ["interior", "cozy", "road", "intimate"] },
  { tmdbId: 585, title: "Monsters, Inc.", weatherTags: ["clear", "foggy"], temperatureTags: ["mild", "warm"], moodTags: ["relaxed", "healing", "excited"], atmosphereTags: ["interior", "cozy", "surreal", "urban"] },
  { tmdbId: 10681, title: "WALL·E", weatherTags: ["clear", "cloudy"], temperatureTags: ["hot", "warm"], moodTags: ["lonely", "healing", "romantic"], atmosphereTags: ["wilderness", "interior", "grand", "cozy"] },
  { tmdbId: 120, title: "The Lord of the Rings: The Fellowship of the Ring", weatherTags: ["clear", "foggy"], temperatureTags: ["cool", "mild"], moodTags: ["excited", "healing", "nostalgic"], atmosphereTags: ["wilderness", "grand", "cozy", "road"] },
  { tmdbId: 121, title: "The Lord of the Rings: The Two Towers", weatherTags: ["stormy", "cloudy"], temperatureTags: ["cool", "cold"], moodTags: ["excited", "tense", "gloomy"], atmosphereTags: ["wilderness", "grand", "gritty", "road"] },
  { tmdbId: 122, title: "The Lord of the Rings: The Return of the King", weatherTags: ["clear", "stormy"], temperatureTags: ["cool", "mild"], moodTags: ["excited", "healing", "sad"], atmosphereTags: ["wilderness", "grand", "cozy", "gritty"] },
  { tmdbId: 597, title: "Titanic", weatherTags: ["stormy", "snowy"], temperatureTags: ["cold", "cool"], moodTags: ["romantic", "sad", "tense"], atmosphereTags: ["coastal", "period", "grand", "intimate"] },
  { tmdbId: 11036, title: "The Notebook", weatherTags: ["rainy", "clear"], temperatureTags: ["warm", "mild"], moodTags: ["romantic", "sad", "nostalgic"], atmosphereTags: ["rural", "coastal", "period", "intimate"] },
  { tmdbId: 313369, title: "La La Land", weatherTags: ["clear", "rainy"], temperatureTags: ["warm", "mild"], moodTags: ["romantic", "sad", "nostalgic"], atmosphereTags: ["urban", "grand", "dreamlike", "intimate"] },
  { tmdbId: 858, title: "Sleepless in Seattle", weatherTags: ["rainy", "cloudy"], temperatureTags: ["cool", "mild"], moodTags: ["romantic", "lonely", "relaxed"], atmosphereTags: ["urban", "coastal", "cozy", "intimate"] },
  { tmdbId: 37165, title: "The Truman Show", weatherTags: ["clear", "cloudy"], temperatureTags: ["mild", "warm"], moodTags: ["lonely", "healing", "gloomy"], atmosphereTags: ["coastal", "surreal", "cozy", "urban"] },
  { tmdbId: 98, title: "Gladiator", weatherTags: ["clear", "stormy"], temperatureTags: ["hot", "warm"], moodTags: ["excited", "sad", "tense"], atmosphereTags: ["grand", "period", "gritty", "wilderness"] },
  { tmdbId: 28, title: "Apocalypse Now", weatherTags: ["stormy", "foggy"], temperatureTags: ["hot", "warm"], moodTags: ["gloomy", "tense"], atmosphereTags: ["wilderness", "surreal", "gritty", "grand"] },
  { tmdbId: 7345, title: "There Will Be Blood", weatherTags: ["clear", "cloudy"], temperatureTags: ["hot", "warm"], moodTags: ["gloomy", "tense", "lonely"], atmosphereTags: ["rural", "period", "gritty", "grand"] },
  { tmdbId: 641, title: "Requiem for a Dream", weatherTags: ["clear", "cloudy"], temperatureTags: ["warm", "hot"], moodTags: ["gloomy", "sad", "tense"], atmosphereTags: ["urban", "interior", "gritty", "surreal"] },
  { tmdbId: 419430, title: "Get Out", weatherTags: ["clear", "foggy"], temperatureTags: ["mild", "warm"], moodTags: ["tense", "gloomy"], atmosphereTags: ["rural", "mystery", "gritty", "surreal"] },
  { tmdbId: 1124, title: "The Prestige", weatherTags: ["foggy", "cloudy"], temperatureTags: ["cool", "cold"], moodTags: ["tense", "gloomy", "nostalgic"], atmosphereTags: ["period", "mystery", "interior", "noir"] },
];

if (typeof module !== "undefined") {
  module.exports = {
    ATMOSPHERE_TAGS,
    MOVIE_LIBRARY,
    MOOD_TAGS,
    TEMPERATURE_TAGS,
    WEATHER_TAGS,
  };
}
```

- [ ] **Step 4: Run library tests to verify they pass**

Run:

```bash
node --test tests/movie-library.test.cjs
```

Expected: PASS, all library tests pass.

- [ ] **Step 5: Commit**

```bash
git add movie-library.js tests/movie-library.test.cjs
git commit -m "Add curated movie library"
```

## Task 2: Weather Tag Function

**Files:**
- Create: `netlify/functions/weather-mood.mjs`
- Create: `tests/weather-mood.test.mjs`

- [ ] **Step 1: Write failing weather Function tests**

Create `tests/weather-mood.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import handler, {
  getTemperatureTag,
  getWeatherTag,
} from "../netlify/functions/weather-mood.mjs";

const readJson = async (response) => JSON.parse(await response.text());

test("maps weather codes into weather tags", () => {
  assert.deepEqual(getWeatherTag(0), {
    weather: "Clear sky",
    weatherTag: "clear",
  });
  assert.deepEqual(getWeatherTag(61), {
    weather: "Rain",
    weatherTag: "rainy",
  });
  assert.deepEqual(getWeatherTag(45), {
    weather: "Fog",
    weatherTag: "foggy",
  });
});

test("maps temperature into body-feel tags", () => {
  assert.equal(getTemperatureTag(0), "cold");
  assert.equal(getTemperatureTag(10), "cool");
  assert.equal(getTemperatureTag(21), "mild");
  assert.equal(getTemperatureTag(27), "warm");
  assert.equal(getTemperatureTag(34), "hot");
});

test("returns normalized city weather with tags", async () => {
  const originalFetch = global.fetch;
  const requestedUrls = [];

  global.fetch = async (url) => {
    const requestedUrl = new URL(url);
    requestedUrls.push(requestedUrl);

    if (requestedUrl.hostname === "geocoding-api.open-meteo.com") {
      return new Response(
        JSON.stringify({
          results: [
            {
              name: "Beijing",
              country: "China",
              latitude: 39.9042,
              longitude: 116.4074,
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 21.4,
          weather_code: 0,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  };

  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/weather-mood?city=Beijing"),
  );

  global.fetch = originalFetch;

  assert.equal(response.status, 200);
  assert.equal(requestedUrls[0].origin, "https://geocoding-api.open-meteo.com");
  assert.equal(requestedUrls[1].origin, "https://api.open-meteo.com");
  assert.deepEqual(await readJson(response), {
    city: "Beijing",
    country: "China",
    latitude: 39.9042,
    longitude: 116.4074,
    temperature: 21,
    weather: "Clear sky",
    weatherCode: 0,
    weatherTag: "clear",
    temperatureTag: "mild",
    description: "Clear sky in Beijing gives the day a bright, open texture.",
  });
});

test("returns 400 when city is missing", async () => {
  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/weather-mood"),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await readJson(response), {
    error: "City is required",
  });
});

test("returns 404 when city cannot be geocoded", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () =>
    new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/weather-mood?city=Atlantis"),
  );

  global.fetch = originalFetch;

  assert.equal(response.status, 404);
  assert.deepEqual(await readJson(response), {
    error: "City not found",
  });
});
```

- [ ] **Step 2: Run weather tests to verify they fail**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: FAIL because `weather-mood.mjs` does not exist.

- [ ] **Step 3: Implement weather Function**

Create `netlify/functions/weather-mood.mjs` with Open-Meteo geocoding, forecast lookup, `getWeatherTag`, and `getTemperatureTag`. The function should not return `movieQueryBase`.

- [ ] **Step 4: Run weather tests to verify they pass**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: PASS, all weather tests pass.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/weather-mood.mjs tests/weather-mood.test.mjs
git commit -m "Add weather tag function"
```

## Task 3: TMDB Detail Lookup

**Files:**
- Modify: `netlify/functions/movie-search.mjs`
- Modify: `tests/movie-search.test.mjs`

- [ ] **Step 1: Add failing detail lookup test**

Append to `tests/movie-search.test.mjs`:

```js
test("fetches TMDB movie details by id", async () => {
  const originalKey = process.env.TMDB_API_KEY;
  const originalFetch = global.fetch;

  process.env.TMDB_API_KEY = "test-key";
  let requestedUrl;

  global.fetch = async (url) => {
    requestedUrl = new URL(url);

    return new Response(
      JSON.stringify({
        id: 843,
        title: "In the Mood for Love",
        overview: "A quiet story.",
        poster_path: "/poster.jpg",
        release_date: "2000-09-29",
        vote_average: 8.1,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  };

  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/movie-search?id=843"),
  );

  process.env.TMDB_API_KEY = originalKey;
  global.fetch = originalFetch;

  assert.equal(response.status, 200);
  assert.equal(requestedUrl.origin, "https://api.themoviedb.org");
  assert.equal(requestedUrl.pathname, "/3/movie/843");
  assert.deepEqual(await readJson(response), {
    movie: {
      id: 843,
      title: "In the Mood for Love",
      overview: "A quiet story.",
      posterPath: "/poster.jpg",
      releaseDate: "2000-09-29",
      rating: 8.1,
    },
  });
});
```

- [ ] **Step 2: Run movie-search tests to verify they fail**

Run:

```bash
node --test tests/movie-search.test.mjs
```

Expected: FAIL because `id` still uses the search path or does not return `{ movie }`.

- [ ] **Step 3: Add id detail behavior**

Modify `netlify/functions/movie-search.mjs` so it checks `id` first:

```js
const movieId = requestUrl.searchParams.get("id")?.trim();

if (movieId) {
  const tmdbUrl = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
  tmdbUrl.searchParams.set("api_key", apiKey);
  tmdbUrl.searchParams.set("language", "en-US");

  const tmdbResponse = await fetch(tmdbUrl);
  const tmdbData = await tmdbResponse.json();

  if (!tmdbResponse.ok) {
    return jsonResponse(tmdbResponse.status, {
      error: tmdbData.status_message || "TMDB request failed",
    });
  }

  return jsonResponse(200, {
    movie: normalizeMovie(tmdbData),
  });
}
```

Keep the existing search-by-query behavior for compatibility.

- [ ] **Step 4: Run movie-search tests to verify they pass**

Run:

```bash
node --test tests/movie-search.test.mjs
```

Expected: PASS, all movie-search tests pass.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/movie-search.mjs tests/movie-search.test.mjs
git commit -m "Add TMDB movie detail lookup"
```

## Task 4: Scoring Helpers

**Files:**
- Modify: `script.js`
- Modify: `tests/script.test.cjs`

- [ ] **Step 1: Add failing scoring tests**

Append to `tests/script.test.cjs`:

```js
const {
  deriveAtmosphereTags,
  getAdjacentTemperatureTags,
  pickTopCandidate,
  scoreMovie,
} = require("../script.js");

test("finds adjacent temperature tags", () => {
  assert.deepEqual(getAdjacentTemperatureTags("cold"), ["cool"]);
  assert.deepEqual(getAdjacentTemperatureTags("mild"), ["cool", "warm"]);
  assert.deepEqual(getAdjacentTemperatureTags("hot"), ["warm"]);
});

test("derives atmosphere preferences from matching library movies", () => {
  const library = [
    {
      weatherTags: ["rainy"],
      temperatureTags: ["cool"],
      atmosphereTags: ["urban", "interior", "noir"],
    },
    {
      weatherTags: ["rainy"],
      temperatureTags: ["mild"],
      atmosphereTags: ["urban", "intimate"],
    },
    {
      weatherTags: ["clear"],
      temperatureTags: ["cool"],
      atmosphereTags: ["road", "urban"],
    },
  ];

  assert.deepEqual(deriveAtmosphereTags(library, "rainy", "cool"), ["urban", "interior", "noir"]);
});

test("scores movies with weather, mood, temperature, adjacent temperature, and atmosphere", () => {
  const movie = {
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

test("picks from the highest scoring candidate pool", () => {
  const candidates = [
    { movie: { title: "A" }, score: 9 },
    { movie: { title: "B" }, score: 8 },
    { movie: { title: "C" }, score: 1 },
  ];

  const picked = pickTopCandidate(candidates, () => 0.99, 2);
  assert.equal(picked.movie.title, "B");
});
```

- [ ] **Step 2: Run script tests to verify they fail**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: FAIL because scoring helpers are not exported yet.

- [ ] **Step 3: Implement scoring helpers**

Add helpers to `script.js`:

```js
const TEMPERATURE_ORDER = ["cold", "cool", "mild", "warm", "hot"];

const getAdjacentTemperatureTags = (temperatureTag) => {
  const index = TEMPERATURE_ORDER.indexOf(temperatureTag);
  return TEMPERATURE_ORDER.filter((_, itemIndex) => Math.abs(itemIndex - index) === 1);
};

const deriveAtmosphereTags = (library, weatherTag, temperatureTag, limit = 5) => {
  const counts = new Map();

  library
    .filter(
      (movie) =>
        movie.weatherTags.includes(weatherTag) || movie.temperatureTags.includes(temperatureTag),
    )
    .forEach((movie) => {
      movie.atmosphereTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
};

const scoreMovie = (movie, preferences) => {
  let score = 0;

  if (movie.weatherTags.includes(preferences.weatherTag)) {
    score += 4;
  }

  if (movie.moodTags.includes(preferences.moodTag)) {
    score += 4;
  }

  if (movie.temperatureTags.includes(preferences.temperatureTag)) {
    score += 2;
  } else if (
    getAdjacentTemperatureTags(preferences.temperatureTag).some((tag) =>
      movie.temperatureTags.includes(tag),
    )
  ) {
    score += 1;
  }

  for (const tag of preferences.atmosphereTags) {
    if (movie.atmosphereTags.includes(tag)) {
      score += 1;
    }
  }

  return score;
};

const pickTopCandidate = (candidates, random = Math.random, poolSize = 5) => {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const pool = sorted.filter((item) => item.score > 0).slice(0, poolSize);
  const candidatesToUse = pool.length > 0 ? pool : sorted.slice(0, poolSize);
  return candidatesToUse[Math.floor(random() * candidatesToUse.length)];
};
```

Export these helpers in `module.exports`.

- [ ] **Step 4: Run script tests to verify they pass**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: PASS, all script tests pass.

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.cjs
git commit -m "Add movie scoring helpers"
```

## Task 5: Frontend State And Markup

**Files:**
- Modify: `index.html`
- Modify: `script.js`
- Modify: `tests/script.test.cjs`

- [ ] **Step 1: Add frontend helper tests**

Extend `tests/script.test.cjs` with tests for:

- `buildWeatherMoodUrl("New York")` returns `/.netlify/functions/weather-mood?city=New%20York`.
- `buildMovieDetailUrl(843)` returns `/.netlify/functions/movie-search?id=843`.
- `createFavoritePayload(movie, weather, mood, score)` stores `weatherTag`, `temperatureTag`, `mood`, and `score`.
- favorites save, duplicate prevention, and removal.

- [ ] **Step 2: Run script tests to verify they fail**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: FAIL because these helpers do not exist yet.

- [ ] **Step 3: Update markup**

Update `index.html` with sections for:

- city weather form and weather card
- mood picker with the nine mood tags
- Generate button
- result section
- favorites panel
- TMDB and Open-Meteo credits

- [ ] **Step 4: Wire frontend behavior**

Update `script.js` so:

1. City form calls `weather-mood`.
2. Weather response is stored as app state.
3. Mood buttons set `selectedMood`.
4. Generate derives atmosphere tags from `MOVIE_LIBRARY`, scores all movies, picks one top candidate, calls TMDB detail by `tmdbId`, and renders the result.
5. Save Favorite writes to `localStorage`.
6. Favorites panel renders saved items and supports removal.

- [ ] **Step 5: Run script tests to verify they pass**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: PASS, all script tests pass.

- [ ] **Step 6: Commit**

```bash
git add index.html script.js tests/script.test.cjs
git commit -m "Wire curated recommendation flow"
```

## Task 6: Styling And Verification

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Update MVP styling**

Update `styles.css` for the weather card, mood grid, result section, favorites panel, disabled states, error messages, and responsive mobile layout.

- [ ] **Step 2: Run all automated tests**

Run:

```bash
node --test tests/*.test.*
```

Expected: PASS, all tests pass.

- [ ] **Step 3: Verify locally**

Start a local server:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173
```

Verify:

1. Desktop layout has no overlap.
2. 390px mobile layout has no horizontal scrolling.
3. City search updates weather tags.
4. Mood selection enables Generate.
5. Generate returns a curated movie detail from TMDB.
6. Save Favorite persists after refresh.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Style curated recommendation MVP"
```

- [ ] **Step 5: Push and verify production**

Run:

```bash
git push
```

After Netlify deploy completes, open:

```text
https://weather-mood-cinema.netlify.app/
```

Verify production city weather, curated recommendation, TMDB detail display, and favorites.

# Weather Mood Cinema React Fusion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the imported React/Vite frontend the primary Weather Mood Cinema app while preserving the existing Open-Meteo weather flow, curated movie scoring, TMDB detail lookup, and local Collections behavior.

**Architecture:** Replace the static app shell with the React frontend from `/Users/yuduoduo/Documents/weather-mood-cinema.zip`, then migrate the existing vanilla helper logic into focused TypeScript modules. Netlify Functions remain responsible for weather normalization and TMDB requests; the frontend owns location state, mood state, local scoring, result rendering, and localStorage Collections.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 4, Leaflet, React Leaflet, motion/react, lucide-react, Node test runner, tsx, Netlify Functions, Open-Meteo, TMDB.

---

## File Structure

- `package.json`: new Vite/React scripts and dependencies.
- `package-lock.json`: copied from the imported React project, then refreshed by `npm install`.
- `tsconfig.json`: TypeScript configuration copied from the imported React project.
- `vite.config.ts`: Vite React/Tailwind config copied from the imported React project.
- `index.html`: Vite entry HTML.
- `src/main.tsx`: React mount entry.
- `src/App.tsx`: Archive and Collections views.
- `src/index.css`: imported frontend visual system and small refinements.
- `src/types.ts`: weather, movie, recommendation, mood, and saved movie types.
- `src/api.ts`: weather and TMDB detail request helpers.
- `src/movie-library.ts`: typed curated movie library migrated from `movie-library.js`.
- `src/recommendation.ts`: atmosphere derivation, scoring, top-pool candidate picking, and recommendation orchestration helpers.
- `src/storage.ts`: Collections localStorage helpers.
- `src/components/MapComponent.tsx`: Leaflet map click and selected marker.
- `src/components/CollectionMovieCard.tsx`: saved TMDB movie card using the imported frontend's card style.
- `tests/movie-library.test.ts`: library shape and coverage tests.
- `tests/recommendation.test.ts`: recommendation scoring tests.
- `tests/storage.test.ts`: localStorage helper tests.
- `tests/weather-mood.test.mjs`: extend existing weather Function tests for coordinate lookup.
- `netlify/functions/weather-mood.mjs`: support city and coordinate weather lookup.
- `netlify/functions/movie-search.mjs`: preserve TMDB detail by id.
- `netlify.toml`: publish Vite `dist`.

Old static files (`script.js`, `styles.css`, root `movie-library.js`) should be removed only after their behavior has been migrated and tests are green.

---

## Task 1: Scaffold the React/Vite App Shell

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Replace: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/components/MapComponent.tsx`
- Create: `src/components/CollectionMovieCard.tsx`
- Modify: `netlify.toml`

- [ ] **Step 1: Confirm the imported frontend zip is available**

Run:

```bash
unzip -l /Users/yuduoduo/Documents/weather-mood-cinema.zip
```

Expected: output includes `src/App.tsx`, `src/components/MapComponent.tsx`, `src/components/CollectionMovieCard.tsx`, `src/index.css`, `package.json`, `package-lock.json`, `tsconfig.json`, and `vite.config.ts`.

- [ ] **Step 2: Copy React scaffold files from the imported frontend**

Run:

```bash
unzip -q -o /Users/yuduoduo/Documents/weather-mood-cinema.zip -d /private/tmp/weather-mood-cinema-react-fusion
cp /private/tmp/weather-mood-cinema-react-fusion/package.json package.json
cp /private/tmp/weather-mood-cinema-react-fusion/package-lock.json package-lock.json
cp /private/tmp/weather-mood-cinema-react-fusion/tsconfig.json tsconfig.json
cp /private/tmp/weather-mood-cinema-react-fusion/vite.config.ts vite.config.ts
mkdir -p src/components
cp /private/tmp/weather-mood-cinema-react-fusion/src/main.tsx src/main.tsx
cp /private/tmp/weather-mood-cinema-react-fusion/src/App.tsx src/App.tsx
cp /private/tmp/weather-mood-cinema-react-fusion/src/index.css src/index.css
cp /private/tmp/weather-mood-cinema-react-fusion/src/types.ts src/types.ts
cp /private/tmp/weather-mood-cinema-react-fusion/src/api.ts src/api.ts
cp /private/tmp/weather-mood-cinema-react-fusion/src/components/MapComponent.tsx src/components/MapComponent.tsx
cp /private/tmp/weather-mood-cinema-react-fusion/src/components/CollectionMovieCard.tsx src/components/CollectionMovieCard.tsx
```

Expected: files exist in the project root and `src/`.

- [ ] **Step 3: Replace the Vite entry HTML**

Edit `index.html` to exactly:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weather Mood Cinema</title>
    <meta
      name="description"
      content="Weather Mood Cinema recommends a curated movie based on location, weather, and mood."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Remove imported Gemini and Express dependencies from `package.json`**

Edit `package.json` so it exactly keeps the React frontend dependencies and scripts:

```json
{
  "name": "weather-mood-cinema",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit",
    "test": "node --import tsx --test tests/*.test.ts tests/*.test.mjs"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-leaflet": "^5.0.0",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.21",
    "@types/node": "^22.14.0",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}
```

- [ ] **Step 5: Update Netlify publish directory**

Edit `netlify.toml` to exactly:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies install and `package-lock.json` reflects the edited `package.json`.

- [ ] **Step 7: Verify the imported app builds before functional migration**

Run:

```bash
npm run lint
npm run build
```

Expected: TypeScript and Vite build complete. It is acceptable at this stage that runtime recommendation behavior still points at `/api/recommend`; that will be replaced in later tasks.

- [ ] **Step 8: Commit the scaffold**

Run:

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src netlify.toml
git commit -m "Adopt React Vite frontend shell"
```

---

## Task 2: Migrate the Curated Movie Library to TypeScript

**Files:**
- Create: `src/movie-library.ts`
- Create: `tests/movie-library.test.ts`

- [ ] **Step 1: Write the failing TypeScript movie library test**

Create `tests/movie-library.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the library test to verify it fails**

Run:

```bash
node --import tsx --test tests/movie-library.test.ts
```

Expected: FAIL because `src/movie-library.ts` does not exist.

- [ ] **Step 3: Generate `src/movie-library.ts` from the existing library**

Run this mechanical conversion command from the project root:

```bash
node -e 'const fs = require("node:fs");
const source = fs.readFileSync("movie-library.js", "utf8");
const grab = (name) => {
  const marker = `const ${name} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${name}`);
  const end = source.indexOf(";\n", start);
  if (end === -1) throw new Error(`Missing terminator for ${name}`);
  return source.slice(start + marker.length, end);
};
const output = `export const WEATHER_TAGS = ${grab("WEATHER_TAGS")} as const;
export const TEMPERATURE_TAGS = ${grab("TEMPERATURE_TAGS")} as const;
export const MOOD_TAGS = ${grab("MOOD_TAGS")} as const;
export const ATMOSPHERE_TAGS = ${grab("ATMOSPHERE_TAGS")} as const;

export type WeatherTag = (typeof WEATHER_TAGS)[number];
export type TemperatureTag = (typeof TEMPERATURE_TAGS)[number];
export type MoodTag = (typeof MOOD_TAGS)[number];
export type AtmosphereTag = (typeof ATMOSPHERE_TAGS)[number];

export interface CuratedMovie {
  tmdbId: number;
  title: string;
  weatherTags: WeatherTag[];
  temperatureTags: TemperatureTag[];
  moodTags: MoodTag[];
  atmosphereTags: AtmosphereTag[];
}

export const MOVIE_LIBRARY: CuratedMovie[] = ${grab("MOVIE_LIBRARY")};
`;
fs.mkdirSync("src", { recursive: true });
fs.writeFileSync("src/movie-library.ts", output);'
```

Expected: `src/movie-library.ts` is created with the complete existing movie array and typed ESM exports.

- [ ] **Step 4: Run the library test to verify it passes**

Run:

```bash
node --import tsx --test tests/movie-library.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the migrated library**

Run:

```bash
git add src/movie-library.ts tests/movie-library.test.ts
git commit -m "Migrate curated movie library to TypeScript"
```

---

## Task 3: Migrate Recommendation Scoring Helpers

**Files:**
- Create: `src/recommendation.ts`
- Create: `tests/recommendation.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Replace `src/types.ts` with product-owned types**

Edit `src/types.ts` to:

```ts
import type { MoodTag, TemperatureTag, WeatherTag } from "./movie-library";

export interface LocationState {
  lat: number;
  lng: number;
  name: string;
  country?: string;
}

export interface WeatherData {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  weather: string;
  weatherCode: number;
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  description: string;
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number | null;
}

export interface ScoredMovie {
  tmdbId: number;
  title: string;
  score: number;
}

export interface MovieRecommendation extends TmdbMovie {
  score: number;
  mood: MoodTag;
  weather: WeatherData;
}

export interface SavedMovie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number | null;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  weather: string;
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  mood: MoodTag;
  score: number;
  savedAt: number;
}
```

- [ ] **Step 2: Write failing recommendation helper tests**

Create `tests/recommendation.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the recommendation tests to verify they fail**

Run:

```bash
node --import tsx --test tests/recommendation.test.ts
```

Expected: FAIL because `src/recommendation.ts` does not exist.

- [ ] **Step 4: Implement recommendation helpers**

Create `src/recommendation.ts`:

```ts
import type {
  AtmosphereTag,
  CuratedMovie,
  MoodTag,
  TemperatureTag,
  WeatherTag,
} from "./movie-library";

const TEMPERATURE_ORDER: TemperatureTag[] = ["cold", "cool", "mild", "warm", "hot"];

export interface RecommendationPreferences {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  moodTag: MoodTag;
  atmosphereTags: AtmosphereTag[];
}

export interface WeatherMoodSeed {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  moodTag: MoodTag;
}

export interface ScoredCandidate {
  movie: CuratedMovie;
  score: number;
}

export const getAdjacentTemperatureTags = (temperatureTag: TemperatureTag): TemperatureTag[] => {
  const index = TEMPERATURE_ORDER.indexOf(temperatureTag);

  if (index === -1) {
    return [];
  }

  return TEMPERATURE_ORDER.filter((_, itemIndex) => Math.abs(itemIndex - index) === 1);
};

export const deriveAtmosphereTags = (
  library: CuratedMovie[],
  weatherTag: WeatherTag,
  temperatureTag: TemperatureTag,
  limit = 3,
): AtmosphereTag[] => {
  const counts = new Map<AtmosphereTag, number>();

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
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

export const scoreMovie = (movie: CuratedMovie, preferences: RecommendationPreferences) => {
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

  preferences.atmosphereTags.forEach((tag) => {
    if (movie.atmosphereTags.includes(tag)) {
      score += 1;
    }
  });

  return score;
};

export const createScoredCandidates = (
  library: CuratedMovie[],
  seed: WeatherMoodSeed,
): ScoredCandidate[] => {
  const atmosphereTags = deriveAtmosphereTags(library, seed.weatherTag, seed.temperatureTag);
  const preferences: RecommendationPreferences = {
    ...seed,
    atmosphereTags,
  };

  return library.map((movie) => ({
    movie,
    score: scoreMovie(movie, preferences),
  }));
};

export const pickTopCandidate = (
  candidates: ScoredCandidate[],
  random = Math.random,
  poolSize = 5,
): ScoredCandidate => {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const pool = sorted.filter((item) => item.score > 0).slice(0, poolSize);
  const candidatesToUse = pool.length > 0 ? pool : sorted.slice(0, poolSize);

  return candidatesToUse[Math.floor(random() * candidatesToUse.length)];
};
```

- [ ] **Step 5: Verify recommendation tests pass**

Run:

```bash
node --import tsx --test tests/recommendation.test.ts
npm run lint
```

Expected: tests pass and TypeScript completes.

- [ ] **Step 6: Commit recommendation helpers**

Run:

```bash
git add src/types.ts src/recommendation.ts tests/recommendation.test.ts
git commit -m "Migrate recommendation scoring helpers"
```

---

## Task 4: Add Typed Favorites Storage

**Files:**
- Create: `src/storage.ts`
- Create: `tests/storage.test.ts`

- [ ] **Step 1: Write failing storage tests**

Create `tests/storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run storage tests to verify they fail**

Run:

```bash
node --import tsx --test tests/storage.test.ts
```

Expected: FAIL because `src/storage.ts` does not exist.

- [ ] **Step 3: Implement storage helpers**

Create `src/storage.ts`:

```ts
import type { SavedMovie } from "./types";

export const FAVORITES_STORAGE_KEY = "weatherMoodCinemaFavorites";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const getFavorites = (storage: StorageLike = localStorage): SavedMovie[] => {
  try {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || "[]") as SavedMovie[];
  } catch {
    return [];
  }
};

const setFavorites = (storage: StorageLike, favorites: SavedMovie[]) => {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
};

export const saveFavorite = (
  storage: StorageLike = localStorage,
  favorite: SavedMovie,
): SavedMovie[] => {
  const favorites = getFavorites(storage);

  if (favorites.some((item) => item.id === favorite.id)) {
    return favorites;
  }

  return setFavorites(storage, [favorite, ...favorites]);
};

export const removeFavorite = (
  storage: StorageLike = localStorage,
  movieId: number,
): SavedMovie[] => {
  return setFavorites(
    storage,
    getFavorites(storage).filter((item) => item.id !== movieId),
  );
};
```

- [ ] **Step 4: Verify storage tests pass**

Run:

```bash
node --import tsx --test tests/storage.test.ts
npm run lint
```

Expected: tests pass and TypeScript completes.

- [ ] **Step 5: Commit storage helpers**

Run:

```bash
git add src/storage.ts tests/storage.test.ts
git commit -m "Add typed collection storage"
```

---

## Task 5: Extend Weather Function for Map Coordinates

**Files:**
- Modify: `netlify/functions/weather-mood.mjs`
- Modify: `tests/weather-mood.test.mjs`

- [ ] **Step 1: Add failing coordinate tests to `tests/weather-mood.test.mjs`**

Add this test case after the existing city success test:

```js
test("looks up weather by latitude and longitude", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const requestUrl = new URL(String(url));

    assert.equal(requestUrl.hostname, "api.open-meteo.com");
    assert.equal(requestUrl.searchParams.get("latitude"), "31.23");
    assert.equal(requestUrl.searchParams.get("longitude"), "121.47");

    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 20.4,
          weather_code: 61,
        },
      }),
      { status: 200 },
    );
  };

  try {
    const response = await weatherMood(
      new Request("https://example.com/.netlify/functions/weather-mood?lat=31.23&lng=121.47"),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.city, "Selected location");
    assert.equal(body.latitude, 31.23);
    assert.equal(body.longitude, 121.47);
    assert.equal(body.temperature, 20);
    assert.equal(body.weather, "Rain");
    assert.equal(body.weatherTag, "rainy");
    assert.equal(body.temperatureTag, "mild");
  } finally {
    global.fetch = originalFetch;
  }
});
```

Add this missing-parameters test if it is not already covered:

```js
test("requires either city or coordinates", async () => {
  const response = await weatherMood(
    new Request("https://example.com/.netlify/functions/weather-mood"),
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "City or coordinates are required");
});
```

- [ ] **Step 2: Run weather tests to verify they fail**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: coordinate test fails because the function only accepts `city`.

- [ ] **Step 3: Implement coordinate support in `weather-mood.mjs`**

Refactor the function to use these helpers:

```js
const buildForecastUrl = (latitude, longitude) => {
  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,weather_code");
  forecastUrl.searchParams.set("timezone", "auto");
  return forecastUrl;
};

const createWeatherPayload = ({ city, country, latitude, longitude, forecastData }) => {
  const temperature = Math.round(forecastData.current.temperature_2m);
  const weatherCode = forecastData.current.weather_code;
  const weather = getWeatherTag(weatherCode);

  return {
    city,
    country,
    latitude,
    longitude,
    temperature,
    weather: weather.weather,
    weatherCode,
    weatherTag: weather.weatherTag,
    temperatureTag: getTemperatureTag(temperature),
    description: `${weather.weather} in ${city} gives the day a ${getWeatherDescription(weatherCode)}.`,
  };
};
```

Then update the default export so it follows this structure:

```js
export default async (request) => {
  const requestUrl = new URL(request.url);
  const city = requestUrl.searchParams.get("city")?.trim();
  const lat = requestUrl.searchParams.get("lat")?.trim();
  const lng = requestUrl.searchParams.get("lng")?.trim();

  if (!city && !(lat && lng)) {
    return jsonResponse(400, {
      error: "City or coordinates are required",
    });
  }

  try {
    if (lat && lng) {
      const latitude = Number(lat);
      const longitude = Number(lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return jsonResponse(400, {
          error: "Valid coordinates are required",
        });
      }

      const forecastData = await fetchJson(buildForecastUrl(latitude, longitude));

      return jsonResponse(
        200,
        createWeatherPayload({
          city: "Selected location",
          latitude,
          longitude,
          forecastData,
        }),
      );
    }

    const geocodingUrl = new URL(GEOCODING_URL);
    geocodingUrl.searchParams.set("name", city);
    geocodingUrl.searchParams.set("count", "1");
    geocodingUrl.searchParams.set("language", "en");
    geocodingUrl.searchParams.set("format", "json");

    const geocodingData = await fetchJson(geocodingUrl);
    const location = geocodingData.results?.[0];

    if (!location) {
      return jsonResponse(404, {
        error: "City not found",
      });
    }

    const forecastData = await fetchJson(buildForecastUrl(location.latitude, location.longitude));

    return jsonResponse(
      200,
      createWeatherPayload({
        city: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        forecastData,
      }),
    );
  } catch {
    return jsonResponse(502, {
      error: "Weather lookup failed",
    });
  }
};
```

- [ ] **Step 4: Verify weather tests pass**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit coordinate weather support**

Run:

```bash
git add netlify/functions/weather-mood.mjs tests/weather-mood.test.mjs
git commit -m "Support coordinate weather lookups"
```

---

## Task 6: Replace Imported API Helpers with Weather and TMDB Helpers

**Files:**
- Modify: `src/api.ts`
- Create: `tests/api.test.ts`

- [ ] **Step 1: Write failing API helper tests**

Create `tests/api.test.ts`:

```ts
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
```

- [ ] **Step 2: Run API tests to verify they fail**

Run:

```bash
node --import tsx --test tests/api.test.ts
```

Expected: FAIL because imported `src/api.ts` still exposes Gemini-oriented helpers.

- [ ] **Step 3: Replace `src/api.ts`**

Edit `src/api.ts` to:

```ts
import type { TmdbMovie, WeatherData } from "./types";

export const buildWeatherByCityUrl = (city: string) =>
  `/.netlify/functions/weather-mood?city=${encodeURIComponent(city)}`;

export const buildWeatherByCoordsUrl = (lat: number, lng: number) =>
  `/.netlify/functions/weather-mood?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;

export const buildMovieDetailUrl = (movieId: number) =>
  `/.netlify/functions/movie-search?id=${encodeURIComponent(movieId)}`;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getWeatherByCoords = (lat: number, lng: number) =>
  fetchJson<WeatherData>(buildWeatherByCoordsUrl(lat, lng));

export const getWeatherByCity = (city: string) =>
  fetchJson<WeatherData>(buildWeatherByCityUrl(city));

export const getMovieDetails = async (movieId: number) => {
  const data = await fetchJson<{ movie: TmdbMovie }>(buildMovieDetailUrl(movieId));
  return data.movie;
};

export const getPosterUrl = (posterPath: string | null, size = "w342") =>
  posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : "";
```

- [ ] **Step 4: Verify API helper tests pass**

Run:

```bash
node --import tsx --test tests/api.test.ts
```

Expected: tests pass. Do not run `npm run lint` until Task 7 rewires `App.tsx` away from the imported Gemini-oriented helper names.

- [ ] **Step 5: Keep API helper changes staged for the Archive integration commit**

Run:

```bash
git status --short
```

Expected: `src/api.ts` and `tests/api.test.ts` are changed. They will be committed with `App.tsx` in Task 7 so the repository does not record a broken intermediate compile state.

---

## Task 7: Wire the React Archive View to Weather, Mood, and Local Scoring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/MapComponent.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update mood options in `src/App.tsx`**

Replace the imported `MOODS` array with:

```ts
import type { MoodTag } from "./movie-library";

const MOODS: { label: string; value: MoodTag }[] = [
  { label: "Relaxed", value: "relaxed" },
  { label: "Lonely", value: "lonely" },
  { label: "Healing", value: "healing" },
  { label: "Excited", value: "excited" },
  { label: "Nostalgic", value: "nostalgic" },
  { label: "Sad", value: "sad" },
  { label: "Gloomy", value: "gloomy" },
  { label: "Romantic", value: "romantic" },
  { label: "Tense", value: "tense" },
];
```

- [ ] **Step 2: Replace imported app state types and imports**

At the top of `src/App.tsx`, use:

```ts
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, BookmarkCheck, Loader2, Search } from "lucide-react";
import { CollectionMovieCard } from "./components/CollectionMovieCard";
import { MapComponent } from "./components/MapComponent";
import { getMovieDetails, getPosterUrl, getWeatherByCity, getWeatherByCoords } from "./api";
import { MOVIE_LIBRARY, type MoodTag } from "./movie-library";
import { createScoredCandidates, pickTopCandidate } from "./recommendation";
import { getFavorites, removeFavorite, saveFavorite } from "./storage";
import type { MovieRecommendation, SavedMovie, WeatherData } from "./types";
```

- [ ] **Step 3: Replace app state declarations**

Inside `App`, use:

```ts
const [weather, setWeather] = useState<WeatherData | null>(null);
const [mood, setMood] = useState<MoodTag | "">("");
const [cityQuery, setCityQuery] = useState("");
const [isFetchingWeather, setIsFetchingWeather] = useState(false);
const [isFetchingMovies, setIsFetchingMovies] = useState(false);
const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
const [error, setError] = useState<string | null>(null);
const [view, setView] = useState<"archive" | "collections">("archive");
const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => getFavorites());
const recsRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 4: Add a saved movie payload helper**

Inside `App`, add:

```ts
const createSavedMovie = (movie: MovieRecommendation): SavedMovie => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.posterPath,
  releaseDate: movie.releaseDate,
  rating: movie.rating,
  city: movie.weather.city,
  country: movie.weather.country,
  latitude: movie.weather.latitude,
  longitude: movie.weather.longitude,
  weather: movie.weather.weather,
  weatherTag: movie.weather.weatherTag,
  temperatureTag: movie.weather.temperatureTag,
  mood: movie.mood,
  score: movie.score,
  savedAt: Date.now(),
});
```

- [ ] **Step 5: Replace save toggling logic**

Use this implementation:

```ts
const toggleSave = (movie: MovieRecommendation | SavedMovie) => {
  setSavedMovies((prev) => {
    const exists = prev.some((saved) => saved.id === movie.id);
    const next = exists
      ? removeFavorite(localStorage, movie.id)
      : saveFavorite(
          localStorage,
          "savedAt" in movie ? movie : createSavedMovie(movie as MovieRecommendation),
        );

    return next;
  });
};
```

- [ ] **Step 6: Replace map location selection logic**

Use:

```ts
const handleLocationSelect = async (coords: { lat: number; lng: number }) => {
  setIsFetchingWeather(true);
  setRecommendation(null);
  setError(null);

  try {
    const nextWeather = await getWeatherByCoords(coords.lat, coords.lng);
    setWeather(nextWeather);
  } catch {
    setError("Atmospheric lookup failed.");
  } finally {
    setIsFetchingWeather(false);
  }
};
```

- [ ] **Step 7: Add secondary city search logic**

Use:

```ts
const handleCitySearch = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const query = cityQuery.trim();

  if (!query) {
    return;
  }

  setIsFetchingWeather(true);
  setRecommendation(null);
  setError(null);

  try {
    const nextWeather = await getWeatherByCity(query);
    setWeather(nextWeather);
    setCityQuery("");
  } catch {
    setError("City not found.");
  } finally {
    setIsFetchingWeather(false);
  }
};
```

- [ ] **Step 8: Replace recommendation generation logic**

Use:

```ts
const handleGetRecommendations = async () => {
  if (!weather || !mood) {
    return;
  }

  setIsFetchingMovies(true);
  setError(null);

  try {
    const candidates = createScoredCandidates(MOVIE_LIBRARY, {
      weatherTag: weather.weatherTag,
      temperatureTag: weather.temperatureTag,
      moodTag: mood,
    });
    const selected = pickTopCandidate(candidates);
    const movie = await getMovieDetails(selected.movie.tmdbId);

    setRecommendation({
      ...movie,
      score: selected.score,
      mood,
      weather,
    });

    setTimeout(() => {
      recsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } catch {
    setError("Movie data did not load.");
  } finally {
    setIsFetchingMovies(false);
  }
};
```

- [ ] **Step 9: Add secondary search UI in the map overlay**

Inside the left map section overlay, add this compact form near the upper-left or lower-left map overlay area:

```tsx
<form
  onSubmit={handleCitySearch}
  className="pointer-events-auto absolute left-6 top-6 z-20 flex w-[min(18rem,calc(100vw-3rem))] items-center gap-2 border border-white/15 bg-[#111317]/70 px-3 py-2 backdrop-blur-md md:left-10 md:top-10"
  aria-label="Jump to city"
>
  <Search className="h-3.5 w-3.5 text-white/50" />
  <input
    value={cityQuery}
    onChange={(event) => setCityQuery(event.target.value)}
    className="min-w-0 flex-1 bg-transparent font-sans text-[10px] uppercase tracking-[0.18em] text-white/80 outline-none placeholder:text-white/35"
    placeholder="Search city"
    aria-label="Search city"
  />
  <button
    type="submit"
    className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 transition hover:text-white disabled:opacity-30"
    disabled={isFetchingWeather}
  >
    Go
  </button>
</form>
```

- [ ] **Step 10: Render selected weather from `weather` instead of imported `location`**

Update the location title block to use:

```tsx
{weather ? (
  <>
    <h1 className="text-6xl md:text-[112px] leading-[0.85] tracking-tighter italic font-light lowercase drop-shadow-lg text-white">
      {weather.city}
      <span className="block not-italic text-3xl md:text-[72px] tracking-normal font-normal opacity-60 mt-1 md:mt-2">
        {weather.weather}
      </span>
    </h1>
    <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
      <span className="text-4xl md:text-5xl font-light text-white">{weather.temperature}°C</span>
      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans">
        {weather.weatherTag} / {weather.temperatureTag}
      </span>
    </div>
  </>
) : (
  <h1 className="text-5xl md:text-[80px] leading-[0.85] tracking-tighter italic font-light lowercase opacity-60">
    Select a<br />
    <span className="not-italic opacity-70">coordinate</span>
  </h1>
)}
```

- [ ] **Step 11: Pass selected coordinates into `MapComponent`**

Render:

```tsx
<MapComponent
  onLocationSelect={handleLocationSelect}
  selectedLocation={
    weather
      ? {
          lat: weather.latitude,
          lng: weather.longitude,
        }
      : null
  }
/>
```

- [ ] **Step 12: Update recommendation section for a single TMDB-backed recommendation**

Replace `recommendations && recommendations.map(...)` with `recommendation && (...)` and use:

```tsx
{recommendation && (
  <section ref={recsRef} className="w-full min-h-screen bg-[#111317] border-t border-white/20 flex flex-col p-6 md:p-16 lg:px-32">
    <div className="flex justify-between items-baseline mb-16 shrink-0 pt-6">
      <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">
        Curation Result
      </span>
      <span className="text-[10px] uppercase tracking-[0.1em] opacity-80 font-sans">
        Score {recommendation.score}
      </span>
    </div>

    <div className="flex-1 w-full mx-auto flex flex-col gap-16 pb-24 max-w-5xl">
      <AnimatePresence>
        <motion.div
          key={recommendation.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-[#16181D] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-8 shadow-2xl group overflow-hidden min-h-0 rounded-sm"
        >
          <div className="md:w-1/3 shrink-0 md:ml-6 z-10 relative">
            <div className="aspect-[2/3] w-full bg-[#1a1a1a] rounded overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group-hover:scale-[1.02] transition-transform duration-700">
              {recommendation.posterPath ? (
                <img
                  src={getPosterUrl(recommendation.posterPath)}
                  className="w-full h-full object-cover opacity-85 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                  alt={recommendation.title}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
                  No Poster
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3 flex flex-col justify-center md:mr-6 z-10">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-sans mb-2 block italic text-white/90">
                  {recommendation.weather.city} / {recommendation.weather.weather} / {recommendation.mood}
                </span>
                <h2 className="text-4xl md:text-5xl leading-[1.1] tracking-tight group-hover:text-white transition-colors">
                  {recommendation.title}
                </h2>
                <span className="text-xl opacity-60 font-light block mt-2">
                  ({recommendation.releaseDate ? recommendation.releaseDate.slice(0, 4) : "Film"}) · {recommendation.rating ? recommendation.rating.toFixed(1) : "NR"}
                </span>
              </div>
              <button
                onClick={() => toggleSave(recommendation)}
                className="text-white/60 hover:text-white transition-colors p-2 rounded-full border border-transparent hover:border-white/30 hover:bg-white/10"
                title={savedMovies.some((saved) => saved.id === recommendation.id) ? "Remove from Collections" : "Save to Collections"}
              >
                {savedMovies.some((saved) => saved.id === recommendation.id) ? (
                  <BookmarkCheck className="w-5 h-5 text-white" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="h-[1px] w-full bg-white/20 my-6" />
            <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-6 italic text-[#F5F5F0]">
              "{recommendation.overview || "A film selected for this weather mood."}"
            </p>
            <p className="text-sm tracking-widest leading-loose opacity-70 font-sans uppercase">
              Weather {recommendation.weather.weatherTag}. Temperature {recommendation.weather.temperatureTag}. Mood {recommendation.mood}. Match score {recommendation.score}.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </section>
)}
```

- [ ] **Step 13: Verify Archive view compiles**

Run:

```bash
npm run lint
npm run build
```

Expected: TypeScript and build pass.

- [ ] **Step 14: Commit Archive integration**

Run:

```bash
git add src/api.ts tests/api.test.ts src/App.tsx src/components/MapComponent.tsx src/index.css
git commit -m "Wire React archive to curated recommendations"
```

---

## Task 8: Update Collections Card for TMDB Data

**Files:**
- Modify: `src/components/CollectionMovieCard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace generated poster rendering in `CollectionMovieCard`**

Import `getPosterUrl`:

```ts
import { getPosterUrl } from "../api";
```

Replace the front poster `<img>` with:

```tsx
{movie.posterPath ? (
  <img
    src={getPosterUrl(movie.posterPath)}
    className="w-full h-full object-cover opacity-90 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
    alt={movie.title}
  />
) : (
  <div className="h-full w-full flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
    No Poster
  </div>
)}
```

- [ ] **Step 2: Replace back-card text with TMDB overview and match context**

Use:

```tsx
<p className="text-base md:text-lg leading-relaxed italic text-[#0A0B0D] mb-6">
  "{movie.overview || "A saved film from your weather mood archive."}"
</p>
<div className="h-[1px] w-12 bg-black/20 mx-auto my-6 shrink-0"></div>
<p className="text-xs tracking-widest leading-loose opacity-80 font-sans text-[#0A0B0D] uppercase">
  {movie.weatherTag} / {movie.temperatureTag} / {movie.mood} / Score {movie.score}
</p>
```

- [ ] **Step 3: Replace title metadata**

Use:

```tsx
<h2 className="text-2xl leading-tight tracking-tight group-hover:text-white transition-colors">
  {movie.title}
</h2>
<span className="text-xs opacity-60 font-light block mt-1">
  ({movie.releaseDate ? movie.releaseDate.slice(0, 4) : "Film"}) · {movie.rating ? movie.rating.toFixed(1) : "NR"}
</span>
```

- [ ] **Step 4: Replace saved metadata labels**

Use:

```tsx
<div className="space-y-3 text-[10px] font-sans uppercase tracking-widest opacity-80">
  <div className="flex items-center justify-between gap-4">
    <span className="opacity-60">Location</span>
    <span className="text-right truncate">{movie.city}</span>
  </div>
  <div className="flex items-center justify-between gap-4">
    <span className="opacity-60">Weather</span>
    <span className="text-right truncate">{movie.weather}</span>
  </div>
  <div className="flex items-center justify-between gap-4">
    <span className="opacity-60">Mood</span>
    <span className="text-right truncate">{movie.mood}</span>
  </div>
</div>
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run lint
npm run build
```

Expected: TypeScript and build pass.

- [ ] **Step 6: Commit Collections update**

Run:

```bash
git add src/components/CollectionMovieCard.tsx src/App.tsx
git commit -m "Render TMDB data in collections"
```

---

## Task 9: Remove Old Static and Imported Server Artifacts

**Files:**
- Delete: `script.js`
- Delete: `styles.css`
- Delete: `movie-library.js`
- Delete if present: `server.ts`
- Delete: `tests/script.test.cjs`
- Delete: `tests/movie-library.test.cjs`

- [ ] **Step 1: Run the new TypeScript tests before cleanup**

Run:

```bash
npm test
```

Expected: TypeScript and MJS tests pass. If old CommonJS tests fail because root `script.js` or `movie-library.js` no longer represent the app, replace them with the TypeScript tests from earlier tasks before deleting files.

- [ ] **Step 2: Remove legacy root app files**

Run:

```bash
git rm script.js styles.css movie-library.js
```

Expected: the root static implementation is removed from git. Keep `index.html` because it is now the Vite entry.

- [ ] **Step 3: Remove imported server artifact if it exists**

Run:

```bash
if [ -f server.ts ]; then git rm server.ts; fi
```

Expected: no Express/Gemini server remains in the app.

- [ ] **Step 4: Remove or rewrite obsolete CommonJS tests**

If these files still import the removed root files, remove them:

```bash
git rm tests/script.test.cjs tests/movie-library.test.cjs
```

Keep:

```text
tests/movie-search.test.mjs
tests/weather-mood.test.mjs
tests/movie-library.test.ts
tests/recommendation.test.ts
tests/storage.test.ts
tests/api.test.ts
```

- [ ] **Step 5: Verify final test and build after cleanup**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit cleanup**

Run:

```bash
git add -A
git commit -m "Remove legacy static app artifacts"
```

---

## Task 10: Browser Verification and Polish

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/components/MapComponent.tsx`
- Modify: `src/components/CollectionMovieCard.tsx`

- [ ] **Step 1: Start the local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite starts and prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 2: Verify desktop in the in-app browser**

Open the local URL in the in-app browser and check:

- Map renders with dark tiles.
- Compact `Search city` control is present but visually secondary.
- Clicking the map sets weather loading state and then weather text.
- Mood buttons show selected state in the right panel.
- Recommendation CTA is disabled until weather and mood exist.
- Result card renders TMDB poster, title, overview, year/rating, and match context.
- Saving toggles the bookmark icon.
- Collections view shows the saved movie with the imported card style.

- [ ] **Step 3: Verify mobile layout**

Set viewport to `390x844` and check:

- No horizontal overflow.
- Search city control does not cover the main title or mood controls.
- Map and mood sections remain usable.
- Recommendation card stacks cleanly.
- Collections cards fit without text overlap.

- [ ] **Step 4: Fix any visual issues inside the new frontend paradigm**

If controls or text overlap, adjust only with restrained layout changes. Acceptable changes:

```css
.leaflet-container {
  background: #0e0f12;
}
```

```tsx
className="max-w-full overflow-hidden text-ellipsis"
```

```tsx
className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
```

Do not add bright cards, explanatory sections, large forms, or legacy UI blocks.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected: tests, lint, and build pass. `git status --short` shows only intentional polish changes before the final commit.

- [ ] **Step 6: Commit final polish**

Run:

```bash
git add src
git commit -m "Polish React weather cinema experience"
```

---

## Final Completion Checklist

- [ ] React/Vite is the only root app entry.
- [ ] New frontend visual language is preserved.
- [ ] Map point selection is the primary location entry.
- [ ] City search is compact and secondary.
- [ ] Weather Function supports city and coordinate input.
- [ ] Recommendation uses curated local scoring, not Gemini.
- [ ] TMDB provides poster, overview, release date, and rating.
- [ ] Collections uses new frontend card interactions with TMDB-backed data.
- [ ] Old static files do not compete with the React app.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Browser desktop and mobile checks pass.

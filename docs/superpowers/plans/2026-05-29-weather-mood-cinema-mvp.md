# Weather Mood Cinema MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real Weather Mood Cinema product loop: city weather lookup, mood selection, movie generation, result display, and local favorites.

**Architecture:** Keep the app as static HTML/CSS/vanilla JS plus Netlify Functions. Add `weather-mood.mjs` as a project-owned weather API wrapper around Open-Meteo, keep `movie-search.mjs` as the TMDB proxy, and let `script.js` coordinate client state, rendering, query composition, and `localStorage` favorites.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node test runner, Netlify Functions, Open-Meteo Geocoding API, Open-Meteo Forecast API, TMDB API proxy.

---

## File Structure

- `netlify/functions/weather-mood.mjs`: new Netlify Function that geocodes a typed city, fetches current weather, maps weather codes into product moods and movie query bases, and returns normalized JSON.
- `tests/weather-mood.test.mjs`: new Node tests for weather lookup success, missing city, upstream failure, and weather mapping.
- `script.js`: expand from the current single-card TMDB demo into small exported helpers plus app initialization, including weather URL building, movie query building, weather rendering, result rendering, and favorites helpers.
- `tests/script.test.cjs`: extend existing tests to cover weather URL construction, mood/weather movie query composition, and favorites behavior.
- `index.html`: replace the single preview card flow with home, mood, result, and favorites sections while preserving TMDB attribution.
- `styles.css`: update layout and states for the new multi-section product flow.

## Task 1: Add Weather Function

**Files:**
- Create: `netlify/functions/weather-mood.mjs`
- Create: `tests/weather-mood.test.mjs`

- [ ] **Step 1: Write the failing weather Function tests**

Create `tests/weather-mood.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import handler, {
  describeWeatherCode,
  mapWeatherToMovieBase,
} from "../netlify/functions/weather-mood.mjs";

const readJson = async (response) => JSON.parse(await response.text());

test("maps weather codes into product weather moods", () => {
  assert.deepEqual(describeWeatherCode(0), {
    label: "Clear sky",
    moodFromWeather: "bright",
  });
  assert.deepEqual(describeWeatherCode(61), {
    label: "Rain",
    moodFromWeather: "rainy",
  });
  assert.deepEqual(mapWeatherToMovieBase("foggy", 8), {
    movieQueryBase: "fog mystery",
    description: "Foggy weather points toward a quiet mystery with a softened edge.",
  });
});

test("returns normalized weather data for a city", async () => {
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
  assert.equal(requestedUrls[0].pathname, "/v1/search");
  assert.equal(requestedUrls[0].searchParams.get("name"), "Beijing");
  assert.equal(requestedUrls[1].origin, "https://api.open-meteo.com");
  assert.equal(requestedUrls[1].pathname, "/v1/forecast");
  assert.equal(requestedUrls[1].searchParams.get("current"), "temperature_2m,weather_code");

  assert.deepEqual(await readJson(response), {
    city: "Beijing",
    country: "China",
    latitude: 39.9042,
    longitude: 116.4074,
    temperature: 21,
    weather: "Clear sky",
    weatherCode: 0,
    moodFromWeather: "bright",
    movieQueryBase: "sunny adventure",
    description: "Clear weather in Beijing points toward something bright and open.",
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

test("returns 502 when Open-Meteo lookup fails", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () =>
    new Response(JSON.stringify({ reason: "upstream unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/weather-mood?city=Beijing"),
  );

  global.fetch = originalFetch;

  assert.equal(response.status, 502);
  assert.deepEqual(await readJson(response), {
    error: "Weather lookup failed",
  });
});
```

- [ ] **Step 2: Run the weather tests to verify they fail**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: FAIL because `netlify/functions/weather-mood.mjs` does not exist.

- [ ] **Step 3: Implement the weather Function**

Create `netlify/functions/weather-mood.mjs`:

```js
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const weatherGroups = [
  {
    codes: new Set([0, 1]),
    label: "Clear sky",
    moodFromWeather: "bright",
    movieQueryBase: "sunny adventure",
    description: "Clear weather in {city} points toward something bright and open.",
  },
  {
    codes: new Set([2, 3]),
    label: "Cloudy",
    moodFromWeather: "cloudy",
    movieQueryBase: "quiet drama",
    description: "Cloud cover in {city} makes the day feel reflective and slow-burning.",
  },
  {
    codes: new Set([45, 48]),
    label: "Fog",
    moodFromWeather: "foggy",
    movieQueryBase: "fog mystery",
    description: "Foggy weather points toward a quiet mystery with a softened edge.",
  },
  {
    codes: new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]),
    label: "Rain",
    moodFromWeather: "rainy",
    movieQueryBase: "rainy drama",
    description: "Rain in {city} sets up a cinematic, introspective watch.",
  },
  {
    codes: new Set([71, 73, 75, 77, 85, 86]),
    label: "Snow",
    moodFromWeather: "cold",
    movieQueryBase: "winter story",
    description: "Snowy weather in {city} calls for something intimate and wintry.",
  },
  {
    codes: new Set([95, 96, 99]),
    label: "Thunderstorm",
    moodFromWeather: "stormy",
    movieQueryBase: "storm thriller",
    description: "Stormy weather in {city} brings tension and dramatic momentum.",
  },
];

export const describeWeatherCode = (weatherCode) => {
  const group = weatherGroups.find((item) => item.codes.has(weatherCode));

  if (!group) {
    return {
      label: "Changing weather",
      moodFromWeather: "ambient",
    };
  }

  return {
    label: group.label,
    moodFromWeather: group.moodFromWeather,
  };
};

export const mapWeatherToMovieBase = (moodFromWeather, temperature) => {
  const group = weatherGroups.find((item) => item.moodFromWeather === moodFromWeather);

  if (temperature <= 5) {
    return {
      movieQueryBase: "winter drama",
      description: "Cold weather points toward a textured, atmospheric film.",
    };
  }

  if (!group) {
    return {
      movieQueryBase: "atmospheric drama",
      description: "The weather suggests an atmospheric movie with a clear mood.",
    };
  }

  return {
    movieQueryBase: group.movieQueryBase,
    description: group.description,
  };
};

const buildDescription = (description, city) => description.replace("{city}", city);

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Open-Meteo request failed");
  }

  return response.json();
};

export default async (request) => {
  const requestUrl = new URL(request.url);
  const city = requestUrl.searchParams.get("city")?.trim();

  if (!city) {
    return jsonResponse(400, {
      error: "City is required",
    });
  }

  try {
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

    const forecastUrl = new URL(FORECAST_URL);
    forecastUrl.searchParams.set("latitude", String(location.latitude));
    forecastUrl.searchParams.set("longitude", String(location.longitude));
    forecastUrl.searchParams.set("current", "temperature_2m,weather_code");
    forecastUrl.searchParams.set("timezone", "auto");

    const forecastData = await fetchJson(forecastUrl);
    const temperature = Math.round(forecastData.current.temperature_2m);
    const weatherCode = forecastData.current.weather_code;
    const weatherDescription = describeWeatherCode(weatherCode);
    const movieMapping = mapWeatherToMovieBase(weatherDescription.moodFromWeather, temperature);

    return jsonResponse(200, {
      city: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      temperature,
      weather: weatherDescription.label,
      weatherCode,
      moodFromWeather: weatherDescription.moodFromWeather,
      movieQueryBase: movieMapping.movieQueryBase,
      description: buildDescription(movieMapping.description, location.name),
    });
  } catch (error) {
    return jsonResponse(502, {
      error: "Weather lookup failed",
    });
  }
};
```

- [ ] **Step 4: Run the weather tests to verify they pass**

Run:

```bash
node --test tests/weather-mood.test.mjs
```

Expected: PASS, all 5 weather tests pass.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/weather-mood.mjs tests/weather-mood.test.mjs
git commit -m "Add weather mood function"
```

## Task 2: Add Frontend State Helpers

**Files:**
- Modify: `script.js`
- Modify: `tests/script.test.cjs`

- [ ] **Step 1: Add failing helper tests**

Append these tests to `tests/script.test.cjs`:

```js
const {
  buildWeatherMoodUrl,
  buildMovieQuery,
  getFavorites,
  saveFavorite,
  removeFavorite,
} = require("../script.js");

test("builds the Netlify weather Function URL with an encoded city", () => {
  assert.equal(
    buildWeatherMoodUrl("New York"),
    "/.netlify/functions/weather-mood?city=New%20York",
  );
});

test("builds a movie query from weather base and selected mood", () => {
  assert.equal(
    buildMovieQuery(
      {
        movieQueryBase: "sunny adventure",
      },
      "nostalgic",
    ),
    "nostalgic sunny adventure",
  );

  assert.equal(
    buildMovieQuery(
      {
        movieQueryBase: "rainy drama",
      },
      "lonely",
    ),
    "lonely rainy drama",
  );
});

test("stores favorites without duplicates and removes them by id", () => {
  const storage = {
    value: null,
    getItem(key) {
      assert.equal(key, "weatherMoodCinemaFavorites");
      return this.value;
    },
    setItem(key, value) {
      assert.equal(key, "weatherMoodCinemaFavorites");
      this.value = value;
    },
  };

  const favorite = {
    id: 123,
    title: "Rain Town",
    overview: "A quiet story.",
    posterPath: "/rain-town.jpg",
    releaseDate: "2024-02-14",
    rating: 7.6,
    city: "Beijing",
    weather: "Clear sky",
    mood: "nostalgic",
  };

  assert.deepEqual(getFavorites(storage), []);
  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(removeFavorite(storage, 123), []);
});
```

- [ ] **Step 2: Run the script tests to verify they fail**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: FAIL because `buildWeatherMoodUrl`, `buildMovieQuery`, and favorites helpers are not exported yet.

- [ ] **Step 3: Add minimal helper implementations**

Modify `script.js` to add these constants and helpers near the top:

```js
const FAVORITES_STORAGE_KEY = "weatherMoodCinemaFavorites";

const buildWeatherMoodUrl = (city) =>
  `/.netlify/functions/weather-mood?city=${encodeURIComponent(city)}`;

const buildMovieQuery = (weatherState, selectedMood) =>
  `${selectedMood} ${weatherState.movieQueryBase}`.trim();

const getFavorites = (storage = localStorage) => {
  try {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const setFavorites = (storage, favorites) => {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
};

const saveFavorite = (storage = localStorage, favorite) => {
  const favorites = getFavorites(storage);

  if (favorites.some((item) => item.id === favorite.id)) {
    return favorites;
  }

  return setFavorites(storage, [favorite, ...favorites]);
};

const removeFavorite = (storage = localStorage, movieId) => {
  const favorites = getFavorites(storage).filter((item) => item.id !== movieId);
  return setFavorites(storage, favorites);
};
```

Extend the existing `module.exports` block at the bottom of `script.js`:

```js
if (typeof module !== "undefined") {
  module.exports = {
    buildMovieSearchUrl,
    buildWeatherMoodUrl,
    buildMovieQuery,
    getFavorites,
    getPosterUrl,
    removeFavorite,
    renderMovieRecommendation,
    saveFavorite,
  };
}
```

- [ ] **Step 4: Run the script tests to verify they pass**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: PASS, all script helper tests pass.

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.cjs
git commit -m "Add frontend state helpers"
```

## Task 3: Update Product Markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the current body markup**

Keep the existing `<head>` and stylesheet/script tags. Replace the content inside `<body>` with:

```html
<main class="page-shell">
  <section class="hero" aria-labelledby="page-title">
    <div class="hero-copy">
      <p class="eyebrow">Weather-based movie discovery</p>
      <h1 id="page-title">Weather Mood Cinema</h1>
      <p class="lede">
        Choose a city, pick the feeling you want tonight, and let the weather set the scene.
      </p>
      <form class="city-form" aria-label="City weather form">
        <label for="city">City</label>
        <div class="input-row">
          <input id="city" name="city" type="text" value="Shanghai" autocomplete="address-level2">
          <button id="weather-button" type="submit">Check Weather</button>
        </div>
        <p id="weather-error" class="form-message" role="status"></p>
      </form>
      <button id="favorites-button" class="secondary-button" type="button">
        Favorites <span id="favorites-count">0</span>
      </button>
    </div>

    <article class="weather-card" aria-label="Selected city weather">
      <p class="city-line">Selected city</p>
      <h2 id="weather-city">Shanghai</h2>
      <p id="weather-description">
        Search for a city to turn current weather into a movie mood.
      </p>
      <dl class="weather-stats">
        <div>
          <dt>Temperature</dt>
          <dd id="temperature-value">--</dd>
        </div>
        <div>
          <dt>Weather</dt>
          <dd id="weather-value">Waiting</dd>
        </div>
        <div>
          <dt>Mood</dt>
          <dd id="weather-mood-value">Unset</dd>
        </div>
      </dl>
    </article>
  </section>

  <section class="mood-section" aria-labelledby="mood-title">
    <div>
      <p class="eyebrow">Mood layer</p>
      <h2 id="mood-title">Pick tonight's feeling</h2>
    </div>
    <div class="mood-grid" role="listbox" aria-label="Movie mood">
      <button type="button" class="mood-option" data-mood="relaxed">Relaxed</button>
      <button type="button" class="mood-option" data-mood="lonely">Lonely</button>
      <button type="button" class="mood-option" data-mood="healing">Healing</button>
      <button type="button" class="mood-option" data-mood="excited">Excited</button>
      <button type="button" class="mood-option" data-mood="nostalgic">Nostalgic</button>
      <button type="button" class="mood-option" data-mood="gloomy">Gloomy</button>
      <button type="button" class="mood-option" data-mood="romantic">Romantic</button>
      <button type="button" class="mood-option" data-mood="tense">Tense</button>
    </div>
    <button id="generate-button" class="generate-button" type="button" disabled>Generate</button>
    <p id="generate-error" class="form-message" role="status"></p>
  </section>

  <section id="result-section" class="result-section" aria-labelledby="result-title" hidden>
    <div class="result-heading">
      <div>
        <p class="eyebrow">Your weather mood pick</p>
        <h2 id="result-title">Tonight's movie</h2>
      </div>
      <button id="back-button" class="secondary-button" type="button">Back</button>
    </div>
    <article class="recommendation" aria-label="Movie recommendation">
      <div class="poster" aria-hidden="true">
        <img id="movie-poster" class="poster-image" alt="" hidden>
        <span id="poster-label">Cinema</span>
      </div>
      <div class="recommendation-copy">
        <p class="city-line"><span id="preview-city">Your city</span> feels like</p>
        <h3 id="movie-title">Ready when you are</h3>
        <p id="movie-overview">
          Choose city weather and a mood to generate a real TMDB movie recommendation.
        </p>
        <dl class="mood-stats">
          <div>
            <dt>Weather</dt>
            <dd id="result-weather-value">Waiting</dd>
          </div>
          <div>
            <dt>Mood</dt>
            <dd id="result-mood-value">Unset</dd>
          </div>
          <div>
            <dt>Pick</dt>
            <dd id="pick-value">Film</dd>
          </div>
        </dl>
        <button id="save-favorite-button" class="generate-button" type="button" disabled>
          Save Favorite
        </button>
      </div>
    </article>
  </section>

  <aside id="favorites-panel" class="favorites-panel" aria-label="Favorites" hidden>
    <div class="favorites-header">
      <h2>Favorites</h2>
      <button id="close-favorites-button" class="secondary-button" type="button">Close</button>
    </div>
    <div id="favorites-list" class="favorites-list"></div>
  </aside>

  <section class="credits" aria-labelledby="credits-title">
    <h2 id="credits-title">Credits</h2>
    <p>
      This product uses the TMDB API but is not endorsed or certified by TMDB.
      Movie data comes from
      <a href="https://www.themoviedb.org" rel="noreferrer">The Movie Database</a>.
      Weather data comes from
      <a href="https://open-meteo.com" rel="noreferrer">Open-Meteo</a>.
    </p>
  </section>
</main>
<script src="script.js"></script>
```

- [ ] **Step 2: Validate markup smoke check**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: PASS, markup changes do not break imported script tests.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Update MVP page structure"
```

## Task 4: Wire App Behavior

**Files:**
- Modify: `script.js`
- Modify: `tests/script.test.cjs`

- [ ] **Step 1: Add failing render tests**

Append these tests to `tests/script.test.cjs`:

```js
const {
  createFavoritePayload,
  renderWeather,
} = require("../script.js");

test("renders weather data into the weather card elements", () => {
  const elements = {
    weatherCity: { textContent: "" },
    weatherDescription: { textContent: "" },
    temperatureValue: { textContent: "" },
    weatherValue: { textContent: "" },
    weatherMoodValue: { textContent: "" },
  };

  renderWeather(elements, {
    city: "Beijing",
    country: "China",
    temperature: 21,
    weather: "Clear sky",
    moodFromWeather: "bright",
    description: "Clear weather in Beijing points toward something bright and open.",
  });

  assert.equal(elements.weatherCity.textContent, "Beijing, China");
  assert.equal(
    elements.weatherDescription.textContent,
    "Clear weather in Beijing points toward something bright and open.",
  );
  assert.equal(elements.temperatureValue.textContent, "21°C");
  assert.equal(elements.weatherValue.textContent, "Clear sky");
  assert.equal(elements.weatherMoodValue.textContent, "bright");
});

test("creates a favorite payload from movie, weather, and mood state", () => {
  assert.deepEqual(
    createFavoritePayload(
      {
        id: 123,
        title: "Rain Town",
        overview: "A quiet story.",
        posterPath: "/rain-town.jpg",
        releaseDate: "2024-02-14",
        rating: 7.6,
      },
      {
        city: "Beijing",
        weather: "Clear sky",
      },
      "nostalgic",
    ),
    {
      id: 123,
      title: "Rain Town",
      overview: "A quiet story.",
      posterPath: "/rain-town.jpg",
      releaseDate: "2024-02-14",
      rating: 7.6,
      city: "Beijing",
      weather: "Clear sky",
      mood: "nostalgic",
    },
  );
});
```

- [ ] **Step 2: Run script tests to verify they fail**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: FAIL because `renderWeather` and `createFavoritePayload` are not exported yet.

- [ ] **Step 3: Implement rendering helpers and app events**

Modify `script.js`:

1. Add these helpers near the other exported helpers:

```js
const renderWeather = (elements, weatherState) => {
  elements.weatherCity.textContent = `${weatherState.city}, ${weatherState.country}`;
  elements.weatherDescription.textContent = weatherState.description;
  elements.temperatureValue.textContent = `${weatherState.temperature}°C`;
  elements.weatherValue.textContent = weatherState.weather;
  elements.weatherMoodValue.textContent = weatherState.moodFromWeather;
};

const createFavoritePayload = (movie, weatherState, selectedMood) => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.posterPath,
  releaseDate: movie.releaseDate,
  rating: movie.rating,
  city: weatherState.city,
  weather: weatherState.weather,
  mood: selectedMood,
});

const setButtonLoading = (button, isLoading, idleText, loadingText) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
};
```

2. Replace the body of `initWeatherMoodCinema` with stateful UI wiring:

```js
const initWeatherMoodCinema = (doc = document, storage = localStorage) => {
  const state = {
    weather: null,
    selectedMood: "",
    currentMovie: null,
  };

  const cityForm = doc.querySelector(".city-form");
  const cityInput = doc.querySelector("#city");
  const weatherButton = doc.querySelector("#weather-button");
  const weatherError = doc.querySelector("#weather-error");
  const generateButton = doc.querySelector("#generate-button");
  const generateError = doc.querySelector("#generate-error");
  const resultSection = doc.querySelector("#result-section");
  const backButton = doc.querySelector("#back-button");
  const saveFavoriteButton = doc.querySelector("#save-favorite-button");
  const favoritesButton = doc.querySelector("#favorites-button");
  const favoritesCount = doc.querySelector("#favorites-count");
  const favoritesPanel = doc.querySelector("#favorites-panel");
  const closeFavoritesButton = doc.querySelector("#close-favorites-button");
  const favoritesList = doc.querySelector("#favorites-list");

  const weatherElements = {
    weatherCity: doc.querySelector("#weather-city"),
    weatherDescription: doc.querySelector("#weather-description"),
    temperatureValue: doc.querySelector("#temperature-value"),
    weatherValue: doc.querySelector("#weather-value"),
    weatherMoodValue: doc.querySelector("#weather-mood-value"),
  };

  const movieElements = {
    movieTitle: doc.querySelector("#movie-title"),
    movieOverview: doc.querySelector("#movie-overview"),
    pickValue: doc.querySelector("#pick-value"),
    posterImage: doc.querySelector("#movie-poster"),
    posterLabel: doc.querySelector("#poster-label"),
  };

  const syncGenerateState = () => {
    generateButton.disabled = !(state.weather && state.selectedMood);
  };

  const renderFavorites = () => {
    const favorites = getFavorites(storage);
    favoritesCount.textContent = String(favorites.length);

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="empty-state">No saved movies yet.</p>';
      return;
    }

    favoritesList.innerHTML = favorites
      .map(
        (favorite) => `
          <article class="favorite-item">
            <div>
              <h3>${favorite.title}</h3>
              <p>${favorite.city} · ${favorite.weather} · ${favorite.mood}</p>
            </div>
            <button type="button" data-remove-favorite="${favorite.id}">Remove</button>
          </article>
        `,
      )
      .join("");
  };

  cityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    weatherError.textContent = "";
    const city = cityInput.value.trim();

    if (!city) {
      weatherError.textContent = "Enter a city first.";
      return;
    }

    setButtonLoading(weatherButton, true, "Check Weather", "Checking...");

    try {
      const response = await fetch(buildWeatherMoodUrl(city));

      if (!response.ok) {
        throw new Error("Weather lookup failed");
      }

      state.weather = await response.json();
      renderWeather(weatherElements, state.weather);
      syncGenerateState();
    } catch (error) {
      weatherError.textContent = "Weather did not load. Try another city.";
    } finally {
      setButtonLoading(weatherButton, false, "Check Weather", "Checking...");
      syncGenerateState();
    }
  });

  doc.querySelectorAll(".mood-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMood = button.dataset.mood;
      doc.querySelectorAll(".mood-option").forEach((option) => {
        option.classList.toggle("is-selected", option === button);
      });
      syncGenerateState();
    });
  });

  generateButton.addEventListener("click", async () => {
    if (!state.weather || !state.selectedMood) {
      generateError.textContent = "Choose a city and mood first.";
      return;
    }

    generateError.textContent = "";
    setButtonLoading(generateButton, true, "Generate", "Finding...");

    try {
      const response = await fetch(buildMovieSearchUrl(buildMovieQuery(state.weather, state.selectedMood)));

      if (!response.ok) {
        throw new Error("Movie search failed");
      }

      const data = await response.json();
      const movie = data.results?.[0];

      if (!movie) {
        throw new Error("No movie returned");
      }

      state.currentMovie = movie;
      doc.querySelector("#preview-city").textContent = state.weather.city;
      doc.querySelector("#result-weather-value").textContent = state.weather.weather;
      doc.querySelector("#result-mood-value").textContent = state.selectedMood;
      renderMovieRecommendation(movieElements, movie);
      saveFavoriteButton.disabled = false;
      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      generateError.textContent = "Movie data did not load. Try a different mood.";
    } finally {
      setButtonLoading(generateButton, false, "Generate", "Finding...");
      syncGenerateState();
    }
  });

  saveFavoriteButton.addEventListener("click", () => {
    if (!state.currentMovie || !state.weather || !state.selectedMood) {
      return;
    }

    saveFavorite(storage, createFavoritePayload(state.currentMovie, state.weather, state.selectedMood));
    renderFavorites();
    saveFavoriteButton.textContent = "Saved";
  });

  backButton.addEventListener("click", () => {
    resultSection.hidden = true;
  });

  favoritesButton.addEventListener("click", () => {
    renderFavorites();
    favoritesPanel.hidden = false;
  });

  closeFavoritesButton.addEventListener("click", () => {
    favoritesPanel.hidden = true;
  });

  favoritesList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-favorite]");

    if (!removeButton) {
      return;
    }

    removeFavorite(storage, Number(removeButton.dataset.removeFavorite));
    renderFavorites();
  });

  renderFavorites();
  syncGenerateState();
};
```

3. Extend the `module.exports` block:

```js
if (typeof module !== "undefined") {
  module.exports = {
    buildMovieSearchUrl,
    buildWeatherMoodUrl,
    buildMovieQuery,
    createFavoritePayload,
    getFavorites,
    getPosterUrl,
    removeFavorite,
    renderMovieRecommendation,
    renderWeather,
    saveFavorite,
  };
}
```

- [ ] **Step 4: Run script tests to verify they pass**

Run:

```bash
node --test tests/script.test.cjs
```

Expected: PASS, all script tests pass.

- [ ] **Step 5: Commit**

```bash
git add script.js tests/script.test.cjs
git commit -m "Wire MVP app behavior"
```

## Task 5: Style The MVP Flow

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Update CSS for the new sections**

Replace or extend the current component styles so these selectors exist:

```css
.weather-card,
.mood-section,
.result-section,
.favorites-panel {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 250, 240, 0.86);
  box-shadow: var(--shadow);
  padding: 20px;
}

.secondary-button {
  min-height: 42px;
  border: 1px solid var(--line);
  background: rgba(255, 250, 240, 0.82);
  color: var(--ink);
}

.form-message {
  min-height: 24px;
  margin: 10px 0 0;
  color: var(--coral);
  font-weight: 700;
}

.weather-stats,
.mood-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 22px 0 0;
}

.weather-stats div,
.mood-stats div {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 250, 240, 0.74);
  padding: 12px;
}

.mood-section {
  margin-top: 38px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.mood-option {
  border: 1px solid var(--line);
  background: rgba(255, 250, 240, 0.82);
  color: var(--ink);
}

.mood-option.is-selected {
  border-color: var(--teal);
  background: var(--teal);
  color: white;
}

.generate-button {
  margin-top: 18px;
}

.generate-button:disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.result-section {
  margin-top: 38px;
}

.result-heading,
.favorites-header,
.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.favorites-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 5;
  width: min(420px, calc(100% - 40px));
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.favorites-list {
  display: grid;
  gap: 12px;
}

.favorite-item {
  border-top: 1px solid var(--line);
  padding-top: 12px;
}

.favorite-item h3 {
  margin: 0 0 4px;
}

.favorite-item p,
.empty-state {
  margin: 0;
  color: var(--muted);
}
```

Ensure the existing mobile media query includes:

```css
@media (max-width: 820px) {
  .hero,
  .recommendation {
    grid-template-columns: 1fr;
  }

  .mood-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .weather-stats,
  .mood-stats {
    grid-template-columns: 1fr;
  }

  .result-heading,
  .favorites-header,
  .favorite-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 2: Run all automated tests**

Run:

```bash
node --test tests/*.test.*
```

Expected: PASS, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "Style MVP product flow"
```

## Task 6: Verify Locally And Prepare Deploy

**Files:**
- No required file changes unless verification finds a defect.

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 4173
```

Expected: server starts on `http://localhost:4173`.

- [ ] **Step 2: Open the local page in a browser**

Open:

```text
http://localhost:4173
```

Expected: home view shows city search, weather card, mood picker, Generate button, favorites button, and credits.

- [ ] **Step 3: Verify desktop behavior**

In the browser:

1. Enter `Beijing`.
2. Submit city search.
3. Confirm weather card changes from waiting state to real city/weather data.
4. Choose `Nostalgic`.
5. Confirm Generate becomes enabled.
6. Click Generate.
7. Confirm result section shows a real movie title, overview, release year/rating, and poster when available.
8. Click Save Favorite.
9. Open Favorites and confirm the saved movie appears.

Expected: no console errors and no text overlap.

- [ ] **Step 4: Verify mobile behavior**

Use a 390px wide viewport and repeat:

1. Search a city.
2. Select a mood.
3. Generate a result.
4. Open favorites.

Expected: no horizontal scrolling, no overlapping text, and all controls remain tappable.

- [ ] **Step 5: Final automated verification**

Run:

```bash
node --test tests/*.test.*
git status --short --branch
```

Expected:

```text
all tests pass
git status shows only intentional committed work before push
```

- [ ] **Step 6: Push for Netlify deploy**

Run:

```bash
git push
```

Expected: push succeeds and Netlify starts a deploy.

- [ ] **Step 7: Verify production after deploy**

Open:

```text
https://weather-mood-cinema.netlify.app/
```

Verify:

1. City search works through the deployed `weather-mood` Function.
2. Generate works through the deployed `movie-search` Function.
3. Recommendations vary with weather and mood instead of always using `rain`.
4. Favorites persist after page refresh.

Expected: production behavior matches local verification.

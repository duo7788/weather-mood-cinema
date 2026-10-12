import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMovieDetailUrl,
  buildWeatherByCityUrl,
  buildWeatherByCoordsUrl,
  getMovieDetails,
  getWeatherByCity,
  getWeatherByCoords,
} from "../src/api";

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

test("falls back to curated movie metadata when the local TMDB Function is unavailable", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => new Response("Not found", { status: 404 });

  try {
    const movie = await getMovieDetails(843);

    assert.deepEqual(movie, {
      id: 843,
      title: "In the Mood for Love",
      overview: "",
      posterPath: null,
      releaseDate: "",
      rating: null,
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("falls back to direct reverse geocoding and weather lookup when coordinate Function is unavailable", async () => {
  const originalFetch = global.fetch;
  const requestedUrls: string[] = [];

  global.fetch = async (input) => {
    const url = String(input);
    requestedUrls.push(url);

    if (url.startsWith("/.netlify/functions/weather-mood")) {
      return new Response("<!doctype html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.startsWith("https://nominatim.openstreetmap.org/reverse")) {
      return new Response(
        JSON.stringify({
          display_name: "Shanghai, China",
          address: {
            city: "Shanghai",
            country: "China",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    assert.ok(url.startsWith("https://api.open-meteo.com/v1/forecast"));
    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 20.4,
          weather_code: 61,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const weather = await getWeatherByCoords(31.23, 121.47);

    assert.deepEqual(requestedUrls, [
      "/.netlify/functions/weather-mood?lat=31.23&lng=121.47",
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=31.23&lon=121.47&zoom=10&addressdetails=1&accept-language=en",
      "https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current=temperature_2m%2Cweather_code&timezone=auto",
    ]);
    assert.equal(weather.city, "Shanghai");
    assert.equal(weather.country, "China");
    assert.equal(weather.latitude, 31.23);
    assert.equal(weather.longitude, 121.47);
    assert.equal(weather.temperature, 20);
    assert.equal(weather.weather, "Rain");
    assert.equal(weather.weatherTag, "rainy");
    assert.equal(weather.temperatureTag, "mild");
  } finally {
    global.fetch = originalFetch;
  }
});

test("falls back to direct geocoding and weather lookup when city Function is unavailable", async () => {
  const originalFetch = global.fetch;
  const requestedHosts: string[] = [];

  global.fetch = async (input) => {
    const url = new URL(String(input), "https://local.test");
    requestedHosts.push(url.hostname);

    if (url.pathname === "/.netlify/functions/weather-mood") {
      return new Response("Not found", { status: 404 });
    }

    if (url.hostname === "geocoding-api.open-meteo.com") {
      return new Response(
        JSON.stringify({
          results: [
            {
              name: "Shanghai",
              country: "China",
              latitude: 31.2304,
              longitude: 121.4737,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    assert.equal(url.hostname, "api.open-meteo.com");
    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 26.1,
          weather_code: 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const weather = await getWeatherByCity("Shanghai");

    assert.deepEqual(requestedHosts, [
      "local.test",
      "geocoding-api.open-meteo.com",
      "api.open-meteo.com",
    ]);
    assert.equal(weather.city, "Shanghai");
    assert.equal(weather.country, "China");
    assert.equal(weather.weatherTag, "clear");
    assert.equal(weather.temperatureTag, "warm");
  } finally {
    global.fetch = originalFetch;
  }
});

test('stalled primary weather request switches to direct weather after timeout', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', async input => {
    const url = String(input);
    if (url.startsWith('/')) return new Promise<Response>(() => {});
    if (url.includes('nominatim')) return new Response(JSON.stringify({ address: { city: 'Shanghai' } }));
    return new Response(JSON.stringify({ current: { temperature_2m: 18, weather_code: 3 } }));
  });
  const result = getWeatherByCoords(31.23, 121.47);
  t.mock.timers.tick(10000);
  const weather = await result;
  assert.equal(weather.city, 'Shanghai');
  assert.equal(weather.temperature, 18);
});

test('all weather services stalled eventually reject so the UI can leave loading', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', () => new Promise<Response>(() => {}));
  const checked = assert.rejects(getWeatherByCoords(31.23, 121.47), /timed out/);
  t.mock.timers.tick(10000);
  for (let i = 0; i < 20; i++) await Promise.resolve();
  t.mock.timers.tick(8000);
  await checked;
});

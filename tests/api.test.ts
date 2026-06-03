import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMovieDetailUrl,
  buildWeatherByCityUrl,
  buildWeatherByCoordsUrl,
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

test("falls back to direct Open-Meteo lookup when coordinate Function is unavailable", async () => {
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
      "https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current=temperature_2m%2Cweather_code&timezone=auto",
    ]);
    assert.equal(weather.city, "Selected location");
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

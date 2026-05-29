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

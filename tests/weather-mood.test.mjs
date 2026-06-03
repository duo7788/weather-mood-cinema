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

test("looks up weather by latitude and longitude", async () => {
  const originalFetch = global.fetch;
  const requestedUrls = [];

  global.fetch = async (url) => {
    const requestUrl = new URL(String(url));
    requestedUrls.push(requestUrl);

    if (requestUrl.hostname === "nominatim.openstreetmap.org") {
      assert.equal(requestUrl.searchParams.get("lat"), "31.23");
      assert.equal(requestUrl.searchParams.get("lon"), "121.47");

      return new Response(
        JSON.stringify({
          display_name: "Shanghai, China",
          address: {
            city: "Shanghai",
            country: "China",
          },
        }),
        { status: 200 },
      );
    }

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
    const response = await handler(
      new Request("https://example.com/.netlify/functions/weather-mood?lat=31.23&lng=121.47"),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(
      requestedUrls.map((url) => url.hostname),
      ["nominatim.openstreetmap.org", "api.open-meteo.com"],
    );
    assert.equal(body.city, "Shanghai");
    assert.equal(body.country, "China");
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

test("requires either city or coordinates", async () => {
  const response = await handler(
    new Request("https://weather-mood-cinema.netlify.app/.netlify/functions/weather-mood"),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await readJson(response), {
    error: "City or coordinates are required",
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

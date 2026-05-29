const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const weatherCodeGroups = [
  {
    codes: new Set([0, 1]),
    weather: "Clear sky",
    weatherTag: "clear",
    description: "bright, open texture",
  },
  {
    codes: new Set([2, 3]),
    weather: "Cloudy",
    weatherTag: "cloudy",
    description: "soft, reflective texture",
  },
  {
    codes: new Set([45, 48]),
    weather: "Fog",
    weatherTag: "foggy",
    description: "mysterious, softened texture",
  },
  {
    codes: new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]),
    weather: "Rain",
    weatherTag: "rainy",
    description: "intimate, rain-washed texture",
  },
  {
    codes: new Set([71, 73, 75, 77, 85, 86]),
    weather: "Snow",
    weatherTag: "snowy",
    description: "quiet, wintry texture",
  },
  {
    codes: new Set([95, 96, 99]),
    weather: "Thunderstorm",
    weatherTag: "stormy",
    description: "charged, high-pressure texture",
  },
];

export const getWeatherTag = (weatherCode) => {
  const group = weatherCodeGroups.find((item) => item.codes.has(weatherCode));

  if (!group) {
    return {
      weather: "Changing weather",
      weatherTag: "cloudy",
    };
  }

  return {
    weather: group.weather,
    weatherTag: group.weatherTag,
  };
};

export const getTemperatureTag = (temperature) => {
  if (temperature <= 5) {
    return "cold";
  }

  if (temperature <= 15) {
    return "cool";
  }

  if (temperature <= 23) {
    return "mild";
  }

  if (temperature <= 30) {
    return "warm";
  }

  return "hot";
};

const getWeatherDescription = (weatherCode) => {
  const group = weatherCodeGroups.find((item) => item.codes.has(weatherCode));
  return group?.description || "changing, atmospheric texture";
};

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
    const weather = getWeatherTag(weatherCode);

    return jsonResponse(200, {
      city: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      temperature,
      weather: weather.weather,
      weatherCode,
      weatherTag: weather.weatherTag,
      temperatureTag: getTemperatureTag(temperature),
      description: `${weather.weather} in ${location.name} gives the day a ${getWeatherDescription(weatherCode)}.`,
    });
  } catch (error) {
    return jsonResponse(502, {
      error: "Weather lookup failed",
    });
  }
};

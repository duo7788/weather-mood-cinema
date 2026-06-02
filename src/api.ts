import { WeatherData, MovieRecommendation } from "./types";
import type { TemperatureTag, WeatherTag } from "./movie-library";

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const getWeatherTag = (weatherCode: number): WeatherTag => {
  if ([0, 1].includes(weatherCode)) return "clear";
  if ([2, 3].includes(weatherCode)) return "cloudy";
  if ([45, 48].includes(weatherCode)) return "foggy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "rainy";
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "snowy";
  if ([95, 96, 99].includes(weatherCode)) return "stormy";
  return "cloudy";
};

const getTemperatureTag = (temperature: number): TemperatureTag => {
  if (temperature <= 5) return "cold";
  if (temperature <= 15) return "cool";
  if (temperature <= 23) return "mild";
  if (temperature <= 30) return "warm";
  return "hot";
};

export async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://api-bdc.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "Unknown Location";
  } catch (err) {
    console.error("Geocoding failed", err);
    return "Unknown Location";
  }
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    const data = await res.json();
    const current = data.current_weather;
    const condition = WEATHER_CODES[current.weathercode as number] || "Unknown";
    return {
      city: "Selected location",
      latitude: lat,
      longitude: lng,
      temperature: current.temperature,
      weather: condition,
      weatherCode: current.weathercode,
      weatherTag: getWeatherTag(current.weathercode),
      temperatureTag: getTemperatureTag(current.temperature),
      description: `${condition} at the selected coordinate.`,
      condition,
    };
  } catch (err) {
    console.error("Weather fetch failed", err);
    return null;
  }
}

export async function fetchRecommendations(locationName: string, weather: string, mood: string): Promise<MovieRecommendation[]> {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: locationName, weather, mood })
  });

  if (!res.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return await res.json();
}

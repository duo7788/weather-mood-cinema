import type { TmdbMovie, WeatherData } from "./types";

type WeatherTag = WeatherData["weatherTag"];
type TemperatureTag = WeatherData["temperatureTag"];

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

const getWeatherTag = (weatherCode: number): { weather: string; weatherTag: WeatherTag } => {
  if ([0, 1].includes(weatherCode)) return { weather: "Clear sky", weatherTag: "clear" };
  if ([2, 3].includes(weatherCode)) return { weather: "Cloudy", weatherTag: "cloudy" };
  if ([45, 48].includes(weatherCode)) return { weather: "Fog", weatherTag: "foggy" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return { weather: "Rain", weatherTag: "rainy" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return { weather: "Snow", weatherTag: "snowy" };
  }
  if ([95, 96, 99].includes(weatherCode)) {
    return { weather: "Thunderstorm", weatherTag: "stormy" };
  }
  return { weather: "Changing weather", weatherTag: "cloudy" };
};

const getTemperatureTag = (temperature: number): TemperatureTag => {
  if (temperature <= 5) return "cold";
  if (temperature <= 15) return "cool";
  if (temperature <= 23) return "mild";
  if (temperature <= 30) return "warm";
  return "hot";
};

const buildOpenMeteoForecastUrl = (lat: number, lng: number) => {
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(lat));
  forecastUrl.searchParams.set("longitude", String(lng));
  forecastUrl.searchParams.set("current", "temperature_2m,weather_code");
  forecastUrl.searchParams.set("timezone", "auto");
  return forecastUrl.toString();
};

const buildOpenMeteoGeocodingUrl = (city: string) => {
  const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodingUrl.searchParams.set("name", city);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");
  return geocodingUrl.toString();
};

const createWeatherData = ({
  city,
  country,
  latitude,
  longitude,
  temperature,
  weatherCode,
}: {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  weatherCode: number;
}): WeatherData => {
  const weather = getWeatherTag(weatherCode);
  const roundedTemperature = Math.round(temperature);

  return {
    city,
    country,
    latitude,
    longitude,
    temperature: roundedTemperature,
    weather: weather.weather,
    weatherCode,
    weatherTag: weather.weatherTag,
    temperatureTag: getTemperatureTag(roundedTemperature),
    description: `${weather.weather} in ${city} gives the day a cinematic texture.`,
  };
};

const getDirectWeatherByCoords = async (
  lat: number,
  lng: number,
  city = "Selected location",
  country?: string,
) => {
  const forecast = await fetchJson<{ current: { temperature_2m: number; weather_code: number } }>(
    buildOpenMeteoForecastUrl(lat, lng),
  );

  return createWeatherData({
    city,
    country,
    latitude: lat,
    longitude: lng,
    temperature: forecast.current.temperature_2m,
    weatherCode: forecast.current.weather_code,
  });
};

export const getWeatherByCoords = async (lat: number, lng: number) => {
  try {
    return await fetchJson<WeatherData>(buildWeatherByCoordsUrl(lat, lng));
  } catch {
    return getDirectWeatherByCoords(lat, lng);
  }
};

export const getWeatherByCity = async (city: string) => {
  try {
    return await fetchJson<WeatherData>(buildWeatherByCityUrl(city));
  } catch {
    const geocoding = await fetchJson<{
      results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
    }>(buildOpenMeteoGeocodingUrl(city));
    const location = geocoding.results?.[0];

    if (!location) {
      throw new Error("City not found");
    }

    return getDirectWeatherByCoords(
      location.latitude,
      location.longitude,
      location.name,
      location.country,
    );
  }
};

export const getMovieDetails = async (movieId: number) => {
  const data = await fetchJson<{ movie: TmdbMovie }>(buildMovieDetailUrl(movieId));
  return data.movie;
};

export const getPosterUrl = (posterPath: string | null, size = "w342") =>
  posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : "";

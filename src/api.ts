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

export const getWeatherByCity = (city: string) => fetchJson<WeatherData>(buildWeatherByCityUrl(city));

export const getMovieDetails = async (movieId: number) => {
  const data = await fetchJson<{ movie: TmdbMovie }>(buildMovieDetailUrl(movieId));
  return data.movie;
};

export const getPosterUrl = (posterPath: string | null, size = "w342") =>
  posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : "";

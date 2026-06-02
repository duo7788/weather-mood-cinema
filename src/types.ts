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
  condition?: string;
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

export interface MovieRecommendation extends Partial<TmdbMovie> {
  title: string;
  score?: number;
  mood?: MoodTag;
  weather?: WeatherData;
  director?: string;
  year?: string;
  description?: string;
  reason?: string;
  posterPrompt?: string;
}

export interface SavedMovie {
  id: number | string;
  title: string;
  overview?: string;
  posterPath?: string | null;
  releaseDate?: string;
  rating?: number | null;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  weather?: string;
  weatherTag?: WeatherTag;
  temperatureTag?: TemperatureTag;
  mood?: MoodTag | string;
  score?: number;
  savedAt: number;
  director?: string;
  year?: string;
  description?: string;
  reason?: string;
  posterPrompt?: string;
  savedLocation?: string;
  savedWeather?: string;
  savedMood?: string;
}

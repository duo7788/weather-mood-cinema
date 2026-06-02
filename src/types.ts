export interface LocationState {
  lat: number;
  lng: number;
  name: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
}

export interface MovieRecommendation {
  title: string;
  director: string;
  year: string;
  description: string;
  reason: string;
  posterPrompt?: string;
}

export interface SavedMovie extends MovieRecommendation {
  id: string;
  savedLocation: string;
  savedWeather: string;
  savedMood: string;
  savedAt: number;
}

import type {
  AtmosphereTag,
  CuratedMovie,
  MoodTag,
  TemperatureTag,
  WeatherTag,
} from "./movie-library";

const TEMPERATURE_ORDER: TemperatureTag[] = ["cold", "cool", "mild", "warm", "hot"];

export interface RecommendationPreferences {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  moodTag: MoodTag;
  atmosphereTags: AtmosphereTag[];
}

export interface WeatherMoodSeed {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  moodTag: MoodTag;
}

export interface ScoredCandidate {
  movie: CuratedMovie;
  score: number;
}

export const getAdjacentTemperatureTags = (temperatureTag: TemperatureTag): TemperatureTag[] => {
  const index = TEMPERATURE_ORDER.indexOf(temperatureTag);

  if (index === -1) {
    return [];
  }

  return TEMPERATURE_ORDER.filter((_, itemIndex) => Math.abs(itemIndex - index) === 1);
};

export const deriveAtmosphereTags = (
  library: CuratedMovie[],
  weatherTag: WeatherTag,
  temperatureTag: TemperatureTag,
  limit = 3,
): AtmosphereTag[] => {
  const counts = new Map<AtmosphereTag, number>();

  library
    .filter(
      (movie) =>
        movie.weatherTags.includes(weatherTag) || movie.temperatureTags.includes(temperatureTag),
    )
    .forEach((movie) => {
      movie.atmosphereTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

export const scoreMovie = (movie: CuratedMovie, preferences: RecommendationPreferences) => {
  let score = 0;

  if (movie.weatherTags.includes(preferences.weatherTag)) {
    score += 4;
  }

  if (movie.moodTags.includes(preferences.moodTag)) {
    score += 4;
  }

  if (movie.temperatureTags.includes(preferences.temperatureTag)) {
    score += 2;
  } else if (
    getAdjacentTemperatureTags(preferences.temperatureTag).some((tag) =>
      movie.temperatureTags.includes(tag),
    )
  ) {
    score += 1;
  }

  preferences.atmosphereTags.forEach((tag) => {
    if (movie.atmosphereTags.includes(tag)) {
      score += 1;
    }
  });

  return score;
};

export const createScoredCandidates = (
  library: CuratedMovie[],
  seed: WeatherMoodSeed,
): ScoredCandidate[] => {
  const atmosphereTags = deriveAtmosphereTags(library, seed.weatherTag, seed.temperatureTag);
  const preferences: RecommendationPreferences = {
    ...seed,
    atmosphereTags,
  };

  return library.map((movie) => ({
    movie,
    score: scoreMovie(movie, preferences),
  }));
};

export const pickTopCandidate = (
  candidates: ScoredCandidate[],
  random = Math.random,
  poolSize = 5,
): ScoredCandidate => {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const pool = sorted.filter((item) => item.score > 0).slice(0, poolSize);
  const candidatesToUse = pool.length > 0 ? pool : sorted.slice(0, poolSize);

  return candidatesToUse[Math.floor(random() * candidatesToUse.length)];
};

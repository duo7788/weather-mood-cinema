import type { MoodTag, TemperatureTag, WeatherTag } from "./movie-library";

export const formatRecommendationSummary = ({
  weatherTag,
  temperatureTag,
  mood,
}: {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  mood: MoodTag;
}) => `Weather ${weatherTag}. Temperature ${temperatureTag}. Mood ${mood}.`;

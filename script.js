const MOVIE_QUERY = "rain";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const TEMPERATURE_ORDER = ["cold", "cool", "mild", "warm", "hot"];

const buildMovieSearchUrl = (query) =>
  `/.netlify/functions/movie-search?query=${encodeURIComponent(query)}`;

const getAdjacentTemperatureTags = (temperatureTag) => {
  const index = TEMPERATURE_ORDER.indexOf(temperatureTag);

  if (index === -1) {
    return [];
  }

  return TEMPERATURE_ORDER.filter((_, itemIndex) => Math.abs(itemIndex - index) === 1);
};

const deriveAtmosphereTags = (library, weatherTag, temperatureTag, limit = 3) => {
  const counts = new Map();

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

const scoreMovie = (movie, preferences) => {
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

const pickTopCandidate = (candidates, random = Math.random, poolSize = 5) => {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const pool = sorted.filter((item) => item.score > 0).slice(0, poolSize);
  const candidatesToUse = pool.length > 0 ? pool : sorted.slice(0, poolSize);

  return candidatesToUse[Math.floor(random() * candidatesToUse.length)];
};

const getPosterUrl = (posterPath) => (posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : "");

const formatPickValue = (movie) => {
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "Film";
  const rating = Number.isFinite(movie.rating) ? movie.rating.toFixed(1) : "NR";

  return `${year} | ${rating}`;
};

const renderMovieRecommendation = (elements, movie) => {
  elements.movieTitle.textContent = movie.title || "Weather Mood Pick";
  elements.movieOverview.textContent = movie.overview || "A film that fits today's weather mood.";
  elements.pickValue.textContent = formatPickValue(movie);

  const posterUrl = getPosterUrl(movie.posterPath);

  if (posterUrl) {
    elements.posterImage.src = posterUrl;
    elements.posterImage.alt = `Poster for ${elements.movieTitle.textContent}`;
    elements.posterImage.hidden = false;
    elements.posterLabel.hidden = true;
  } else {
    elements.posterImage.hidden = true;
    elements.posterLabel.hidden = false;
    elements.posterLabel.textContent = "Cinema";
  }
};

const renderError = (elements) => {
  elements.movieTitle.textContent = "The projector needs a minute";
  elements.movieOverview.textContent =
    "Movie data did not load. Try again, or enjoy the rainy drama mood for now.";
  elements.pickValue.textContent = "Try again";
};

const setLoading = (button, isLoading) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Finding..." : "Preview Mood";
};

const initWeatherMoodCinema = (doc = document) => {
  const form = doc.querySelector(".city-form");
  const cityInput = doc.querySelector("#city");
  const previewCity = doc.querySelector("#preview-city");
  const button = doc.querySelector(".city-form button");
  const elements = {
    movieTitle: doc.querySelector("#movie-title"),
    movieOverview: doc.querySelector("#movie-overview"),
    pickValue: doc.querySelector("#pick-value"),
    posterImage: doc.querySelector("#movie-poster"),
    posterLabel: doc.querySelector("#poster-label"),
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();
    previewCity.textContent = city || "Your city";
    setLoading(button, true);

    try {
      const response = await fetch(buildMovieSearchUrl(MOVIE_QUERY));

      if (!response.ok) {
        throw new Error("Movie search failed");
      }

      const data = await response.json();
      const movie = data.results?.[0];

      if (!movie) {
        throw new Error("No movies returned");
      }

      renderMovieRecommendation(elements, movie);
    } catch (error) {
      renderError(elements);
    } finally {
      setLoading(button, false);
    }
  });
};

if (typeof document !== "undefined") {
  initWeatherMoodCinema();
}

if (typeof module !== "undefined") {
  module.exports = {
    buildMovieSearchUrl,
    deriveAtmosphereTags,
    getAdjacentTemperatureTags,
    getPosterUrl,
    pickTopCandidate,
    renderMovieRecommendation,
    scoreMovie,
  };
}

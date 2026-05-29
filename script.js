const MOVIE_QUERY = "rain";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

const buildMovieSearchUrl = (query) =>
  `/.netlify/functions/movie-search?query=${encodeURIComponent(query)}`;

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
    getPosterUrl,
    renderMovieRecommendation,
  };
}

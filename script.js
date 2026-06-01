const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const FAVORITES_STORAGE_KEY = "weatherMoodCinemaFavorites";
const TEMPERATURE_ORDER = ["cold", "cool", "mild", "warm", "hot"];

const getDefaultMovieLibrary = () => {
  if (typeof module !== "undefined" && typeof require !== "undefined") {
    return require("./movie-library.js").MOVIE_LIBRARY;
  }

  return globalThis.MOVIE_LIBRARY || [];
};

const buildMovieSearchUrl = (query) =>
  `/.netlify/functions/movie-search?query=${encodeURIComponent(query)}`;

const buildWeatherMoodUrl = (city) =>
  `/.netlify/functions/weather-mood?city=${encodeURIComponent(city)}`;

const buildMovieDetailUrl = (movieId) =>
  `/.netlify/functions/movie-search?id=${encodeURIComponent(movieId)}`;

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

const createFavoritePayload = (movie, weatherState, selectedMood, score) => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.posterPath,
  releaseDate: movie.releaseDate,
  rating: movie.rating,
  city: weatherState.city,
  weather: weatherState.weather,
  weatherTag: weatherState.weatherTag,
  temperatureTag: weatherState.temperatureTag,
  mood: selectedMood,
  score,
});

const getFavorites = (storage = localStorage) => {
  try {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const setFavorites = (storage, favorites) => {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
};

const saveFavorite = (storage = localStorage, favorite) => {
  const favorites = getFavorites(storage);

  if (favorites.some((item) => item.id === favorite.id)) {
    return favorites;
  }

  return setFavorites(storage, [favorite, ...favorites]);
};

const removeFavorite = (storage = localStorage, movieId) => {
  const favorites = getFavorites(storage).filter((item) => item.id !== movieId);
  return setFavorites(storage, favorites);
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

const renderWeather = (elements, weatherState) => {
  elements.weatherCity.textContent = `${weatherState.city}, ${weatherState.country}`;
  elements.weatherDescription.textContent = weatherState.description;
  elements.temperatureValue.textContent = `${weatherState.temperature}°C`;
  elements.weatherValue.textContent = weatherState.weather;
  elements.weatherMoodValue.textContent = weatherState.weatherTag;
};

const createScoredCandidates = (library, weatherState, selectedMood) => {
  const atmosphereTags = deriveAtmosphereTags(
    library,
    weatherState.weatherTag,
    weatherState.temperatureTag,
  );
  const preferences = {
    weatherTag: weatherState.weatherTag,
    temperatureTag: weatherState.temperatureTag,
    moodTag: selectedMood,
    atmosphereTags,
  };

  return library.map((movie) => ({
    movie,
    score: scoreMovie(movie, preferences),
  }));
};

const setButtonLoading = (button, isLoading, idleText, loadingText) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
};

const selectMapLocation = (buttons, selectedButton, cityInput) => {
  cityInput.value = selectedButton.dataset.city;

  buttons.forEach((button) => {
    const isSelected = button === selectedButton;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const initWeatherMoodCinema = (
  doc = document,
  storage = localStorage,
  movieLibrary = getDefaultMovieLibrary(),
) => {
  const cityForm = doc.querySelector(".city-form");
  const cityInput = doc.querySelector("#city");
  const weatherButton = doc.querySelector("#weather-button");
  const weatherError = doc.querySelector("#weather-error");
  const generateButton = doc.querySelector("#generate-button");
  const generateError = doc.querySelector("#generate-error");
  const resultSection = doc.querySelector("#result-section");
  const backButton = doc.querySelector("#back-button");
  const saveFavoriteButton = doc.querySelector("#save-favorite-button");
  const favoritesButton = doc.querySelector("#favorites-button");
  const favoritesCount = doc.querySelector("#favorites-count");
  const favoritesPanel = doc.querySelector("#favorites-panel");
  const closeFavoritesButton = doc.querySelector("#close-favorites-button");
  const favoritesList = doc.querySelector("#favorites-list");
  const mapLocationButtons = Array.from(doc.querySelectorAll(".map-point"));
  const state = {
    currentMovie: null,
    currentScore: 0,
    selectedMood: "",
    weather: null,
  };
  const weatherElements = {
    weatherCity: doc.querySelector("#weather-city"),
    weatherDescription: doc.querySelector("#weather-description"),
    temperatureValue: doc.querySelector("#temperature-value"),
    weatherValue: doc.querySelector("#weather-value"),
    weatherMoodValue: doc.querySelector("#weather-mood-value"),
  };
  const movieElements = {
    movieTitle: doc.querySelector("#movie-title"),
    movieOverview: doc.querySelector("#movie-overview"),
    pickValue: doc.querySelector("#pick-value"),
    posterImage: doc.querySelector("#movie-poster"),
    posterLabel: doc.querySelector("#poster-label"),
  };

  if (!cityForm || !generateButton || !movieLibrary.length) {
    return;
  }

  const syncGenerateState = () => {
    generateButton.disabled = !(state.weather && state.selectedMood);
  };

  const renderFavorites = () => {
    const favorites = getFavorites(storage);
    favoritesCount.textContent = String(favorites.length);

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="empty-state">No saved movies yet.</p>';
      return;
    }

    favoritesList.innerHTML = favorites
      .map(
        (favorite) => `
          <article class="favorite-item">
            <div>
              <h3>${escapeHtml(favorite.title)}</h3>
              <p>${escapeHtml(favorite.city)} · ${escapeHtml(favorite.weather)} · ${escapeHtml(favorite.mood)}</p>
            </div>
            <button type="button" data-remove-favorite="${favorite.id}">Remove</button>
          </article>
        `,
      )
      .join("");
  };

  cityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    weatherError.textContent = "";
    const city = cityInput.value.trim();

    if (!city) {
      weatherError.textContent = "Enter a city first.";
      return;
    }

    setButtonLoading(weatherButton, true, "Check Weather", "Checking...");

    try {
      const response = await fetch(buildWeatherMoodUrl(city));

      if (!response.ok) {
        throw new Error("Weather lookup failed");
      }

      state.weather = await response.json();
      renderWeather(weatherElements, state.weather);
    } catch (error) {
      weatherError.textContent = "Weather did not load. Try another city.";
    } finally {
      setButtonLoading(weatherButton, false, "Check Weather", "Checking...");
      syncGenerateState();
    }
  });

  doc.querySelectorAll(".mood-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMood = button.dataset.mood;
      doc.querySelectorAll(".mood-option").forEach((option) => {
        option.classList.toggle("is-selected", option === button);
        option.setAttribute("aria-pressed", String(option === button));
      });
      syncGenerateState();
    });
  });

  mapLocationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectMapLocation(mapLocationButtons, button, cityInput);
      weatherError.textContent = "";
    });
  });

  generateButton.addEventListener("click", async () => {
    if (!state.weather || !state.selectedMood) {
      generateError.textContent = "Choose a city and mood first.";
      return;
    }

    generateError.textContent = "";
    setButtonLoading(generateButton, true, "Generate", "Finding...");

    try {
      const candidates = createScoredCandidates(movieLibrary, state.weather, state.selectedMood);
      const selected = pickTopCandidate(candidates);
      const response = await fetch(buildMovieDetailUrl(selected.movie.tmdbId));

      if (!response.ok) {
        throw new Error("Movie detail lookup failed");
      }

      const data = await response.json();
      const movie = data.movie;

      state.currentMovie = movie;
      state.currentScore = selected.score;
      doc.querySelector("#preview-city").textContent = state.weather.city;
      doc.querySelector("#result-weather-value").textContent = state.weather.weather;
      doc.querySelector("#result-mood-value").textContent = state.selectedMood;
      renderMovieRecommendation(movieElements, movie);
      saveFavoriteButton.disabled = false;
      saveFavoriteButton.textContent = "Save Favorite";
      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      generateError.textContent = "Movie data did not load. Try a different mood.";
    } finally {
      setButtonLoading(generateButton, false, "Generate", "Finding...");
      syncGenerateState();
    }
  });

  saveFavoriteButton.addEventListener("click", () => {
    if (!state.currentMovie || !state.weather || !state.selectedMood) {
      return;
    }

    saveFavorite(
      storage,
      createFavoritePayload(state.currentMovie, state.weather, state.selectedMood, state.currentScore),
    );
    renderFavorites();
    saveFavoriteButton.textContent = "Saved";
  });

  backButton.addEventListener("click", () => {
    resultSection.hidden = true;
  });

  favoritesButton.addEventListener("click", () => {
    renderFavorites();
    favoritesPanel.hidden = false;
  });

  closeFavoritesButton.addEventListener("click", () => {
    favoritesPanel.hidden = true;
  });

  favoritesList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-favorite]");

    if (!removeButton) {
      return;
    }

    removeFavorite(storage, Number(removeButton.dataset.removeFavorite));
    renderFavorites();
  });

  renderFavorites();
  syncGenerateState();
};

if (typeof document !== "undefined") {
  initWeatherMoodCinema();
}

if (typeof module !== "undefined") {
  module.exports = {
    buildMovieDetailUrl,
    buildMovieSearchUrl,
    buildWeatherMoodUrl,
    createFavoritePayload,
    createScoredCandidates,
    deriveAtmosphereTags,
    getAdjacentTemperatureTags,
    getFavorites,
    getPosterUrl,
    pickTopCandidate,
    removeFavorite,
    renderMovieRecommendation,
    renderWeather,
    saveFavorite,
    selectMapLocation,
    scoreMovie,
  };
}

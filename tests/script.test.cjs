const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildMovieDetailUrl,
  buildMovieSearchUrl,
  buildWeatherMoodUrl,
  createFavoritePayload,
  deriveAtmosphereTags,
  getAdjacentTemperatureTags,
  getFavorites,
  getPosterUrl,
  pickTopCandidate,
  removeFavorite,
  renderMovieRecommendation,
  saveFavorite,
  selectMapLocation,
  scoreMovie,
} = require("../script.js");

test("builds the Netlify Function URL with an encoded query", () => {
  assert.equal(
    buildMovieSearchUrl("rainy drama"),
    "/.netlify/functions/movie-search?query=rainy%20drama",
  );
});

test("builds the weather Function URL with an encoded city", () => {
  assert.equal(
    buildWeatherMoodUrl("New York"),
    "/.netlify/functions/weather-mood?city=New%20York",
  );
});

test("builds the TMDB detail proxy URL from an id", () => {
  assert.equal(buildMovieDetailUrl(843), "/.netlify/functions/movie-search?id=843");
});

test("builds a TMDB poster URL when a poster path is present", () => {
  assert.equal(
    getPosterUrl("/rain-town.jpg"),
    "https://image.tmdb.org/t/p/w342/rain-town.jpg",
  );
  assert.equal(getPosterUrl(null), "");
});

test("renders a movie recommendation into the provided elements", () => {
  const elements = {
    movieTitle: { textContent: "" },
    movieOverview: { textContent: "" },
    pickValue: { textContent: "" },
    posterImage: { src: "", alt: "", hidden: true },
    posterLabel: { textContent: "", hidden: false },
  };

  renderMovieRecommendation(elements, {
    title: "Rain Town",
    overview: "A quiet story for a rainy day.",
    posterPath: "/rain-town.jpg",
    releaseDate: "2024-02-14",
    rating: 7.6,
  });

  assert.equal(elements.movieTitle.textContent, "Rain Town");
  assert.equal(elements.movieOverview.textContent, "A quiet story for a rainy day.");
  assert.equal(elements.pickValue.textContent, "2024 | 7.6");
  assert.equal(elements.posterImage.hidden, false);
  assert.equal(elements.posterImage.src, "https://image.tmdb.org/t/p/w342/rain-town.jpg");
  assert.equal(elements.posterImage.alt, "Poster for Rain Town");
  assert.equal(elements.posterLabel.hidden, true);
});

test("finds adjacent temperature tags", () => {
  assert.deepEqual(getAdjacentTemperatureTags("cold"), ["cool"]);
  assert.deepEqual(getAdjacentTemperatureTags("mild"), ["cool", "warm"]);
  assert.deepEqual(getAdjacentTemperatureTags("hot"), ["warm"]);
});

test("derives atmosphere preferences from matching library movies", () => {
  const library = [
    {
      weatherTags: ["rainy"],
      temperatureTags: ["cool"],
      atmosphereTags: ["urban", "interior", "noir"],
    },
    {
      weatherTags: ["rainy"],
      temperatureTags: ["mild"],
      atmosphereTags: ["urban", "intimate"],
    },
    {
      weatherTags: ["clear"],
      temperatureTags: ["cool"],
      atmosphereTags: ["road", "urban"],
    },
  ];

  assert.deepEqual(deriveAtmosphereTags(library, "rainy", "cool"), [
    "urban",
    "interior",
    "noir",
  ]);
});

test("scores movies with weather, mood, temperature, adjacent temperature, and atmosphere", () => {
  const movie = {
    weatherTags: ["rainy"],
    temperatureTags: ["cool"],
    moodTags: ["sad"],
    atmosphereTags: ["urban", "noir"],
  };

  assert.equal(
    scoreMovie(movie, {
      weatherTag: "rainy",
      temperatureTag: "cold",
      moodTag: "sad",
      atmosphereTags: ["urban", "interior", "noir"],
    }),
    11,
  );
});

test("picks from the highest scoring candidate pool", () => {
  const candidates = [
    { movie: { title: "A" }, score: 9 },
    { movie: { title: "B" }, score: 8 },
    { movie: { title: "C" }, score: 1 },
  ];

  const picked = pickTopCandidate(candidates, () => 0.99, 2);
  assert.equal(picked.movie.title, "B");
});

test("creates a favorite payload with weather, mood, and score context", () => {
  assert.deepEqual(
    createFavoritePayload(
      {
        id: 843,
        title: "In the Mood for Love",
        overview: "A quiet story.",
        posterPath: "/poster.jpg",
        releaseDate: "2000-09-29",
        rating: 8.1,
      },
      {
        city: "Beijing",
        weather: "Clear sky",
        weatherTag: "clear",
        temperatureTag: "mild",
      },
      "nostalgic",
      10,
    ),
    {
      id: 843,
      title: "In the Mood for Love",
      overview: "A quiet story.",
      posterPath: "/poster.jpg",
      releaseDate: "2000-09-29",
      rating: 8.1,
      city: "Beijing",
      weather: "Clear sky",
      weatherTag: "clear",
      temperatureTag: "mild",
      mood: "nostalgic",
      score: 10,
    },
  );
});

test("stores favorites without duplicates and removes them by id", () => {
  const storage = {
    value: null,
    getItem(key) {
      assert.equal(key, "weatherMoodCinemaFavorites");
      return this.value;
    },
    setItem(key, value) {
      assert.equal(key, "weatherMoodCinemaFavorites");
      this.value = value;
    },
  };
  const favorite = {
    id: 843,
    title: "In the Mood for Love",
    overview: "A quiet story.",
    posterPath: "/poster.jpg",
    releaseDate: "2000-09-29",
    rating: 8.1,
    city: "Beijing",
    weather: "Clear sky",
    weatherTag: "clear",
    temperatureTag: "mild",
    mood: "nostalgic",
    score: 10,
  };

  assert.deepEqual(getFavorites(storage), []);
  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(saveFavorite(storage, favorite), [favorite]);
  assert.deepEqual(removeFavorite(storage, 843), []);
});

test("selects a map location into the city input and active state", () => {
  const cityInput = { value: "" };
  const buttons = [
    {
      dataset: { city: "Shanghai" },
      classList: {
        selected: false,
        toggle(name, enabled) {
          assert.equal(name, "is-selected");
          this.selected = enabled;
        },
      },
      setAttribute(name, value) {
        this[name] = value;
      },
    },
    {
      dataset: { city: "Paris" },
      classList: {
        selected: false,
        toggle(name, enabled) {
          assert.equal(name, "is-selected");
          this.selected = enabled;
        },
      },
      setAttribute(name, value) {
        this[name] = value;
      },
    },
  ];

  selectMapLocation(buttons, buttons[1], cityInput);

  assert.equal(cityInput.value, "Paris");
  assert.equal(buttons[0].classList.selected, false);
  assert.equal(buttons[0]["aria-pressed"], "false");
  assert.equal(buttons[1].classList.selected, true);
  assert.equal(buttons[1]["aria-pressed"], "true");
});

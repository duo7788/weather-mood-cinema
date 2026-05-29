const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildMovieSearchUrl,
  deriveAtmosphereTags,
  getAdjacentTemperatureTags,
  getPosterUrl,
  pickTopCandidate,
  renderMovieRecommendation,
  scoreMovie,
} = require("../script.js");

test("builds the Netlify Function URL with an encoded query", () => {
  assert.equal(
    buildMovieSearchUrl("rainy drama"),
    "/.netlify/functions/movie-search?query=rainy%20drama",
  );
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

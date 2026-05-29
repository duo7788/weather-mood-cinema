const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildMovieSearchUrl,
  getPosterUrl,
  renderMovieRecommendation,
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

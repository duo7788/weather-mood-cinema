const assert = require("node:assert/strict");
const test = require("node:test");

const { handler } = require("./movie-search.js");

test("returns a clear error when TMDB_API_KEY is missing", async () => {
  const originalKey = process.env.TMDB_API_KEY;
  delete process.env.TMDB_API_KEY;

  const response = await handler({
    queryStringParameters: {
      query: "rain",
    },
  });

  if (originalKey) {
    process.env.TMDB_API_KEY = originalKey;
  }

  assert.equal(response.statusCode, 500);
  assert.deepEqual(JSON.parse(response.body), {
    error: "Missing TMDB_API_KEY",
  });
});

test("searches TMDB with the query and returns normalized movie results", async () => {
  const originalKey = process.env.TMDB_API_KEY;
  const originalFetch = global.fetch;

  process.env.TMDB_API_KEY = "test-key";
  let requestedUrl;

  global.fetch = async (url) => {
    requestedUrl = new URL(url);

    return {
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 123,
            title: "Rain Town",
            overview: "A quiet story for a rainy day.",
            poster_path: "/rain-town.jpg",
            release_date: "2024-02-14",
            vote_average: 7.6,
          },
        ],
      }),
    };
  };

  const response = await handler({
    queryStringParameters: {
      query: "rainy drama",
    },
  });

  process.env.TMDB_API_KEY = originalKey;
  global.fetch = originalFetch;

  assert.equal(response.statusCode, 200);
  assert.equal(requestedUrl.origin, "https://api.themoviedb.org");
  assert.equal(requestedUrl.pathname, "/3/search/movie");
  assert.equal(requestedUrl.searchParams.get("api_key"), "test-key");
  assert.equal(requestedUrl.searchParams.get("query"), "rainy drama");
  assert.equal(requestedUrl.searchParams.get("include_adult"), "false");

  assert.deepEqual(JSON.parse(response.body), {
    results: [
      {
        id: 123,
        title: "Rain Town",
        overview: "A quiet story for a rainy day.",
        posterPath: "/rain-town.jpg",
        releaseDate: "2024-02-14",
        rating: 7.6,
      },
    ],
  });
});

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const normalizeMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.poster_path,
  releaseDate: movie.release_date,
  rating: movie.vote_average,
});

exports.handler = async (event) => {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return jsonResponse(500, {
      error: "Missing TMDB_API_KEY",
    });
  }

  const query = event.queryStringParameters?.query?.trim() || "rainy day drama";
  const url = new URL("https://api.themoviedb.org/3/search/movie");

  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("include_adult", "false");

  const tmdbResponse = await fetch(url);
  const tmdbData = await tmdbResponse.json();

  if (!tmdbResponse.ok) {
    return jsonResponse(tmdbResponse.status, {
      error: tmdbData.status_message || "TMDB request failed",
    });
  }

  return jsonResponse(200, {
    results: (tmdbData.results || []).slice(0, 6).map(normalizeMovie),
  });
};

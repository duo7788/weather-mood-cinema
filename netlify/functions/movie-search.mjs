const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const normalizeMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.poster_path,
  releaseDate: movie.release_date,
  rating: movie.vote_average,
});

export default async (request) => {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return jsonResponse(500, {
      error: "Missing TMDB_API_KEY",
    });
  }

  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("query")?.trim() || "rainy day drama";
  const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");

  tmdbUrl.searchParams.set("api_key", apiKey);
  tmdbUrl.searchParams.set("query", query);
  tmdbUrl.searchParams.set("language", "en-US");
  tmdbUrl.searchParams.set("include_adult", "false");

  const tmdbResponse = await fetch(tmdbUrl);
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

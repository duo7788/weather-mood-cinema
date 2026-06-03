import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, BookmarkCheck, Loader2, Search } from "lucide-react";
import { CollectionMovieCard } from "./components/CollectionMovieCard";
import { MapComponent } from "./components/MapComponent";
import { getMovieDetails, getPosterUrl, getWeatherByCity, getWeatherByCoords } from "./api";
import { MOVIE_LIBRARY, type MoodTag } from "./movie-library";
import { createScoredCandidates, pickTopCandidate } from "./recommendation";
import { getFavorites, removeFavorite, saveFavorite } from "./storage";
import type { MovieRecommendation, SavedMovie, WeatherData } from "./types";

const MOODS: { label: string; value: MoodTag }[] = [
  { label: "Relaxed", value: "relaxed" },
  { label: "Lonely", value: "lonely" },
  { label: "Healing", value: "healing" },
  { label: "Excited", value: "excited" },
  { label: "Nostalgic", value: "nostalgic" },
  { label: "Sad", value: "sad" },
  { label: "Gloomy", value: "gloomy" },
  { label: "Romantic", value: "romantic" },
  { label: "Tense", value: "tense" },
];

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mood, setMood] = useState<MoodTag | "">("");
  const [cityQuery, setCityQuery] = useState("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);
  const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"archive" | "collections">("archive");
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => getFavorites());
  const recsRef = useRef<HTMLDivElement>(null);

  const createSavedMovie = (movie: MovieRecommendation): SavedMovie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    city: movie.weather.city,
    country: movie.weather.country,
    latitude: movie.weather.latitude,
    longitude: movie.weather.longitude,
    weather: movie.weather.weather,
    weatherTag: movie.weather.weatherTag,
    temperatureTag: movie.weather.temperatureTag,
    mood: movie.mood,
    score: movie.score,
    savedAt: Date.now(),
  });

  const toggleSave = (movie: MovieRecommendation | SavedMovie) => {
    setSavedMovies((prev) => {
      const exists = prev.some((saved) => saved.id === movie.id);
      return exists
        ? removeFavorite(localStorage, movie.id)
        : saveFavorite(
            localStorage,
            "savedAt" in movie ? movie : createSavedMovie(movie as MovieRecommendation),
          );
    });
  };

  const handleLocationSelect = async (coords: { lat: number; lng: number }) => {
    setIsFetchingWeather(true);
    setRecommendation(null);
    setError(null);

    try {
      const nextWeather = await getWeatherByCoords(coords.lat, coords.lng);
      setWeather(nextWeather);
    } catch {
      setError("Atmospheric lookup failed.");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleCitySearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = cityQuery.trim();

    if (!query) {
      return;
    }

    setIsFetchingWeather(true);
    setRecommendation(null);
    setError(null);

    try {
      const nextWeather = await getWeatherByCity(query);
      setWeather(nextWeather);
      setCityQuery("");
    } catch {
      setError("City not found.");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!weather || !mood) {
      return;
    }

    setIsFetchingMovies(true);
    setError(null);

    try {
      const candidates = createScoredCandidates(MOVIE_LIBRARY, {
        weatherTag: weather.weatherTag,
        temperatureTag: weather.temperatureTag,
        moodTag: mood,
      });
      const selected = pickTopCandidate(candidates);
      const movie = await getMovieDetails(selected.movie.tmdbId);

      setRecommendation({
        ...movie,
        score: selected.score,
        mood,
        weather,
      });

      setTimeout(() => {
        recsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Movie data did not load.");
    } finally {
      setIsFetchingMovies(false);
    }
  };

  const selectedLocation = weather
    ? {
        lat: weather.latitude,
        lng: weather.longitude,
      }
    : null;
  const isRecommendationSaved = recommendation
    ? savedMovies.some((saved) => saved.id === recommendation.id)
    : false;

  return (
    <div className="h-screen w-full bg-[#111317] text-[#F5F5F0] font-serif overflow-hidden relative flex flex-col">
      <div className="film-grain"></div>

      <header className="h-16 border-b border-[#ffffff20] flex items-center justify-between px-6 md:px-10 shrink-0 z-20 bg-[#111317]/80 backdrop-blur-sm relative">
        <div className="text-[10px] tracking-[0.3em] uppercase font-sans font-semibold opacity-80">
          Weather Mood Cinema / Ed. 01
        </div>
        <div className="flex gap-8 text-[10px] tracking-[0.2em] uppercase font-sans">
          <button
            onClick={() => setView("archive")}
            className={`transition-opacity ${view === "archive" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            Archive
          </button>
          <button
            onClick={() => setView("collections")}
            className={`transition-opacity hidden md:block ${view === "collections" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            Collections
          </button>
        </div>
        <button
          type="button"
          onClick={() => setView("collections")}
          className="w-8 h-8 md:w-10 md:h-10 border border-[#ffffff30] rounded-full flex items-center justify-center text-[10px] md:text-[12px] opacity-80 font-sans tracking-widest transition hover:opacity-100 hover:border-white/50"
          aria-label="Open Collections"
          title="Open Collections"
        >
          {savedMovies.length}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hidden-scrollbar relative z-10 w-full flex flex-col">
        {view === "collections" ? (
          <section className="w-full flex-1 bg-[#111317] flex flex-col p-6 md:p-16 lg:px-32">
            <div className="flex justify-between items-baseline mb-16 shrink-0 pt-6">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">
                Your Collections
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-sans">
                {savedMovies.length > 0 ? `${savedMovies.length} Records` : "Empty"}
              </span>
            </div>

            {savedMovies.length === 0 ? (
              <div className="opacity-40 flex flex-col space-y-4 h-[40vh] items-center justify-center border-l-2 border-white/20 pl-8 font-serif text-3xl tracking-tight italic font-light mx-auto">
                No cinematic memories saved yet.
              </div>
            ) : (
              <div className="flex-1 w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24 max-w-7xl">
                {savedMovies.map((movie) => (
                  <CollectionMovieCard key={movie.id} movie={movie} onToggleSave={() => toggleSave(movie)} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row w-full shrink-0">
              <section className="w-full md:w-[65%] lg:w-[70%] relative border-b md:border-b-0 md:border-r border-[#ffffff20] flex flex-col min-h-[50vh] md:min-h-0 shrink-0">
                <div className="absolute inset-0 bg-[#16181D] overflow-hidden">
                  <MapComponent onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
                </div>

                <form
                  onSubmit={handleCitySearch}
                  className="pointer-events-auto absolute left-6 top-12 z-20 flex w-[min(18rem,calc(100vw-3rem))] items-center gap-2 border border-white/15 bg-[#111317]/70 px-3 py-2 backdrop-blur-md md:left-10 md:top-12"
                  aria-label="Jump to city"
                >
                  <Search className="h-3.5 w-3.5 text-white/50" />
                  <input
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent font-sans text-[10px] uppercase tracking-[0.18em] text-white/80 outline-none placeholder:text-white/35"
                    placeholder="Search city"
                    aria-label="Search city"
                  />
                  <button
                    type="submit"
                    className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 transition hover:text-white disabled:opacity-30"
                    disabled={isFetchingWeather}
                  >
                    Go
                  </button>
                </form>

                <div className="mt-auto p-6 md:p-12 z-10 bg-gradient-to-t from-[#111317] via-[#111317]/80 to-transparent pointer-events-none">
                  {weather ? (
                    <>
                      <h1 className="text-6xl md:text-[112px] leading-[0.85] tracking-tighter italic font-light lowercase drop-shadow-lg text-white">
                        {weather.city}
                        <span className="block not-italic text-3xl md:text-[72px] tracking-normal font-normal opacity-60 mt-1 md:mt-2">
                          {weather.weather}
                        </span>
                      </h1>
                      <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                        <span className="text-4xl md:text-5xl font-light text-white">
                          {weather.temperature}°C
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans">
                          {weather.weatherTag} / {weather.temperatureTag}
                        </span>
                      </div>
                    </>
                  ) : (
                    <h1 className="text-5xl md:text-[80px] leading-[0.85] tracking-tighter italic font-light lowercase opacity-60">
                      Select a<br />
                      <span className="not-italic opacity-70">coordinate</span>
                    </h1>
                  )}
                  {isFetchingWeather ? (
                    <div className="mt-6 md:mt-8 text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Scanning atmosphere...
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="w-full md:w-[35%] lg:w-[30%] flex flex-col p-6 md:p-12 bg-[#111317]">
                <div className="flex-1 flex flex-col justify-center shrink-0 relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans block mb-8 text-white">
                    Select Mood
                  </span>
                  <div className="flex flex-col gap-3">
                    {MOODS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setMood(item.value)}
                        className={`w-full py-3 px-6 rounded border text-[11px] font-sans uppercase tracking-[0.2em] transition-all duration-300 ${
                          mood === item.value
                            ? "border-white/80 bg-white text-black font-semibold"
                            : "border-white/20 text-[#F5F5F0] hover:bg-white/10 hover:border-white/40"
                        }`}
                        aria-pressed={mood === item.value}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/20 flex flex-col items-center justify-center gap-4">
                    <button
                      onClick={handleGetRecommendations}
                      disabled={!weather || !mood || isFetchingMovies}
                      className="w-full sm:w-auto px-8 py-4 border border-white/40 text-[#F5F5F0] font-sans text-[11px] hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-[0.2em] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#F5F5F0] flex items-center justify-center space-x-3 rounded"
                    >
                      {isFetchingMovies ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Curating...</span>
                        </>
                      ) : (
                        <span>Unveil Recommendation</span>
                      )}
                    </button>
                    {error ? (
                      <div className="text-red-400 font-sans text-[10px] uppercase tracking-wider text-center mt-4">
                        {error}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            {recommendation ? (
              <section
                ref={recsRef}
                className="w-full min-h-screen bg-[#111317] border-t border-white/20 flex flex-col p-6 md:p-16 lg:px-32"
              >
                <div className="flex justify-between items-baseline mb-16 shrink-0 pt-6">
                  <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">
                    Curation Result
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em] opacity-80 font-sans">
                    Score {recommendation.score}
                  </span>
                </div>

                <div className="flex-1 w-full mx-auto flex flex-col gap-16 pb-24 max-w-5xl">
                  <AnimatePresence>
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="relative bg-[#16181D] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-8 shadow-2xl group overflow-hidden min-h-0 rounded-sm"
                    >
                      <div className="md:w-1/3 shrink-0 md:ml-6 z-10 relative">
                        <div className="aspect-[2/3] w-full bg-[#1a1a1a] rounded overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group-hover:scale-[1.02] transition-transform duration-700">
                          {recommendation.posterPath ? (
                            <img
                              src={getPosterUrl(recommendation.posterPath)}
                              className="w-full h-full object-cover opacity-85 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                              alt={recommendation.title}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
                              No Poster
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:w-2/3 flex flex-col justify-center md:mr-6 z-10">
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-sans mb-2 block italic text-white/90">
                              {recommendation.weather.city} / {recommendation.weather.weather} /{" "}
                              {recommendation.mood}
                            </span>
                            <h2 className="text-4xl md:text-5xl leading-[1.1] tracking-tight group-hover:text-white transition-colors">
                              {recommendation.title}
                            </h2>
                            <span className="text-xl opacity-60 font-light block mt-2">
                              ({recommendation.releaseDate ? recommendation.releaseDate.slice(0, 4) : "Film"}) ·{" "}
                              {recommendation.rating ? recommendation.rating.toFixed(1) : "NR"}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleSave(recommendation)}
                            className="text-white/60 hover:text-white transition-colors p-2 rounded-full border border-transparent hover:border-white/30 hover:bg-white/10"
                            title={isRecommendationSaved ? "Remove from Collections" : "Save to Collections"}
                          >
                            {isRecommendationSaved ? (
                              <BookmarkCheck className="w-5 h-5 text-white" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="h-[1px] w-full bg-white/20 my-6" />
                        <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-6 italic text-[#F5F5F0]">
                          "{recommendation.overview || "A film selected for this weather mood."}"
                        </p>
                        <p className="text-sm tracking-widest leading-loose opacity-70 font-sans uppercase">
                          Weather {recommendation.weather.weatherTag}. Temperature{" "}
                          {recommendation.weather.temperatureTag}. Mood {recommendation.mood}. Match score{" "}
                          {recommendation.score}.
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            ) : null}
          </>
        )}

        <footer className="h-16 px-6 md:px-10 border-t border-[#ffffff20] flex items-center justify-between text-[9px] tracking-[0.2em] uppercase opacity-60 font-sans shrink-0 bg-[#111317] relative z-20">
          <div>
            Lat: {weather ? weather.latitude.toFixed(2) : "--"} | Lon:{" "}
            {weather ? weather.longitude.toFixed(2) : "--"}
          </div>
          <div className="hidden md:block">
            {weather ? "Atmospheric Data Synchronized" : "Awaiting Telemetry"}
          </div>
          <div>TMDB / Open-Meteo</div>
        </footer>
      </main>
    </div>
  );
}

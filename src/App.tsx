import { useRef, useState, type FormEvent } from "react";
import { withMinimumDuration } from "./minimum-duration";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bookmark, BookmarkCheck, Loader2, Search } from "lucide-react";
import { MoodExpression } from "./components/MoodExpression";
import { CurationProjector } from "./components/CurationProjector";
import { CollectionMovieCard } from "./components/CollectionMovieCard";
import { MapComponent } from "./components/MapComponent";
import { getMovieDetails, getPosterUrl, getWeatherByCity, getWeatherByCoords } from "./api";
import {
  formatChineseRecommendationSummary,
  formatMovieRating,
  getMoodDisplay,
  getMovieChineseCopy,
  getNavDisplay,
} from "./localization";
import { MOVIE_LIBRARY, type MoodTag } from "./movie-library";
import { createScoredCandidates, pickTopCandidate } from "./recommendation";
import { formatRecommendationSummary } from "./recommendation-summary";
import { getFavorites, removeFavorite, saveFavorite } from "./storage";
import type { MovieRecommendation, SavedMovie, WeatherData } from "./types";
import {
  COLLECTION_GRID_CLASS,
  RECOMMENDATION_DETAIL_GRID_CLASS,
  RECOMMENDATION_POSTER_COLUMN_CLASS,
} from "./layout";
import { RECOMMENDATION_POSTER_SIZE, preloadPosterImage } from "./poster-loading";

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
  const reducedMotion = useReducedMotion();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mood, setMood] = useState<MoodTag | "">("");
  const [cityQuery, setCityQuery] = useState("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);
  const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"archive" | "collections">("archive");
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => getFavorites());
  const [step, setStep] = useState<"location" | "mood" | "result">("location");
  const locationRequest = useRef(0);
  const loadingEntered = useRef<(() => void) | null>(null);

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
    const requestId = ++locationRequest.current;
    setIsFetchingWeather(true);
    setRecommendation(null);
    setError(null);

    try {
      const nextWeather = await getWeatherByCoords(coords.lat, coords.lng);
      if (requestId !== locationRequest.current) return;
      setWeather(nextWeather);
    } catch {
      if (requestId === locationRequest.current) setError("Atmospheric lookup failed.");
    } finally {
      if (requestId === locationRequest.current) setIsFetchingWeather(false);
    }
  };

  const handleCitySearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = cityQuery.trim();

    if (!query) {
      return;
    }

    const requestId = ++locationRequest.current;
    setIsFetchingWeather(true);
    setRecommendation(null);
    setError(null);

    try {
      const nextWeather = await getWeatherByCity(query);
      if (requestId !== locationRequest.current) return;
      setWeather(nextWeather);
      setCityQuery("");
    } catch {
      if (requestId === locationRequest.current) setError("City not found.");
    } finally {
      if (requestId === locationRequest.current) setIsFetchingWeather(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!weather || !mood || isFetchingMovies) {
      return;
    }

    const ready = new Promise<void>(resolve => { loadingEntered.current = resolve; });
    setIsFetchingMovies(true);
    setError(null);

    try {
      const candidates = createScoredCandidates(MOVIE_LIBRARY, {
        weatherTag: weather.weatherTag,
        temperatureTag: weather.temperatureTag,
        moodTag: mood,
      });
      const selected = pickTopCandidate(candidates);
      const movie = await withMinimumDuration(async () => {
        const details = await getMovieDetails(selected.movie.tmdbId);
        preloadPosterImage(details.posterPath);
        return details;
      }, undefined, ready);

      setRecommendation({
        ...movie,
        score: selected.score,
        mood,
        weather,
      });
      setStep("result");
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
  const recommendationChineseCopy = recommendation
    ? getMovieChineseCopy(recommendation.id)
    : null;
  const recommendationRating = recommendation ? formatMovieRating(recommendation.rating) : "NR";

  const startNewRecommendation = () => {
    locationRequest.current += 1;
    setWeather(null);
    setMood("");
    setCityQuery("");
    setRecommendation(null);
    setError(null);
    setIsFetchingWeather(false);
    setStep("location");
  };

  return (
    <div className="h-screen w-full bg-[#111317] text-[#F5F5F0] font-serif overflow-hidden relative flex flex-col">
      <div className="film-grain"></div>

      <header className="h-16 border-b border-[#ffffff20] flex items-center justify-between px-6 md:px-10 shrink-0 z-20 bg-[#111317]/80 backdrop-blur-sm relative">
        <div className="cinema-brand-group">
          <div className="text-[10px] tracking-[0.3em] uppercase font-sans font-semibold opacity-80">
            Weather Mood Cinema / Ed. 01
          </div>
          <a className="cinema-intro-link" href="#">介绍页</a>
        </div>
        <div className="flex gap-8 text-[10px] tracking-[0.2em] uppercase font-sans">
          <button
            onClick={() => {
              setView("archive");

            }}
            className={`transition-opacity ${view === "archive" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <span>{getNavDisplay("archive").english}</span>
            <span className="ml-2 opacity-70">{getNavDisplay("archive").chinese}</span>
          </button>
          <button
            onClick={() => setView("collections")}
            className={`transition-opacity hidden md:block ${view === "collections" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <span>{getNavDisplay("collections").english}</span>
            <span className="ml-2 opacity-70">{getNavDisplay("collections").chinese}</span>
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

      <main
        className={`flex-1 hidden-scrollbar relative z-10 w-full flex flex-col ${
          view === "archive" ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            className="flex flex-col flex-1 min-h-0 overflow-y-auto hidden-scrollbar"
            key={isFetchingMovies ? "loading" : view === "collections" ? "collections" : step}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -14 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              if (isFetchingMovies) {
                loadingEntered.current?.();
                loadingEntered.current = null;
              }
            }}
          >
        {isFetchingMovies ? (
          <section className="curation-loading" role="status" aria-live="polite" aria-busy="true">
            <CurationProjector />
            <p><span className="curation-loading-english" lang="en">Finding a film for your weather and mood.</span><span className="curation-loading-chinese">正在根据地点的天气、心情</span><span className="curation-loading-chinese">为你挑选一部最适合的电影</span></p>
          </section>
        ) : view === "collections" ? (
          <section className="w-full flex-1 bg-[#111317] flex flex-col p-6 md:p-12 lg:px-24">
            <div className="flex justify-between items-baseline mb-8 shrink-0">
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
              <div className={COLLECTION_GRID_CLASS}>
                {savedMovies.map((movie) => (
                  <CollectionMovieCard key={movie.id} movie={movie} onToggleSave={() => toggleSave(movie)} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {step === "location" ? (
              <section className="h-full min-h-[360px] w-full relative flex flex-col">
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

                  <div className="location-weather mt-auto p-6 md:p-12 z-10 bg-gradient-to-t from-[#111317] via-[#111317]/80 to-transparent pointer-events-none">
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
                  <div className="absolute top-24 left-6 md:left-10 z-20 font-sans text-[10px] tracking-widest text-white/60">选择地图上的地点，或搜索城市 · SELECT A LOCATION</div>
                  {weather && (
                    <div className="location-confirm">
                      <button className="cinema-action" disabled={isFetchingWeather || Boolean(error)} onClick={() => setStep("mood")}>
                        <span>Confirm Location</span><span>确认选择</span>
                      </button>
                    </div>
                  )}
                  {error && <p role="alert" className="absolute top-32 left-6 md:left-10 z-20 font-sans text-xs text-white">{error}</p>}
                </section>
            ) : null}

            {step === "mood" ? (
                <section className="mood-step">
                  <div className="mood-location-summary font-sans">
                    <span>{weather?.city} · {weather?.weather} · {weather?.temperature}°C</span>
                    <button onClick={() => { setStep("location"); setError(null); }}>更换地点 / CHANGE LOCATION</button>
                  </div>
                  <div className="w-full flex flex-col relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans block mb-5 text-white">
                      Select Mood / 选择心情
                    </span>
                    <div className="flex flex-col gap-2">
                      {MOODS.map((item) => {
                        const moodDisplay = getMoodDisplay(item.value);

                        return (
                          <button
                            key={item.value}
                            onClick={() => setMood(item.value)}
                            className={`mood-option relative w-full py-2 xl:py-2.5 px-10 rounded border text-[11px] font-sans uppercase tracking-[0.2em] transition-all duration-300 ${
                              mood === item.value
                                ? "border-white/80 bg-white text-black font-semibold"
                                : "border-white/20 text-[#F5F5F0] hover:bg-white/10 hover:border-white/40"
                            }`}
                            aria-pressed={mood === item.value}
                          >
                            <span className="mood-option-label">
                              <span>{moodDisplay.english}</span>
                              <span className="ml-3 opacity-70">{moodDisplay.chinese}</span>
                              <MoodExpression mood={item.value} />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/20 flex flex-col items-center justify-center gap-4">
                      <button
                        onClick={handleGetRecommendations}
                        disabled={!weather || !mood || isFetchingMovies}
                        className="cinema-action"
                      >
                        <span>Unveil Recommendation</span>
                        <span>为我推荐一部电影</span>
                      </button>
                      {error ? (
                        <div className="text-red-400 font-sans text-[10px] uppercase tracking-wider text-center mt-4">
                          {error}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
            ) : null}

            {step === "result" && recommendation ? (
              <motion.section
                className="min-h-full bg-[#111317] border-t border-white/20 flex flex-col p-6 md:p-12 lg:px-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <>
                    <div className="flex justify-between items-baseline mb-8 shrink-0">
                      <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">
                        Curation Result
                      </span>
                      {recommendation.rating ? (
                        <span className="text-[10px] uppercase tracking-[0.1em] opacity-80 font-sans">
                          {recommendationRating}
                        </span>
                      ) : null}
                    </div>

                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      className={RECOMMENDATION_DETAIL_GRID_CLASS}
                    >
                      <div className={RECOMMENDATION_POSTER_COLUMN_CLASS}>
                        <div className="h-[min(34vh,18rem)] md:h-[min(62vh,28rem)] aspect-[2/3] bg-[#1a1a1a] rounded-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
                          {recommendation.posterPath ? (
                            <img
                              src={getPosterUrl(recommendation.posterPath, RECOMMENDATION_POSTER_SIZE)}
                              className="w-full h-full object-cover opacity-85 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                              alt={recommendation.title}
                              loading="eager"
                              decoding="async"
                              fetchPriority="high"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
                              No Poster
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-6">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-sans mb-3 block italic text-white/90">
                              {recommendation.weather.city} / {recommendation.weather.weather} /{" "}
                              {recommendation.mood}
                            </span>
                            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-tight text-white">
                              {recommendation.title}
                              {recommendationChineseCopy?.title ? (
                                <span className="ml-3 inline-block align-baseline font-sans text-sm md:text-lg tracking-[0.16em] uppercase text-white/45">
                                  {recommendationChineseCopy.title}
                                </span>
                              ) : null}
                            </h2>
                            <span className="text-lg opacity-60 font-light block mt-3">
                              ({recommendation.releaseDate ? recommendation.releaseDate.slice(0, 4) : "Film"}) ·{" "}
                              {recommendationRating}
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
                        {recommendation.overview ? (
                          <p className="text-base md:text-xl leading-relaxed opacity-90 mb-6 italic text-[#F5F5F0] line-clamp-5">
                            "{recommendation.overview}"
                          </p>
                        ) : null}
                        {recommendationChineseCopy?.overview ? (
                          <p className="font-sans text-xs md:text-sm leading-loose tracking-[0.16em] text-white/55 mb-6">
                            {recommendationChineseCopy.overview}
                          </p>
                        ) : null}
                        <p className="text-xs md:text-sm tracking-widest leading-loose opacity-70 font-sans uppercase">
                          {formatRecommendationSummary({
                            weatherTag: recommendation.weather.weatherTag,
                            temperatureTag: recommendation.weather.temperatureTag,
                            mood: recommendation.mood,
                          })}
                        </p>
                        <p className="font-sans text-xs md:text-sm leading-loose tracking-[0.16em] text-white/45 mt-2">
                          {formatChineseRecommendationSummary({
                            weatherTag: recommendation.weather.weatherTag,
                            temperatureTag: recommendation.weather.temperatureTag,
                            mood: recommendation.mood,
                          })}
                        </p>
                        <div className="flex justify-start mt-10 pb-4">
                          <button className="cinema-action cinema-action-again" onClick={startNewRecommendation}>
                            <span>Recommend Another Film</span><span>再推荐一部</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                </>
              </motion.section>
            ) : null}
          </>
        )}
          </motion.section>
        </AnimatePresence>

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

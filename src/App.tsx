import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapComponent } from './components/MapComponent';
import { LocationState, WeatherData, MovieRecommendation, SavedMovie } from './types';
import { getLocationName, getWeather, fetchRecommendations } from './api';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { CollectionMovieCard } from './components/CollectionMovieCard';

const MOODS = [
  "Melancholic", "Nostalgic", "Restless", "Joyful", "Reflective", "Dreamy", "Intense", "Lonely"
];

export default function App() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mood, setMood] = useState<string>("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'archive' | 'collections'>('archive');
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>(() => {
    try {
      const stored = localStorage.getItem('cinema_collections');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const recsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cinema_collections', JSON.stringify(savedMovies));
  }, [savedMovies]);

  useEffect(() => {
    if (view === 'archive' && recommendations && recommendations.length > 0) {
      setTimeout(() => {
        recsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [recommendations, view]);

  const toggleSave = (movie: MovieRecommendation) => {
    setSavedMovies(prev => {
      const exists = prev.find(m => m.title === movie.title);
      if (exists) {
        return prev.filter(m => m.title !== movie.title);
      } else {
        return [...prev, {
          ...movie,
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          savedLocation: location?.name || 'Unknown Location',
          savedWeather: weather ? `${weather.temperature}°C, ${weather.condition}` : 'Unknown Weather',
          savedMood: mood || 'Unknown Mood',
          savedAt: Date.now()
        }];
      }
    });
  };

  const handleLocationSelect = async (coords: Pick<LocationState, 'lat' | 'lng'>) => {
    setIsFetchingWeather(true);
    setRecommendations(null);
    setError(null);
    try {
      const name = await getLocationName(coords.lat, coords.lng);
      setLocation({ ...coords, name });
      const wData = await getWeather(coords.lat, coords.lng);
      if (wData) {
        setWeather(wData);
      } else {
        setWeather({ temperature: 0, condition: "Unknown" });
      }
    } catch (err) {
      setError("Failed to resolve location details.");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!location || !weather || !mood) return;
    setIsFetchingMovies(true);
    setError(null);
    try {
      const conditionString = `${weather.temperature}°C, ${weather.condition}`;
      const results = await fetchRecommendations(location.name, conditionString, mood);
      setRecommendations(results);
    } catch (err) {
      setError("Failed to consult the curator. They might be resting.");
    } finally {
      setIsFetchingMovies(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#111317] text-[#F5F5F0] font-serif overflow-hidden relative flex flex-col">
      <div className="film-grain"></div>

      {/* Top Navigation / Header */}
      <header className="h-16 border-b border-[#ffffff20] flex items-center justify-between px-6 md:px-10 shrink-0 z-20 bg-[#111317]/80 backdrop-blur-sm relative">
        <div className="text-[10px] tracking-[0.3em] uppercase font-sans font-semibold opacity-80">Weather Mood Cinema / Ed. 01</div>
        <div className="flex gap-8 text-[10px] tracking-[0.2em] uppercase font-sans">
          <button 
            onClick={() => setView('archive')}
            className={`transition-opacity ${view === 'archive' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            Archive
          </button>
          <button 
            onClick={() => setView('collections')}
            className={`transition-opacity hidden md:block ${view === 'collections' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            Collections
          </button>
          <span className="opacity-60 hidden md:block hover:opacity-100 transition-opacity cursor-pointer">About</span>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 border border-[#ffffff30] rounded-full flex items-center justify-center text-[10px] md:text-[12px] opacity-80 font-sans tracking-widest">ID</div>
      </header>

      {/* Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto hidden-scrollbar relative z-10 w-full flex flex-col">
        {view === 'collections' ? (
          <section className="w-full flex-1 bg-[#111317] flex flex-col p-6 md:p-16 lg:px-32">
            <div className="flex justify-between items-baseline mb-16 shrink-0 pt-6">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">Your Collections</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-sans">
                {savedMovies.length > 0 ? `${savedMovies.length} Records` : 'Empty'}
              </span>
            </div>

            {savedMovies.length === 0 ? (
               <div className="opacity-40 flex flex-col space-y-4 h-[40vh] items-center justify-center border-l-2 border-white/20 pl-8 font-serif text-3xl tracking-tight italic font-light mx-auto">
                 No cinematic memories saved yet.
               </div>
            ) : (
              <div className="flex-1 w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24 max-w-7xl">
                {savedMovies.map(movie => (
                   <CollectionMovieCard key={movie.id} movie={movie} onToggleSave={() => toggleSave(movie)} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
        {/* Hero Section (Map + Mood) */}
        <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row w-full shrink-0">
          {/* Left Section: Map Selection & Weather */}
          <section className="w-full md:w-[65%] lg:w-[70%] relative border-b md:border-b-0 md:border-r border-[#ffffff20] flex flex-col min-h-[50vh] md:min-h-0 shrink-0">
            <div className="absolute inset-0 bg-[#16181D] overflow-hidden">
               <MapComponent onLocationSelect={handleLocationSelect} selectedLocation={location} />
            </div>
            
            {/* Overlay Location Title */}
            <div className="mt-auto p-6 md:p-12 z-10 bg-gradient-to-t from-[#111317] via-[#111317]/80 to-transparent pointer-events-none">
              {location ? (
                <>
                  <h1 className="text-6xl md:text-[112px] leading-[0.85] tracking-tighter italic font-light lowercase drop-shadow-lg text-white">
                    {location.name}
                    {weather ? (
                      <span className="block not-italic text-3xl md:text-[72px] tracking-normal font-normal opacity-60 mt-1 md:mt-2">
                        {weather.condition}
                      </span>
                    ) : null}
                  </h1>
                  {weather ? (
                    <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                      <span className="text-4xl md:text-5xl font-light text-white">{weather.temperature}°C</span>
                      {isFetchingWeather ? (
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Analyzing atmosphere...</span>
                      ) : (
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans">Atmospheric Data Synced</span>
                      )}
                    </div>
                  ) : (
                      isFetchingWeather && <div className="mt-6 md:mt-8 text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-70 font-sans flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Scanning...</div>
                  )}
                </>
              ) : (
                <h1 className="text-5xl md:text-[80px] leading-[0.85] tracking-tighter italic font-light lowercase opacity-60">
                  Select a<br/><span className="not-italic opacity-70">coordinate</span>
                </h1>
              )}
            </div>
          </section>
          
          {/* Right Section: Mood Selection */}
          <section className="w-full md:w-[35%] lg:w-[30%] flex flex-col p-6 md:p-12 bg-[#111317]">
            <div className="flex-1 flex flex-col justify-center shrink-0 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans block mb-8 text-white">Select Mood</span>
              <div className="flex flex-col gap-3">
                {MOODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`w-full py-3 px-6 rounded border text-[11px] font-sans uppercase tracking-[0.2em] transition-all duration-300 ${
                      mood === m 
                        ? 'border-white/80 bg-white text-black font-semibold' 
                        : 'border-white/20 text-[#F5F5F0] hover:bg-white/10 hover:border-white/40'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              
               <div className="mt-12 pt-8 border-t border-white/20 flex flex-col items-center justify-center gap-4">
                <button
                  onClick={handleGetRecommendations}
                  disabled={!location || !weather || !mood || isFetchingMovies}
                  className="w-full sm:w-auto px-8 py-4 border border-white/40 text-[#F5F5F0] font-sans text-[11px] hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-[0.2em] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#F5F5F0] flex items-center justify-center space-x-3 rounded"
                >
                  {isFetchingMovies ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Curating...</span>
                    </>
                  ) : (
                    <>
                      <span>Unveil Recommendations</span>
                    </>
                  )}
                </button>
                 {error && (
                  <div className="text-red-400 font-sans text-[10px] uppercase tracking-wider text-center mt-4">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Recommendations Section */}
        {recommendations && (
          <section ref={recsRef} className="w-full min-h-screen bg-[#111317] border-t border-white/20 flex flex-col p-6 md:p-16 lg:px-32">
            
            <div className="flex justify-between items-baseline mb-16 shrink-0 pt-6">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans">Curation Results</span>
              <span className="text-[10px] uppercase tracking-[0.1em] opacity-80 font-sans">
                {recommendations.length > 0 ? `01 / 0${recommendations.length}` : '—'}
              </span>
            </div>

            <div className="flex-1 w-full mx-auto flex flex-col gap-16 pb-24 max-w-5xl">
              <AnimatePresence>
                {recommendations.map((rec, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2, duration: 0.8, ease: "easeOut" }}
                    className="relative bg-[#16181D] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-8 shadow-2xl group overflow-hidden min-h-0 rounded-sm"
                  >
                    {/* Film Holes Left */}
                    <div className="absolute left-2 top-0 bottom-0 w-4 hidden md:flex flex-col justify-around py-4 opacity-40 pointer-events-none">
                       {Array.from({length: 16}).map((_, i) => <div key={i} className="w-3 h-4 bg-[#111317] rounded-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>)}
                    </div>

                    {/* Film Holes Right */}
                    <div className="absolute right-2 top-0 bottom-0 w-4 hidden md:flex flex-col justify-around py-4 opacity-40 pointer-events-none">
                       {Array.from({length: 16}).map((_, i) => <div key={i} className="w-3 h-4 bg-[#111317] rounded-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>)}
                    </div>

                    {/* Poster Element */}
                    <div className="md:w-1/3 shrink-0 md:ml-6 z-10 relative">
                       <div className="aspect-[2/3] w-full bg-[#1a1a1a] rounded overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group-hover:scale-[1.02] transition-transform duration-700">
                           <img 
                             src={`https://image.pollinations.ai/prompt/${encodeURIComponent(rec.posterPrompt || rec.title + ' movie film aesthetic')}?width=400&height=600&nologo=true`} 
                             className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700" 
                             alt={rec.title} 
                           />
                       </div>
                    </div>

                    {/* Details Element */}
                    <div className="md:w-2/3 flex flex-col justify-center md:mr-6 z-10">
                       <div className="flex justify-between items-start mb-4">
                           <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-sans mb-2 block italic text-white/90">Dir. {rec.director}</span>
                               <h2 className="text-4xl md:text-5xl leading-[1.1] tracking-tight group-hover:text-white transition-colors">
                                 {rec.title}
                               </h2>
                               <span className="text-xl opacity-60 font-light block mt-2">({rec.year})</span>
                           </div>
                           <button 
                             onClick={() => toggleSave(rec)} 
                             className="text-white/60 hover:text-white transition-colors p-2 rounded-full border border-transparent hover:border-white/30 hover:bg-white/10"
                             title={savedMovies.some(m => m.title === rec.title) ? "Remove from Collections" : "Save to Collections"}
                           >
                              {savedMovies.some(m => m.title === rec.title) ? <BookmarkCheck className="w-5 h-5 text-white" /> : <Bookmark className="w-5 h-5" />}
                           </button>
                       </div>

                       <div className="h-[1px] w-full bg-white/20 my-6"></div>

                       <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-6 italic text-[#F5F5F0]">
                         "{rec.description}"
                       </p>
                       <p className="text-sm tracking-widest leading-loose opacity-70 font-sans">
                          {rec.reason}
                       </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}
          </>
        )}

        {/* Bottom Status Bar - placed after recommendations in flow */}
        <footer className="h-16 px-6 md:px-10 border-t border-[#ffffff20] flex items-center justify-between text-[9px] tracking-[0.2em] uppercase opacity-60 font-sans shrink-0 bg-[#111317] relative z-20">
          <div>Lat: {location ? location.lat.toFixed(2) : '--'} | Lon: {location ? location.lng.toFixed(2) : '--'}</div>
          <div className="hidden md:block">{location && weather ? 'Atmospheric Data Synchronized' : 'Awaiting Telemetry'}</div>
          <div>© 2024 Kinematics Studio</div>
        </footer>

      </main>
    </div>
  );
}

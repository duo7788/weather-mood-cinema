import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookmarkCheck } from 'lucide-react';
import { SavedMovie } from '../types';
import { getPosterUrl } from '../api';

interface Props {
  key?: React.Key;
  movie: SavedMovie;
  onToggleSave: (movie: SavedMovie) => void;
}

export function CollectionMovieCard({ movie, onToggleSave }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group relative bg-[#13151A] border border-white/10 p-6 flex flex-col gap-6 shadow-xl text-[#F5F5F0]">
      <div 
        className="aspect-[2/3] w-full relative perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
           className="w-full h-full relative preserve-3d"
           initial={false}
           animate={{ rotateY: isFlipped ? 180 : 0 }}
           transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
           {/* Front - Poster */}
           <div className="absolute inset-0 backface-hidden bg-[#1a1a1a] rounded overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
             {movie.posterPath ? (
               <img
                 src={getPosterUrl(movie.posterPath)}
                 className="w-full h-full object-cover opacity-90 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                 alt={movie.title}
               />
             ) : (
               <div className="h-full w-full flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
                 No Poster
               </div>
             )}
           </div>
           
           {/* Back - Info */}
           <div 
              className="absolute inset-0 backface-hidden bg-[#E5E1DA] rounded p-6 md:p-8 overflow-y-auto hidden-scrollbar text-center flex flex-col shadow-inner"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="my-auto pb-4">
                <p className="text-base md:text-lg leading-relaxed italic text-[#0A0B0D] mb-6">
                  "{movie.overview || "A saved film from your weather mood archive."}"
                </p>
                <div className="h-[1px] w-12 bg-black/20 mx-auto my-6 shrink-0"></div>
                <p className="text-xs tracking-widest leading-loose opacity-80 font-sans text-[#0A0B0D] uppercase">
                   {movie.weatherTag} / {movie.temperatureTag} / {movie.mood} / Score {movie.score}
                </p>
              </div>
              <span className="shrink-0 text-center text-[9px] uppercase tracking-[0.2em] opacity-40 font-sans text-[#0A0B0D] mt-4">
                 Tap to flip back
              </span>
           </div>
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl leading-tight tracking-tight group-hover:text-white transition-colors">{movie.title}</h2>
        <span className="text-xs opacity-60 font-light block mt-1">
          ({movie.releaseDate ? movie.releaseDate.slice(0, 4) : "Film"}) · {movie.rating ? movie.rating.toFixed(1) : "NR"}
        </span>
      </div>
      
      <div className="h-[1px] w-full bg-white/20 my-1"></div>
      
      <div className="space-y-3 text-[10px] font-sans uppercase tracking-widest opacity-80">
        <div className="flex items-center justify-between gap-4">
          <span className="opacity-60">Location</span>
          <span className="text-right truncate">{movie.city}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="opacity-60">Weather</span>
          <span className="text-right truncate">{movie.weather}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="opacity-60">Mood</span>
          <span className="text-right truncate">{movie.mood}</span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onToggleSave(movie); }} 
        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white border border-white/20 transition-all z-10 hover:bg-black/80"
      >
        <BookmarkCheck className="w-5 h-5" />
      </button>
    </div>
  );
}

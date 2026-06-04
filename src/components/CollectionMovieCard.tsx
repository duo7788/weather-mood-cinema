import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookmarkCheck } from 'lucide-react';
import { SavedMovie } from '../types';
import { getPosterUrl } from '../api';
import { MOOD_LABELS, getMovieChineseCopy } from '../localization';

interface Props {
  key?: React.Key;
  movie: SavedMovie;
  onToggleSave: (movie: SavedMovie) => void;
}

export const FLIP_HINT_TEXT = "Click poster to flip for details";
export const COLLECTION_BACK_PANEL_CLASS =
  "absolute inset-0 backface-hidden bg-[#E5E1DA] rounded p-5 md:p-6 overflow-y-auto hidden-scrollbar text-center flex flex-col shadow-inner";
export const COLLECTION_BACK_OVERVIEW_CLASS =
  "text-[11px] md:text-xs leading-relaxed italic text-[#0A0B0D] mb-4";
const PLACEHOLDER_OVERVIEW = "A curated TMDB title selected for this weather mood.";

const WEATHER_CHINESE_LABELS = {
  clear: "晴朗",
  cloudy: "多云",
  rainy: "有雨",
  foggy: "有雾",
  snowy: "有雪",
  stormy: "雷雨",
} as const;

const TEMPERATURE_CHINESE_LABELS = {
  cold: "寒冷",
  cool: "偏凉",
  mild: "温和",
  warm: "温暖",
  hot: "炎热",
} as const;

export const getCollectionCardBackCopy = (movie: SavedMovie) => {
  const chineseCopy = getMovieChineseCopy(movie.id);
  const weather = movie.weatherTag ? WEATHER_CHINESE_LABELS[movie.weatherTag] : movie.weather;
  const temperature = movie.temperatureTag
    ? TEMPERATURE_CHINESE_LABELS[movie.temperatureTag]
    : undefined;
  const moodLabel =
    typeof movie.mood === "string" && movie.mood in MOOD_LABELS
      ? MOOD_LABELS[movie.mood as keyof typeof MOOD_LABELS].chinese
      : movie.mood;
  const tags = [weather, temperature, moodLabel].filter(Boolean).join(" / ");
  const english =
    movie.overview && movie.overview.trim() !== PLACEHOLDER_OVERVIEW
      ? movie.overview
      : "";

  return {
    english,
    chinese: chineseCopy.overview,
    tags,
  };
};

export function CollectionMovieCard({ movie, onToggleSave }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const backCopy = getCollectionCardBackCopy(movie);
  const chineseCopy = getMovieChineseCopy(movie.id);

  return (
    <div className="group relative bg-[#13151A] border border-white/10 p-6 flex flex-col gap-6 shadow-xl text-[#F5F5F0]">
      <div>
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
            <div className={COLLECTION_BACK_PANEL_CLASS} style={{ transform: 'rotateY(180deg)' }}>
              <div className="my-auto py-2">
                {backCopy.english ? (
                  <p className={COLLECTION_BACK_OVERVIEW_CLASS}>
                    "{backCopy.english}"
                  </p>
                ) : null}
                <p className="font-sans text-[10px] md:text-[11px] leading-loose tracking-[0.12em] text-[#0A0B0D]/70 mb-4">
                  {backCopy.chinese}
                </p>
                <div className="h-[1px] w-12 bg-black/20 mx-auto my-5 shrink-0"></div>
                <p className="text-[10px] tracking-widest leading-loose opacity-80 font-sans text-[#0A0B0D]">
                  {backCopy.tags}
                </p>
              </div>
              <span className="shrink-0 text-center text-[9px] uppercase tracking-[0.2em] opacity-40 font-sans text-[#0A0B0D] mt-4">
                Tap to flip back
              </span>
            </div>
          </motion.div>
        </div>
        <p className="mt-3 text-center font-sans text-[9px] uppercase tracking-[0.22em] text-white/35">
          {FLIP_HINT_TEXT}
        </p>
      </div>

      <div>
        <h2 className="text-2xl leading-tight tracking-tight group-hover:text-white transition-colors">{movie.title}</h2>
        {chineseCopy.title ? (
          <span className="font-serif text-base leading-tight opacity-55 block mt-2">
            {chineseCopy.title}
          </span>
        ) : null}
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

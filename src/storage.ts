import type { SavedMovie } from "./types";

export const FAVORITES_STORAGE_KEY = "weatherMoodCinemaFavorites";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const getFavorites = (storage: StorageLike = localStorage): SavedMovie[] => {
  try {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || "[]") as SavedMovie[];
  } catch {
    return [];
  }
};

const setFavorites = (storage: StorageLike, favorites: SavedMovie[]) => {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
};

export const saveFavorite = (
  storage: StorageLike = localStorage,
  favorite: SavedMovie,
): SavedMovie[] => {
  const favorites = getFavorites(storage);

  if (favorites.some((item) => item.id === favorite.id)) {
    return favorites;
  }

  return setFavorites(storage, [favorite, ...favorites]);
};

export const removeFavorite = (
  storage: StorageLike = localStorage,
  movieId: number | string,
): SavedMovie[] => {
  return setFavorites(
    storage,
    getFavorites(storage).filter((item) => item.id !== movieId),
  );
};

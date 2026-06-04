import { getPosterUrl } from "./api";

export const POSTER_IMAGE_ORIGIN = "https://image.tmdb.org";
export const RECOMMENDATION_POSTER_SIZE = "w500";
export const COLLECTION_POSTER_SIZE = "w342";

type PriorityImage = HTMLImageElement & {
  fetchPriority?: "high" | "low" | "auto";
};

type ImageFactory = () => PriorityImage | null;

const createBrowserImage: ImageFactory = () =>
  typeof Image === "undefined" ? null : new Image();

export const preloadPosterImage = (
  posterPath: string | null | undefined,
  createImage: ImageFactory = createBrowserImage,
) => {
  const url = getPosterUrl(posterPath ?? null, RECOMMENDATION_POSTER_SIZE);

  if (!url) {
    return "";
  }

  const image = createImage();

  if (image) {
    image.decoding = "async";
    image.fetchPriority = "high";
    image.src = url;
  }

  return url;
};

import movieSearchHandler from "../netlify/functions/movie-search.mjs";
import { createVercelHandler } from "./vercel-adapter.mjs";

export default createVercelHandler(movieSearchHandler);

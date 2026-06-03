import weatherMoodHandler from "../netlify/functions/weather-mood.mjs";
import { createVercelHandler } from "./vercel-adapter.mjs";

export default createVercelHandler(weatherMoodHandler);

# Weather Mood Cinema Design

## Goal

Build a small public landing page for a weather-based movie recommendation project. The first version exists mainly to provide a credible project URL for a TMDB developer API application and to establish the product direction before API integration.

## Product Idea

Weather Mood Cinema lets a user enter a city, reads the current weather, translates that weather into a mood, and recommends a movie that fits the day. The initial page will not call real APIs yet. It will present the concept, show a static preview of the future experience, and include required TMDB attribution.

## First Version Scope

The first version is a static web page with:

- A clear product name: Weather Mood Cinema.
- A concise explanation: movie recommendations based on city weather and mood.
- A city input and disabled or demo-style recommendation preview.
- A sample recommendation card showing weather mood, movie title, poster placeholder, and short reason.
- A short "How it works" section covering weather lookup, mood mapping, and TMDB movie data.
- TMDB attribution text in an About or Credits area.

The first version will not include:

- Live weather API calls.
- Live TMDB API calls.
- User accounts, login, favorites, ratings, or playlists.
- A backend service.

## Architecture

Use a simple static frontend that can be opened locally and deployed later to GitHub Pages, Netlify, or Vercel.

Recommended structure:

- `index.html`: page markup.
- `styles.css`: visual styling and responsive layout.
- `script.js`: tiny demo interaction only if useful, such as changing the preview city label.

This keeps deployment simple and avoids build tooling while the goal is getting a usable project URL.

## Data Flow

First version:

1. User sees the product page.
2. User enters or views a sample city.
3. Page displays a static example recommendation.
4. Page explains that future versions will combine weather data with TMDB movie metadata.

Future API version:

1. User enters a city.
2. App fetches weather from a weather API.
3. App maps weather conditions to a mood category.
4. App queries TMDB or selects from TMDB-backed movie candidates.
5. App displays one or more recommendations with attribution.

## TMDB Usage

TMDB is planned for movie metadata and poster images. The first page must include this notice:

> This product uses the TMDB API but is not endorsed or certified by TMDB.

The page should also link to `https://www.themoviedb.org` from the credits/about area.

## Error Handling

The first version has no external API failures. The later API version should handle:

- Unknown city or missing weather data.
- TMDB authentication failure.
- No matching movie recommendation.
- Network timeout or rate limiting.

Each error should keep the page usable and show a friendly fallback message.

## Testing

For the static first version:

- Open locally in a browser.
- Check desktop and mobile widths.
- Confirm no text overlap.
- Confirm TMDB attribution is visible.
- Confirm any demo interaction works without errors.

For the future API version:

- Test weather-to-mood mapping with fixed sample weather objects.
- Test movie selection with mocked TMDB responses.
- Test API failure states.


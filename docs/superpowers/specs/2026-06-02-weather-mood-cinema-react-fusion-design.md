# Weather Mood Cinema React Fusion Design

## Goal

Merge the newly rebuilt React frontend into Weather Mood Cinema as the primary product experience, while preserving the previously implemented recommendation engine, weather integration, TMDB data flow, and favorites behavior.

The new frontend design is the source of truth for the user experience. Existing vanilla HTML, CSS, and interaction patterns should not be carried forward unless they are reshaped to fit the React frontend's current visual and interaction language.

## Scope

This fusion includes:

- Replace the current static HTML app shell with the React/Vite frontend from `weather-mood-cinema.zip`.
- Preserve the new frontend's full-screen dark map interface, typography, subdued palette, motion style, archive/collections navigation, result cards, and collection card interactions.
- Use map point selection as the primary location entry.
- Add city search as a secondary, low-emphasis jump tool.
- Extend weather lookup so it supports both city names and map coordinates.
- Reuse the existing curated movie library and scoring algorithm.
- Reuse TMDB detail lookup for real poster, overview, year, and rating data.
- Replace the imported frontend's Gemini `/api/recommend` flow with the existing deterministic local scoring flow.
- Preserve Collections as a separate view, but populate it with real TMDB movie data plus recommendation context.
- Keep Netlify Functions for weather and TMDB requests.

This fusion excludes:

- Reintroducing the old large city form, old weather card layout, old result section, or old favorites drawer.
- Using Gemini or another generative model for the main recommendation result.
- Using generated poster images as the primary poster source.
- Adding user accounts, server-side favorites, comments, sharing, or ratings.
- Building a fully custom map tile design beyond the current Leaflet/CARTO dark map approach.
- Copying protected design assets or exact implementations from external reference sites.

## Design Principle

All new or migrated UI must obey the new React frontend's visual and interaction paradigm.

That means:

- Dark cinematic surface.
- Fine borders and low-contrast metadata.
- Small uppercase labels for controls and state.
- Serif display typography for cinematic emphasis.
- Sparse, embedded controls rather than form-heavy layouts.
- Motion that feels archival and restrained.
- Film-card and collection-card structures for movie content.
- No bright legacy cards, marketing sections, instructional blocks, or large utility panels.

When a functional requirement needs additional UI, the UI should be treated as an embedded tool or status readout inside the new experience, not as a transplanted old component.

## Product Flow

1. The app opens in the Archive view with the full-screen map and mood panel.
2. The user primarily selects a location by clicking the map.
3. On map click, the app captures `lat` and `lng`.
4. The frontend calls `/.netlify/functions/weather-mood?lat=<lat>&lng=<lng>`.
5. The function returns normalized location, current weather, `weatherTag`, and `temperatureTag`.
6. The map overlay updates with the location name, weather condition, and temperature.
7. The user selects a mood from the right-side mood panel.
8. The user clicks the recommendation CTA.
9. The frontend builds scoring preferences from weather, temperature, selected mood, and derived atmosphere tags.
10. The frontend scores the curated movie library and picks a top candidate.
11. The frontend calls `/.netlify/functions/movie-search?id=<tmdbId>`.
12. The result section renders the TMDB movie details in the new frontend's film-card style.
13. The user can save the result to Collections.
14. The Collections view shows saved films using the new collection card style and real TMDB data.

## Secondary City Search

City search remains available, but it must be visually secondary to map selection.

Expected behavior:

- The search control is a compact embedded tool, such as a small `Search city` or `Jump to city` input in the map area or header/status layer.
- It uses small type, thin borders, subdued contrast, and the same dark translucent treatment as the rest of the React interface.
- It does not become the hero interaction or primary CTA.
- Submitting a city calls `/.netlify/functions/weather-mood?city=<city>`.
- The returned coordinates update the selected map marker and weather state.
- Failed searches produce a low-emphasis status message in the same UI language as the new frontend.

## Mood Mapping

The existing movie library uses these internal mood tags:

- `relaxed`
- `lonely`
- `healing`
- `excited`
- `nostalgic`
- `sad`
- `gloomy`
- `romantic`
- `tense`

The React UI may display more evocative labels if needed, but each visible mood must map to one of the internal tags. The implementation should avoid changing the movie library tag system unless a later product pass explicitly retags the library.

Recommended first pass:

- Use the nine internal tags directly, with polished display labels that fit the new frontend.
- Keep selected state as a subtle high-contrast inversion, matching the current right-side mood button behavior.

## Weather Function

`weather-mood` should accept either:

```text
/.netlify/functions/weather-mood?city=Shanghai
```

or:

```text
/.netlify/functions/weather-mood?lat=31.23&lng=121.47
```

For city input:

- Use Open-Meteo Geocoding to resolve coordinates.
- Use Open-Meteo Forecast to fetch current weather.
- Return city, country, latitude, longitude, weather, weather code, weather tag, temperature tag, and description.

For coordinate input:

- Use Open-Meteo Forecast directly.
- Derive the same weather and temperature tags.
- Resolve a human-readable location name when reasonable. A lightweight reverse geocoding API may be used, but the UI must tolerate `Selected location` if reverse geocoding fails.

Errors:

- Missing both city and coordinates returns `400`.
- Unknown city returns `404`.
- Weather upstream failure returns `502`.
- Reverse geocoding failure should not fail the whole weather lookup.

## Recommendation Logic

The imported React frontend's `fetchRecommendations` should be replaced by local scoring logic based on the existing implementation.

The recommendation flow should:

- Load the curated `MOVIE_LIBRARY`.
- Derive atmosphere tags from library entries matching the current `weatherTag` or `temperatureTag`.
- Score each movie:
  - `weatherTag` match: `+4`
  - `moodTag` match: `+4`
  - exact `temperatureTag` match: `+2`
  - adjacent `temperatureTag` match: `+1`
  - each matched `atmosphereTag`: `+1`
- Pick from the top scoring candidate pool.
- Fetch TMDB details by `tmdbId`.
- Render one strong recommendation first. Additional recommendations can be added later, but the first implementation should keep the interaction focused.

## TMDB Movie Data

TMDB remains the source for public movie metadata after the app has selected a local candidate.

The result and collection cards should use:

- `title`
- `overview`
- `posterPath`
- `releaseDate`
- `rating`

The app should not ask TMDB to infer mood, weather, or atmosphere. Those remain product-owned through the curated library and scoring system.

Poster rendering should use TMDB image URLs. If a poster is missing, use a new-frontend-compatible placeholder treatment, not generated poster art.

## Collections

The new frontend's Collections view and card interaction should stay.

The stored data should switch from imported AI recommendation fields to TMDB-backed recommendation records:

```ts
interface SavedMovie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number | null;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  weather: string;
  weatherTag: string;
  temperatureTag: string;
  mood: string;
  score: number;
  savedAt: number;
}
```

Collection cards should display the same kind of archival metadata the imported frontend already uses:

- Location
- Weather
- Mood
- Year
- Rating
- Match score, if it can be shown without visual clutter

Cards should keep the new frontend's dark film-object feel, flip interaction, and subdued metadata hierarchy.

## Architecture

The app becomes a React/Vite frontend with Netlify Functions:

- `src/App.tsx`: main Archive and Collections views.
- `src/components/MapComponent.tsx`: Leaflet map selection and selected marker.
- `src/components/CollectionMovieCard.tsx`: saved movie card using TMDB data.
- `src/api.ts`: weather and TMDB request helpers.
- `src/recommendation.ts`: scoring, atmosphere derivation, and candidate picking.
- `src/movie-library.ts`: TypeScript version of the curated movie library, or a typed wrapper around the existing library.
- `src/storage.ts`: favorites persistence helpers.
- `src/types.ts`: shared frontend types.
- `netlify/functions/weather-mood.mjs`: city and coordinate weather lookup.
- `netlify/functions/movie-search.mjs`: TMDB detail lookup by id.

The existing vanilla `script.js` helper logic should be migrated into typed modules rather than imported as a browser script. Existing tests should be kept or adapted to cover the same behaviors.

## Testing

Tests should cover:

- Weather Function supports city input.
- Weather Function supports coordinate input.
- Weather and temperature tag mapping are unchanged.
- TMDB Function still supports `id` detail lookup.
- Movie library tag coverage remains valid.
- Recommendation scoring preserves the existing weighting rules.
- Candidate picking selects from the top scoring pool.
- Favorites storage deduplicates by TMDB id and removes by id.
- React UI enables the recommendation CTA only after weather and mood are selected.
- Map selection updates weather state.
- City search remains secondary but functional.

Before completion, run:

- Unit tests for library, weather mapping, TMDB lookup, recommendation scoring, and storage.
- TypeScript checks.
- Production build.
- Browser checks for desktop and mobile to verify no visual overlap, no horizontal overflow, map rendering, mood selection, recommendation rendering, and Collections behavior.

## Deployment

The project should build as a Vite app and keep Netlify Functions in place.

The Netlify setup should support:

- Vite frontend build output.
- `netlify/functions/` Function deployment.
- Existing `TMDB_API_KEY` environment variable.

Open-Meteo does not require an environment variable.

If a reverse geocoding provider requires a key, it should either be avoided in the first implementation or added as an optional enhancement. The core map flow should work without it.

## Migration Notes

The old static app files should not remain as competing product entry points. They can be removed or archived during implementation once the React app is wired and tested.

The imported React frontend should also be cleaned of now-unused Gemini server code, generated poster prompts, and `/api/recommend` assumptions.

The first implementation should prioritize preserving the new frontend's feel over exposing every possible old data field. When in doubt, show less information with stronger visual fit.

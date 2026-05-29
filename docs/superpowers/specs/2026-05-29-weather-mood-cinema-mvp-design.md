# Weather Mood Cinema MVP Design

## Goal

Build the first real product loop for Weather Mood Cinema without map selection. A user should be able to search for a city, see current weather context, choose a mood, generate a movie recommendation from a curated tagged movie library, and save that movie to local favorites.

## Scope

This MVP includes:

- City search by typed city name.
- A weather card that shows the selected city, current temperature, weather condition, `weatherTag`, and `temperatureTag`.
- A fixed mood picker with nine choices: relaxed, lonely, healing, excited, nostalgic, sad, gloomy, romantic, and tense.
- A curated movie library of about 50 movies. Each movie stores a `tmdbId` plus product-owned tags.
- A tag scoring algorithm that ranks the curated library using weather, temperature, mood, and atmosphere tags.
- A recommendation result that uses the selected movie's `tmdbId` to fetch real TMDB title, poster, overview, release year, and rating.
- A save favorite action on the result view.
- A favorites drawer or panel on the home view backed by browser `localStorage`.

This MVP excludes:

- Map selection, map drag, and coordinate picking.
- User accounts, server-side favorites, ratings, comments, or sharing.
- Music recommendations.
- Large-scale automatic TMDB tagging or database ingestion.
- Direct TMDB mood or atmosphere search.

## Product Flow

1. The home view opens with city search at the top and a weather card beside or below it depending on screen width.
2. The user enters a city and submits the search.
3. The frontend calls `/.netlify/functions/weather-mood?city=<city>`.
4. The weather card updates with normalized city, weather, and temperature data.
5. The user scrolls to a fixed set of mood buttons and selects one mood.
6. The user clicks Generate.
7. The app builds a user preference object from `weatherTag`, `temperatureTag`, selected `moodTag`, and dynamically derived `atmosphereTags`.
8. The app scores every movie in the curated library, sorts candidates, picks one movie from the top scoring group, and calls TMDB by `tmdbId` for display details.
9. The user can save the shown movie to favorites.
10. The user can return to the home view and open favorites from the home screen.

## Architecture

The project remains a small static app with Netlify Functions:

- `index.html` owns both the home view and result view markup.
- `styles.css` owns responsive layout and visual states.
- `script.js` owns client state, form events, rendering, scoring, random selection, and `localStorage` favorites.
- `movie-library.js` exports the curated movie library and controlled tag lists.
- `netlify/functions/weather-mood.mjs` wraps Open-Meteo geocoding and forecast APIs. It returns weather and temperature tags, not movie queries.
- `netlify/functions/movie-search.mjs` should be adapted or complemented so the frontend can fetch TMDB movie details by `tmdbId` while keeping `TMDB_API_KEY` hidden.

Open-Meteo does not require an API key, but weather logic stays behind a Netlify Function so provider details and weather code mapping do not leak into UI code. TMDB is used only for trusted movie metadata once the app has already selected a `tmdbId` from the local library.

## Tag System

`weatherTags` are hard weather categories:

- clear
- cloudy
- rainy
- foggy
- snowy
- stormy

`temperatureTags` are body-feel categories:

- cold: `<= 5°C`
- cool: `6-15°C`
- mild: `16-23°C`
- warm: `24-30°C`
- hot: `>= 31°C`

`moodTags` are user-selected emotional goals:

- relaxed
- lonely
- healing
- excited
- nostalgic
- sad
- gloomy
- romantic
- tense

`atmosphereTags` describe movie space, style, and texture rather than user emotion:

- urban
- rural
- interior
- road
- coastal
- wilderness
- noir
- mystery
- dreamlike
- surreal
- period
- intimate
- grand
- gritty
- cozy

## Curated Movie Library

Each movie in the local library should use this structure:

```js
{
  tmdbId: 843,
  title: "In the Mood for Love",
  weatherTags: ["rainy", "cloudy"],
  temperatureTags: ["cool", "mild"],
  moodTags: ["lonely", "romantic", "nostalgic"],
  atmosphereTags: ["urban", "interior", "period", "intimate"]
}
```

The first library should aim for about 50 movies. It does not need perfect coverage, but it should include enough variety that each `weatherTag` and each `moodTag` has multiple candidates.

## Atmosphere Preference

Atmosphere tags serve as weak tie-breakers. They should not be hand-wired forever as `rainy -> noir` or `clear -> road`, because that can drift away from the actual movie library.

Instead, the app should derive current atmosphere preferences from the library:

1. Find movies that match the current `weatherTag` or `temperatureTag`.
2. Count the `atmosphereTags` used by those movies.
3. Use the top 3-5 most common atmosphere tags as the current `atmosphereTags` preference.

This keeps the recommendation system self-consistent: the atmosphere preferences always come from the movies we actually curated.

## Scoring

Every movie in the curated library is scored against the current user preference:

- `weatherTag` match: `+4`
- `moodTag` match: `+4`
- exact `temperatureTag` match: `+2`
- adjacent `temperatureTag` match: `+1`
- each matched `atmosphereTag`: `+1`

The app should sort all movies by score, take a small top candidate pool, and randomly pick one movie from that pool. It should not always return the single highest scoring movie, because repeated conditions should still feel a little fresh.

If all movies score `0`, the app should fall back to a random curated movie and show a gentle explanation that the match is exploratory.

## Weather Function

`weather-mood` accepts a `city` query parameter and returns normalized data:

```json
{
  "city": "Beijing",
  "country": "China",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "temperature": 21,
  "weather": "Clear sky",
  "weatherCode": 0,
  "weatherTag": "clear",
  "temperatureTag": "mild",
  "description": "Clear weather in Beijing gives the day a bright, open texture."
}
```

If the city cannot be found, the function returns `404` with:

```json
{
  "error": "City not found"
}
```

If Open-Meteo fails, the function returns `502` with:

```json
{
  "error": "Weather lookup failed"
}
```

## TMDB Detail Lookup

The app should not ask TMDB to infer mood or atmosphere. It should first select a local movie, then request TMDB details by id. The TMDB response is used for:

- title
- overview
- poster path
- release date
- rating

This keeps the recommendation logic product-owned while still using TMDB for accurate public movie metadata and images.

## Favorites

Favorites are stored in `localStorage` under `weatherMoodCinemaFavorites`. Each saved movie stores:

```json
{
  "id": 843,
  "title": "In the Mood for Love",
  "overview": "Two neighbors form a strong bond after both suspect extramarital activities of their spouses.",
  "posterPath": "/iYypPT4bhqXfq1b6EnmxvRt6b2Y.jpg",
  "releaseDate": "2000-09-29",
  "rating": 8.1,
  "city": "Beijing",
  "weather": "Clear sky",
  "weatherTag": "clear",
  "temperatureTag": "mild",
  "mood": "nostalgic",
  "score": 10
}
```

Saving an already saved movie should not create duplicates. The favorites panel should show an empty state when no favorites exist and a remove action for each saved item.

## UI Behavior

The app should keep the first screen useful and compact:

- The city search and weather card are the primary first-view actions.
- Mood selection appears below the first section.
- Generate is disabled until a city weather result and mood are both selected.
- Result view can be implemented as a second in-page section controlled by state rather than a separate HTML file.
- Loading states should disable the active button and use concise labels such as `Checking...` or `Finding...`.
- Errors should be shown near the relevant area and should not clear the user's city or selected mood.

## Testing

Automated tests should cover:

- `weather-mood` returns normalized weather and temperature tags from mocked Open-Meteo responses.
- `weather-mood` returns `404` for unknown cities.
- Weather code mapping produces stable `weatherTag` values.
- Temperature mapping produces stable `temperatureTag` values.
- The curated movie library has valid tag names and no duplicate `tmdbId` values.
- Atmosphere preference derivation returns tags that exist in the curated library.
- Movie scoring handles weather, mood, exact temperature, adjacent temperature, and atmosphere matches.
- Top candidate selection does not always require selecting the single highest movie.
- Favorites save, duplicate prevention, removal, and empty-state behavior.
- Existing TMDB rendering behavior continues to pass.

Manual verification should cover:

- Desktop and mobile layout without text overlap.
- City search updates the weather card.
- Mood selection enables Generate only after weather exists.
- Generate shows a real TMDB movie selected from the local curated library.
- Recommendations change when weather, temperature, or mood changes.
- Save favorite persists after page refresh.

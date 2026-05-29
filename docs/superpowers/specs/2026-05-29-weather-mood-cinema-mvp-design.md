# Weather Mood Cinema MVP Design

## Goal

Build the first real product loop for Weather Mood Cinema without map selection. A user should be able to pick a city by search, see current weather context, choose a fixed mood, generate a movie recommendation on a result view, and save that movie to a local favorites list.

## Scope

This MVP includes:

- City search by typed city name.
- A weather card that shows the selected city, current temperature, weather condition, and a short city/weather description.
- A fixed mood picker with options such as relaxed, lonely, healing, excited, nostalgic, gloomy, romantic, and tense.
- A Generate action that combines weather and mood into a TMDB movie query.
- A result view that shows a real TMDB movie title, poster, overview, release year, and rating.
- A save favorite action on the result view.
- A favorites drawer or panel on the home view backed by browser `localStorage`.

This MVP excludes:

- Map selection, map drag, and coordinate picking.
- User accounts, server-side favorites, ratings, comments, or sharing.
- Music recommendations.
- Complex recommendation ranking beyond a simple weather and mood query mapping.

## Product Flow

1. The home view opens with city search at the top and a weather card beside or below it depending on screen width.
2. The user enters a city and submits the search.
3. The frontend calls `/.netlify/functions/weather-mood?city=<city>`.
4. The weather card updates with normalized city and weather data.
5. The user scrolls to a fixed set of mood buttons and selects one mood.
6. The user clicks Generate.
7. The app builds a movie query from the weather response and selected mood, calls `/.netlify/functions/movie-search?query=<query>`, and shows a result view.
8. The user can save the shown movie to favorites.
9. The user can return to the home view and open favorites from the home screen.

## Architecture

The project remains a small static app with Netlify Functions:

- `index.html` owns both the home view and result view markup.
- `styles.css` owns responsive layout and visual states.
- `script.js` owns client state, form events, rendering, query mapping, and `localStorage` favorites.
- `netlify/functions/weather-mood.mjs` wraps Open-Meteo geocoding and forecast APIs.
- `netlify/functions/movie-search.mjs` remains the TMDB proxy and continues to hide `TMDB_API_KEY`.

The frontend should call only project-owned functions. Open-Meteo does not require an API key, but keeping weather logic behind a Netlify Function makes later provider changes easier and keeps weather-to-mood mapping out of the UI layer.

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
  "moodFromWeather": "bright",
  "movieQueryBase": "sunny adventure",
  "description": "Clear weather in Beijing points toward something bright and open."
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

## Mood And Movie Mapping

The UI exposes these mood values:

- relaxed
- lonely
- healing
- excited
- nostalgic
- gloomy
- romantic
- tense

The final movie query combines the selected mood with the weather query base. Examples:

- bright + nostalgic -> `nostalgic sunny adventure`
- rainy + lonely -> `lonely rainy drama`
- cold + tense -> `tense winter thriller`
- foggy + gloomy -> `gloomy fog mystery`

The first implementation can use simple deterministic string mapping. It should avoid using only `rain`, because that currently causes the app to keep returning `Rain Man`.

## Favorites

Favorites are stored in `localStorage` under `weatherMoodCinemaFavorites`. Each saved movie stores:

```json
{
  "id": 123,
  "title": "Rain Town",
  "overview": "A quiet story for a rainy day.",
  "posterPath": "/rain-town.jpg",
  "releaseDate": "2024-02-14",
  "rating": 7.6,
  "city": "Beijing",
  "weather": "Clear sky",
  "mood": "nostalgic"
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

- `weather-mood` returns normalized weather data from mocked Open-Meteo responses.
- `weather-mood` returns `404` for unknown cities.
- Weather code mapping produces stable `moodFromWeather` and `movieQueryBase` values.
- Frontend query building combines selected mood and weather query base.
- Favorites save, duplicate prevention, removal, and empty-state behavior.
- Existing TMDB movie rendering behavior continues to pass.

Manual verification should cover:

- Desktop and mobile layout without text overlap.
- City search updates the weather card.
- Mood selection enables Generate only after weather exists.
- Generate shows a real TMDB movie that changes when weather or mood changes.
- Save favorite persists after page refresh.

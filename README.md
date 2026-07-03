# Compare Weather

Compare Weather is a small Next.js app used to show a simple feature-based front-end pattern. The app happens to compare city weather, but the main idea is the structure: keep a feature together, separate data from display, and make the UI easy to test and change.

## What this project shows

- A feature folder that owns its own data, state, types, validation, formatting, and tests.
- A feature component that prepares data for the screen.
- A presentational component that receives `input` and emits `output`.
- A simple API boundary around an external service.
- A folder structure where `src` shows app routes and features, not generic buckets.

## Architecture

```text
src/
  app/                    # Next.js routes only
  features/
    weather/              # Complete feature
      WeatherFeature.tsx  # Owns state, queries, persistence, and feature wiring
      WeatherView.tsx     # Dumb UI: receives input and emits output
      weather-provider.ts # Server-side API adapter
      weather-query.ts    # Client request for this feature
      weather-schema.ts   # Zod schemas for this feature
      weather-types.ts    # Feature-specific types
      weather-format.ts   # Feature-specific formatting and conversion logic
```

`WeatherFeature` is the feature boundary. It can be moved as a unit because it brings its own state, data fetching, query provider, and local storage logic.

`WeatherView` is the dumb component. It does not fetch data or own business logic. It gets everything through an `input` object and reports user actions through an `output` object.

This makes the front end easier to test because the view can be rendered with plain input data. It also makes the feature easier to maintain because data work and display work are not mixed together.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your OpenWeatherMap API key:

   ```env
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - start the development server.
- `npm run build` - create a production build.
- `npm run start` - serve the production build.
- `npm run lint` - run ESLint.
- `npm run test` - run unit tests with Vitest.
- `npm run format` - format the codebase with Prettier.

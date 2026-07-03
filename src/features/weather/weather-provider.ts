import { NextResponse } from "next/server";
import {
  aqiLabel,
  formatTimezone,
  kelvinToFahrenheit,
  localDateKeyFromUnix,
} from "./weather-format";
import type { ForecastDay, WeatherReport } from "./weather-types";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

type CurrentWeatherPayload = {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{ main: string; description: string; icon: string }>;
  wind: { speed: number; deg: number };
  visibility: number;
  timezone: number;
};

type ForecastPayload = {
  list: Array<{
    dt: number;
    main: { temp_min: number; temp_max: number };
    weather: Array<{ main: string; icon: string }>;
    pop?: number;
  }>;
};

type AirQualityPayload = { list: Array<{ main: { aqi: number } }> };
type UvPayload = { value?: number };
type GeoPayload = { name: string; lat: number; lon: number; country: string };

class WeatherProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function fetchWeatherJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 300 } });

  if (!response.ok) {
    throw new WeatherProviderError(
      response.status === 404
        ? "City not found."
        : "Weather provider is unavailable.",
      response.status === 404 ? 404 : 502,
    );
  }

  return response.json() as Promise<T>;
}

export async function getWeatherReport(city: string): Promise<WeatherReport> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new WeatherProviderError(
      "OPENWEATHER_API_KEY is not configured.",
      500,
    );
  }

  const locations = await fetchWeatherJson<GeoPayload[]>(
    `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`,
  );
  const location = locations.at(0);
  if (!location) throw new WeatherProviderError("City not found.", 404);

  const coordinates = `lat=${location.lat}&lon=${location.lon}&appid=${apiKey}`;
  const [current, forecast, air, uv] = await Promise.all([
    fetchWeatherJson<CurrentWeatherPayload>(
      `${BASE_URL}/weather?${coordinates}`,
    ),
    fetchWeatherJson<ForecastPayload>(`${BASE_URL}/forecast?${coordinates}`),
    fetchWeatherJson<AirQualityPayload>(
      `${BASE_URL}/air_pollution?${coordinates}`,
    ).catch(() => undefined),
    fetchWeatherJson<UvPayload>(`${BASE_URL}/uvi?${coordinates}`).catch(
      () => undefined,
    ),
  ]);

  const condition = current.weather[0];
  const aqi = air?.list[0]?.main.aqi;

  return {
    city: current.name || location.name,
    country: current.sys.country || location.country,
    temperature: kelvinToFahrenheit(current.main.temp),
    feelsLike: kelvinToFahrenheit(current.main.feels_like),
    condition: condition?.main ?? "Weather",
    description: condition?.description ?? "Current conditions",
    icon: condition?.icon ?? "01d",
    humidity: current.main.humidity,
    windSpeed: current.wind.speed * 2.23694,
    windDirection: current.wind.deg,
    pressure: current.main.pressure,
    visibility: current.visibility,
    uvIndex: uv?.value,
    sunrise: current.sys.sunrise,
    sunset: current.sys.sunset,
    chanceOfRain:
      forecast.list[0]?.pop === undefined
        ? undefined
        : Math.round(forecast.list[0].pop * 100),
    timezoneOffset: current.timezone,
    timezone: formatTimezone(current.timezone),
    airQuality: aqi ? { aqi, label: aqiLabel(aqi) } : undefined,
    forecast: createForecast(forecast, current.timezone),
  };
}

function createForecast(
  forecast: ForecastPayload,
  timezoneOffsetSeconds: number,
): ForecastDay[] {
  const days = new Map<string, ForecastDay>();

  for (const item of forecast.list) {
    const date = localDateKeyFromUnix(item.dt, timezoneOffsetSeconds);
    const min = kelvinToFahrenheit(item.main.temp_min);
    const max = kelvinToFahrenheit(item.main.temp_max);
    const rainChance =
      item.pop === undefined ? undefined : Math.round(item.pop * 100);
    const existing = days.get(date);

    if (!existing) {
      days.set(date, {
        date,
        min,
        max,
        icon: item.weather[0]?.icon ?? "01d",
        condition: item.weather[0]?.main ?? "Forecast",
        rainChance,
      });
      continue;
    }

    existing.min = Math.min(existing.min, min);
    existing.max = Math.max(existing.max, max);
    if (rainChance !== undefined) {
      existing.rainChance =
        existing.rainChance === undefined
          ? rainChance
          : Math.max(existing.rainChance, rainChance);
    }
  }

  return Array.from(days.values()).slice(0, 5);
}

export function weatherErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unable to load weather.";
  const status = error instanceof WeatherProviderError ? error.status : 400;

  return NextResponse.json({ error: message }, { status });
}

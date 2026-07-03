import type { WeatherReport } from "./weather-types";

export async function fetchWeatherReport(city: string): Promise<WeatherReport> {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load weather.");
  }

  return payload;
}

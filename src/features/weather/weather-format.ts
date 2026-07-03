const WIND_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const AQI_LABELS = ["Good", "Fair", "Moderate", "Poor", "Very poor"];

export function metersToMiles(meters: number) {
  return meters / 1609.344;
}

export function kelvinToFahrenheit(kelvin: number) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

export function formatTemperature(value: number) {
  return `${Math.round(value)}°`;
}

export function formatWindDirection(degrees: number) {
  return WIND_DIRECTIONS[Math.round(degrees / 45) % WIND_DIRECTIONS.length];
}

export function formatTimezone(offsetSeconds: number) {
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetSeconds);
  const hours = Math.floor(absolute / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((absolute % 3600) / 60)
    .toString()
    .padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}

export function formatLocalTime(
  timezoneOffsetSeconds: number,
  date = new Date(),
) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date.getTime() + timezoneOffsetSeconds * 1000));
}

export function formatTimeFromUnix(
  timestamp: number,
  timezoneOffsetSeconds: number,
) {
  return (
    formatLocalTime(timezoneOffsetSeconds, new Date(timestamp * 1000))
      .split(", ")
      .at(-1) ?? "—"
  );
}

export function localDateKeyFromUnix(
  timestamp: number,
  timezoneOffsetSeconds: number,
) {
  return new Date(timestamp * 1000 + timezoneOffsetSeconds * 1000)
    .toISOString()
    .slice(0, 10);
}

export function daylightHours(sunrise: number, sunset: number) {
  return Math.max(0, (sunset - sunrise) / 3600);
}

export function formatDaylight(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes}m`;
}

export function aqiLabel(aqi?: number) {
  if (!aqi) return "Unavailable";
  return AQI_LABELS[aqi - 1] ?? "Unavailable";
}

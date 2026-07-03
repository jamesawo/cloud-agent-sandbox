import Image from "next/image";
import {
  CloudRain,
  Clock,
  Droplets,
  Eye,
  Gauge,
  Leaf,
  Search,
  Sunrise,
  Sunset,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  daylightHours,
  formatDaylight,
  formatLocalTime,
  formatTemperature,
  formatTimeFromUnix,
  formatWindDirection,
  metersToMiles,
} from "./weather-format";
import type {
  WeatherComparison,
  WeatherHighlight,
  WeatherReport,
} from "./weather-types";

export type WeatherViewInput = {
  city: string;
  compareCity: string;
  compareEnabled: boolean;
  first?: WeatherReport;
  second?: WeatherReport;
  firstLoading: boolean;
  secondLoading: boolean;
  firstError?: string;
  secondError?: string;
  highlights: WeatherComparison;
};

export type WeatherViewOutput = {
  onCityChange: (city: string) => void;
  onCompareCityChange: (city: string) => void;
  onCompareEnabledChange: (enabled: boolean) => void;
  onSearch: () => void;
};

export function WeatherView({
  input,
  output,
}: {
  input: WeatherViewInput;
  output: WeatherViewOutput;
}) {
  return (
    <main className="weather-gradient min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-4 py-8 text-center sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Compare Weather
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            A calmer way to read the sky.
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-slate-600">
            Search global weather, compare cities, and see the details that
            matter in one polished dashboard.
          </p>
        </header>

        <SearchPanel input={input} output={output} />

        <section className="grid gap-6 lg:grid-cols-2">
          <WeatherSlot
            loading={input.firstLoading}
            error={input.firstError}
            report={input.first}
            highlights={input.highlights.first}
          />
          {input.compareEnabled && (
            <WeatherSlot
              loading={input.secondLoading}
              error={input.secondError}
              report={input.second}
              highlights={input.highlights.second}
            />
          )}
        </section>

        {input.compareEnabled && input.first && input.second && (
          <ComparisonTable
            first={input.first}
            second={input.second}
            highlights={input.highlights}
          />
        )}
      </section>
    </main>
  );
}

function SearchPanel({
  input,
  output,
}: {
  input: WeatherViewInput;
  output: WeatherViewOutput;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        output.onSearch();
      }}
      className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-apple backdrop-blur sm:p-6"
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="relative block">
            <span className="sr-only">Search city</span>
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              value={input.city}
              onChange={(event) => output.onCityChange(event.target.value)}
              className="h-12 w-full rounded-full border border-slate-200 bg-white/80 px-12 text-base shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500"
              placeholder="Search any city"
            />
          </label>
          {input.compareEnabled && (
            <input
              value={input.compareCity}
              onChange={(event) =>
                output.onCompareCityChange(event.target.value)
              }
              className="h-12 w-full rounded-full border border-slate-200 bg-white/80 px-5 text-base shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500"
              placeholder="Compare with another city"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center justify-between gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700">
            Compare mode
            <button
              type="button"
              role="switch"
              aria-checked={input.compareEnabled}
              onClick={() =>
                output.onCompareEnabledChange(!input.compareEnabled)
              }
              className="relative h-7 w-12 rounded-full bg-slate-300 transition-colors aria-checked:bg-blue-600"
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${input.compareEnabled ? "translate-x-5" : ""}`}
              />
            </button>
          </label>
          <button
            type="submit"
            className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
          >
            Update weather
          </button>
        </div>
      </div>
    </form>
  );
}

function WeatherSlot({
  loading,
  error,
  report,
  highlights,
}: {
  loading: boolean;
  error?: string;
  report?: WeatherReport;
  highlights: WeatherHighlight;
}) {
  if (loading) return <WeatherSkeleton />;
  if (error)
    return (
      <Card>
        <div className="p-6 text-red-600">{error}</div>
      </Card>
    );
  if (!report) return null;
  return <WeatherCard report={report} highlights={highlights} />;
}

function WeatherCard({
  report,
  highlights,
}: {
  report: WeatherReport;
  highlights: WeatherHighlight;
}) {
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {report.city}, {report.country}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />{" "}
            {formatLocalTime(report.timezoneOffset)} · {report.timezone}
          </p>
        </div>
        <Image
          src={`https://openweathermap.org/img/wn/${report.icon}@4x.png`}
          alt={report.description}
          width={92}
          height={92}
          className="drop-shadow-lg"
        />
      </div>

      <div className="space-y-6 p-6 pt-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div
              className={`text-7xl font-semibold tracking-tighter ${highlights.temperature ? "text-blue-600" : ""}`}
            >
              {formatTemperature(report.temperature)}
            </div>
            <p className="capitalize text-slate-500">
              Feels like {formatTemperature(report.feelsLike)} ·{" "}
              {report.description}
            </p>
          </div>
          {report.chanceOfRain !== undefined && (
            <Metric
              icon={CloudRain}
              label="Rain"
              value={`${report.chanceOfRain}%`}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric
            highlighted={highlights.humidity}
            icon={Droplets}
            label="Humidity"
            value={`${report.humidity}%`}
          />
          <Metric
            highlighted={highlights.wind}
            icon={Wind}
            label="Wind"
            value={`${Math.round(report.windSpeed)} mph ${formatWindDirection(report.windDirection)}`}
          />
          <Metric
            icon={Gauge}
            label="Pressure"
            value={`${report.pressure} hPa`}
          />
          <Metric
            icon={Eye}
            label="Visibility"
            value={`${metersToMiles(report.visibility).toFixed(1)} mi`}
          />
          <Metric
            icon={Sunrise}
            label="Sunrise"
            value={formatTimeFromUnix(report.sunrise, report.timezoneOffset)}
          />
          <Metric
            icon={Sunset}
            label="Sunset"
            value={formatTimeFromUnix(report.sunset, report.timezoneOffset)}
          />
          <Metric
            highlighted={highlights.air}
            icon={Leaf}
            label="Air quality"
            value={report.airQuality?.label ?? "Unavailable"}
          />
          <Metric
            highlighted={highlights.daylight}
            icon={Sunrise}
            label="Daylight"
            value={formatDaylight(daylightHours(report.sunrise, report.sunset))}
          />
          <Metric
            icon={Gauge}
            label="UV Index"
            value={report.uvIndex?.toFixed(1) ?? "Unavailable"}
          />
        </div>

        <Forecast report={report} />
      </div>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlighted,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white/65 p-4 ${highlighted ? "ring-2 ring-blue-600" : ""}`}
    >
      <Icon className="mb-3 h-5 w-5 text-blue-600" />
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Forecast({ report }: { report: WeatherReport }) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">5-day forecast</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {report.forecast.map((day) => (
          <div
            key={day.date}
            className="rounded-2xl bg-slate-50 p-3 text-center"
          >
            <p className="text-sm font-medium">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
            <Image
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.condition}
              width={56}
              height={56}
              className="mx-auto"
            />
            <p className="text-sm text-slate-500">
              {Math.round(day.max)}° / {Math.round(day.min)}°
            </p>
            {day.rainChance !== undefined && (
              <p className="text-xs text-blue-600">{day.rainChance}% rain</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonTable({
  first,
  second,
  highlights,
}: {
  first: WeatherReport;
  second: WeatherReport;
  highlights: WeatherComparison;
}) {
  const rows = [
    [
      "Warmer city",
      `${Math.round(first.temperature)}°`,
      `${Math.round(second.temperature)}°`,
      "temperature",
    ],
    [
      "Higher humidity",
      `${first.humidity}%`,
      `${second.humidity}%`,
      "humidity",
    ],
    [
      "Stronger winds",
      `${Math.round(first.windSpeed)} mph`,
      `${Math.round(second.windSpeed)} mph`,
      "wind",
    ],
    [
      "Better air quality",
      first.airQuality?.label ?? "Unavailable",
      second.airQuality?.label ?? "Unavailable",
      "air",
    ],
    [
      "Longer daylight",
      formatDaylight(daylightHours(first.sunrise, first.sunset)),
      formatDaylight(daylightHours(second.sunrise, second.sunset)),
      "daylight",
    ],
  ] as const;

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Side-by-side comparison
        </h2>
      </div>
      <div className="px-6 pb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3">Metric</th>
                <th>
                  {first.city}
                  <br />
                  <span className="font-normal text-slate-500">
                    {formatLocalTime(first.timezoneOffset)}
                  </span>
                </th>
                <th>
                  {second.city}
                  <br />
                  <span className="font-normal text-slate-500">
                    {formatLocalTime(second.timezoneOffset)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, firstValue, secondValue, key]) => (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-3 font-medium">{label}</td>
                  <td
                    className={
                      highlights.first[key] ? "font-bold text-blue-600" : ""
                    }
                  >
                    {firstValue}
                  </td>
                  <td
                    className={
                      highlights.second[key] ? "font-bold text-blue-600" : ""
                    }
                  >
                    {secondValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function WeatherSkeleton() {
  return (
    <Card>
      <div className="space-y-4 p-6">
        <div className="h-10 w-1/2 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border bg-white/85 text-slate-950 shadow-apple backdrop-blur ${className}`}
    >
      {children}
    </article>
  );
}

"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { WeatherView } from "./WeatherView";
import { fetchWeatherReport } from "./weather-query";
import { daylightHours } from "./weather-format";
import type { WeatherComparison, WeatherReport } from "./weather-types";

const STORAGE_KEY = "compare-weather:cities";

export function WeatherFeature() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 300_000 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WeatherFeatureContent />
    </QueryClientProvider>
  );
}

function WeatherFeatureContent() {
  const [city, setCity] = useState("San Francisco");
  const [compareCity, setCompareCity] = useState("Tokyo");
  const [activeCity, setActiveCity] = useState(city);
  const [activeCompareCity, setActiveCompareCity] = useState(compareCity);
  const [compareEnabled, setCompareEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const cities = JSON.parse(saved) as string[];
    if (cities[0]) {
      setCity(cities[0]);
      setActiveCity(cities[0]);
    }
    if (cities[1]) {
      setCompareCity(cities[1]);
      setActiveCompareCity(cities[1]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([activeCity, activeCompareCity].filter(Boolean)),
    );
  }, [activeCity, activeCompareCity]);

  const first = useWeather(activeCity);
  const second = useWeather(compareEnabled ? activeCompareCity : undefined);
  const highlights = useMemo(
    () => compareReports(first.data, second.data),
    [first.data, second.data],
  );

  return (
    <WeatherView
      input={{
        city,
        compareCity,
        compareEnabled,
        first: first.data,
        second: second.data,
        firstLoading: first.isLoading,
        secondLoading: second.isLoading,
        firstError: first.error?.message,
        secondError: second.error?.message,
        highlights,
      }}
      output={{
        onCityChange: setCity,
        onCompareCityChange: setCompareCity,
        onCompareEnabledChange: setCompareEnabled,
        onSearch: () => {
          if (city.trim()) setActiveCity(city.trim());
          if (compareEnabled && compareCity.trim())
            setActiveCompareCity(compareCity.trim());
        },
      }}
    />
  );
}

function useWeather(city?: string) {
  return useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetchWeatherReport(city!),
    enabled: Boolean(city),
  });
}

function compareReports(
  first?: WeatherReport,
  second?: WeatherReport,
): WeatherComparison {
  if (!first || !second) return { first: {}, second: {} };

  return {
    first: {
      temperature: first.temperature > second.temperature,
      humidity: first.humidity > second.humidity,
      wind: first.windSpeed > second.windSpeed,
      air: (first.airQuality?.aqi ?? 99) < (second.airQuality?.aqi ?? 99),
      daylight:
        daylightHours(first.sunrise, first.sunset) >
        daylightHours(second.sunrise, second.sunset),
    },
    second: {
      temperature: second.temperature > first.temperature,
      humidity: second.humidity > first.humidity,
      wind: second.windSpeed > first.windSpeed,
      air: (second.airQuality?.aqi ?? 99) < (first.airQuality?.aqi ?? 99),
      daylight:
        daylightHours(second.sunrise, second.sunset) >
        daylightHours(first.sunrise, first.sunset),
    },
  };
}

import { describe, expect, it } from "vitest";
import {
  aqiLabel,
  daylightHours,
  formatDaylight,
  formatLocalTime,
  formatTimezone,
  formatWindDirection,
  kelvinToFahrenheit,
  localDateKeyFromUnix,
  metersToMiles,
} from "../weather-format";

describe("weather formatting", () => {
  it("converts Kelvin to Fahrenheit", () => {
    expect(kelvinToFahrenheit(273.15)).toBeCloseTo(32);
  });

  it("converts meters to miles", () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1);
  });

  it("formats wind directions", () => {
    expect(formatWindDirection(0)).toBe("N");
    expect(formatWindDirection(90)).toBe("E");
    expect(formatWindDirection(225)).toBe("SW");
  });

  it("formats timezone offsets", () => {
    expect(formatTimezone(19_800)).toBe("UTC+05:30");
    expect(formatTimezone(-18_000)).toBe("UTC-05:00");
  });

  it("applies only the city offset when formatting local time", () => {
    const time = formatLocalTime(0, new Date("2026-01-01T00:00:00.000Z"));
    expect(time).toContain("12:00 AM");
  });

  it("creates city-local forecast date keys", () => {
    const timestamp = Date.parse("2026-01-01T23:00:00.000Z") / 1000;
    expect(localDateKeyFromUnix(timestamp, 7_200)).toBe("2026-01-02");
    expect(localDateKeyFromUnix(timestamp, -18_000)).toBe("2026-01-01");
  });

  it("calculates and formats daylight", () => {
    expect(daylightHours(0, 36_900)).toBeCloseTo(10.25);
    expect(formatDaylight(10.25)).toBe("10h 15m");
    expect(formatDaylight(1.999)).toBe("2h 0m");
  });

  it("labels air quality index", () => {
    expect(aqiLabel(1)).toBe("Good");
    expect(aqiLabel(5)).toBe("Very poor");
  });
});

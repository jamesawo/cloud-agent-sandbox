import { describe, expect, it } from "vitest";
import {
  aqiLabel,
  daylightHours,
  formatDaylight,
  formatTimezone,
  formatWindDirection,
  kelvinToFahrenheit,
  metersToMiles,
} from "../weather-format";

describe("weather utilities", () => {
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

  it("calculates and formats daylight", () => {
    expect(daylightHours(0, 36_900)).toBeCloseTo(10.25);
    expect(formatDaylight(10.25)).toBe("10h 15m");
  });

  it("labels air quality index", () => {
    expect(aqiLabel(1)).toBe("Good");
    expect(aqiLabel(5)).toBe("Very poor");
  });
});

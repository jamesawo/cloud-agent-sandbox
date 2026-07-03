import { z } from "zod";

export const weatherSearchSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Enter at least two characters")
    .max(80, "City name is too long"),
});

export const weatherReportSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  condition: z.string(),
  description: z.string(),
  icon: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  pressure: z.number(),
  visibility: z.number(),
  uvIndex: z.number().optional(),
  sunrise: z.number(),
  sunset: z.number(),
  chanceOfRain: z.number().optional(),
  timezoneOffset: z.number(),
  timezone: z.string(),
  airQuality: z.object({ aqi: z.number(), label: z.string() }).optional(),
  forecast: z.array(
    z.object({
      date: z.string(),
      min: z.number(),
      max: z.number(),
      icon: z.string(),
      condition: z.string(),
      rainChance: z.number().optional(),
    }),
  ),
});

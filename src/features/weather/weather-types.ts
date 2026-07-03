export type ForecastDay = {
  date: string;
  min: number;
  max: number;
  icon: string;
  condition: string;
  rainChance?: number;
};

export type WeatherReport = {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  sunrise: number;
  sunset: number;
  chanceOfRain?: number;
  timezoneOffset: number;
  timezone: string;
  airQuality?: { aqi: number; label: string };
  forecast: ForecastDay[];
};

export type WeatherHighlight = {
  temperature?: boolean;
  humidity?: boolean;
  wind?: boolean;
  air?: boolean;
  daylight?: boolean;
};

export type WeatherComparison = {
  first: WeatherHighlight;
  second: WeatherHighlight;
};

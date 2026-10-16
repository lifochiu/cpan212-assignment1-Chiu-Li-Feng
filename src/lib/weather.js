import { config } from "../config.js";
import { geocodeCity, getForecast } from "./open-meteo.js";
import { describeWeatherCode } from "./weather-codes.js";
import { TtlCache } from "./cache.js";

// TODO (you): create one cache for the whole app, with a time to live of
// config.cacheTtlSeconds.

// TODO (you): return the weather summary for one city, in the shape shown on
// the assignment page. Check the cache first. On a miss, geocode the city, get
// the forecast, build the summary, store it, and return it with cached: false.
// On a hit, return the stored summary with cached: true.
const cache = new TtlCache(config.cacheTtlSeconds);

export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();
  const cachedWeather = cache.get(key);
  if (cachedWeather !== undefined) {
    return {
      ...cachedWeather,
      cached: true,
    };
  }

  const fetchedAt = new Date().toISOString();
  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);
  const current = forecast.current;
  const daily = forecast.daily;

  const summary = {
    location: location,
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditions: describeWeatherCode(current.weather_code),
    },
    daily: daily.time.map((date, index) => {
      return {
        date: date,
        minC: daily.temperature_2m_min[index],
        maxC: daily.temperature_2m_max[index],
        precipitationChancePercent:
          daily.precipitation_probability_max[index] ?? null,
        weatherCode: daily.weather_code[index],
        conditions: describeWeatherCode(daily.weather_code[index]),
      };
    }),
    fetchedAt: fetchedAt,
    cached: false,
  };
  cache.set(key, summary);
  return summary;
}

// TODO (you): return the cache statistics for GET /api/cache/stats.
export function getCacheStats() {
  return cache.getStats();
}

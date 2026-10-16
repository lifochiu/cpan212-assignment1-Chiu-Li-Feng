import { Router } from "express";
import { getCityWeather } from "../lib/weather.js";
import { parseCity, parseCities } from "../validators/weather-query.js";
import { HttpError } from "../lib/http-error.js";
import { get } from "node:http";
export const weatherRouter = Router();

// TODO (you): GET /api/weather?city=Toronto
// Validate with parseCity, get the summary with getCityWeather, and respond
// with { data, attribution }. Routes never call fetch themselves.
weatherRouter.get("/weather", async (req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);

  res.status(200).json({
    data: data,
    attribution: "Weather data by Open-Meteo.com (https://open-meteo.com/)",
  });
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
// Validate with parseCities, start every lookup at once with Promise.allSettled,
// then build the cities array and the summary described on the assignment page.
weatherRouter.get("/compare", async (req, res) => {
  const names = parseCities(req.query.cities);
  const results = await Promise.allSettled(
    names.map((city) => getCityWeather(city)),
  );

  const cities = results.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        city: names[index],
        ok: true,
        weather: result.value,
      };
    }
    const error = result.reason;
    const isHttpError = error instanceof HttpError;
    if (!isHttpError) {
      console.error(error);
    }
    return {
      city: names[index],
      ok: false,
      error: {
        status: isHttpError ? error.status : 500,
        message: isHttpError ? error.message : "Internal server error",
      },
    };
  });
  const successfulCities = cities.filter((city) => city.ok);
  let warmest = null;
  let coldest = null;
  for (const city of successfulCities) {
    const weather = city.weather;
    if (
      warmest === null ||
      weather.current.temperatureC > warmest.current.temperatureC
    ) {
      warmest = weather;
    }

    if (
      coldest === null ||
      weather.current.temperatureC < coldest.current.temperatureC
    ) {
      coldest = weather;
    }
  }
  res.status(200).json({
    data: {
      cities: cities,
      summary: {
        succeeded: successfulCities.length,
        failed: cities.length - successfulCities.length,
        warmest: warmest?.location.name ?? null,
        coldest: coldest?.location.name ?? null,
      },
    },
    attribution: "Weather data by Open-Meteo.com (https://open-meteo.com/)",
  });
});

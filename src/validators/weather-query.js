import { HttpError } from "../lib/http-error.js";

// TODO (you): check ?city= and return the trimmed city name. Throw a 400
// HttpError with details.city when it breaks a rule from the assignment page.
export function parseCity(value) {
  if (typeof value !== "string") {
    throw new HttpError(400, "Invalid query", {
      city: "city must be provided exactly once as a string",
    });
  }
  const city = value.trim();
  if (city.length < 2 || city.length > 60) {
    throw new HttpError(400, "Invalid query", {
      city: "city must be 2 to 60 characters after trimming",
    });
  }
  return city;
}

// TODO (you): check ?cities= and return an array of trimmed city names. Throw a
// 400 HttpError with details.cities when it breaks a rule from the assignment page.
export function parseCities(value) {
  if (typeof value !== "string") {
    throw new HttpError(400, "Invalid query", {
      cities: "Cities must be provided exactly once as a string",
    });
  }
  const cities = value.split(",").map((city) => city.trim());
  if (cities.length < 2 || cities.length > 5) {
    throw new HttpError(400, "Invalid query", {
      cities: "Each city must be 2 to 5 city names",
    });
  }
  if (cities.some((city) => city.length < 2 || city.length > 60)) {
    throw new HttpError(400, "Invalid query", {
      cities: "Each city must be 2 to 60 characters after trimming",
    });
  }
  const normalizedCities = cities.map((city) => city.toLowerCase());
  const uniqueCities = new Set(normalizedCities);
  if (uniqueCities.size !== cities.length) {
    throw new HttpError(400, "Invalid query", {
      cities: "cities must no contain duplicate names",
    });
  }
  return cities;
}

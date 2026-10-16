# City Weather API

This is an Express API that provides current weather and a three days forecast for a city using Open-Meteo. Supports parallel comparision of multiple cities, caching and error handling.

## Run it

Use Node.js 24.

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

| Variable            | Default                                 | Purpose                                            |
| ------------------- | --------------------------------------- | -------------------------------------------------- |
| PORT                | 4000                                    | Port used by the Express server                    |
| GEOCODING_URL       | https://geocoding-api.open-meteo.com/v1 | Base URL for city geocoding                        |
| FORECAST_URL        | https://api.open-meteo.com/v1           | Base URL for weather forecasts                     |
| UPSTREAM_TIMEOUT_MS | 5000                                    | Timeout for each upstream request, in milliseconds |
| CACHE_TTL_SECONDS   | 600                                     | Lifetime of a cached weather summary, in seconds   |

## Endpoints

### GET /api/weather

Reture current weather and 3 days forecase for one city
Example request:

```bash
curl -i 'http://localhost:4000/api/weather?city=Toronto'
```

Successful request returns HTTP 200 with:

- `data.location`: city name, region, country, coordinates and timezone.
- `data.current`: current temperature, feels-like temperature, humidity, wind speed, weather code and conditions.
- `data.daily`: three daily forecast entries.
- `data.fetchedAt`: the timestamp of the original lookup.
- `data.cached`: whether the result came from the cache.
- `attribution`: credit to Open-Meteo.

### GET /api/compare

Up 2 to 5 cities in parallel and return a result for each city.

Example request:

```bash
curl -i 'http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax'
```

For a valid query, the response is HTTP 200 and contains:

- `data.cities`: one result per city, in the requested order.
  Successful results contain `city`, `ok: true` and `weather`.
  Failed results contain `city`, `ok: false` and an `error` with
  a status code and message.
- `data.summary.succeeded`: number of successful lookups.
- `data.summary.failed`: number of failed lookups.
- `data.summary.warmest`: name of the successful city with the highest current temperature.
- `data.summary.coldest`: name of the successful city with the lowest current temperature.
- `attribution`: credit to Open-Meteo.

### GET /api/cache/stats

Return shared in-memory weather cache.
Example request:

```bash
curl -i 'http://localhost:4000/api/cache/stats'
```

The response is HTTP 200. For example:

```json
{
  "data": {
    "entries": 1,
    "hits": 1,
    "misses": 1,
    "ttlSeconds": 600
  }
}
```

## Data source

Weather data provided by Open-Meteo (https://open-meteo.com/).

## AI use

I used Codex (ChatGPT) to understand the project structure and JavaScript
concepts, work through implementation examples, debug errors, and plan
API tests. I also used it to help draft and review the README documentation.

## Testing

Start server with normal configuration:

```bash
npm run dev
```

Run these requests in order in another terminal, starting with an empty
cache and the normal configuration. Keep the server running and complete
the requests within the configured cache lifetime.

### 1. Weather for a city

Expected status: 200. The result has `cached: false`.

```bash
curl -i 'http://localhost:4000/api/weather?city=Toronto'
```

### 2. Same city again

Expected status: 200. The result has `cached: true` and the same `fetchedAt`.

```bash
curl -i 'http://localhost:4000/api/weather?city=Toronto'
```

### 3. Weather without a city

Expected status: 400, with `error.details.city`.

```bash
curl -i 'http://localhost:4000/api/weather'
```

### 4. Weather for an unknown city

Expected status: 404.

```bash
curl -i 'http://localhost:4000/api/weather?city=Qwertyville'
```

### 5. Compare three cities

Expected status: 200, with 3 successful lookups and 0 failed lookups.

```bash
curl -i 'http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax'
```

### 6. Compare with one unknown city

Expected status: 200, with 2 successful lookups and 1 failed lookup.
The unknown city has `error.status: 404`.

```bash
curl -i 'http://localhost:4000/api/compare?cities=Toronto,Vancouver,Qwertyville'
```

### 7. Compare too many cities

Expected status: 400, with `error.details.cities`.

```bash
curl -i 'http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Ottawa,Montreal,Calgary'
```

### 8. Compare duplicate cities

Expected status: 400. Duplicate detection ignores case.

```bash
curl -i 'http://localhost:4000/api/compare?cities=Toronto,toronto'
```

### 9. Cache statistics

Expected status: 200, with `entries`, `hits`, `misses` and `ttlSeconds`.

```bash
curl -i 'http://localhost:4000/api/cache/stats'
```

### 10. Unknown route

Expected status: 404.

```bash
curl -i 'http://localhost:4000/api/not-a-route'
```

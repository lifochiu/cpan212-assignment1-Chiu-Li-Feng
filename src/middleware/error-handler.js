import { HttpError } from "../lib/http-error.js";

// Express treats a middleware with four parameters as an error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // TODO (you): when err is an HttpError, respond with err.status and
  // { error: { message: err.message, details: err.details } }.
  if (err instanceof HttpError) {
    const error = {
      message: err.message,
    };
    if (err.status === 400) {
      error.details = err.details;
    }
    return res.status(err.status).json({
      error: error,
    });
  }
  console.error(err);
  res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
  // Anything else is a bug. The details go to the terminal, never to the client.
}

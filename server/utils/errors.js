/**
 * Custom Application Error Class & Centralized Express Error Handler
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred during media analysis.";
  const errorCode = err.errorCode || "INTERNAL_ERROR";

  console.error(`[API ERROR ${statusCode}] ${req.method} ${req.path}:`, message);

  // Return clean JSON response without leaking internal server stack traces or API keys
  res.status(statusCode).json({
    success: false,
    status: "FAILED",
    classification: "ANALYSIS FAILED",
    errorCode: errorCode,
    message: message,
    error: message,
    statusCode: statusCode
  });
};

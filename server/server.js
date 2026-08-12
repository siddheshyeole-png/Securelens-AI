import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import rateLimit from "express-rate-limit";

import detectionRoutes from "./routes/detection.js";
import { errorHandler } from "./utils/errors.js";

// Load environment variables (prefer server/.env, fallback to root .env)
dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });
if (!process.env.SIGHTENGINE_API_USER) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Startup Environment Variable Validation
 * Reports missing environment variables without leaking secret values to logs
 */
function validateStartupEnvironment() {
  console.log("==========================================");
  console.log("[SecureLens AI] Server Environment Check");
  console.log("==========================================");
  console.log(`- PORT: ${PORT}`);
  
  if (process.env.SIGHTENGINE_API_USER) {
    const userVal = process.env.SIGHTENGINE_API_USER;
    const maskedUser = userVal.length > 4 ? userVal.substring(0, 4) + "*".repeat(userVal.length - 4) : "****";
    console.log(`- SIGHTENGINE_API_USER: Set (${maskedUser})`);
  } else {
    console.warn("- SIGHTENGINE_API_USER: [MISSING] in .env");
  }

  if (process.env.SIGHTENGINE_API_SECRET) {
    console.log("- SIGHTENGINE_API_SECRET: Set (****************)");
  } else {
    console.warn("- SIGHTENGINE_API_SECRET: [MISSING] in .env");
  }

  const isConfigured = Boolean(process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET);
  console.log(`- Sightengine Integration: ${isConfigured ? "READY" : "UNCONFIGURED (Set SIGHTENGINE_API_USER & SIGHTENGINE_API_SECRET in root .env)"}`);
  console.log("==========================================");
}

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: { status: "FAILED", error: "Too many API requests from this IP. Please wait a minute.", statusCode: 429 }
});

const detectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 30 : 300,
  message: { status: "FAILED", error: "Media detection rate limit exceeded. Please wait a minute.", statusCode: 429 }
});

// Middleware setup with dynamic CORS matching allowed origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    const isDev = process.env.NODE_ENV !== "production";
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    // In development mode, allow any localhost origin
    if (isDev && isLocalhost) {
      return callback(null, true);
    }

    // Build allowed origins list from environment variables
    const allowedOrigins = [];
    if (process.env.ALLOWED_ORIGIN) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim()));
    }
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL.trim());
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Fallback in case localhost is explicitly used in production for local testing
    if (isLocalhost && allowedOrigins.length === 0) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// General API rate limiter
app.use("/api", apiLimiter);

// GET /api/health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "SecureLens AI Backend",
    status: "running"
  });
});

// Mount detection routes under /api and /api/detect with rate limiting
app.use("/api", detectLimiter, detectionRoutes);
app.use("/api/detect", detectLimiter, detectionRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  validateStartupEnvironment();
  console.log(`[SecureLens AI Server] Running on http://localhost:${PORT}`);
});

import app from "../server/server.js";

export default function handler(req, res) {
  // Ensure req.url is normalized to include /api prefix for Express router matching
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  return app(req, res);
}

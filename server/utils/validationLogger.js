import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "server", "logs");
const LOG_FILE = path.join(LOG_DIR, "validation_records.json");

let validationRecords = [];

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    // Ignore error if directory creation fails
  }
}

// Load existing records if present
if (fs.existsSync(LOG_FILE)) {
  try {
    const raw = fs.readFileSync(LOG_FILE, "utf-8");
    validationRecords = JSON.parse(raw);
  } catch (e) {
    validationRecords = [];
  }
}

export const recordValidationEntry = (entry) => {
  const record = {
    id: `val_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    filename: entry.filename || "unnamed_media",
    fileType: entry.fileType || "unknown",
    fileSize: entry.fileSize || 0,
    genaiScore: entry.genaiScore ?? null,
    deepfakeScore: entry.deepfakeScore ?? null,
    finalVerdict: entry.finalVerdict || "UNAVAILABLE",
    apiStatus: entry.apiStatus || "UNAVAILABLE",
    sha256: entry.sha256 || null,
    requestId: entry.requestId || null,
    timestamp: new Date().toISOString()
  };

  validationRecords.unshift(record);

  // Keep last 200 entries
  if (validationRecords.length > 200) {
    validationRecords = validationRecords.slice(0, 200);
  }

  // Write asynchronously to file in non-production
  if (process.env.NODE_ENV !== "production") {
    try {
      fs.writeFileSync(LOG_FILE, JSON.stringify(validationRecords, null, 2));
    } catch (err) {
      console.warn("[Validation Logger] Failed to save validation record to file:", err.message);
    }
  }

  return record;
};

export const getValidationRecords = () => {
  return validationRecords;
};

export const clearValidationRecords = () => {
  validationRecords = [];
  if (fs.existsSync(LOG_FILE)) {
    try {
      fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
    } catch (e) {}
  }
};

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const HISTORY_FILE = path.join(DATA_DIR, "detection_history.json");

let historyRecords = [];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

// Load existing history records on startup
if (fs.existsSync(HISTORY_FILE)) {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    historyRecords = JSON.parse(raw);
  } catch (e) {
    historyRecords = [];
  }
}

export const historyStore = {
  addRecord: (payload) => {
    const record = {
      id: payload.id || payload.detectionId || `SCN-${new Date().getFullYear()}-${(payload.sha256 || Math.random().toString(36)).substring(0, 6).toUpperCase()}`,
      detectionId: payload.detectionId || payload.id || `SCN-${new Date().getFullYear()}-${(payload.sha256 || Math.random().toString(36)).substring(0, 6).toUpperCase()}`,
      userId: payload.userId || "anonymous_user",
      filename: payload.file?.filename || payload.filename || payload.target || "unnamed_media",
      target: payload.file?.filename || payload.filename || payload.target || "unnamed_media",
      mediaType: payload.mediaType || payload.type || "IMAGE",
      type: payload.mediaType || payload.type || "IMAGE",
      fileSize: payload.file?.size || payload.fileSize || 0,
      sha256: payload.sha256 || null,
      genaiScore: payload.genaiScore ?? payload.aiScore ?? payload.scores?.aiGenerated ?? null,
      aiScore: payload.genaiScore ?? payload.aiScore ?? payload.scores?.aiGenerated ?? null,
      deepfakeScore: payload.deepfakeScore ?? payload.scores?.deepfake ?? null,
      scores: payload.scores || {
        aiGenerated: payload.genaiScore ?? payload.aiScore ?? null,
        deepfake: payload.deepfakeScore ?? null
      },
      percentages: payload.percentages || {
        aiGenerated: payload.aiProbability ?? (payload.aiScore != null ? Math.round(payload.aiScore * 100) : null),
        deepfake: payload.deepfakeProbability ?? (payload.deepfakeScore != null ? Math.round(payload.deepfakeScore * 100) : null)
      },
      confidenceLevel: payload.confidenceLevel || (payload.aiScore != null ? (payload.aiScore >= 0.80 || payload.aiScore <= 0.20 ? "HIGH" : "MODERATE") : "UNKNOWN"),
      verdict: payload.verdict || payload.classification || "UNAVAILABLE",
      classification: payload.verdict || payload.classification || "UNAVAILABLE",
      confidence: payload.confidence ?? null,
      provider: payload.provider || "Sightengine",
      model: payload.model || "genai,deepfake",
      version: "v1.0",
      createdAt: payload.timestamp || payload.createdAt || new Date().toISOString(),
      timestamp: payload.timestamp || payload.createdAt || new Date().toISOString(),
      processingStatus: payload.status || payload.processingStatus || (payload.success !== false ? "Completed" : "FAILED"),
      status: payload.status || payload.processingStatus || (payload.success !== false ? "Completed" : "FAILED"),
      errorStatus: payload.error || payload.errorStatus || null,
      evidence: Array.isArray(payload.evidence)
        ? payload.evidence
        : (payload.evidence?.details || []),
      success: payload.success !== false,
      rawResult: payload.rawResult || {
        provider: payload.provider || "Sightengine",
        requestId: payload.requestId || null,
        status: payload.success !== false ? "success" : "unavailable"
      },
      diagnostics: payload.diagnostics || null,
      file: payload.file || {},
      previewUrl: payload.previewUrl || null,
      requestId: payload.requestId || null
    };

    // Prepend new record
    historyRecords.unshift(record);

    // Persist to disk asynchronously
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyRecords, null, 2));
    } catch (err) {
      console.warn("[History Store] Failed to persist history record to file:", err.message);
    }

    return record;
  },

  getHistory: (userId = null) => {
    let records = historyRecords;
    if (userId && userId !== "ALL" && userId !== "guest_user" && userId !== "anonymous_user") {
      records = historyRecords.filter((r) => r.userId === userId || r.userId === "anonymous_user" || r.userId === "guest_user");
    }
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRecordById: (detectionId) => {
    return historyRecords.find((r) => r.id === detectionId || r.detectionId === detectionId);
  },

  deleteRecord: (detectionId) => {
    historyRecords = historyRecords.filter((r) => r.id !== detectionId && r.detectionId !== detectionId);
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyRecords, null, 2));
    } catch (e) {}
    return true;
  },

  clearHistory: (userId = null) => {
    if (userId && userId !== "ALL") {
      historyRecords = historyRecords.filter((r) => r.userId !== userId);
    } else {
      historyRecords = [];
    }
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyRecords, null, 2));
    } catch (e) {}
    return true;
  }
};

import express from "express";
import fs from "fs";
import path from "path";
import { uploadMiddleware } from "../middleware/upload.js";
import { sightengineService } from "../services/sightengine.js";
import { detectMedia } from "../services/detectors/index.js";
import { calculateSHA256 } from "../utils/hash.js";
import { extractDimensions, extractExifInfo } from "../utils/metadata.js";
import { AppError } from "../utils/errors.js";
import { recordValidationEntry, getValidationRecords } from "../utils/validationLogger.js";
import { historyStore } from "../stores/historyStore.js";

const router = express.Router();

// Middleware helper to accept either 'media' or 'file' field name
const singleMediaUpload = (req, res, next) => {
  uploadMiddleware.single("media")(req, res, (err) => {
    if (err) {
      if (err instanceof AppError) return next(err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Uploaded file exceeds allowed size limits.", 400, "FILE_TOO_LARGE"));
      }
      if (err.code === "LIMIT_FIELD_VALUE") {
        return next(new AppError("Request form field exceeds allowed size limit.", 400, "FIELD_TOO_LONG"));
      }
      return next(new AppError(err.message || "Malformed multipart upload request.", 400, "MALFORMED_MULTIPART"));
    }
    if (req.file) {
      return next();
    }
    // Fallback to checking field name 'file'
    uploadMiddleware.single("file")(req, res, (err2) => {
      if (err2) {
        if (err2 instanceof AppError) return next(err2);
        if (err2.code === "LIMIT_FILE_SIZE") {
          return next(new AppError("Uploaded file exceeds allowed size limits.", 400, "FILE_TOO_LARGE"));
        }
        if (err2.code === "LIMIT_FIELD_VALUE") {
          return next(new AppError("Request form field exceeds allowed size limit.", 400, "FIELD_TOO_LONG"));
        }
        return next(new AppError(err2.message || "Malformed multipart upload request.", 400, "MALFORMED_MULTIPART"));
      }
      next();
    });
  });
};

/**
 * Real SecureLens Detection Endpoint
 * POST /api/analyze
 * Accepts: multipart/form-data with field name 'media' (or 'file')
 * Supports: Images (up to 15MB), Videos (up to 100MB), Audio (up to 50MB)
 */
router.post("/analyze", singleMediaUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No media file provided in upload payload.", 400, "MISSING_FILE");
    }

    const mime = req.file.mimetype?.toLowerCase() || "";
    const filename = req.file.originalname || "unnamed_media";
    const fileSizeKb = (req.file.size / 1024).toFixed(2);

    console.log(`\n==========================================`);
    console.log(`[API INGRESS] POST /api/analyze`);
    console.log(`- File Received: ${filename} (${mime}, ${fileSizeKb} KB)`);

    const allowedImageMimes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    const allowedVideoMimes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/x-matroska"];
    const allowedAudioMimes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/aac", "audio/x-m4a", "audio/flac"];

    // 1. Empty file validation
    if (!req.file.buffer || req.file.buffer.length === 0 || req.file.size === 0) {
      throw new AppError("Uploaded file is empty (0 bytes).", 400, "EMPTY_FILE");
    }

    // 2. Media Category File Size Limits
    if (mime.startsWith("image/") || allowedImageMimes.includes(mime)) {
      if (req.file.size > 15 * 1024 * 1024) {
        throw new AppError("Image size exceeds maximum 15 MB limit.", 400, "FILE_TOO_LARGE");
      }
    } else if (mime.startsWith("video/") || allowedVideoMimes.includes(mime)) {
      if (req.file.size > 100 * 1024 * 1024) {
        throw new AppError("Video size exceeds maximum 100 MB limit.", 400, "FILE_TOO_LARGE");
      }
    } else if (mime.startsWith("audio/") || allowedAudioMimes.includes(mime)) {
      if (req.file.size > 50 * 1024 * 1024) {
        throw new AppError("Audio size exceeds maximum 50 MB limit.", 400, "FILE_TOO_LARGE");
      }
    }

    // 3. Container Magic-Number Header Check (Corrupted File Guard)
    const buffer = req.file.buffer;
    let isHeaderValid = true;

    if (mime.startsWith("image/")) {
      const isJpeg = buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isRiffWebp = buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
      const isTiff = buffer.length > 4 && ((buffer[0] === 0x49 && buffer[1] === 0x49) || (buffer[0] === 0x4D && buffer[1] === 0x4D));
      isHeaderValid = isJpeg || isPng || isRiffWebp || isTiff;
    } else if (mime.startsWith("video/")) {
      const isFtyp = buffer.length > 8 && buffer.toString("ascii", 4, 8) === "ftyp";
      const isEbml = buffer.length > 4 && buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3;
      const isAvi = buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "AVI ";
      isHeaderValid = isFtyp || isEbml || isAvi;
    } else if (mime.startsWith("audio/")) {
      const isId3 = buffer.length > 3 && buffer.toString("ascii", 0, 3) === "ID3";
      const isMp3Sync = buffer.length > 2 && buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0;
      const isWav = buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE";
      const isFlac = buffer.length > 4 && buffer.toString("ascii", 0, 4) === "fLaC";
      isHeaderValid = isId3 || isMp3Sync || isWav || isFlac;
    }

    if (!isHeaderValid) {
      throw new AppError("Uploaded file container appears corrupted or header is unreadable.", 400, "CORRUPTED_FILE");
    }

    let result;
    try {
      if (mime.startsWith("image/") || allowedImageMimes.includes(mime)) {
        if (!allowedImageMimes.includes(mime)) {
          throw new AppError(`Unsupported image format (${mime}). Allowed formats: JPG, PNG, WEBP, TIFF.`, 415, "UNSUPPORTED_MEDIA_TYPE");
        }
        result = await detectMedia(req.file, "IMAGE");
      } else if (mime.startsWith("video/") || allowedVideoMimes.includes(mime)) {
        if (!allowedVideoMimes.includes(mime)) {
          throw new AppError(`Unsupported video format (${mime}). Allowed formats: MP4, MOV, WEBM, AVI, MKV.`, 415, "UNSUPPORTED_MEDIA_TYPE");
        }
        result = await detectMedia(req.file, "VIDEO");
      } else if (mime.startsWith("audio/") || allowedAudioMimes.includes(mime)) {
        if (!allowedAudioMimes.includes(mime)) {
          throw new AppError(`Unsupported audio format (${mime}). Allowed formats: MP3, WAV, AAC, M4A, FLAC.`, 415, "UNSUPPORTED_MEDIA_TYPE");
        }
        result = await detectMedia(req.file, "AUDIO");
      } else {
        throw new AppError(`Unsupported media format (${mime}). Allowed formats: Images, Videos, Audio recordings.`, 415, "UNSUPPORTED_MEDIA_TYPE");
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      const errStr = (err.message || "").toLowerCase();
      if (errStr.includes("timeout") || err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
        throw new AppError("The detection service timed out. Please try again.", 504, "API_TIMEOUT");
      }
      if (errStr.includes("econnrefused") || errStr.includes("econnreset") || errStr.includes("network")) {
        throw new AppError("Unable to connect to the detection service provider.", 503, "NETWORK_ERROR");
      }
      throw new AppError(err.message || "Detection service execution failure.", 502, "PROVIDER_ERROR");
    }

    // Calculate deterministic SHA-256 for file integrity
    const sha256 = calculateSHA256(req.file.buffer);
    const reportId = "SCN-2026-" + sha256.substring(0, 6).toUpperCase();

    // Development-only backend logging
    if (process.env.NODE_ENV !== "production") {
      console.log("==========================================");
      console.log("[BACKEND DEV LOG] Incoming Request: POST /api/analyze");
      console.log(`[BACKEND DEV LOG] Filename: ${filename}`);
      console.log(`[BACKEND DEV LOG] MIME Type: ${mime}`);
      console.log(`[BACKEND DEV LOG] File Size: ${req.file.size} bytes`);
      console.log(`[BACKEND DEV LOG] Sightengine HTTP Status: ${result.httpStatus || 200}`);
      console.log(`[BACKEND DEV LOG] Sightengine Content-Type: ${result.contentType || "application/json"}`);
      console.log(`[BACKEND DEV LOG] Raw Sightengine Response Body:`, JSON.stringify(result.rawResponse || {}));
      console.log(`[BACKEND DEV LOG] Parsed Sightengine Response:`, result.parsedResponse || result);
      console.log("==========================================");
    }

    // Handle provider error/unavailable responses with non-200 HTTP status
    if (result.success === false) {
      const httpStatus = (result.httpStatus && result.httpStatus !== 200) ? result.httpStatus : 502;
      const errorPayload = {
        success: false,
        error: {
          code: result.errorCode || result.status?.toUpperCase() || "PROVIDER_ERROR",
          message: result.message || "Sightengine detection service returned a processing error."
        }
      };

      if (process.env.NODE_ENV !== "production") {
        console.log(`[BACKEND DEV LOG] Final JSON Returned by Backend (HTTP ${httpStatus}):`, JSON.stringify(errorPayload));
      }

      return res.status(httpStatus).json(errorPayload);
    }

    const aiScore = result.scores?.aiGenerated ?? result.aiGenerated ?? result.genaiScore ?? null;
    const deepfakeScore = result.scores?.deepfake ?? result.deepfake ?? result.deepfakeScore ?? null;

    const aiProbability = result.percentages?.aiGenerated ?? (aiScore != null ? Math.round(aiScore * 100) : null);
    const deepfakeProbability = result.percentages?.deepfake ?? (deepfakeScore != null ? Math.round(deepfakeScore * 100) : null);

    // 4-Tier Verdict System
    let classification = result.verdict || result.classification || "INCONCLUSIVE";
    if (result.verdict == null) {
      if (deepfakeScore != null && deepfakeScore >= 0.50) {
        classification = deepfakeScore >= 0.80 ? "HIGHLY LIKELY DEEPFAKE" : "LIKELY DEEPFAKE";
      } else if (aiScore != null) {
        if (aiScore >= 0.80) classification = "HIGHLY LIKELY AI-GENERATED";
        else if (aiScore >= 0.50) classification = "LIKELY AI-GENERATED";
        else if (aiScore >= 0.20) classification = "UNCERTAIN";
        else classification = "LIKELY AUTHENTIC";
      }
    }

    let deepfakeClassification = result.deepfakeClassification || "UNAVAILABLE";
    if (result.deepfakeClassification == null && deepfakeScore != null) {
      if (deepfakeScore >= 0.80) deepfakeClassification = "HIGHLY LIKELY DEEPFAKE";
      else if (deepfakeScore >= 0.50) deepfakeClassification = "LIKELY DEEPFAKE";
      else if (deepfakeScore >= 0.20) deepfakeClassification = "UNCERTAIN";
      else deepfakeClassification = "LOW MANIPULATION SIGNAL";
    }

    const confidenceLevel = result.confidenceLevel || (aiScore != null ? (aiScore >= 0.80 || aiScore <= 0.20 ? "HIGH" : "MODERATE") : "UNKNOWN");
    const rawConfidence = aiScore != null ? Math.round(aiScore >= 0.50 ? aiScore * 100 : (1 - aiScore) * 100) : null;
    const confidence = rawConfidence != null ? Math.min(99, Math.max(1, rawConfidence)) : null;

    let evidenceList = Array.isArray(result.evidence)
      ? result.evidence
      : (result.evidence?.details || []);

    if (evidenceList.length === 0) {
      if (aiProbability != null) {
        evidenceList.push(`AI-generation model returned a ${aiProbability}% AI-generation probability.`);
      }
      if (deepfakeProbability != null) {
        evidenceList.push(`Deepfake model returned an ${deepfakeProbability}% face-manipulation probability.`);
      } else {
        evidenceList.push("Deepfake analysis was not available for this media. AI-generation analysis was performed separately.");
      }
    }

    const dimensions = extractDimensions(req.file.buffer, req.file.mimetype);
    const exifData = extractExifInfo(req.file.buffer, req.file.mimetype);
    const previewUrl = req.body?.previewUrl || result.previewUrl || null;

    const responsePayload = {
      success: true,
      requestId: result.requestId || null,
      scores: {
        aiGenerated: aiScore,
        deepfake: deepfakeScore
      },
      percentages: {
        aiGenerated: aiProbability,
        deepfake: deepfakeProbability
      },
      verdict: classification,
      confidenceLevel,
      evidence: evidenceList,

      // Backward-compatible properties for existing UI components
      previewUrl,
      analysis: {
        aiGeneratedScore: aiScore,
        deepfakeScore: deepfakeScore
      },
      provider: result.provider || "Sightengine",
      rawProviderResponse: result.rawResult || result.parsedResponse || {},
      id: reportId,
      detectionId: reportId,
      genaiScore: aiScore,
      aiScore: aiScore,
      deepfakeScore: deepfakeScore,
      classification,
      confidence,
      model: result.model || "genai,deepfake",
      aiProbability,
      deepfakeProbability,
      deepfakeClassification,
      file: {
        filename: req.file.originalname || "media_file",
        mimetype: req.file.mimetype || "application/octet-stream",
        size: req.file.size,
        dimensions: dimensions || "N/A",
        exifPresent: exifData.exifPresent,
        exifInfo: exifData.info,
        exifNote: exifData.exifPresent
          ? "EXIF metadata present in file header."
          : "EXIF metadata not present. Missing metadata alone does not establish AI generation."
      },
      sha256,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      processingStatus: "Completed",
      status: "Completed",
      diagnostics: {
        apiProvider: "Sightengine",
        modelRequested: result.model || "genai,deepfake",
        requestId: result.requestId || null,
        preprocessing: {
          resized: false,
          compressed: false,
          encoding: "raw_binary_stream",
          bytesTransmitted: req.file.size
        },
        rawFieldsExtracted: {
          rawGenai: aiScore,
          rawDeepfake: deepfakeScore
        },
        thresholdsApplied: {
          aiHighThreshold: 0.80,
          aiUncertainLow: 0.20,
          aiUncertainHigh: 0.50
        },
        verdictSource: aiScore != null ? "SIGHTENGINE_API_MODEL_OUTPUT" : "DETECTOR_UNAVAILABLE"
      }
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[BACKEND DEV LOG] Final JSON Returned by Backend (HTTP 200):`, JSON.stringify(responsePayload));
    }

    // Save persistent detection record to backend historyStore
    const historyRecord = historyStore.addRecord({
      ...responsePayload,
      userId: req.headers["x-user-id"] || req.body.userId || "anonymous_user",
      mediaType: mime.startsWith("video/") ? "VIDEO" : mime.startsWith("audio/") ? "AUDIO" : "IMAGE"
    });

    res.status(200).json(historyRecord);
  } catch (err) {
    next(err);
  }
});

// Real Persistent History Endpoints
router.get("/history", (req, res) => {
  const userId = req.headers["x-user-id"] || req.query.userId || null;
  const history = historyStore.getHistory(userId);
  res.json({
    success: true,
    totalRecords: history.length,
    history
  });
});

router.get("/history/:id", (req, res) => {
  const record = historyStore.getRecordById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: "Detection report not found." });
  }
  res.json({
    success: true,
    report: record
  });
});

router.delete("/history/:id", (req, res) => {
  const success = historyStore.deleteRecord(req.params.id);
  res.json({ success: true, message: `Report ${req.params.id} deleted.` });
});

router.delete("/history", (req, res) => {
  const userId = req.headers["x-user-id"] || req.query.userId || null;
  historyStore.clearHistory(userId);
  res.json({ success: true, message: "Detection history cleared." });
});

// Existing route endpoints preserved for backwards compatibility
router.post("/image", singleMediaUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No image file provided in upload payload.", 400, "MISSING_FILE");
    }
    const result = await sightengineService.detectImage(req.file);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/video", singleMediaUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No video file provided in upload payload.", 400, "MISSING_FILE");
    }
    const result = await sightengineService.detectVideo(req.file);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/audio", singleMediaUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No audio file provided in upload payload.", 400, "MISSING_FILE");
    }
    const result = await sightengineService.detectAudio(req.file);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Development-only validation records endpoint
router.get("/dev/validation-records", (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_ENDPOINTS) {
    return res.status(403).json({ error: "Development endpoints disabled in production." });
  }
  const records = getValidationRecords();
  res.json({
    success: true,
    totalRecords: records.length,
    records
  });
});

// Development-only dataset validation metrics endpoint
router.get("/dev/dataset-metrics", (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_ENDPOINTS) {
    return res.status(403).json({ error: "Development endpoints disabled in production." });
  }
  const metricsPath = path.resolve(process.cwd(), "server", "logs", "dataset_validation_metrics.json");
  if (!fs.existsSync(metricsPath)) {
    return res.json({
      success: true,
      message: "No dataset validation metrics recorded yet. Run `node server/validate_sightengine.js server/dataset` to generate metrics.",
      metrics: null
    });
  }
  try {
    const raw = fs.readFileSync(metricsPath, "utf-8");
    res.json({
      success: true,
      metrics: JSON.parse(raw)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to read dataset validation metrics." });
  }
});

export default router;

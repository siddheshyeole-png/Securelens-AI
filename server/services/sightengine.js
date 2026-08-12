import axios from "axios";
import FormData from "form-data";
import { calculateSHA256 } from "../utils/hash.js";
import { AppError } from "../utils/errors.js";

export const sightengineService = {
  /**
   * Official Sightengine Deepfake & GenAI Image Detection Integration
   * Endpoint: POST https://api.sightengine.com/1.0/check.json (models=genai,deepfake)
   */
  detectImage: async (file) => {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;
    const startTime = Date.now();

    // Compute deterministic cryptographic SHA-256 file digest for file integrity
    const fileHash = calculateSHA256(file.buffer);
    const fileName = file.originalname || "image.jpg";
    const mimeType = file.mimetype || "image/jpeg";
    const fileSize = file.buffer.length;

    if (!apiUser || !apiSecret) {
      console.warn("[Sightengine Log] Detection skipped: API credentials missing in .env");
      return {
        success: false,
        status: "unavailable",
        mediaType: "image",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "UNCONFIGURED",
        evidence: {
          provider: "Sightengine",
          model: "genai,deepfake",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai,deepfake",
        requestId: null,
        message: "Detection service unavailable. No artificial score was generated."
      };
    }

    try {
      const formData = new FormData();
      formData.append("models", "genai,deepfake");
      formData.append("api_user", apiUser);
      formData.append("api_secret", apiSecret);
      formData.append("media", file.buffer, {
        filename: fileName,
        contentType: mimeType
      });

      console.log(`[SIGHTENGINE REQUEST STARTED] Endpoint: POST https://api.sightengine.com/1.0/check.json | Models: genai,deepfake`);

      const response = await axios.post("https://api.sightengine.com/1.0/check.json", formData, {
        headers: formData.getHeaders(),
        timeout: 60000 // 60s timeout for image processing
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const data = response.data;
      const requestId = data.request?.id || `req_${Date.now()}`;

      console.log(`[SIGHTENGINE RESPONSE STATUS] HTTP ${response.status} (Duration: ${duration}s, RequestID: ${requestId})`);

      // Log raw Sightengine response on backend during development only
      if (process.env.NODE_ENV !== "production") {
        console.log("==========================================");
        console.log("[SIGHTENGINE RAW RESPONSE - IMAGE]");
        console.log(JSON.stringify(data, null, 2));
        console.log("==========================================");
      }

      if (data.status !== "success") {
        const errorMsg = data.error?.message || "Sightengine API returned processing failure.";
        console.error(`[Sightengine Log] Status: failure | Duration: ${duration}s | Message: ${errorMsg}`);
        return {
          success: false,
          status: "unavailable",
          httpStatus: response.status || 502,
          contentType: response.headers?.["content-type"] || "application/json",
          rawResponse: data,
          parsedResponse: data,
          errorCode: data.error?.type || "DETECTOR_FAILURE",
          message: errorMsg,
          mediaType: "image",
          fileHash,
          classification: "DETECTION UNAVAILABLE",
          aiGenerated: null,
          deepfake: null,
          aiProbability: null,
          deepfakeProbability: null,
          genaiScore: null,
          deepfakeScore: null,
          confidence: null,
          risk: "ERROR",
          evidence: {
            provider: "Sightengine",
            model: "genai,deepfake",
            aiGeneratedScore: null,
            deepfakeScore: null,
            details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
          },
          file: {
            name: fileName,
            mimeType,
            size: fileSize,
            sha256: fileHash
          },
          provider: "Sightengine",
          model: "genai,deepfake",
          requestId: data.request?.id || null
        };
      }

      // Extract real Sightengine model floats (0 to 1)
      const rawGenai = data.type?.ai_generated ?? data.type?.genai ?? data.data?.ai_generated ?? data.summary?.ai_generated;
      const rawDeepfake = data.type?.deepfake ?? data.data?.deepfake ?? data.summary?.deepfake;

      if (process.env.NODE_ENV !== "production") {
        console.log(`Sightengine raw response:`, data);
        console.log(`[SIGHTENGINE RAW FIELDS RECEIVED] type.ai_generated: ${rawGenai ?? "N/A"}, type.deepfake: ${rawDeepfake ?? "N/A"}`);
      }

      const aiGenerated = rawGenai != null ? Number(rawGenai) : null;
      const deepfake = rawDeepfake != null ? Number(rawDeepfake) : null;

      const aiProbability = aiGenerated != null ? Math.round(aiGenerated * 100) : null;
      const deepfakeProbability = deepfake != null ? Math.round(deepfake * 100) : null;

      // 4-Tier Evidence-Based Verdict System
      // AI-generated score thresholds:
      // 0.80 - 1.00 = Highly Likely AI-Generated
      // 0.50 - 0.80 = Likely AI-Generated
      // 0.20 - 0.50 = Uncertain
      // 0.00 - 0.20 = Likely Authentic
      let aiVerdict = "UNAVAILABLE";
      if (aiGenerated != null) {
        if (aiGenerated >= 0.80) {
          aiVerdict = "HIGHLY LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.50) {
          aiVerdict = "LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.20) {
          aiVerdict = "UNCERTAIN";
        } else {
          aiVerdict = "LIKELY AUTHENTIC";
        }
      }

      // Deepfake score thresholds:
      // 0.80 - 1.00 = Highly likely deepfake
      // 0.50 - 0.80 = Likely manipulated
      // 0.20 - 0.50 = Uncertain
      // 0.00 - 0.20 = Low manipulation signal
      let deepfakeClassification = "UNAVAILABLE";
      if (deepfake != null) {
        if (deepfake >= 0.80) {
          deepfakeClassification = "HIGHLY LIKELY DEEPFAKE";
        } else if (deepfake >= 0.50) {
          deepfakeClassification = "LIKELY DEEPFAKE";
        } else if (deepfake >= 0.20) {
          deepfakeClassification = "UNCERTAIN";
        } else {
          deepfakeClassification = "LOW MANIPULATION SIGNAL";
        }
      }

      let classification = "INCONCLUSIVE";
      let risk = "MODERATE";

      if (deepfake != null && deepfake >= 0.50) {
        classification = deepfakeClassification;
        risk = "HIGH";
      } else if (aiGenerated != null) {
        classification = aiVerdict;
        risk = aiGenerated >= 0.80 ? "HIGH" : aiGenerated >= 0.50 ? "HIGH" : aiGenerated >= 0.20 ? "MODERATE" : "LOW";
      } else {
        classification = "DETECTION UNAVAILABLE";
        risk = "UNKNOWN";
      }

      const confidenceLevel = aiGenerated != null
        ? (aiGenerated >= 0.80 || aiGenerated <= 0.20 ? "HIGH" : "MODERATE")
        : "UNKNOWN";

      const rawConfidence = aiGenerated != null
        ? Math.round(aiGenerated >= 0.50 ? aiGenerated * 100 : (1 - aiGenerated) * 100)
        : null;
      const confidence = rawConfidence != null ? Math.min(99, Math.max(1, rawConfidence)) : null;

      console.log(`[Sightengine Log] RequestID: ${requestId} | Duration: ${duration}s | Status: success | aiGenerated: ${aiGenerated} (${aiProbability}%) | deepfake: ${deepfake} (${deepfakeProbability != null ? deepfakeProbability + '%' : 'N/A'})`);

      // Dynamic Evidence Generation from real API response
      const details = [];
      if (aiProbability != null) {
        details.push(`AI-generation model returned a ${aiProbability}% AI-generation probability.`);
      } else {
        details.push("AI-generation model analysis was unavailable for this media.");
      }

      if (deepfakeProbability != null) {
        details.push(`Deepfake model returned an ${deepfakeProbability}% face-manipulation probability.`);
      } else {
        details.push("Deepfake analysis was not available for this media. AI-generation analysis was performed separately.");
      }

      details.push(`SHA-256 digest generated for file integrity verification (${fileHash}).`);

      return {
        success: true,
        status: "success",
        mediaType: "image",
        fileHash,
        classification,
        deepfakeClassification,
        verdict: classification,
        confidenceLevel,
        result: classification,
        scores: {
          aiGenerated,
          deepfake
        },
        percentages: {
          aiGenerated: aiProbability,
          deepfake: deepfakeProbability
        },
        aiGenerated,
        deepfake,
        genaiScore: aiGenerated,
        deepfakeScore: deepfake,
        aiProbability,
        deepfakeProbability,
        authenticProbability: aiProbability != null ? 100 - aiProbability : null,
        confidence,
        risk,
        evidence: details,
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai,deepfake",
        requestId
      };
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const httpStatus = err.response?.status || 502;
      const contentType = err.response?.headers?.["content-type"] || "application/json";
      const rawData = err.response?.data || { error: { message: err.message } };
      const errorMsg = rawData.error?.message || err.message || "Detection service unavailable.";
      const errorCode = rawData.error?.type || err.code || "PROVIDER_ERROR";

      console.error(`[Sightengine Log] Status: failure | Duration: ${duration}s | Error: ${err.message}`, rawData ? JSON.stringify(rawData) : "");
      return {
        success: false,
        status: "unavailable",
        httpStatus,
        contentType,
        rawResponse: rawData,
        parsedResponse: rawData,
        errorCode,
        message: errorMsg,
        mediaType: "image",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "ERROR",
        evidence: {
          provider: "Sightengine",
          model: "genai,deepfake",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai,deepfake",
        requestId: rawData.request?.id || null
      };
    }
  },

  /**
   * Official Sightengine Synchronous Video AI Detection Integration
   * Endpoint: POST https://api.sightengine.com/1.0/video/check-sync.json (models=genai)
   * Note: For videos under 60 seconds.
   */
  detectVideo: async (file) => {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;
    const startTime = Date.now();

    const fileHash = calculateSHA256(file.buffer);
    const fileName = file.originalname || "video.mp4";
    const mimeType = file.mimetype || "video/mp4";
    const fileSize = file.buffer.length;

    if (!apiUser || !apiSecret) {
      console.warn("[Sightengine Log] Video detection skipped: API credentials missing in .env");
      return {
        success: false,
        status: "unavailable",
        mediaType: "video",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "UNCONFIGURED",
        evidence: {
          provider: "Sightengine",
          model: "genai",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai",
        requestId: null,
        message: "Detection service unavailable. No artificial score was generated."
      };
    }

    try {
      const formData = new FormData();
      formData.append("models", "genai");
      formData.append("api_user", apiUser);
      formData.append("api_secret", apiSecret);
      formData.append("stream", file.buffer, {
        filename: fileName,
        contentType: mimeType
      });

      console.log(`==========================================`);
      console.log(`[SIGHTENGINE REQUEST STARTED - VIDEO]`);
      console.log(`- Request Media Type: video`);
      console.log(`- Filename: ${fileName}`);
      console.log(`- MIME Type: ${mimeType}`);
      console.log(`- File Size: ${fileSize} bytes (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
      console.log(`- Endpoint: POST https://api.sightengine.com/1.0/video/check-sync.json`);
      console.log(`- Multipart Fields: models, api_user, api_secret, stream`);
      console.log(`==========================================`);

      const response = await axios.post("https://api.sightengine.com/1.0/video/check-sync.json", formData, {
        headers: formData.getHeaders(),
        timeout: 60000 // 60s timeout for video processing
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const data = response.data;
      const requestId = data.request?.id || `req_${Date.now()}`;

      console.log(`[SIGHTENGINE RESPONSE STATUS - VIDEO] HTTP ${response.status} (Duration: ${duration}s, RequestID: ${requestId})`);

      if (process.env.NODE_ENV !== "production") {
        console.log("==========================================");
        console.log("[SIGHTENGINE RAW RESPONSE - VIDEO]");
        console.log(JSON.stringify(data, null, 2));
        console.log("==========================================");
      }

      if (data.status !== "success") {
        const errorMsg = data.error?.message || "Sightengine Video API returned processing failure.";
        console.error(`[Sightengine Log] Video Status: failure | Duration: ${duration}s | Message: ${errorMsg}`);
        return {
          success: false,
          status: "unavailable",
          mediaType: "video",
          fileHash,
          classification: "DETECTION UNAVAILABLE",
          aiGenerated: null,
          deepfake: null,
          aiProbability: null,
          deepfakeProbability: null,
          genaiScore: null,
          deepfakeScore: null,
          confidence: null,
          risk: "ERROR",
          evidence: {
            provider: "Sightengine",
            model: "genai",
            aiGeneratedScore: null,
            deepfakeScore: null,
            details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
          },
          file: {
            name: fileName,
            mimeType,
            size: fileSize,
            sha256: fileHash
          },
          provider: "Sightengine",
          model: "genai",
          requestId: data.request?.id || null,
          message: `Video detection service unavailable (${errorMsg}). No artificial score was generated.`
        };
      }

      const rawGenai = data.data?.ai_generated ?? data.summary?.ai_generated ?? data.type?.ai_generated;
      const rawDeepfake = data.data?.deepfake ?? data.summary?.deepfake ?? data.type?.deepfake;
      console.log(`[SIGHTENGINE RAW FIELDS RECEIVED] video.ai_generated: ${rawGenai ?? "N/A"}, video.deepfake: ${rawDeepfake ?? "N/A"}`);
      
      const aiGenerated = rawGenai != null ? Number(rawGenai) : null;
      const deepfake = rawDeepfake != null ? Number(rawDeepfake) : null;

      const aiProbability = aiGenerated != null ? Math.round(aiGenerated * 100) : null;
      const deepfakeProbability = deepfake != null ? Math.round(deepfake * 100) : null;

      let aiVerdict = "UNAVAILABLE";
      if (aiGenerated != null) {
        if (aiGenerated >= 0.80) {
          aiVerdict = "HIGHLY LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.50) {
          aiVerdict = "LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.20) {
          aiVerdict = "UNCERTAIN";
        } else {
          aiVerdict = "LIKELY AUTHENTIC";
        }
      }

      let deepfakeClassification = "UNAVAILABLE";
      if (deepfake != null) {
        if (deepfake >= 0.80) {
          deepfakeClassification = "HIGHLY LIKELY DEEPFAKE";
        } else if (deepfake >= 0.50) {
          deepfakeClassification = "LIKELY DEEPFAKE";
        } else if (deepfake >= 0.20) {
          deepfakeClassification = "UNCERTAIN";
        } else {
          deepfakeClassification = "LOW MANIPULATION SIGNAL";
        }
      }

      let classification = "INCONCLUSIVE";
      let risk = "MODERATE";

      if (deepfake != null && deepfake >= 0.50) {
        classification = deepfakeClassification;
        risk = "HIGH";
      } else if (aiGenerated != null) {
        classification = aiVerdict;
        risk = aiGenerated >= 0.80 ? "HIGH" : aiGenerated >= 0.50 ? "HIGH" : aiGenerated >= 0.20 ? "MODERATE" : "LOW";
      } else {
        classification = "DETECTION UNAVAILABLE";
        risk = "UNKNOWN";
      }

      const confidenceLevel = aiGenerated != null
        ? (aiGenerated >= 0.80 || aiGenerated <= 0.20 ? "HIGH" : "MODERATE")
        : "UNKNOWN";

      const rawConfidence = aiGenerated != null ? Math.round(aiGenerated >= 0.50 ? aiGenerated * 100 : (1 - aiGenerated) * 100) : null;
      const confidence = rawConfidence != null ? Math.min(99, Math.max(1, rawConfidence)) : null;

      console.log(`[Sightengine Log] RequestID: ${requestId} | MediaType: VIDEO | Duration: ${duration}s | Status: success | aiGenerated: ${aiGenerated} (${aiProbability}%) | deepfake: ${deepfake} (${deepfakeProbability != null ? deepfakeProbability + '%' : 'N/A'})`);

      const details = [];
      if (aiProbability != null) {
        details.push(`Sightengine GenAI video classifier returned a ${aiProbability}% AI-generation probability.`);
      } else {
        details.push("Sightengine GenAI video classifier score unavailable for this video file.");
      }

      if (deepfakeProbability != null) {
        details.push(`Deepfake model returned an ${deepfakeProbability}% face-manipulation probability.`);
      } else {
        details.push("Deepfake analysis was not available for this media. AI-generation analysis was performed separately.");
      }

      details.push(`SHA-256 digest generated for file integrity verification (${fileHash}).`);

      return {
        success: true,
        status: "success",
        mediaType: "video",
        fileHash,
        classification,
        deepfakeClassification,
        verdict: classification,
        confidenceLevel,
        result: classification,
        scores: {
          aiGenerated,
          deepfake
        },
        percentages: {
          aiGenerated: aiProbability,
          deepfake: deepfakeProbability
        },
        aiGenerated,
        deepfake,
        genaiScore: aiGenerated,
        deepfakeScore: deepfake,
        aiProbability,
        deepfakeProbability,
        authenticProbability: aiProbability != null ? 100 - aiProbability : null,
        confidence,
        risk,
        evidence: details,
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai",
        requestId
      };
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const errorDetail = err.response?.data?.error?.message || err.message;
      console.error(`[Sightengine Log] Video Status: failure | Duration: ${duration}s | Error: ${errorDetail}`);
      return {
        success: false,
        status: "unavailable",
        mediaType: "video",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "ERROR",
        evidence: {
          provider: "Sightengine",
          model: "genai",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "genai",
        requestId: null,
        message: "Detection service unavailable. No artificial score was generated."
      };
    }
  },

  /**
   * Official Sightengine Audio AI Speech Detection Integration
   * Endpoint: POST https://api.sightengine.com/1.0/audio/check.json (models=ai_speech)
   */
  detectAudio: async (file) => {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;
    const startTime = Date.now();

    const fileHash = calculateSHA256(file.buffer);
    const fileName = file.originalname || "audio.mp3";
    const mimeType = file.mimetype || "audio/mpeg";
    const fileSize = file.buffer.length;

    if (!apiUser || !apiSecret) {
      console.warn("[Sightengine Log] Audio detection skipped: API credentials missing in .env");
      return {
        success: false,
        status: "unavailable",
        mediaType: "audio",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "UNCONFIGURED",
        evidence: {
          provider: "Sightengine",
          model: "ai_speech",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "ai_speech",
        requestId: null,
        message: "Detection service unavailable. No artificial score was generated."
      };
    }

    try {
      const formData = new FormData();
      formData.append("models", "ai_speech");
      formData.append("api_user", apiUser);
      formData.append("api_secret", apiSecret);
      formData.append("media", file.buffer, {
        filename: fileName,
        contentType: mimeType
      });

      console.log(`[SIGHTENGINE REQUEST STARTED] Endpoint: POST https://api.sightengine.com/1.0/audio/check.json | Models: ai_speech`);

      const response = await axios.post("https://api.sightengine.com/1.0/audio/check.json", formData, {
        headers: formData.getHeaders(),
        timeout: 30000 // 30s timeout
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const data = response.data;
      const requestId = data.request?.id || `req_${Date.now()}`;

      console.log(`[SIGHTENGINE RESPONSE STATUS] HTTP ${response.status} (Duration: ${duration}s, RequestID: ${requestId})`);

      if (process.env.NODE_ENV !== "production") {
        console.log("==========================================");
        console.log("[SIGHTENGINE RAW RESPONSE - AUDIO]");
        console.log(JSON.stringify(data, null, 2));
        console.log("==========================================");
      }

      if (data.status !== "success") {
        const errorMsg = data.error?.message || "Sightengine Audio API returned processing failure.";
        console.error(`[Sightengine Log] Audio Status: failure | Duration: ${duration}s | Message: ${errorMsg}`);
        return {
          success: false,
          status: "unavailable",
          mediaType: "audio",
          fileHash,
          classification: "DETECTION UNAVAILABLE",
          aiGenerated: null,
          deepfake: null,
          aiProbability: null,
          deepfakeProbability: null,
          genaiScore: null,
          deepfakeScore: null,
          confidence: null,
          risk: "ERROR",
          evidence: {
            provider: "Sightengine",
            model: "ai_speech",
            aiGeneratedScore: null,
            deepfakeScore: null,
            details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
          },
          file: {
            name: fileName,
            mimeType,
            size: fileSize,
            sha256: fileHash
          },
          provider: "Sightengine",
          model: "ai_speech",
          requestId: data.request?.id || null,
          message: `Audio detection service unavailable (${errorMsg}). No artificial score was generated.`
        };
      }

      const rawAiSpeech = data.type?.ai_speech ?? data.data?.ai_speech ?? data.summary?.ai_speech;
      console.log(`[SIGHTENGINE RAW FIELDS RECEIVED] audio.ai_speech: ${rawAiSpeech ?? "N/A"}`);
      const aiGenerated = rawAiSpeech != null ? Number(rawAiSpeech) : null;
      const deepfake = null; // Deepfake facial manipulation does NOT apply to audio recordings

      const aiProbability = aiGenerated != null ? Math.round(aiGenerated * 100) : null;
      const deepfakeProbability = null;

      let classification = "INCONCLUSIVE";
      if (aiGenerated != null) {
        if (aiGenerated >= 0.80) {
          classification = "HIGHLY LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.50) {
          classification = "LIKELY AI-GENERATED";
        } else if (aiGenerated >= 0.20) {
          classification = "UNCERTAIN";
        } else {
          classification = "LIKELY AUTHENTIC";
        }
      } else {
        classification = "DETECTION UNAVAILABLE";
      }

      const confidenceLevel = aiGenerated != null
        ? (aiGenerated >= 0.80 || aiGenerated <= 0.20 ? "HIGH" : "MODERATE")
        : "UNKNOWN";

      const rawConfidence = aiGenerated != null ? Math.round(aiGenerated >= 0.50 ? aiGenerated * 100 : (1 - aiGenerated) * 100) : null;
      const confidence = rawConfidence != null ? Math.min(99, Math.max(1, rawConfidence)) : null;

      const risk = aiGenerated != null
        ? (aiGenerated >= 0.50 ? "HIGH" : aiGenerated >= 0.20 ? "MODERATE" : "LOW")
        : "UNKNOWN";

      console.log(`[Sightengine Log] RequestID: ${requestId} | MediaType: AUDIO | Duration: ${duration}s | Status: success | aiGenerated: ${aiGenerated} (${aiProbability}%)`);

      const details = [];
      if (aiProbability != null) {
        details.push(`Sightengine AI Speech classifier returned a ${aiProbability}% synthetic speech probability.`);
      } else {
        details.push("Sightengine AI Speech classifier score unavailable for this audio recording.");
      }
      details.push("Deepfake/face manipulation analysis is not applicable to this audio.");
      details.push(`SHA-256 digest generated for file integrity verification (${fileHash}).`);

      return {
        success: true,
        status: "success",
        mediaType: "audio",
        fileHash,
        classification,
        deepfakeClassification: "UNAVAILABLE",
        verdict: classification,
        confidenceLevel,
        result: classification,
        scores: {
          aiGenerated,
          deepfake: null
        },
        percentages: {
          aiGenerated: aiProbability,
          deepfake: null
        },
        aiGenerated,
        deepfake: null,
        genaiScore: aiGenerated,
        deepfakeScore: null,
        aiProbability,
        deepfakeProbability: null,
        authenticProbability: aiProbability != null ? 100 - aiProbability : null,
        confidence,
        risk,
        evidence: details,
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "ai_speech",
        requestId
      };
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const errorDetail = err.response?.data?.error?.message || err.message;
      console.error(`[Sightengine Log] Audio Status: failure | Duration: ${duration}s | Error: ${errorDetail}`);
      return {
        success: false,
        status: "unavailable",
        mediaType: "audio",
        fileHash,
        classification: "DETECTION UNAVAILABLE",
        aiGenerated: null,
        deepfake: null,
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        confidence: null,
        risk: "ERROR",
        evidence: {
          provider: "Sightengine",
          model: "ai_speech",
          aiGeneratedScore: null,
          deepfakeScore: null,
          details: [`FILE EVIDENCE — SHA-256 Digest: ${fileHash}`]
        },
        file: {
          name: fileName,
          mimeType,
          size: fileSize,
          sha256: fileHash
        },
        provider: "Sightengine",
        model: "ai_speech",
        requestId: null,
        message: "Detection service unavailable. No artificial score was generated."
      };
    }
  }
};

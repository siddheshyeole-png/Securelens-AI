/**
 * SecureLens AI - Detector Provider Service
 * 
 * Provides production API communication abstractions for Express backend:
 * - POST http://localhost:5000/api/analyze (multipart/form-data, field: 'media')
 * 
 * Communicates strictly with SecureLens AI Express backend.
 * Performs zero data fabrication and never synthesizes pseudo-heuristics.
 */

const BACKEND_ANALYZE_URL = import.meta.env.VITE_DETECTION_API_URL || "/api/analyze";

export const detectorProvider = {
  detectImage: async (file) => {
    return detectorProvider._postAnalyze(file);
  },

  detectVideo: async (file) => {
    return detectorProvider._postAnalyze(file);
  },

  detectAudio: async (file) => {
    return detectorProvider._postAnalyze(file);
  },

  _postAnalyze: async (file) => {
    try {
      const formData = new FormData();
      formData.append("media", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 95000);

      const response = await fetch(BACKEND_ANALYZE_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        return {
          status: "MODEL_UNAVAILABLE",
          classification: data.classification || "DETECTION UNAVAILABLE",
          aiProbability: null,
          deepfakeProbability: null,
          reason: data.error || data.message || "Detection service unavailable. No artificial score was generated."
        };
      }

      return {
        status: "COMPLETED",
        genaiScore: data.genaiScore ?? data.aiScore ?? null,
        deepfakeScore: data.deepfakeScore ?? null,
        verdict: data.verdict || data.classification || "UNAVAILABLE",
        confidence: data.confidence ?? (data.aiProbability != null ? Math.max(data.aiProbability, 100 - data.aiProbability) : null),
        model: data.model || "genai,deepfake",
        rawResult: data.rawResult || {
          provider: data.provider || "Sightengine",
          requestId: data.requestId || null,
          status: "success"
        },
        classification: data.verdict || data.classification || "UNAVAILABLE",
        result: data.verdict || data.classification || "UNAVAILABLE",
        aiGenerated: data.genaiScore ?? data.aiScore ?? null,
        deepfake: data.deepfakeScore ?? null,
        aiProbability: data.aiProbability,
        deepfakeProbability: data.deepfakeProbability,
        authenticProbability: data.aiProbability != null ? 100 - data.aiProbability : null,
        risk: (data.verdict || data.classification) === "LIKELY AI-GENERATED"
          ? "HIGH"
          : (data.verdict || data.classification) === "LIKELY AUTHENTIC"
          ? "LOW"
          : "MODERATE",
        evidence: Array.isArray(data.evidence)
          ? { provider: data.provider || "Sightengine", model: data.model || "genai,deepfake", details: data.evidence }
          : (data.evidence || { provider: "Sightengine", model: "genai,deepfake", details: [] }),
        provider: data.provider || "Sightengine",
        modelName: data.model || "genai,deepfake",
        modelVersion: "N/A",
        requestId: data.requestId || null,
        fileHash: data.sha256,
        file: data.file || {}
      };
    } catch (err) {
      console.warn("Media detection API inference failed:", err);
      return {
        status: "FAILED",
        verdict: "DETECTION ERROR",
        classification: "DETECTION ERROR",
        aiProbability: null,
        deepfakeProbability: null,
        genaiScore: null,
        deepfakeScore: null,
        error: err.message || "Detection service unavailable due to a network or connection error."
      };
    }
  }
};

import { sightengineService } from "../sightengine.js";

/**
 * Audio Detector Provider
 * Delegates audio speech detection requests to Sightengine audio integration.
 * Ensures deepfake (face manipulation) is explicitly set to null/N/A with clear evidence.
 */
export const audioDetector = {
  detect: async (file) => {
    try {
      const result = await sightengineService.detectAudio(file);
      return result;
    } catch (err) {
      console.warn("[audioDetector Log] Audio detection provider returned error/unavailable:", err.message);
      return {
        success: false,
        status: "unavailable",
        mediaType: "audio",
        classification: "DETECTION UNAVAILABLE",
        verdict: "DETECTION UNAVAILABLE",
        confidenceLevel: "UNKNOWN",
        scores: {
          aiGenerated: null,
          deepfake: null
        },
        percentages: {
          aiGenerated: null,
          deepfake: null
        },
        evidence: [
          "Audio AI Speech detection service is currently unavailable.",
          "Deepfake/face manipulation analysis is not applicable to this audio."
        ],
        message: err.message || "Audio detector provider unavailable."
      };
    }
  }
};

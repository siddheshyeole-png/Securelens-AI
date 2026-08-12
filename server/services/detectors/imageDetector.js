import { sightengineService } from "../sightengine.js";

/**
 * Image Detector Provider
 * Wraps existing, fully-working Sightengine image detection pipeline.
 * Preserves raw Sightengine GenAI and Deepfake float probabilities and 4-tier verdicts.
 */
export const imageDetector = {
  detect: async (file) => {
    return await sightengineService.detectImage(file);
  }
};

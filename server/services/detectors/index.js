import { imageDetector } from "./imageDetector.js";
import { videoDetector } from "./videoDetector.js";
import { audioDetector } from "./audioDetector.js";
import { AppError } from "../../utils/errors.js";

/**
 * Multimodal Detector Router / Factory
 * Dispatches incoming media payloads to the corresponding modal detector provider.
 */
export function getDetector(mediaType = "IMAGE") {
  const normType = String(mediaType).toUpperCase().trim();
  switch (normType) {
    case "IMAGE":
      return imageDetector;
    case "VIDEO":
      return videoDetector;
    case "AUDIO":
      return audioDetector;
    default:
      return imageDetector;
  }
}

/**
 * Main multimodal detection execution helper.
 * Normalizes input file parameters and routes to image, video, or audio detector.
 */
export async function detectMedia(file, mediaType = "IMAGE") {
  if (!file) {
    throw new AppError("No media file provided for analysis.", 400, "MISSING_FILE");
  }

  const detector = getDetector(mediaType);
  return await detector.detect(file);
}

export { imageDetector, videoDetector, audioDetector };

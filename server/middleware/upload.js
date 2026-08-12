import multer from "multer";
import { AppError } from "../utils/errors.js";

// Store uploaded files in memory buffer so raw bytes can be forwarded to Sightengine
const storage = multer.memoryStorage();

const allowedMimeTypes = {
  image: ["image/jpeg", "image/png", "image/webp", "image/tiff"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/x-matroska"],
  audio: ["audio/mpeg", "audio/wav", "audio/mp3", "audio/aac", "audio/x-m4a", "audio/flac"]
};

const fileFilter = (req, file, cb) => {
  const allAllowedMimes = [
    ...allowedMimeTypes.image,
    ...allowedMimeTypes.video,
    ...allowedMimeTypes.audio
  ];

  const mimeType = file.mimetype?.toLowerCase() || "";
  const rawFileName = file.originalname || "unnamed_media";

  // Prevent path traversal and header injection by sanitizing filename
  const sanitizedFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  file.originalname = sanitizedFileName;

  const isValidMime = allAllowedMimes.includes(mimeType);
  const isValidExt = Boolean(sanitizedFileName.match(/\.(jpg|jpeg|png|webp|tiff|mp4|mov|webm|avi|mkv|mp3|wav|aac|m4a|flac)$/i));

  // Strict rule: MUST be both valid MIME type AND valid file extension
  if (!isValidMime || !isValidExt) {
    return cb(
      new AppError(
        `Unsupported media format (${file.mimetype || "unknown"}). Allowed formats: JPG, PNG, WEBP, MP4, MOV, MP3, WAV.`,
        415,
        "UNSUPPORTED_MEDIA_TYPE"
      ),
      false
    );
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB hard limit for media files
    fieldSize: 50 * 1024 * 1024   // 50MB limit for text fields
  }
});

import crypto from "crypto";

/**
 * Calculates deterministic SHA-256 cryptographic hash hex string from an in-memory file Buffer
 * @param {Buffer} buffer - File memory buffer
 * @returns {string|null} Full 64-character hexadecimal SHA-256 digest
 */
export function calculateSHA256(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return null;
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Alias for calculateSHA256 for backwards compatibility
 */
export const calculateBufferHash = calculateSHA256;

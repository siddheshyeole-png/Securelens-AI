/**
 * SecureLens File Metadata & EXIF Parser
 * Extract real image dimensions and EXIF presence from uploaded file buffers.
 * Zero data fabrication. Zero fake dimensions.
 */

/**
 * Extract real image dimensions (width x height) from Buffer (PNG, JPEG, WEBP)
 * Returns string "WIDTHxHEIGHT" or null if unavailable.
 */
export function extractDimensions(buffer, mimetype) {
  if (!buffer || buffer.length < 16) return null;

  try {
    const mime = (mimetype || "").toLowerCase();

    // PNG
    if (mime.includes("png") || (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)) {
      if (buffer.length >= 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        if (width > 0 && height > 0) return `${width}x${height}`;
      }
    }

    // JPEG
    if (mime.includes("jpeg") || mime.includes("jpg") || (buffer[0] === 0xff && buffer[1] === 0xd8)) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        const marker = buffer.readUInt16BE(offset);
        offset += 2;
        if (marker === 0xffc0 || marker === 0xffc1 || marker === 0xffc2 || marker === 0xffc3) {
          const height = buffer.readUInt16BE(offset + 3);
          const width = buffer.readUInt16BE(offset + 5);
          if (width > 0 && height > 0) return `${width}x${height}`;
          break;
        }
        const length = buffer.readUInt16BE(offset);
        offset += length;
      }
    }

    // WEBP
    if (mime.includes("webp") || (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")) {
      if (buffer.length >= 30) {
        const vp8Chunk = buffer.toString("ascii", 12, 16);
        if (vp8Chunk === "VP8 ") {
          const width = buffer.readUInt16LE(26) & 0x3fff;
          const height = buffer.readUInt16LE(28) & 0x3fff;
          if (width > 0 && height > 0) return `${width}x${height}`;
        } else if (vp8Chunk === "VP8L") {
          const b0 = buffer[21];
          const b1 = buffer[22];
          const b2 = buffer[23];
          const b3 = buffer[24];
          const width = 1 + (((b1 & 0x3f) << 8) | b0);
          const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
          if (width > 0 && height > 0) return `${width}x${height}`;
        } else if (vp8Chunk === "VP8X") {
          const width = 1 + buffer.readUIntLE(24, 3);
          const height = 1 + buffer.readUIntLE(27, 3);
          if (width > 0 && height > 0) return `${width}x${height}`;
        }
      }
    }
  } catch (err) {
    // Fail safe
  }

  return null;
}

/**
 * Check if JPEG contains EXIF metadata segment (APP1 0xFFE1 marker)
 */
export function extractExifInfo(buffer, mimetype) {
  if (!buffer || buffer.length < 12) {
    return { exifPresent: false, info: "Not present" };
  }

  try {
    const mime = (mimetype || "").toLowerCase();
    if (mime.includes("jpeg") || mime.includes("jpg") || (buffer[0] === 0xff && buffer[1] === 0xd8)) {
      let offset = 2;
      while (offset < buffer.length - 4) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker === 0xe1) {
          if (buffer.toString("ascii", offset + 4, offset + 8) === "Exif") {
            return { exifPresent: true, info: "Present in container" };
          }
        }
        if (marker === 0xda) break;
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch (err) {
    // Fail safe
  }

  return { exifPresent: false, info: "Not present" };
}

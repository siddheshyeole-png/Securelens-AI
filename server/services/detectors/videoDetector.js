import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sightengineService } from "../sightengine.js";

/**
 * Executes local Python video analyzer script via child_process.spawn
 */
function runLocalVideoAnalyzer(tempFilePath) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "local_video_analyzer.py");
    const pyProcess = spawn("python", [pythonScript, tempFilePath]);

    let stdoutData = "";
    let stderrData = "";

    pyProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    pyProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0 || !stdoutData.trim()) {
        console.warn(`[localVideoAnalyzer Error] Exit code ${code}: ${stderrData}`);
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.warn("[localVideoAnalyzer Error] Failed to parse JSON output:", err.message);
        resolve(null);
      }
    });

    pyProcess.on("error", (err) => {
      console.warn("[localVideoAnalyzer Error] Process spawn error:", err.message);
      resolve(null);
    });
  });
}

/**
 * Video Detector Provider
 * Attempts Sightengine cloud API first; falls back seamlessly to Local OpenCV/PyTorch ML Video Detector.
 */
export const videoDetector = {
  detect: async (file) => {
    // 1. Attempt Sightengine Cloud API detection first
    const sightengineResult = await sightengineService.detectVideo(file);

    // If Sightengine succeeded, return its result
    if (sightengineResult && sightengineResult.success && sightengineResult.status !== "unavailable") {
      return sightengineResult;
    }

    console.log("[videoDetector Log] Sightengine Video API restricted or unavailable. Executing Local ML Video Analyzer...");

    // 2. Fallback to Local OpenCV/PyTorch Video Analyzer
    const tempDir = path.resolve(process.cwd(), "server", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileExt = path.extname(file.originalname || "video.mp4") || ".mp4";
    const tempFilePath = path.join(tempDir, `temp_vid_${uniqueId}${fileExt}`);

    try {
      fs.writeFileSync(tempFilePath, file.buffer);
      const localResult = await runLocalVideoAnalyzer(tempFilePath);

      if (localResult && localResult.success) {
        localResult.file.name = file.originalname || localResult.file.name;
        return localResult;
      }
    } catch (err) {
      console.warn("[videoDetector Log] Local ML Video Analyzer failed:", err.message);
    } finally {
      // Always clean up temporary video buffer
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          // ignore cleanup errors
        }
      }
    }

    // 3. Fallback if both cloud and local ML are unavailable
    return sightengineResult || {
      success: false,
      status: "unavailable",
      mediaType: "video",
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
        "Video AI-generation detection service is currently unavailable.",
        "Deepfake face manipulation analysis is unavailable for this video."
      ],
      message: "Video detection service unavailable."
    };
  }
};

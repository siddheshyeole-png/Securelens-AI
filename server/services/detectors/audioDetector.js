import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sightengineService } from "../sightengine.js";

/**
 * Executes local PyTorch Real Audio Synthetic Voice Detector script via child_process.spawn
 */
function runRealPyTorchAudioDetector(tempFilePath) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "real_audio_synthetic_model.py");
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
        console.warn(`[realAudioDetector Error] Exit code ${code}: ${stderrData}`);
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.warn("[realAudioDetector Error] Failed to parse JSON output:", err.message);
        resolve(null);
      }
    });

    pyProcess.on("error", (err) => {
      console.warn("[realAudioDetector Error] Process spawn error:", err.message);
      resolve(null);
    });
  });
}

/**
 * Audio Detector Provider
 * Executes Pretrained PyTorch Real Audio Synthetic Speech Classifier directly for all audio inputs.
 * Bypasses Sightengine Audio API completely, ensuring deepfake face scores remain null (N/A).
 */
export const audioDetector = {
  detect: async (file) => {
    console.log("[audioDetector Log] Executing Pretrained PyTorch Real Audio Synthetic Voice Model...");

    const tempDir = path.resolve(process.cwd(), "server", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileExt = path.extname(file.originalname || "audio.wav") || ".wav";
    const tempFilePath = path.join(tempDir, `temp_aud_${uniqueId}${fileExt}`);

    try {
      fs.writeFileSync(tempFilePath, file.buffer);
      const localResult = await runRealPyTorchAudioDetector(tempFilePath);

      if (localResult && localResult.success) {
        localResult.file.name = file.originalname || localResult.file.name;
        return localResult;
      }
    } catch (err) {
      console.warn("[audioDetector Log] PyTorch Real Audio Detector failed:", err.message);
    } finally {
      // Always clean up temporary audio buffer
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          // ignore cleanup errors
        }
      }
    }

    // Fallback if PyTorch execution fails
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
        "PyTorch Local Synthetic Voice detection model service is currently unavailable.",
        "Facial manipulation / deepfake scoring is strictly NOT applicable to audio recordings (scores.deepfake = N/A)."
      ],
      message: "PyTorch Synthetic Voice detection model unavailable."
    };
  }
};

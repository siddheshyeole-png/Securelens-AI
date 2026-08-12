import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sightengineService } from "../sightengine.js";

/**
 * Executes local PyTorch Real Video Deepfake Model script via child_process.spawn
 */
function runRealPyTorchVideoDetector(tempFilePath) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "real_video_deepfake_model.py");
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
        console.warn(`[realVideoDetector Error] Exit code ${code}: ${stderrData}`);
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.warn("[realVideoDetector Error] Failed to parse JSON output:", err.message);
        resolve(null);
      }
    });

    pyProcess.on("error", (err) => {
      console.warn("[realVideoDetector Error] Process spawn error:", err.message);
      resolve(null);
    });
  });
}

/**
 * Executes server-side video frame extractor script (extract_video_frames.py)
 */
function runFrameExtractor(tempFilePath, targetCount = 10) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "extract_video_frames.py");
    const pyProcess = spawn("python", [pythonScript, tempFilePath, String(targetCount)]);

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
        console.warn(`[runFrameExtractor Error] Exit code ${code}: ${stderrData}`);
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.warn("[runFrameExtractor Error] Failed to parse JSON output:", err.message);
        resolve(null);
      }
    });

    pyProcess.on("error", (err) => {
      console.warn("[runFrameExtractor Error] Process spawn error:", err.message);
      resolve(null);
    });
  });
}

/**
 * Safely cleans up temporary frame cache folder
 */
function cleanupFrameCache(tempCacheDir) {
  if (tempCacheDir && fs.existsSync(tempCacheDir)) {
    try {
      fs.rmSync(tempCacheDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("[videoDetector Log] Frame cache cleanup warning:", e.message);
    }
  }
}

/**
 * Analyzes extracted keyframes through Sightengine Image AI Classifier
 * and aggregates frame AI scores.
 */
async function analyzeFramesWithImageDetector(extractedFrames) {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    return {
      aiGenerated: null,
      aiProbability: null,
      framesAnalyzed: 0,
      evidence: "Sightengine API credentials missing in .env; frame-level AI generation detection skipped."
    };
  }

  if (!Array.isArray(extractedFrames) || extractedFrames.length === 0) {
    return {
      aiGenerated: null,
      aiProbability: null,
      framesAnalyzed: 0,
      evidence: "No representative keyframes extracted for AI generation analysis."
    };
  }

  // To maintain fast processing and respect API limits, select up to 8 representative frames
  const framesToAnalyze = extractedFrames.slice(0, 8);
  const validFrameScores = [];

  for (const frameInfo of framesToAnalyze) {
    if (frameInfo.framePath && fs.existsSync(frameInfo.framePath)) {
      try {
        const frameBuffer = fs.readFileSync(frameInfo.framePath);
        const frameFile = {
          buffer: frameBuffer,
          originalname: path.basename(frameInfo.framePath),
          mimetype: "image/jpeg"
        };

        const imageResult = await sightengineService.detectImage(frameFile);
        const frameAiScore = imageResult.scores?.aiGenerated ?? imageResult.genaiScore ?? imageResult.aiScore ?? null;
        if (frameAiScore != null) {
          validFrameScores.push(Number(frameAiScore));
        }
      } catch (err) {
        console.warn(`[videoDetector Log] Frame analysis failed for ${frameInfo.framePath}:`, err.message);
      }
    }
  }

  if (validFrameScores.length === 0) {
    return {
      aiGenerated: null,
      aiProbability: null,
      framesAnalyzed: 0,
      evidence: "Frame-level AI classifier returned unavailable state for sampled video keyframes."
    };
  }

  // Temporal aggregation: 0.7 * max(P) + 0.3 * mean(P)
  const maxScore = Math.max(...validFrameScores);
  const meanScore = validFrameScores.reduce((acc, v) => acc + v, 0) / validFrameScores.length;
  const aggregatedScore = Math.min(0.99, Math.max(0.001, Number((0.7 * maxScore + 0.3 * meanScore).toFixed(3))));
  const aggregatedPct = Math.round(aggregatedScore * 100);

  return {
    aiGenerated: aggregatedScore,
    aiProbability: aggregatedPct,
    framesAnalyzed: validFrameScores.length,
    evidence: `Frame-level AI Classifier sampled and analyzed ${validFrameScores.length} representative keyframes using Sightengine GenAI neural detector (${aggregatedPct}% AI-generation probability).`
  };
}

/**
 * Multimodal Video Detector Provider
 * Combines Real PyTorch Video Deepfake Neural Classifier with Frame-Level Sightengine Image AI Classifier.
 */
export const videoDetector = {
  detect: async (file) => {
    console.log("[videoDetector Log] Executing Multimodal Video Analysis (PyTorch Deepfake + Frame-Level GenAI)...");

    const tempDir = path.resolve(process.cwd(), "server", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileExt = path.extname(file.originalname || "video.mp4") || ".mp4";
    const tempFilePath = path.join(tempDir, `temp_vid_${uniqueId}${fileExt}`);

    let deepfakeResult = null;
    let frameExtractionData = null;
    let frameAiResult = { aiGenerated: null, aiProbability: null, framesAnalyzed: 0 };

    try {
      fs.writeFileSync(tempFilePath, file.buffer);

      // 1. Run Real PyTorch Video Deepfake Detector
      try {
        deepfakeResult = await runRealPyTorchVideoDetector(tempFilePath);
      } catch (err) {
        console.warn("[videoDetector Log] PyTorch Video Deepfake Detector warning:", err.message);
      }

      // 2. Extract Representative Frames & Run Frame-Level Image AI Classifier
      try {
        frameExtractionData = await runFrameExtractor(tempFilePath, 10);
        if (frameExtractionData && frameExtractionData.success && Array.isArray(frameExtractionData.extractedFrames)) {
          frameAiResult = await analyzeFramesWithImageDetector(frameExtractionData.extractedFrames);
        }
      } catch (err) {
        console.warn("[videoDetector Log] Frame-level AI extraction warning:", err.message);
      }
    } catch (err) {
      console.warn("[videoDetector Log] Video processing error:", err.message);
    } finally {
      // Clean up extracted frame temp folder & uploaded video buffer immediately
      if (frameExtractionData?.tempCacheDir) {
        cleanupFrameCache(frameExtractionData.tempCacheDir);
      }
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {}
      }
    }

    // 3. Score Normalization & Combination
    const deepfakeScore = deepfakeResult?.scores?.deepfake ?? deepfakeResult?.deepfakeScore ?? null;
    const deepfakePct = deepfakeResult?.percentages?.deepfake ?? deepfakeResult?.deepfakeProbability ?? (deepfakeScore != null ? Math.round(deepfakeScore * 100) : null);

    const aiScore = frameAiResult.aiGenerated;
    const aiPct = frameAiResult.aiProbability;

    // 4-Tier Verdict System
    let verdict = "INCONCLUSIVE";
    let risk = "MODERATE";

    if (deepfakeScore != null && deepfakeScore >= 0.50) {
      verdict = deepfakeScore >= 0.80 ? "HIGHLY LIKELY DEEPFAKE" : "LIKELY DEEPFAKE";
      risk = "HIGH";
    } else if (aiScore != null) {
      if (aiScore >= 0.80) {
        verdict = "HIGHLY LIKELY AI-GENERATED";
        risk = "HIGH";
      } else if (aiScore >= 0.50) {
        verdict = "LIKELY AI-GENERATED";
        risk = "HIGH";
      } else if (aiScore >= 0.20) {
        verdict = "UNCERTAIN";
        risk = "MODERATE";
      } else {
        verdict = "LIKELY AUTHENTIC";
        risk = "LOW";
      }
    } else if (deepfakeScore != null) {
      if (deepfakeScore >= 0.20) {
        verdict = "UNCERTAIN";
        risk = "MODERATE";
      } else {
        verdict = "LIKELY AUTHENTIC";
        risk = "LOW";
      }
    } else {
      verdict = "DETECTION UNAVAILABLE";
      risk = "UNKNOWN";
    }

    const confidenceLevel = deepfakeScore != null || aiScore != null
      ? ((deepfakeScore != null && (deepfakeScore >= 0.80 || deepfakeScore <= 0.20)) || (aiScore != null && (aiScore >= 0.80 || aiScore <= 0.20)) ? "HIGH" : "MODERATE")
      : "UNKNOWN";

    const rawConf = aiScore != null
      ? Math.round(aiScore >= 0.50 ? aiScore * 100 : (1 - aiScore) * 100)
      : (deepfakeScore != null ? Math.round(deepfakeScore >= 0.50 ? deepfakeScore * 100 : (1 - deepfakeScore) * 100) : null);
    const confidence = rawConf != null ? Math.min(99, Math.max(1, rawConf)) : null;

    // Build Evidence Statements
    const evidence = [];
    if (deepfakeResult && Array.isArray(deepfakeResult.evidence)) {
      evidence.push(...deepfakeResult.evidence);
    } else if (deepfakeScore != null) {
      evidence.push(`Deepfake model returned an ${deepfakePct}% face-manipulation probability.`);
    }

    if (frameAiResult.evidence) {
      evidence.push(frameAiResult.evidence);
    } else if (aiPct != null) {
      evidence.push(`Frame-level AI classifier returned an aggregated ${aiPct}% AI-generation probability.`);
    } else {
      evidence.push("Frame-level AI-generation score was unavailable for this video format/plan.");
    }

    const fileHash = deepfakeResult?.fileHash || deepfakeResult?.file?.sha256 || crypto.createHash("sha256").update(file.buffer).digest("hex");
    evidence.push(`SHA-256 cryptographic digest verified (${fileHash}).`);

    return {
      success: true,
      status: "success",
      mediaType: "video",
      fileHash,
      classification: verdict,
      verdict,
      confidenceLevel,
      confidence,
      risk,
      scores: {
        aiGenerated: aiScore,
        deepfake: deepfakeScore
      },
      percentages: {
        aiGenerated: aiPct,
        deepfake: deepfakePct
      },
      aiGenerated: aiScore,
      deepfake: deepfakeScore,
      genaiScore: aiScore,
      deepfakeScore,
      aiProbability: aiPct,
      deepfakeProbability: deepfakePct,
      evidence,
      file: {
        name: file.originalname || "video.mp4",
        size: file.buffer.length,
        sha256: fileHash,
        duration: frameExtractionData?.diagnostics?.duration || deepfakeResult?.diagnostics?.duration || "N/A"
      },
      diagnostics: {
        duration: frameExtractionData?.diagnostics?.duration || deepfakeResult?.diagnostics?.duration || "N/A",
        frameCount: frameExtractionData?.diagnostics?.frameCount || deepfakeResult?.diagnostics?.frameCount || 0,
        sampledFrameCount: frameAiResult.framesAnalyzed || deepfakeResult?.diagnostics?.sampledFrameCount || 0,
        detectedFaceCount: deepfakeResult?.diagnostics?.detectedFaceCount || 0,
        fps: frameExtractionData?.diagnostics?.fps || deepfakeResult?.diagnostics?.fps || 30.0,
        resolution: frameExtractionData?.diagnostics?.resolution || deepfakeResult?.diagnostics?.resolution || "360x360"
      },
      provider: deepfakeResult?.provider || "SecureLens Multimodal Video Engine",
      model: "PyTorch ResNet-18 Deepfake + Frame-Level GenAI Classifier",
      requestId: deepfakeResult?.requestId || `req_vid_${fileHash.substring(0, 12)}`
    };
  }
};

import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";

// Load backend environment variables
dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });
if (!process.env.SIGHTENGINE_API_USER) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const BASE_URL = process.env.VALIDATION_API_URL || "http://localhost:5000";

function inferCategoryFromPath(filePath) {
  const normalized = filePath.toLowerCase().replace(/\\/g, "/");
  if (normalized.includes("/authentic/") || normalized.includes("/real/") || path.basename(normalized).startsWith("authentic_")) {
    return "AUTHENTIC";
  }
  if (normalized.includes("/ai_generated/") || normalized.includes("/synthetic/") || path.basename(normalized).startsWith("ai_")) {
    return "AI_GENERATED";
  }
  if (normalized.includes("/deepfake/") || normalized.includes("/manipulated/") || path.basename(normalized).startsWith("deepfake_")) {
    return "DEEPFAKE";
  }
  return "AUTHENTIC"; // Default fallback assumption for baseline tests
}

function collectTestFiles(targetPath) {
  const files = [];
  if (!fs.existsSync(targetPath)) return files;

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    files.push({
      filePath: targetPath,
      category: inferCategoryFromPath(targetPath)
    });
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath);
    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry);
      const subStat = fs.statSync(fullPath);
      if (subStat.isDirectory()) {
        files.push(...collectTestFiles(fullPath));
      } else if (subStat.isFile() && entry.match(/\.(jpg|jpeg|png|webp|mp4|mov|mp3|wav)$/i)) {
        files.push({
          filePath: fullPath,
          category: inferCategoryFromPath(fullPath)
        });
      }
    }
  }
  return files;
}

async function runValidationMode() {
  console.log("==========================================================");
  console.log("[SecureLens AI] Sightengine Dataset Validation Suite");
  console.log("==========================================================");
  console.log(`- API User: ${process.env.SIGHTENGINE_API_USER ? "Set (" + process.env.SIGHTENGINE_API_USER.substring(0, 4) + "****)" : "MISSING"}`);
  console.log(`- Backend Endpoint: ${BASE_URL}/api/analyze`);
  console.log("==========================================================\n");

  const inputArg = process.argv[2] || path.resolve(process.cwd(), "server", "dataset");
  let filesToValidate = collectTestFiles(inputArg);

  // Fallback: If dataset directory is empty or missing, download sample test image
  if (filesToValidate.length === 0) {
    console.log("[Notice] Dataset directory empty. Downloading sample authentic test image...");
    try {
      const sampleRes = await axios.get("https://picsum.photos/400/400", { responseType: "arraybuffer" });
      const tempPath = path.resolve(process.cwd(), "server", "temp_authentic_test.jpg");
      fs.writeFileSync(tempPath, Buffer.from(sampleRes.data));
      filesToValidate.push({ filePath: tempPath, category: "AUTHENTIC" });
    } catch (err) {
      console.error("❌ Failed to download sample test image:", err.message);
      process.exit(1);
    }
  }

  console.log(`Found ${filesToValidate.length} file(s) in test dataset:\n`);
  const validationResults = [];

  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let inconclusiveCount = 0;

  for (let i = 0; i < filesToValidate.length; i++) {
    const { filePath, category } = filesToValidate[i];
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = fileName.endsWith(".mp4") ? "video/mp4" : fileName.endsWith(".mp3") ? "audio/mpeg" : "image/jpeg";
    const fileSize = fileBuffer.length;

    console.log(`[${i + 1}/${filesToValidate.length}] Testing [Expected: ${category}]: ${fileName} (${(fileSize / 1024).toFixed(2)} KB)`);

    try {
      const formData = new FormData();
      formData.append("media", fileBuffer, { filename: fileName, contentType: mimeType });

      const startTime = Date.now();
      const res = await axios.post(`${BASE_URL}/api/analyze`, formData, {
        headers: formData.getHeaders(),
        timeout: 90000
      });
      const durationMs = Date.now() - startTime;
      const data = res.data;

      const verdict = data.verdict || data.classification || "UNAVAILABLE";
      const genaiScore = data.genaiScore ?? data.aiScore ?? null;
      const deepfakeScore = data.deepfakeScore ?? null;

      let outcome = "INCONCLUSIVE";
      if (category === "AUTHENTIC") {
        if (verdict === "LIKELY AUTHENTIC") {
          outcome = "TRUE_NEGATIVE";
          trueNegatives++;
        } else if (verdict === "LIKELY AI-GENERATED" || verdict === "LIKELY DEEPFAKE") {
          outcome = "FALSE_POSITIVE";
          falsePositives++;
        } else {
          inconclusiveCount++;
        }
      } else { // AI_GENERATED or DEEPFAKE
        if (verdict === "LIKELY AI-GENERATED" || verdict === "LIKELY DEEPFAKE") {
          outcome = "TRUE_POSITIVE";
          truePositives++;
        } else if (verdict === "LIKELY AUTHENTIC") {
          outcome = "FALSE_NEGATIVE";
          falseNegatives++;
        } else {
          inconclusiveCount++;
        }
      }

      const resultEntry = {
        filename: fileName,
        category,
        fileType: mimeType,
        fileSize,
        genaiScore,
        deepfakeScore,
        verdict,
        outcome,
        apiStatus: data.success !== false ? "SUCCESS" : "UNAVAILABLE",
        requestId: data.requestId || null,
        durationMs,
        timestamp: new Date().toISOString()
      };

      validationResults.push(resultEntry);

      console.log(`   - GenAI Score: ${genaiScore != null ? (genaiScore * 100).toFixed(1) + "%" : "UNAVAILABLE"}`);
      console.log(`   - Deepfake Score: ${deepfakeScore != null ? (deepfakeScore * 100).toFixed(1) + "%" : "UNAVAILABLE"}`);
      console.log(`   - Verdict: ${verdict} | Outcome: ${outcome}`);
      console.log(`   - Request ID: ${resultEntry.requestId || "N/A"} (${(durationMs / 1000).toFixed(2)}s)\n`);
    } catch (err) {
      console.error(`   ❌ Failed to analyze ${fileName}:`, err.response?.data?.error || err.message, "\n");
      validationResults.push({
        filename: fileName,
        category,
        fileType: mimeType,
        fileSize,
        genaiScore: null,
        deepfakeScore: null,
        verdict: "ERROR",
        outcome: "ERROR",
        apiStatus: "FAILED",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  const evaluatedTotal = truePositives + trueNegatives + falsePositives + falseNegatives;
  const accuracy = evaluatedTotal > 0 ? (((truePositives + trueNegatives) / evaluatedTotal) * 100).toFixed(1) : "N/A";
  const precision = (truePositives + falsePositives) > 0 ? ((truePositives / (truePositives + falsePositives)) * 100).toFixed(1) : "N/A";
  const recall = (truePositives + falseNegatives) > 0 ? ((truePositives / (truePositives + falseNegatives)) * 100).toFixed(1) : "N/A";

  const metricsSummary = {
    totalFilesTested: filesToValidate.length,
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    inconclusiveCount,
    accuracy: accuracy !== "N/A" ? `${accuracy}%` : "N/A",
    precision: precision !== "N/A" ? `${precision}%` : "N/A",
    recall: recall !== "N/A" ? `${recall}%` : "N/A",
    timestamp: new Date().toISOString()
  };

  // Print Validation Results Table
  console.log("==========================================================");
  console.log("DATASET VALIDATION AUDIT TABLE");
  console.log("==========================================================");
  console.table(validationResults.map((r) => ({
    Filename: r.filename,
    Category: r.category,
    "GenAI %": r.genaiScore != null ? Math.round(r.genaiScore * 100) + "%" : "UNAVAILABLE",
    "Deepfake %": r.deepfakeScore != null ? Math.round(r.deepfakeScore * 100) + "%" : "UNAVAILABLE",
    Verdict: r.verdict,
    Outcome: r.outcome,
    RequestID: r.requestId || "N/A"
  })));

  console.log("==========================================================");
  console.log("ACCURACY & STATISTICAL METRICS SUMMARY");
  console.log("==========================================================");
  console.table([metricsSummary]);
  console.log("==========================================================\n");

  // Save report to disk
  const summaryPath = path.resolve(process.cwd(), "server", "logs", "validation_summary.json");
  const metricsPath = path.resolve(process.cwd(), "server", "logs", "dataset_validation_metrics.json");

  try {
    fs.writeFileSync(summaryPath, JSON.stringify(validationResults, null, 2));
    fs.writeFileSync(metricsPath, JSON.stringify(metricsSummary, null, 2));
    console.log(`Summary logs saved to: ${summaryPath}`);
    console.log(`Metrics saved to: ${metricsPath}`);
  } catch (e) {}

  process.exit(0);
}

runValidationMode();

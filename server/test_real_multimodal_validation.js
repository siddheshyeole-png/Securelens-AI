import express from "express";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import detectionRouter from "./routes/detection.js";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const app = express();
app.use(express.json());
app.use("/api", detectionRouter);

const PORT = 5094;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const server = app.listen(PORT, async () => {
  console.log("=======================================================================");
  console.log(" SECURELENS AI — REAL MULTIMODAL END-TO-END VALIDATION SUITE");
  console.log("=======================================================================");

  const testResults = [];

  async function executeTestItem(name, filePath, expectedMime, allowedStatuses = [200]) {
    console.log(`\n>>> Executing Test: [${name}] (${filePath})`);
    const fullPath = path.resolve(process.cwd(), "server", filePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Asset missing: ${fullPath}`);
      testResults.push({ name, pass: "FAIL", error: "Asset missing" });
      return;
    }

    const buffer = fs.readFileSync(fullPath);
    const form = new FormData();
    form.append("media", buffer, { filename: path.basename(filePath), contentType: expectedMime });

    const startTime = Date.now();
    try {
      const res = await axios.post(`http://localhost:${PORT}/api/analyze`, form, {
        headers: form.getHeaders(),
        validateStatus: () => true
      });
      const procTime = Date.now() - startTime;

      const body = res.data;
      const isPass = allowedStatuses.includes(res.status);

      const record = {
        name,
        pass: isPass ? "PASS" : "FAIL",
        httpStatus: res.status,
        processingTimeMs: procTime,
        mediaType: body.mediaType || body.type || (expectedMime.startsWith("video") ? "VIDEO" : expectedMime.startsWith("audio") ? "AUDIO" : "IMAGE"),
        filename: path.basename(filePath),
        model: body.model || body.diagnostics?.modelRequested || "N/A",
        rawScores: body.scores || { aiGenerated: body.aiScore ?? null, deepfake: body.deepfakeScore ?? null },
        percentages: body.percentages || { aiGenerated: body.aiProbability ?? null, deepfake: body.deepfakeProbability ?? null },
        verdict: body.verdict || body.classification || (res.status !== 200 ? "REJECTED" : "UNCERTAIN"),
        confidenceLevel: body.confidenceLevel || "N/A",
        sha256: body.sha256 || body.fileHash || "N/A",
        evidence: body.evidence || []
      };

      console.log(`- Status: ${record.pass} (HTTP ${res.status}) [Time: ${procTime}ms]`);
      console.log(`- Verdict: ${record.verdict} | Confidence: ${record.confidenceLevel}`);
      console.log(`- Raw Scores:`, record.rawScores);
      console.log(`- Percentages:`, record.percentages);
      console.log(`- SHA-256: ${record.sha256}`);

      testResults.push(record);
    } catch (err) {
      console.error(`❌ Execution error for ${name}:`, err.message);
      testResults.push({ name, pass: "FAIL", error: err.message });
    }

    // Small delay between tests to ensure clean process/memory isolation
    await sleep(1500);
  }

  // 1. IMAGE: Authentic photograph
  await executeTestItem("IMAGE: Authentic Sample", "test_valid_sample.jpg", "image/jpeg", [200]);

  // 2. IMAGE: Portrait Photograph
  await executeTestItem("IMAGE: Portrait Sample", "test_portrait.jpg", "image/jpeg", [200]);

  // 3. VIDEO: Authentic MP4 Video
  await executeTestItem("VIDEO: MP4 Video Sample", "test_sample_video.mp4", "video/mp4", [200]);

  // 4. AUDIO: Standard Speech WAV
  await executeTestItem("AUDIO: Speech WAV Sample", "test_sample_audio.wav", "audio/wav", [200]);

  // 5. AUDIO: Silent Waveform
  await executeTestItem("AUDIO: Silent Waveform Sample", "test_silent_audio.wav", "audio/wav", [200]);

  // 6. AUDIO: Ultra-short Audio (<1s)
  await executeTestItem("AUDIO: Ultra-short Audio Sample", "test_short_audio.wav", "audio/wav", [200]);

  // 7. EDGE-CASE: Invalid File Format (.txt)
  await executeTestItem("EDGE-CASE: Invalid Text File Rejection", "test_invalid_file.txt", "text/plain", [415]);

  // 8. EDGE-CASE: Corrupted File Header
  await executeTestItem("EDGE-CASE: Corrupted WAV File", "test_corrupted_file.wav", "audio/wav", [200, 400, 415, 502]);

  server.close();

  // Print Summary Table
  console.log("\n=======================================================================");
  console.log(" END-TO-END MULTIMODAL VALIDATION SUMMARY");
  console.log("=======================================================================");
  console.table(testResults.map(r => ({
    Test: r.name,
    Pass: r.pass,
    HTTP: r.httpStatus,
    TimeMs: r.processingTimeMs,
    Type: r.mediaType,
    Verdict: r.verdict,
    Model: r.model
  })));

  const totalPass = testResults.filter(r => r.pass === "PASS").length;
  console.log(`\nFINAL SCORE: ${totalPass}/${testResults.length} VALIDATION SCENARIOS PASSED`);

  // Write JSON report artifact
  const reportPath = path.resolve(process.cwd(), "server", "data", "validation_results.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  if (totalPass === testResults.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

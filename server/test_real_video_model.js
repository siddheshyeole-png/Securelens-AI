import express from "express";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import detectionRouter from "./routes/detection.js";

const app = express();
app.use(express.json());
app.use("/api", detectionRouter);

const server = app.listen(5098, async () => {
  console.log("==========================================");
  console.log("[SecureLens AI] Real PyTorch Video Model Integration Test");
  console.log("==========================================");

  const videoPath = path.resolve(process.cwd(), "server", "test_sample_video.mp4");
  const buffer = fs.readFileSync(videoPath);

  const formData = new FormData();
  formData.append("media", buffer, { filename: "test_sample_video.mp4", contentType: "video/mp4" });

  try {
    const res = await axios.post("http://localhost:5098/api/analyze", formData, {
      headers: formData.getHeaders()
    });

    console.log(`- HTTP Status: ${res.status}`);
    console.log(`- Success: ${res.data.success}`);
    console.log(`- Verdict: ${res.data.verdict}`);
    console.log(`- Scores:`, res.data.scores);
    console.log(`- Percentages:`, res.data.percentages);
    console.log(`- Provider: ${res.data.provider}`);
    console.log(`- Model: ${res.data.model}`);
    console.log(`- Request ID: ${res.data.requestId}`);
    console.log(`- Evidence:`, res.data.evidence);

    server.close();

    // Verify key requirements
    const isSuccess = res.status === 200 && res.data.success;
    const isAiNull = res.data.scores.aiGenerated === null;
    const isDfReal = typeof res.data.scores.deepfake === "number" && res.data.scores.deepfake > 0;

    if (isSuccess && isAiNull && isDfReal) {
      console.log("\n✅ REAL PYTORCH VIDEO MODEL TEST PASSED 100%!");
      process.exit(0);
    } else {
      console.error("\n❌ MODEL TEST FAILED - Validation failed:", res.data);
      process.exit(1);
    }
  } catch (err) {
    server.close();
    console.error("❌ Model Test Error:", err.response?.data || err.message);
    process.exit(1);
  }
});

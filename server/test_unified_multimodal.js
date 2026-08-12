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

const server = app.listen(5096, async () => {
  console.log("=================================================");
  console.log(" SecureLens AI Unified Multimodal Verification");
  console.log("=================================================");

  let passCount = 0;
  const totalTests = 3;

  try {
    // ---------------------------------------------------------
    // TEST 1: IMAGE MODALITY (Sightengine API)
    // ---------------------------------------------------------
    console.log("\n--- TEST 1: IMAGE MODALITY (Sightengine API) ---");
    const imagePath = path.resolve(process.cwd(), "server", "test_valid_sample.jpg");
    const imageBuffer = fs.readFileSync(imagePath);

    const fdImage = new FormData();
    fdImage.append("media", imageBuffer, { filename: "test_valid_sample.jpg", contentType: "image/jpeg" });

    const resImage = await axios.post("http://localhost:5096/api/analyze", fdImage, {
      headers: fdImage.getHeaders()
    });

    console.log("HTTP Status:", resImage.status);
    console.log("Media Type:", resImage.data.mediaType || resImage.data.type);
    console.log("Provider:", resImage.data.provider);
    console.log("Verdict:", resImage.data.verdict);
    console.log("Scores:", resImage.data.scores);

    if (
      resImage.status === 200 &&
      resImage.data.success &&
      resImage.data.provider === "Sightengine" &&
      typeof resImage.data.scores.aiGenerated === "number" &&
      typeof resImage.data.scores.deepfake === "number"
    ) {
      console.log("✅ TEST 1 PASSED: Image modality successfully routed to Sightengine API.");
      passCount++;
    } else {
      console.error("❌ TEST 1 FAILED:", resImage.data);
    }

    // ---------------------------------------------------------
    // TEST 2: VIDEO MODALITY (Local PyTorch Video Model)
    // ---------------------------------------------------------
    console.log("\n--- TEST 2: VIDEO MODALITY (Local PyTorch Video Model) ---");
    const videoPath = path.resolve(process.cwd(), "server", "test_sample_video.mp4");
    const videoBuffer = fs.readFileSync(videoPath);

    const fdVideo = new FormData();
    fdVideo.append("media", videoBuffer, { filename: "test_sample_video.mp4", contentType: "video/mp4" });

    const resVideo = await axios.post("http://localhost:5096/api/analyze", fdVideo, {
      headers: fdVideo.getHeaders()
    });

    console.log("HTTP Status:", resVideo.status);
    console.log("Media Type:", resVideo.data.mediaType || resVideo.data.type);
    console.log("Provider:", resVideo.data.provider);
    console.log("Verdict:", resVideo.data.verdict);
    console.log("Scores:", resVideo.data.scores);

    if (
      resVideo.status === 200 &&
      resVideo.data.success &&
      resVideo.data.provider.includes("PyTorch") &&
      (typeof resVideo.data.scores.aiGenerated === "number" || resVideo.data.scores.aiGenerated === null) &&
      typeof resVideo.data.scores.deepfake === "number"
    ) {
      console.log("✅ TEST 2 PASSED: Video modality successfully routed to Multimodal Video Detector.");
      passCount++;
    } else {
      console.error("❌ TEST 2 FAILED:", resVideo.data);
    }

    // ---------------------------------------------------------
    // TEST 3: AUDIO MODALITY (Local PyTorch Audio Model)
    // ---------------------------------------------------------
    console.log("\n--- TEST 3: AUDIO MODALITY (Local PyTorch Audio Model) ---");
    const audioPath = path.resolve(process.cwd(), "server", "test_sample_audio.wav");
    const audioBuffer = fs.readFileSync(audioPath);

    const fdAudio = new FormData();
    fdAudio.append("media", audioBuffer, { filename: "test_sample_audio.wav", contentType: "audio/wav" });

    const resAudio = await axios.post("http://localhost:5096/api/analyze", fdAudio, {
      headers: fdAudio.getHeaders()
    });

    console.log("HTTP Status:", resAudio.status);
    console.log("Media Type:", resAudio.data.mediaType || resAudio.data.type);
    console.log("Provider:", resAudio.data.provider);
    console.log("Verdict:", resAudio.data.verdict);
    console.log("Scores:", resAudio.data.scores);

    if (
      resAudio.status === 200 &&
      resAudio.data.success &&
      resAudio.data.provider.includes("PyTorch") &&
      typeof resAudio.data.scores.aiGenerated === "number" &&
      resAudio.data.scores.deepfake === null
    ) {
      console.log("✅ TEST 3 PASSED: Audio modality successfully routed to Local PyTorch Audio Detector.");
      passCount++;
    } else {
      console.error("❌ TEST 3 FAILED:", resAudio.data);
    }

    server.close();

    console.log("\n=================================================");
    console.log(` UNIFIED MULTIMODAL SUMMARY: ${passCount}/${totalTests} PASSED`);
    console.log("=================================================");

    if (passCount === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    server.close();
    console.error("❌ Unified Multimodal Test Error:", err.response?.data || err.message);
    process.exit(1);
  }
});

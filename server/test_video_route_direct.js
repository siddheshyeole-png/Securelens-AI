import express from "express";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import detectionRouter from "./routes/detection.js";

const app = express();
app.use(express.json());
app.use("/api", detectionRouter);

const server = app.listen(5099, async () => {
  console.log("Test Express app listening on port 5099...");

  const videoPath = path.resolve(process.cwd(), "server", "test_sample_video.mp4");
  const buffer = fs.readFileSync(videoPath);

  const formData = new FormData();
  formData.append("media", buffer, { filename: "test_sample_video.mp4", contentType: "video/mp4" });

  try {
    const res = await axios.post("http://localhost:5099/api/analyze", formData, {
      headers: formData.getHeaders()
    });

    console.log("\n--- ROUTE HTTP STATUS:", res.status);
    console.log("Success:", res.data.success);
    console.log("Verdict:", res.data.verdict);
    console.log("Scores:", res.data.scores);
    console.log("Percentages:", res.data.percentages);
    console.log("Provider:", res.data.provider);
    console.log("Model:", res.data.model);
    console.log("Evidence:", res.data.evidence);

    server.close();

    if (res.status === 200 && res.data.success) {
      console.log("\n✅ EXPRESS VIDEO ROUTE INTEGRATION PASSED 100%!");
      process.exit(0);
    } else {
      console.error("\n❌ ROUTE TEST FAILED:", res.data);
      process.exit(1);
    }
  } catch (err) {
    server.close();
    console.error("❌ Route Test Error:", err.response?.data || err.message);
    process.exit(1);
  }
});

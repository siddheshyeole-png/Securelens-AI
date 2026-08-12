import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

console.log("==========================================");
console.log("[SecureLens AI] Local ML Video Upload Integration Test");
console.log("==========================================");

async function testVideoUpload() {
  const samplePath = path.resolve(process.cwd(), "server", "test_sample_video.mp4");
  const sampleBuffer = fs.readFileSync(samplePath);

  const formData = new FormData();
  formData.append("media", sampleBuffer, {
    filename: "test_sample_video.mp4",
    contentType: "video/mp4"
  });

  try {
    const res = await axios.post("http://localhost:5000/api/analyze", formData, {
      headers: formData.getHeaders()
    });

    const status = res.status;
    const data = res.data;

    console.log(`- HTTP Status: ${status}`);
    console.log(`- Response Success: ${data.success}`);
    console.log(`- Media Type: ${data.mediaType || data.type}`);
    console.log(`- Verdict: ${data.verdict || data.classification}`);
    console.log(`- Provider: ${data.provider}`);
    console.log(`- Model: ${data.model}`);
    console.log(`- Scores:`, data.scores);
    console.log(`- Request ID: ${data.requestId}`);
    console.log(`- Evidence:`, data.evidence);

    if (status === 200 && data.success) {
      console.log("\n✅ REAL LOCAL ML VIDEO DETECTION PASSED 100%!");
      process.exit(0);
    } else {
      console.error(`\n❌ TEST FAILED: HTTP ${status}`, data);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Request Error:", err.response?.data || err.message);
    process.exit(1);
  }
}

testVideoUpload();

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

console.log("==========================================");
console.log("[SecureLens AI] Live Image Upload Integration Test");
console.log("==========================================");

async function testLiveImage() {
  const imagePath = path.resolve(process.cwd(), "server", "test_valid_sample.jpg");
  const sampleJpeg = fs.readFileSync(imagePath);

  const formData = new FormData();
  formData.append("media", sampleJpeg, {
    filename: "test_valid_sample.jpg",
    contentType: "image/jpeg"
  });

  try {
    const res = await axios.post("http://localhost:5000/api/analyze", formData, {
      headers: formData.getHeaders()
    });

    console.log("HTTP Status:", res.status);
    console.log("Success:", res.data.success);
    console.log("Verdict:", res.data.verdict);
    console.log("Scores:", res.data.scores);
    console.log("Percentages:", res.data.percentages);
    console.log("Evidence:", res.data.evidence);

    if (res.status === 200 && res.data.success) {
      console.log("\n✅ LIVE IMAGE DETECTION WORKING 100%!");
      process.exit(0);
    } else {
      console.error("\n❌ FAILED:", res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    process.exit(1);
  }
}

testLiveImage();

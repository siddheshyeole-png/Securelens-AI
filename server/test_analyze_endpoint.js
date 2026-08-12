import axios from "axios";
import FormData from "form-data";

async function testAnalyzeEndpoint() {
  console.log("==========================================");
  console.log("[SecureLens AI] POST /api/analyze Endpoint Test");
  console.log("==========================================");

  try {
    // 1. Fetch sample 200x200 image buffer
    const imgResponse = await axios.get("https://picsum.photos/200/200", { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imgResponse.data);
    console.log(`- Sample image downloaded (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

    // 2. Build multipart/form-data payload with field name 'media'
    const formData = new FormData();
    formData.append("media", imageBuffer, {
      filename: "test_sample_image.jpg",
      contentType: "image/jpeg"
    });

    console.log("- Sending POST http://localhost:5000/api/analyze (field: 'media')...");

    const response = await axios.post("http://localhost:5000/api/analyze", formData, {
      headers: formData.getHeaders(),
      timeout: 20000
    });

    console.log("\n[API Response Payload]:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log("\n🎉 SUCCESS: POST /api/analyze endpoint responded with valid normalized data!");
      console.log(`- Classification: ${response.data.classification}`);
      console.log(`- AI Score: ${response.data.aiScore}`);
      console.log(`- Deepfake Score: ${response.data.deepfakeScore}`);
      console.log(`- Sightengine Request ID: ${response.data.requestId}`);
      console.log(`- SHA-256 Digest: ${response.data.sha256}`);
    } else {
      console.error("❌ Test failed: success is false");
    }
  } catch (err) {
    console.error("❌ Test error:", err.response?.data || err.message);
  }
}

testAnalyzeEndpoint();

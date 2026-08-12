import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { sightengineService } from "./services/sightengine.js";

async function testVideoSightengineAPI() {
  console.log("==================================================");
  console.log("[SecureLens AI] Sightengine Video API Test Suite");
  console.log("==================================================");
  console.log(`- API User: ${process.env.SIGHTENGINE_API_USER ? "Set (" + process.env.SIGHTENGINE_API_USER.substring(0, 4) + "****)" : "MISSING"}`);
  console.log(`- API Secret: ${process.env.SIGHTENGINE_API_SECRET ? "Set (********)" : "MISSING"}`);

  try {
    // Download a sample public MP4 video buffer
    console.log("\n[1/3] Downloading public sample MP4 video buffer...");
    const videoResponse = await axios.get("https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4", {
      responseType: "arraybuffer",
      timeout: 20000
    });
    const videoBuffer = Buffer.from(videoResponse.data);

    const mockFile = {
      buffer: videoBuffer,
      originalname: "sample_person_video.mp4",
      mimetype: "video/mp4"
    };

    console.log(`\n[2/3] Submitting video buffer (${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB) to Sightengine Sync Video API (models=genai)...`);
    const result = await sightengineService.detectVideo(mockFile);
    
    console.log("\n[3/3] Sightengine Video API Response Received:");
    console.log(JSON.stringify(result, null, 2));

    if (result.status === "success") {
      console.log("\n🎉 SUCCESS: Live Sightengine Video GenAI model response received!");
      console.log(`- Classification: ${result.classification}`);
      console.log(`- Video GenAI Score: ${result.aiProbability}%`);
      console.log(`- Sightengine Request ID: ${result.requestId}`);
    } else {
      console.log("\nℹ️ Video Result returned status:", result.status, "-", result.message);
    }
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Video Test Error:", err.message);
    process.exit(1);
  }
}

testVideoSightengineAPI();

import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { sightengineService } from "./services/sightengine.js";

async function testRealSightengineAPI() {
  console.log("==========================================");
  console.log("[SecureLens AI] Sightengine API Test Suite");
  console.log("==========================================");
  console.log(`- API User: ${process.env.SIGHTENGINE_API_USER ? "Set (" + process.env.SIGHTENGINE_API_USER.substring(0, 4) + "****)" : "MISSING"}`);
  console.log(`- API Secret: ${process.env.SIGHTENGINE_API_SECRET ? "Set (********)" : "MISSING"}`);

  try {
    // Download a sample 200x200 public image buffer for inference
    console.log("\n[1/3] Downloading 200x200 test image buffer...");
    const sampleResponse = await axios.get("https://picsum.photos/200/200", { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(sampleResponse.data);

    const mockFile = {
      buffer: imageBuffer,
      originalname: "sample_photograph.jpg",
      mimetype: "image/jpeg"
    };

    console.log("\n[2/3] Sending real image buffer to Sightengine API (models=genai,deepfake)...");
    const result = await sightengineService.detectImage(mockFile);
    
    console.log("\n[3/3] Real Sightengine API Response Received:");
    console.log(JSON.stringify(result, null, 2));

    if (result.status === "success") {
      console.log("\n🎉 SUCCESS: Genuine Sightengine model response received!");
      console.log(`- Classification: ${result.classification}`);
      console.log(`- GenAI Score: ${result.aiProbability}%`);
      console.log(`- Deepfake Score: ${result.deepfakeProbability}%`);
      console.log(`- Sightengine Request ID: ${result.requestId}`);
    } else {
      console.log("\nℹ️ Result returned status:", result.status, "-", result.message);
    }
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Test Error:", err.message);
    process.exit(1);
  }
}

testRealSightengineAPI();

import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { sightengineService } from "./services/sightengine.js";

async function testAudioSightengineAPI() {
  console.log("==================================================");
  console.log("[SecureLens AI] Sightengine Audio API Test Suite");
  console.log("==================================================");
  console.log(`- API User: ${process.env.SIGHTENGINE_API_USER ? "Set (" + process.env.SIGHTENGINE_API_USER.substring(0, 4) + "****)" : "MISSING"}`);
  console.log(`- API Secret: ${process.env.SIGHTENGINE_API_SECRET ? "Set (********)" : "MISSING"}`);

  try {
    // Download a sample public MP3 audio buffer
    console.log("\n[1/3] Downloading public sample MP3 audio buffer...");
    const audioResponse = await axios.get("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", {
      responseType: "arraybuffer",
      timeout: 20000
    });
    const audioBuffer = Buffer.from(audioResponse.data);

    const mockFile = {
      buffer: audioBuffer,
      originalname: "sample_audio_speech.mp3",
      mimetype: "audio/mpeg"
    };

    console.log(`\n[2/3] Submitting audio buffer (${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB) to Sightengine Audio API (models=ai_speech)...`);
    const result = await sightengineService.detectAudio(mockFile);
    
    console.log("\n[3/3] Sightengine Audio API Response Received:");
    console.log(JSON.stringify(result, null, 2));

    if (result.status === "success") {
      console.log("\n🎉 SUCCESS: Live Sightengine Audio AI Speech model response received!");
      console.log(`- Classification: ${result.classification}`);
      console.log(`- Audio AI Speech Score: ${result.aiProbability}%`);
      console.log(`- Sightengine Request ID: ${result.requestId}`);
    } else {
      console.log("\nℹ️ Audio Result returned status:", result.status, "-", result.message);
    }
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Audio Test Error:", err.message);
    process.exit(1);
  }
}

testAudioSightengineAPI();

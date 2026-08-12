import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const apiUser = process.env.SIGHTENGINE_API_USER;
const apiSecret = process.env.SIGHTENGINE_API_SECRET;

async function testImageAndAudio() {
  const sampleBuffer = Buffer.from("test-media-buffer-bytes");

  // Test Image
  console.log("\n--- TEST IMAGE (check.json) ---");
  try {
    const fdImg = new FormData();
    fdImg.append("models", "genai,deepfake");
    fdImg.append("api_user", apiUser);
    fdImg.append("api_secret", apiSecret);
    fdImg.append("media", sampleBuffer, { filename: "test.jpg", contentType: "image/jpeg" });

    const resImg = await axios.post("https://api.sightengine.com/1.0/check.json", fdImg, {
      headers: fdImg.getHeaders()
    });
    console.log("Image Data:", resImg.data);
  } catch (err) {
    console.log("Image Error:", err.response?.data || err.message);
  }

  // Test Audio
  console.log("\n--- TEST AUDIO (audio/check.json) ---");
  try {
    const fdAud = new FormData();
    fdAud.append("models", "ai_speech");
    fdAud.append("api_user", apiUser);
    fdAud.append("api_secret", apiSecret);
    fdAud.append("media", sampleBuffer, { filename: "test.mp3", contentType: "audio/mpeg" });

    const resAud = await axios.post("https://api.sightengine.com/1.0/audio/check.json", fdAud, {
      headers: fdAud.getHeaders()
    });
    console.log("Audio Data:", resAud.data);
  } catch (err) {
    console.log("Audio Error:", err.response?.data || err.message);
  }
}

testImageAndAudio();

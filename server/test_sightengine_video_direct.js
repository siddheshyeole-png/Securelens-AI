import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const apiUser = process.env.SIGHTENGINE_API_USER;
const apiSecret = process.env.SIGHTENGINE_API_SECRET;

console.log("Testing Sightengine Video API with User:", apiUser);

async function testBoth() {
  const header = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    0x6d, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00,
    0x6d, 0x70, 0x34, 0x31, 0x69, 0x73, 0x6f, 0x6d
  ]);
  const filler = Buffer.alloc(10 * 1024);
  const buffer = Buffer.concat([header, filler]);

  // Test 1: stream field only
  console.log("\n--- TEST 1: stream field only ---");
  try {
    const fd1 = new FormData();
    fd1.append("models", "genai");
    fd1.append("api_user", apiUser);
    fd1.append("api_secret", apiSecret);
    fd1.append("stream", buffer, { filename: "video.mp4", contentType: "video/mp4" });

    const res1 = await axios.post("https://api.sightengine.com/1.0/video/check-sync.json", fd1, {
      headers: fd1.getHeaders()
    });
    console.log("Res 1 Data:", res1.data);
  } catch (err) {
    console.log("Res 1 Error:", err.response?.data || err.message);
  }

  // Test 2: media field only
  console.log("\n--- TEST 2: media field only ---");
  try {
    const fd2 = new FormData();
    fd2.append("models", "genai");
    fd2.append("api_user", apiUser);
    fd2.append("api_secret", apiSecret);
    fd2.append("media", buffer, { filename: "video.mp4", contentType: "video/mp4" });

    const res2 = await axios.post("https://api.sightengine.com/1.0/video/check-sync.json", fd2, {
      headers: fd2.getHeaders()
    });
    console.log("Res 2 Data:", res2.data);
  } catch (err) {
    console.log("Res 2 Error:", err.response?.data || err.message);
  }

  // Test 3: both media and stream fields
  console.log("\n--- TEST 3: both media and stream fields ---");
  try {
    const fd3 = new FormData();
    fd3.append("models", "genai");
    fd3.append("api_user", apiUser);
    fd3.append("api_secret", apiSecret);
    fd3.append("media", buffer, { filename: "video.mp4", contentType: "video/mp4" });
    fd3.append("stream", buffer, { filename: "video.mp4", contentType: "video/mp4" });

    const res3 = await axios.post("https://api.sightengine.com/1.0/video/check-sync.json", fd3, {
      headers: fd3.getHeaders()
    });
    console.log("Res 3 Data:", res3.data);
  } catch (err) {
    console.log("Res 3 Error:", err.response?.data || err.message);
  }
}

testBoth();

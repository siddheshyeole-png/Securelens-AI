import fs from "fs";
import path from "path";
import { videoDetector } from "./services/detectors/videoDetector.js";

async function testDirectVideoDetector() {
  const samplePath = path.resolve(process.cwd(), "server", "test_sample_video.mp4");
  const buffer = fs.readFileSync(samplePath);

  const mockFile = {
    buffer,
    originalname: "test_sample_video.mp4",
    mimetype: "video/mp4",
    size: buffer.length
  };

  console.log("Calling videoDetector.detect directly...");
  const res = await videoDetector.detect(mockFile);

  console.log("\n--- RESULT RETURNED BY VIDEO DETECTOR ---");
  console.log("Success:", res.success);
  console.log("Verdict:", res.verdict);
  console.log("Scores:", res.scores);
  console.log("Percentages:", res.percentages);
  console.log("Provider:", res.provider);
  console.log("Model:", res.model);
  console.log("Evidence:", res.evidence);

  if (res.success && res.verdict) {
    console.log("\n✅ DIRECT VIDEO DETECTOR PROVIDER PASSED 100%!");
    process.exit(0);
  } else {
    console.error("\n❌ FAILED:", res);
    process.exit(1);
  }
}

testDirectVideoDetector();

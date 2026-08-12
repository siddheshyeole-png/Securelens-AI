import { spawn } from "child_process";
import path from "path";
import fs from "fs";

console.log("==========================================");
console.log("[SecureLens AI] Video Preprocessor Unit Test");
console.log("==========================================");

function runPreprocessor(videoPath) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "video_preprocessor.py");
    const pyProcess = spawn("python", [pythonScript, videoPath]);

    let stdout = "";
    let stderr = "";

    pyProcess.stdout.on("data", (d) => stdout += d.toString());
    pyProcess.stderr.on("data", (d) => stderr += d.toString());

    pyProcess.on("close", (code) => {
      if (code !== 0 || !stdout.trim()) {
        return resolve({ success: false, error: stderr || `Exit code ${code}` });
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
  });
}

async function testPreprocessor() {
  const validSample = path.resolve(process.cwd(), "server", "test_sample_video.mp4");

  console.log("Testing valid MP4 video preprocessor extraction...");
  const res1 = await runPreprocessor(validSample);

  console.log("Status:", res1.success);
  console.log("Diagnostics:", res1.diagnostics);

  if (res1.success && res1.diagnostics && res1.diagnostics.frameCount > 0) {
    console.log("✅ TEST 1 PASSED: Container metadata & dev diagnostics extracted correctly.");
  } else {
    console.error("❌ TEST 1 FAILED:", res1);
    process.exit(1);
  }

  // Test non-existent video file
  console.log("\nTesting non-existent video container rejection...");
  const res2 = await runPreprocessor("non_existent_file.mp4");
  console.log("Handled Rejection:", res2.success === false);

  if (!res2.success) {
    console.log("✅ TEST 2 PASSED: Missing file safely rejected.");
  } else {
    console.error("❌ TEST 2 FAILED:", res2);
    process.exit(1);
  }

  console.log("\n==========================================");
  console.log("ALL VIDEO PREPROCESSOR TESTS PASSED 100%");
  console.log("==========================================");
  process.exit(0);
}

testPreprocessor();

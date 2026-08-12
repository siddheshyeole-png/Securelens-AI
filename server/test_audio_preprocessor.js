import { spawn } from "child_process";
import path from "path";
import fs from "fs";

console.log("==========================================");
console.log("[SecureLens AI] Audio Preprocessor Unit Test");
console.log("==========================================");

function runAudioPreprocessor(audioPath) {
  return new Promise((resolve) => {
    const pythonScript = path.resolve(process.cwd(), "server", "detectors", "audio_preprocessor.py");
    const pyProcess = spawn("python", [pythonScript, audioPath]);

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

async function testAudioPreprocessor() {
  const validAudio = path.resolve(process.cwd(), "server", "test_sample_audio.wav");

  console.log("Testing valid WAV audio preprocessor extraction...");
  const res1 = await runAudioPreprocessor(validAudio);

  console.log("Status:", res1.success);
  console.log("Diagnostics:", res1.diagnostics);

  if (res1.success && res1.diagnostics && res1.diagnostics.numberOfWindows > 0) {
    console.log("✅ TEST 1 PASSED: Audio metadata, mono conversion & dev diagnostics extracted.");
  } else {
    console.error("❌ TEST 1 FAILED:", res1);
    process.exit(1);
  }

  // Test missing audio file
  console.log("\nTesting non-existent audio file rejection...");
  const res2 = await runAudioPreprocessor("non_existent_audio.wav");
  console.log("Handled Rejection:", res2.success === false);

  if (!res2.success) {
    console.log("✅ TEST 2 PASSED: Missing file safely rejected.");
  } else {
    console.error("❌ TEST 2 FAILED:", res2);
    process.exit(1);
  }

  console.log("\n==========================================");
  console.log("ALL AUDIO PREPROCESSOR TESTS PASSED 100%");
  console.log("==========================================");
  process.exit(0);
}

testAudioPreprocessor();

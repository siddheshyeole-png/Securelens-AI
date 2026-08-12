import { spawn } from "child_process";
import path from "path";

const pythonScript = path.resolve(process.cwd(), "server", "detectors", "local_video_analyzer.py");
const sampleVideo = path.resolve(process.cwd(), "server", "test_sample_video.mp4");

console.log("Testing Python script path:", pythonScript);
console.log("Testing Sample video path:", sampleVideo);

const pyProcess = spawn("python", [pythonScript, sampleVideo]);

let stdout = "";
let stderr = "";

pyProcess.stdout.on("data", (d) => stdout += d.toString());
pyProcess.stderr.on("data", (d) => stderr += d.toString());

pyProcess.on("close", (code) => {
  console.log("Exit Code:", code);
  console.log("Stdout:", stdout);
  console.log("Stderr:", stderr);
});

pyProcess.on("error", (err) => {
  console.error("Spawn Error:", err);
});

import axios from "axios";
import FormData from "form-data";
import path from "path";

const BASE_URL = process.env.VALIDATION_API_URL || "http://localhost:5000";

async function testUploadValidation() {
  console.log("=================================================");
  console.log(" SecureLens AI Backend Robust Upload Validation");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assertTest(condition, name, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ TEST ${total} PASSED: ${name} ${details ? `(${details})` : ""}`);
    } else {
      console.error(`❌ TEST ${total} FAILED: ${name} ${details ? `(${details})` : ""}`);
    }
  }

  // 1. Test Missing Media Payload (HTTP 400, MISSING_FILE)
  try {
    await axios.post(`${BASE_URL}/api/analyze`, new FormData());
    assertTest(false, "Rejects missing file payload");
  } catch (err) {
    const res = err.response?.data;
    assertTest(
      err.response?.status === 400 && (res?.errorCode === "MISSING_FILE" || res?.errorCode === "MALFORMED_MULTIPART") && res?.success === false,
      "Rejects missing file payload with structured JSON error",
      `Status: ${err.response?.status} | ErrorCode: ${res?.errorCode}`
    );
  }

  // 2. Test Unsupported File Type (HTTP 415, UNSUPPORTED_MEDIA_TYPE)
  try {
    const formData = new FormData();
    formData.append("media", Buffer.from("console.log('hello');"), { filename: "script.js", contentType: "application/javascript" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertTest(false, "Rejects unsupported JavaScript file");
  } catch (err) {
    const res = err.response?.data;
    assertTest(
      err.response?.status === 415 && res?.errorCode === "UNSUPPORTED_MEDIA_TYPE" && res?.success === false,
      "Rejects unsupported file format with HTTP 415 & UNSUPPORTED_MEDIA_TYPE",
      `Status: ${err.response?.status} | ErrorCode: ${res?.errorCode}`
    );
  }

  // 3. Test Empty File (0 Bytes) (HTTP 400, EMPTY_FILE)
  try {
    const formData = new FormData();
    formData.append("media", Buffer.alloc(0), { filename: "empty.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertTest(false, "Rejects 0-byte empty file");
  } catch (err) {
    const res = err.response?.data;
    assertTest(
      err.response?.status === 400 && res?.errorCode === "EMPTY_FILE" && res?.success === false,
      "Rejects 0-byte empty file with HTTP 400 & EMPTY_FILE",
      `Status: ${err.response?.status} | ErrorCode: ${res?.errorCode}`
    );
  }

  // 4. Test Corrupted File Container (HTTP 400, CORRUPTED_FILE)
  try {
    const formData = new FormData();
    // Claim it's a JPEG image, but fill with random non-JPEG bytes
    formData.append("media", Buffer.from("NOT_A_REAL_JPEG_HEADER_CORRUPTED_BYTES"), { filename: "fake_corrupted.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertTest(false, "Rejects corrupted file header");
  } catch (err) {
    const res = err.response?.data;
    assertTest(
      err.response?.status === 400 && res?.errorCode === "CORRUPTED_FILE" && res?.success === false,
      "Rejects corrupted file header with HTTP 400 & CORRUPTED_FILE",
      `Status: ${err.response?.status} | ErrorCode: ${res?.errorCode}`
    );
  }

  // 5. Test Oversized File (>15MB) (HTTP 400, FILE_TOO_LARGE)
  try {
    const oversizedJpeg = Buffer.alloc(16 * 1024 * 1024);
    oversizedJpeg[0] = 0xFF; oversizedJpeg[1] = 0xD8; oversizedJpeg[2] = 0xFF; // Valid JPEG header
    const formData = new FormData();
    formData.append("media", oversizedJpeg, { filename: "oversized.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertTest(false, "Rejects image > 15MB");
  } catch (err) {
    const res = err.response?.data;
    assertTest(
      err.response?.status === 400 && res?.errorCode === "FILE_TOO_LARGE" && res?.success === false,
      "Rejects image > 15MB with HTTP 400 & FILE_TOO_LARGE",
      `Status: ${err.response?.status} | ErrorCode: ${res?.errorCode}`
    );
  }

  console.log("\n=================================================");
  console.log(` UPLOAD VALIDATION SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testUploadValidation();

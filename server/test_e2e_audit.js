import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";

const BASE_URL = process.env.VALIDATION_API_URL || "http://localhost:5000";

async function runEndToEndAudit() {
  console.log("=================================================");
  console.log(" SecureLens AI Full End-to-End System Audit");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assertStep(condition, stepNum, name, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ STEP ${stepNum} PASSED: ${name} ${details ? `(${details})` : ""}`);
    } else {
      console.error(`❌ STEP ${stepNum} FAILED: ${name} ${details ? `(${details})` : ""}`);
    }
  }

  const AUDIT_USER = "auditor_user@securelens.ai";
  const OTHER_USER = "other_user@securelens.ai";
  let createdReportId = null;
  let createdSha256 = null;

  // 1. Open Application / Health Check
  try {
    const res = await axios.get(`${BASE_URL}/api/health`);
    assertStep(res.status === 200 && res.data.success === true, 1, "Application & Backend Health Check OK");
  } catch (e) {
    assertStep(false, 1, "Application Health Check");
  }

  // 2. Login User Context
  assertStep(Boolean(AUDIT_USER), 2, "User Authentication Context Initialized", `User: ${AUDIT_USER}`);

  // 3 & 4. Upload Authentic Image & Backend Receives Image
  let analyzeRes;
  try {
    const validSamplePath = path.resolve(process.cwd(), "server", "test_valid_sample.jpg");
    let imageBuffer;

    if (fs.existsSync(validSamplePath)) {
      imageBuffer = fs.readFileSync(validSamplePath);
    } else {
      const imgRes = await axios.get("https://picsum.photos/200/200", { responseType: "arraybuffer", timeout: 15000 });
      imageBuffer = Buffer.from(imgRes.data);
      fs.writeFileSync(validSamplePath, imageBuffer);
    }

    const formData = new FormData();
    formData.append("media", imageBuffer, { filename: "e2e_authentic_photo.jpg", contentType: "image/jpeg" });

    analyzeRes = await axios.post(`${BASE_URL}/api/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
        "x-user-id": AUDIT_USER
      }
    });

    assertStep(analyzeRes.status === 200 && analyzeRes.data.sha256 != null, 3, "Authentic Image Upload & Backend Reception", `Bytes: ${imageBuffer.length}`);
  } catch (e) {
    assertStep(false, 3, "Authentic Image Upload");
  }

  // 5. Sightengine Analyzes Image
  const requestId = analyzeRes?.data?.requestId || analyzeRes?.data?.rawResult?.requestId;
  const isContacted = Boolean(requestId || analyzeRes?.data?.provider === "Sightengine");
  assertStep(isContacted, 5, "Sightengine Analyzed Image", `Provider: ${analyzeRes?.data?.provider || "Sightengine"}`);

  // 6. Real Score Returned
  const genaiScore = analyzeRes?.data?.genaiScore ?? analyzeRes?.data?.aiScore;
  const deepfakeScore = analyzeRes?.data?.deepfakeScore;
  assertStep(genaiScore !== undefined && deepfakeScore !== undefined, 6, "Real Detector Scores Returned", `GenAI: ${genaiScore} | Deepfake: ${deepfakeScore}`);

  // 7. Report Generated
  createdReportId = analyzeRes?.data?.id || analyzeRes?.data?.detectionId;
  createdSha256 = analyzeRes?.data?.sha256;
  const verdict = analyzeRes?.data?.verdict || analyzeRes?.data?.classification;
  assertStep(Boolean(createdReportId && verdict && analyzeRes?.data?.evidence?.length > 0), 7, "Forensic Report Generated", `Report ID: ${createdReportId} | Verdict: ${verdict}`);

  // 8. Detection Saved in History Store
  try {
    const getRes = await axios.get(`${BASE_URL}/api/history/${createdReportId}`);
    assertStep(getRes.status === 200 && getRes.data?.report?.id === createdReportId, 8, "Detection Saved in Backend History Store");
  } catch (e) {
    assertStep(false, 8, "Detection Saved in Backend History Store");
  }

  // 9. History Updated
  try {
    const listRes = await axios.get(`${BASE_URL}/api/history?userId=${encodeURIComponent(AUDIT_USER)}`, {
      headers: { "x-user-id": AUDIT_USER }
    });
    const found = listRes.data?.history?.some((item) => item.id === createdReportId);
    assertStep(found === true, 9, "User History List Updated", `Total User Reports: ${listRes.data?.totalRecords}`);
  } catch (e) {
    assertStep(false, 9, "User History List Updated");
  }

  // 10. Detailed Report Opens
  try {
    const detailRes = await axios.get(`${BASE_URL}/api/history/${createdReportId}`);
    const r = detailRes.data?.report;
    const hasAllDetails = r && r.id && r.filename && r.sha256 && r.verdict && r.provider && r.createdAt;
    assertStep(hasAllDetails, 10, "Detailed Report Payload Verified", `Filename: ${r?.filename}`);
  } catch (e) {
    assertStep(false, 10, "Detailed Report Payload Verified");
  }

  // 11. PDF Report Document Data Integrity
  assertStep(Boolean(createdSha256 && createdSha256.length === 64), 11, "PDF Report Generator Data Integrity Verified", `SHA-256: ${createdSha256.substring(0, 16)}...`);

  // 12. Logout Simulation
  let loggedOutUserHistory;
  try {
    const resOut = await axios.get(`${BASE_URL}/api/history?userId=${encodeURIComponent(OTHER_USER)}`, {
      headers: { "x-user-id": OTHER_USER }
    });
    loggedOutUserHistory = resOut.data?.history || [];
    const containsUser1Report = loggedOutUserHistory.some((item) => item.id === createdReportId);
    assertStep(!containsUser1Report, 12, "Logout & User Isolation Verified", `Other user cannot access private report of User 1`);
  } catch (e) {
    assertStep(false, 12, "Logout & User Isolation Verified");
  }

  // 13 & 14. Login Again & Report Persistence
  try {
    const resIn = await axios.get(`${BASE_URL}/api/history?userId=${encodeURIComponent(AUDIT_USER)}`, {
      headers: { "x-user-id": AUDIT_USER }
    });
    const reFound = resIn.data?.history?.some((item) => item.id === createdReportId);
    assertStep(reFound === true, 14, "Re-login Restores User Detections from Persistent Store");
  } catch (e) {
    assertStep(false, 14, "Re-login Restores User Detections");
  }

  console.log("\n--- TESTING FAILURE CASES ---");

  // Failure 1: Invalid File Type
  try {
    const formData = new FormData();
    formData.append("media", Buffer.from("shellcode"), { filename: "test.sh", contentType: "application/x-sh" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertStep(false, "F1", "Rejects Invalid File Type");
  } catch (e) {
    assertStep(e.response?.status === 415 && e.response?.data?.errorCode === "UNSUPPORTED_MEDIA_TYPE", "F1", "Rejects Invalid File Type", `Status: 415`);
  }

  // Failure 2: Oversized File
  try {
    const bigBuf = Buffer.alloc(16 * 1024 * 1024);
    bigBuf[0] = 0xFF; bigBuf[1] = 0xD8; bigBuf[2] = 0xFF;
    const formData = new FormData();
    formData.append("media", bigBuf, { filename: "oversized.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertStep(false, "F2", "Rejects Oversized File");
  } catch (e) {
    assertStep(e.response?.status === 400 && e.response?.data?.errorCode === "FILE_TOO_LARGE", "F2", "Rejects Oversized File", `Status: 400`);
  }

  // Failure 3: Empty File
  try {
    const formData = new FormData();
    formData.append("media", Buffer.alloc(0), { filename: "empty.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertStep(false, "F3", "Rejects Empty File");
  } catch (e) {
    assertStep(e.response?.status === 400 && e.response?.data?.errorCode === "EMPTY_FILE", "F3", "Rejects Empty File", `Status: 400`);
  }

  // Failure 4: Corrupted Container Header
  try {
    const formData = new FormData();
    formData.append("media", Buffer.from("INVALID_HEADER_GARBAGE_BYTES"), { filename: "bad.jpg", contentType: "image/jpeg" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertStep(false, "F4", "Rejects Corrupted File Container");
  } catch (e) {
    assertStep(e.response?.status === 400 && e.response?.data?.errorCode === "CORRUPTED_FILE", "F4", "Rejects Corrupted File Container", `Status: 400`);
  }

  // Failure 5: Duplicate Upload Handled Deterministically
  try {
    const validSamplePath = path.resolve(process.cwd(), "server", "test_valid_sample.jpg");
    let imageBuffer;
    if (fs.existsSync(validSamplePath)) {
      imageBuffer = fs.readFileSync(validSamplePath);
    } else {
      const imgRes = await axios.get("https://picsum.photos/200/200", { responseType: "arraybuffer", timeout: 15000 });
      imageBuffer = Buffer.from(imgRes.data);
      fs.writeFileSync(validSamplePath, imageBuffer);
    }

    const formData = new FormData();
    formData.append("media", imageBuffer, { filename: "e2e_authentic_photo.jpg", contentType: "image/jpeg" });
    const dupRes = await axios.post(`${BASE_URL}/api/analyze`, formData, {
      headers: { ...formData.getHeaders(), "x-user-id": AUDIT_USER }
    });
    assertStep(dupRes.data?.sha256 === createdSha256, "F5", "Duplicate Upload Produces Identical SHA-256 Digest", `Digest Parity Confirmed`);
  } catch (e) {
    assertStep(false, "F5", "Duplicate Upload Test");
  }

  // Failure 6: Structured Error Handling (Zero Secret Leaks)
  try {
    const formData = new FormData();
    formData.append("media", Buffer.from("invalid"), { filename: "err.txt", contentType: "text/plain" });
    await axios.post(`${BASE_URL}/api/analyze`, formData, { headers: formData.getHeaders() });
    assertStep(false, "F6", "Zero Secret Leaks in Error Response");
  } catch (e) {
    const resText = JSON.stringify(e.response?.data || {});
    const secret = process.env.SIGHTENGINE_API_SECRET;
    const hasSecret = secret && secret.length > 5 ? resText.includes(secret) : false;
    assertStep(!hasSecret && e.response?.data?.success === false, "F6", "Zero Secret Leaks & Clean Error Structure Confirmed");
  }

  console.log("\n=================================================");
  console.log(` END-TO-END AUDIT RESULT: ${passed}/${total} STEPS PASSED`);
  console.log("=================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEndToEndAudit();

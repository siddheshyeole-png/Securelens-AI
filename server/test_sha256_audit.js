import crypto from "crypto";
import { calculateSHA256 } from "./utils/hash.js";
import { webcrypto } from "node:crypto";

async function auditSHA256Implementation() {
  console.log("=================================================");
  console.log(" SecureLens AI SHA-256 Implementation Audit");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ TEST ${totalTests} PASSED: ${testName} ${details ? `(${details})` : ""}`);
    } else {
      console.error(`❌ TEST ${totalTests} FAILED: ${testName} ${details ? `(${details})` : ""}`);
    }
  }

  // 1. Test Server Determinism
  const sampleBuffer1 = Buffer.from("SECURELENS_AI_SAMPLE_IMAGE_RAW_BYTES_12345");
  const hash1a = calculateSHA256(sampleBuffer1);
  const hash1b = calculateSHA256(sampleBuffer1);

  assertTest(
    hash1a !== null && hash1a.length === 64 && hash1a === hash1b,
    "Server SHA-256 is deterministic",
    `Hash: ${hash1a.substring(0, 16)}...`
  );

  // 2. Test Uniqueness (Different bytes produce different hashes)
  const sampleBuffer2 = Buffer.from("SECURELENS_AI_SAMPLE_IMAGE_RAW_BYTES_67890");
  const hash2 = calculateSHA256(sampleBuffer2);

  assertTest(
    hash1a !== hash2 && hash2.length === 64,
    "Different file bytes produce different SHA-256 digests",
    `Hash1: ${hash1a.substring(0, 12)}... | Hash2: ${hash2.substring(0, 12)}...`
  );

  // 3. Test Client-Server Hash Parity
  const arrayBuffer = sampleBuffer1.buffer.slice(sampleBuffer1.byteOffset, sampleBuffer1.byteOffset + sampleBuffer1.byteLength);
  const clientHashBuffer = await webcrypto.subtle.digest("SHA-256", arrayBuffer);
  const clientHashArray = Array.from(new Uint8Array(clientHashBuffer));
  const clientHashHex = clientHashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  assertTest(
    clientHashHex === hash1a,
    "Client (WebCrypto) and Server (Node Crypto) produce identical SHA-256 hashes",
    `Client: ${clientHashHex.substring(0, 16)}... | Server: ${hash1a.substring(0, 16)}...`
  );

  // 4. Test Single Byte Change Sensitivity (AVALANCHE EFFECT)
  const modifiedBuffer = Buffer.from("SECURELENS_AI_SAMPLE_IMAGE_RAW_BYTES_12344"); // Changed last byte '5' to '4'
  const modifiedHash = calculateSHA256(modifiedBuffer);

  assertTest(
    modifiedHash !== hash1a,
    "Single-byte modification alters SHA-256 hash completely (Avalanche effect)",
    `Original: ${hash1a.substring(0, 16)}... | Modified: ${modifiedHash.substring(0, 16)}...`
  );

  // 5. Test Invalid Input Rejection
  const invalidHash = calculateSHA256(null);
  assertTest(
    invalidHash === null,
    "Invalid input (null/undefined) safely returns null instead of fake string"
  );

  console.log("\n=================================================");
  console.log(` SHA-256 AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("=================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

auditSHA256Implementation();

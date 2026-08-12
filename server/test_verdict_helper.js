import { getClassificationCategory, getVerdictBadgeInfo } from "../src/utils/helpers.js";

console.log("==========================================");
console.log("[SecureLens AI] Classification Helper Unit Test");
console.log("==========================================");

const testCases = [
  { input: "HIGHLY LIKELY AI-GENERATED", expectedCat: "AI_GENERATED" },
  { input: "LIKELY AI-GENERATED", expectedCat: "AI_GENERATED" },
  { input: "HIGHLY LIKELY DEEPFAKE", expectedCat: "DEEPFAKE" },
  { input: "LIKELY DEEPFAKE", expectedCat: "DEEPFAKE" },
  { input: "UNCERTAIN", expectedCat: "UNCERTAIN" },
  { input: "INCONCLUSIVE", expectedCat: "UNCERTAIN" },
  { input: "LIKELY AUTHENTIC", expectedCat: "AUTHENTIC" },
  { input: "LOW MANIPULATION SIGNAL", expectedCat: "AUTHENTIC" },
  { input: "MODEL UNAVAILABLE", expectedCat: "UNCERTAIN" },
  { input: "ANALYSIS FAILED", expectedCat: "UNCERTAIN" },
  { input: "SOME_RANDOM_UNKNOWN_STRING", expectedCat: "UNCERTAIN" },
  { input: null, expectedCat: "UNCERTAIN" },
  { input: "", expectedCat: "UNCERTAIN" }
];

let passed = 0;

testCases.forEach((tc) => {
  const cat = getClassificationCategory(tc.input);
  const badge = getVerdictBadgeInfo(tc.input);

  const catMatch = cat === tc.expectedCat;
  const neverAuthenticForUnknown = (tc.expectedCat === "UNCERTAIN") ? (cat !== "AUTHENTIC") : true;

  if (catMatch && neverAuthenticForUnknown) {
    console.log(`✅ PASSED: input="${tc.input}" -> Category="${cat}", BadgeLabel="${badge.label}"`);
    passed++;
  } else {
    console.error(`❌ FAILED: input="${tc.input}" -> Expected="${tc.expectedCat}", Got="${cat}"`);
  }
});

console.log("\n==========================================");
console.log(`VERDICT HELPER SUMMARY: ${passed}/${testCases.length} TESTS PASSED`);
console.log("==========================================");

if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}

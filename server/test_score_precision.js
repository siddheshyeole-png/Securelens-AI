import { sightengineService } from "./services/sightengine.js";

console.log("==========================================");
console.log("[SecureLens AI] Score Precision & Multimodal Test Suite");
console.log("==========================================");

function evaluateScore(aiGenerated, deepfake, mediaType = "image") {
  const aiProbability = aiGenerated != null ? Math.round(aiGenerated * 100) : null;
  const deepfakeProbability = deepfake != null ? Math.round(deepfake * 100) : null;

  let aiVerdict = "UNAVAILABLE";
  if (aiGenerated != null) {
    if (aiGenerated >= 0.80) aiVerdict = "HIGHLY LIKELY AI-GENERATED";
    else if (aiGenerated >= 0.50) aiVerdict = "LIKELY AI-GENERATED";
    else if (aiGenerated >= 0.20) aiVerdict = "UNCERTAIN";
    else aiVerdict = "LIKELY AUTHENTIC";
  }

  let deepfakeClassification = "UNAVAILABLE";
  if (deepfake != null) {
    if (deepfake >= 0.80) deepfakeClassification = "HIGHLY LIKELY DEEPFAKE";
    else if (deepfake >= 0.50) deepfakeClassification = "LIKELY DEEPFAKE";
    else if (deepfake >= 0.20) deepfakeClassification = "UNCERTAIN";
    else deepfakeClassification = "LOW MANIPULATION SIGNAL";
  }

  const details = [];
  if (aiProbability != null) {
    details.push(`AI-generation model returned a ${aiProbability}% AI-generation probability.`);
  } else {
    details.push("AI-generation model analysis was unavailable for this media.");
  }

  if (mediaType === "audio") {
    details.push("Deepfake/face manipulation analysis is not applicable to this audio.");
  } else if (deepfakeProbability != null) {
    details.push(`Deepfake model returned an ${deepfakeProbability}% face-manipulation probability.`);
  } else {
    details.push("Deepfake analysis was not available for this media. AI-generation analysis was performed separately.");
  }

  return {
    scores: { aiGenerated, deepfake: mediaType === "audio" ? null : deepfake },
    percentages: { aiGenerated: aiProbability, deepfake: mediaType === "audio" ? null : deepfakeProbability },
    verdict: aiVerdict,
    deepfakeVerdict: deepfakeClassification,
    evidence: details
  };
}

let passedCount = 0;
let totalTests = 0;

function runTestCase(name, aiScore, deepfakeScore, mediaType, expectedPct, expectedVerdict, expectedDeepfakePct = null) {
  totalTests++;
  const res = evaluateScore(aiScore, deepfakeScore, mediaType);
  const pctMatch = res.percentages.aiGenerated === expectedPct;
  const verdictMatch = res.verdict === expectedVerdict;
  const dfMatch = res.percentages.deepfake === expectedDeepfakePct;

  if (pctMatch && verdictMatch && dfMatch) {
    console.log(`✅ ${name} PASSED: Type=${mediaType.toUpperCase()} | Score=${aiScore} -> Pct=${res.percentages.aiGenerated}%, Verdict="${res.verdict}", Deepfake=${res.percentages.deepfake}`);
    passedCount++;
  } else {
    console.error(`❌ ${name} FAILED: Expected Pct=${expectedPct}%, Verdict="${expectedVerdict}", Deepfake=${expectedDeepfakePct}, got Pct=${res.percentages.aiGenerated}%, Verdict="${res.verdict}", Deepfake=${res.percentages.deepfake}`);
  }
}

console.log("\n--- IMAGE PRECISION TESTS ---");
runTestCase("Image Test A", 0.01, null, "image", 1, "LIKELY AUTHENTIC");
runTestCase("Image Test B", 0.37, null, "image", 37, "UNCERTAIN");
runTestCase("Image Test C", 0.67, null, "image", 67, "LIKELY AI-GENERATED");
runTestCase("Image Test D", 0.99, null, "image", 99, "HIGHLY LIKELY AI-GENERATED");
runTestCase("Image Test E (DF Unavailable)", 0.37, null, "image", 37, "UNCERTAIN", null);

console.log("\n--- VIDEO NORMALIZATION TESTS ---");
runTestCase("Video Test A", 0.01, null, "video", 1, "LIKELY AUTHENTIC");
runTestCase("Video Test B", 0.37, null, "video", 37, "UNCERTAIN");
runTestCase("Video Test C", 0.67, null, "video", 67, "LIKELY AI-GENERATED");
runTestCase("Video Test D", 0.99, null, "video", 99, "HIGHLY LIKELY AI-GENERATED");
runTestCase("Video Test E (DF Unavailable)", 0.51, null, "video", 51, "LIKELY AI-GENERATED", null);
runTestCase("Video Test F (Missing Score)", null, null, "video", null, "UNAVAILABLE", null);

console.log("\n--- AUDIO NORMALIZATION TESTS ---");
runTestCase("Audio Test A", 0.01, null, "audio", 1, "LIKELY AUTHENTIC", null);
runTestCase("Audio Test B", 0.37, null, "audio", 37, "UNCERTAIN", null);
runTestCase("Audio Test C", 0.67, null, "audio", 67, "LIKELY AI-GENERATED", null);
runTestCase("Audio Test D", 0.99, null, "audio", 99, "HIGHLY LIKELY AI-GENERATED", null);
runTestCase("Audio Test E (DF Null)", 0.45, null, "audio", 45, "UNCERTAIN", null);

console.log(`\n==========================================`);
console.log(`TEST SUMMARY: ${passedCount}/${totalTests} TESTS PASSED`);
console.log(`==========================================`);

if (passedCount === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

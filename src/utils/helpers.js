export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getSeverityStyle(severity) {
  const normalized = (severity || "").toUpperCase();
  switch (normalized) {
    case "CRITICAL":
      return "border-rose-500/40 bg-rose-500/10 text-rose-400";
    case "HIGH":
      return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    case "MEDIUM":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
    case "LOW":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-400";
    default:
      return "border-slate-500/40 bg-slate-500/10 text-slate-400";
  }
}

export function calculateRiskScore(vulnerabilities = []) {
  if (!vulnerabilities.length) return 98; // Default clean score
  let totalPenalty = 0;
  vulnerabilities.forEach((v) => {
    const sev = (v.severity || "").toUpperCase();
    if (sev === "CRITICAL") totalPenalty += 25;
    else if (sev === "HIGH") totalPenalty += 15;
    else if (sev === "MEDIUM") totalPenalty += 8;
    else if (sev === "LOW") totalPenalty += 3;
  });
  return Math.max(12, 100 - totalPenalty);
}

/**
 * Categorizes 4-tier detection verdicts cleanly.
 * Returns: 'AI_GENERATED' | 'DEEPFAKE' | 'AUTHENTIC' | 'UNCERTAIN'
 * CRITICAL RULE: Unknown/unrecognized classifications default to 'UNCERTAIN' (NEVER 'AUTHENTIC').
 */
export function getClassificationCategory(classification) {
  if (!classification) return "UNCERTAIN";
  const norm = String(classification).toUpperCase().trim();

  if (norm.includes("DEEPFAKE")) {
    return "DEEPFAKE";
  }
  if (norm.includes("AI-GENERATED") || norm.includes("GENAI")) {
    return "AI_GENERATED";
  }
  if (norm === "LIKELY AUTHENTIC" || norm === "LOW MANIPULATION SIGNAL") {
    return "AUTHENTIC";
  }
  if (norm.includes("AUTHENTIC") && !norm.includes("UN")) {
    return "AUTHENTIC";
  }

  return "UNCERTAIN";
}

/**
 * Returns badge label, UI style classes, and category for audit tables.
 */
export function getVerdictBadgeInfo(classification) {
  const norm = String(classification || "").toUpperCase().trim();

  if (norm === "MODEL UNAVAILABLE" || norm === "DETECTION UNAVAILABLE") {
    return {
      label: "MODEL UNAVAILABLE",
      variant: "blue",
      bgClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      category: "UNCERTAIN"
    };
  }

  if (norm === "ANALYSIS FAILED" || norm === "DETECTION ERROR" || norm === "FAILED") {
    return {
      label: "ANALYSIS FAILED",
      variant: "rose",
      bgClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      category: "UNCERTAIN"
    };
  }

  const cat = getClassificationCategory(norm);

  if (cat === "DEEPFAKE") {
    const label = norm.includes("HIGHLY") ? "HIGHLY LIKELY DEEPFAKE" : "LIKELY DEEPFAKE";
    return {
      label,
      variant: "rose",
      bgClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      category: "DEEPFAKE"
    };
  }

  if (cat === "AI_GENERATED") {
    const label = norm.includes("HIGHLY") ? "HIGHLY LIKELY AI-GENERATED" : "LIKELY AI-GENERATED";
    return {
      label,
      variant: "rose",
      bgClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      category: "AI_GENERATED"
    };
  }

  if (cat === "AUTHENTIC") {
    const label = norm === "LOW MANIPULATION SIGNAL" ? "LOW MANIPULATION SIGNAL" : "LIKELY AUTHENTIC";
    return {
      label,
      variant: "emerald",
      bgClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      category: "AUTHENTIC"
    };
  }

  // Fallback for UNCERTAIN, INCONCLUSIVE, or any unknown classification
  const label = norm === "INCONCLUSIVE" ? "INCONCLUSIVE" : "UNCERTAIN";
  return {
    label,
    variant: "yellow",
    bgClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    category: "UNCERTAIN"
  };
}

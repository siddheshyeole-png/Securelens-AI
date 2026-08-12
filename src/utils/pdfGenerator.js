/**
 * SecureLens AI - Forensic PDF Report Document Generator
 * Generates an executive, print-ready PDF certificate from live detection records.
 */

export function generateForensicPdfReport(report) {
  if (!report) return;

  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF Forensic Report.");
    return;
  }

  const detectionId = report.id || report.detectionId || "SCN-2026-UNKNOWN";
  const filename = report.file?.filename || report.file?.name || report.target || "unnamed_media";
  const mediaType = report.mediaType || report.type || "IMAGE";
  const mimeType = report.file?.mimetype || report.file?.mimeType || report.mediaCategory || "application/octet-stream";
  const fileSizeMb = report.file?.size ? (report.file.size / (1024 * 1024)).toFixed(2) + " MB" : report.fileSize ? (report.fileSize / (1024 * 1024)).toFixed(2) + " MB" : "Unavailable";
  const dimensions = report.file?.dimensions && report.file.dimensions !== "N/A" ? report.file.dimensions : report.resolution && report.resolution !== "N/A" ? report.resolution : "Unavailable";
  const sha256 = report.sha256 || report.file?.sha256 || report.fileHash || report.checksum || "Unavailable";
  const provider = report.provider || "Sightengine";
  const model = report.model || "genai,deepfake (v1.0)";
  const timestamp = report.timestamp ? new Date(report.timestamp).toLocaleString() : report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString();
  const verdict = report.verdict || report.classification || "UNAVAILABLE";
  const status = report.status || report.processingStatus || "COMPLETED";

  const aiPercentage = report.percentages?.aiGenerated ?? (report.aiScore != null ? Math.round(report.aiScore * 100) : (report.aiProbability ?? null));
  const deepfakePercentage = report.percentages?.deepfake ?? (report.deepfakeScore != null ? Math.round(report.deepfakeScore * 100) : (report.deepfakeProbability ?? null));

  const genaiScoreText = aiPercentage != null ? `${aiPercentage}%` : "N/A";
  const deepfakeScoreText = deepfakePercentage != null ? `${deepfakePercentage}%` : "N/A";

  const evidenceList = Array.isArray(report.evidence)
    ? report.evidence
    : Array.isArray(report.evidence?.details)
    ? report.evidence.details
    : [];

  const verdictColor = (verdict.includes("AI-GENERATED") || verdict.includes("DEEPFAKE"))
    ? "#ef4444"
    : verdict.includes("UNCERTAIN")
    ? "#eab308"
    : (verdict.includes("AUTHENTIC") || verdict.includes("LOW"))
    ? "#10b981"
    : "#3b82f6";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SecureLens AI Forensic Report - ${detectionId}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #09090b;
      color: #f4f4f5;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #27272a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #ffffff;
      font-weight: 900;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 14px;
      letter-spacing: 1px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }
    .report-badge {
      font-family: monospace;
      font-size: 12px;
      color: #a1a1aa;
      text-align: right;
    }
    .verdict-card {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .verdict-tag {
      font-weight: 900;
      font-size: 18px;
      color: ${verdictColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .scores-grid {
      display: flex;
      gap: 24px;
    }
    .score-box {
      text-align: center;
      background: #09090b;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid #27272a;
    }
    .score-label {
      font-size: 10px;
      font-family: monospace;
      color: #71717a;
      text-transform: uppercase;
    }
    .score-val {
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      color: #ffffff;
    }
    .preview-container {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .preview-img {
      max-height: 260px;
      max-width: 100%;
      border-radius: 10px;
      object-contain: fit;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: monospace;
      font-size: 11px;
    }
    td {
      padding: 8px 0;
      border-bottom: 1px solid #27272a;
    }
    td.label {
      color: #71717a;
    }
    td.val {
      color: #f4f4f5;
      text-align: right;
      font-weight: 600;
    }
    .evidence-item {
      background-color: #09090b;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 10px;
      font-size: 11px;
      font-family: monospace;
      color: #d4d4d8;
      margin-bottom: 8px;
    }
    .disclaimer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #27272a;
      font-size: 10px;
      color: #71717a;
      line-height: 1.4;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-title">
      <div class="logo-badge">SECURELENS AI</div>
      <div>
        <h1 class="brand-title">Forensic Media Verification Report</h1>
        <div style="font-size: 11px; color: #a1a1aa; font-family: monospace;">Sightengine ML Model Inspection Standard v1.0</div>
      </div>
    </div>
    <div class="report-badge">
      <div>Report ID: <strong>${detectionId}</strong></div>
      <div>Issued: ${timestamp}</div>
      <div>Status: <span style="color: #10b981;">${status}</span></div>
    </div>
  </div>

  <div class="verdict-card">
    <div>
      <div style="font-size: 11px; font-family: monospace; color: #a1a1aa; margin-bottom: 4px;">OFFICIAL FORENSIC VERDICT</div>
      <div class="verdict-tag">${verdict}</div>
      <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Target: ${filename} (${mediaType})</div>
    </div>
    <div class="scores-grid">
      <div class="score-box">
        <div class="score-label">GenAI Score</div>
        <div class="score-val">${genaiScoreText}</div>
      </div>
      <div class="score-box">
        <div class="score-label">Deepfake Score</div>
        <div class="score-val">${deepfakeScoreText}</div>
      </div>
    </div>
  </div>

  ${report.previewUrl && mediaType === "IMAGE" ? `
  <div class="preview-container">
    <div class="section-title" style="text-align: left;">Uploaded Media Sample</div>
    <img src="${report.previewUrl}" class="preview-img" alt="Media Preview" />
  </div>
  ` : ""}

  <div class="grid-2">
    <div class="card">
      <div class="section-title">File Metadata & Provenance</div>
      <table>
        <tr><td class="label">Filename</td><td class="val">${filename}</td></tr>
        <tr><td class="label">MIME Container</td><td class="val">${mimeType}</td></tr>
        <tr><td class="label">File Size</td><td class="val">${fileSizeMb}</td></tr>
        <tr><td class="label">Resolution</td><td class="val">${dimensions}</td></tr>
        <tr><td class="label">SHA-256 Digest</td><td class="val" style="color: #3b82f6; word-break: break-all;">${sha256.substring(0, 32)}...</td></tr>
        <tr><td class="label">Provider</td><td class="val">${provider}</td></tr>
        <tr><td class="label">Model Requested</td><td class="val">${model}</td></tr>
      </table>
    </div>

    <div class="card">
      <div class="section-title">Verified Model Evidence</div>
      ${evidenceList.length > 0 ? evidenceList.map(ev => `
        <div class="evidence-item">✓ ${typeof ev === "string" ? ev : ev.finding || JSON.stringify(ev)}</div>
      `).join('') : `
        <div style="font-size: 11px; color: #71717a; font-family: monospace; text-center; padding: 12px;">No evidence statements generated.</div>
      `}
    </div>
  </div>

  <div class="disclaimer">
    <strong>DISCLAIMER & LEGAL NOTICE:</strong> SecureLens AI deepfake and GenAI detection is a probabilistic forensic analysis service powered by Sightengine deep neural network classifiers. Synthetic media identification confidence scores are statistical probabilities based on spatial frequencies, compression artifacts, and biometric anomalies. Automated detection results do not constitute legal proof of authenticity or intentional manipulation.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Binary,
  Activity,
  Layers,
  Clock,
  FileCheck,
  ShieldAlert,
  Info,
  UploadCloud,
  ServerOff,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useScan } from "../../hooks/useScan";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { Modal } from "../../components/Common/Modal";
import { formatDate } from "../../utils/helpers";
import { ConfigureDetectorModal } from "../../components/Common/ConfigureDetectorModal";
import { PageTransition } from "../../components/Common/PageTransition";
import { generateForensicPdfReport } from "../../utils/pdfGenerator";

export const Report = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { activeScan, scans, selectScanReport } = useScan();
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [configureModalOpen, setConfigureModalOpen] = useState(false);

  const report = reportId
    ? scans.find((s) => s.id === reportId || s.analysisId === reportId) || activeScan
    : activeScan || scans[0];

  const isModelUnavailable = report?.status === "MODEL_UNAVAILABLE" || report?.classification === "MODEL UNAVAILABLE";
  const isAnalysisFailed = report?.status === "FAILED" || report?.classification === "ANALYSIS FAILED";

  const aiPercentage = report?.percentages?.aiGenerated ?? (report?.aiScore != null ? Math.round(report.aiScore * 100) : (report?.aiProbability ?? null));
  const deepfakePercentage = report?.percentages?.deepfake ?? (report?.deepfakeScore != null ? Math.round(report.deepfakeScore * 100) : (report?.deepfakeProbability ?? null));

  let verdict = report?.verdict || report?.classification || "INCONCLUSIVE";
  if (aiPercentage != null && (verdict === "INCONCLUSIVE" || verdict === "UNAVAILABLE")) {
    if (aiPercentage >= 80) verdict = "HIGHLY LIKELY AI-GENERATED";
    else if (aiPercentage >= 50) verdict = "LIKELY AI-GENERATED";
    else if (aiPercentage >= 20) verdict = "UNCERTAIN";
    else verdict = "LIKELY AUTHENTIC";
  }

  const isHighlyAi = verdict === "HIGHLY LIKELY AI-GENERATED";
  const isLikelyAi = verdict === "LIKELY AI-GENERATED";
  const isUncertain = verdict === "UNCERTAIN" || (aiPercentage != null && aiPercentage >= 20 && aiPercentage < 50);
  const isAuthentic = verdict === "LIKELY AUTHENTIC" || (aiPercentage != null && aiPercentage < 20);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setShareModalOpen(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    generateForensicPdfReport(report);
  };

  const handlePrint = () => {
    generateForensicPdfReport(report);
  };

  if (!report) {
    return (
      <PageTransition className="max-w-4xl mx-auto py-16 text-center text-zinc-100">
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 p-12 space-y-4">
          <UploadCloud className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Reports Available</h2>
          <p className="text-sm text-zinc-400">Upload and analyze media files to generate forensic reports.</p>
          <Button variant="primary" icon={UploadCloud} onClick={() => navigate("/dashboard/upload")}>
            Upload Media
          </Button>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B] print:bg-white print:text-black">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="cyan">DETECTION VERIFICATION REPORT</Badge>
            <span className="text-xs text-zinc-400 font-mono print:text-black">ID: {report?.id || report?.detectionId || "SCN-2026-N/A"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 print:text-black">
            Forensic Media Verification Report
          </h1>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="ghost" size="md" icon={Printer} onClick={handlePrint}>
            Print
          </Button>
          <Button variant="secondary" size="md" icon={Share2} onClick={handleShare}>
            Share
          </Button>
          <Button variant="primary" size="md" icon={Download} onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Primary Result Banner */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-2xl relative overflow-hidden print:border-black print:bg-white print:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-3">
              {isModelUnavailable ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <ServerOff className="w-4 h-4 mr-2 text-blue-400" />
                  DETECTION UNAVAILABLE
                </span>
              ) : isAnalysisFailed ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertCircle className="w-4 h-4 mr-2 text-rose-400" />
                  ANALYSIS FAILED
                </span>
              ) : isHighlyAi ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 mr-2 text-rose-400" />
                  HIGHLY LIKELY AI-GENERATED
                </span>
              ) : isLikelyAi ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 mr-2 text-rose-400" />
                  LIKELY AI-GENERATED
                </span>
              ) : isUncertain ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  <HelpCircle className="w-4 h-4 mr-2 text-yellow-400" />
                  UNCERTAIN
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                  LIKELY AUTHENTIC
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
              {report?.target || "Media File"}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-mono flex flex-wrap items-center gap-3 print:text-gray-700">
              <span>Type: {report?.type || "IMAGE"}</span>
              <span>•</span>
              <span>Format: {report?.file?.mimetype || report?.mediaCategory || "Unknown"}</span>
              <span>•</span>
              <span>Provider: {report?.provider || "Sightengine"}</span>
            </p>
          </div>

          <div className="lg:col-span-5 bg-zinc-950/80 p-6 rounded-[20px] border border-zinc-800 flex items-center justify-between print:border-gray-300 print:bg-gray-50">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block print:text-gray-600">
                AI SCORE
              </span>
              <span className={`text-3xl font-black font-mono mt-1 block ${
                isModelUnavailable || isAnalysisFailed || aiPercentage == null
                  ? "text-zinc-500 text-sm font-semibold pt-1"
                  : isHighlyAi || isLikelyAi
                  ? "text-rose-400"
                  : isUncertain
                  ? "text-yellow-400"
                  : "text-emerald-400"
              }`}>
                {aiPercentage != null ? `${aiPercentage}%` : "N/A"}
              </span>
            </div>

            <div className="h-10 w-[1px] bg-zinc-800 print:bg-gray-300" />

            <div>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block print:text-gray-600">
                DEEPFAKE SCORE
              </span>
              <span className={`text-3xl font-black font-mono mt-1 block ${
                isModelUnavailable || isAnalysisFailed || deepfakePercentage == null
                  ? "text-zinc-500 text-sm font-semibold pt-1"
                  : deepfakePercentage >= 50
                  ? "text-rose-400"
                  : deepfakePercentage >= 20
                  ? "text-yellow-400"
                  : "text-emerald-400"
              }`}>
                {deepfakePercentage != null ? `${deepfakePercentage}%` : "N/A"}
              </span>
            </div>

            <div className="h-12 w-[1px] bg-zinc-800 print:bg-gray-300" />

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block print:text-gray-600">
                STATUS
              </span>
              <span className={`text-base font-extrabold font-mono mt-1 inline-block px-3 py-1 rounded-lg border ${
                isModelUnavailable
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : isAnalysisFailed
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : isHighlyAi || isLikelyAi
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : isUncertain
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}>
                {report?.status || "COMPLETED"}
              </span>
            </div>
          </div>
        </div>

        {/* Report Switcher */}
        {scans.length > 1 && (
          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center space-x-2 overflow-x-auto print:hidden">
            <span className="text-xs text-zinc-400 font-mono mr-2 font-semibold">Select Report:</span>
            {scans.map((s, idx) => (
              <button
                key={`${s.id}-${idx}`}
                onClick={() => {
                  selectScanReport(s.id);
                  navigate(`/dashboard/reports/${s.id}`);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  s.id === report?.id
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold shadow-md shadow-blue-500/10"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {s.id} ({s.type})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded Media Preview */}
      {(report?.previewUrl || report?.file?.previewUrl) && (
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-6 space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-zinc-400 font-mono uppercase tracking-wider">
            Uploaded Media Preview
          </h3>
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800/80 flex items-center justify-center p-2 min-h-[180px] max-h-[420px]">
            {(report.type === "VIDEO" || report.mediaType === "VIDEO") ? (
              <video
                src={report.previewUrl || report.file?.previewUrl}
                controls
                className="max-h-[400px] w-auto max-w-full rounded-xl object-contain"
              />
            ) : (report.type === "AUDIO" || report.mediaType === "AUDIO") ? (
              <div className="py-10 px-6 text-center space-y-3 w-full">
                <p className="text-sm font-bold text-white font-mono">{report.target || report.filename}</p>
                <audio src={report.previewUrl || report.file?.previewUrl} controls className="mx-auto w-full max-w-md" />
              </div>
            ) : (
              <img
                src={report.previewUrl || report.file?.previewUrl}
                alt="Uploaded file preview"
                className="max-h-[400px] w-auto max-w-full rounded-xl object-contain"
              />
            )}
          </div>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 space-y-3 print:bg-white print:border-gray-300">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 print:text-black">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Diagnostic Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-zinc-300 leading-relaxed space-y-3 font-sans print:bg-gray-50 print:text-black">
              <p>{report?.summary || "Analysis record generated."}</p>
              {isModelUnavailable && (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ServerOff}
                    onClick={() => setConfigureModalOpen(true)}
                  >
                    Configure Detector
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono pt-1">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Engine: {report?.provider || "Sightengine API"} • Model: {report?.model || report?.modelName || "genai,deepfake"}</span>
            </div>
          </Card>

          {/* Verified Model Evidence */}
          {(() => {
            const evidenceList = Array.isArray(report?.evidence)
              ? report.evidence
              : Array.isArray(report?.evidence?.details)
              ? report.evidence.details
              : [];

            if (evidenceList.length === 0) return null;

            return (
              <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 space-y-3 print:bg-white print:border-gray-300">
                <h3 className="text-base font-bold text-white flex items-center space-x-2 print:text-black">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <span>Verified Model Evidence</span>
                </h3>
                <div className="space-y-2">
                  {evidenceList.map((ev, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 flex items-start space-x-3 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{typeof ev === "string" ? ev : ev.finding || ev.label || JSON.stringify(ev)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 space-y-4 print:bg-white print:border-gray-300">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 print:text-black">
              <Binary className="w-5 h-5 text-blue-400" />
              <span>File Metadata & Provenance</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Detection ID:</span>
                <span className="text-blue-400 font-bold font-mono print:text-black">{report?.id || report?.detectionId || "Unavailable"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Filename:</span>
                <span className="text-white font-semibold truncate max-w-[180px] print:text-black">{report?.file?.filename || report?.file?.name || report?.target || "Unavailable"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Media Format:</span>
                <span className="text-white font-semibold print:text-black">{report?.file?.mimetype || report?.file?.mimeType || report?.mediaCategory || "Unavailable"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">File Size:</span>
                <span className="text-white font-semibold print:text-black">
                  {report?.file?.size
                    ? `${(report.file.size / (1024 * 1024)).toFixed(2)} MB`
                    : report?.fileSize
                    ? `${(report.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : "Unavailable"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Dimensions:</span>
                <span className="text-white font-semibold print:text-black">{report?.file?.dimensions && report.file.dimensions !== "N/A" ? report.file.dimensions : report?.resolution && report.resolution !== "N/A" ? report.resolution : "Unavailable"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">EXIF Metadata:</span>
                <span className="text-white font-semibold truncate max-w-[160px] print:text-black">
                  {report?.file?.exifInfo || (report?.file?.exifPresent ? "Present" : "Not present")}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Request ID:</span>
                <span
                  className="text-zinc-300 font-semibold truncate max-w-[150px] print:text-black"
                  title={report?.requestId}
                >
                  {report?.requestId || "Unavailable"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80 items-center">
                <span className="text-zinc-500">SHA-256 Digest:</span>
                <button
                  onClick={() => {
                    const hashVal = report?.sha256 || report?.file?.sha256 || report?.fileHash || report?.checksum;
                    if (hashVal) {
                      navigator.clipboard.writeText(hashVal);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="text-blue-400 font-semibold truncate max-w-[150px] hover:underline focus:outline-none"
                  title="Click to copy full SHA-256 hash"
                >
                  {copied ? "Copied!" : (report?.sha256 || report?.file?.sha256 || report?.fileHash || report?.checksum || "Unavailable")}
                </button>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Provider & Model:</span>
                <span className="text-white font-semibold print:text-black">{report?.provider || "Sightengine"} ({report?.model || "genai,deepfake"})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Analysis Timestamp:</span>
                <span className="text-white font-semibold print:text-black">
                  {report?.timestamp ? new Date(report.timestamp).toLocaleString() : report?.createdAt ? new Date(report.createdAt).toLocaleString() : "Unavailable"}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 pt-1 font-sans">
              {report?.file?.exifNote || (report?.file?.exifPresent
                ? "EXIF metadata present in file header."
                : "EXIF metadata not present. Missing metadata alone does not establish AI generation.")}
            </p>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {shareModalOpen && (
        <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Forensic Report" maxWidth="max-w-md">
          <div className="text-center space-y-4 py-4">
            <FileCheck className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Verification Link Copied</h3>
            <p className="text-xs text-zinc-400 font-mono">
              URL for report <strong className="text-blue-400">{report?.id}</strong> copied to clipboard.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShareModalOpen(false)}>
              Done
            </Button>
          </div>
        </Modal>
      )}

      {downloadModalOpen && (
        <Modal isOpen={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} title="Download Report Certificate" maxWidth="max-w-md">
          <div className="text-center space-y-4 py-4">
            <Download className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Exporting Report</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Exporting report for media file <strong className="text-white">{report?.target}</strong>...
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                Print Document
              </Button>
              <Button variant="primary" size="sm" onClick={() => setDownloadModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfigureDetectorModal
        isOpen={configureModalOpen}
        onClose={() => setConfigureModalOpen(false)}
      />
    </PageTransition>
  );
};

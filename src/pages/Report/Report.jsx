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
  FileCheck,
  ShieldAlert,
  Info,
  UploadCloud,
  ServerOff,
  AlertCircle,
  Film,
  Volume2,
  Image as ImageIcon
} from "lucide-react";
import { useScan } from "../../hooks/useScan";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { Modal } from "../../components/Common/Modal";
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

  const mediaType = (report?.mediaType || report?.type || "IMAGE").toUpperCase();

  const isModelUnavailable = report?.status === "MODEL_UNAVAILABLE" || report?.classification === "MODEL UNAVAILABLE" || report?.verdict === "DETECTION UNAVAILABLE";
  const isAnalysisFailed = report?.status === "FAILED" || report?.classification === "ANALYSIS FAILED";

  const aiPercentage = report?.percentages?.aiGenerated ?? (report?.scores?.aiGenerated != null ? Math.round(report.scores.aiGenerated * 100) : (report?.genaiScore != null ? Math.round(report.genaiScore * 100) : (report?.aiScore != null ? Math.round(report.aiScore * 100) : (report?.aiProbability ?? null))));
  const deepfakePercentage = report?.percentages?.deepfake ?? (report?.scores?.deepfake != null ? Math.round(report.scores.deepfake * 100) : (report?.deepfakeScore != null ? Math.round(report.deepfakeScore * 100) : (report?.deepfakeProbability ?? null)));

  let verdict = report?.verdict || report?.classification || "INCONCLUSIVE";
  if (verdict === "INCONCLUSIVE" || verdict === "UNAVAILABLE") {
    if (deepfakePercentage != null && deepfakePercentage >= 50) {
      verdict = deepfakePercentage >= 80 ? "HIGHLY LIKELY DEEPFAKE" : "LIKELY DEEPFAKE";
    } else if (aiPercentage != null) {
      if (aiPercentage >= 80) verdict = "HIGHLY LIKELY AI-GENERATED";
      else if (aiPercentage >= 50) verdict = "LIKELY AI-GENERATED";
      else if (aiPercentage >= 20) verdict = "UNCERTAIN";
      else verdict = "LIKELY AUTHENTIC";
    } else if (deepfakePercentage != null) {
      if (deepfakePercentage >= 20) verdict = "UNCERTAIN";
      else verdict = "LOW MANIPULATION SIGNAL";
    }
  }

  const isHighlyAi = verdict === "HIGHLY LIKELY AI-GENERATED";
  const isLikelyAi = verdict === "LIKELY AI-GENERATED";
  const isHighlyDeepfake = verdict === "HIGHLY LIKELY DEEPFAKE";
  const isLikelyDeepfake = verdict === "LIKELY DEEPFAKE";
  const isUncertain = verdict === "UNCERTAIN" || verdict === "INCONCLUSIVE" || verdict === "UNAVAILABLE" || !report;
  const isAuthentic = (verdict === "LIKELY AUTHENTIC" || verdict === "LOW MANIPULATION SIGNAL") && !isModelUnavailable && !isAnalysisFailed;

  const confidenceLevel = report?.confidenceLevel || (report?.confidence ? `${report.confidence}%` : (aiPercentage != null || deepfakePercentage != null ? "HIGH" : "UNKNOWN"));

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
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-blue-400 border border-zinc-700">
              {mediaType}
            </span>
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
              ) : isHighlyDeepfake || isLikelyDeepfake ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 mr-2 text-rose-400" />
                  {verdict}
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
              ) : isAuthentic ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                  LIKELY AUTHENTIC
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  <HelpCircle className="w-4 h-4 mr-2 text-yellow-400" />
                  UNCERTAIN
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
              {report?.target || report?.filename || "Media File"}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-mono flex flex-wrap items-center gap-3 print:text-gray-700">
              <span>Type: {mediaType}</span>
              <span>•</span>
              <span>Provider: {report?.provider || "SecureLens Detector"}</span>
              <span>•</span>
              <span>Confidence: {confidenceLevel}</span>
            </p>
          </div>

          <div className="lg:col-span-5 bg-zinc-950/80 p-6 rounded-[20px] border border-zinc-800 flex items-center justify-between print:border-gray-300 print:bg-gray-50">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block print:text-gray-600">
                AI GENERATED %
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
                DEEPFAKE / FACE %
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
                {s.id} ({s.type || s.mediaType || "IMAGE"})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {(report?.previewUrl || report?.file?.previewUrl) && (
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-6 space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-zinc-400 font-mono uppercase tracking-wider flex items-center space-x-2">
            {mediaType === "VIDEO" ? <Film className="w-4 h-4 text-blue-400" /> : mediaType === "AUDIO" ? <Volume2 className="w-4 h-4 text-purple-400" /> : <ImageIcon className="w-4 h-4 text-emerald-400" />}
            <span>Uploaded {mediaType} Preview</span>
          </h3>
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800/80 flex items-center justify-center p-2 min-h-[180px] max-h-[420px]">
            {mediaType === "VIDEO" ? (
              <video
                src={report.previewUrl || report.file?.previewUrl}
                controls
                playsInline
                preload="metadata"
                className="max-h-[400px] w-auto max-w-full rounded-xl object-contain"
              />
            ) : mediaType === "AUDIO" ? (
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
              <p>{report?.summary || "Verification analysis completed."}</p>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono pt-1">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Engine: {report?.provider || "SecureLens Detector"} • Model: {report?.model || "Standard Neural Model"}</span>
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
                  <span>Verified Model Evidence ({mediaType})</span>
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
              <span>File Metadata & Diagnostics</span>
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
                <span className="text-white font-semibold print:text-black">{report?.file?.mimetype || report?.file?.mimeType || mediaType}</span>
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

              {/* Video-Specific Diagnostics */}
              {mediaType === "VIDEO" && (
                <>
                  <div className="flex justify-between py-2 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Frames Analyzed:</span>
                    <span className="text-emerald-400 font-bold print:text-black">{report?.diagnostics?.sampledFrameCount ?? report?.diagnostics?.frameCount ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Video Duration:</span>
                    <span className="text-white font-semibold print:text-black">{report?.diagnostics?.duration || report?.file?.duration || "N/A"}</span>
                  </div>
                </>
              )}

              {/* Audio-Specific Diagnostics */}
              {mediaType === "AUDIO" && (
                <>
                  <div className="flex justify-between py-2 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Speech Windows:</span>
                    <span className="text-purple-400 font-bold print:text-black">{report?.diagnostics?.numberOfWindows ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Audio Duration:</span>
                    <span className="text-white font-semibold print:text-black">{report?.diagnostics?.duration || report?.file?.duration || "N/A"}</span>
                  </div>
                </>
              )}

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
                    const hashVal = report?.sha256 || report?.file?.sha256 || report?.fileHash;
                    if (hashVal) {
                      navigator.clipboard.writeText(hashVal);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="text-blue-400 font-semibold truncate max-w-[150px] hover:underline focus:outline-none"
                  title="Click to copy full SHA-256 hash"
                >
                  {copied ? "Copied!" : (report?.sha256 || report?.file?.sha256 || report?.fileHash || "Unavailable")}
                </button>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Provider & Model:</span>
                <span className="text-white font-semibold print:text-black">{report?.provider || "SecureLens"} ({report?.model || "Neural Model"})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/80">
                <span className="text-zinc-500">Analysis Timestamp:</span>
                <span className="text-white font-semibold print:text-black">
                  {report?.timestamp ? new Date(report.timestamp).toLocaleString() : report?.createdAt ? new Date(report.createdAt).toLocaleString() : "Unavailable"}
                </span>
              </div>
            </div>
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

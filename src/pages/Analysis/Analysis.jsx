import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  UploadCloud,
  ArrowRight,
  ShieldAlert,
  Binary,
  Layers,
  Activity,
  ServerOff,
  AlertCircle,
  RefreshCw,
  Info
} from "lucide-react";
import { useScan } from "../../hooks/useScan";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { ConfigureDetectorModal } from "../../components/Common/ConfigureDetectorModal";
import { PageTransition } from "../../components/Common/PageTransition";

export const Analysis = () => {
  const navigate = useNavigate();
  const { analysisId } = useParams();
  const { activeScan, scans, isScanning, scanProgress, statusMessage } = useScan();
  const [configureModalOpen, setConfigureModalOpen] = React.useState(false);

  const report = analysisId
    ? scans.find((s) => s.id === analysisId || s.analysisId === analysisId) || activeScan
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

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B]">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="cyan">VERIFICATION ANALYSIS</Badge>
            <span className="text-xs text-zinc-400 font-mono">ID: {report?.id || "N/A"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Media Authenticity Diagnostic
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="md"
            icon={UploadCloud}
            onClick={() => navigate("/dashboard/upload")}
          >
            Analyze Another
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={FileText}
            onClick={() => navigate(`/dashboard/reports/${report?.id || ""}`)}
          >
            View Full Report
          </Button>
        </div>
      </div>

      {/* Real Processing Lifecycle State */}
      {isScanning && (
        <Card hover={false} className="border-blue-500/30 bg-blue-500/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Detection Analysis in Progress</h3>
          <p className="text-xs text-zinc-400 font-mono">{statusMessage || "Communicating with Sightengine model pipeline..."}</p>
          
          <div className="flex items-center justify-center space-x-2 pt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("Upload") ? "bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              1. UPLOADING
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("SHA-256") || statusMessage?.includes("container") ? "bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              2. ANALYZING
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("Sightengine") || statusMessage?.includes("classifier") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              3. PROCESSING
            </span>
          </div>
        </Card>
      )}

      {/* Exact Uploaded Media Preview */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 font-mono uppercase tracking-wider">
          Uploaded Media Preview
        </h3>

        <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800/80 flex items-center justify-center p-2 min-h-[220px] max-h-[460px]">
          {(report?.previewUrl || report?.file?.previewUrl) ? (
            (report.type === "VIDEO" || report.mediaType === "VIDEO") ? (
              <video
                src={report.previewUrl || report.file?.previewUrl}
                controls
                className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
              />
            ) : (report.type === "AUDIO" || report.mediaType === "AUDIO") ? (
              <div className="py-12 px-6 text-center space-y-3 w-full">
                <p className="text-sm font-bold text-white font-mono">{report.target || report.filename}</p>
                <audio src={report.previewUrl || report.file?.previewUrl} controls className="mx-auto w-full max-w-md" />
              </div>
            ) : (
              <img
                src={report.previewUrl || report.file?.previewUrl}
                alt="Exact Uploaded Media Preview"
                className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
              />
            )
          ) : (
            <div className="py-16 text-center text-zinc-500 font-mono text-xs">
              Preview rendered for {report?.target || report?.filename || "media file"}
            </div>
          )}
        </div>
      </Card>

      {/* Layer 1: AI Model Classification Banner */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                STATUS:
              </span>
              <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                isModelUnavailable
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : isAnalysisFailed
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}>
                {isScanning
                  ? "ANALYZING"
                  : isModelUnavailable
                  ? "DETECTION UNAVAILABLE"
                  : isAnalysisFailed
                  ? "ANALYSIS ERROR"
                  : "DETECTION COMPLETE"}
              </span>
            </div>

            <div className="flex items-center space-x-3 mt-3">
              {isModelUnavailable ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <ServerOff className="w-5 h-5 mr-2" />
                  DETECTION UNAVAILABLE
                </span>
              ) : isAnalysisFailed ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  ANALYSIS ERROR
                </span>
              ) : isHighlyAi ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  HIGHLY LIKELY AI-GENERATED
                </span>
              ) : isLikelyAi ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  LIKELY AI-GENERATED
                </span>
              ) : isUncertain ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  UNCERTAIN
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  LIKELY AUTHENTIC
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-right">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                AI SCORE
              </span>
              <span className={`text-2xl sm:text-3xl font-black font-mono mt-1 block ${
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

            <div className="h-8 w-[1px] bg-zinc-800" />

            <div>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                DEEPFAKE SCORE
              </span>
              <span className={`text-2xl sm:text-3xl font-black font-mono mt-1 block ${
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

        {/* Visual Confidence Bar using REAL score */}
        {aiPercentage != null && !isModelUnavailable && !isAnalysisFailed && (
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">AI Signal Probability Bar</span>
              <span className="text-white font-bold">{aiPercentage}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isHighlyAi || isLikelyAi
                    ? "bg-rose-500 shadow-lg shadow-rose-500/20"
                    : isUncertain
                    ? "bg-yellow-500 shadow-lg shadow-yellow-500/20"
                    : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, aiPercentage))}%` }}
              />
            </div>
          </div>
        )}

        {/* UNCERTAIN Explanation Callout */}
        {isUncertain && !isModelUnavailable && !isAnalysisFailed && (
          <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 space-y-2 text-xs font-mono text-yellow-200">
            <div className="flex items-center space-x-2 font-bold text-sm text-yellow-400">
              <HelpCircle className="w-4 h-4" />
              <span>Classification Note: UNCERTAIN</span>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed">
              The detection model found some AI-generation signals, but the confidence is not strong enough for a definitive classification.
            </p>
          </div>
        )}

        {/* Model Unconfigured Explanation Callout */}
        {isModelUnavailable && (
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3 text-xs font-mono text-blue-200">
            <div className="flex items-center space-x-2 font-bold text-sm text-blue-400">
              <Info className="w-4 h-4" />
              <span>Detection Service Unavailable</span>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed">
              Detection service unavailable. No artificial score was generated.
              File metadata and SHA-256 digest were computed for integrity verification.
            </p>
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
          </div>
        )}

        {/* Analysis Failed Error Callout */}
        {isAnalysisFailed && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 text-xs font-mono text-rose-300">
            <div className="flex items-center space-x-2 font-bold text-sm text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>Analysis Error</span>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed">
              {report?.summary || "The detection model API returned an error or timed out during inference."}
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => navigate("/dashboard/upload")}
            >
              Retry Analysis
            </Button>
          </div>
        )}

        {/* Genuine Model Evidence */}
        {((Array.isArray(report?.evidence) && report.evidence.length > 0) || (report?.evidence?.details && report.evidence.details.length > 0)) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Verified Model Evidence</span>
            </h3>
            <div className="space-y-2">
              {(Array.isArray(report?.evidence) ? report.evidence : report?.evidence?.details || []).map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{typeof ev === "string" ? ev : ev?.finding || ev?.label || JSON.stringify(ev)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata, Provenance & File Integrity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-xs font-mono">
          {/* Metadata & Provenance */}
          <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-500 font-bold uppercase">FILE METADATA & PROVENANCE</span>
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Filename:</span>
              <span className="text-white truncate max-w-[160px]">{report?.file?.filename || report?.file?.name || report?.target || "Unavailable"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Media Format:</span>
              <span className="text-white">{report?.file?.mimetype || report?.file?.mimeType || report?.mediaCategory || "Unavailable"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>File Size:</span>
              <span className="text-white">
                {report?.file?.size
                  ? `${(report.file.size / (1024 * 1024)).toFixed(2)} MB`
                  : report?.fileSize
                  ? `${(report.fileSize / (1024 * 1024)).toFixed(2)} MB`
                  : "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Dimensions:</span>
              <span className="text-white">{report?.file?.dimensions && report.file.dimensions !== "N/A" ? report.file.dimensions : report?.resolution && report.resolution !== "N/A" ? report.resolution : "Unavailable"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>EXIF Metadata:</span>
              <span className="text-white font-mono">
                {report?.file?.exifInfo || (report?.file?.exifPresent ? "Present" : "Not present")}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-tight font-sans">
              {report?.file?.exifNote || (report?.file?.exifPresent
                ? "EXIF metadata present in file header."
                : "EXIF metadata not present. Missing metadata alone does not establish AI generation.")}
            </p>
          </div>

          {/* File Integrity & SHA-256 */}
          <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-500 font-bold uppercase">FILE INTEGRITY & DIGEST</span>
              <Binary className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>SHA-256 Digest:</span>
              <span
                className="text-blue-400 font-mono truncate max-w-[140px]"
                title={report?.sha256 || report?.file?.sha256 || report?.fileHash || report?.checksum}
              >
                {report?.sha256 || report?.file?.sha256 || report?.fileHash || report?.checksum || "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Provider:</span>
              <span className="text-white font-bold">{report?.provider || "Sightengine"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Request ID:</span>
              <span
                className="text-zinc-300 font-mono truncate max-w-[140px]"
                title={report?.requestId}
              >
                {report?.requestId || "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Analysis Timestamp:</span>
              <span className="text-white">
                {report?.timestamp ? new Date(report.timestamp).toLocaleString() : "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Model Version:</span>
              <span className="text-white font-mono">{report?.modelVersion || "N/A"}</span>
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-tight font-sans">
              Note: SHA-256 is used strictly for cryptographic file integrity, NOT as an AI score.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="md"
            icon={UploadCloud}
            onClick={() => navigate("/dashboard/upload")}
            className="w-full sm:w-auto"
          >
            Analyze Another File
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate(`/dashboard/reports/${report?.id || ""}`)}
            className="w-full sm:w-auto"
          >
            View Detailed Report
          </Button>
        </div>
      </Card>

      <ConfigureDetectorModal
        isOpen={configureModalOpen}
        onClose={() => setConfigureModalOpen(false)}
      />
    </PageTransition>
  );
};

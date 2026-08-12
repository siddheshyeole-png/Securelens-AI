import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Info,
  Film,
  Volume2,
  Image as ImageIcon
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
  const { activeScan, scans, isScanning, statusMessage } = useScan();
  const [configureModalOpen, setConfigureModalOpen] = React.useState(false);

  const report = analysisId
    ? scans.find((s) => s.id === analysisId || s.analysisId === analysisId) || activeScan
    : activeScan || scans[0];

  const mediaType = (report?.mediaType || report?.type || "IMAGE").toUpperCase();

  const isModelUnavailable = report?.status === "MODEL_UNAVAILABLE" || report?.classification === "MODEL UNAVAILABLE" || report?.verdict === "DETECTION UNAVAILABLE";
  const isAnalysisFailed = report?.status === "FAILED" || report?.classification === "ANALYSIS FAILED";

  const aiPercentage = report?.percentages?.aiGenerated ?? (report?.scores?.aiGenerated != null ? Math.round(report.scores.aiGenerated * 100) : (report?.genaiScore != null ? Math.round(report.genaiScore * 100) : (report?.aiScore != null ? Math.round(report.aiScore * 100) : (report?.aiProbability ?? null))));
  const deepfakePercentage = report?.percentages?.deepfake ?? (report?.scores?.deepfake != null ? Math.round(report.scores.deepfake * 100) : (report?.deepfakeScore != null ? Math.round(report.deepfakeScore * 100) : (report?.deepfakeProbability ?? null)));

  // Temporary development logging for video analysis response payload inspection
  React.useEffect(() => {
    if (report && (mediaType === "VIDEO" || report?.mediaType === "video" || report?.type === "video")) {
      console.log("VIDEO ANALYSIS RESPONSE", report);
    }
  }, [report, mediaType]);

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

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B]">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="cyan">VERIFICATION ANALYSIS</Badge>
            <span className="text-xs text-zinc-400 font-mono">ID: {report?.id || report?.detectionId || "N/A"}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-blue-400 border border-zinc-700">
              {mediaType}
            </span>
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
          <p className="text-xs text-zinc-400 font-mono">{statusMessage || "Communicating with detection model pipeline..."}</p>
          
          <div className="flex items-center justify-center space-x-2 pt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("Upload") ? "bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              1. UPLOADING
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("SHA-256") || statusMessage?.includes("container") ? "bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              2. ANALYZING
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${statusMessage?.includes("classifier") || statusMessage?.includes("PyTorch") || statusMessage?.includes("Sightengine") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
              3. PROCESSING
            </span>
          </div>
        </Card>
      )}

      {/* Uploaded Media Preview */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-400 font-mono uppercase tracking-wider flex items-center space-x-2">
            {mediaType === "VIDEO" ? (
              <Film className="w-4 h-4 text-blue-400" />
            ) : mediaType === "AUDIO" ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            )}
            <span>Uploaded {mediaType} Preview</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {report?.file?.filename || report?.filename || report?.target || "media_file"}
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800/80 flex items-center justify-center p-2 min-h-[220px] max-h-[460px]">
          {(report?.previewUrl || report?.file?.previewUrl) ? (
            mediaType === "VIDEO" ? (
              <video
                src={report.previewUrl || report.file?.previewUrl}
                controls
                playsInline
                preload="metadata"
                className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
              />
            ) : mediaType === "AUDIO" ? (
              <div className="py-12 px-6 text-center space-y-4 w-full">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                  <Volume2 className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white font-mono">{report.target || report.filename}</p>
                <audio src={report.previewUrl || report.file?.previewUrl} controls className="mx-auto w-full max-w-md" />
              </div>
            ) : (
              <img
                src={report.previewUrl || report.file?.previewUrl}
                alt="Uploaded Media Preview"
                className="max-h-[420px] w-auto max-w-full rounded-xl object-contain"
              />
            )
          ) : (
            <div className="py-16 text-center text-zinc-500 font-mono text-xs space-y-2">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                {mediaType === "VIDEO" ? <Film className="w-6 h-6" /> : mediaType === "AUDIO" ? <Volume2 className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <p>Preview registered for {report?.target || report?.filename || "media file"}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 4 Separate Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Generated % */}
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-5 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            AI Generated %
          </span>
          <span className={`text-2xl sm:text-3xl font-black font-mono block ${
            isModelUnavailable || isAnalysisFailed || aiPercentage == null
              ? "text-zinc-500 text-lg font-semibold"
              : aiPercentage >= 50
              ? "text-rose-400"
              : aiPercentage >= 20
              ? "text-yellow-400"
              : "text-emerald-400"
          }`}>
            {aiPercentage != null ? `${aiPercentage}%` : "N/A"}
          </span>
          <p className="text-[11px] text-zinc-400 font-mono">
            {aiPercentage != null ? "Generative AI Signal" : "Model Score Unavailable"}
          </p>
        </Card>

        {/* Card 2: Deepfake / Face Manipulation % */}
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-5 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Deepfake / Face %
          </span>
          <span className={`text-2xl sm:text-3xl font-black font-mono block ${
            isModelUnavailable || isAnalysisFailed || deepfakePercentage == null
              ? "text-zinc-500 text-lg font-semibold"
              : deepfakePercentage >= 50
              ? "text-rose-400"
              : deepfakePercentage >= 20
              ? "text-yellow-400"
              : "text-emerald-400"
          }`}>
            {deepfakePercentage != null ? `${deepfakePercentage}%` : "N/A"}
          </span>
          <p className="text-[11px] text-zinc-400 font-mono">
            {deepfakePercentage != null ? "Face Manipulation Signal" : "Model Score Unavailable"}
          </p>
        </Card>

        {/* Card 3: Confidence */}
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-5 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Confidence
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-blue-400 block">
            {confidenceLevel}
          </span>
          <p className="text-[11px] text-zinc-400 font-mono">
            Statistical Precision
          </p>
        </Card>

        {/* Card 4: Final Verdict */}
        <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-5 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Final Verdict
          </span>
          <div className="pt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${
              isModelUnavailable
                ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                : isHighlyDeepfake || isLikelyDeepfake || isHighlyAi || isLikelyAi
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                : isAuthentic
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
            }`}>
              {verdict}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono pt-1">
            4-Tier Verdict System
          </p>
        </Card>
      </div>

      {/* Multimodal AI Model Classification Details & Separate Progress Bars */}
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

              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                CONFIDENCE: {confidenceLevel}
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
              ) : isHighlyDeepfake || isLikelyDeepfake ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {verdict}
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
              ) : isAuthentic ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  LIKELY AUTHENTIC
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-extrabold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  UNCERTAIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Separate Progress Bars for AI Generation Probability and Deepfake Manipulation Probability */}
        {!isModelUnavailable && !isAnalysisFailed && (
          <div className="space-y-5 pt-2 border-t border-zinc-800/80">
            {/* Progress Bar 1: AI Generation Probability */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-semibold">
                  AI Generation Probability
                </span>
                <span className={aiPercentage != null ? "text-white font-bold" : "text-zinc-500 font-bold"}>
                  {aiPercentage != null ? `${aiPercentage}%` : "N/A"}
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    aiPercentage == null
                      ? "bg-zinc-700 opacity-20"
                      : aiPercentage >= 50
                      ? "bg-rose-500 shadow-lg shadow-rose-500/20"
                      : aiPercentage >= 20
                      ? "bg-yellow-500 shadow-lg shadow-yellow-500/20"
                      : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                  }`}
                  style={{ width: `${aiPercentage != null ? Math.min(100, Math.max(0, aiPercentage)) : 0}%` }}
                />
              </div>
            </div>

            {/* Progress Bar 2: Face / Deepfake Manipulation Probability */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-semibold">
                  Face / Deepfake Manipulation Probability
                </span>
                <span className={deepfakePercentage != null ? "text-white font-bold" : "text-zinc-500 font-bold"}>
                  {deepfakePercentage != null ? `${deepfakePercentage}%` : "N/A"}
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    deepfakePercentage == null
                      ? "bg-zinc-700 opacity-20"
                      : deepfakePercentage >= 50
                      ? "bg-rose-500 shadow-lg shadow-rose-500/20"
                      : deepfakePercentage >= 20
                      ? "bg-yellow-500 shadow-lg shadow-yellow-500/20"
                      : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                  }`}
                  style={{ width: `${deepfakePercentage != null ? Math.min(100, Math.max(0, deepfakePercentage)) : 0}%` }}
                />
              </div>
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
              The detection model found inconclusive signals for this {mediaType.toLowerCase()} file. Standard forensic rules require moderate or high probability thresholds to issue a definitive classification.
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

        {/* Genuine Model Evidence */}
        {((Array.isArray(report?.evidence) && report.evidence.length > 0) || (report?.evidence?.details && report.evidence.details.length > 0)) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Verified {mediaType} Evidence Statements</span>
            </h3>
            <div className="space-y-2">
              {(Array.isArray(report?.evidence) ? report.evidence : report?.evidence?.details || []).map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 flex items-start space-x-3 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{typeof ev === "string" ? ev : ev?.finding || ev?.label || JSON.stringify(ev)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modality Diagnostics & File Integrity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-xs font-mono">
          {/* Metadata & Diagnostics */}
          <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-500 font-bold uppercase">{mediaType} DIAGNOSTICS & METADATA</span>
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Filename:</span>
              <span className="text-white truncate max-w-[160px]">{report?.file?.filename || report?.file?.name || report?.target || "Unavailable"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Media Format:</span>
              <span className="text-white">{report?.file?.mimetype || report?.file?.mimeType || mediaType}</span>
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

            {/* Video-Specific Diagnostics */}
            {mediaType === "VIDEO" && (
              <>
                <div className="flex justify-between text-zinc-400">
                  <span>Frames Analyzed:</span>
                  <span className="text-emerald-400 font-bold">{report?.diagnostics?.sampledFrameCount ?? report?.diagnostics?.frameCount ?? "N/A"}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Video Duration:</span>
                  <span className="text-white">{report?.diagnostics?.duration || report?.file?.duration || "N/A"}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Resolution & FPS:</span>
                  <span className="text-white">{report?.diagnostics?.resolution ? `${report.diagnostics.resolution} @ ${report.diagnostics.fps || 30} FPS` : "N/A"}</span>
                </div>
              </>
            )}

            {/* Audio-Specific Diagnostics */}
            {mediaType === "AUDIO" && (
              <>
                <div className="flex justify-between text-zinc-400">
                  <span>Speech Windows:</span>
                  <span className="text-purple-400 font-bold">{report?.diagnostics?.numberOfWindows ?? "N/A"}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Audio Duration:</span>
                  <span className="text-white">{report?.diagnostics?.duration || report?.file?.duration || "N/A"}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Sample Rate & Channels:</span>
                  <span className="text-white">{report?.diagnostics?.sampleRate ? `${report.diagnostics.sampleRate} Hz (${report.diagnostics.channels || 1} ch)` : "N/A"}</span>
                </div>
              </>
            )}

            {/* Image-Specific Diagnostics */}
            {mediaType === "IMAGE" && (
              <>
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
              </>
            )}
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
                title={report?.sha256 || report?.file?.sha256 || report?.fileHash}
              >
                {report?.sha256 || report?.file?.sha256 || report?.fileHash || "Unavailable"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Provider:</span>
              <span className="text-white font-bold">{report?.provider || "SecureLens Detector"}</span>
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
              <span>Model Architecture:</span>
              <span className="text-white font-mono truncate max-w-[150px]" title={report?.model}>{report?.model || "genai,deepfake"}</span>
            </div>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileCheck,
  Zap,
  X,
  File,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { useScan } from "../../hooks/useScan";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { formatBytes } from "../../utils/helpers";
import { PageTransition } from "../../components/Common/PageTransition";

export const Upload = () => {
  const navigate = useNavigate();
  const { runScan, isScanning, scanProgress, validateFile, validationError, statusMessage } = useScan();

  const [selectedMediaType, setSelectedMediaType] = useState("IMAGE");
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleProcessFile = (rawFile) => {
    setLocalError(null);
    if (!rawFile) return;

    // Detect media category from rawFile type
    let category = "IMAGE";
    if (rawFile.type.startsWith("video/")) category = "VIDEO";
    if (rawFile.type.startsWith("audio/")) category = "AUDIO";

    setSelectedMediaType(category);

    const isValid = validateFile(rawFile, category);
    if (!isValid) {
      setLocalError("Validation failed. File exceeds allowed limits (Image: 15MB, Video: 100MB, Audio: 50MB).");
      return;
    }

    setFile({
      rawFile,
      name: rawFile.name,
      size: rawFile.size,
      type: rawFile.type || category,
      previewUrl: rawFile.type.startsWith("image/") ? URL.createObjectURL(rawFile) : null
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file || isScanning) return;
    try {
      const report = await runScan({
        file: file.rawFile,
        fileName: file.name,
        fileType: selectedMediaType
      });
      navigate(`/dashboard/analysis/${report.id || report.analysisId}`);
    } catch (err) {
      setLocalError(err.message || "Failed to start media analysis.");
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="cyan">DEEPFAKE MEDIA VERIFIER</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Your Media
        </h1>
        <p className="text-sm text-zinc-400">
          Upload an image, video, or audio file to analyze it for signs of AI-generated or manipulated content.
        </p>
      </div>

      {/* Error Callout */}
      {(localError || validationError) && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-sm text-rose-400">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Media Analysis Alert</span>
          </div>
          <p className="text-zinc-300 font-sans leading-relaxed">
            {localError || validationError}
          </p>
          <div className="pt-1 flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStartAnalysis}
              disabled={!file || isScanning}
            >
              Retry Analysis
            </Button>
            <button
              onClick={() => setLocalError(null)}
              className="text-xs text-zinc-400 hover:text-white underline transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Primary Upload Card */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-8 sm:p-12">
        <div
          role="region"
          aria-label="Media drop zone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[20px] p-10 sm:p-14 text-center transition-all ${
            isDragOver
              ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
              : "border-zinc-800 bg-zinc-950/60 hover:border-blue-500/40 hover:bg-zinc-900/60"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="sr-only"
            accept="image/*,video/*,audio/*"
            aria-label="Choose media file to upload"
          />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/10"
          >
            <UploadCloud className="w-8 h-8" />
          </motion.div>

          <h3 className="text-xl font-bold text-white mb-1">
            Upload Media
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            Drag & Drop your file here or click browse below.
          </p>

          <label
            htmlFor="file-upload"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                document.getElementById("file-upload")?.click();
              }
            }}
            className="cursor-pointer inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-xl"
          >
            <Button variant="secondary" size="md" icon={File} className="pointer-events-none">
              Browse Files
            </Button>
          </label>

          <div className="mt-6 pt-6 border-t border-zinc-900 text-xs text-zinc-500 font-mono flex items-center justify-center space-x-4">
            <span>Supported: Images • Videos • Audio</span>
            <span>•</span>
            <span>Max: 100MB</span>
          </div>
        </div>

        {/* Selected File Card */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3">
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt="Attached File Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-700 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-xs font-mono text-zinc-400">{formatBytes(file.size)} • {file.type}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                READY FOR ANALYSIS
              </span>
              <button
                onClick={() => setFile(null)}
                aria-label="Remove attached file"
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Remove File"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Analyze Media Button */}
        <div className="mt-8">
          <Button
            variant="primary"
            size="lg"
            loading={isScanning}
            icon={Zap}
            onClick={handleStartAnalysis}
            className="w-full text-base"
            disabled={!file || isScanning}
          >
            {isScanning ? (statusMessage || "Analyzing media with Sightengine models...") : "Analyze Media"}
          </Button>
        </div>
      </Card>
    </PageTransition>
  );
};

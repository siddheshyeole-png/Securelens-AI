import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Video,
  FileAudio,
  ArrowRight,
  Zap,
  Terminal,
  FileText
} from "lucide-react";
import { Hero } from "../../components/Hero/Hero";
import { Features } from "../../components/Features/Features";
import { HowItWorks } from "../../components/HowItWorks/HowItWorks";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { PageTransition } from "../../components/Common/PageTransition";


export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("image");

  const capabilities = [
    {
      id: "image",
      title: "Image Forensics & GAN Detection",
      icon: ImageIcon,
      description: "Inspects Error Level Analysis (ELA) residuals, Fourier transform grid anomalies, and pupil reflection vectors.",
      metrics: "Image Formats: JPG, PNG, WEBP, TIFF",
      sampleFinding: "GAN Diffusion Lattice detected at 128px Fourier spatial frequency (94.2% Synthetic Confidence)"
    },
    {
      id: "video",
      title: "Video Stream & Face-Swap Inspection",
      icon: Video,
      description: "Frame-by-frame 3D facial landmark mesh tracking, temporal boundary blending, and lip-sync alignment verification.",
      metrics: "Video Formats: MP4, MOV, AVI (up to 4K UHD)",
      sampleFinding: "Facial mesh alignment verified authentic across 300 sequential keyframes (99.8% Authentic)"
    },
    {
      id: "audio",
      title: "Audio Spectral Voice Clone FFT",
      icon: FileAudio,
      description: "Analyzes vocal formant frequency harmonics, phase discontinuities, zero-shot voice synthesis, and noise floor drops.",
      metrics: "Audio Formats: WAV, MP3, AAC, FLAC",
      sampleFinding: "Synthesizer phase jump detected at phoneme transitions (96.8% Synthetic Voice)"
    }
  ];

  return (
    <PageTransition className="space-y-12 pb-16 bg-[#09090B]">
      {/* Hero Section */}
      <Hero />

      {/* 6 Feature Cards Section */}
      <Features />

      {/* How It Works Timeline Section */}
      <HowItWorks />

      {/* Live Metrics Ticker Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-2xl text-zinc-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="pt-2 md:pt-0">
              <p className="text-xs font-mono text-zinc-400 uppercase font-semibold">Total Media Analyzed</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono mt-1">
                1,400+
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-xs font-mono text-zinc-400 uppercase font-semibold">Deepfakes Detected</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono mt-1">
                140
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-xs font-mono text-zinc-400 uppercase font-semibold">Authentic Media</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                1,260
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-xs font-mono text-zinc-400 uppercase font-semibold">Average Confidence</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono mt-1">
                97.2%
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Capabilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="cyan">DEEPFAKE DETECTION ENGINE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Multi-Modal Media Forensics
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Engineered to analyze images, video streams, audio recordings, and structural EXIF metadata in a unified diagnostic console.
          </p>
        </div>

        {/* Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            const isSelected = activeTab === cap.id;
            return (
              <Card
                key={cap.id}
                onClick={() => setActiveTab(cap.id)}
                className={`cursor-pointer transition-all ${
                  isSelected ? "border-blue-500/80 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/15" : "border-zinc-800"
                }`}
              >
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 w-fit mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{cap.description}</p>
                <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-blue-400 font-semibold flex items-center justify-between">
                  <span>{cap.metrics}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live Audit Preview Box */}
        <div className="mt-8 p-6 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">
                Live Forensic Inspection: {capabilities.find((c) => c.id === activeTab)?.title}
              </span>
            </div>
            <Button size="sm" variant="outline" icon={FileText} onClick={() => navigate("/upload")}>
              Analyze Your Media
            </Button>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 space-y-2 border border-zinc-800">
            <div className="text-blue-400">[FORENSICS] Deepfake Classification Pipeline Attached.</div>
            <div className="text-rose-400 font-semibold">
              [ANALYSIS] {capabilities.find((c) => c.id === activeTab)?.sampleFinding}
            </div>
            <div className="text-zinc-400">[VERDICT] Diagnostic evidence cataloged into verification report certificate.</div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-8 sm:p-12 text-center shadow-xl shadow-blue-500/20 border border-blue-400/30"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Verify Digital Media Authenticity Today
            </h2>
            <p className="text-sm text-blue-100">
              Upload images, videos, or audio recordings to detect AI generation, face-swaps, and digital tampering in real time.
            </p>
            <div className="pt-4 flex justify-center space-x-4">
              <Button
                size="lg"
                variant="secondary"
                icon={Zap}
                onClick={() => navigate("/upload")}
                className="bg-white text-blue-600 hover:bg-zinc-100 border-0 shadow-md"
              >
                Upload Media
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/about")}
                className="text-white border-white/40 hover:bg-white/10 hover:border-white"
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
};

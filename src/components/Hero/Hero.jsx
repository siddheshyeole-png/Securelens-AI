import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, UploadCloud, ArrowRight, Cpu, Sparkles, CheckCircle2, Video, FileAudio } from "lucide-react";
import { Button } from "../Common/Button";
import { InteractiveScanner } from "./InteractiveScanner";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 aurora-bg">
      {/* Background Soft Mesh Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-transparent rounded-full blur-[160px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-blue-400 text-xs font-mono font-semibold shadow-xl backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>NEXT-GEN AI DEEPFAKE DETECTION ENGINE</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              Detect Deepfakes <br className="hidden sm:block" />
              <span className="text-gradient-linear">Before They Deceive.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              AI-powered platform that verifies images, videos and audio using advanced deep learning, digital forensics and metadata analysis.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Button
                variant="primary"
                size="lg"
                icon={UploadCloud}
                onClick={() => navigate("/upload")}
                className="w-full sm:w-auto text-base"
              >
                Start Detection
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={ArrowRight}
                onClick={() => navigate("/about")}
                className="w-full sm:w-auto text-base"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Support Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-mono text-zinc-400"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Image Forensics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Video Stream Audit</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Voice Spectral FFT</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive AI Facial Mesh Scanner */}
          <div className="lg:col-span-6 relative">
            <InteractiveScanner />
          </div>
        </div>

        {/* Statistics Cards Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-xl flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white font-mono">99.2%</h3>
              <p className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">Detection Accuracy</p>
            </div>
          </div>

          <div className="p-6 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-xl flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Video className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white font-mono">50K+</h3>
              <p className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">Media Verified</p>
            </div>
          </div>

          <div className="p-6 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-xl flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white font-mono">AI Powered</h3>
              <p className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">Real-Time Forensics</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

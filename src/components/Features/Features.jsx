import React from "react";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  FileAudio,
  Binary,
  BarChart3,
  FileCheck2,
  ArrowRight
} from "lucide-react";
import { Card } from "../Common/Card";
import { Badge } from "../Common/Badge";

export const Features = () => {
  const featuresList = [
    {
      id: "image",
      title: "Image Detection",
      icon: Image,
      iconBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      description: "Inspect pixel-level compression anomalies, GAN artifacts, facial manipulation boundaries, and synthetic texture patterns."
    },
    {
      id: "video",
      title: "Video Detection",
      icon: Video,
      iconBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      description: "Frame-by-frame temporal consistency verification, facial landmark tracking, and lip-sync mismatch analysis."
    },
    {
      id: "audio",
      title: "Audio Detection",
      icon: FileAudio,
      iconBg: "bg-violet-500/10 border-violet-500/30 text-violet-400",
      description: "Spectral voice frequency analysis, voice-cloning acoustic artifacts, and synthetic vocal cadence detection."
    },
    {
      id: "metadata",
      title: "Metadata Analysis",
      icon: Binary,
      iconBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      description: "Exif data integrity audit, camera hardware signature verification, software encoding traces, and timestamp validation."
    },
    {
      id: "score",
      title: "AI Confidence Score",
      icon: BarChart3,
      iconBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      description: "Probabilistic deep learning risk rating with detailed breakdown of authenticity confidence scores and risk factors."
    },
    {
      id: "report",
      title: "Detailed Verification Report",
      icon: FileCheck2,
      iconBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      description: "Exportable forensic diagnostic report with heatmap overlays, timeline analysis, and compliance verification evidence."
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#09090B] relative particle-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan">CORE AI FORENSIC MODULES</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Comprehensive Deepfake Analysis Engine
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Multi-modal verification suite designed to detect synthetic media across images, videos, audio recordings, and structural metadata.
          </p>
        </div>

        {/* 6 Features Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card
                  hover={true}
                  className="h-full rounded-[20px] bg-[#18181B]/80 backdrop-blur-xl border border-zinc-800 p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group text-zinc-100"
                >
                  <div className="space-y-4">
                    {/* Modern Icon */}
                    <div className={`w-14 h-14 rounded-2xl border ${feature.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono font-semibold text-blue-400">
                    <span className="uppercase tracking-wider">Inspect Capabilities</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

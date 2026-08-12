import React from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Cpu,
  ShieldAlert,
  FileCheck2,
  ArrowDown
} from "lucide-react";
import { Card } from "../Common/Card";
import { Badge } from "../Common/Badge";

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Media",
      icon: UploadCloud,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      description: "Drag & drop image files, video streams, or audio recordings into our secure client-side sandbox."
    },
    {
      number: "02",
      title: "AI Analysis",
      icon: Cpu,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      description: "Multi-layered neural network inspects compression artifacts, spectral frequencies, and metadata signatures."
    },
    {
      number: "03",
      title: "Deepfake Detection",
      icon: ShieldAlert,
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
      iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/30",
      description: "Deep learning models score face-swaps, synthetic voice prints, and generative adversarial manipulation."
    },
    {
      number: "04",
      title: "Verification Report",
      icon: FileCheck2,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description: "Receive an instant authenticity score, detailed evidence heatmaps, and exportable forensic certificates."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#09090B] relative border-t border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <Badge variant="cyan">SIMPLE 4-STEP PROCESS</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How SecureLens AI Works
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Automated deepfake detection pipeline powered by advanced neural forensics and real-time metadata verification.
          </p>
        </div>

        {/* Timeline Grid Layout */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 -translate-y-6 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="w-full h-full"
                  >
                    <Card
                      hover={true}
                      className="h-full rounded-[20px] bg-[#18181B]/80 border border-zinc-800 p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between text-zinc-100"
                    >
                      <div>
                        {/* Step Badge & Icon */}
                        <div className="flex items-center justify-between mb-6">
                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${step.badgeColor}`}>
                            STEP {step.number}
                          </span>
                          <div className={`p-3 rounded-2xl border ${step.iconColor}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-3">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Flow Arrow Indicator (Mobile/Tablet vertical) */}
                  {index < steps.length - 1 && (
                    <div className="my-4 lg:hidden text-blue-400">
                      <ArrowDown className="w-6 h-6 animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

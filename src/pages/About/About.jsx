import React from "react";
import { Terminal, Shield, Eye, Cpu, BarChart3, FileCheck2, UploadCloud } from "lucide-react";
import { Card } from "../../components/Common/Card";
import { Badge } from "../../components/Common/Badge";
import { MOCK_TEAM } from "../../data/mockDashboard";
import { PageTransition } from "../../components/Common/PageTransition";

export const About = () => {
  const steps = [
    {
      step: "01",
      title: "Media Ingestion",
      icon: UploadCloud,
      description: "Upload image, video stream, or audio recording into client-side sandboxed preprocessing memory."
    },
    {
      step: "02",
      title: "Forensic Analysis",
      icon: Eye,
      description: "Error Level Analysis (ELA), frequency domain Fourier transforms, EXIF tag validation, and acoustic FFT spectral extraction."
    },
    {
      step: "03",
      title: "AI Detection",
      icon: Cpu,
      description: "Multi-modal neural network models score face-swaps, GAN diffusion grid patterns, and neural voice synthesis signatures."
    },
    {
      step: "04",
      title: "Confidence Scoring",
      icon: BarChart3,
      description: "Probabilistic risk calculation generating authenticity confidence ratings (e.g. 99.8% REAL vs 94.2% SYNTHETIC)."
    },
    {
      step: "05",
      title: "Verification Report",
      icon: FileCheck2,
      description: "Exportable diagnostic certificate with timestamped evidence heatmaps, metadata signatures, and SHA-256 checksums."
    }
  ];

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8 text-zinc-100 bg-[#09090B]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="cyan">DIGITAL MEDIA AUTHENTICITY</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Building Trust in the Age of Generative AI
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
          Generative AI technologies have made it increasingly difficult to distinguish authentic photographs, video footage, and voice recordings from synthetic or altered media.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          <strong className="text-white">SecureLens AI</strong> is designed to restore clarity by analyzing digital media for subtle signs of AI generation and deepfake manipulation through neural classification, digital forensics, metadata inspection, and confidence scoring.
        </p>
      </div>

      {/* How SecureLens AI Works Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">How SecureLens AI Works</h2>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Five-stage automated verification pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} hover={true} className="p-6 bg-[#18181B]/80 border-zinc-800 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 inline-block mb-4">
                    STAGE {s.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Research Team Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">AI Forensics Research Team</h2>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Pioneering synthetic media detection & computer vision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TEAM.map((member) => (
            <Card key={member.name} hover={true} className="text-center bg-[#18181B]/80 border-zinc-800 p-6">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-500/40 mb-4 shadow-lg"
              />
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-xs font-mono text-blue-400 font-semibold mb-2">{member.role}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{member.bio}</p>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

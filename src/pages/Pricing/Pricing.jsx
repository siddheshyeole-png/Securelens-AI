import React from "react";
import { Check, Zap, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { PageTransition } from "../../components/Common/PageTransition";

export const Pricing = () => {
  const plans = [
    {
      name: "Starter Forensic",
      price: "$0",
      period: "Free Tier",
      description: "Ideal for individual journalists, researchers, and quick media verification.",
      features: [
        "Up to 25 Media Scans / Month",
        "Image & Audio Deepfake Analysis",
        "Standard Metadata EXIF Inspection",
        "Basic Verification Certificates"
      ],
      cta: "Get Started Free",
      highlight: false
    },
    {
      name: "Pro Forensics",
      price: "$49",
      period: "/ analyst / month",
      description: "Designed for newsrooms, legal teams, and security analysts requiring high-resolution video audits.",
      features: [
        "Unlimited Media Scans",
        "4K Video Stream Keyframe Analysis",
        "Spectrogram Voice Clone FFT",
        "AI Confidence Score Heatmaps",
        "Exportable PDF Verification Reports",
        "Priority Detection Pipeline"
      ],
      cta: "Start Pro Trial",
      highlight: true
    },
    {
      name: "Enterprise SLA",
      price: "Custom",
      period: "Contact Sales",
      description: "Custom deployment, API access, and dedicated deepfake detection SLA guarantees.",
      features: [
        "API Integration Access",
        "On-Premises / Air-Gapped Sandbox",
        "Custom Neural Detector Training",
        "C2PA Digital Provenance Engine",
        "Dedicated Forensic Specialist Support",
        "Unlimited Analyst Seats"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-12 py-16 px-4 sm:px-6 lg:px-8 text-zinc-100 bg-[#09090B]">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="cyan">TRANSPARENT PRICING</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Flexible Plans for Media Integrity
        </h1>
        <p className="text-base text-zinc-400">
          Transparent forensic verification plans tailored for independent researchers, news organizations, and enterprise platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            hover={true}
            className={`p-8 bg-[#18181B]/80 border flex flex-col justify-between relative ${
              plan.highlight
                ? "border-blue-500 ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/20 scale-105 z-10"
                : "border-zinc-800"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/40">
                MOST POPULAR
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline space-x-1 font-mono">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-zinc-400">{plan.period}</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center space-x-3 text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link to="/login" className="block w-full">
                <Button
                  variant={plan.highlight ? "primary" : "secondary"}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PageTransition>
  );
};

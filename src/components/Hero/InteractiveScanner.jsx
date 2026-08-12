import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Scan, CheckCircle2, ShieldCheck, Activity, Eye } from "lucide-react";

export const InteractiveScanner = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeNode, setActiveNode] = useState(2);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePos({ x, y });
  };

  // Facial Landmark Mesh Coordinates
  const nodes = [
    { id: 1, cx: 35, cy: 35, label: "Left Eye Viseme" },
    { id: 2, cx: 65, cy: 35, label: "Right Eye Viseme" },
    { id: 3, cx: 50, cy: 50, label: "Nasal Apex" },
    { id: 4, cx: 40, cy: 68, label: "Left LipViseme" },
    { id: 5, cx: 60, cy: 68, label: "Right LipViseme" },
    { id: 6, cx: 50, cy: 75, label: "Jaw Boundary" }
  ];

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{
        rotateX: -mousePos.y,
        rotateY: mousePos.x,
        transformStyle: "preserve-3d"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative rounded-[24px] border border-zinc-800 bg-[#18181B]/90 backdrop-blur-2xl p-5 shadow-2xl shadow-blue-500/10 text-zinc-100 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all"
    >
      {/* Visual Window Header Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-zinc-400">securelens-deepfake-analyzer.v2</span>
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/30">
          <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>NEURAL SCANNING</span>
        </div>
      </div>

      {/* Main Interactive Scan Canvas */}
      <div className="relative h-72 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
        {/* Sample Target Background */}
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
          alt="AI Detection Face Target"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />

        {/* Laser Scanline */}
        <div className="animate-scanline" />

        {/* SVG Face Mesh Nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Facial Mesh Lines */}
          <line x1="35" y1="35" x2="65" y2="35" stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="35" y1="35" x2="50" y2="50" stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="65" y1="35" x2="50" y2="50" stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="50" y1="50" x2="40" y2="68" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="50" y1="50" x2="60" y2="68" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="40" y1="68" x2="60" y2="68" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="40" y1="68" x2="50" y2="75" stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="1,1" />
          <line x1="60" y1="68" x2="50" y2="75" stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="1,1" />

          {/* Glowing Target Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="1.8"
                fill="#38bdf8"
                className="animate-ping opacity-75"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r="1.2"
                fill="#ffffff"
              />
            </g>
          ))}
        </svg>

        {/* Floating AI Confidence Badge */}
        <div className="absolute top-3 left-3 bg-zinc-900/90 text-blue-400 text-[11px] font-mono px-3 py-1.5 rounded-xl border border-blue-500/30 backdrop-blur-md flex items-center shadow-lg">
          <Eye className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
          <span>FACE-SWAP MESH: 0.002% ANOMALY</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-zinc-900/90 text-emerald-400 text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-md shadow-lg flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
          <span>99.8% AUTHENTIC REAL</span>
        </div>
      </div>

      {/* Bottom Neural Net Live Log Bar */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">CLASSIFIER LATENCY</span>
          <span className="text-blue-400 font-semibold truncate block">0.02ms / Keyframe</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">GAN DIFFUSION ARTIFACTS</span>
          <span className="text-emerald-400 font-bold text-xs truncate block">ZERO DETECTED</span>
        </div>
      </div>
    </motion.div>
  );
};

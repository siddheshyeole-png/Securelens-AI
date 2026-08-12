import React from "react";
import { motion } from "framer-motion";

export const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30"
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 rounded-[16px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-xl shadow-black/40 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)] transition-all relative overflow-hidden text-zinc-100"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-zinc-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">{value}</h4>
        {change && (
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
              change.startsWith("+")
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : change.startsWith("-")
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
};

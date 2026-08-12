import React from "react";
import { SEVERITY_LEVELS } from "../../utils/constants";

export const Badge = ({ children, variant = "default", severity, className = "" }) => {
  if (severity) {
    const sevUpper = severity.toUpperCase();
    const severityStyles = {
      CRITICAL: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      HIGH: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      LOW: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      INFO: "bg-zinc-800 text-zinc-300 border-zinc-700"
    };

    const dotColors = {
      CRITICAL: "bg-rose-500",
      HIGH: "bg-amber-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-blue-500",
      INFO: "bg-zinc-400"
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
          severityStyles[sevUpper] || severityStyles.INFO
        } ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[sevUpper] || "bg-zinc-400"} mr-1.5 animate-pulse`} />
        {sevUpper}
      </span>
    );
  }

  const variants = {
    default: "bg-zinc-900 text-zinc-300 border-zinc-800",
    cyan: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30"
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

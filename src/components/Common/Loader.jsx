import React from "react";
import { ShieldAlert } from "lucide-react";

export const Loader = ({ text = "Analyzing Security Metrics..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
        <ShieldAlert className="w-7 h-7 text-blue-600 absolute animate-pulse" />
      </div>
      <p className="text-sm font-mono text-blue-600 animate-pulse font-medium">{text}</p>
    </div>
  );
};

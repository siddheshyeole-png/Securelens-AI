import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { APP_NAME } from "../utils/constants";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#09090B] aurora-bg relative overflow-hidden text-zinc-100">
      {/* Background soft mesh glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-blue-600/15 to-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-400/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <p className="text-xs font-mono text-zinc-400 mt-2 font-medium">SECURE ENTERPRISE AUTHENTICATION</p>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500 font-mono">
        Protected by SecureLens Zero-Trust Gateway & SOC2 Policy
      </div>
    </div>
  );
};

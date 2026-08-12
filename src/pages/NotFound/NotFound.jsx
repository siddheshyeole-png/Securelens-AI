import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "../../components/Common/Button";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6 text-zinc-100">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-black font-mono text-white tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-white">Security Route Not Found</h2>
      <p className="text-sm text-zinc-400 max-w-md font-normal">
        The target route or forensic report ID you requested does not exist or has been archived.
      </p>
      <Link to="/">
        <Button variant="primary" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

import React, { useState } from "react";
import { Settings as SettingsIcon, Bell, Shield, Eye, CheckCircle2, Cpu } from "lucide-react";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { PageTransition } from "../../components/Common/PageTransition";

export const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState("85%");

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B]">
      <div>
        <Badge variant="cyan">PLATFORM CONFIGURATION</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Forensic & Detection Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Configure deepfake classification sensitivity and automated report notifications.
        </p>
      </div>

      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-8 space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Platform settings saved!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>AI Classifier Sensitivity</span>
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Detection Risk Sensitivity Threshold</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Threshold score required to trigger DEEPFAKE DETECTED status</p>
              </div>
              <select
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="75%">75% Sensitivity (Standard)</option>
                <option value="85%">85% Sensitivity (High Precision)</option>
                <option value="95%">95% Sensitivity (Strict Forensic)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Automated ELA & Fourier Pre-Analysis</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Run Error Level Analysis immediately upon media file upload</p>
              </div>
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Notification Dispatches</span>
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Email Digest on Deepfake Detection</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Send instant email summary when a synthetic media asset is flagged</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </PageTransition>
  );
};

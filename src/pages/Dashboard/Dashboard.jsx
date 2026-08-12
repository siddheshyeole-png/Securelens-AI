import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpRight,
  Video,
  FileAudio,
  Image as ImageIcon,
  Activity,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useScan } from "../../hooks/useScan";
import { StatCard } from "../../components/Common/StatCard";
import { Button } from "../../components/Common/Button";
import { Card } from "../../components/Common/Card";
import { formatDate, getClassificationCategory, getVerdictBadgeInfo } from "../../utils/helpers";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scans, selectScanReport } = useScan();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Dynamic statistics calculated directly from authentic user reports
  const totalAnalyzed = scans.length;
  const deepfakesCount = scans.filter((s) => {
    const cat = getClassificationCategory(s.classification || s.verdict);
    return cat === "AI_GENERATED" || cat === "DEEPFAKE";
  }).length;

  const authenticCount = scans.filter((s) => {
    const cat = getClassificationCategory(s.classification || s.verdict);
    return cat === "AUTHENTIC";
  }).length;

  const inconclusiveCount = scans.filter((s) => {
    const cat = getClassificationCategory(s.classification || s.verdict);
    return cat === "UNCERTAIN";
  }).length;

  const avgConfidenceVal = totalAnalyzed > 0
    ? (scans.reduce((acc, s) => acc + (s.confidence || (s.aiProbability != null ? Math.max(s.aiProbability, 100 - s.aiProbability) : 90)), 0) / totalAnalyzed).toFixed(1)
    : "N/A";

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || scan.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 text-zinc-100">
      {/* Top Welcome Header Banner */}
      <div className="p-6 sm:p-8 rounded-[20px] bg-[#18181B]/80 border border-zinc-800 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">AI MEDIA FORENSICS DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {user?.name || "Analyst"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time media authenticity platform active. {deepfakesCount} synthetic media flag(s) out of {totalAnalyzed} audit record(s).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="primary" icon={UploadCloud} onClick={() => navigate("/dashboard/upload")}>
            Upload Media
          </Button>
          <Button variant="secondary" icon={FileText} onClick={() => navigate("/dashboard/reports")}>
            View Reports
          </Button>
        </div>
      </div>

      {/* 4 Statistics Cards (Calculated from user records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Media Analyzed"
          value={totalAnalyzed.toLocaleString()}
          change="User Database Total"
          icon={UploadCloud}
          color="blue"
        />
        <StatCard
          title="Synthetic / AI Flagged"
          value={deepfakesCount.toLocaleString()}
          change={`${((deepfakesCount / (totalAnalyzed || 1)) * 100).toFixed(1)}% detection rate`}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Authentic Media"
          value={authenticCount.toLocaleString()}
          change="Verified Real"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Average Confidence"
          value={avgConfidenceVal !== "N/A" ? `${avgConfidenceVal}%` : "N/A"}
          change={inconclusiveCount > 0 ? `${inconclusiveCount} uncertain` : "High Precision"}
          icon={Activity}
          color="indigo"
        />
      </div>

      {/* Recent Verification Reports Table Section */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>User Verification Audit Logs</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time deepfake detection audit logs and SHA-256 verified reports</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Type Selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">All Media Types</option>
              <option value="IMAGE">IMAGE</option>
              <option value="VIDEO">VIDEO</option>
              <option value="AUDIO">AUDIO</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Media File</th>
                <th className="py-3.5 px-4">Media Type</th>
                <th className="py-3.5 px-4">Detection Result</th>
                <th className="py-3.5 px-4">AI Confidence</th>
                <th className="py-3.5 px-4">Analysis Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-sans">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-mono text-xs">
                    No verification records found for this account.
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan) => {
                  const badge = getVerdictBadgeInfo(scan.classification || scan.verdict);
                  const aiPct = scan.percentages?.aiGenerated ?? scan.aiProbability ?? (scan.aiScore != null ? Math.round(scan.aiScore * 100) : null);

                  return (
                    <tr key={scan.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-4 px-4 font-semibold text-blue-400 font-mono">{scan.id}</td>
                      <td className="py-4 px-4 font-medium text-white max-w-[180px] truncate">{scan.target}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-semibold">
                          {scan.type === "IMAGE" ? (
                            <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                          ) : scan.type === "AUDIO" ? (
                            <FileAudio className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
                          ) : (
                            <Video className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                          )}
                          {scan.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bgClass}`}>
                          {badge.category === "AI_GENERATED" || badge.category === "DEEPFAKE" ? (
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          ) : badge.category === "UNCERTAIN" ? (
                            <HelpCircle className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          )}
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold">
                        <span className={
                          badge.category === "AI_GENERATED" || badge.category === "DEEPFAKE"
                            ? "text-rose-400"
                            : badge.category === "UNCERTAIN"
                            ? "text-yellow-400"
                            : "text-emerald-400"
                        }>
                          {aiPct != null ? `${aiPct}% AI` : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 text-xs">{formatDate(scan.timestamp)}</td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ArrowUpRight}
                          onClick={() => {
                            selectScanReport(scan.id);
                            navigate(`/dashboard/reports/${scan.id}`);
                          }}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

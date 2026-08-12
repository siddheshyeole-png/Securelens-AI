import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Search,
  ArrowUpRight,
  Video,
  FileAudio,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Filter,
  ArrowUpDown,
  Trash2
} from "lucide-react";
import { useScan } from "../../hooks/useScan";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { formatDate, getClassificationCategory, getVerdictBadgeInfo } from "../../utils/helpers";
import { PageTransition } from "../../components/Common/PageTransition";

export const History = () => {
  const navigate = useNavigate();
  const { scans, selectScanReport, deleteScanReport } = useScan();

  const [searchTerm, setSearchTerm] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("ALL");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredScans = scans
    .filter((scan) => {
      const matchesSearch =
        scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = mediaTypeFilter === "ALL" || scan.type === mediaTypeFilter;
      
      const cat = getClassificationCategory(scan.classification || scan.verdict);
      const matchesResult =
        resultFilter === "ALL" ||
        (resultFilter === "DEEPFAKE DETECTED" && (cat === "AI_GENERATED" || cat === "DEEPFAKE")) ||
        (resultFilter === "LIKELY AUTHENTIC" && cat === "AUTHENTIC") ||
        (resultFilter === "INCONCLUSIVE" && cat === "UNCERTAIN");

      return matchesSearch && matchesType && matchesResult;
    })
    .sort((a, b) => {
      if (sortOrder === "confidence") {
        return (b.confidence || b.riskScore || 0) - (a.confidence || a.riskScore || 0);
      }
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16 text-zinc-100 bg-[#09090B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="cyan">FORENSIC ARCHIVE</Badge>
            <span className="text-xs text-zinc-400 font-mono">{filteredScans.length} Reports Found</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Media Verification History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Search, filter, manage, and audit past deepfake detection reports and authenticity verification logs.
          </p>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-400 shrink-0" />
            <select
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">All Media Types</option>
              <option value="IMAGE">IMAGE</option>
              <option value="VIDEO">VIDEO</option>
              <option value="AUDIO">AUDIO</option>
            </select>
          </div>

          {/* Result Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-purple-400 shrink-0" />
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">All Detection Results</option>
              <option value="DEEPFAKE DETECTED">SYNTHETIC / AI DETECTED</option>
              <option value="LIKELY AUTHENTIC">LIKELY AUTHENTIC</option>
              <option value="INCONCLUSIVE">UNCERTAIN / INCONCLUSIVE</option>
            </select>
          </div>

          {/* Date / Confidence Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="newest">Sort by Date: Newest First</option>
              <option value="oldest">Sort by Date: Oldest First</option>
              <option value="confidence">Sort by Confidence Score</option>
            </select>
          </div>
        </div>
      </Card>

      {/* History Reports Table */}
      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Media File</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Detection Result</th>
                <th className="py-3.5 px-4">AI Score</th>
                <th className="py-3.5 px-4">Analysis Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-sans">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    No verification reports match your current search and filter criteria.
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
                      <td className="py-4 px-4 font-mono text-zinc-400 text-xs">
                        {scan.fileSize ? `${(scan.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
                      </td>
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
                      <td className="py-4 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ArrowUpRight}
                          onClick={() => {
                            selectScanReport(scan.id);
                            navigate(`/dashboard/reports/${scan.id}`);
                          }}
                        >
                          View
                        </Button>
                        <button
                          onClick={() => deleteScanReport(scan.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  );
};

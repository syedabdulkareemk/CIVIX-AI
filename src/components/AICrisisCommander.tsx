import React from "react";
import { motion } from "motion/react";
import { Sparkles, ShieldAlert, ArrowUpRight, Activity, Cpu, Server, Radio } from "lucide-react";
import { Issue, Cluster } from "../types";

interface AICrisisCommanderProps {
  issues: Issue[];
  clusters: Cluster[];
  onNavigateToReport: () => void;
  onOpenRegistry: () => void;
}

export default function AICrisisCommander({
  issues,
  clusters,
  onNavigateToReport,
  onOpenRegistry,
}: AICrisisCommanderProps) {
  const activeIssues = issues.filter((i) => i.status !== "Resolved");
  const criticalCount = activeIssues.filter((i) => i.severity === "Critical").length;
  const escalatedCount = activeIssues.filter((i) => i.status === "Escalated").length;

  // Determine current Risk Level
  let riskLevel = "MUTED";
  let riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (criticalCount > 2 || escalatedCount > 1) {
    riskLevel = "CRITICAL";
    riskColor = "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse";
  } else if (criticalCount > 0 || escalatedCount > 0) {
    riskLevel = "ELEVATED";
    riskColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0b0b0d] border border-zinc-800/60 rounded-2xl p-5 relative overflow-hidden shadow-2xl"
    >
      {/* Decorative ambient background mesh */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
        
        {/* Left Console: Status & Identity */}
        <div className="flex flex-col justify-between space-y-3 lg:max-w-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase">
                AI Operations Center
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#ededed] tracking-tight font-sans mt-1">
              Crisis Commander Node
            </h2>
            <p className="text-[11px] text-zinc-400 leading-normal font-sans mt-0.5">
              Automated spatiotemporal clustering and citizen-consensus validation layers actively online.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-300">SYSTEM: ONLINE</span>
            </div>
            <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-xl ${riskColor}`}>
              <ShieldAlert className="h-3 w-3" />
              <span className="text-[10px] font-mono font-bold">RISK: {riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Middle Console: Telemetry Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#060608]/80 border border-zinc-900/50 p-4 rounded-xl items-center">
          
          {/* Metric 1 */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-1 text-zinc-500">
              <Activity className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Alerts</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-sans text-zinc-100">{activeIssues.length}</span>
              <span className="text-[9px] text-zinc-500 font-mono">active</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500" 
                style={{ width: `${Math.min(100, (activeIssues.length / (issues.length || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-1 text-zinc-500">
              <Cpu className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">AI Clusters</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-sans text-teal-400">{clusters.length}</span>
              <span className="text-[9px] text-zinc-500 font-mono">grouped</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400" style={{ width: "65%" }} />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-1 text-zinc-500">
              <Server className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Escalated</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-sans text-amber-400">{escalatedCount}</span>
              <span className="text-[9px] text-zinc-500 font-mono">flagged</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400" 
                style={{ width: `${Math.min(100, (escalatedCount / (activeIssues.length || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-1 text-zinc-500">
              <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider">AI Confidence</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-sans text-blue-400">94.8%</span>
              <span className="text-[9px] text-zinc-500 font-mono">avg</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: "94.8%" }} />
            </div>
          </div>

        </div>

        {/* Right Console: Quick Control Panel */}
        <div className="flex flex-row lg:flex-col justify-center lg:justify-between gap-3 lg:min-w-[180px]">
          <button
            type="button"
            id="file-disruption-btn-banner"
            onClick={onNavigateToReport}
            className="flex-1 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.25)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-teal-400/30"
          >
            File Disruption
            <ArrowUpRight className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={onOpenRegistry}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs px-4 py-3 rounded-xl border border-zinc-800 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            📋 Registry Logs
          </button>
        </div>

      </div>
    </motion.div>
  );
}

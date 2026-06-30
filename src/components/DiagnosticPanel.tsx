import React from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DiagnosticPanelProps {
  isFallback: boolean;
  diagnostics?: {
    error: string;
    code: string;
    model: string;
    timestamp: string;
  };
}

export default function DiagnosticPanel({ isFallback, diagnostics }: DiagnosticPanelProps) {
  if (!isFallback) return null;

  return (
    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 mt-4 space-y-2">
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-bold">AI Analysis Service Error</span>
      </div>
      
      {diagnostics && (
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
          <div><span className="text-zinc-600">Model:</span> {diagnostics.model}</div>
          <div><span className="text-zinc-600">Code:</span> {diagnostics.code}</div>
          <div className="col-span-2"><span className="text-zinc-600">Error:</span> {diagnostics.error}</div>
          <div className="col-span-2"><span className="text-zinc-600">Time:</span> {diagnostics.timestamp}</div>
        </div>
      )}
      
      <p className="text-[11px] text-zinc-500 mt-2">
        Gemini analysis failed and the system reverted to deterministic local fallback rules.
      </p>
    </div>
  );
}

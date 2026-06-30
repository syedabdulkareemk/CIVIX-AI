import React from "react";
import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";

interface RejectionModalProps {
  reason: string;
  details?: string;
  onClose: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({ reason, details, onClose }) => {
  return (
    <div className="fixed inset-0 z-[201] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0f0f11] w-full max-w-sm rounded-2xl shadow-2xl border border-red-900/30 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Verification Rejected</h3>
          <p className="text-sm text-zinc-400 mb-6">{reason}</p>
          {details && (
            <div className="bg-[#19191d] p-4 rounded-xl w-full text-left">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Details</p>
              <p className="text-xs text-zinc-300 font-mono">{details}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#1f1f21] flex bg-[#111113]">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors text-xs uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
};

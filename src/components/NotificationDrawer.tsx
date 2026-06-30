import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Bell, 
  Waves, 
  AlertTriangle, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Check, 
  MessageSquareOff,
  Flame,
  Compass,
  Key,
  Trophy,
  Activity,
  UserPlus
} from "lucide-react";
import { NotificationItem } from "../lib/firebase";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectIssue?: (issueId: string) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectIssue
}: NotificationDrawerProps) {
  
  const getIcon = (item: NotificationItem) => {
    switch (item.type) {
      case "critical":
        return <Flame className="h-4.5 w-4.5 text-red-400" />;
      case "mission":
        return <Compass className="h-4.5 w-4.5 text-blue-400" />;
      case "verification":
        return <Key className="h-4.5 w-4.5 text-amber-400" />;
      case "rank":
        return <Trophy className="h-4.5 w-4.5 text-emerald-400" />;
      case "activity":
        return <Activity className="h-4.5 w-4.5 text-teal-400" />;
      case "nearby":
        return <MapPin className="h-4.5 w-4.5 text-orange-400" />;
      default:
        return <Check className="h-4.5 w-4.5 text-teal-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "critical": return "border-l-4 border-l-red-500";
      case "mission": return "border-l-4 border-l-blue-500";
      case "verification": return "border-l-4 border-l-amber-500";
      case "rank": return "border-l-4 border-l-emerald-500";
      case "nearby": return "border-l-4 border-l-orange-500";
      default: return "border-l-4 border-l-teal-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#050505]/60 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0f11] border-l border-[#1f1f21] shadow-2xl z-[160] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1f1f21] flex items-center justify-between bg-[#111113]">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-[#ededed]">Civic Alerts Network</h2>
                {notifications.some(n => n.unread) && (
                  <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold">
                    {notifications.filter(n => n.unread).length} New
                  </span>
                )}
              </div>
              
              <button 
                onClick={onClose}
                className="p-1 hover:bg-[#1f1f21] rounded-lg text-zinc-400 hover:text-zinc-100 transition"
                id="close-notifications-btn"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-b border-[#1f1f21] flex justify-between items-center text-[11px] bg-[#0c0c0e]">
              <button 
                onClick={onMarkAllAsRead}
                className="text-teal-400 hover:text-teal-300 font-mono transition"
                disabled={notifications.length === 0}
              >
                Mark all as read
              </button>
              <button 
                onClick={onClearAll}
                className="text-zinc-500 hover:text-red-400 font-mono transition"
                disabled={notifications.length === 0}
              >
                Clear all alerts
              </button>
            </div>

            {/* Notification content list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-2 text-zinc-500">
                  <div className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center">
                    <MessageSquareOff className="h-5 w-5 text-zinc-600" />
                  </div>
                  <p className="text-xs font-mono">No active community alerts</p>
                  <p className="text-[10px] text-zinc-650 max-w-xs">You will receive alerts here when potholes, leaks, and verification sweeps are reported in your vicinity.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (notif.issueId && onSelectIssue) {
                        onSelectIssue(notif.issueId);
                        onClose();
                      }
                    }}
                    className={`p-3 bg-[#0a0a0c] border border-[#1f1f21]/60 rounded-xl flex gap-3 transition cursor-pointer select-none hover:bg-[#121215] relative group ${getBorderColor(notif.type)} ${
                      notif.unread ? "bg-teal-950/5 border-teal-900/10" : ""
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {notif.unread && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-400" />
                    )}

                    {/* Left Icon Panel */}
                    <div className="h-8 w-8 rounded-lg bg-[#111113] border border-[#1f1f21] flex items-center justify-center flex-shrink-0">
                      {getIcon(notif)}
                    </div>

                    {/* Right text layout */}
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center justify-between pr-4">
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-[#ededed] transition">
                          {notif.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                        {notif.body}
                      </p>
                      
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-550 pt-1">
                        <span>{new Date(notif.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                        {notif.issueId && (
                          <span className="text-teal-400 group-hover:underline flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5 text-teal-400" /> View details
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Engagement Banner */}
            <div className="p-4 border-t border-[#1f1f21] bg-[#111113] text-center text-[10px] text-zinc-400 flex flex-col items-center gap-1">
              <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
              <p className="font-sans">AI Operations Agent is listening continuously</p>
              <p className="text-[9px] font-mono text-zinc-600">Sync cycle interval: Realtime Firestore socket stream</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

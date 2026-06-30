import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  Target, 
  Trophy, 
  X, 
  Compass,
  Bell,
  Sliders,
  Sparkles
} from "lucide-react";
import { Issue, UserProfile } from "../types";

export interface HyperlocalNotification {
  id: string;
  type: "verification_needed" | "critical_incident" | "repair_completed" | "nearby_mission" | "leaderboard_congrats";
  title: string;
  message: string;
  distance: number; // in meters
  points?: number;
  targetId?: string;
  timestamp: Date;
}

interface HyperlocalNotificationsProps {
  userLocation: { lat: number; lng: number } | null;
  userProfile: UserProfile | null;
  issues: Issue[];
  onActionClick: (type: string, targetId?: string) => void;
}

export default function HyperlocalNotifications({
  userLocation,
  userProfile,
  issues,
  onActionClick
}: HyperlocalNotificationsProps) {
  const [popups, setPopups] = useState<HyperlocalNotification[]>([]);
  const [gpsRadius, setGpsRadius] = useState<number | "National">(500); // default 500m
  const [showConfig, setShowConfig] = useState(false);
  const lastPopupTime = useRef<number>(0);
  const popupQueue = useRef<HyperlocalNotification[]>([]);
  const welcomeShownRef = useRef(false);

  // Sound play helper (subtle aesthetic pop sound using browser web audio api)
  const playPopupSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // safe fallback if audio context blocked
    }
  };

  // Safe notification registration
  const addNotificationToQueue = (notif: HyperlocalNotification) => {
    // Distance filter
    if (gpsRadius !== "National" && notif.distance > gpsRadius) {
      console.log(`Notification filtered out: ${notif.title} is at ${notif.distance}m, radius limit is ${gpsRadius}m.`);
      return;
    }
    popupQueue.current.push(notif);
  };

  // Queue runner enforcing 30s cooldown
  useEffect(() => {
    const runner = setInterval(() => {
      if (popupQueue.current.length === 0) return;
      const now = Date.now();
      if (now - lastPopupTime.current < 20000) {
        // Less than 20s cooldown, wait for next cycle to avoid overlapping popups
        return;
      }

      // Dequeue next notification
      const nextNotif = popupQueue.current.shift();
      if (nextNotif) {
        setPopups(prev => [...prev.slice(-2), nextNotif]); // Limit to max 3 concurrent visible popups
        lastPopupTime.current = now;
        playPopupSound();
      }
    }, 2000);

    return () => clearInterval(runner);
  }, [gpsRadius]);

  // Simulate periodic spatiotemporal community reports
  useEffect(() => {
    if (!userProfile) return;

    // Seed initial welcome popup
    const welcomeTimeout = setTimeout(() => {
      if (welcomeShownRef.current) return;
      welcomeShownRef.current = true;
      addNotificationToQueue({
        id: "notif-welcome",
        type: "leaderboard_congrats",
        title: "🏆 Congratulations",
        message: `Welcome back, ${userProfile.displayName}! You reached Top 10 on the Bengaluru active scouts leaderboard.`,
        distance: 0,
        timestamp: new Date()
      });
    }, 5000);

    // Dynamic simulated events every 45-60 seconds
    const interval = setInterval(() => {
      const distance = Math.floor(Math.random() * 850) + 50; // 50m to 900m
      const notifTypes: HyperlocalNotification["type"][] = [
        "verification_needed",
        "critical_incident",
        "repair_completed",
        "nearby_mission"
      ];
      const selectedType = notifTypes[Math.floor(Math.random() * notifTypes.length)];

      let payload: HyperlocalNotification;

      switch (selectedType) {
        case "verification_needed":
          payload = {
            id: `notif-${Date.now()}`,
            type: "verification_needed",
            title: "📍 Verification Needed",
            message: `A new Water Leakage was reported ${distance}m away. Urgent visual consensus is requested.`,
            distance,
            targetId: "INC-204",
            timestamp: new Date()
          };
          break;
        case "critical_incident":
          payload = {
            id: `notif-${Date.now()}`,
            type: "critical_incident",
            title: "🚨 AI Crisis Commander",
            message: `AI detected a Critical Infrastructure Incident near your coordinates. Local streets flagged.`,
            distance,
            targetId: "INC-204",
            timestamp: new Date()
          };
          break;
        case "repair_completed":
          payload = {
            id: `notif-${Date.now()}`,
            type: "repair_completed",
            title: "✅ Repair Completed",
            message: `The asphalt pothole near your coordinate radius has been resolved. Confirm to release escrow.`,
            distance,
            targetId: "INC-204",
            timestamp: new Date()
          };
          break;
        case "nearby_mission":
        default:
          payload = {
            id: `notif-${Date.now()}`,
            type: "nearby_mission",
            title: "🎯 Mission Available",
            message: `Earn +25 RP: Verify a faulty Bescom secondary street line located ${distance}m away.`,
            distance,
            targetId: "m-01",
            timestamp: new Date()
          };
          break;
      }

      addNotificationToQueue(payload);
    }, 45000);

    return () => {
      clearTimeout(welcomeTimeout);
      clearInterval(interval);
    };
  }, [userProfile]);

  // Listen for actual real-time changes inside parent issues array
  const prevIssuesLength = useRef(issues.length);
  useEffect(() => {
    if (issues.length > prevIssuesLength.current) {
      // New issue created by current user or other citizens!
      const latestIssue = issues[0];
      if (latestIssue) {
        addNotificationToQueue({
          id: `notif-real-${Date.now()}`,
          type: "verification_needed",
          title: "📍 Nearby Verification Needed",
          message: `Fresh report "${latestIssue.title}" logged 180m away. Review and claim verification RP.`,
          distance: 180,
          targetId: latestIssue.id,
          timestamp: new Date()
        });
      }
    }
    prevIssuesLength.current = issues.length;
  }, [issues]);

  const removePopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const getPopupStyles = (type: HyperlocalNotification["type"]) => {
    switch (type) {
      case "critical_incident":
        return {
          icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
          borderClass: "border-red-500/30",
          bgClass: "bg-red-950/10 backdrop-blur-xl",
          accentColor: "text-red-400"
        };
      case "repair_completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
          borderClass: "border-emerald-500/30",
          bgClass: "bg-emerald-950/10 backdrop-blur-xl",
          accentColor: "text-emerald-400"
        };
      case "nearby_mission":
        return {
          icon: <Target className="h-5 w-5 text-teal-400" />,
          borderClass: "border-teal-500/30",
          bgClass: "bg-teal-950/10 backdrop-blur-xl",
          accentColor: "text-teal-400"
        };
      case "leaderboard_congrats":
        return {
          icon: <Trophy className="h-5 w-5 text-amber-400" />,
          borderClass: "border-amber-500/30",
          bgClass: "bg-amber-950/10 backdrop-blur-xl",
          accentColor: "text-amber-400"
        };
      case "verification_needed":
      default:
        return {
          icon: <MapPin className="h-5 w-5 text-blue-400" />,
          borderClass: "border-blue-500/30",
          bgClass: "bg-blue-950/10 backdrop-blur-xl",
          accentColor: "text-blue-400"
        };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300] w-full max-w-sm pointer-events-none flex flex-col gap-3">
      {/* 1. RADIUS CONTROLLER HUD (Desktop right, interactive, modern design) */}
      <div className="pointer-events-auto self-end mb-1">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0c]/90 backdrop-blur-md border border-[#1f1f21] rounded-xl text-[10px] font-mono text-zinc-400 hover:text-white transition shadow-lg cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>GPS Alerts: {gpsRadius === "National" ? "National" : `${gpsRadius}m`}</span>
        </button>

        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 bottom-10 mt-2 bg-[#0c0c0f] border border-[#1f1f21] p-3 rounded-xl shadow-xl w-48 space-y-2.5 z-10"
            >
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                Select Alert Radius
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                {[500, 1000, 5000, "National"].map((rad) => (
                  <button
                    key={rad}
                    onClick={() => {
                      setGpsRadius(rad as any);
                      setShowConfig(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition font-mono flex items-center justify-between ${
                      gpsRadius === rad 
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                        : "text-zinc-400 hover:bg-[#1a1a1f]"
                    }`}
                  >
                    <span>{rad === "National" ? "National" : `${rad}m`}</span>
                    {gpsRadius === rad && <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. FLOATING ALERTS RENDER ENGINE */}
      <div className="flex flex-col gap-3 w-full">
        <AnimatePresence>
          {popups.map((popup) => {
            const styles = getPopupStyles(popup.type);
            return (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`pointer-events-auto w-full border ${styles.borderClass} ${styles.bgClass} rounded-2xl shadow-2xl p-4 flex gap-3 relative overflow-hidden backdrop-blur-xl group`}
              >
                {/* Micro-Progress Timer line */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  onAnimationComplete={() => removePopup(popup.id)}
                  className="absolute bottom-0 left-0 h-0.5 bg-teal-500/30"
                />

                {/* Left Icon Panel */}
                <div className="h-9 w-9 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                  {styles.icon}
                </div>

                {/* Core Text Section */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${styles.accentColor}`}>
                      {popup.title}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono">
                      {popup.distance > 0 ? `📍 ${popup.distance}m` : "Global"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-200 leading-normal font-sans pr-4 font-medium">
                    {popup.message}
                  </p>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2">
                    {popup.type === "verification_needed" && (
                      <button
                        onClick={() => {
                          onActionClick("verify", popup.targetId);
                          removePopup(popup.id);
                        }}
                        className="px-2.5 py-1 bg-teal-400 hover:bg-teal-350 text-[#0c0c0f] font-extrabold text-[9px] rounded-md transition shadow-md cursor-pointer font-mono uppercase"
                      >
                        Verify Now
                      </button>
                    )}
                    {popup.type === "critical_incident" && (
                      <button
                        onClick={() => {
                          onActionClick("incident", popup.targetId);
                          removePopup(popup.id);
                        }}
                        className="px-2.5 py-1 bg-teal-400 hover:bg-teal-350 text-[#0c0c0f] font-extrabold text-[9px] rounded-md transition shadow-md cursor-pointer font-mono uppercase"
                      >
                        View Incident
                      </button>
                    )}
                    {popup.type === "repair_completed" && (
                      <button
                        onClick={() => {
                          onActionClick("verify", popup.targetId);
                          removePopup(popup.id);
                        }}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-[#0c0c0f] font-extrabold text-[9px] rounded-md transition shadow-md cursor-pointer font-mono uppercase"
                      >
                        Confirm
                      </button>
                    )}
                    {popup.type === "nearby_mission" && (
                      <button
                        onClick={() => {
                          onActionClick("mission", popup.targetId);
                          removePopup(popup.id);
                        }}
                        className="px-2.5 py-1 bg-teal-400 hover:bg-teal-350 text-[#0c0c0f] font-extrabold text-[9px] rounded-md transition shadow-md cursor-pointer font-mono uppercase"
                      >
                        Accept Mission
                      </button>
                    )}
                    {popup.type === "leaderboard_congrats" && (
                      <button
                        onClick={() => {
                          onActionClick("leaderboard");
                          removePopup(popup.id);
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-[#0c0c0f] font-extrabold text-[9px] rounded-md transition shadow-md cursor-pointer font-mono uppercase"
                      >
                        View Standings
                      </button>
                    )}
                    <button
                      onClick={() => removePopup(popup.id)}
                      className="px-2.5 py-1 bg-[#15151a] hover:bg-[#202028] border border-white/5 text-zinc-400 font-extrabold text-[9px] rounded-md transition cursor-pointer font-mono uppercase"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Close Button overlay */}
                <button
                  onClick={() => removePopup(popup.id)}
                  className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

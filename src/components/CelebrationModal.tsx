import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, CheckCircle, ShieldCheck, Star, Trophy, X, ChevronRight, TrendingUp, Compass, ArrowUp, Globe, MapPin } from "lucide-react";
import { UserProfile } from "../types";

// Dynamic rank calculation formulas for consistent counting animation
export function calculateLocalRank(reputation: number): number {
  return Math.max(1, 53 - Math.floor(reputation / 15));
}

export function calculateNationalRank(reputation: number): number {
  return Math.max(1, 1452 - Math.floor(reputation * 1.5));
}

const RANKS = ["Citizen", "Scout", "Verifier", "Inspector", "Guardian", "Community Hero"];

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activityType?: "report" | "verify" | "resolution" | "mission" | null;
  repGained?: number;
  previousRep?: number;
  newRep?: number;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  userProfile,
  activityType = "report",
  repGained = 25,
  previousRep,
  newRep
}: CelebrationModalProps) {
  
  // Backwards compatibility fallback if previousRep/newRep aren't passed
  const pRep = previousRep !== undefined ? previousRep : Math.max(0, userProfile.reputation - repGained);
  const nRep = newRep !== undefined ? newRep : userProfile.reputation;

  const prevLocalRank = calculateLocalRank(pRep);
  const nextLocalRank = calculateLocalRank(nRep);
  const prevNationalRank = calculateNationalRank(pRep);
  const nextNationalRank = calculateNationalRank(nRep);

  const [currentLocalRank, setCurrentLocalRank] = useState(prevLocalRank);
  const [currentNationalRank, setCurrentNationalRank] = useState(prevNationalRank);
  const [countdownDone, setCountdownDone] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // Dynamic next tier estimation
  const getNextTierCost = (rp: number) => {
    if (rp < 100) return 100;
    if (rp < 300) return 300;
    if (rp < 600) return 600;
    if (rp < 1000) return 1000;
    if (rp < 2000) return 2000;
    return rp; // Max Tier
  };

  const getNextTierName = (rank: string) => {
    switch (rank) {
      case "Citizen": return "Scout";
      case "Scout": return "Verifier";
      case "Verifier": return "Inspector";
      case "Inspector": return "Guardian";
      case "Guardian": return "Community Hero";
      default: return "Max Rank Reached";
    }
  };

  const nextTierRP = getNextTierCost(nRep);
  const currentRankName = userProfile.rank;
  const nextTierName = getNextTierName(currentRankName);
  const prevTierRP = nextTierRP === 100 ? 0 : nextTierRP === 300 ? 100 : nextTierRP === 600 ? 300 : nextTierRP === 1000 ? 600 : 1000;
  
  // Calculate percentage toward next tier
  const startProgressPercent = nextTierRP === pRep ? 100 : Math.min(100, Math.max(0, ((pRep - prevTierRP) / (nextTierRP - prevTierRP)) * 100));
  const newProgressPercent = nextTierRP === nRep ? 100 : Math.min(100, Math.max(0, ((nRep - prevTierRP) / (nextTierRP - prevTierRP)) * 100));

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown states
    setCurrentLocalRank(prevLocalRank);
    setCurrentNationalRank(prevNationalRank);
    setProgressWidth(startProgressPercent);
    setCountdownDone(false);

    // 1. First animate the progress bar filling up
    const progressTimer = setTimeout(() => {
      setProgressWidth(newProgressPercent);
    }, 400);

    // 2. Then start local rank climb countdown
    let localTimer: NodeJS.Timeout;
    let nationalTimer: NodeJS.Timeout;

    const startLocalCountdown = setTimeout(() => {
      let currentLocal = prevLocalRank;
      if (currentLocal > nextLocalRank) {
        localTimer = setInterval(() => {
          currentLocal -= 1;
          setCurrentLocalRank(currentLocal);
          if (currentLocal <= nextLocalRank) {
            clearInterval(localTimer);
            
            // Now start national countdown after local finishes!
            let currentNat = prevNationalRank;
            if (currentNat > nextNationalRank) {
              const step = Math.max(1, Math.floor((prevNationalRank - nextNationalRank) / 8));
              nationalTimer = setInterval(() => {
                currentNat -= step;
                if (currentNat <= nextNationalRank) {
                  currentNat = nextNationalRank;
                  clearInterval(nationalTimer);
                  setCountdownDone(true);
                }
                setCurrentNationalRank(currentNat);
              }, 60);
            } else {
              setCountdownDone(true);
            }
          }
        }, 120);
      } else {
        // If local didn't change, check national
        let currentNat = prevNationalRank;
        if (currentNat > nextNationalRank) {
          const step = Math.max(1, Math.floor((prevNationalRank - nextNationalRank) / 8));
          nationalTimer = setInterval(() => {
            currentNat -= step;
            if (currentNat <= nextNationalRank) {
              currentNat = nextNationalRank;
              clearInterval(nationalTimer);
              setCountdownDone(true);
            }
            setCurrentNationalRank(currentNat);
          }, 60);
        } else {
          setCountdownDone(true);
        }
      }
    }, 1200);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(startLocalCountdown);
      if (localTimer) clearInterval(localTimer);
      if (nationalTimer) clearInterval(nationalTimer);
    };
  }, [isOpen, pRep, nRep]);

  const getActivityName = () => {
    switch (activityType) {
      case "report": return "Civic Report Submitted";
      case "verify": return "Successful Report Verification";
      case "resolution": return "Resolution Evidence Confirmed";
      case "mission": return "Active Mission Completed";
      default: return "Civic Contribution Logged";
    }
  };

  const getCityName = () => {
    return userProfile.city || "Bengaluru";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[250] flex items-center justify-center p-4 overflow-y-auto select-none">
          {/* Confetti Particle Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(24)].map((_, i) => {
              const delay = i * 0.08;
              const size = Math.random() * 8 + 4;
              const left = Math.random() * 100;
              const duration = Math.random() * 2 + 1.5;
              const color = ["bg-teal-400", "bg-emerald-400", "bg-amber-400", "bg-blue-400"][i % 4];
              
              return (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: `${left}vw`, opacity: 0, rotate: 0 }}
                  animate={{ 
                    y: "105vh", 
                    opacity: [0, 1, 1, 0], 
                    rotate: 360,
                    x: `${left + (Math.random() * 12 - 6)}vw`
                  }}
                  transition={{ 
                    duration: duration, 
                    delay: delay, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className={`absolute rounded-full ${color}`}
                  style={{ width: size, height: size }}
                />
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="w-full max-w-lg bg-[#08080a] border border-[#1f1f21] rounded-2xl p-6 md:p-8 relative overflow-hidden text-center shadow-2xl shadow-teal-500/5 my-8"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-10 -left-10 h-52 w-52 bg-teal-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 h-52 w-52 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-1.5 rounded-lg hover:bg-[#1a1a1e]"
              id="close-celebration-btn"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Big Award Trophy */}
            <div className="relative inline-flex mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center border border-teal-400/20 shadow-lg shadow-teal-500/15"
              >
                <Trophy className="h-8 w-8 text-[#050505]" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border border-dashed border-teal-500/20 rounded-full pointer-events-none"
              />
            </div>

            {/* Headline Details */}
            <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase bg-teal-950/30 border border-teal-900/40 px-3 py-1 rounded-full inline-block mb-2">
              {getActivityName()}
            </span>
            
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 mt-2 font-mono"
            >
              +{repGained} RP
            </motion.h2>

            <p className="text-zinc-400 text-xs max-w-xs mx-auto mt-2 leading-relaxed">
              Awarded Reputation Points for your impactful contributions to public safety and infrastructure integrity.
            </p>

            {/* PROGRESS TRACKER */}
            <div className="mt-6 p-4 bg-[#0d0d10] border border-[#1f1f21] rounded-xl text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Rank Status</span>
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {currentRankName}
                </span>
              </div>

              {/* Progress bar with smooth animation */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-[#1f1f21] relative">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000 ease-out" 
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                {nextTierName !== "Max Rank Reached" && (
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>{currentRankName}</span>
                    <span className="text-teal-400 font-semibold">{nextTierName} in {nextTierRP - nRep} RP</span>
                  </div>
                )}
              </div>
            </div>

            {/* RANK COUNTDOWN / CLIMB PANEL */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              {/* LOCAL SECTOR POSITION */}
              <div className="p-4 bg-[#0d0d10] border border-[#1f1f21] rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-blue-500/5 text-blue-400 border-l border-b border-[#1f1f21] rounded-bl-lg text-[8px] font-mono">
                  {getCityName()}
                </div>
                
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Local Position</span>
                
                <div className="flex items-center justify-center gap-2 my-2.5">
                  <span className="text-3xl font-extrabold text-[#ededed] font-mono">
                    #{currentLocalRank}
                  </span>
                  {prevLocalRank > nextLocalRank && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-teal-400 flex items-center bg-teal-500/10 px-1 py-0.5 rounded"
                    >
                      <ArrowUp className="h-3 w-3" />
                      {prevLocalRank - nextLocalRank}
                    </motion.span>
                  )}
                </div>

                <span className="text-[10px] text-zinc-400 leading-tight">
                  {prevLocalRank > nextLocalRank ? (
                    <span className="text-teal-400 font-medium">You climbed {prevLocalRank - nextLocalRank} positions in your locality!</span>
                  ) : (
                    <span>Maintaining stable local leadership.</span>
                  )}
                </span>
              </div>

              {/* NATIONAL HERO POSITION */}
              <div className="p-4 bg-[#0d0d10] border border-[#1f1f21] rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-purple-500/5 text-purple-400 border-l border-b border-[#1f1f21] rounded-bl-lg text-[8px] font-mono">
                  India
                </div>

                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">National Position</span>

                <div className="flex items-center justify-center gap-2 my-2.5">
                  <span className="text-3xl font-extrabold text-zinc-250 font-mono">
                    #{currentNationalRank.toLocaleString()}
                  </span>
                  {prevNationalRank > nextNationalRank && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-amber-400 flex items-center bg-amber-500/10 px-1 py-0.5 rounded"
                    >
                      <ArrowUp className="h-3 w-3" />
                      {(prevNationalRank - nextNationalRank).toLocaleString()}
                    </motion.span>
                  )}
                </div>

                <span className="text-[10px] text-zinc-400 leading-tight">
                  {prevNationalRank > nextNationalRank ? (
                    <span className="text-amber-400 font-medium">You climbed {prevNationalRank - nextNationalRank} places nationally!</span>
                  ) : (
                    <span>Securing national ranking index.</span>
                  )}
                </span>
              </div>
            </div>

            {/* Custom summary feedback banner */}
            <div className="mt-5 p-3.5 bg-[#121215]/80 border border-[#1f1f21]/60 rounded-xl flex items-center gap-3 text-left">
              <div className="h-8 w-8 rounded bg-teal-500/5 border border-teal-500/15 flex items-center justify-center text-teal-400 flex-shrink-0">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  {prevLocalRank > nextLocalRank 
                    ? `You moved up ${prevLocalRank - nextLocalRank} places in ${getCityName()}!`
                    : "National leaderboard status synchronized"
                  }
                </span>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Your verifications actively contribute to ward rankings and health analytics.
                </p>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#050505] font-extrabold py-3.5 rounded-xl transition text-xs uppercase tracking-wider shadow-lg hover:shadow-teal-500/10 cursor-pointer"
              id="confirm-celebration-btn"
            >
              Continue Civic Mission
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

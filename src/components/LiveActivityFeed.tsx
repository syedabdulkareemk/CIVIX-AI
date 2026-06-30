import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Activity, ShieldAlert, CheckCircle2, Sparkles, Award } from "lucide-react";
import { Cluster } from "../types";

interface LiveActivityFeedProps {
  clusters: Cluster[];
}

const LIVE_NAMES = [
  "Aarav Sharma", "Priya Patel", "Arjun Mehta", "Rajesh Kumar", "Ananya Iyer",
  "Vikram Singh", "Sunita Rao", "Rohan Deshmukh", "Meera Nair", "Kabir Sen"
];

const LIVE_LOCATIONS = [
  "Koramangala 4th Block", "80 Feet Road Junction", "Sony World Signal", "Wipro Park Rd",
  "Koramangala 6th Cross", "HSR Sector 3", "Indiranagar 100 Feet Rd", "MG Road Metro Station",
  "Bescom Sector 4"
];

const LIVE_DISRUPTIONS = [
  { category: "Pothole", icon: "🚧", title: "severe road indentation" },
  { category: "Water Leakage", icon: "💧", title: "broken main valve leak" },
  { category: "Broken Streetlights", icon: "🔦", title: "dark segment hazard" },
  { category: "Waste Management Issues", icon: "♻️", title: "illegal garbage dumping" },
  { category: "Public Safety Hazards", icon: "🚨", title: "hanging high-voltage wire" }
];

export default function LiveActivityFeed({ clusters }: LiveActivityFeedProps) {
  const [liveTimeline, setLiveTimeline] = useState(() => [
    {
      id: "act-1",
      type: "verification",
      user: "Aarav Sharma",
      action: "verified a pothole",
      target: "Sony World Signal Junction",
      time: "Just now",
      rp: "+25 RP",
      icon: "✔️"
    },
    {
      id: "act-2",
      type: "report",
      user: "Arjun Mehta",
      action: "reported a streetlight outage",
      target: "Koramangala 4th Block",
      time: "12m ago",
      rp: "+50 RP",
      icon: "📝"
    },
    {
      id: "act-3",
      type: "ai",
      user: "AI Operations Agent",
      action: "formed a spatiotemporal cluster",
      target: "2 Waste Management alerts merged",
      time: "24m ago",
      rp: "Automated",
      icon: "🧠"
    },
    {
      id: "act-4",
      type: "resolution",
      user: "BESCOM Dispatch",
      action: "confirmed resolution of",
      target: "Water Leakage at Wipro Park Rd",
      time: "48m ago",
      rp: "+75 RP",
      icon: "🏆"
    },
    {
      id: "act-5",
      type: "escalation",
      user: "AI Agent Node",
      action: "escalated critical hazard",
      target: "Exposed wire at 6th Cross Rd",
      time: "1h ago",
      rp: "Critical",
      icon: "🚨"
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const typeRand = Math.random();
      let newEvent;
      const name = LIVE_NAMES[Math.floor(Math.random() * LIVE_NAMES.length)];
      const loc = LIVE_LOCATIONS[Math.floor(Math.random() * LIVE_LOCATIONS.length)];
      const dis = LIVE_DISRUPTIONS[Math.floor(Math.random() * LIVE_DISRUPTIONS.length)];
      
      if (typeRand < 0.25) {
        newEvent = {
          id: `live-ev-${Date.now()}`,
          type: "report",
          user: name,
          action: `reported a ${dis.title}`,
          target: loc,
          time: "Just now",
          rp: "+50 RP",
          icon: "📝"
        };
      } else if (typeRand < 0.5) {
        newEvent = {
          id: `live-ev-${Date.now()}`,
          type: "verification",
          user: name,
          action: `verified ${dis.category} alert`,
          target: loc,
          time: "Just now",
          rp: "+25 RP",
          icon: "✔️"
        };
      } else if (typeRand < 0.7) {
        newEvent = {
          id: `live-ev-${Date.now()}`,
          type: "ai",
          user: "AI Engine Bot",
          action: `triaged ${dis.category} disruption`,
          target: `${loc} (Confidence: ${Math.floor(Math.random() * 8 + 92)}%)`,
          time: "Just now",
          rp: "Automated",
          icon: "🧠"
        };
      } else if (typeRand < 0.85) {
        newEvent = {
          id: `live-ev-${Date.now()}`,
          type: "resolution",
          user: "BBMP Crew",
          action: `completed repairs for`,
          target: `${dis.category} at ${loc}`,
          time: "Just now",
          rp: "+75 RP",
          icon: "🏆"
        };
      } else {
        newEvent = {
          id: `live-ev-${Date.now()}`,
          type: "escalation",
          user: "System Monitor",
          action: `escalated unresolved ${dis.category}`,
          target: `${loc} to municipal authorities`,
          time: "Just now",
          rp: "Critical",
          icon: "🚨"
        };
      }

      setLiveTimeline(prev => {
        const updatedPrev = prev.map((ev, i) => {
          if (ev.time === "Just now") {
            return { ...ev, time: `1m ago` };
          } else if (ev.time.endsWith("m ago")) {
            const mins = parseInt(ev.time);
            return { ...ev, time: `${mins + 1}m ago` };
          }
          return ev;
        });
        return [newEvent, ...updatedPrev].slice(0, 12);
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "report":
        return {
          border: "border-blue-500/20 hover:border-blue-500/40",
          leftBar: "bg-blue-500",
          bg: "bg-blue-500/5",
          text: "text-blue-400",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"
        };
      case "verification":
        return {
          border: "border-amber-500/20 hover:border-amber-500/40",
          leftBar: "bg-amber-500",
          bg: "bg-amber-500/5",
          text: "text-amber-400",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        };
      case "resolution":
        return {
          border: "border-emerald-500/20 hover:border-emerald-500/40",
          leftBar: "bg-emerald-500",
          bg: "bg-emerald-500/5",
          text: "text-emerald-400",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        };
      case "ai":
        return {
          border: "border-purple-500/20 hover:border-purple-500/40",
          leftBar: "bg-purple-500",
          bg: "bg-purple-500/5",
          text: "text-purple-400",
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/20"
        };
      case "escalation":
        default:
        return {
          border: "border-red-500/20 hover:border-red-500/40",
          leftBar: "bg-red-500",
          bg: "bg-red-500/5",
          text: "text-red-400",
          badge: "bg-red-500/10 text-red-400 border-red-500/20"
        };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-teal-400 animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-100 font-bold">
            Live Ops & AI Feed
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Streaming</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 relative max-h-[500px]">
        <div className="absolute left-[9px] top-2 bottom-2 w-[1px] bg-zinc-800/80 pointer-events-none" />
        
        <AnimatePresence initial={false}>
          {liveTimeline.map((act) => {
            const styles = getTypeStyle(act.type);
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="overflow-hidden"
              >
                <div className={`relative ml-5 p-3 rounded-xl bg-[#08080a] border ${styles.border} transition-all duration-300 flex items-start gap-2.5 shadow-sm group`}>
                  
                  {/* Timeline point indicator */}
                  <div className={`absolute -left-[19px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${styles.leftBar} ring-4 ring-[#050507] group-hover:scale-125 transition-transform duration-200 z-10`} />

                  <span className="text-sm select-none flex-shrink-0 pt-0.5">{act.icon}</span>
                  
                  <div className="flex-grow min-w-0 space-y-0.5">
                    <p className="text-[11px] text-zinc-300 leading-snug font-sans">
                      <strong className="text-zinc-100 font-bold">{act.user}</strong>{" "}
                      <span className="text-zinc-400">{act.action}</span>{" "}
                      <span className={`${styles.text} font-semibold`}>{act.target}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-550 pt-0.5">
                      <span>{act.time}</span>
                      <span>•</span>
                      <span className="text-zinc-500 uppercase">Sector 4</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 self-center ${styles.badge}`}>
                    {act.rp}
                  </span>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

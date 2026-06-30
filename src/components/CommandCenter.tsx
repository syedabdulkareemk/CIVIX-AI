import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Issue, Cluster, NeighborhoodHealth, PredictiveInsight, Mission } from "../types";
import InteractiveMap from "./InteractiveMap";
import AICrisisCommander from "./AICrisisCommander";
import LiveActivityFeed from "./LiveActivityFeed";
import DashboardLeaderboard from "./DashboardLeaderboard";
import { 
  Activity, 
  TrendingUp, 
  AlertOctagon, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  ArrowUpRight,
  Search,
  Target,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Check,
  Filter,
  Eye,
  MapPin
} from "lucide-react";

interface CommandCenterProps {
  issues: Issue[];
  clusters: Cluster[];
  missions: Mission[];
  health: NeighborhoodHealth;
  insights: PredictiveInsight[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectIssue: (issue: Issue) => void;
  onNavigateToMissions: () => void;
  onNavigateToReport: () => void;
  onNavigateToLeaderboard: () => void;
  onVerifyIssue?: (issueId: string) => void;
  verifiedIssueIds?: string[];
  userProfile?: any;
  theme?: "light" | "dark" | "system";
}

export default function CommandCenter({
  issues,
  clusters,
  missions,
  health,
  insights,
  userLocation,
  onSelectIssue,
  onNavigateToMissions,
  onNavigateToReport,
  onNavigateToLeaderboard,
  onVerifyIssue,
  verifiedIssueIds = [],
  userProfile,
  theme
}: CommandCenterProps) {
  // Local filters & search query
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);
  const [verifyingMap, setVerifyingMap] = useState<{ [key: string]: boolean }>({});
  const [selectedRadius, setSelectedRadius] = useState<number | "National">("National");
  const [showIncidentRegistryModal, setShowIncidentRegistryModal] = useState(false);

  // India-first Community Alerts
  const communityAlerts = [
    {
      id: "alert-1",
      severity: "critical",
      message: "Monsoon Preparedness Warning: Water logging risk remains high on 80 Feet Road due to stormwater blockages. BBMP drain widening is in progress.",
      time: "10m ago"
    },
    {
      id: "alert-2",
      severity: "warning",
      message: "Exposed High-Voltage secondary line flagged dangling low at 6th Cross Rd. Bescom crew dispatched for safety isolation.",
      time: "1h ago"
    },
    {
      id: "alert-3",
      severity: "info",
      message: "Neighborhood Health Improvement: Koramangala Sector 4 participation index surged to 9.2/10 this week.",
      time: "4h ago"
    }
  ];

  // Haversine distance calculator in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const centerLoc = userLocation || { lat: 12.9352, lng: 77.6245 }; // default to Koramangala, Bengaluru

  // Calculate distances for all issues
  const issuesWithDistance = useMemo(() => {
    return issues.map((issue) => {
      const distance = calculateDistance(centerLoc.lat, centerLoc.lng, issue.latitude, issue.longitude);
      return { ...issue, distance };
    });
  }, [issues, centerLoc]);

  // Filter issues based on the selected radius (bypass radius check if a search query is active)
  const isSearching = searchQuery.trim().length > 0;
  const withinRadiusIssues = useMemo(() => {
    return issuesWithDistance.filter((issue) => {
      if (selectedRadius === "National" || isSearching) return true;
      return issue.distance <= selectedRadius;
    });
  }, [issuesWithDistance, selectedRadius, isSearching]);

  // Filter verification issues based on the same radius
  const verificationQueue = useMemo(() => {
    return withinRadiusIssues.filter((issue) => {
      const isResolved = issue.status === "Resolved";
      const hasBeenVerifiedByMe =
        verifiedIssueIds.includes(issue.id) ||
        (issue.verifiedUsers && userProfile && issue.verifiedUsers.includes(userProfile.uid));
      return !isResolved && (issue.verificationsCount || 0) < 20 && !hasBeenVerifiedByMe;
    });
  }, [withinRadiusIssues, verifiedIssueIds, userProfile]);

  // Process filters & query searches on the Main Incident Register
  const filteredIssues = useMemo(() => {
    return withinRadiusIssues.filter((issue) => {
      const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && issue.status !== "Resolved") ||
        (statusFilter === "Resolved" && issue.status === "Resolved");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        (issue.address && issue.address.toLowerCase().includes(q)) ||
        issue.creatorName.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [withinRadiusIssues, categoryFilter, statusFilter, searchQuery]);

  // Bottom operations dashboard stats
  const registryStats = useMemo(() => {
    const active = issues.filter((i) => i.status !== "Resolved");
    return {
      total: issues.length,
      verified: issues.filter((i) => (i.verificationsCount || 0) > 0).length,
      resolved: issues.filter((i) => i.status === "Resolved").length,
      critical: issues.filter((i) => i.severity === "Critical" && i.status !== "Resolved").length,
      underInvestigation: issues.filter((i) => i.status === "Repair In Progress" || i.status === "Escalated").length,
    };
  }, [issues]);

  const handleDashboardVerify = async (e: React.MouseEvent, issueId: string) => {
    e.stopPropagation();
    if (!onVerifyIssue) return;
    setVerifyingMap((prev) => ({ ...prev, [issueId]: true }));
    try {
      await onVerifyIssue(issueId);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setVerifyingMap((prev) => ({ ...prev, [issueId]: false }));
      }, 1000);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "Critical":
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
            Critical
          </span>
        );
      case "High":
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="bg-blue-500/10 text-[#60a5fa] border border-[#3b82f6]/20 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
            Medium
          </span>
        );
      default:
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-medium">
            Low
          </span>
        );
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Resolved
          </span>
        );
      case "Repair In Progress":
      case "In Progress":
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            In Progress
          </span>
        );
      case "Escalated":
        return (
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Verifying
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Water Leakage":
        return <span>💧</span>;
      case "Broken Streetlights":
        return <span>🔦</span>;
      case "Waste Management Issues":
        return <span>♻️</span>;
      case "Public Safety Hazards":
        return <span>🚨</span>;
      case "Potholes":
        return <span>🚧</span>;
      default:
        return <span>🌐</span>;
    }
  };

  // Neighborhood health progress ring geometry
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((health?.score || 85) / 100) * circumference;

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-3">
      
      {/* 1. AI CRISIS COMMANDER BANNER */}
      <AICrisisCommander
        issues={issues}
        clusters={clusters}
        onNavigateToReport={onNavigateToReport}
        onOpenRegistry={() => setShowIncidentRegistryModal(true)}
      />

      {/* 2. DUAL COLUMNS: HERO INTEGRATED MAP (75%) & LIVE TIMELINE (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* HERO MAP AREA */}
        <div className="lg:col-span-3 flex flex-col bg-[#0f0f11] border border-zinc-800/80 rounded-2xl overflow-hidden relative shadow-2xl h-[560px]">
          
          {/* Floating HUD Header Left */}
          <div className="absolute top-4 left-4 z-20 bg-zinc-950/85 backdrop-blur border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-none select-none">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-teal-400 uppercase">
              LIVE OPERATION MAP
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">|</span>
            <span className="text-[10px] text-zinc-300 font-mono">Sector grid view</span>
          </div>

          {/* Floating HUD Center Address (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-20 bg-zinc-950/85 backdrop-blur border border-zinc-800/80 rounded-xl px-3.5 py-2 pointer-events-none select-none flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-teal-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">RADAR CENTER</span>
              <span className="text-[10px] font-sans text-zinc-200">Koramangala, Bengaluru, IN</span>
            </div>
          </div>

          {/* Floating HUD Radius Selector Right */}
          <div className="absolute top-4 right-4 z-20 bg-zinc-950/85 backdrop-blur border border-zinc-800/80 rounded-xl p-2 flex items-center gap-1.5 shadow-lg">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider pl-1 pr-1 font-bold">RANGE</span>
            <div className="flex items-center gap-1">
              {[5, 10, 25, "National"].map((rad) => (
                <button
                  key={rad}
                  id={`radius-selector-${rad}`}
                  type="button"
                  onClick={() => setSelectedRadius(rad as any)}
                  className={`text-[9px] px-2 py-1 rounded border font-mono font-bold transition cursor-pointer ${
                    selectedRadius === rad
                      ? "bg-teal-500/15 border-teal-500/50 text-teal-400"
                      : "bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {rad === "National" ? "🇮🇳 IND" : `${rad} km`}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Map Widget */}
          <div className="flex-1 w-full h-full">
            <InteractiveMap
              issues={withinRadiusIssues}
              clusters={clusters}
              selectedIssueId={selectedIssueId}
              heightClass="h-full"
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
                onSelectIssue(issue);
              }}
              theme={theme}
            />
          </div>

        </div>

        {/* LIVE TIME LINE - 25% width */}
        <div className="lg:col-span-1 bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl shadow-2xl h-[560px]">
          <LiveActivityFeed clusters={clusters} />
        </div>

      </div>

      {/* 3. SECONDARY ROW (Priority 2): HEALTH GAUGE, VERIFICATION QUEUE, ACTIVE MISSIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 3A: NEIGHBORHOOD HEALTH SCORE */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
                Neighborhood Health
              </span>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Optimized
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider">HEALTH SCORE</div>
                <div className="text-4xl font-extrabold text-zinc-100 font-sans tracking-tight">
                  {health?.score || 85}
                  <span className="text-xs text-zinc-500 font-normal">/100</span>
                </div>
                <div className="text-[10px] text-teal-400 font-sans mt-0.5">
                  Rank #{health?.rankInCity || 12} in City
                </div>
              </div>

              {/* Precise SVG Circular Gauge */}
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-zinc-900 fill-none"
                    strokeWidth="4"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-teal-500 fill-none transition-all duration-500"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-teal-400">
                  {health?.score || 85}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-zinc-800/60 pt-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono text-zinc-400">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Cleanliness</span>
                  <span className="text-teal-400">8.2</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: "82%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Road Safety</span>
                  <span className="text-teal-400">8.6</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: "86%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Water Infra</span>
                  <span className="text-teal-400">8.0</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Participation</span>
                  <span className="text-teal-400">9.0</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3B: CROWD VERIFICATION QUEUE */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
                  Verification Queue
                </span>
              </div>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                2x RP
              </span>
            </div>

            <div className="space-y-2.5 max-h-[145px] overflow-y-auto custom-scrollbar">
              {verificationQueue.slice(0, 2).map((issue) => {
                const isVerifying = !!verifyingMap[issue.id];
                return (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="p-2.5 rounded-lg bg-[#070709] border border-zinc-900 hover:border-zinc-800 transition cursor-pointer flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-zinc-200 truncate pr-1">
                        {issue.title}
                      </span>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[130px]">
                        {issue.address ? issue.address.split(",")[0] : "Koramangala"}
                      </span>
                      <button
                        onClick={(e) => handleDashboardVerify(e, issue.id)}
                        disabled={isVerifying}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 border border-amber-500/15 rounded text-[8px] font-mono font-bold transition flex items-center gap-0.5"
                      >
                        {isVerifying ? "⌛ Verifying..." : "✔️ Verify (+25)"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {verificationQueue.length === 0 && (
                <div className="text-center py-8 text-[10px] font-mono text-zinc-500">
                  Perfect consensus achieved. No pending local verifications.
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 text-center border-t border-zinc-800/50 pt-2.5 mt-2">
            Verify nearby alerts to earn community reputations.
          </div>
        </div>

        {/* 3C: ACTIVE MISSIONS CONTROL */}
        <div 
          onClick={onNavigateToMissions}
          className="bg-[#0f0f11] border border-zinc-800/80 hover:border-teal-500/30 p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-all cursor-pointer shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
                  Active Missions
                </span>
              </div>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Control Active
              </span>
            </div>

            <div className="space-y-2.5">
              {missions.filter((m) => m.status === "Active").slice(0, 2).map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-[#070709] border border-zinc-900 flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-zinc-200 block truncate">{m.title}</span>
                    <span className="text-[9px] font-mono text-zinc-500 block truncate mt-0.5">{m.description}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-mono font-bold text-teal-400 block">+{m.repReward} RP</span>
                  </div>
                </div>
              ))}
              {missions.filter((m) => m.status === "Active").length === 0 && (
                <div className="text-center py-8 text-[10px] font-mono text-zinc-500">
                  No active local scouts currently flagged.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 hover:text-teal-400 transition-all border-t border-zinc-800/50 pt-2.5 mt-2">
            <span>Explore high-reward scout missions</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

      </div>

      {/* 4. THIRD ROW (Priority 3): LEADERBOARDS (40%), ALERTS (30%), ANALYTICS (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Leaderboard Section (40% width / 4 cols) */}
        <div className="lg:col-span-4 h-[440px]">
          <DashboardLeaderboard userProfile={userProfile} />
        </div>

        {/* Community Alerts (30% width / 3 cols) */}
        <div className="lg:col-span-3 bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-[440px]">
          <div>
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-3 mb-4">
              <ShieldAlert className="h-4 w-4 text-red-400 animate-pulse" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
                Neighborhood Alerts
              </h3>
            </div>

            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[320px]">
              {communityAlerts.map((alert) => {
                const isCritical = alert.severity === "critical";
                const isWarning = alert.severity === "warning";
                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-xl border flex gap-2.5 items-start ${
                      isCritical 
                        ? "bg-red-950/5 border-red-500/20 text-red-300" 
                        : isWarning 
                        ? "bg-amber-950/5 border-amber-500/20 text-amber-300" 
                        : "bg-blue-950/5 border-blue-500/10 text-blue-300"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isCritical ? "bg-red-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-blue-400"
                    }`} />
                    <div className="space-y-1">
                      <p className="text-[11px] leading-relaxed font-sans">{alert.message}</p>
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 pt-0.5">
                        <span>Status: ACTIVE</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-zinc-600 border-t border-zinc-800/50 pt-2.5 mt-2">
            Dispatched via Municipal API Sync
          </div>
        </div>

        {/* AI Analytics & Insights (30% width / 3 cols) */}
        <div className="lg:col-span-3 bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between h-[440px]">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
                  AI Analytics Node
                </h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">Live Forecast</span>
            </div>

            <div className="space-y-4">
              {/* Custom SVG Resolution Chart */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  REP DISTRIBUTION RATIO
                </span>
                <div className="h-[100px] w-full flex items-end justify-between gap-1.5 px-2 bg-[#050505]/40 border border-zinc-900 rounded-lg pt-4 pb-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-[75px] w-full bg-gradient-to-t from-teal-500/20 to-teal-400 rounded-md shadow-sm relative group hover:opacity-80 transition">
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-teal-400">42%</span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-600">Roads</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-[45px] w-full bg-gradient-to-t from-teal-500/20 to-teal-400 rounded-md shadow-sm relative group hover:opacity-80 transition">
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-teal-400">25%</span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-600">Water</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-[60px] w-full bg-gradient-to-t from-teal-500/20 to-teal-400 rounded-md shadow-sm relative group hover:opacity-80 transition">
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-teal-400">33%</span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-600">Waste</span>
                  </div>
                </div>
              </div>

              {/* Predictive Insight Box */}
              <div className="bg-[#050505] p-3 rounded-xl border border-zinc-900 space-y-1">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                    PREDICTIVE ENGINE ALERT
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-normal">
                  Storm drain overflow index models high risk near 6th block coordinates due to high rainfall forecasts. Mobilization recommended.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-zinc-600 border-t border-zinc-800/50 pt-2.5">
            Avg Clearance Duration: 36.4 Hours
          </div>
        </div>

      </div>

      {/* 5. SECTOR INCIDENT REGISTRY OPERATIONAL SUMMARY (Bottom) */}
      <div className="bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl shadow-xl space-y-5">
        
        {/* Summary Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ededed]">
                Incident Registry Summary
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                Rapid municipal synchronization index. Access live disruption registry, filters, and reports.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIncidentRegistryModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer font-mono shadow-sm"
          >
            📋 Launch Detailed Registry Console ({filteredIssues.length} logs)
          </button>
        </div>

        {/* High Density Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#070709] border border-zinc-900 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">TODAY'S REPORTS</span>
            <span className="text-xl font-bold font-sans text-zinc-200 block">{registryStats.total}</span>
          </div>
          <div className="bg-[#070709] border border-zinc-900 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">VERIFIED</span>
            <span className="text-xl font-bold font-sans text-teal-400 block">{registryStats.verified}</span>
          </div>
          <div className="bg-[#070709] border border-zinc-900 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">RESOLVED</span>
            <span className="text-xl font-bold font-sans text-emerald-400 block">{registryStats.resolved}</span>
          </div>
          <div className="bg-[#070709] border border-zinc-900 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">CRITICAL</span>
            <span className="text-xl font-bold font-sans text-red-400 block">{registryStats.critical}</span>
          </div>
          <div className="bg-[#070709] border border-zinc-900 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 font-mono block uppercase">UNDER WORK</span>
            <span className="text-xl font-bold font-sans text-amber-400 block">{registryStats.underInvestigation}</span>
          </div>
        </div>

        {/* Registry Interactive Filter Strip on Dashboard */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#070709] border border-zinc-900 rounded-xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-zinc-500 mr-1" />
            {["All", "Potholes", "Water Leakage", "Broken Streetlights", "Waste Management Issues"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[9px] px-2.5 py-1.5 rounded-md border font-mono font-bold transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                    : "bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {cat === "All" ? "📦 All Categories" : cat.replace("Issues", "")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {["All", "Active", "Resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[9px] px-2.5 py-1.5 rounded-md border font-mono font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                    : "bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {st === "All" ? "⚡ Show All" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Native Incidents Inline List */}
        <div className="divide-y divide-zinc-900 bg-[#070709] border border-zinc-900 rounded-xl overflow-hidden">
          {filteredIssues.slice(0, 3).map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#0b0b0f] transition cursor-pointer select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-7 w-7 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-xs">
                  {getCategoryIcon(issue.category)}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 truncate">{issue.title}</div>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-550 mt-0.5">
                    <span className="text-zinc-400">{issue.address || "Koramangala, BLR"}</span>
                    <span>•</span>
                    <span className="text-teal-400 font-semibold flex items-center gap-0.5">
                      <Check className="h-3 w-3" />
                      {issue.verificationsCount} verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {getSeverityBadge(issue.severity)}
                {getStatusIndicator(issue.status)}
              </div>
            </div>
          ))}
          {filteredIssues.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
              No reported incident logs matching specified filter criteria.
            </div>
          )}
        </div>

      </div>

      {/* FULL DETAILED MODAL REGISTRY (Overlay Layer) */}
      {showIncidentRegistryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[#0f0f11] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-400" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-[#ededed]">Incident Registry Directory</h3>
                  <p className="text-[11px] text-zinc-500 font-sans">Filtered and indexed logs for rapid civic dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIncidentRegistryModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-xs cursor-pointer bg-[#1a1a1e] px-3 py-1.5 rounded-lg border border-zinc-800"
              >
                Close (ESC)
              </button>
            </div>

            {/* Filters Row */}
            <div className="p-4 bg-[#121215] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const headers = ["ID", "Title", "Category", "Status", "Severity", "Address", "Date"];
                    const rows = filteredIssues.map(i => [i.id, i.title, i.category, i.status, i.severity, i.address, i.createdAt]);
                    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "disruptions.csv";
                    a.click();
                  }}
                  className="bg-[#050505] border border-zinc-800 rounded-xl px-3 py-1.5 text-[10px] text-teal-400 hover:text-[#ededed] font-mono transition"
                >
                  Download CSV
                </button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#050505] border border-zinc-800 rounded-xl pl-7 pr-3 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-500/50 transition w-full sm:w-44"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#050505] border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded px-2.5 py-1.5 cursor-pointer outline-none focus:border-teal-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Potholes">Potholes</option>
                  <option value="Water Leakage">Water Leaks</option>
                  <option value="Broken Streetlights">Streetlights</option>
                  <option value="Waste Management Issues">Waste</option>
                  <option value="Public Safety Hazards">Public Safety</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#050505] border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded px-2.5 py-1.5 cursor-pointer outline-none focus:border-teal-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 divide-y divide-zinc-900">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div 
                    key={issue.id}
                    onClick={() => {
                      onSelectIssue(issue);
                      setShowIncidentRegistryModal(false);
                    }}
                    className="p-4 flex items-start gap-4 hover:bg-[#121215]/80 transition cursor-pointer select-none rounded-lg"
                  >
                    <div className="pt-0.5 flex-shrink-0">
                      <span className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                        issue.severity === "Critical" 
                          ? "bg-red-500/5 text-red-400 border-red-500/10" 
                          : issue.severity === "High"
                          ? "bg-amber-500/5 text-amber-500 border-amber-500/10"
                          : "bg-blue-500/5 text-blue-400 border border-blue-500/15"
                      }`}>
                        {getCategoryIcon(issue.category)}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-zinc-200 truncate">{issue.title}</div>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 truncate font-sans">{issue.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9px] text-zinc-500 font-mono">
                        <span className="text-zinc-400">{issue.address || "Koramangala, Bengaluru"}</span>
                        <span>•</span>
                        <span>Reporter: {issue.creatorName}</span>
                        <span>•</span>
                        <span className="text-teal-400 font-semibold flex items-center gap-0.5">
                          <Check className="h-3 w-3 text-emerald-400" />
                          {issue.verificationsCount} verified
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {getStatusIndicator(issue.status)}
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {new Date(issue.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-zinc-550 space-y-2">
                  <Search className="h-6 w-6 text-zinc-600 mx-auto" />
                  <p className="text-xs font-mono">No matching incident logs found inside sector view bounds.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

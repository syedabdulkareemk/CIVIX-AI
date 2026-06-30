import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  MapPin, 
  User, 
  ChevronRight, 
  Target, 
  TrendingUp, 
  Compass, 
  ShieldCheck, 
  AlertCircle,
  Gem,
  Award
} from "lucide-react";
import { UserProfile, calculateRankFromReputation } from "../lib/firebase";

interface LeaderboardTabProps {
  userProfile: UserProfile | null;
  onSetTab?: (tab: string) => void;
}

// Fixed Neighborhood lists for Area Leaderboard (India-first sectors)
const INITIAL_AREAS = [
  { name: "Koramangala Sector 4 (Bengaluru)", participationScore: 94, resolutionCount: 142, activeCount: 6, points: 12850, trend: "up", health: 92 },
  { name: "Velachery Central (Chennai)", participationScore: 88, resolutionCount: 131, activeCount: 5, points: 11120, trend: "up", health: 85 },
  { name: "Gachibowli Tech Hub (Hyderabad)", participationScore: 85, resolutionCount: 128, activeCount: 4, points: 10980, trend: "stable", health: 88 },
  { name: "Bandra West (Mumbai)", participationScore: 78, resolutionCount: 119, activeCount: 8, points: 9420, trend: "down", health: 76 },
  { name: "Connaught Place Sector (Delhi)", participationScore: 72, resolutionCount: 115, activeCount: 3, points: 8100, trend: "stable", health: 72 },
  { name: "Jayanagar 4th Block (Bengaluru)", participationScore: 81, resolutionCount: 94, activeCount: 2, points: 7950, trend: "up", health: 89 },
  { name: "Indiranagar 100ft Road (Bengaluru)", participationScore: 76, resolutionCount: 82, activeCount: 4, points: 6840, trend: "up", health: 81 },
  { name: "Adyar Circle (Chennai)", participationScore: 68, resolutionCount: 79, activeCount: 3, points: 5720, trend: "stable", health: 68 },
  { name: "HSR Layout Sector 3 (Bengaluru)", participationScore: 65, resolutionCount: 67, activeCount: 1, points: 4650, trend: "up", health: 74 },
  { name: "Salt Lake Sector V (Kolkata)", participationScore: 62, resolutionCount: 55, activeCount: 5, points: 3900, trend: "up", health: 65 },
  { name: "Viman Nagar (Pune)", participationScore: 59, resolutionCount: 48, activeCount: 4, points: 3200, trend: "stable", health: 71 },
];

const INITIAL_CITIZENS = [
  { rankId: 1, uid: "user-1", displayName: "Aarav Sharma", city: "Delhi", reputation: 2450, reports: 18, verifications: 44, resolutions: 12, trustScore: 98, missionSuccess: "94%", photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop" },
  { rankId: 2, uid: "user-2", displayName: "Priya Patel", city: "Ahmedabad", reputation: 1845, reports: 12, verifications: 31, resolutions: 8, trustScore: 95, missionSuccess: "88%", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
  { rankId: 3, uid: "user-3", displayName: "Arjun Mehta", city: "Mumbai", reputation: 1420, reports: 9, verifications: 28, resolutions: 5, trustScore: 92, missionSuccess: "85%", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
  { rankId: 4, uid: "user-4", displayName: "Neha Reddy", city: "Hyderabad", reputation: 1280, reports: 7, verifications: 19, resolutions: 4, trustScore: 96, missionSuccess: "91%", photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop" },
  { rankId: 5, uid: "user-5", displayName: "Rajesh Kumar", city: "Bengaluru", reputation: 980, reports: 11, verifications: 15, resolutions: 3, trustScore: 89, missionSuccess: "79%", photoURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
  { rankId: 6, uid: "user-6", displayName: "Sanya Gupta", city: "Kolkata", reputation: 850, reports: 6, verifications: 22, resolutions: 2, trustScore: 94, missionSuccess: "92%", photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop" },
  { rankId: 7, uid: "user-7", displayName: "Vikram Singh", city: "Jaipur", reputation: 720, reports: 8, verifications: 12, resolutions: 3, trustScore: 85, missionSuccess: "81%", photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  { rankId: 8, uid: "user-8", displayName: "Anjali Rao", city: "Kochi", reputation: 640, reports: 5, verifications: 18, resolutions: 1, trustScore: 97, missionSuccess: "95%", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
  { rankId: 9, uid: "user-9", displayName: "Deepak Verma", city: "Pune", reputation: 590, reports: 4, verifications: 14, resolutions: 2, trustScore: 90, missionSuccess: "87%", photoURL: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop" },
  { rankId: 10, uid: "user-10", displayName: "Kavita Shah", city: "Mumbai", reputation: 510, reports: 3, verifications: 11, resolutions: 1, trustScore: 91, missionSuccess: "89%", photoURL: "https://images.unsplash.com/photo-1488423191186-d3f63b05a1c5?w=80&h=80&fit=crop" },
  { rankId: 11, uid: "user-11", displayName: "Rohan Deshmukh", city: "Pune", reputation: 480, reports: 5, verifications: 9, resolutions: 2, trustScore: 88, missionSuccess: "80%", photoURL: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=80&h=80&fit=crop" },
  { rankId: 12, uid: "user-12", displayName: "Aditi Nair", city: "Kochi", reputation: 440, reports: 4, verifications: 8, resolutions: 1, trustScore: 93, missionSuccess: "85%", photoURL: "https://images.unsplash.com/photo-1534751516642-a131fed10495?w=80&h=80&fit=crop" },
  { rankId: 13, uid: "user-13", displayName: "Suresh Pillai", city: "Chennai", reputation: 410, reports: 6, verifications: 7, resolutions: 0, trustScore: 87, missionSuccess: "75%", photoURL: "https://images.unsplash.com/photo-1506803682981-6e718a9dd3ee?w=80&h=80&fit=crop" },
  { rankId: 14, uid: "user-14", displayName: "Meera Iyer", city: "Chennai", reputation: 380, reports: 3, verifications: 10, resolutions: 1, trustScore: 92, missionSuccess: "90%", photoURL: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&h=80&fit=crop" },
  { rankId: 15, uid: "user-15", displayName: "Rahul Bose", city: "Kolkata", reputation: 350, reports: 5, verifications: 6, resolutions: 1, trustScore: 84, missionSuccess: "83%", photoURL: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop" },
  { rankId: 16, uid: "user-16", displayName: "Amit Mishra", city: "Delhi", reputation: 310, reports: 4, verifications: 5, resolutions: 0, trustScore: 86, missionSuccess: "80%", photoURL: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop" },
  { rankId: 17, uid: "user-17", displayName: "Divya Joshi", city: "Ahmedabad", reputation: 290, reports: 2, verifications: 8, resolutions: 0, trustScore: 90, missionSuccess: "100%", photoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop" },
  { rankId: 18, uid: "user-18", displayName: "Sandeep Yadav", city: "Jaipur", reputation: 260, reports: 3, verifications: 4, resolutions: 1, trustScore: 83, missionSuccess: "75%", photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" },
  { rankId: 19, uid: "user-19", displayName: "Pooja Hegde", city: "Bengaluru", reputation: 230, reports: 2, verifications: 6, resolutions: 0, trustScore: 89, missionSuccess: "88%", photoURL: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&fit=crop" },
  { rankId: 20, uid: "user-20", displayName: "Manoj Bhat", city: "Bengaluru", reputation: 210, reports: 4, verifications: 3, resolutions: 0, trustScore: 82, missionSuccess: "70%", photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  { rankId: 21, uid: "user-21", displayName: "Lakshmi Prasad", city: "Hyderabad", reputation: 180, reports: 1, verifications: 5, resolutions: 0, trustScore: 91, missionSuccess: "90%", photoURL: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=80&h=80&fit=crop" },
  { rankId: 22, uid: "user-22", displayName: "Harish Naik", city: "Pune", reputation: 160, reports: 3, verifications: 2, resolutions: 0, trustScore: 80, missionSuccess: "60%", photoURL: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop" },
  { rankId: 23, uid: "user-23", displayName: "Tanvi Sawant", city: "Mumbai", reputation: 140, reports: 1, verifications: 4, resolutions: 0, trustScore: 85, missionSuccess: "80%", photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop" },
  { rankId: 24, uid: "user-24", displayName: "Vivek Oberoi", city: "Delhi", reputation: 120, reports: 2, verifications: 1, resolutions: 0, trustScore: 78, missionSuccess: "50%", photoURL: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop" },
  { rankId: 25, uid: "user-25", displayName: "Kiran Rao", city: "Hyderabad", reputation: 95, reports: 1, verifications: 2, resolutions: 0, trustScore: 88, missionSuccess: "100%", photoURL: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop" },
  { rankId: 26, uid: "user-26", displayName: "Swati Deshpande", city: "Mumbai", reputation: 80, reports: 1, verifications: 1, resolutions: 0, trustScore: 86, missionSuccess: "75%", photoURL: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop" },
  { rankId: 27, uid: "user-27", displayName: "Nitin Saxena", city: "Jaipur", reputation: 65, reports: 2, verifications: 0, resolutions: 0, trustScore: 75, missionSuccess: "40%", photoURL: "https://images.unsplash.com/photo-1504257400762-57158914024b?w=80&h=80&fit=crop" },
  { rankId: 28, uid: "user-28", displayName: "Shalini Sen", city: "Kolkata", reputation: 50, reports: 0, verifications: 2, resolutions: 0, trustScore: 82, missionSuccess: "100%", photoURL: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop" },
];

export default function LeaderboardTab({ userProfile, onSetTab }: LeaderboardTabProps) {
  if (!userProfile) {
    return <div className="text-center p-8 text-zinc-500 font-mono text-sm">Please sign in to view leaderboard and rank.</div>;
  }
  const [boardType, setBoardType] = useState<"citizens" | "areas">("citizens");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Format Citizens List dynamically by putting user's actual profile in the list
  const currentRank = calculateRankFromReputation(userProfile.reputation);
  
  const citizensList = [...INITIAL_CITIZENS];
  const myIndex = citizensList.findIndex(c => c.uid === userProfile.uid);
  if (myIndex === -1) {
    citizensList.push({
      rankId: 0, 
      uid: userProfile.uid,
      displayName: `${userProfile.displayName} (You)`,
      reputation: userProfile.reputation,
      reports: userProfile.issuesReported,
      verifications: userProfile.issuesVerified,
      resolutions: 0,
      missionSuccess: "100%",
      photoURL: userProfile.photoURL || "",
      city: userProfile.city || "Bengaluru",
      trustScore: userProfile.trustScore || 90
    });
  } else {
    citizensList[myIndex] = {
      ...citizensList[myIndex],
      reputation: userProfile.reputation,
      reports: userProfile.issuesReported,
      verifications: userProfile.issuesVerified,
    };
  }
  
  // Sort by reputation
  citizensList.sort((a, b) => b.reputation - a.reputation);
  
  // Assign rankIds
  const rankedCitizens = citizensList.map((c, idx) => ({ ...c, rankId: idx + 1 }));

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

  const nextTierRP = getNextTierCost(userProfile.reputation);
  const nextTierName = getNextTierName(currentRank);
  const prevTierRP = nextTierRP === 100 ? 0 : nextTierRP === 300 ? 100 : nextTierRP === 600 ? 300 : nextTierRP === 1000 ? 600 : 1000;
  const progressPercent = nextTierRP === userProfile.reputation ? 100 : Math.min(100, Math.max(0, ((userProfile.reputation - prevTierRP) / (nextTierRP - prevTierRP)) * 100));

  const getRankMedal = (rankId: number) => {
    switch (rankId) {
      case 1:
        return <span className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-400 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shadow-lg">1</span>;
      case 2:
        return <span className="h-6 w-6 rounded-full bg-slate-400/10 border border-slate-300 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">2</span>;
      case 3:
        return <span className="h-6 w-6 rounded-full bg-amber-800/10 border border-amber-700 text-amber-600 text-xs font-mono font-bold flex items-center justify-center">3</span>;
      default:
        return <span className="text-zinc-500 text-xs font-mono block w-6 text-center">{rankId}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
      
      {/* Dynamic Profile Progression Area */}
      <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={userProfile.photoURL} alt={userProfile.displayName} className="h-14 w-14 rounded-full border-2 border-teal-500/30 object-cover" />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center text-[10px] text-zinc-950 font-bold" title="Verified Citizen Badge">
                ✓
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-base font-bold text-[#ededed]">{userProfile.displayName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-teal-500/10 border border-teal-500/25 text-teal-400 font-mono px-2 py-0.5 rounded uppercase font-bold">
                  {currentRank}
                </span>
                <span className="text-zinc-500 text-xs font-mono">•</span>
                <span className="text-xs text-zinc-300 font-mono">
                  <strong className="text-teal-400">{userProfile.reputation}</strong> RP Total
                </span>
              </div>
            </div>
          </div>

          {/* Meter progress bar */}
          <div className="w-full md:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-zinc-400">Progression tracker to {nextTierName}</span>
              {nextTierName !== "Max Rank Reached" && (
                <span className="text-[10px] text-zinc-300 font-mono">
                  {userProfile.reputation}/{nextTierRP} RP
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-[#050505] rounded-full overflow-hidden border border-[#1f1f21]">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {nextTierName !== "Max Rank Reached" && (
              <p className="text-[10px] text-zinc-500 text-right font-sans italic">
                Secure {nextTierRP - userProfile.reputation} additional RP to level up
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard selector buttons */}
      <div className="flex p-0.5 bg-[#050505] border border-[#1f1f21] rounded-xl max-w-sm">
        <button
          onClick={() => setBoardType("citizens")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold font-sans transition flex items-center justify-center gap-2 ${
            boardType === "citizens"
              ? "bg-[#0f0f11] text-[#ededed] border border-[#1f1f21]"
              : "text-zinc-400 hover:text-zinc-150"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Citizen Leaderboard
        </button>
        <button
          onClick={() => setBoardType("areas")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold font-sans transition flex items-center justify-center gap-2 ${
            boardType === "areas"
              ? "bg-[#0f0f11] text-[#ededed] border border-[#1f1f21]"
              : "text-zinc-400 hover:text-zinc-150"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Area Leaderboard
        </button>
      </div>

      {/* Leaderboard Lists */}
      <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl overflow-hidden shadow-xl">
        {boardType === "citizens" ? (
          <div>
            <div className="p-4 border-b border-[#1f1f21] bg-[#111113]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Top Contributors</span>
                <span className="text-[11px] text-zinc-400">Search and find verifiers in your region</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search citizen by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#050505] border border-[#1f1f21] rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-500/50 transition w-full sm:w-64"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[480px] overflow-y-auto divide-y divide-zinc-200/50 dark:divide-[#1f1f21]/40 custom-scrollbar relative">
              {rankedCitizens
                .filter(item => item.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => {
                  const isCurrentUser = item.uid === userProfile.uid;
                  const innerRank = calculateRankFromReputation(item.reputation);
                  
                  return (
                    <div 
                      key={item.uid}
                      onClick={() => setSelectedUser(selectedUser === item.uid ? null : item.uid)}
                      className={`flex flex-col p-4 transition cursor-pointer relative ${
                        isCurrentUser 
                          ? "bg-teal-500/5 dark:bg-teal-950/15 border-l-4 border-l-teal-500 border-y border-teal-500/10 dark:border-teal-500/10 shadow-[0_0_12px_rgba(20,184,166,0.06)]" 
                          : "hover:bg-zinc-100/50 dark:hover:bg-[#121215]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Placement */}
                          {getRankMedal(item.rankId)}

                          {/* Image */}
                          <img src={item.photoURL} alt={item.displayName} className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-[#1f1f21]" />
                          
                          {/* Name & Title */}
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                              {item.displayName}
                              {isCurrentUser && (
                                <span className="text-[8px] bg-teal-500/15 text-teal-650 dark:text-teal-400 font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-extrabold">YOU</span>
                              )}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                              <span className="text-teal-650 dark:text-teal-400">{innerRank}</span>
                              {item.city && <span>• {item.city}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-teal-650 dark:text-teal-400 block">{item.reputation} RP</span>
                        </div>
                      </div>

                      {/* Expandable Stats */}
                      {selectedUser === item.uid && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-4 pt-4 border-t border-zinc-200 dark:border-[#1f1f21]/60 grid grid-cols-4 gap-2"
                        >
                          <div className="text-center p-2 rounded-lg bg-zinc-100 dark:bg-[#050505]">
                            <span className="text-[9px] text-zinc-500 uppercase block">Reports</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.reports}</span>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-zinc-100 dark:bg-[#050505]">
                            <span className="text-[9px] text-zinc-500 uppercase block">Verifies</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.verifications}</span>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-zinc-100 dark:bg-[#050505]">
                            <span className="text-[9px] text-zinc-500 uppercase block">Resolved</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.resolutions || 0}</span>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-zinc-100 dark:bg-[#050505]">
                            <span className="text-[9px] text-zinc-500 uppercase block">Success</span>
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-500">{item.missionSuccess || "N/A"}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              {rankedCitizens.filter(item => item.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="p-8 text-center text-xs font-mono text-zinc-500">
                  No citizens matching search query found in database logs.
                </div>
              )}
            </div>

            {/* STICKY CURRENT USER STANDINGS FOOTER */}
            {(() => {
              const userInLeaderboard = rankedCitizens.find(c => c.uid === userProfile.uid);
              const userRankPosition = userInLeaderboard ? userInLeaderboard.rankId : rankedCitizens.length + 1;
              return (
                <div className="sticky bottom-0 bg-white/95 dark:bg-[#0f0f11]/95 backdrop-blur-md border-t border-teal-500/20 p-4 flex items-center justify-between rounded-b-xl shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xs font-mono font-bold text-teal-600 dark:text-teal-450">
                      #{userRankPosition}
                    </div>
                    <img 
                      src={userProfile.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"} 
                      alt={userProfile.displayName} 
                      className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" 
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {userProfile.displayName}
                        <span className="text-[8px] bg-teal-500/10 text-teal-650 dark:text-teal-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold">YOU</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        Rank: <span className="text-teal-650 dark:text-teal-400">{calculateRankFromReputation(userProfile.reputation)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-teal-600 dark:text-teal-400">{userProfile.reputation} RP</div>
                    <div className="text-[9px] text-zinc-500 font-mono">Keep earning RP to advance!</div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-[#1f1f21] bg-[#111113]/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Neighborhood / Areas</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Active Activity Score</span>
            </div>

            <div className="max-h-[480px] overflow-y-auto divide-y divide-[#1f1f21]/40 custom-scrollbar">
              {INITIAL_AREAS.map((item, idx) => {
                return (
                  <div 
                    key={item.name}
                    className="flex items-center justify-between p-4 hover:bg-[#121215]/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-xs font-mono block w-6 text-center">{idx + 1}</span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#ededed] block">
                            {item.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            item.health >= 85 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {item.health}% Health
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <span className="text-teal-400 font-semibold">{item.participationScore}% participation</span>
                          <span>•</span>
                          <span>{item.resolutionCount} resolved</span>
                          <span>•</span>
                          <span className="text-red-400">{item.activeCount} active</span>
                        </div>
                      </div>
                    </div>

                    {/* Points detail */}
                    <div className="text-right space-y-0.5">
                      <span className="text-xs font-mono font-semibold text-zinc-200 block">{item.points.toLocaleString()} RP</span>
                      <div className="flex items-center justify-end gap-1 text-[9px] font-mono text-zinc-500">
                        {item.trend === "up" ? <TrendingUp className="h-3 w-3 text-teal-400" /> : <AlertCircle className="h-3 w-3 text-amber-400" />}
                        <span>{item.trend === "up" ? "trending up" : "stable"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RP Earning Guide Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#1f1f21] bg-[#0c0c0e] p-4 rounded-xl flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/5 border border-teal-500/10 flex items-center justify-center flex-shrink-0 text-teal-400">
            <Compass className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-300 block">Report Issue</span>
            <p className="text-[11px] text-zinc-550 leading-normal">Take a photo of any city damage. Verified logs secure <strong className="text-teal-400">+50 RP</strong>.</p>
          </div>
        </div>

        <div className="border border-[#1f1f21] bg-[#0c0c0e] p-4 rounded-xl flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-400">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-300 block">Verify Report</span>
            <p className="text-[11px] text-zinc-550 leading-normal">Review and validate logs in your viewport. Earn <strong className="text-amber-400">+25 RP</strong>.</p>
          </div>
        </div>

        <div className="border border-[#1f1f21] bg-[#0c0c0e] p-4 rounded-xl flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Award className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-300 block">Confirm Resolution</span>
            <p className="text-[11px] text-zinc-550 leading-normal">Confirm resolving works to earn a bonus of <strong className="text-emerald-400">+75 RP</strong>.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

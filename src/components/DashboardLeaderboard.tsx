import React, { useMemo, useEffect, useRef } from "react";
import { Trophy, Award, Zap, Check, ChevronUp, ChevronDown, User } from "lucide-react";
import { UserProfile } from "../types";

interface DashboardLeaderboardProps {
  userProfile?: UserProfile | null;
}

const baseMockCitizens = [
  { name: "Aarav Sharma", pts: 2450, pic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop", verifications: 42, role: "Senior Scout", dailyChange: 120, streak: 14 },
  { name: "Priya Patel", pts: 1845, pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", verifications: 31, role: "Trusted Verifier", dailyChange: 85, streak: 9 },
  { name: "Arjun Mehta", pts: 1420, pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", verifications: 25, role: "Lead Inspector", dailyChange: -30, streak: 6 },
  { name: "Rajesh Kumar", pts: 1280, pic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", verifications: 21, role: "Civic Guardian", dailyChange: 45, streak: 8 },
  { name: "Ananya Iyer", pts: 1150, pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", verifications: 19, role: "Active Verifier", dailyChange: 60, streak: 5 },
  { name: "Vikram Singh", pts: 950, pic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop", verifications: 14, role: "Local Hero", dailyChange: 15, streak: 3 },
  { name: "Sunita Rao", pts: 910, pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", verifications: 12, role: "Local Hero", dailyChange: 50, streak: 4 },
  { name: "Rohan Deshmukh", pts: 850, pic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", verifications: 11, role: "Civic Scout", dailyChange: 20, streak: 2 },
  { name: "Meera Nair", pts: 780, pic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", verifications: 10, role: "Active Scout", dailyChange: 40, streak: 7 },
  { name: "Kabir Sen", pts: 720, pic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", verifications: 9, role: "Active Scout", dailyChange: 0, streak: 1 },
  { name: "Deepika Joshi", pts: 690, pic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop", verifications: 8, role: "Active Scout", dailyChange: 35, streak: 3 },
  { name: "Amit Trivedi", pts: 640, pic: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&h=100&fit=crop", verifications: 7, role: "Civic Scout", dailyChange: 10, streak: 2 },
  { name: "Neha Gupta", pts: 590, pic: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", verifications: 7, role: "Volunteer Scout", dailyChange: 15, streak: 1 },
  { name: "Devendra Verma", pts: 530, pic: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop", verifications: 6, role: "Volunteer Scout", dailyChange: 0, streak: 0 },
  { name: "Sanjay Dutt", pts: 490, pic: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop", verifications: 5, role: "Volunteer", dailyChange: 25, streak: 2 },
  { name: "Pooja Hegde", pts: 450, pic: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", verifications: 5, role: "Volunteer", dailyChange: -5, streak: 0 },
  { name: "Harish Salve", pts: 410, pic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", verifications: 4, role: "Volunteer", dailyChange: 5, streak: 1 },
  { name: "Shalini Mishra", pts: 380, pic: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop", verifications: 4, role: "Volunteer", dailyChange: 10, streak: 1 },
  { name: "Gautam Gambhir", pts: 350, pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", verifications: 3, role: "Novice Verifier", dailyChange: 30, streak: 2 },
  { name: "Kiran Shah", pts: 320, pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", verifications: 3, role: "Novice Verifier", dailyChange: 12, streak: 1 },
  { name: "Rahul Dravid", pts: 300, pic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", verifications: 2, role: "Novice", dailyChange: 50, streak: 3 },
  { name: "Sachin Tendulkar", pts: 280, pic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop", verifications: 2, role: "Novice", dailyChange: 15, streak: 1 },
  { name: "Abhinav Bindra", pts: 260, pic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", verifications: 2, role: "Novice", dailyChange: 0, streak: 0 },
  { name: "Mary Kom", pts: 240, pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", verifications: 1, role: "Novice", dailyChange: 10, streak: 1 },
  { name: "PV Sindhu", pts: 220, pic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", verifications: 1, role: "Novice", dailyChange: 5, streak: 1 },
  { name: "Viswanathan Anand", pts: 200, pic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", verifications: 1, role: "Observer", dailyChange: 20, streak: 2 },
  { name: "Sunil Chhetri", pts: 180, pic: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&h=100&fit=crop", verifications: 0, role: "Observer", dailyChange: 0, streak: 0 },
  { name: "Mithali Raj", pts: 150, pic: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", verifications: 0, role: "Observer", dailyChange: 10, streak: 1 },
  { name: "Sania Mirza", pts: 120, pic: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop", verifications: 0, role: "Observer", dailyChange: 0, streak: 0 },
  { name: "Neeraj Chopra", pts: 100, pic: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop", verifications: 0, role: "Observer", dailyChange: 35, streak: 3 }
];

export default function DashboardLeaderboard({ userProfile }: DashboardLeaderboardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLDivElement>(null);

  const leaderboardList = useMemo(() => {
    let list = baseMockCitizens.map((c) => ({
      ...c,
      uid: c.name.toLowerCase().replace(/\s+/g, "-"),
      isMe: false,
    }));

    if (userProfile) {
      const existingIdx = list.findIndex(
        (c) => c.uid === userProfile.uid || c.name.toLowerCase() === userProfile.displayName?.toLowerCase()
      );
      if (existingIdx >= 0) {
        list[existingIdx].pts = userProfile.reputation || 0;
        list[existingIdx].verifications = userProfile.issuesVerified || 0;
        list[existingIdx].isMe = true;
      } else {
        list.push({
          name: userProfile.displayName || "Logged-in Hero",
          pts: userProfile.reputation || 0,
          pic: userProfile.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verifications: userProfile.issuesVerified || 0,
          role: userProfile.rank || "Novice Scout",
          dailyChange: 45,
          streak: 2,
          uid: userProfile.uid,
          isMe: true,
        });
      }
    }

    list.sort((a, b) => b.pts - a.pts);

    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [userProfile]);

  const handleCenterOnMe = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    // Automatically center on active user after loading
    const timer = setTimeout(() => {
      if (userRowRef.current) {
        userRowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [leaderboardList]);

  return (
    <div className="flex flex-col h-full bg-[#0f0f11] border border-zinc-800/80 p-5 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-yellow-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#ededed] font-bold">
              Consensus Leaderboard
            </h3>
            <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
              30 Live Sector Citizens
            </p>
          </div>
        </div>
        {userProfile && (
          <button
            onClick={handleCenterOnMe}
            className="text-[9px] font-mono px-2 py-1 rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition cursor-pointer"
          >
            🎯 Locate Me
          </button>
        )}
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[420px]"
      >
        {leaderboardList.map((item) => {
          const isTop3 = item.rank <= 3;
          let rankIcon = item.rank.toString();
          let borderStyle = "border-zinc-900 bg-[#070709]";
          let textStyle = "text-zinc-300";

          if (item.rank === 1) {
            rankIcon = "🥇";
            borderStyle = "border-yellow-500/25 bg-gradient-to-r from-[#17160d] to-[#0a0a0d] shadow-[0_0_12px_rgba(234,179,8,0.05)]";
            textStyle = "text-yellow-400 font-bold";
          } else if (item.rank === 2) {
            rankIcon = "🥈";
            borderStyle = "border-slate-400/20 bg-gradient-to-r from-[#111316] to-[#0a0a0d]";
            textStyle = "text-slate-300 font-bold";
          } else if (item.rank === 3) {
            rankIcon = "🥉";
            borderStyle = "border-amber-700/20 bg-gradient-to-r from-[#14100c] to-[#0a0a0d]";
            textStyle = "text-amber-500 font-bold";
          }

          if (item.isMe) {
            borderStyle = "border-teal-500 ring-2 ring-teal-500/10 bg-[#0c1616] shadow-[0_0_15px_rgba(20,184,166,0.1)]";
          }

          return (
            <div
              key={item.uid}
              ref={item.isMe ? userRowRef : undefined}
              data-is-me={item.isMe ? "true" : "false"}
              className={`flex items-center justify-between p-3 rounded-xl border ${borderStyle} transition-all duration-200 group hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank indicator */}
                <div className="w-6 text-center text-xs font-mono font-bold flex-shrink-0">
                  <span className={textStyle}>{rankIcon}</span>
                </div>

                {/* Profile Pic with Online status */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.pic}
                    alt={item.name}
                    className="h-8.5 w-8.5 rounded-full object-cover border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#0f0f11]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate block ${item.isMe ? "text-teal-300" : "text-zinc-200 group-hover:text-teal-400 transition"}`}>
                      {item.name}
                    </span>
                    {item.isMe && (
                      <span className="text-[8px] bg-teal-500/20 text-teal-300 font-mono font-bold px-1 rounded uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono mt-0.5">
                    <span>{item.role}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-orange-400">
                      <Zap className="h-2.5 w-2.5 fill-orange-400/20" />
                      {item.streak}d streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0 pl-2">
                <span className={`text-xs font-mono font-bold block ${item.isMe ? "text-teal-400" : "text-[#ededed]"}`}>
                  {item.pts.toLocaleString()} RP
                </span>
                
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[8px] text-zinc-500 font-mono flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5 text-zinc-600" />
                    {item.verifications}
                  </span>
                  {item.dailyChange !== 0 && (
                    <span className={`text-[8px] font-mono flex items-center ${item.dailyChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {item.dailyChange > 0 ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                      {Math.abs(item.dailyChange)}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

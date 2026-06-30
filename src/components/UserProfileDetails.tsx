import React, { useState } from "react";
import { motion } from "motion/react";
import { UserProfile, Issue } from "../types";
import { 
  Award, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Clock,
  Compass,
  Settings,
  LogOut,
  Shield,
  Calendar,
  Globe,
  User,
  X,
  Check,
  TrendingUp,
  AwardIcon,
  Laptop,
  Sun,
  Moon
} from "lucide-react";
import { saveUserProfileToFirestore } from "../lib/firebase";

interface UserProfileDetailsProps {
  userProfile: UserProfile | null;
  issues: Issue[];
  onSignOut?: () => void;
  onReplayOnboarding?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  theme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

export default function UserProfileDetails({
  userProfile,
  issues,
  onSignOut,
  onReplayOnboarding,
  onUpdateProfile,
  theme = "system",
  onThemeChange
}: UserProfileDetailsProps) {
  if (!userProfile) {
    return <div className="text-center p-8 text-zinc-500 font-mono text-sm">Please sign in to view your profile details.</div>;
  }

  const [filterMode, setFilterMode] = useState<"mine" | "all">("mine");
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editName, setEditName] = useState(userProfile.displayName);
  const [editGender, setEditGender] = useState(userProfile.gender || "Male");
  const [editCity, setEditCity] = useState(userProfile.city || "");
  const [editState, setEditState] = useState(userProfile.state || "");
  const [editLanguage, setEditLanguage] = useState(userProfile.preferredLanguage || "English");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync edits if profile changes
  React.useEffect(() => {
    setEditName(userProfile.displayName);
    setEditGender(userProfile.gender || "Male");
    setEditCity(userProfile.city || "");
    setEditState(userProfile.state || "");
    setEditLanguage(userProfile.preferredLanguage || "English");
  }, [userProfile]);

  const displayReports = filterMode === "mine" 
    ? issues.filter(i => i.creatorId === userProfile.uid)
    : issues;

  // Calculates percentage progression inside rank based on RP
  const getRankThresholds = (rank: string) => {
    switch (rank) {
      case "Citizen": return { min: 0, max: 100, next: "Scout" };
      case "Scout": return { min: 100, max: 300, next: "Verifier" };
      case "Verifier": return { min: 300, max: 600, next: "Inspector" };
      case "Inspector": return { min: 600, max: 1200, next: "Guardian" };
      case "Guardian": return { min: 1200, max: 2000, next: "Community Hero" };
      default: return { min: 2000, max: 5000, next: "Master" };
    }
  };

  const thresholds = getRankThresholds(userProfile.rank);
  const repInRank = userProfile.reputation - thresholds.min;
  const rankPercent = Math.min(100, Math.max(0, Math.round((repInRank / (thresholds.max - thresholds.min)) * 100)));

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "Eye":
        return <Eye className="h-5 w-5 text-teal-400" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      default:
        return <Award className="h-5 w-5 text-amber-500" />;
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editCity.trim() || !editState.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        displayName: editName.trim(),
        gender: editGender,
        city: editCity.trim(),
        state: editState.trim(),
        preferredLanguage: editLanguage,
        area: `${editCity.trim()}, ${editState.trim()}`
      };

      await saveUserProfileToFirestore(updatedProfile);
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditingSettings(false);
      }, 1500);
      
      // Update local state if bound reactively
      if (!onUpdateProfile) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-8 pb-16">
      
      {/* PROFESSIONAL STARTUP HERO CARD */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#1f1f21] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* User Identity section */}
        <div className="flex items-center gap-4.5 flex-1">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-teal-500/20 blur-sm pointer-events-none" />
            <img 
              src={userProfile.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"} 
              alt={userProfile.displayName} 
              referrerPolicy="no-referrer"
              className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-[#1f1f21] object-cover relative z-10"
            />
            <span className="absolute bottom-0 right-0 h-5.5 w-5.5 rounded-full bg-teal-500 border border-[#050505] text-[10px] flex items-center justify-center font-extrabold text-[#050505] z-20 shadow-md">
              ✓
            </span>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-zinc-55 tracking-tight">{userProfile.displayName}</h1>
              <span className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 text-teal-400 text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-zinc-400">{userProfile.email}</p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-400" /> {userProfile.area || "Area Not Set"}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-zinc-400" /> Joined {userProfile.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "June 2026"}</span>
              {userProfile.preferredLanguage && <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-zinc-400" /> {userProfile.preferredLanguage}</span>}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <button 
                onClick={() => setIsEditingSettings(true)}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-teal-500/10 to-teal-500/5 hover:from-teal-500/15 hover:to-teal-500/10 text-teal-400 hover:text-teal-300 border border-teal-500/20 hover:border-teal-500/35 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-semibold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 hover:scale-[1.015]"
              >
                <Settings className="h-4 w-4 text-teal-400" /> Update Profile Settings
              </button>
              {onReplayOnboarding && (
                <button 
                  onClick={onReplayOnboarding}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 hover:from-blue-500/15 hover:to-blue-500/10 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/35 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-semibold text-xs uppercase tracking-wider shadow-lg transition-all duration-200 hover:scale-[1.015]"
                >
                  <Compass className="h-4 w-4 text-blue-400" /> Replay Platform Tour
                </button>
              )}
              <button 
                onClick={() => {
                  if (onSignOut) onSignOut();
                }}
                className="py-3 px-6 bg-red-950/25 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-semibold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.015]"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic impact analytics count box */}
        <div className="grid grid-cols-3 gap-4 bg-[#0f0f11]/45 p-4 rounded-xl border border-[#1f1f21] min-w-[280px]">
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Reports</span>
            <span className="text-lg font-sans font-extrabold text-zinc-100 block mt-0.5">{issues.filter(i => i.creatorId === userProfile.uid).length}</span>
          </div>
          <div className="text-center border-x border-[#1f1f21] px-4">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Verified</span>
            <span className="text-lg font-sans font-extrabold text-zinc-100 block mt-0.5">{userProfile.issuesVerified}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Missions</span>
            <span className="text-lg font-sans font-extrabold text-zinc-100 block mt-0.5">{userProfile.missionsCompleted || 0}</span>
          </div>
        </div>

      </div>

      {/* THREE BENTO CARDS FOR RATINGS AND SCORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TRUST SCORE */}
        <div className="glass-panel p-5 rounded-xl border border-[#1f1f21] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Trust Verification Score</span>
            <span className="text-2xl font-bold text-teal-400 block mt-1">{userProfile.trustScore ?? 100}%</span>
            <p className="text-[10px] text-zinc-400 mt-1">Excellent verification accuracy rating.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        {/* AREA RANKING */}
        <div className="glass-panel p-5 rounded-xl border border-[#1f1f21] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Local Sector Ranking</span>
            <span className="text-2xl font-bold text-blue-400 block mt-1">
              {"#" + Math.max(1, 53 - Math.floor((userProfile.reputation || 0) / 15))}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">Top contributor in your local ward.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MapPin className="h-6 w-6" />
          </div>
        </div>

        {/* NATIONAL RANKING */}
        <div className="glass-panel p-5 rounded-xl border border-[#1f1f21] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">National Hero Ranking</span>
            <span className="text-2xl font-bold text-purple-400 block mt-1">
              {"#" + Math.max(1, 1452 - Math.floor((userProfile.reputation || 0) * 1.5)).toLocaleString()}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">Among top active Indian verifiers.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <AwardIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* CORE SPLIT: LEVEL PROGRESSION AND UNLOCKED ACHIEVEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PROGRESS BLOCK */}
        <div className="glass-panel p-5 rounded-xl border border-[#1f1f21] space-y-4">
          <h2 className="text-xs text-zinc-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-teal-400" />
            Rank Progress HUD
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">{userProfile.reputation} / {thresholds.max} RP</span>
              <span className="text-teal-400 font-semibold">{rankPercent}% Complete</span>
            </div>
            
            <div className="relative h-2 w-full bg-[#050505] rounded-full overflow-hidden border border-[#1f1f21]">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
                style={{ width: `${rankPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Collect <span className="text-zinc-200 font-semibold">{thresholds.max - userProfile.reputation} RP</span> to advance your municipal rating to the prestigious <span className="text-teal-400 font-semibold">{thresholds.next}</span> tier.
            </p>
          </div>

          <div className="border-t border-[#1f1f21] pt-4 space-y-2 text-xs">
            <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider block">Community Impact Rating</span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {userProfile.displayName}'s reports have elevated confidence ratings and successfully catalyzed active hazard resolutions across the region.
            </p>
          </div>
        </div>

        {/* UNLOCKED BADGES AND ACHIEVEMENTS (2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Unlocked Achievements ({userProfile.achievements?.length || 0})</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(userProfile.achievements || []).map((ach) => (
              <div key={ach.id} className="glass-panel p-4 rounded-xl border border-[#1f1f21] hover:border-[#1f1f21]/85 hover:bg-[#1f1f21]/15 flex items-start gap-3.5 transition">
                <span className="h-10 w-10 bg-[#050505]/60 border border-[#1f1f21] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  {getAchievementIcon(ach.icon)}
                </span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#ededed]">{ach.title}</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{ach.description}</p>
                  <span className="text-[9px] text-zinc-500 font-mono block pt-1">
                    Unlocked: {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Seed locks */}
            <div className="border border-dashed border-[#1f1f21] p-4 rounded-xl flex items-start gap-3.5 opacity-40">
              <span className="h-10 w-10 bg-[#050505] border border-[#1f1f21] rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-zinc-405" />
              </span>
              <div className="space-y-1">
                <div className="text-xs font-bold text-zinc-405">Guardian Signet [Locked]</div>
                <p className="text-[11px] text-zinc-500">Achieve 3,000 XP in active civic system missions.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* HISTORIC FIELD CONTRIBUTION TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-4 w-4 text-zinc-500" />
            Historic Field Logs
          </div>
          <button
            onClick={() => setFilterMode(filterMode === "mine" ? "all" : "mine")}
            className="text-[10px] bg-[#1f1f21] text-zinc-300 px-3 py-1 rounded-full font-mono hover:bg-zinc-700 transition cursor-pointer"
          >
            {filterMode === "mine" ? "Showing My Issues" : "Showing All Issues"}
          </button>
        </div>

        <div className="glass-panel rounded-xl border border-[#1f1f21] divide-y divide-[#1f1f21] overflow-hidden">
          {displayReports.length > 0 ? (
            displayReports.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between hover:bg-[#1f1f21]/10 transition">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-[#050505] flex items-center justify-center text-zinc-500 border border-[#1f1f21]">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-medium text-[#ededed]">{report.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{report.category} • {report.address || "Sector Point"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    report.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(report.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No recent coordinates reports logged. Pick up missions in Mission Control.
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE SETTINGS MODAL */}
      {isEditingSettings && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f0f11] border border-[#1f1f21] p-6 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-4 w-4 text-teal-400" /> Profile Settings
              </h3>
              <button 
                onClick={() => setIsEditingSettings(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 block">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1f1f21] rounded-xl py-2 px-3 text-sm text-[#ededed] focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 block">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditGender(g)}
                      className={`py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        editGender === g
                          ? "bg-teal-500/10 border-teal-500 text-teal-400"
                          : "bg-[#050505] border-[#1f1f21] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400 block">City</label>
                  <input 
                    type="text" 
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1f1f21] rounded-xl py-2 px-3 text-sm text-[#ededed] focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400 block">State</label>
                  <input 
                    type="text" 
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1f1f21] rounded-xl py-2 px-3 text-sm text-[#ededed] focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 block">Appearance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: "system", label: "System", icon: Laptop },
                    { mode: "dark", label: "Dark", icon: Moon },
                    { mode: "light", label: "Light", icon: Sun }
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onThemeChange?.(mode as any)}
                      className={`py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        theme === mode
                          ? "bg-teal-500/10 border-teal-500 text-teal-400"
                          : "bg-[#050505] border-[#1f1f21] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 block">Preferred Language</label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1f1f21] rounded-xl py-2 px-3 text-sm text-[#ededed] focus:border-teal-500 outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi / हिन्दी</option>
                  <option value="Bengali">Bengali / বাংলা</option>
                  <option value="Marathi">Marathi / मराठी</option>
                  <option value="Telugu">Telugu / తెలుగు</option>
                  <option value="Tamil">Tamil / தமிழ்</option>
                  <option value="Gujarati">Gujarati / ગુજરાતી</option>
                  <option value="Kannada">Kannada / ಕನ್ನಡ</option>
                  <option value="Odia">Odia / ଓଡ଼ିଆ</option>
                  <option value="Malayalam">Malayalam / മലയാളം</option>
                  <option value="Punjabi">Punjabi / ਪੰਜਾਬੀ</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isSaving ? (
                  "Saving Settings..."
                ) : saveSuccess ? (
                  <span className="flex items-center gap-1 text-teal-950 font-bold"><Check className="h-4 w-4" /> Settings Saved!</span>
                ) : (
                  "Update Profile Details"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

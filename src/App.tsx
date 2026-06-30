import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Issue, Cluster, NeighborhoodHealth, PredictiveInsight, Mission } from "./types";
import CommandCenter from "./components/CommandCenter";
import ReportForm from "./components/ReportForm";
import MissionsControl from "./components/MissionsControl";
import UserProfileDetails from "./components/UserProfileDetails";
import IssueDetailModal from "./components/IssueDetailModal";
import InteractiveMap from "./components/InteractiveMap";
import LeaderboardTab from "./components/LeaderboardTab";
import NotificationDrawer from "./components/NotificationDrawer";
import { VerificationModal } from "./components/VerificationModal";
import { ResolutionModal } from "./components/ResolutionModal";
import AITester from "./components/AITester";
import MunicipalDashboard from "./components/MunicipalDashboard";
import { Toaster, toast } from "sonner";
import LoginPage from "./components/auth/LoginPage";
import OnboardingScreen from "./components/auth/OnboardingScreen";
import CelebrationModal from "./components/CelebrationModal";
import { 
  getPersistedUserProfile,
  savePersistedUserProfile,
  getStoredNotifications,
  saveNotifications,
  UserProfile,
  NotificationItem,
  calculateRankFromReputation,
  getAuth,
  onAuthStateChanged,
  signOut,
  isRealFirebase,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  saveVerificationToFirestore,
  getUserVerificationsFromFirestore
} from "./lib/firebase";

import { 
  Compass, 
  Activity, 
  User, 
  MapIcon, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Award,
  AlertOctagon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Loader2,
  Bell,
  Trophy,
  Sun,
  Moon,
  Laptop
} from "lucide-react";

type ViewTab = "command-center" | "map-grid" | "missions" | "profile" | "leaderboards" | "ai-lab" | "civic-ops";

import HyperlocalNotifications from "./components/HyperlocalNotifications";

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>("command-center");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportInitialData, setReportInitialData] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<Issue | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState<Issue | null>(null);
  
  // Theme System
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as any) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: "light" | "dark" | "system") => {
      root.classList.remove("light", "dark");
      let resolvedTheme = t;
      if (t === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      root.classList.add(resolvedTheme);
      root.setAttribute("data-theme", resolvedTheme);
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme("system");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  // Core Synchronized and Persistent State variables
  const [issues, setIssues] = useState<Issue[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [health, setHealth] = useState<NeighborhoodHealth>({ 
    score: 84, 
    rankInCity: 4, 
    totalAreas: 14, 
    cleanlinessRating: 8.2, 
    safetyRating: 8.6, 
    infraRating: 8.0, 
    participationRating: 9.0 
  });
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  
  // Real Persistent User and Notification states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [verifiedIssueIds, setVerifiedIssueIds] = useState<string[]>([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [celebrationEvent, setCelebrationEvent] = useState<{ activityType: "report" | "verify" | "resolution" | "mission"; repGained: number; previousRep: number; newRep: number } | null>(null);
  const [rollbackCache, setRollbackCache] = useState<{ profile: UserProfile; issues: Issue[] } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // UI status elements
  const [isLoading, setIsLoading] = useState(true);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; subtext?: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Trigger global scannable float TOAST notifications
  const triggerToast = (text: string, subtext?: string) => {
    toast(text, { description: subtext });
  };

  const syncProfileToServer = async (profile: UserProfile) => {
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile })
      });
    } catch (err) {
      console.error("Failed to sync profile to server:", err);
    }
  };

  // Synchronize state from backend endpoints and local storage values
  const fetchAllData = async () => {
    try {
      // 1. Fetch Issues from REST server api
      try {
        const issuesRes = await fetch("/api/issues");
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          setIssues(issuesData);
        }
      } catch (err) {
        console.error("Failed to load issues:", err);
      }

      // 2. Fetch Clusters
      try {
        const clustersRes = await fetch("/api/clusters");
        if (clustersRes.ok) {
          const clustersData = await clustersRes.json();
          setClusters(clustersData);
        }
      } catch (err) {
        console.error("Failed to load clusters:", err);
      }

      // 3. Fetch Neighborhood Health Score indicators
      try {
        const healthRes = await fetch("/api/neighborhood-health");
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealth(healthData);
        }
      } catch (err) {
        console.error("Failed to load neighborhood health:", err);
      }

      // 4. Fetch Predictive insights timeline
      try {
        const insightsRes = await fetch("/api/predictive-insights");
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
        }
      } catch (err) {
        console.error("Failed to load predictive insights:", err);
      }

      // 5. Fetch Active community missions
      try {
        const missionsRes = await fetch("/api/missions");
        if (missionsRes.ok) {
          const missionsData = await missionsRes.json();
          setMissions(missionsData);
        }
      } catch (err) {
        console.error("Failed to load missions:", err);
      }

    } catch (err) {
      console.error("Critical: Failed to sync physical civic servers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial startup hook loader
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setIsAuthenticated(true);
        // Load user profile from Firestore directly
        try {
          const loadedProfile = await getUserProfileFromFirestore(user.uid);
          let activeProfile: UserProfile;
          if (loadedProfile && loadedProfile.isOnboarded) {
            activeProfile = loadedProfile;
          } else {
            // Needs onboarding
            activeProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "New Hero",
              photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
              rank: "Citizen",
              xp: 0,
              reputation: 0,
              issuesReported: 0,
              issuesVerified: 0,
              missionsCompleted: 0,
              completedMissionsList: [],
              achievements: [],
              isOnboarded: false
            };
          }
          setUserProfile(activeProfile);
          await syncProfileToServer(activeProfile);
          const verifications = await getUserVerificationsFromFirestore(user.uid);
          setVerifiedIssueIds(verifications);
        } catch (err) {
          console.error("Error loading profile:", err);
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "New Hero",
            photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
            rank: "Citizen",
            xp: 0,
            reputation: 0,
            issuesReported: 0,
            issuesVerified: 0,
            missionsCompleted: 0,
            completedMissionsList: [],
            achievements: [],
            isOnboarded: false
          };
          setUserProfile(fallbackProfile);
          await syncProfileToServer(fallbackProfile);
          const verifications = await getUserVerificationsFromFirestore(user.uid);
          setVerifiedIssueIds(verifications);
        }
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    const startupHook = async () => {
      setIsLoading(true);
      const loadedNotifs = getStoredNotifications();
      setNotifications(loadedNotifs);
      
      // Get location and seed nearby
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          try {
            await fetch(`/api/seed-nearby?lat=${latitude}&lng=${longitude}`);
            await fetchAllData();
          } catch (e) {
            console.error("Failed to seed nearby issues", e);
            await fetchAllData();
          }
        }, async () => {
          await fetchAllData();
        }, { timeout: 5000 });
      } else {
        await fetchAllData();
      }
      setIsLoading(false);
    };
    
    startupHook();
    return () => unsubscribe();
  }, []);

  // Sync selected issue details dynamically if the underlying issue list is mutated
  useEffect(() => {
    if (selectedIssue) {
      const updated = issues.find(i => i.id === selectedIssue.id);
      if (updated) setSelectedIssue(updated);
    }
  }, [issues, selectedIssue]);

  // Submission handler for newly created reports
  const handleAddNewReport = async (reportData: any) => {
    if (!userProfile) return;
    setIsActionInProgress(true);
    
    const previousRepValue = userProfile.reputation;
    const gainedRepPoints = 50;
    const nextRepValue = previousRepValue + gainedRepPoints;

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) throw new Error("Filing issue failed");
      const newIssue: Issue = await response.json();
      
      // Reward points to the citizen for filing a report (+50 XP, +50 RP)
      const updatedProfile: UserProfile = {
        ...userProfile,
        reputation: nextRepValue,
        issuesReported: userProfile.issuesReported + 1,
        rank: calculateRankFromReputation(nextRepValue)
      };
      
      setUserProfile(updatedProfile);
      savePersistedUserProfile(updatedProfile);

      // Create civic notification
      const newNotif: NotificationItem = {
        id: "notif-" + Date.now(),
        title: "Disruption File Logged",
        body: `"${newIssue.title}" was reported at ${newIssue.address || "Sector coords"}. AI initial triage complete!`,
        icon: "Check",
        type: "reported",
        createdAt: new Date().toISOString(),
        unread: true,
        issueId: newIssue.id
      };
      
      const newNotifList = [newNotif, ...notifications];
      setNotifications(newNotifList);
      saveNotifications(newNotifList);

      await fetchAllData();
      setShowReportForm(false);
      
      // Trigger dynamic celebration overlay with ranking countdown and climbing animations
      setCelebrationEvent({
        activityType: "report",
        repGained: gainedRepPoints,
        previousRep: previousRepValue,
        newRep: nextRepValue
      });
      setShowCelebrationModal(true);
      
      toast.success("Civic Report Filed", {
        description: `"${newIssue.title}" recorded. +50 Reputation Points!`,
        action: {
          label: "View Map",
          onClick: () => setActiveTab("map-grid")
        }
      });
    } catch (err) {
      console.error("Filing issue failed:", err);
      triggerToast("Network Error", "Could not synchronize report coordinates with our servers.");
      throw err;
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle action triggers from Hyperlocal GPS popups
  const handleNotificationAction = (type: string, targetId?: string) => {
    if (type === "verify" && targetId) {
      const issue = issues.find(i => i.id === targetId);
      if (issue) {
        setShowVerificationModal(issue);
      } else if (issues.length > 0) {
        setShowVerificationModal(issues[0]);
      }
    } else if (type === "incident") {
      setActiveTab("civic-ops");
    } else if (type === "mission") {
      setActiveTab("missions");
    } else if (type === "leaderboard") {
      setActiveTab("leaderboards");
    }
  };

  // Voter action: confirm existence and verification (Opens Modal)
  const handleVerifyIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) setShowVerificationModal(issue);
  };

  const onVerificationSuccess = async (updatedIssue: Issue, isOptimistic: boolean = false) => {
    if (!userProfile) return;
    
    if (isOptimistic) {
      // 1. Cache current state for potential rollback
      setRollbackCache({
        profile: { ...userProfile },
        issues: [...issues]
      });

      // 2. Perform optimistic state updates (+35 RP)
      const previousRepValue = userProfile.reputation;
      const gainedRepPoints = 35;
      const nextRepValue = previousRepValue + gainedRepPoints;

      const updatedProfile: UserProfile = {
        ...userProfile,
        reputation: nextRepValue,
        issuesVerified: userProfile.issuesVerified + 1,
        rank: calculateRankFromReputation(nextRepValue)
      };

      // Optimistically mark issue as verified and increment count
      const updatedIssues = issues.map(i => {
        if (i.id === updatedIssue.id) {
          return {
            ...i,
            status: "Verified" as const,
            verificationCount: (i.verificationCount || 0) + 1,
            evidence: [
              ...(i.evidence || []),
              {
                id: "evidence-optimistic",
                imageUrl: "",
                lat: i.latitude,
                lng: i.longitude,
                verifiedBy: userProfile.displayName,
                verifiedAt: new Date().toISOString(),
                aiConfidence: 85
              }
            ]
          };
        }
        return i;
      });

      setUserProfile(updatedProfile);
      setIssues(updatedIssues);
      savePersistedUserProfile(updatedProfile);
      setVerifiedIssueIds(prev => {
        if (!prev.includes(updatedIssue.id)) {
          return [...prev, updatedIssue.id];
        }
        return prev;
      });
      saveVerificationToFirestore(userProfile.uid, updatedIssue.id, userProfile.displayName);
      setShowVerificationModal(null);

      // Trigger celebration overlay with rank countdown animations
      setCelebrationEvent({
        activityType: "verify",
        repGained: gainedRepPoints,
        previousRep: previousRepValue,
        newRep: nextRepValue
      });
      setShowCelebrationModal(true);
      return;
    }

    // 3. Final sync from background response
    const updatedIssues = issues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
    setIssues(updatedIssues);
    setRollbackCache(null);
    await fetchAllData();
  };

  const onVerificationFailure = () => {
    if (rollbackCache) {
      setUserProfile(rollbackCache.profile);
      setIssues(rollbackCache.issues);
      savePersistedUserProfile(rollbackCache.profile);
      setRollbackCache(null);
      toast.error("Synchronization Reverted", {
        description: "Server verification sync failed. Reverted reputation points."
      });
    }
  };

  // Voter action: flag reports as duplicate
  const handleMarkDuplicate = async (issueId: string) => {
    if (!userProfile) return;
    setIsActionInProgress(true);

    try {
      const response = await fetch(`/api/issues/${issueId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile.uid })
      });
      
      if (response.ok) {
        await fetchAllData();
        toast.info("Duplicate Flagged", {
          description: "Added spatial cross-checking parameters."
        });
      }
    } catch (err) {
      console.error("Duplicate register error:", err);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Voter action: confirm complete clearance/resolution (Opens Modal)
  const handleConfirmResolution = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) setShowResolutionModal(issue);
  };

  const onResolutionSuccess = async (updatedIssue: Issue) => {
    if (!userProfile) return;
    
    // Resolution submission: +50 RP
    const previousRepValue = userProfile.reputation;
    const gainedRepPoints = 50;
    const nextRepValue = previousRepValue + gainedRepPoints;

    const updatedProfile: UserProfile = {
      ...userProfile,
      reputation: nextRepValue,
      rank: calculateRankFromReputation(nextRepValue)
    };
    
    setUserProfile(updatedProfile);
    savePersistedUserProfile(updatedProfile);
    setShowResolutionModal(null);
    await fetchAllData();

    // Trigger celebration overlay with rank countdown animations
    setCelebrationEvent({
      activityType: "resolution",
      repGained: gainedRepPoints,
      previousRep: previousRepValue,
      newRep: nextRepValue
    });
    setShowCelebrationModal(true);
  };

  // Complete Active Mission
  const handleCompleteMission = async (missionId: string, repReward: number) => {
    if (!userProfile) return;
    setIsActionInProgress(true);

    try {
      const response = await fetch(`/api/users/${userProfile.uid}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repGained: repReward, missionId })
      });
      
      if (response.ok) {
        const previousRepValue = userProfile.reputation || 0;
        const nextRepValue = previousRepValue + repReward;
        const updatedCompletedMissions = [...(userProfile.completedMissionsList || []), missionId];
        
        const updatedProfile: UserProfile = {
          ...userProfile,
          reputation: nextRepValue,
          missionsCompleted: (userProfile.missionsCompleted || 0) + 1,
          completedMissionsList: updatedCompletedMissions,
          rank: calculateRankFromReputation(nextRepValue)
        };
        
        setUserProfile(updatedProfile);
        savePersistedUserProfile(updatedProfile);

        await fetchAllData();
        
        // Trigger celebration overlay with rank countdown animations
        setCelebrationEvent({
          activityType: "mission",
          repGained: repReward,
          previousRep: previousRepValue,
          newRep: nextRepValue
        });
        setShowCelebrationModal(true);

        toast.success("Mission Cleared!", {
          description: `Secured +${repReward} Reputation Points!`
        });
      }
    } catch (err) {
      console.error("Mission rewards synchronization failed:", err);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Notification center click utilities
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    saveNotifications(updated);
    triggerToast("Notification Logs Cleared", "All community alerts flagged as read.");
  };

  const handleClearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const handleSelectIssueFromNotif = (issueId: string) => {
    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      setSelectedIssue(targetIssue);
    } else {
      triggerToast("Searching Archive...", "Target issue is no longer available inside this active sector.");
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans flex flex-col relative antialiased [color-scheme:dark]">
      {isAuthLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      ) : !isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <LoginPage onLogin={() => setIsAuthenticated(true)} theme={theme} onThemeChange={setTheme} />
        </div>
      ) : (
        <>
          {/* GLOWING AMBIENT SPACE COSMIC BACKDROP */}
          <div className="absolute top-0 left-1/4 h-96 w-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 h-96 w-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          {/* HEADER NAVIGATION SHELF */}
          <header className="sticky top-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-[#1f1f21] select-none">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
              
              {/* Brand branding log */}
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg border border-teal-400/25">
                  <span className="font-sans font-extrabold text-sm text-[#050505] tracking-widest uppercase">CH</span>
                </span>
                <div>
                  <span className="font-sans font-bold tracking-tight text-sm text-[#ededed] block leading-tight">Community Hero</span>
                  <span className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase block">AI Community OS</span>
                </div>
              </div>

              {/* Civic Operations Center Button */}
              <button
                onClick={() => {
                  setActiveTab("civic-ops");
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                🛡 Civic Operations Center
              </button>

              {/* Nav Tab switches */}
              <nav className="hidden md:flex items-center gap-1 bg-[#0f0f11] border border-[#1f1f21] px-1 py-0.5 rounded-lg">
                <button
                  onClick={() => { setActiveTab("command-center"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "command-center" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-command-center"
                >
                  Command Center
                </button>
                <button
                  onClick={() => { setActiveTab("map-grid"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "map-grid" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-map-grid"
                >
                  Intelligence Map
                </button>
                <button
                  onClick={() => { setActiveTab("missions"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "missions" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-missions"
                >
                  Missions Control
                </button>
                <button
                  onClick={() => { setActiveTab("leaderboards"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "leaderboards" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-leaderboards"
                >
                  Leaderboards
                </button>
                <button
                  onClick={() => { setActiveTab("ai-lab"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "ai-lab" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-ai-lab"
                >
                  AI Lab
                </button>
                <button
                  onClick={() => { setActiveTab("profile"); setShowReportForm(false); }}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition ${activeTab === "profile" ? "bg-[#1f1f21] text-[#ededed] shadow" : "text-zinc-400 hover:text-zinc-200"}`}
                  id="tab-profile"
                >
                  Profile Standings
                </button>
              </nav>

              {/* Notification Button and Avatar elements */}
              <div className="flex items-center gap-3">
                {/* Immediate Discoverable Appearance Switcher */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#0f0f11] border border-zinc-200 dark:border-[#1f1f21] p-1 rounded-lg relative overflow-hidden">
                  {(["light", "dark", "system"] as const).map((mode) => {
                    const isActive = theme === mode;
                    const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop;
                    const colorClass = mode === "light" ? "text-amber-500" : mode === "dark" ? "text-blue-400" : "text-teal-400";
                    
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className="relative p-1.5 rounded-md transition cursor-pointer z-10 select-none flex items-center justify-center outline-none focus:outline-none"
                        title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
                      >
                        {/* Animated Background Sliding Pill */}
                        {isActive && (
                          <motion.div
                            layoutId="activeThemeNav"
                            className="absolute inset-0 bg-white dark:bg-[#1f1f21] rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 z-0"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        {/* Icon with interactive rotational/scale morphing */}
                        <motion.div
                          className={`relative z-10 flex items-center justify-center ${isActive ? colorClass : "text-zinc-500 hover:text-zinc-300"}`}
                          whileHover={{ scale: 1.15, rotate: 15 }}
                          whileTap={{ scale: 0.95 }}
                          animate={isActive ? { rotate: [0, -45, 360], scale: [1, 0.8, 1.1, 1] } : { rotate: 0, scale: 1 }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </motion.div>
                      </button>
                    );
                  })}
                </div>

                {/* Notification Bell Badge Button */}
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-2 rounded-lg bg-[#0f0f11] hover:bg-[#121215] border border-[#1f1f21] hover:border-teal-500/30 text-zinc-450 hover:text-zinc-100 transition duration-250 select-none cursor-pointer"
                  title="Open Civic Alerts"
                  id="notification-bell-btn"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[#ededed] font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportForm(true)}
                  className="bg-[#0f0f11] hover:bg-[#1f1f21] border border-[#1f1f21] hover:border-teal-500/50 text-[#ededed] font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition duration-200"
                  id="quick-submit-disruption-btn"
                >
                  <Plus className="h-4 w-4 text-teal-400" />
                  File Disruption
                </button>

                {userProfile && (
                  <div 
                    onClick={() => { setActiveTab("profile"); setShowReportForm(false); }}
                    className="h-8.5 w-8.5 rounded-full overflow-hidden border border-[#1f1f21] cursor-pointer hover:border-zinc-500 transition"
                    title={`${userProfile.displayName} (${userProfile.rank})`}
                    id="header-user-avatar"
                  >
                    <img 
                      src={userProfile.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"} 
                      alt={userProfile.displayName} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </div>
          </header>
            
          {/* MOBILE BOTTOM TAB PORTAL */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-lg border-t border-[#1f1f21] py-2.5 px-4 z-50 flex items-center justify-between select-none">
            <button
              onClick={() => { setActiveTab("command-center"); setShowReportForm(false); }}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "command-center" ? "text-teal-400 font-semibold" : "text-zinc-500"}`}
            >
              <Activity className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab("map-grid"); setShowReportForm(false); }}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "map-grid" ? "text-teal-400 font-semibold" : "text-zinc-500"}`}
            >
              <MapIcon className="h-4.5 w-4.5" />
              <span>Sectors</span>
            </button>
            <button
              onClick={() => { setActiveTab("missions"); setShowReportForm(false); }}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "missions" ? "text-teal-400 font-semibold" : "text-zinc-500"}`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span>Missions</span>
            </button>
            <button
              onClick={() => { setActiveTab("leaderboards"); setShowReportForm(false); }}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "leaderboards" ? "text-teal-400 font-semibold" : "text-zinc-500"}`}
            >
              <Trophy className="h-4.5 w-4.5" />
              <span>Awards</span>
            </button>
            <button
              onClick={() => { setActiveTab("profile"); setShowReportForm(false); }}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "profile" ? "text-teal-400 font-semibold" : "text-zinc-500"}`}
            >
              <User className="h-4.5 w-4.5" />
              <span>Identity</span>
            </button>
          </div>

          {/* VIEW DOCK MODULE */}
          <main className="flex-1 py-8 overflow-x-hidden mb-16 md:mb-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-3 text-zinc-500">
                <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
                <p className="text-xs font-mono font-medium">Synchronizing Civic Operating Database Socket Feeds...</p>
              </div>
            ) : showReportForm ? (
              <ReportForm
                onSubmitReport={handleAddNewReport}
                onCancel={() => setShowReportForm(false)}
                currentUserUid={userProfile?.uid || "current-user-alex"}
                currentUserDisplayName={userProfile?.displayName || "Alex Carter"}
                theme={theme}
              />
            ) : (() => {
              switch (activeTab) {
                case "map-grid":
                  return (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
                      <div className="border-b border-[#1f1f21] pb-5">
                        <h1 className="text-xl font-bold tracking-tight text-[#ededed] flex items-center gap-2">
                          <MapPin className="h-5.5 w-5.5 text-teal-400" />
                          Global Sector Heatmap
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                          Draggable vector canvas showing active, verified structural vulnerabilities and cluster layouts.
                        </p>
                      </div>
                      <InteractiveMap
                        issues={issues}
                        clusters={clusters}
                        onSelectIssue={(issue) => {
                          setSelectedIssue(issue);
                        }}
                        theme={theme}
                      />
                      
                      <div className="p-4 rounded-xl bg-[#0f0f11] border border-[#1f1f21] text-xs text-zinc-400 leading-relaxed font-sans max-w-xl">
                        <span className="font-bold text-zinc-200">How to explore:</span> Zoom in to separate cluster indicators, or click on an issue marker to expand deep structural diagnostics and transparency ratings.
                      </div>
                    </div>
                  );
                case "missions":
                  return (
                    <MissionsControl
                      missions={missions}
                      userProfile={userProfile}
                      onCompleteMission={handleCompleteMission}
                      isActionInProgress={isActionInProgress}
                    />
                  );
                case "leaderboards":
                  return (
                    <LeaderboardTab
                      userProfile={userProfile}
                      onSetTab={(tab) => {
                        if (tab === "command-center" || tab === "map-grid" || tab === "missions" || tab === "profile" || tab === "ai-lab") {
                          setActiveTab(tab as any);
                        }
                      }}
                    />
                  );
                case "ai-lab":
                  return <AITester />;
                case "profile":
                  return (
                    <UserProfileDetails
                      userProfile={userProfile}
                      issues={issues}
                      onSignOut={async () => {
                        try {
                          const auth = getAuth();
                          await signOut(auth);
                          setIsAuthenticated(false);
                          setUserProfile(null);
                        } catch (err) {
                          console.error("Sign out failed", err);
                        }
                      }}
                      onReplayOnboarding={async () => {
                        if (!userProfile) return;
                        try {
                          const resetProfile = { ...userProfile, isOnboarded: false };
                          await saveUserProfileToFirestore(resetProfile);
                          setUserProfile(resetProfile);
                          setActiveTab("command-center");
                          triggerToast("Initializing Simulator", "Onboarding tour has been reloaded.");
                        } catch (err: any) {
                          triggerToast("Failed to replay tour", err.message);
                        }
                      }}
                      onUpdateProfile={(updated) => {
                        setUserProfile(updated);
                      }}
                      theme={theme}
                      onThemeChange={setTheme}
                    />
                  );
                case "civic-ops":
                    return (
                        <MunicipalDashboard 
                          issues={issues}
                          health={health}
                        />
                    );
                default:
                  return (
                    <CommandCenter
                      issues={issues}
                      clusters={clusters}
                      missions={missions}
                      health={health}
                      insights={insights}
                      userLocation={userLocation}
                      onSelectIssue={(issue) => setSelectedIssue(issue)}
                      onNavigateToMissions={() => { setActiveTab("missions"); }}
                      onNavigateToReport={() => setShowReportForm(true)}
                      onNavigateToLeaderboard={() => { setActiveTab("leaderboards"); }}
                      onVerifyIssue={handleVerifyIssue}
                      verifiedIssueIds={verifiedIssueIds}
                      userProfile={userProfile}
                      theme={theme}
                    />
                  );
              }
            })()}
          </main>

          {/* DETAILS LIGHTBOX MODAL */}
          {selectedIssue && userProfile && (
            <IssueDetailModal
              issue={selectedIssue}
              currentUserUid={userProfile.uid}
              onVerify={handleVerifyIssue}
              onMarkDuplicate={handleMarkDuplicate}
              onConfirmResolution={handleConfirmResolution}
              onClose={() => setSelectedIssue(null)}
              isActionInProgress={isActionInProgress}
            />
          )}

          {/* GLOBAL MODALS AND TOASTERS */}
          <Toaster position="top-right" theme="dark" richColors closeButton />
          
          {/* Modals for Enhanced Flows */}
          {showVerificationModal && userProfile && (
            <VerificationModal
              issue={showVerificationModal}
              user={userProfile}
              onClose={() => setShowVerificationModal(null)}
              onSuccess={onVerificationSuccess}
              onFailure={onVerificationFailure}
            />
          )}
          {showResolutionModal && userProfile && (
            <ResolutionModal
              issue={showResolutionModal}
              user={userProfile}
              onClose={() => setShowResolutionModal(null)}
              onSuccess={onResolutionSuccess}
            />
          )}
          
          {/* CELEBRATION MODAL */}
          {showCelebrationModal && celebrationEvent && (
            <CelebrationModal
              isOpen={showCelebrationModal}
              onClose={() => {
                setShowCelebrationModal(false);
                setCelebrationEvent(null);
              }}
              userProfile={userProfile}
              activityType={celebrationEvent?.activityType}
              repGained={celebrationEvent?.repGained}
              previousRep={celebrationEvent?.previousRep}
              newRep={celebrationEvent?.newRep}
            />
          )}
          
          {/* HIGH FIDELITY NOTIFICATIONS NETWORK SIDE DRAWER */}
          <NotificationDrawer 
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearAll}
            onSelectIssue={handleSelectIssueFromNotif}
          />

          {/* LIVE HYPERLOCAL AI NOTIFICATIONS NETWORK POPUPS */}
          <HyperlocalNotifications
            userLocation={userLocation}
            userProfile={userProfile}
            issues={issues}
            onActionClick={handleNotificationAction}
          />
          
          {/* ONBOARDING FLOW MODAL & SPOTLIGHT GUIDE */}
          {userProfile && !userProfile.isOnboarded && (
            <OnboardingScreen 
              uid={userProfile.uid}
              email={userProfile.email}
              photoURL={userProfile.photoURL || ""}
              userProfile={userProfile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowReportForm={setShowReportForm}
              setIsNotificationsOpen={setIsNotificationsOpen}
              onComplete={async (completedProfile, options) => {
                try {
                  setIsLoading(true);
                  await saveUserProfileToFirestore(completedProfile);
                  setUserProfile(completedProfile);
                  triggerToast("Welcome Hero!", "Your profile is active, exploring local sector.");
                  
                  if (options?.startMission) {
                    // Find first issue in verificationQueue to start mission
                    const verificationQueue = issues.filter(i => i.status === "Reported" || i.status === "Under Verification");
                    if (verificationQueue.length > 0) {
                      // Wait briefly and open verification modal
                      setTimeout(() => {
                        setShowVerificationModal(verificationQueue[0]);
                      }, 600);
                    } else {
                      triggerToast("Sector Secured!", "No pending verification tasks in immediate vicinity.");
                    }
                  }
                } catch (err: any) {
                  triggerToast("Error updating profile", err.message);
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

const MAP_CENTER = { lat: 12.9716, lng: 77.5946 };
export { MAP_CENTER };

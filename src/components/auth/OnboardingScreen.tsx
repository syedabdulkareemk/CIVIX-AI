import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  Globe, 
  Sparkles, 
  Loader2, 
  Compass, 
  Shield, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  FilePlus, 
  Cpu, 
  Users, 
  Award, 
  Play, 
  Pause, 
  ChevronRight, 
  Bell, 
  Trophy, 
  Activity, 
  MapIcon, 
  Check, 
  Smartphone,
  Eye
} from "lucide-react";
import { UserProfile } from "../../lib/firebase";

interface OnboardingScreenProps {
  uid: string;
  email: string;
  photoURL: string;
  userProfile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setShowReportForm: (show: boolean) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  onComplete: (profile: UserProfile, options?: { startMission?: boolean }) => void;
}

export default function OnboardingScreen({ 
  uid, 
  email, 
  photoURL, 
  userProfile,
  activeTab,
  setActiveTab,
  setShowReportForm,
  setIsNotificationsOpen,
  onComplete 
}: OnboardingScreenProps) {
  
  // High-level steps: 1: Welcome, 2: Profile, 3: How it Works, 4: Reputation, 5: Feature Tour, 6: AI Demo, 7: First Mission
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState(userProfile.displayName || "");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 3 (How it Works) Auto-playing timeline state
  const [step3ActiveIdx, setStep3ActiveIdx] = useState(0);
  const [step3IsPlaying, setStep3IsPlaying] = useState(true);
  const step3TimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 4 Ranks definitions
  const ranksList = [
    { name: "Citizen", rp: "0 RP", desc: "First responder. Observe and report local disruptions." },
    { name: "Scout", rp: "250 RP", desc: "Active community eyes. Earned through verified reporting." },
    { name: "Verifier", rp: "500 RP", desc: "Pillar of local truth. Highly active in corroborating nearby reports." },
    { name: "Inspector", rp: "1000 RP", desc: "Expert coordinator. Authorized for high-severity resolution validations." },
    { name: "Guardian", rp: "2500 RP", desc: "Trusted local leader. Mentors new citizens and guides sectors." },
    { name: "Community Hero", rp: "5000+ RP", desc: "Elite champion. Direct link to municipal crisis resolution networks." }
  ];
  const [selectedRankIdx, setSelectedRankIdx] = useState(0);

  // Step 5 (Feature Tour) Spotlight states
  const [tourSubStep, setTourSubStep] = useState(0);
  const [highlightBox, setHighlightBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps = [
    {
      id: "tab-command-center",
      title: "1. Hyperlocal Dashboard",
      text: "The main Command Center compiles local health index, risk warnings, and nearby actions.",
      tab: "command-center",
      setup: () => {
        setActiveTab("command-center");
        setShowReportForm(false);
        setIsNotificationsOpen(false);
      }
    },
    {
      id: "tab-map-grid",
      title: "2. Draggable Sector Map",
      text: "The Sector Map plots hazards, high-frequency disaster clusters, and verification nodes.",
      tab: "map-grid",
      setup: () => {
        setActiveTab("map-grid");
        setShowReportForm(false);
        setIsNotificationsOpen(false);
      }
    },
    {
      id: "quick-submit-disruption-btn",
      title: "3. File Disruption Button",
      text: "Submit streetlights, leaks, or potholes with instant automated AI categorizations.",
      tab: "command-center",
      setup: () => {
        setActiveTab("command-center");
        setShowReportForm(false);
        setIsNotificationsOpen(false);
      }
    },
    {
      id: "nearby-verification-queue",
      title: "4. Verification Queue",
      text: "Cross-examine and verify issues flagged by other citizens to earn Double RP.",
      tab: "command-center",
      setup: () => {
        setActiveTab("command-center");
        setShowReportForm(false);
        setIsNotificationsOpen(false);
        setTimeout(() => {
          document.getElementById("nearby-verification-queue")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    },
    {
      id: "notification-bell-btn",
      title: "5. Real-Time Alert Bell",
      text: "Open critical municipal disruption notifications and live sector hazard alerts.",
      tab: "command-center",
      setup: () => {
        setIsNotificationsOpen(true);
      }
    },
    {
      id: "tab-leaderboards",
      title: "6. Neighborhood Standings",
      text: "Watch the weekly and all-time boards to see which heroes are driving local impact.",
      tab: "leaderboards",
      setup: () => {
        setActiveTab("leaderboards");
        setIsNotificationsOpen(false);
      }
    },
    {
      id: "tab-profile",
      title: "7. Civic Identity Card",
      text: "Monitor your custom trust scores, view unlocked achievements, and adjust local preferences.",
      tab: "profile",
      setup: () => {
        setActiveTab("profile");
        setIsNotificationsOpen(false);
      }
    }
  ];

  // Track & slide spotlight box coordinates on DOM changes
  useEffect(() => {
    if (currentStep !== 5) {
      setHighlightBox(null);
      return;
    }

    const currentTour = tourSteps[tourSubStep];
    if (currentTour) {
      currentTour.setup();
    }

    let active = true;
    const updatePosition = () => {
      if (!active || currentStep !== 5) return;
      const stepConfig = tourSteps[tourSubStep];
      if (stepConfig) {
        const el = document.getElementById(stepConfig.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightBox({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        } else {
          setHighlightBox(null);
        }
      }
      requestAnimationFrame(updatePosition);
    };

    // Delay slightly to allow tab views to transition and mount
    const timeout = setTimeout(() => {
      updatePosition();
    }, 150);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [currentStep, tourSubStep]);

  // Step 3 Auto-play timer logic
  useEffect(() => {
    if (currentStep === 3 && step3IsPlaying) {
      step3TimerRef.current = setInterval(() => {
        setStep3ActiveIdx((prev) => (prev + 1) % 4);
      }, 2500);
    } else {
      if (step3TimerRef.current) clearInterval(step3TimerRef.current);
    }
    return () => {
      if (step3TimerRef.current) clearInterval(step3TimerRef.current);
    };
  }, [currentStep, step3IsPlaying]);

  // Step 6 AI analysis animation timer
  const [aiDemoIndex, setAiDemoIndex] = useState(0);
  const [aiLogEntries, setAiLogEntries] = useState<string[]>([]);
  const aiSteps = [
    { title: "Analyzing Image Buffer...", desc: "Scanning 1024x1024 sensor coordinates via Gemini Vision.", status: "ok" },
    { title: "Category Classified", desc: "Category Identified: 'Water Leakage' (Confidence: 98.4%)", status: "ok" },
    { title: "Severity Calibrated", desc: "Severity Level: Critical (High flow-rate, flooding risk)", status: "ok" },
    { title: "Routing Recommended", desc: "Assigned Department: Municipal Water & Sanitation Division", status: "ok" },
    { title: "Record Registered", desc: "Civic disruption created, broadcasted to nearby verified scouts.", status: "success" }
  ];

  useEffect(() => {
    if (currentStep === 6) {
      setAiDemoIndex(0);
      setAiLogEntries([]);
      const timer = setInterval(() => {
        setAiDemoIndex((prev) => {
          if (prev < aiSteps.length) {
            setAiLogEntries((logs) => [...logs, aiSteps[prev].title]);
            return prev + 1;
          } else {
            clearInterval(timer);
            return prev;
          }
        });
      }, 1800);
      return () => clearInterval(timer);
    }
  }, [currentStep]);

  // Browser Geolocation Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`, {
            headers: {
              "Accept-Language": "en"
            }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cityVal = addr.city || addr.town || addr.village || addr.suburb || "San Francisco";
            const stateVal = addr.state || "California";
            const countryVal = addr.country || "United States";
            
            setCity(cityVal);
            setState(stateVal);
            setCountry(countryVal);
          } else {
            // Graceful fallback
            setCity("San Francisco");
            setState("California");
            setCountry("United States");
          }
        } catch (err) {
          console.error("Reverse geocoding fail:", err);
          setCity("San Francisco");
          setState("California");
          setCountry("United States");
        } finally {
          setIsLocationLoading(false);
        }
      },
      (err) => {
        console.warn("Browser location denied:", err);
        setError("Location permission was denied. Please write your details manually below.");
        setIsLocationLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFinishProfileStep = () => {
    if (!fullName.trim()) {
      setError("Display Name is required.");
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError("Please specify your city and state coordinates.");
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleSkipAll = () => {
    const finalProfile: UserProfile = {
      ...userProfile,
      displayName: fullName.trim() || userProfile.displayName || "Committed Citizen",
      gender: gender || "Other",
      city: city.trim() || "San Francisco",
      state: state.trim() || "California",
      preferredLanguage: preferredLanguage,
      isOnboarded: true,
      reputation: 0,
      rank: "Citizen",
      joinedDate: new Date().toISOString()
    };
    onComplete(finalProfile);
  };

  const handleOnboardingComplete = (startMission: boolean = false) => {
    const finalProfile: UserProfile = {
      ...userProfile,
      displayName: fullName.trim() || userProfile.displayName || "Committed Citizen",
      gender: gender,
      city: city.trim(),
      state: state.trim(),
      preferredLanguage: preferredLanguage,
      isOnboarded: true,
      reputation: 0,
      rank: "Citizen",
      joinedDate: new Date().toISOString(),
      area: `${city.trim()}, ${state.trim()}`
    };
    onComplete(finalProfile, { startMission });
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden select-none">
      
      {/* BACKGROUND GRAPHICS (Always present in steps other than tour) */}
      {currentStep !== 5 && (
        <div className="absolute inset-0 bg-[#050505] z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-teal-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-10 right-10 flex gap-2 z-50">
            <button 
              onClick={handleSkipAll}
              className="px-4 py-2 text-xs font-mono font-medium text-zinc-400 hover:text-zinc-100 bg-[#0f0f11] border border-[#1f1f21] hover:border-zinc-700 rounded-xl transition cursor-pointer"
            >
              Skip Onboarding
            </button>
          </div>
        </div>
      )}

      {/* TOUR BACKDROP SPOTLIGHT OVERLAY */}
      {currentStep === 5 && (
        <div className="absolute inset-0 bg-transparent z-10 pointer-events-none transition-all duration-300">
          {highlightBox && (
            <div 
              className="absolute bg-transparent pointer-events-none border-2 border-teal-400 shadow-[0_0_0_9999px_rgba(10,10,12,0.65)] rounded-xl transition-all duration-300"
              style={{
                top: highlightBox.top - 6,
                left: highlightBox.left - 6,
                width: highlightBox.width + 12,
                height: highlightBox.height + 12
              }}
            >
              <div className="absolute -inset-1 border border-dashed border-teal-500/40 rounded-xl animate-ping" />
              {/* Elegant outer drop shadow glow to emphasize the focus area */}
              <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] pointer-events-none" />
            </div>
          )}
        </div>
      )}

      {/* CONTENT SHELF */}
      <div className="absolute inset-0 flex items-center justify-center p-4 z-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* ====================================================
              STEP 1 — WELCOME
              ==================================================== */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 md:p-10 rounded-2xl shadow-2xl relative text-center flex flex-col items-center justify-center"
            >
              <span className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg border border-teal-400/25 mb-6">
                <Compass className="h-7 w-7 text-[#050505] animate-spin-slow" />
              </span>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-50 leading-tight">
                Welcome to <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Community Hero</span>
              </h1>
              
              <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-md">
                Together, citizens and AI build safer, cleaner, and more transparent communities. Join the smart network mapping civic solutions.
              </p>

              <div className="w-full grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={handleSkipAll}
                  className="py-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] hover:border-zinc-700 rounded-xl transition cursor-pointer"
                >
                  Skip Tour
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="py-3 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  Get Started <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 mt-8">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ====================================================
              STEP 2 — PROFILE SETUP
              ==================================================== */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-lg bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">Initialize Civic Persona</h2>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Step 2 of 7 • Secure Profile Setup</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-400 block">Civic Display Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter display name"
                      className="w-full bg-[#050505] border border-[#1f1f21] focus:border-teal-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-[#ededed] outline-none transition"
                    />
                  </div>
                </div>

                {/* Profile Pic preview if we have photoURL */}
                {photoURL && (
                  <div className="flex items-center gap-3 p-2 bg-[#121214] border border-[#1f1f21] rounded-xl">
                    <img src={photoURL} alt="Google Avatar" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
                    <span className="text-xs text-zinc-400 font-mono">Google profile picture imported</span>
                  </div>
                )}

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-400 block">Gender *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          gender === g
                            ? "bg-teal-500/10 border-teal-500 text-teal-400"
                            : "bg-[#050505] border-[#1f1f21] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Geolocation auto fill */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-medium text-zinc-400 block">Current Location *</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocationLoading}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
                    >
                      {isLocationLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" /> Auto Detect GPS
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1f1f21] focus:border-teal-500/50 rounded-xl py-2 px-3 text-xs text-[#ededed] outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1f1f21] focus:border-teal-500/50 rounded-xl py-2 px-3 text-xs text-[#ededed] outline-none transition"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1f1f21] focus:border-teal-500/50 rounded-xl py-2 px-3 text-xs text-[#ededed] outline-none transition mt-2"
                  />
                </div>

                {/* Preferred Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-400 block">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-[#050505] border border-[#1f1f21] focus:border-teal-500/50 rounded-xl py-2 px-3 text-xs text-[#ededed] outline-none transition"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish / Español</option>
                    <option value="Hindi">Hindi / हिन्दी</option>
                    <option value="French">French / Français</option>
                  </select>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishProfileStep}
                  className="py-2.5 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  Save & Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 justify-center mt-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 1 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ====================================================
              STEP 3 — HOW COMMUNITY HERO WORKS
              ==================================================== */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Compass className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">The Collaboration Engine</h2>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Step 3 of 7 • Operating Lifecycle</p>
                  </div>
                </div>
                
                {/* Play/Pause controls */}
                <button
                  onClick={() => setStep3IsPlaying(!step3IsPlaying)}
                  className="p-1.5 rounded-lg border border-[#1f1f21] bg-[#121215] text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                  {step3IsPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Interactive Flow visual columns */}
              <div className="grid grid-cols-4 gap-2 mb-6 relative">
                {[
                  { step: "01", label: "Report Issue", desc: "Submit photo & GPS", icon: FilePlus, color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
                  { step: "02", label: "AI Analyzes", desc: "Classifies severity", icon: Cpu, color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
                  { step: "03", label: "Scouts Verify", desc: "Double-check report", icon: Users, color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
                  { step: "04", label: "Resolved!", desc: "Issue closed safely", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" }
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  const isActive = step3ActiveIdx === idx;
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setStep3ActiveIdx(idx);
                        setStep3IsPlaying(false);
                      }}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? `${item.color.split(" ")[2]} border-[#1f1f21] ring-1 ring-teal-400 shadow-md scale-[1.03] bg-[#121215]`
                          : "bg-[#050505] border-[#1f1f21] opacity-50 hover:opacity-80"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-zinc-500">{item.step}</span>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mt-2 mb-2 ${isActive ? item.color.split(" ")[0] + " " + item.color.split(" ")[1] : "bg-[#151518] text-zinc-400"}`}>
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 block leading-tight">{item.label}</span>
                      <span className="text-[9px] text-zinc-500 mt-1 block leading-normal leading-tight hidden sm:block">{item.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress timer bar */}
              {step3IsPlaying && (
                <div className="w-full bg-[#121215] h-1 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    key={step3ActiveIdx}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className="bg-gradient-to-r from-teal-400 to-blue-500 h-full"
                  />
                </div>
              )}

              {/* Detailed explainer card for selected step */}
              <div className="p-4 bg-[#121215] border border-[#1f1f21] rounded-xl mb-6">
                {step3ActiveIdx === 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-blue-400 uppercase">📝 01. Citizen Reporting</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Citizens quickly capture images and register spatial markers. No complicated bureaucracy. Our zero-friction filing flow logs the exact telemetry coordinates instantly.
                    </p>
                  </div>
                )}
                {step3ActiveIdx === 1 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-purple-400 uppercase">🧠 02. Vision Intelligence Extraction</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Our Gemini AI Vision stack takes the heavy load. It instantly reads image assets, tags the problem category, rates physical hazard severity, and handles official department matching.
                    </p>
                  </div>
                )}
                {step3ActiveIdx === 2 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-amber-400 uppercase">👥 03. Hyperlocal Crowd Consensus</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      No fake news or duplicate logs. Nearby certified scouts cross-verify physical reports, adding photos and completing missions. Consensus acts as a robust barrier to trash/spam.
                    </p>
                  </div>
                )}
                {step3ActiveIdx === 3 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase">✅ 04. Official Resolution Confirmation</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      When repairs are logged, scouts verify the results, converting community eyes into durable civil transparency and municipal accountability.
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="py-2.5 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  Reputation System <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 justify-center mt-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 2 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ====================================================
              STEP 4 — REPUTATION SYSTEM
              ==================================================== */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">Reputation Points (RP) Engine</h2>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Step 4 of 7 • Rankings & Progression</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Unlock higher civic authority ranks and specialized verification capabilities by acquiring **Reputation Points (RP)** through verifiable contributions.
              </p>

              {/* Points values grids */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Report Issue", rp: "+50 RP", desc: "File verified disruption" },
                  { label: "Verify Issue", rp: "+25 RP", desc: "Corroborate nearby facts" },
                  { label: "Resolution Review", rp: "+75 RP", desc: "Audit municipal repairs" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#050505] border border-[#1f1f21] p-3 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 block leading-tight">{item.label}</span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono mt-1.5">{item.rp}</span>
                    <span className="text-[8px] text-zinc-500 mt-1 block">{item.desc}</span>
                  </div>
                ))}
              </div>

              {/* Ranks Pathway Carousel */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Civic Rank Progression Hierarchy</span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ranksList.map((rankItem, rIdx) => {
                    const isSelected = selectedRankIdx === rIdx;
                    return (
                      <div 
                        key={rIdx}
                        onClick={() => setSelectedRankIdx(rIdx)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-teal-500/5 border-teal-500 text-[#ededed]" 
                            : "bg-[#050505] border-[#1f1f21] text-zinc-400 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{rankItem.name}</span>
                          <span className="text-[9px] font-mono text-amber-400 font-medium">{rankItem.rp}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2">{rankItem.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="py-2.5 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  Feature Tour <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 justify-center mt-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 3 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ====================================================
              STEP 5 — FEATURE TOUR
              ==================================================== */}
          {currentStep === 5 && (
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
              
              {/* Highlight focus controller modal block */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-auto bg-[#0b0b0d] border border-[#1f1f21] p-6 rounded-2xl shadow-2xl w-full max-w-sm relative z-50 overflow-hidden"
                style={{
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)"
                }}
              >
                {/* Ambient glowing bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500" />

                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded uppercase font-bold">
                    Interactive Tour
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Step 5 of 7 • Tour Step {tourSubStep + 1}/7
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  {tourSteps[tourSubStep].title}
                </h3>
                
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed bg-[#111114] p-3 border border-[#1f1f21] rounded-xl">
                  {tourSteps[tourSubStep].text}
                </p>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#1f1f21]">
                  <button
                    onClick={() => {
                      if (tourSubStep > 0) {
                        setTourSubStep(tourSubStep - 1);
                      } else {
                        setCurrentStep(4);
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition font-mono border border-transparent hover:border-zinc-800 rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSkipAll}
                      className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition font-mono cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        if (tourSubStep < tourSteps.length - 1) {
                          setTourSubStep(tourSubStep + 1);
                        } else {
                          // Clean up active views & move to Step 6
                          setIsNotificationsOpen(false);
                          setActiveTab("command-center");
                          setCurrentStep(6);
                        }
                      }}
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      {tourSubStep === tourSteps.length - 1 ? "Finish Tour" : "Next"} <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* ====================================================
              STEP 6 — FIRST AI DEMO
              ==================================================== */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 rounded-2xl shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Cpu className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">Automated AI Processing</h2>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Step 6 of 7 • Vision & Intelligence Pipeline</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Watch the live simulation demonstrating how Gemini Vision handles the heavy analytical liftoff for reported issues.
              </p>

              {/* AI Demo Simulator layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                
                {/* Left column: Mock source photo */}
                <div className="md:col-span-2 relative bg-[#121215] border border-[#1f1f21] rounded-xl overflow-hidden flex flex-col justify-between p-3 h-48 md:h-auto">
                  <div className="absolute top-1.5 left-1.5 text-[8px] font-mono uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                    Input Image Buffer
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center mt-3 mb-3 relative rounded-lg overflow-hidden border border-[#1f1f21]">
                    <img 
                      src="https://images.unsplash.com/photo-1542013936693-8848e5740a7a?w=400&fit=crop" 
                      alt="Water leak representation"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    
                    {/* Scanning animation bar */}
                    <motion.div 
                      animate={{ y: ["-10%", "110%", "-10%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_cyan]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500">
                    <Eye className="h-3.5 w-3.5 text-teal-400" /> Sector #405 Grid Scan
                  </div>
                </div>

                {/* Right column: Gemini Vision logs extraction */}
                <div className="md:col-span-3 bg-[#050507] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between font-mono text-xs text-zinc-300 min-h-48">
                  <div className="flex items-center justify-between border-b border-[#1f1f21] pb-2 mb-2">
                    <span className="text-[9px] uppercase text-zinc-500">Vision Logs Socket</span>
                    <span className="text-[9px] text-teal-400 animate-pulse font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> RUNNING
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 mt-1">
                    {aiSteps.map((s, idx) => {
                      const show = aiDemoIndex >= idx + 1;
                      if (!show) return null;
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-0.5"
                        >
                          <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold">
                            <Check className="h-3 w-3" /> {s.title}
                          </div>
                          <p className="text-[9px] text-zinc-500 font-mono leading-relaxed pl-4">
                            {s.desc}
                          </p>
                        </motion.div>
                      );
                    })}
                    
                    {aiDemoIndex < aiSteps.length && (
                      <div className="text-[10px] text-zinc-600 animate-pulse flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin text-teal-400" /> Parsing telemetry stream...
                      </div>
                    )}
                  </div>

                  {aiDemoIndex === aiSteps.length && (
                    <div className="mt-4 p-2 bg-teal-500/5 border border-teal-500/15 rounded text-center text-[9px] text-teal-400 font-bold">
                      ✨ Pipeline Completed. Verified Issue Added to Local Map Database.
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(7)}
                  className="py-2.5 bg-teal-500 hover:bg-teal-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  My Civic Standing <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 justify-center mt-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 6 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ====================================================
              STEP 7 — FIRST COMMUNITY MISSION
              ==================================================== */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-xl bg-[#0b0b0d]/90 border border-[#1f1f21] p-8 rounded-2xl shadow-2xl relative text-center flex flex-col items-center"
            >
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Shield className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-zinc-100">
                Welcome, {fullName || "Civic Hero"}!
              </h2>
              <p className="text-xs text-zinc-500 font-mono uppercase mt-1 tracking-wider">
                Rank: Citizen • 0 RP
              </p>

              {/* Neighborhood health panel */}
              <div className="grid grid-cols-3 gap-2 w-full mt-6 mb-6">
                <div className="p-3 bg-[#050505] border border-[#1f1f21] rounded-xl">
                  <span className="text-[9px] font-mono text-zinc-500 block">Nearby Issues</span>
                  <span className="text-base font-extrabold text-zinc-200 mt-1 block">12</span>
                </div>
                <div className="p-3 bg-[#050505] border border-[#1f1f21] rounded-xl">
                  <span className="text-[9px] font-mono text-zinc-500 block">Open Verifications</span>
                  <span className="text-base font-extrabold text-zinc-200 mt-1 block">5</span>
                </div>
                <div className="p-3 bg-[#050505] border border-[#1f1f21] rounded-xl">
                  <span className="text-[9px] font-mono text-zinc-500 block">Health Index</span>
                  <span className="text-base font-extrabold text-teal-400 mt-1 block font-mono">83%</span>
                </div>
              </div>

              {/* First Mission Card */}
              <div className="w-full p-5 bg-gradient-to-b from-[#121215] to-[#0d0d10] border border-amber-500/30 rounded-xl text-left relative overflow-hidden mb-6 shadow-xl shadow-amber-500/5">
                <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
                    🎯
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">First Community Mission</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 mt-2.5">
                  Verify your first nearby civic disruption.
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Cross-check structural reports submitted by other citizens in your sector, check evidence quality, and secure our shared telemetry map.
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1f1f21]">
                  <span className="text-[10px] text-zinc-500">Completion Reward:</span>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded">
                    +25 RP Reward
                  </span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOnboardingComplete(false)}
                  className="py-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 border border-[#1f1f21] rounded-xl transition cursor-pointer"
                >
                  Explore Dashboard
                </button>
                <button
                  onClick={() => handleOnboardingComplete(true)}
                  className="py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#050505] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  Start Mission <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 justify-center mt-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 6 ? "w-6 bg-teal-400" : "w-1.5 bg-zinc-800"}`} />
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

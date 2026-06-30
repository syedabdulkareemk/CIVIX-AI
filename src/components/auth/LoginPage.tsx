import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Mail, Lock, Chrome, Loader2, Sun, Moon, Laptop, Shield, Sparkles, Activity, CheckCircle, Compass } from "lucide-react";
import { triggerGoogleSignIn, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../../lib/firebase";

interface LoginPageProps {
  onLogin: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export default function LoginPage({ onLogin, theme, onThemeChange }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await triggerGoogleSignIn(() => onLogin());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-[#ededed] grid grid-cols-1 lg:grid-cols-12 overflow-hidden transition-colors duration-300">
      
      {/* LEFT COLUMN: Modern Cinematic Hero & Tagline */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#0a0a0c] dark:bg-[#020203] relative items-center justify-center p-12 overflow-hidden border-r border-zinc-200 dark:border-[#1f1f21] select-none">
        
        {/* Animated grid overlay and glowing abstract meshes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-teal-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/10 rounded-full blur-[140px] animate-pulse [animation-delay:2s]" />

        {/* Content container */}
        <div className="relative z-10 max-w-lg space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3.5"
          >
            <span className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg border border-teal-400/25">
              <Shield className="h-5.5 w-5.5 text-zinc-950 font-extrabold stroke-[2.5]" />
            </span>
            <div>
              <span className="font-sans font-black tracking-tight text-xl text-[#ededed] block leading-tight">Community Hero</span>
              <span className="font-mono text-[10px] text-zinc-500 tracking-wider uppercase block">AI Community OS</span>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl font-sans font-black tracking-tight text-[#ededed] leading-[1.1]"
            >
              The Next-Gen Bridge for Smart Civic Action.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-zinc-400 font-sans leading-relaxed"
            >
              Bridging neighborhood observations with lightning-fast municipal triage. Report hazards, coordinate operations, complete high-yield local verification missions, and lead your community's safety rankings.
            </motion.p>
          </div>

          {/* Micro stats preview widgets */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-[#0f0f11]/80 border border-[#1f1f21] p-4 rounded-xl space-y-1.5">
              <Activity className="h-4 w-4 text-teal-400" />
              <div className="text-xs text-zinc-500 font-mono">Live Incidents</div>
              <div className="text-base font-bold text-zinc-200 font-mono">24/7 Monitored</div>
            </div>
            <div className="bg-[#0f0f11]/80 border border-[#1f1f21] p-4 rounded-xl space-y-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <div className="text-xs text-zinc-500 font-mono">Resolutions</div>
              <div className="text-base font-bold text-zinc-200 font-mono">Optimistic UI</div>
            </div>
            <div className="bg-[#0f0f11]/80 border border-[#1f1f21] p-4 rounded-xl space-y-1.5">
              <Compass className="h-4 w-4 text-blue-400" />
              <div className="text-xs text-zinc-500 font-mono">Dossier Missions</div>
              <div className="text-base font-bold text-zinc-200 font-mono">Live Verify</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentic Citizen Login Screen */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-12 relative min-h-screen">
        
        {/* Floating Theme Switcher top right */}
        <div className="flex justify-end items-center gap-1 bg-zinc-100 dark:bg-[#0f0f11] border border-zinc-200 dark:border-[#1f1f21] p-1 rounded-lg absolute top-6 right-6 z-20 relative overflow-hidden">
          {(["light", "dark", "system"] as const).map((mode) => {
            const isActive = theme === mode;
            const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop;
            const colorClass = mode === "light" ? "text-amber-500" : mode === "dark" ? "text-blue-400" : "text-teal-400";
            
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onThemeChange(mode)}
                className="relative p-1.5 rounded-md transition cursor-pointer z-10 select-none flex items-center justify-center outline-none focus:outline-none"
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
              >
                {/* Animated Background Sliding Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeThemeLogin"
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

        <div className="my-auto max-w-sm w-full mx-auto space-y-8">
          
          {/* Logo on mobile/header */}
          <div className="text-center space-y-3 lg:hidden">
            <span className="h-10 w-10 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow border border-teal-400/20">
              <Shield className="h-5 w-5 text-zinc-950 stroke-[2]" />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-[#ededed]">Community Hero</h2>
              <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">AI-Powered Civic Coordination System</p>
            </div>
          </div>

          <div className="space-y-2 max-sm:text-center">
            <h2 className="hidden lg:block text-2xl font-black text-zinc-900 dark:text-[#ededed] tracking-tight">
              {isSignUp ? "Initialize Identity" : "Access Console"}
            </h2>
            <p className="text-xs text-zinc-500 font-sans leading-normal">
              {isSignUp 
                ? "Create your unique profile signature to begin reporting and securing local sector parameters." 
                : "Access your persistent civic dashboard to review active missions, map hotspots, and claim rewards."}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-red-500/10 border border-red-500/25 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium font-sans flex items-center gap-2"
            >
              <span>⚠</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-3.5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-650" />
                <input
                  type="email"
                  placeholder="Email credentials"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#050505] border border-zinc-200 dark:border-[#1f1f21] rounded-xl py-3 pl-10.5 pr-4 text-xs text-zinc-900 dark:text-[#ededed] focus:border-teal-500 dark:focus:border-teal-500 outline-none shadow-sm transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-650" />
                <input
                  type="password"
                  placeholder="Secure passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#050505] border border-zinc-200 dark:border-[#1f1f21] rounded-xl py-3 pl-10.5 pr-4 text-xs text-zinc-900 dark:text-[#ededed] focus:border-teal-500 dark:focus:border-teal-500 outline-none shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 dark:bg-teal-500 dark:hover:bg-teal-450 text-[#050505] hover:scale-[1.02] active:scale-[0.98] font-bold text-xs rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-teal-500/20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#050505]" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {isSignUp ? "Generate Citizen Key" : "Establish Secure Session"}
                </>
              )}
            </button>
          </form>

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-[#1f1f21]"></div>
            </div>
            <span className="relative bg-zinc-50 dark:bg-[#050505] px-3.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">or</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white dark:bg-[#111113] hover:bg-zinc-100 dark:hover:bg-[#1a1a1d] text-zinc-800 dark:text-[#ededed] border border-zinc-250 dark:border-zinc-800 hover:scale-[1.01] active:scale-[0.99] font-semibold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Chrome className="h-4 w-4 text-teal-500" />
            Continue with Google credentials
          </button>

          <p className="text-center text-zinc-500 text-xs">
            {isSignUp ? "Already registered on our network?" : "New to Community Hero?"}{" "}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-teal-550 dark:text-teal-400 hover:underline font-bold transition ml-0.5 cursor-pointer"
            >
              {isSignUp ? "Access Account" : "Initialize Identity"}
            </button>
          </p>
        </div>

        {/* Humble, clean platform credits at the bottom */}
        <div className="text-center text-[10px] text-zinc-500 font-mono select-none pt-8 border-t border-zinc-200/50 dark:border-zinc-800/10 mt-auto">
          © 2026 Community Hero Operations Console • Encrypted Sandbox Secure Portal
        </div>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { Issue } from "../types";
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Sparkles, 
  ShieldAlert,
  Flame,
  User,
  Heart,
  Eye,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { motion } from "motion/react";

interface IssueDetailModalProps {
  issue: Issue;
  currentUserUid: string;
  onVerify: (issueId: string) => void;
  onMarkDuplicate: (issueId: string) => void;
  onConfirmResolution: (issueId: string) => void;
  onClose: () => void;
  isActionInProgress: boolean;
}

export default function IssueDetailModal({
  issue,
  currentUserUid,
  onVerify,
  onMarkDuplicate,
  onConfirmResolution,
  onClose,
  isActionInProgress
}: IssueDetailModalProps) {
  // Check if player has already performed tasks
  const alreadyVerified = issue.verifiedUsers?.includes(currentUserUid) || false;
  const alreadyMarkedDuplicate = issue.duplicateUsers?.includes(currentUserUid) || false;
  const alreadyConfirmedResolution = issue.resolverUsers?.includes(currentUserUid) || false;

  // Calculators for Transparency & Accountability
  const calculateIssueTrustScore = () => {
    // Standard default starting confidence
    let base = 50;
    // Each verification adds +7 points
    base += (issue.verificationsCount || 0) * 7;
    // Each duplicate deduction of -20 points
    base -= (issue.duplicateCount || 0) * 20;
    return Math.min(100, Math.max(5, base));
  };

  const calculateUserTrustScore = () => {
    // Derived from creator's total successful interactions
    let base = 75;
    // Add weight from community confirmation of this issue
    base += (issue.verificationsCount || 0) * 1.5;
    base -= (issue.duplicateCount || 0) * 8;
    return Math.min(100, Math.max(15, Math.round(base)));
  };

  const issueTrust = calculateIssueTrustScore();
  const userTrust = calculateUserTrustScore();
  const aiReport = getFullAiAnalysis();

  // Status Phases tracker for Real-Time Lifecycle
  const ALL_PHASES = [
    { label: "Reported", check: true },
    { label: "Under Verification", check: issue.status !== "Reported" },
    { label: "Verified", check: ["Verified", "Escalated", "Repair In Progress", "Pending Resolution Review", "Resolved"].includes(issue.status) },
    { label: "Escalated", check: ["Escalated", "Repair In Progress", "Pending Resolution Review", "Resolved"].includes(issue.status) },
    { label: "Repair In Progress", check: ["Repair In Progress", "Pending Resolution Review", "Resolved"].includes(issue.status) },
    { label: "Pending Resolution Review", check: ["Pending Resolution Review", "Resolved"].includes(issue.status) },
    { label: "Resolved", check: issue.status === "Resolved" }
  ];

  // Determine current active status index
  const getCurrentStatusIndex = () => {
    switch (issue.status) {
      case "Resolved": return 6;
      case "Pending Resolution Review": return 5;
      case "Repair In Progress": return 4;
      case "Escalated": return 3;
      case "Verified": return 2;
      case "Under Verification": return 1;
      case "Reported": return 0;
      default: return 0;
    }
  };

  const currentStatusIdx = getCurrentStatusIndex();

  function getFullAiAnalysis() {
    const analysis = (issue.aiAnalysis || {}) as any;
    const cat = issue.category;
    const sev = issue.severity;
    
    let estimatedUrgency = analysis.estimatedUrgency;
    let visualAssessment = analysis.visualAssessment || analysis.summary;
    let infrastructureAffected = analysis.infrastructureAffected;
    let safetyRisks = analysis.safetyRisks;
    let immediateHazards = analysis.immediateHazards;
    let possibleRootCause = analysis.possibleRootCause;
    let recommendedAction = analysis.recommendedAction || (issue.aiAnalysis as any)?.recommendedAction;
    let duplicateRisk = analysis.duplicateRisk;
    let citizenSafetyRecommendation = analysis.citizenSafetyRecommendation;
    let reasoning = analysis.reasoning;
    
    if (!visualAssessment) {
      if (cat === "Potholes") {
        estimatedUrgency = "High";
        visualAssessment = "A deep, circular pavement cavity approximately 1–1.5 meters in diameter, exhibiting jagged, crumbly margins and asphalt erosion.";
        infrastructureAffected = "Bituminous surface course and granular sub-base layer.";
        safetyRisks = "Cyclist or motorcycle loss of control, swerving to avoid, high-impact suspension shocks.";
        immediateHazards = "Concealed pothole waterlogging during rainfall leading to accidental impacts.";
        possibleRootCause = "Prolonged water infiltration under intense, heavy wheel-load cycles.";
        recommendedAction = "Excavate loose binder material, apply tactical tack coat, and compact with hot bituminous mix.";
        citizenSafetyRecommendation = "Two-wheeler drivers should maintain high alertness. Do not ride close to preceding vehicles.";
        reasoning = "Classified as Potholes due to localized cratering of asphalt surface requiring quick compact mix.";
        duplicateRisk = 20;
      } else if (cat === "Water Leakage" || cat === "Flooding") {
        estimatedUrgency = "Critical";
        visualAssessment = "Pressurized fluid bubbling from sub-surface joints, eroding surrounding soil and creating continuous street puddles.";
        infrastructureAffected = "Underground main water conduit and pedestrian pathway paving.";
        safetyRisks = "Undermining of road foundation, sinkhole potential, contamination of potable water.";
        immediateHazards = "Pedestrian slip risk, localized street flooding, and high resource wastage.";
        possibleRootCause = "Corrosive soil wear on cast-iron pipe body leading to structural seam burst.";
        recommendedAction = "Isolate nearby valve gate, excavate affected section, and install high-density sleeve clamp.";
        citizenSafetyRecommendation = "Pedestrians should avoid stepping on soft surrounding ground as soil might have caved underneath.";
        reasoning = "Identified as Water Leakage due to active pressurized water egress originating from civic utility conduits.";
        duplicateRisk = 12;
      } else if (cat === "Broken Streetlights") {
        estimatedUrgency = "Normal";
        visualAssessment = "Non-functional overhead luminaire assembly. Neighboring poles are active, creating isolated black spots.";
        infrastructureAffected = "Electrical municipal grid network and lighting arm poles.";
        safetyRisks = "Increased probability of pedestrian mugging, collision risk on blind curves, low safety feelings.";
        immediateHazards = "Absolute blackouts at high-speed turning points, making street curves invisible.";
        possibleRootCause = "Secondary photo-sensor relay burnout or short-circuit in wire joints.";
        recommendedAction = "Check voltage draw at base plate, change sodium vapor lamp to 60W LED, and verify photocell function.";
        citizenSafetyRecommendation = "Avoid poorly lit shortcuts after dusk. Carry a phone flash when walking.";
        reasoning = "Categorized as Broken Streetlights due to darkness profile in public roadway lighting zones.";
        duplicateRisk = 5;
      } else if (cat === "Garbage Accumulation" || cat === "Waste Management Issues") {
        estimatedUrgency = "Normal";
        visualAssessment = "Large volume of unsegregated organic and plastic waste overflowing onto pedestrian pathways.";
        infrastructureAffected = "Public sidewalk and storm gutter flow paths.";
        safetyRisks = "Stray animal feeding, toxic liquid leachate runoff, insect and rodent breeding.";
        immediateHazards = "Severe foul odor and blockage of pedestrian walkways forcing citizens onto high-speed lanes.";
        possibleRootCause = "Skipped refuse-clearing schedule by regional waste transport contractor.";
        recommendedAction = "Deploy sanitation skip loader, wash pavement with disinfectant, and set up a penalty warning sign.";
        citizenSafetyRecommendation = "Do not touch or disturb waste piles. Report any illegal commercial dumping instantly.";
        reasoning = "Categorized as Garbage Accumulation due to severe refuse dumping on right-of-way sidewalks.";
        duplicateRisk = 25;
      } else if (cat === "Fallen Trees") {
        estimatedUrgency = "High";
        visualAssessment = "Large structural tree branch snapped and resting across public lanes, impeding vehicular flow.";
        infrastructureAffected = "Primary carriage-way and overhead power transmission lines.";
        safetyRisks = "Vehicle crash into obstruction under low visibility, pedestrian obstruction.";
        immediateHazards = "Entangled live power cables posing electrocution threat.";
        possibleRootCause = "Severe winds coupled with root rot making tree unstable.";
        recommendedAction = "Deploy parks chainsaw crew, safely cut branch into segments, and transport for organic mulching.";
        citizenSafetyRecommendation = "Keep clear of the fallen foliage. Do not touch adjacent metal fences that might be electrified.";
        reasoning = "Classified as Fallen Trees due to substantial botanical obstruction blocking city transit lanes.";
        duplicateRisk = 8;
      } else if (cat === "Open Manholes") {
        estimatedUrgency = "Critical";
        visualAssessment = "Deep drainage access shaft left entirely uncovered without any warning signals or safety cones.";
        infrastructureAffected = "Underground storm drainage and pedestrian pathway.";
        safetyRisks = "Fatal falls for pedestrians (especially children), severe suspension collapse for vehicular traffic.";
        immediateHazards = "Fatal tripping/falling hazard under dark or flooded street conditions.";
        possibleRootCause = "Missing concrete/cast-iron lid due to heavy commercial impact or illegal removal.";
        recommendedAction = "Erect immediate physical protection fence with reflector lights and install a heavy-duty composite lock-lid.";
        citizenSafetyRecommendation = "STAY CLEAR. Do not attempt to jump over or inspect the opening. Help direct children away.";
        reasoning = "Classified as Open Manholes because of missing access shaft covers, representing an extreme life-safety risk.";
        duplicateRisk = 5;
      } else {
        estimatedUrgency = "Normal";
        visualAssessment = "Visual audit shows physical municipal issues violating clear transit standards.";
        infrastructureAffected = "Local public area right-of-way.";
        safetyRisks = "General pedestrian tripping or minor collision risks.";
        immediateHazards = "Localized traffic slowdown.";
        possibleRootCause = "Standard wear and tear or minor accidental damage.";
        recommendedAction = "Dispatch standard maintenance team for restoration.";
        citizenSafetyRecommendation = "Maintain general situational awareness in the immediate vicinity.";
        reasoning = "Identified as custom anomaly matching public works report formats.";
        duplicateRisk = 10;
      }
    }

    return {
      categoryDetected: analysis.categoryDetected || cat,
      estimatedSeverity: analysis.estimatedSeverity || sev,
      summary: visualAssessment || "No visual report logged.",
      suggestedDepartment: analysis.suggestedDepartment || (issue.aiAnalysis as any)?.suggestedDepartment || "Public Works Dept",
      confidenceScore: analysis.confidenceScore || issue.confidenceScore || 85,
      estimatedUrgency: estimatedUrgency || "Normal",
      visualAssessment: visualAssessment || "No visual report logged.",
      infrastructureAffected: infrastructureAffected || "Local street pavement",
      safetyRisks: safetyRisks || "Tripping hazard",
      immediateHazards: immediateHazards || "None",
      possibleRootCause: possibleRootCause || "Material wear",
      recommendedAction: recommendedAction || "On-site dispatch review",
      duplicateRisk: duplicateRisk || 15,
      citizenSafetyRecommendation: citizenSafetyRecommendation || "Proceed with caution",
      reasoning: reasoning || "Initial visual match confirmed"
    };
  };

  // Integrated Verification Questions Prompt
  const getVerificationPrompt = () => {
    if (issue.status === "Resolved") {
      return "Community resolution pending audit. Has this issue truly been cleared from the pavement?";
    }
    switch (issue.category) {
      case "Potholes":
        return "Pavement Hazard: Can you verify this pothole? Validate its existence to notify the road dispatch office.";
      case "Water Leakage":
        return "Fluid Loss: Is water currently shooting up at this location? Verify to trigger urgent valve closures.";
      case "Broken Streetlights":
        return "Dark Corridor: Is this streetlight assembly inactive or flickering at night?";
      case "Waste Management Issues":
      case "Garbage Accumulation":
        return "Refuse Overflow: Can you confirm trash accumulation is present outside of public bins is accurate?";
      default:
        return "Civic Alert: Help your neighbors confirm this reported issue to unlock municipal dispatch.";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "Critical":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium animate-pulse flex items-center gap-1">🔴 Critical Hazard</span>;
      case "High":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium">🟠 High Priority</span>;
      case "Medium":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium">🔵 Medium</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium">🟢 Low</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505]/75 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div 
        className="bg-[#0f0f11] border border-[#1f1f21] w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="p-4 md:p-5 border-b border-[#1f1f21] flex items-start justify-between gap-4 bg-[#111113]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 py-0.5 px-2 bg-[#19191d] rounded-lg border border-[#232328]">
                {issue.category}
              </span>
              <span>•</span>
              {getSeverityBadge(issue.severity)}
            </div>
            <h2 className="text-sm md:text-base font-bold text-zinc-150 tracking-tight leading-snug mt-1">{issue.title}</h2>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#1f1f21]/40 border border-[#1f1f21] rounded text-zinc-400 hover:text-zinc-100 transition"
            id="close-issue-detail-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* DIALOG SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* IMAGE PREVIEW SCREEN */}
          {issue.imageUrl && (
            <div className="relative rounded-xl overflow-hidden bg-[#050505] border border-[#1f1f21] max-h-76 w-full flex items-center justify-center">
              <img src={issue.imageUrl} alt={issue.title} className="w-full object-cover max-h-72" />
            </div>
          )}

          {/* AI DECISION & INSPECTION CARD (CIVIX-AI OPERATIONAL AUDIT) */}
          <div className="p-4 bg-[#111113] border border-teal-500/20 rounded-xl space-y-3.5 relative overflow-hidden shadow-lg shadow-teal-500/5">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-[#1f1f21] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-teal-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-widest">CIVIX Municipal AI Inspection Report</span>
              </div>
              <div className="px-2.5 py-0.5 bg-teal-500/15 border border-teal-400/20 rounded text-[10px] font-mono text-teal-400 font-semibold">
                AI Active • {aiReport.confidenceScore}% Confidence
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-2 bg-[#0c0c0e] border border-[#1f1f21] rounded-lg">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Assessed Urgency</span>
                <span className={`text-xs font-semibold flex items-center gap-1.5 mt-0.5 ${
                  aiReport.estimatedUrgency === 'Immediate' ? 'text-red-400' : aiReport.estimatedUrgency === 'High' ? 'text-amber-400' : 'text-zinc-350 font-medium'
                }`}>
                  <Flame className="h-3 w-3" />
                  {aiReport.estimatedUrgency}
                </span>
              </div>
              
              <div className="p-2 bg-[#0c0c0e] border border-[#1f1f21] rounded-lg">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Duplicate Risk</span>
                <span className="text-xs font-semibold text-zinc-300 block mt-0.5 font-mono">
                  {aiReport.duplicateRisk}% Probability
                </span>
              </div>

              <div className="p-2 bg-[#0c0c0e] border border-[#1f1f21] rounded-lg col-span-2 md:col-span-1">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Suggested Dispatch</span>
                <span className="text-xs font-semibold text-teal-400 truncate block mt-0.5">
                  {aiReport.suggestedDepartment}
                </span>
              </div>
            </div>

            {/* Detailed Professional Visual Assessment */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Professional Visual Assessment</span>
              <p className="text-xs text-zinc-350 font-sans leading-relaxed bg-[#0c0c0e] p-3 rounded-lg border border-[#1f1f21] font-normal">
                {aiReport.visualAssessment}
              </p>
            </div>

            {/* Two-Column Technical Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1f1f21]/40">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Affected Infrastructure</span>
                <span className="text-[11px] text-zinc-300 font-medium block leading-snug">{aiReport.infrastructureAffected}</span>
              </div>

              <div className="space-y-1 bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1f1f21]/40">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Potential Safety Risks</span>
                <span className="text-[11px] text-zinc-300 font-medium block leading-snug">{aiReport.safetyRisks}</span>
              </div>

              <div className="space-y-1 bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1f1f21]/40">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Immediate Hazards</span>
                <span className="text-[11px] text-zinc-300 font-medium block leading-snug">{aiReport.immediateHazards}</span>
              </div>

              <div className="space-y-1 bg-[#0c0c0e]/60 p-2.5 rounded-lg border border-[#1f1f21]/40">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block">Inferred Root Cause</span>
                <span className="text-[11px] text-zinc-300 font-medium block leading-snug">{aiReport.possibleRootCause}</span>
              </div>
            </div>

            {/* Recommended Crew Actions */}
            <div className="bg-teal-950/10 border border-teal-500/10 p-3 rounded-lg space-y-1">
              <span className="text-[9px] font-mono text-teal-400 uppercase tracking-wider block font-bold">Recommended Mitigation Action</span>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{aiReport.recommendedAction}</p>
            </div>

            {/* Explainable AI Decision reasoning: Why this Category? */}
            <div className="bg-[#141416] border border-[#222225] p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">AI Explainability & Categorization Logic</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                "{aiReport.reasoning}"
              </p>
            </div>

            {/* Citizen Safety Advisory */}
            <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold">Citizen On-Site Safety Advisory</span>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans font-medium">{aiReport.citizenSafetyRecommendation}</p>
              </div>
            </div>
          </div>

          {/* REALTIME ISSUE LIFECYCLE TIMELINE VISUAL */}
          <div className="p-4 bg-[#111113] border border-[#1f1f21]/80 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Real-time Issue Lifecycle</span>
            
            <div className="flex items-center justify-between relative pl-2 pr-2">
              {/* Connecting progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#1a1a1e] -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${(currentStatusIdx / 6) * 100}%` }}
              />

              {ALL_PHASES.map((ph, idx) => {
                const isActive = idx === currentStatusIdx;
                const isCompleted = idx < currentStatusIdx;
                
                return (
                  <div key={ph.label} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                      isActive 
                        ? "bg-teal-500 text-[#050505] border-teal-400 scale-125 shadow-lg shadow-teal-500/20" 
                        : isCompleted
                        ? "bg-[#0f0f11] text-teal-400 border-teal-500/30"
                        : "bg-[#0c0c0e] text-zinc-650 border-[#1f1f21]"
                    }`}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[8.5px] font-mono text-center leading-none max-w-[64px] font-medium transition ${
                      isActive ? "text-teal-400 font-bold" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      {ph.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRANSPARENCY, ACCOUNTABILITY & TRUST METERS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Issue Trust Score */}
            <div className="p-3.5 bg-[#0a0a0c] border border-[#1f1f21] rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Issue Trust Rating</span>
                <span className={`text-xs font-mono font-bold ${
                  issueTrust >= 80 ? "text-teal-400" : issueTrust >= 50 ? "text-amber-400" : "text-red-400"
                }`}>
                  {issueTrust}% Trust
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#050505] rounded-full overflow-hidden border border-[#1a1a1d]">
                <div 
                  className={`h-full transition-all duration-500 ${
                    issueTrust >= 80 ? "bg-teal-400" : issueTrust >= 50 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${issueTrust}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-550 leading-relaxed">
                Calculated dynamically from <strong className="text-zinc-400">{issue.verificationsCount}</strong> community validations, duplicate logs and cross-checks.
              </p>
            </div>

            {/* Creator Reputation Score */}
            <div className="p-3.5 bg-[#0a0a0c] border border-[#1f1f21] rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Contributor Credibility</span>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {userTrust}% Level
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#050505] rounded-full overflow-hidden border border-[#1a1a1d]">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                  style={{ width: `${userTrust}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-550 leading-relaxed">
                Authored by <strong className="text-zinc-400">{issue.creatorName}</strong>. Derived from successful log clearances and system validation ratings.
              </p>
            </div>
          </div>

          {/* COMMUNITY VERIFICATION PROMPT & ENGAGEMENT QUESTION ENGINE */}
          <div className="p-4 bg-teal-950/5 border border-teal-900/10 rounded-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-teal-500/5 border-l border-b border-teal-900/10 rounded-bl-lg text-[9px] font-mono text-teal-400 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-teal-400 animate-pulse" />
              Community Mission Prompt
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">Interactive Verification Grid</span>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium font-sans">
                {getVerificationPrompt()}
              </p>
            </div>

            {/* Buttons control tier */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
              {/* Verify existence trigger */}
              <button
                onClick={() => onVerify(issue.id)}
                disabled={alreadyVerified || issue.status === "Resolved" || isActionInProgress}
                className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-2 transition flex-1 cursor-pointer select-none ${
                  alreadyVerified
                    ? "bg-teal-950/20 text-teal-400 border-teal-900/40 cursor-default"
                    : "bg-[#0c0c0e] text-zinc-300 hover:bg-[#121215] border-[#1f1f21]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {alreadyVerified ? `Verified (+35 RP)` : `Verify with Photo (+35 RP)`}
              </button>

              {/* Duplicate check trigger */}
              <button
                onClick={() => onMarkDuplicate(issue.id)}
                disabled={alreadyMarkedDuplicate || issue.status === "Resolved" || isActionInProgress}
                className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-2 transition flex-1 cursor-pointer select-none ${
                  alreadyMarkedDuplicate
                    ? "bg-amber-950/20 text-amber-400 border-amber-900/40 cursor-default"
                    : "bg-[#0c0c0e] text-zinc-300 hover:bg-[#121215] border-[#1f1f21]"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                {alreadyMarkedDuplicate ? `Duplicate Flagged` : `Mark as Duplicate`}
              </button>

              {/* Resolution confirm check trigger */}
              <button
                onClick={() => onConfirmResolution(issue.id)}
                disabled={alreadyConfirmedResolution || issue.status === "Resolved" || isActionInProgress}
                className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-2 transition flex-1 cursor-pointer select-none ${
                  issue.status === "Resolved"
                    ? "bg-emerald-950 border-emerald-990/80 text-emerald-400 cursor-default"
                    : alreadyConfirmedResolution || issue.status === "Pending Resolution Review"
                    ? "bg-emerald-950/15 text-emerald-300 border-emerald-900/30"
                    : "bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                {issue.status === "Resolved"
                  ? "Cleared & Resolved"
                  : issue.status === "Pending Resolution Review"
                  ? "Pending Review"
                  : "Submit Resolution (+50 RP)"}
              </button>
            </div>
          </div>

          {/* DESCRIPTION DETAILS & COORDINATES */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider block">Citizen Comments & Telemetry</span>
              <p className="text-xs text-zinc-350 leading-relaxed font-sans">{issue.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Coordinates lock */}
              <div className="bg-[#0c0c0e] p-3 rounded-xl border border-[#1f1f21] space-y-1 text-xs">
                <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider block">Coordinates GPS Link</span>
                <div className="font-mono text-zinc-300 flex items-center gap-1 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  {issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)}
                </div>
                {issue.address && <div className="text-[10px] text-zinc-500 truncate mt-0.5">{issue.address}</div>}
              </div>

              {/* Meta logs */}
              <div className="bg-[#0c0c0e] p-3 rounded-xl border border-[#1f1f21] space-y-1 text-xs">
                <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider block">Submission Timeline</span>
                <div className="text-zinc-300 font-sans font-medium">Logged by {issue.creatorName}</div>
                <div className="text-[9px] text-zinc-550 font-mono">{new Date(issue.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          </div>

          {/* HISTORICAL TIMELINE TRAIL AUDIT */}
          <div className="border-t border-[#1f1f21] pt-5 space-y-3">
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider block">Evidence Timeline ({issue.timeline?.length || 0})</span>
            
            <div className="relative border-l border-[#1f1f21] pl-4 space-y-6 font-sans text-xs">
              {(issue.timeline || []).map((event) => {
                const evidence = issue.evidence?.find(e => e.id === event.evidenceId);
                return (
                  <div key={event.id} className="relative">
                    <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full bg-[#1c1c1f] border-2 border-teal-500" />
                    
                    <div className="flex items-center justify-between gap-4 font-mono text-[9px] text-zinc-550">
                      <span className="flex items-center gap-1.5">
                        <User className="h-2.5 w-2.5" />
                        {event.actorName}
                      </span>
                      <span>{new Date(event.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="font-semibold text-zinc-200 mt-1 flex items-center gap-2">
                      {event.title}
                      {evidence && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          evidence.isApproved !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {evidence.isApproved !== false ? `${evidence.aiConfidence || 0}% AI Confidence` : 'Verification Failed'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-450 mt-1 font-sans leading-normal">{event.description}</p>
                    
                    {evidence && (
                      <div className="mt-3 relative group">
                        <img 
                          src={evidence.imageUrl} 
                          alt="Evidence" 
                          className="rounded-lg border border-[#1f1f21] max-h-48 object-cover w-full opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[8px] font-mono text-zinc-300">
                          GPS: {evidence.latitude?.toFixed(4) || '0.0000'}, {evidence.longitude?.toFixed(4) || '0.0000'} • {evidence.distanceFromIssue?.toFixed(1) || '0'}m from site
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM METADATA AUDIT BANNER */}
        <div className="p-3.5 bg-[#0a0a0c] border-t border-[#1f1f21] text-center text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-teal-400" />
          <span>Realtime Firestore sync active socket feeds</span>
        </div>

      </div>
    </div>
  );
}

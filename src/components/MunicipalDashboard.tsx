import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  AlertOctagon, 
  Clock, 
  Users, 
  Wrench, 
  CheckCircle, 
  ShieldAlert, 
  Map, 
  BarChart3, 
  ChevronRight, 
  ArrowRight, 
  MapPin, 
  Layers, 
  Smartphone, 
  Activity, 
  CornerDownRight, 
  ThumbsUp, 
  Check, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  RefreshCw,
  Camera,
  Search,
  X
} from "lucide-react";
import { Issue, NeighborhoodHealth } from "../types";

interface MunicipalDashboardProps {
  issues: Issue[];
  health: NeighborhoodHealth;
}

// Seed AI incident template
interface AIIncident {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium";
  reportsCount: number;
  affectedRadius: number;
  affectedPopulation: number;
  departments: string[];
  status: "Awaiting Assignment" | "Inspection Scheduled" | "Repair Started" | "Repair Completed" | "Waiting Community Confirmation" | "Resolved";
  summary: string;
  rootCause: string;
  riskAssessment: string;
  communityTrustScore: number;
  timeline: {
    stage: string;
    time: string;
    description: string;
    actor: string;
  }[];
  originalReports: {
    id: string;
    title: string;
    reporter: string;
    date: string;
    photo: string;
  }[];
  beforePhoto: string;
  afterPhoto: string;
  aiExplanation: string;
  escalationHistory: string[];
}

export default function MunicipalDashboard({ issues, health }: MunicipalDashboardProps) {
  // Let's seed initial realistic AI-generated incidents
  const initialIncidents: AIIncident[] = [
    {
      id: "INC-204",
      title: "Possible Underground Water Main Failure",
      priority: "Critical",
      reportsCount: 8,
      affectedRadius: 350,
      affectedPopulation: 2300,
      departments: ["Water Board", "Road Department", "Electricity Department"],
      status: "Awaiting Assignment",
      summary: "Spatiotemporal analysis detected a high-density cluster of 8 citizen water logging and pressure-loss reports within a 50m radius on Koramangala 80 Feet Road. Moisture telemetry coupled with citizen visual analysis predicts a main pipeline rupture beneath the sidewalk, risking sub-surface erosion and subsequent sinkholes.",
      rootCause: "Aging prestressed concrete cylinder pipe (PCCP) installed in 1994, compromised by severe pressure transients and soil moisture shifts from recent monsoon precipitation.",
      riskAssessment: "Extremely high risk of localized road collapse. Electrical secondary lines running adjacent to the failure zone may short-circuit if flooding penetrates the utility conduits.",
      communityTrustScore: 94,
      timeline: [
        { stage: "System Triggered", time: "Today, 04:30 AM", description: "AI Cluster Synthesis merged 8 individual citizen complaints into single incident outline.", actor: "AI Operations Engine" },
        { stage: "Consensus Lock", time: "Today, 06:15 AM", description: "Voter consensus threshold achieved (+35 RP rewarded to participating citizens).", actor: "Community Verifiers" }
      ],
      originalReports: [
        { id: "REP-101", title: "Heavy water spraying from pavement tile", reporter: "Aarav Sharma", date: "Today, 02:15 AM", photo: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=300&h=200&fit=crop" },
        { id: "REP-104", title: "Sudden drop in tap water pressure with muddy color", reporter: "Priya Patel", date: "Today, 03:02 AM", photo: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&h=200&fit=crop" },
        { id: "REP-109", title: "Sidewalk buckling and bubbling water", reporter: "Arjun Mehta", date: "Today, 04:10 AM", photo: "https://images.unsplash.com/photo-1595180630733-41c888d3e620?w=300&h=200&fit=crop" }
      ],
      beforePhoto: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=500&h=300&fit=crop",
      afterPhoto: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=300&fit=crop",
      aiExplanation: "Visual neural networks mapped wet concrete patterns and bubble velocity indicators, indicating a supply-side pipe bursting at approximately 4.2 bars of pressure.",
      escalationHistory: [
        "04:30 AM - Automated ticket #INC-204 created in draft mode.",
        "06:15 AM - Upgraded to Critical status following multi-source community verification validation."
      ]
    },
    {
      id: "INC-205",
      title: "Major Pothole & Road Base Erosion Cluster",
      priority: "High",
      reportsCount: 12,
      affectedRadius: 180,
      affectedPopulation: 1450,
      departments: ["Road Department", "Traffic Police"],
      status: "Repair Started",
      summary: "AI analysis of 12 verified potholes along Sarjapur Main Road reveals high structural vulnerability. The road surface has completely cracked with deep base course exposure. Highly hazardous for two-wheelers during heavy commute hours.",
      rootCause: "Heavy heavy-vehicle loading coupled with standard sub-base wear, aggravated by poor asphalt binder drainage.",
      riskAssessment: "Severe accident potential for commuters, especially at night. Traffic speeds reduced by 35% causing systemic gridlocks.",
      communityTrustScore: 89,
      timeline: [
        { stage: "System Triggered", time: "Yesterday, 09:12 AM", description: "AI Cluster Synthesis merged 12 pothole reports with GPS validation.", actor: "AI Operations Engine" },
        { stage: "Team Assigned", time: "Yesterday, 11:30 AM", description: "Assigned road rehabilitation wing team Delta-4.", actor: "Municipal Board" },
        { stage: "Inspection Completed", time: "Yesterday, 02:00 PM", description: "Crew verified 4 deep pothole nodes totaling 8.5sqm of damaged base.", actor: "Inspector Rajesh" },
        { stage: "Repair Started", time: "Today, 08:00 AM", description: "Cold-mix asphalt leveling and milling initiated.", actor: "Team Delta-4" }
      ],
      originalReports: [
        { id: "REP-201", title: "Dangerous trench-like pothole", reporter: "Rajesh Kumar", date: "Yesterday, 07:05 AM", photo: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=300&h=200&fit=crop" },
        { id: "REP-204", title: "Two wheelers skidding near signal", reporter: "Ananya Iyer", date: "Yesterday, 08:44 AM", photo: "https://images.unsplash.com/photo-1599740831144-530ba0226330?w=300&h=200&fit=crop" }
      ],
      beforePhoto: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&h=300&fit=crop",
      afterPhoto: "https://images.unsplash.com/photo-1621293954908-907141401fc8?w=500&h=300&fit=crop",
      aiExplanation: "Pavement condition index rating: 24/100 (Failed). AI suggests structural re-overlay of 220m of continuous asphalt.",
      escalationHistory: [
        "Yesterday, 09:12 AM - Pothole cluster flagged near Outer Ring Road.",
        "Yesterday, 11:30 AM - Dispatched to Delta-4 crew."
      ]
    },
    {
      id: "INC-206",
      title: "Sector 4 Streetlight Grid Outage",
      priority: "Medium",
      reportsCount: 6,
      affectedRadius: 250,
      affectedPopulation: 900,
      departments: ["Electricity Department"],
      status: "Inspection Scheduled",
      summary: "Complete darkness along three adjacent blocks of Koramangala Sector 4. Multiple reports highlight non-functioning sodium vapor lamps, posing active safety risks for pedestrians and late-night commuters.",
      rootCause: "Localized phase failure in the distribution transformer line due to secondary fuse overloading.",
      riskAssessment: "Increased public safety risk and dark blind spots. High concern for lone pedestrian navigation.",
      communityTrustScore: 92,
      timeline: [
        { stage: "System Triggered", time: "2 days ago, 08:30 PM", description: "Darkness cluster detected from 6 reports within 2 hours.", actor: "AI Operations Engine" },
        { stage: "Assigned to Grid Supervisor", time: "Yesterday, 09:00 AM", description: "Assigned to BESCOM electrical maintenance division.", actor: "Grid Supervisor" }
      ],
      originalReports: [
        { id: "REP-301", title: "Completely dark road near park", reporter: "Vikram Singh", date: "2 days ago, 07:15 PM", photo: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300&h=200&fit=crop" }
      ],
      beforePhoto: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&h=300&fit=crop",
      afterPhoto: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&h=300&fit=crop",
      aiExplanation: "Neural light sensor readings estimate ambient illumination is below 1.2 lux, presenting immediate security compliance failures.",
      escalationHistory: [
        "2 days ago, 08:30 PM - Grid outage logged.",
        "Yesterday, 09:00 AM - BESCOM inspection scheduled."
      ]
    }
  ];

  const [incidents, setIncidents] = useState<AIIncident[]>(initialIncidents);
  const [selectedIncId, setSelectedIncId] = useState<string>("INC-204");
  const [aiReportModalIncident, setAiReportModalIncident] = useState<AIIncident | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<"All" | "Critical" | "High" | "Medium">("All");
  const [subTab, setSubTab] = useState<"incidents" | "verification-ops">("incidents");

  // State for Community Confirmation Simulation
  const [simulatingUpload, setSimulatingUpload] = useState(false);
  const [simulatedEvidence, setSimulatedEvidence] = useState<{
    reporter: string;
    photo: string;
    aiConfidence: number;
    aiAnalysis: string;
  } | null>(null);

  const selectedIncident = incidents.find(inc => inc.id === selectedIncId) || incidents[0];

  // Filter incidents based on criteria
  const filteredIncidents = incidents.filter(inc => {
    const matchesPriority = filterPriority === "All" || inc.priority === filterPriority;
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  // Workflow update function
  const handleAdvanceWorkflow = (targetStatus: typeof initialIncidents[0]["status"]) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncident.id) {
        const timeStr = "Just Now";
        const actor = targetStatus === "Resolved" ? "Community Consensus" : "Municipal Supervisor";
        const stageDesc = getWorkflowStageDescription(targetStatus);
        
        // Add timeline event
        const newEvent = {
          stage: targetStatus,
          time: timeStr,
          description: stageDesc,
          actor: actor
        };

        const updatedTimeline = [...inc.timeline, newEvent];
        const updatedHistory = [
          ...inc.escalationHistory,
          `Just Now - Status changed to "${targetStatus}" by ${actor}.`
        ];

        return {
          ...inc,
          status: targetStatus,
          timeline: updatedTimeline,
          escalationHistory: updatedHistory
        };
      }
      return inc;
    }));

    // If advanced to "Resolved" directly, clear simulation
    if (targetStatus === "Resolved") {
      setSimulatedEvidence(null);
    }
  };

  const getWorkflowStageDescription = (status: string) => {
    switch (status) {
      case "Inspection Scheduled":
        return "Dispatched professional engineers for onsite structural evaluation.";
      case "Repair Started":
        return "Heavy machinery deployed, road base stabilization or welding works initiated.";
      case "Repair Completed":
        return "Physical work complete. Quality controls passed. System opened for citizen consensus.";
      case "Waiting Community Confirmation":
        return "Awaiting fresh evidence/geo-photos from nearby citizens to authorize closure.";
      case "Resolved":
        return "AI analyzed before-and-after comparison. 95%+ confidence. Ticket officially archives.";
      default:
        return "Team assigned to initial project scope.";
    }
  };

  // Simulate community verification
  const handleSimulateCommunityVerification = () => {
    setSimulatingUpload(true);
    setSimulatedEvidence(null);
    
    setTimeout(() => {
      setSimulatingUpload(false);
      // Create high fidelity simulation payload
      const mockEvidence = {
        reporter: "Vijay Narayanan (Verified Local Scout)",
        photo: selectedIncident.afterPhoto,
        aiConfidence: 97,
        aiAnalysis: "Comparison check SUCCESS: Sub-surface moisture levels stabilized. Sidewalk brick alignment matches original standard. Visual asphalt defect removed. Confidence rating 97.4%."
      };
      
      setSimulatedEvidence(mockEvidence);
      
      // Auto-update incident to "Resolved" with timeline entry
      setIncidents(prev => prev.map(inc => {
        if (inc.id === selectedIncident.id) {
          const newEvent = {
            stage: "Resolved",
            time: "Just Now",
            description: "Citizen geo-photo uploaded. AI Computer Vision verified: Water leakage completely resolved. Surface restored.",
            actor: "AI Verification Agent"
          };
          
          return {
            ...inc,
            status: "Resolved",
            timeline: [...inc.timeline, newEvent],
            escalationHistory: [
              ...inc.escalationHistory,
              "Just Now - Citizen verification validated by AI. Ticket resolved successfully."
            ]
          };
        }
        return inc;
      }));

    }, 2500);
  };

  // Departments Workload calculation
  const deptWorkloads = {
    "Water Board": incidents.filter(i => i.departments.includes("Water Board") && i.status !== "Resolved").length,
    "Road Department": incidents.filter(i => i.departments.includes("Road Department") && i.status !== "Resolved").length,
    "Electricity Department": incidents.filter(i => i.departments.includes("Electricity Department") && i.status !== "Resolved").length,
    "Traffic Police": incidents.filter(i => i.departments.includes("Traffic Police") && i.status !== "Resolved").length,
  };

  // Status counters
  const criticalCount = incidents.filter(i => i.priority === "Critical" && i.status !== "Resolved").length;
  const highCount = incidents.filter(i => i.priority === "High" && i.status !== "Resolved").length;
  const mediumCount = incidents.filter(i => i.priority === "Medium" && i.status !== "Resolved").length;
  const resolvedCount = incidents.filter(i => i.status === "Resolved").length;
  const pendingCount = incidents.filter(i => i.status === "Awaiting Assignment" || i.status === "Inspection Scheduled").length;
  const avgAiConfidence = Math.round(
    issues.length > 0 
      ? issues.reduce((acc, issue) => acc + (issue.confidenceScore || 85), 0) / issues.length
      : 88
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 pb-24">
      
      {/* 1. MUNICIPAL DEMO PERSISTENT BANNER */}
      <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/5 border border-amber-500/25 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">DEMO MUNICIPAL DASHBOARD</h3>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Read-only demonstration of municipal operations. No database mutations or destructive actions permitted.
            </p>
          </div>
        </div>
        <button 
          className="text-xs font-mono font-bold bg-[#0f0f11] hover:bg-amber-500 hover:text-black border border-[#1f1f21] px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Municipal Operations View
        </button>
      </div>

      {/* 2. DEMO HEADER & CORE METRICS BOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f1f21] pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-[#ededed] flex items-center gap-2">
            <Wrench className="h-6 w-6 text-teal-400" />
            Municipal Operations Demo Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            AI-Synthesized multi-sensor reporting and structured municipal response lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 bg-[#0f0f11] border border-[#1f1f21] px-3 py-1.5 rounded-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>OPERATIONAL STATUS: READY</span>
        </div>
      </div>

      {/* 3. MUNICIPAL HOME - KEY METRICS BOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#0f0f11] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Critical Incidents</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-red-400">{criticalCount}</span>
            <span className="text-[10px] text-zinc-600 font-mono">Awaiting</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1">High public risk index</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0f0f11] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">High & Medium priority</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400">{highCount + mediumCount}</span>
            <span className="text-[10px] text-zinc-600 font-mono">Active</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1">Teams dispatched</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0f0f11] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Resolved Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</span>
            <span className="text-[10px] text-emerald-500/20 font-mono font-bold">+100 RP</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1">Approved by citizens</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0f0f11] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Repair Teams Active</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-teal-400">4</span>
            <span className="text-[10px] text-teal-500/20 font-mono font-bold">In Field</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1">Live tracking telemetry</span>
        </div>

        {/* Metric 5 (Hidden on small, visible on large) */}
        <div className="col-span-2 lg:col-span-1 bg-[#0f0f11] border border-[#1f1f21] p-4 rounded-xl flex flex-col justify-between shadow-md">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Avg Resolution Time</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-400">28.5h</span>
            <span className="text-[10px] text-zinc-600 font-mono">India top 5%</span>
          </div>
          <span className="text-[9px] text-zinc-400 mt-1">Co-production speedup</span>
        </div>
      </div>

      {/* NEIGHBORHOOD HEALTH & WORKLOAD BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Neighborhood Health Overview */}
        <div className="bg-[#0f0f11] border border-[#1f1f21] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Neighborhood Health Overview</span>
              <Activity className="h-4 w-4 text-teal-400" />
            </div>
            
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-sans font-extrabold text-[#ededed]">{health.score}</span>
              <div className="flex flex-col">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                  Excellent
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Rank #{health.rankInCity} in Bangalore</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-[#1f1f21]/60 pt-3 text-[11px] font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Streetlight Luminosity:</span>
              <span className="text-teal-400">8.2/10</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Road Quality Index:</span>
              <span className="text-teal-400">8.0/10</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Water Integrity Level:</span>
              <span className="text-teal-400">8.6/10</span>
            </div>
          </div>
        </div>

        {/* Department Workloads */}
        <div className="lg:col-span-2 bg-[#0f0f11] border border-[#1f1f21] p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1f1f21] pb-3 mb-4">
            <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Municipal Department Workloads</span>
            <span className="text-[10px] text-zinc-500 font-mono">Active Incidents / Crew</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(deptWorkloads).map(([dept, count]) => {
              const maxVal = 5;
              const percent = Math.min(100, Math.max(15, (count / maxVal) * 100));
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{dept}</span>
                    <span className="text-zinc-500 font-mono">{count} active</span>
                  </div>
                  <div className="h-2 w-full bg-[#050505] rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept === "Water Board" ? "bg-blue-500" :
                        dept === "Road Department" ? "bg-amber-500" :
                        dept === "Electricity Department" ? "bg-yellow-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3.5 SECTION NAVIGATION (SUBTAB SELECTOR) */}
      <div className="flex border-b border-[#1f1f21] pb-px">
        <button
          onClick={() => setSubTab("incidents")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider font-mono transition-all duration-200 cursor-pointer ${
            subTab === "incidents" 
              ? "border-teal-500 text-teal-400 font-bold bg-teal-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#111113]/50"
          }`}
        >
          <Layers className="h-4 w-4" />
          Incident Control Hub
        </button>
        <button
          onClick={() => setSubTab("verification-ops")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider font-mono transition-all duration-200 cursor-pointer ${
            subTab === "verification-ops" 
              ? "border-teal-500 text-teal-400 font-bold bg-teal-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#111113]/50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          AI Verification Operations Audit
        </button>
      </div>

      {subTab === "incidents" && (
        /* 4. MAIN DUAL COLUMN: INCIDENT QUEUE & INTERACTIVE CONTROL CENTER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: AI INCIDENT QUEUE (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-teal-400" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#ededed]">AI Incident Queue</h2>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
              {filteredIncidents.length} clusters
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-550" />
              <input
                type="text"
                placeholder="Filter incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f0f11] border border-[#1f1f21] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-teal-500/50 outline-none transition"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="bg-[#0f0f11] border border-[#1f1f21] text-[10px] font-mono text-zinc-400 rounded-xl px-2 cursor-pointer outline-none focus:border-teal-500"
            >
              <option value="All">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          {/* Incident Queue List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredIncidents.map(inc => {
              const isSelected = inc.id === selectedIncident.id;
              return (
                <div 
                  key={inc.id}
                  onClick={() => setSelectedIncId(inc.id)}
                  className={`border p-4 rounded-xl transition cursor-pointer select-none relative overflow-hidden ${
                    isSelected 
                      ? "bg-teal-500/5 border-teal-500/40 shadow-md" 
                      : "bg-[#0f0f11] border-[#1f1f21] hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
                      {inc.id}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                      inc.priority === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      inc.priority === "High" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {inc.priority}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-zinc-200 mt-2">{inc.title}</h3>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                    {inc.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2 border-t border-[#1f1f21]/60 text-[9px] font-mono text-zinc-500">
                    <div>
                      <span>Origin: </span>
                      <strong className="text-teal-400">{inc.reportsCount} reports</strong>
                    </div>
                    <div className="text-right">
                      <span>Radius: </span>
                      <strong className="text-zinc-300">{inc.affectedRadius}m</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px]">
                    <div className="flex gap-1">
                      {inc.departments.slice(0, 2).map(dept => (
                        <span key={dept} className="bg-[#050505] px-2 py-0.5 rounded text-[8px] text-zinc-400 border border-zinc-800/80">
                          {dept.replace(" Department", "")}
                        </span>
                      ))}
                    </div>
                    <span className={`font-mono text-[9px] font-bold ${
                      inc.status === "Resolved" ? "text-emerald-400" :
                      inc.status === "Repair Completed" ? "text-amber-400" : "text-zinc-400"
                    }`}>
                      ● {inc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INCIDENT CONTROL & WORKFLOW (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-blue-400" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#ededed]">AI Escalation Package Details</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
              AI Confidence: 96%
            </span>
          </div>

          {/* Detailed Card */}
          <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl overflow-hidden shadow-xl">
            {/* Header branding */}
            <div className="bg-[#121215] p-5 border-b border-[#1f1f21] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Synthesized Operational Ticket</span>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                  <span className="text-teal-400">{selectedIncident.id}</span>
                  {selectedIncident.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-zinc-500 font-mono">Current Status:</span>
                <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 bg-[#050505] border border-zinc-800 rounded-lg ${
                  selectedIncident.status === "Resolved" ? "text-emerald-400 border-emerald-500/30" : "text-amber-400 border-amber-500/30"
                }`}>
                  {selectedIncident.status}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto custom-scrollbar">
              
              {/* Overview & AI Summary */}
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">AI Executive Summary</span>
                <div className="bg-[#050505] p-4 rounded-xl border border-teal-500/10 text-xs text-zinc-300 leading-relaxed font-sans relative">
                  <Sparkles className="absolute top-2 right-2 h-4 w-4 text-teal-400/20" />
                  <p>{selectedIncident.summary}</p>
                </div>
              </div>

              {/* AI Conclusion & Synthesis Insights */}
              <div className="bg-teal-950/10 border border-teal-500/15 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-teal-400 font-mono uppercase tracking-wider font-bold">AI Commander Insights</span>
                  <span className="text-[10px] text-zinc-400 font-mono bg-teal-500/15 px-2 py-0.5 rounded font-bold">✓ Active Cluster Resolution</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#050505] p-2.5 rounded border border-teal-500/10 text-center">
                    <span className="text-[8px] text-zinc-500 font-mono uppercase block">Evidence Files</span>
                    <span className="text-[10px] font-bold text-teal-400 font-mono block mt-1 font-sans">✓ {selectedIncident.reportsCount} Reports</span>
                  </div>
                  <div className="bg-[#050505] p-2.5 rounded border border-teal-500/10 text-center">
                    <span className="text-[8px] text-zinc-500 font-mono uppercase block">Failure Node</span>
                    <span className="text-[10px] font-bold text-teal-400 font-mono block mt-1 font-sans">✓ Shared Asset</span>
                  </div>
                  <div className="bg-[#050505] p-2.5 rounded border border-teal-500/10 text-center">
                    <span className="text-[8px] text-zinc-550 font-mono uppercase block">Spatio-Temporal</span>
                    <span className="text-[10px] font-bold text-teal-400 font-mono block mt-1 font-sans">✓ Radius {selectedIncident.affectedRadius}m</span>
                  </div>
                  <div className="bg-[#050505] p-2.5 rounded border border-teal-500/10 text-center">
                    <span className="text-[8px] text-zinc-550 font-mono uppercase block">Commander Conf.</span>
                    <span className="text-[10px] font-bold text-teal-400 font-mono block mt-1 font-sans">✓ 94% Accuracy</span>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setAiReportModalIncident(selectedIncident)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-zinc-950 font-extrabold text-[10px] rounded-lg shadow-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-950" />
                    Generate AI Report
                  </button>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#050505] p-3.5 rounded-xl border border-zinc-900 space-y-1">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block">Root Cause Analysis</span>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">{selectedIncident.rootCause}</p>
                </div>
                <div className="bg-[#050505] p-3.5 rounded-xl border border-zinc-900 space-y-1">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block">Risk Assessment</span>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">{selectedIncident.riskAssessment}</p>
                </div>
              </div>

              {/* Affected Scope / Population details */}
              <div className="grid grid-cols-3 gap-3 bg-[#050505] p-3 rounded-xl border border-zinc-900 text-center">
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase">Affected Area</span>
                  <span className="text-sm font-bold text-zinc-200 block mt-0.5">{selectedIncident.affectedRadius}m radius</span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase">Citizens Affected</span>
                  <span className="text-sm font-bold text-zinc-200 block mt-0.5">~{selectedIncident.affectedPopulation.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase">Suggested Priority</span>
                  <span className="text-sm font-bold text-red-400 block mt-0.5">P1 (Immediate)</span>
                </div>
              </div>

              {/* Citizen Original Evidence Photos */}
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Citizen Multi-Sourced Evidence</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedIncident.originalReports.map((rep) => (
                    <div key={rep.id} className="bg-[#050505] rounded-lg border border-zinc-900 p-1.5 text-center overflow-hidden">
                      <img src={rep.photo} alt={rep.title} className="h-16 w-full object-cover rounded" />
                      <span className="text-[8px] text-zinc-400 block truncate mt-1.5 font-bold">{rep.title}</span>
                      <span className="text-[7px] text-zinc-500 font-mono block mt-0.5">By {rep.reporter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESCALATION ACTION TIMELINE */}
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Incident Operations Timeline</span>
                <div className="space-y-3.5 pl-3 border-l-2 border-zinc-800">
                  {selectedIncident.timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[17.5px] top-1 h-2.5 w-2.5 rounded-full bg-teal-500 border border-[#050505]" />
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>{evt.stage}</span>
                        <span>{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans mt-0.5 leading-snug">{evt.description}</p>
                      <span className="text-[9px] text-zinc-550 font-mono block">Actor: {evt.actor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WORKFLOW CONTROLLERS & DEMO SIMULATOR */}
              <div className="border-t border-[#1f1f21] pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Interactive Workflow Simulator (Demo Operations)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAdvanceWorkflow("Inspection Scheduled")}
                    disabled={selectedIncident.status === "Resolved"}
                    className="px-2.5 py-1.5 bg-[#050505] hover:bg-[#121215] border border-zinc-800 text-[10px] text-zinc-300 rounded-lg transition"
                  >
                    1. Schedule Inspection
                  </button>
                  <button
                    onClick={() => handleAdvanceWorkflow("Repair Started")}
                    disabled={selectedIncident.status === "Resolved"}
                    className="px-2.5 py-1.5 bg-[#050505] hover:bg-[#121215] border border-zinc-800 text-[10px] text-zinc-300 rounded-lg transition"
                  >
                    2. Start Repair
                  </button>
                  <button
                    onClick={() => handleAdvanceWorkflow("Repair Completed")}
                    disabled={selectedIncident.status === "Resolved"}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-lg transition"
                  >
                    3. Mark Repair Complete
                  </button>
                </div>

                {/* Simulated Verification Node */}
                {selectedIncident.status === "Repair Completed" && (
                  <div className="bg-amber-950/15 border border-amber-500/20 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Smartphone className="h-4 w-4 text-amber-400 animate-bounce" />
                      <span className="font-bold text-amber-400">Nearby Citizens Notified! Awaiting Community Confirmation.</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      The status is currently set to <strong>Repair Completed</strong>. A live request was sent to nearby citizens to verify the repair. Simulate a local citizen uploading fresh geo-evidence to complete the workflow:
                    </p>
                    <button
                      onClick={handleSimulateCommunityVerification}
                      disabled={simulatingUpload}
                      className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {simulatingUpload ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          AI Analyzing Verification Evidence...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Simulate Citizen Verification Upload & AI Compare
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Simulation Completed View */}
                {simulatedEvidence && (
                  <div className="bg-emerald-950/15 border border-emerald-500/25 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Community Consensus Achieved! Issue Resolved.
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-zinc-550 font-mono uppercase block">Before Report Photo</span>
                        <img src={selectedIncident.beforePhoto} alt="Before" className="h-20 w-full object-cover rounded border border-red-500/20" />
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-550 font-mono uppercase block">After Verification Photo</span>
                        <img src={simulatedEvidence.photo} alt="After" className="h-20 w-full object-cover rounded border border-emerald-500/20" />
                      </div>
                    </div>
                    <div className="bg-[#050505] p-2.5 rounded border border-emerald-500/10 text-[10px] text-zinc-400 font-mono">
                      <span className="text-emerald-400 block font-bold">AI Neuro-Vision Report:</span>
                      {simulatedEvidence.aiAnalysis}
                    </div>
                  </div>
                )}

                {selectedIncident.status === "Resolved" && (
                  <div className="bg-emerald-950/15 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      Incident closed successfully.
                    </div>
                    <button 
                      onClick={() => {
                        setIncidents(initialIncidents);
                        setSimulatedEvidence(null);
                      }}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Reset Simulator State
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

      </div>
      )}

      {subTab === "verification-ops" && (
        <div className="space-y-6">
          {/* Sub-Header */}
          <div className="border-b border-[#1f1f21] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-teal-400">Verification Audit Desk</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Real-time telemetry on citizen-provided site evidence, GPS locking status, and neural classifications.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0f0f11] border border-teal-500/10 px-2.5 py-1 rounded text-[10px] font-mono text-teal-400">
              <Sparkles className="h-3 w-3 animate-pulse" />
              AI AUDIT: LIVE
            </div>
          </div>

          {/* Verification Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-xl flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Audited Nodes</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-[#ededed]">
                  {issues.filter(i => i.verificationsCount && i.verificationsCount > 0).length + 24}
                </span>
                <span className="text-[9px] text-zinc-650 font-mono">NODES</span>
              </div>
              <span className="text-[9px] text-teal-500 font-medium mt-1">100% blockchain hashed</span>
            </div>

            <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-xl flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">AI Confidence Avg</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-teal-400">
                  {avgAiConfidence}%
                </span>
                <span className="text-[9px] text-teal-500/20 font-bold font-mono">TARGET &gt;80%</span>
              </div>
              <span className="text-[9px] text-zinc-400 mt-1">Direct from Gemini vision</span>
            </div>

            <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-xl flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">GPS Lock Integrity</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-blue-400">98.2%</span>
                <span className="text-[9px] text-zinc-650 font-mono">VALID</span>
              </div>
              <span className="text-[9px] text-zinc-400 mt-1">Under 150m proximity limit</span>
            </div>

            <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-xl flex flex-col justify-between">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Active Patrol Scouts</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl font-black text-purple-400">42</span>
                <span className="text-[9px] text-purple-500/20 font-bold font-mono">EARNING RP</span>
              </div>
              <span className="text-[9px] text-zinc-400 mt-1">Co-production citizen pool</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pending Audit List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#ededed]">Active Incident Audit Queue</h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-400">
                  {issues.filter(i => i.status === 'Reported' || i.status === 'Under Verification').length} Pending AI Verification
                </span>
              </div>

              {/* Items Table */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {issues.filter(i => i.status === 'Reported' || i.status === 'Under Verification').length === 0 ? (
                  <div className="p-8 border border-dashed border-[#1f1f21] rounded-xl text-center text-zinc-500 space-y-2">
                    <CheckCircle className="h-8 w-8 text-teal-400 mx-auto animate-pulse" />
                    <p className="text-xs font-medium">All active anomalies have been validated and locked by citizens!</p>
                    <p className="text-[10px] text-zinc-650 font-mono">Report new issues via the Command Center to populate this queue.</p>
                  </div>
                ) : (
                  issues.filter(i => i.status === 'Reported' || i.status === 'Under Verification').map(issue => {
                    return (
                      <div 
                        key={issue.id}
                        className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-xl space-y-3 relative overflow-hidden group hover:border-teal-500/20 transition duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-mono font-bold text-zinc-400">
                              {issue.category}
                            </span>
                            <h4 className="text-sm font-bold text-zinc-200 mt-1">{issue.title}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{issue.address || "Local Site Grid Reference"}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            issue.severity === 'Critical' ? 'bg-red-500/15 text-red-400' : issue.severity === 'High' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>

                        {/* Audit Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono text-zinc-400 border-t border-[#1f1f21]/60">
                          <div>
                            <span className="text-[9px] text-zinc-650 block uppercase">Trust Index</span>
                            <span className="font-semibold text-zinc-350">{issue.confidenceScore || 85}% AI Rank</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-650 block uppercase">Telemetry Proximity</span>
                            <span className="font-semibold text-zinc-350">Within 150m</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[9px] text-zinc-650 block uppercase">Scouts Count</span>
                            <span className="font-semibold text-zinc-350">{issue.verificationsCount || 0} verifications</span>
                          </div>
                        </div>

                        {/* Visual scanning hover tip */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                            <Smartphone className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                            Awaiting citizen site photograph upload
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Audit Logs & Timeline Feed (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-teal-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#ededed]">Live Operations Log</h3>
              </div>

              {/* Log Feed */}
              <div className="p-5 bg-[#0f0f11] border border-[#1f1f21] rounded-2xl space-y-4 h-[440px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4 relative pl-3.5 border-l border-[#1f1f21]">
                  
                  {/* Log Item 1 */}
                  <div className="space-y-0.5 relative">
                    <div className="absolute -left-[19.5px] top-1 h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/10" />
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>AUDIT LOCKED</span>
                      <span>12 mins ago</span>
                    </div>
                    <p className="text-xs text-zinc-350 font-sans">Scout Rajesh Mehta submitted validated geo-evidence for streetlight node #LGT-412.</p>
                    <span className="text-[9px] font-mono text-teal-400 block font-bold">+35 RP Issued</span>
                  </div>

                  {/* Log Item 2 */}
                  <div className="space-y-0.5 relative">
                    <div className="absolute -left-[19.5px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>DUPLICATE FILTERED</span>
                      <span>42 mins ago</span>
                    </div>
                    <p className="text-xs text-zinc-350 font-sans">CIVIX AI automatically intercepted duplicate image upload at same-site coordinate (Water leakage node).</p>
                    <span className="text-[9px] font-mono text-amber-500 block">Deduction applied to contributor score</span>
                  </div>

                  {/* Log Item 3 */}
                  <div className="space-y-0.5 relative">
                    <div className="absolute -left-[19.5px] top-1 h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/10" />
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>GPS CALIBRATION MATCH</span>
                      <span>2 hours ago</span>
                    </div>
                    <p className="text-xs text-zinc-350 font-sans">GPS core triangulated coordinate matching (accuracy limit of 14m on citizen upload).</p>
                  </div>

                  {/* Log Item 4 */}
                  <div className="space-y-0.5 relative">
                    <div className="absolute -left-[19.5px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>DEEP SYNTHESIS LOCK</span>
                      <span>4 hours ago</span>
                    </div>
                    <p className="text-xs text-zinc-350 font-sans">Google Gemini analyzed visual imagery of tree limb blockage, classifying obstruction priority as HIGH.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI REPORT MODAL */}
      {aiReportModalIncident && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setAiReportModalIncident(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f11] w-full max-w-3xl rounded-2xl border border-teal-500/20 overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#111113] border-b border-[#1f1f21] p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Official Audit Document
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Report ID: {aiReportModalIncident.id}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#ededed] mt-1 font-sans">
                    AI Synthesis Incident Report
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setAiReportModalIncident(null)} 
                className="p-2 hover:bg-[#1f1f21] rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
              
              {/* Cover Section */}
              <div className="border-b border-[#1f1f21] pb-5 space-y-2">
                <h1 className="text-lg font-bold text-zinc-100 font-sans tracking-tight">
                  {aiReportModalIncident.title}
                </h1>
                <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                  This intelligence synthesis packages multi-sourced citizen telemetry and verified consensus triggers to form an official municipal response docket. 
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#050505] p-4 rounded-xl border border-zinc-900">
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase block">Priority Level</span>
                  <span className="text-xs font-bold text-red-400 block mt-0.5 uppercase tracking-wide">
                    ● {aiReportModalIncident.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase block">Total Consensus Votes</span>
                  <span className="text-xs font-bold text-zinc-200 block mt-0.5 font-mono">
                    {aiReportModalIncident.reportsCount} verified logs
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase block">Spatio-Temporal Radius</span>
                  <span className="text-xs font-bold text-zinc-200 block mt-0.5 font-mono">
                    {aiReportModalIncident.affectedRadius} meters
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-550 font-mono uppercase block">Estimated Impact Scope</span>
                  <span className="text-xs font-bold text-teal-400 block mt-0.5 font-mono">
                    ~{aiReportModalIncident.affectedPopulation.toLocaleString()} citizens
                  </span>
                </div>
              </div>

              {/* AI Executive Analysis */}
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">AI Operational Summary</span>
                <div className="bg-[#050505] p-4 rounded-xl border border-teal-500/10 text-zinc-300 leading-relaxed font-sans relative">
                  <Sparkles className="absolute top-2.5 right-2.5 h-4.5 w-4.5 text-teal-400/20 animate-pulse" />
                  <p>{aiReportModalIncident.summary}</p>
                </div>
              </div>

              {/* Analysis breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-900 space-y-1.5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block">Spatio-Temporal Root Cause</span>
                  <p className="text-zinc-300 font-sans leading-relaxed">{aiReportModalIncident.rootCause}</p>
                </div>
                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-900 space-y-1.5">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block">AI Risk Assessment</span>
                  <p className="text-zinc-300 font-sans leading-relaxed">{aiReportModalIncident.riskAssessment}</p>
                </div>
              </div>

              {/* Interactive Cluster Maps & Affected Area block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-between h-28">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase">Assigned Departments</span>
                  <div className="flex flex-wrap gap-1 justify-center py-2">
                    {aiReportModalIncident.departments.map(dept => (
                      <span key={dept} className="bg-teal-950/20 border border-teal-500/10 text-teal-400 px-2 py-0.5 rounded text-[8px] uppercase tracking-wide">
                        {dept}
                      </span>
                    ))}
                  </div>
                  <span className="text-[7px] text-zinc-550 font-mono">Dispatched for intervention</span>
                </div>

                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-between h-28">
                  <span className="text-[8px] text-zinc-550 font-mono uppercase">Suggested Action Plan</span>
                  <p className="text-[10px] text-zinc-300 font-sans leading-snug py-1">
                    Conduct ultrasonic sub-surface pipeline scanning and schedule immediate trenchless repair bypass.
                  </p>
                  <span className="text-[7px] text-zinc-550 font-mono">P1 Action Protocol</span>
                </div>

                <div className="bg-[#050505] p-4 rounded-xl border border-zinc-900 text-center flex flex-col justify-between h-28">
                  <span className="text-[8px] text-zinc-550 font-mono uppercase">Community Health Standing</span>
                  <div className="text-base font-extrabold text-teal-400 py-1">
                    Score: {health.score}/10
                  </div>
                  <span className="text-[7px] text-zinc-550 font-mono">Rank #{health.rankInCity} in Bangalore</span>
                </div>
              </div>

              {/* Citizen Evidence and Repair Comparison photos */}
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Spatio-Temporal Verification Photos</span>
                <div className="grid grid-cols-3 gap-3">
                  {aiReportModalIncident.originalReports.map((rep, index) => (
                    <div key={index} className="bg-[#050505] rounded-xl border border-zinc-900 p-2 overflow-hidden text-center">
                      <span className="text-[8px] text-zinc-500 font-mono block mb-1">ORIGINAL REPORT #{index+1}</span>
                      <img src={rep.photo} alt={rep.title} className="h-20 w-full object-cover rounded-lg border border-zinc-800" />
                      <span className="text-[8px] text-zinc-400 font-bold block truncate mt-1">{rep.title}</span>
                      <span className="text-[7px] text-zinc-550 block">By {rep.reporter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Comparisons */}
              <div className="bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border border-teal-500/10 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-teal-400 font-mono uppercase tracking-wider font-bold font-sans">
                    Before & After Visual Consensus comparison
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    Accuracy rating: 97.4%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-center">
                    <span className="text-[8px] text-red-400 font-mono uppercase block font-bold">🚨 BEFORE (Citizen Flagged Issue)</span>
                    <img src={aiReportModalIncident.beforePhoto} alt="Before" className="h-28 w-full object-cover rounded-lg border border-red-500/10" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <span className="text-[8px] text-emerald-400 font-mono uppercase block font-bold">✅ AFTER (Verified Restored State)</span>
                    <img src={aiReportModalIncident.status === "Resolved" && simulatedEvidence ? simulatedEvidence.photo : aiReportModalIncident.afterPhoto} alt="After" className="h-28 w-full object-cover rounded-lg border border-emerald-500/10" />
                  </div>
                </div>
                <div className="bg-[#050505] p-3 rounded border border-teal-500/10 text-[10px] text-zinc-400 leading-relaxed font-sans">
                  <strong className="text-teal-400 font-mono">AI Neuro-Vision Summary Analysis:</strong> 
                  {aiReportModalIncident.status === "Resolved" && simulatedEvidence 
                    ? simulatedEvidence.aiAnalysis 
                    : "Continuous spatial telemetry confirms sub-surface moisture levels stabilized. Asphalt alignment matches municipal engineering compliance levels of 97.4%."}
                </div>
              </div>

              {/* Incident Timeline */}
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Official Incident Operations Timeline</span>
                <div className="space-y-3.5 pl-3.5 border-l-2 border-[#1f1f21]">
                  {aiReportModalIncident.timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-teal-400" />
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                        <span className="font-bold text-zinc-400 uppercase">{evt.stage}</span>
                        <span>{evt.time}</span>
                      </div>
                      <p className="text-zinc-300 mt-0.5 leading-relaxed font-sans">{evt.description}</p>
                      <span className="text-[8px] text-zinc-550 font-mono block">Log source: {evt.actor}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#1f1f21] bg-[#111113] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
                <span>Operational Docket synthesized autonomously by Google Gemini</span>
              </div>
              <button 
                onClick={() => setAiReportModalIncident(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1a1a1e] hover:bg-[#232328] border border-[#2d2d34] text-zinc-300 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Close Operational Report
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

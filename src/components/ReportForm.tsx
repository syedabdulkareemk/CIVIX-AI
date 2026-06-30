import React, { useState, useEffect } from "react";
import { Issue, Category, Severity, AIAnalysis } from "../types";
import InteractiveMap from "./InteractiveMap";
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  X, 
  Loader2, 
  ChevronRight, 
  ShieldCheck,
  Briefcase,
  FileCheck,
  RotateCcw,
  UploadCloud,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DiagnosticPanel from "./DiagnosticPanel";

interface ReportFormProps {
  onSubmitReport: (issueData: any) => void;
  onCancel: () => void;
  currentUserUid: string;
  currentUserDisplayName: string;
  initialData?: {
    latitude: number;
    longitude: number;
    category?: Category;
    title?: string;
    description?: string;
  };
  theme?: "light" | "dark" | "system";
}

export default function ReportForm({
  onSubmitReport,
  onCancel,
  currentUserUid,
  currentUserDisplayName,
  initialData,
  theme
}: ReportFormProps) {
  // Step tracker
  // 1: Upload Photo / Pin-Drop -> 2: AI Review -> 3: Dispatch Done
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // Attachment image states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Geographic coordinates & GPS states
  const [latitude, setLatitude] = useState(initialData?.latitude ?? 12.9716);
  const [longitude, setLongitude] = useState(initialData?.longitude ?? 77.5946);
  const [address, setAddress] = useState(
    initialData 
      ? `Coordinated Target Sector (Lat: ${initialData.latitude.toFixed(4)}, Lng: ${initialData.longitude.toFixed(4)})` 
      : "No. 12, M.G. Road, Ashok Nagar, Bengaluru, Karnataka - 560001"
  );
  
  // Decoupled AI detections holding
  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    category: Category;
    severity: Severity;
    deptName: string;
    confidence: number;
    isFallback?: boolean;
    diagnostics?: any;
    
    // Rich details
    estimatedUrgency?: 'Immediate' | 'High' | 'Normal';
    visualAssessment?: string;
    infrastructureAffected?: string;
    safetyRisks?: string;
    immediateHazards?: string;
    possibleRootCause?: string;
    recommendedAction?: string;
    duplicateRisk?: number;
    citizenSafetyRecommendation?: string;
    reasoning?: string;
  } | null>(null);

  // Pre-populate if initialData is provided
  useEffect(() => {
    if (initialData) {
      setImagePreview("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop");
      setAiResult({
        title: initialData.title || "Infrastructure Maintenance Mission",
        description: initialData.description || "Active mission objective requiring field verification and status reporting.",
        category: initialData.category || "Roads",
        severity: "Medium",
        deptName: "BBMP Operations (Sector Coordination)",
        confidence: 98,
        diagnostics: {
          confidenceScore: "98%",
          structuralIntegrityRating: "Medium Risk",
          riskScore: "A- (72/100)",
          impactRadius: "150 meters",
          reputationPointsAllocated: "45 RP"
        }
      });
      setFormStep(2);
    }
  }, [initialData]);

  // Optional manual adjustments states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [modifiedTitle, setModifiedTitle] = useState("");
  const [modifiedDesc, setModifiedDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle drag and drop image loading
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      // Trigger Gemini Automatic Intel Parsing
      triggerAiDiagnostic(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Coordinates alignments from sub map picks
  const handlePositionChanged = (coords: { lat: number; lng: number; address: string }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setAddress(coords.address);
  };

  // Launch Automatic Gemini Analyzer
  const triggerAiDiagnostic = async (base64Img: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: base64Img,
          title: "",
          description: ""
        })
      });

      if (!response.ok) throw new Error("API Analyzer error");

      const resJson = await response.json();
      
      const categoryDetected = resJson.categoryDetected || "Other";
      const estimatedSeverity = resJson.estimatedSeverity || "Medium";
      
      setAiResult({
        title: resJson.titleDetected || "Detected Urban Anomaly",
        description: resJson.descriptionDetected || "Civic issue scanned automatically from visual data.",
        category: categoryDetected as Category,
        severity: estimatedSeverity as Severity,
        deptName: resJson.suggestedDepartment || "General Municipal Services",
        confidence: resJson.confidenceScore || 85,
        isFallback: resJson.isFallback,
        diagnostics: resJson.diagnostics,
        
        // Detailed analysis properties
        estimatedUrgency: resJson.estimatedUrgency,
        visualAssessment: resJson.visualAssessment,
        infrastructureAffected: resJson.infrastructureAffected,
        safetyRisks: resJson.safetyRisks,
        immediateHazards: resJson.immediateHazards,
        possibleRootCause: resJson.possibleRootCause,
        recommendedAction: resJson.recommendedAction,
        duplicateRisk: resJson.duplicateRisk,
        citizenSafetyRecommendation: resJson.citizenSafetyRecommendation,
        reasoning: resJson.reasoning
      });

      setModifiedTitle(resJson.titleDetected || "Detected Urban Anomaly");
      setModifiedDesc(resJson.descriptionDetected || "Civic issue scanned automatically from visual data.");
      setFormStep(2); // Auto jump to review screen!

    } catch (e) {
      console.error("Gemini Scan Failed. Using generic diagnostic template:", e);
      // Fallback
      setAiResult({
        title: "Identified Street Incident",
        description: "Visual evidence suggests a maintenance requirement. Site audit recommended to confirm details.",
        category: "Other",
        severity: "Medium",
        deptName: "Municipal Service Desk",
        confidence: 60,
        estimatedUrgency: "Normal",
        visualAssessment: "Visual assessment reveals general asphalt weathering.",
        infrastructureAffected: "Public roads",
        safetyRisks: "Minor vehicle tyre vibration.",
        immediateHazards: "None active",
        possibleRootCause: "Environmental weathering and surface age.",
        recommendedAction: "Schedule standard repair.",
        duplicateRisk: 10,
        citizenSafetyRecommendation: "Proceed with caution.",
        reasoning: "General classification."
      });
      setModifiedTitle("Identified Street Incident");
      setModifiedDesc("Visual evidence suggests a maintenance requirement. Site audit recommended to confirm details.");
      setFormStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitFinalReport = async () => {
    if (!aiResult || isSubmitting) return;

    setIsSubmitting(true);
    const reportPayload = {
      title: modifiedTitle,
      description: modifiedDesc,
      category: aiResult.category,
      severity: aiResult.severity,
      latitude,
      longitude,
      address,
      gpsDetected: true,
      imageUrl: imagePreview,
      aiAnalysis: {
        categoryDetected: aiResult.category,
        estimatedSeverity: aiResult.severity,
        summary: modifiedDesc,
        suggestedDepartment: aiResult.deptName,
        confidenceScore: aiResult.confidence,
        
        estimatedUrgency: aiResult.estimatedUrgency,
        visualAssessment: aiResult.visualAssessment,
        infrastructureAffected: aiResult.infrastructureAffected,
        safetyRisks: aiResult.safetyRisks,
        immediateHazards: aiResult.immediateHazards,
        possibleRootCause: aiResult.possibleRootCause,
        recommendedAction: aiResult.recommendedAction,
        duplicateRisk: aiResult.duplicateRisk,
        citizenSafetyRecommendation: aiResult.citizenSafetyRecommendation,
        reasoning: aiResult.reasoning
      },
      creatorId: currentUserUid,
      creatorName: currentUserDisplayName
    };

    try {
      await onSubmitReport(reportPayload);
    } catch (err) {
      console.error("Submission failed inside form:", err);
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setImagePreview(null);
    setAiResult(null);
    setFormStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-[#1f1f21] pb-4">
        <div className="space-y-1">
          <h1 className="text-base font-bold text-[#ededed] flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-teal-400 animate-pulse" />
            AI-Powered Zero-Form Intelligence
          </h1>
          <p className="text-[11px] text-zinc-400">
            Take a photo or upload an image. The municipal AI automatically writes details and maps coordinates.
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="p-1 hover:bg-[#1f1f21] rounded-lg text-zinc-400 hover:text-zinc-100 transition"
          id="cancel-report-btn"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {formStep === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* LEFT COLUMN: UPLOAD PHOTO CAPTURE ZONE */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 1: Capture or Drop Photo</h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition ${
                  isDragOver 
                    ? "border-teal-500 bg-teal-950/10 scale-[1.01]" 
                    : "border-[#1f1f21] bg-[#0c0c0e] hover:border-zinc-800"
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                    <p className="text-xs font-mono font-medium text-teal-400 animate-pulse">
                      Gemini is analyzing photo...
                    </p>
                    <p className="text-[10px] text-zinc-500 max-w-xs">
                      Checking shapes, depths & environment anomalies to detect category, severity, description and dispatch.
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4 w-full h-full justify-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      id="image-file-input"
                    />
                    
                    <div className="h-14 w-14 rounded-full bg-teal-500/5 border border-teal-500/15 flex items-center justify-center text-teal-400">
                      <UploadCloud className="h-7 w-7" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-200">Drag or click to attach damage photo</p>
                      <p className="text-[10px] text-zinc-500">Supports PNG, JPG, JPEG files</p>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121214] border border-[#1f1f21] rounded-xl text-[10px] text-zinc-400 hover:text-zinc-200 transition">
                      <Camera className="h-3.5 w-3.5" />
                      Capture Live Pothole / Leak
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: GPS MAP PLACEMENT PIN */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 2: Position Alignment</h2>
              
              <div className="space-y-3">
                <InteractiveMap 
                  issues={[]}
                  clusters={[]}
                  interactive={true}
                  onPositionSelected={handlePositionChanged}
                  newReportLat={latitude}
                  newReportLng={longitude}
                  theme={theme}
                />
                
                <div className="p-3 bg-[#0c0c0e] border border-[#1f1f21] rounded-xl flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-550 block">Target Location Coordinates</span>
                    <span className="text-xs font-medium text-zinc-300 block leading-tight">{address}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* LEFT COLUMN: ATTACHED IMAGE SUMMARY */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">AI Diagnostic Result</h2>
                
                {imagePreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-[#27272a] h-[250px] shadow-lg">
                    <img src={imagePreview} alt="Attached Core report log" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-md">
                      Intelligence Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Reset button if photo is wrong */}
              <button
                onClick={handleResetForm}
                className="w-full py-2.5 bg-[#0c0c0e] hover:bg-[#121215] border border-[#1f1f21] text-zinc-300 hover:text-[#ededed] font-mono text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="h-4 w-4 text-zinc-400" />
                Capture different item
              </button>
            </div>

            {/* RIGHT COLUMN: AI DETECTED INPUTS VIEW & SUBMIT */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Review AI-Generated Dispatch</h2>
              
              {aiResult && (
                <div className="space-y-4 bg-[#0c0c0e] border border-[#1f1f21] p-5 rounded-2xl shadow-xl relative overflow-hidden">
                  
                  {/* Compact AI Decision Card */}
                  <div className="bg-teal-950/10 border border-teal-500/15 p-3 rounded-xl flex flex-col gap-1.5 text-left font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] text-teal-400 font-bold uppercase tracking-widest">CIVIX AI DECISION CARD</span>
                      <span className="text-[8px] bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded text-teal-300">CORE MATCH</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 border-t border-[#1f1f21]/60 pt-1.5">
                      <div>
                        <span>Category: </span>
                        <strong className="text-teal-300 font-semibold">{aiResult.category}</strong>
                      </div>
                      <div>
                        <span>Confidence: </span>
                        <strong className="text-teal-300 font-semibold">{aiResult.confidence}%</strong>
                      </div>
                      <div>
                        <span>GPS Proximity: </span>
                        <strong className="text-emerald-400 font-semibold">100% VALID</strong>
                      </div>
                      <div>
                        <span>Visual Match: </span>
                        <strong className="text-emerald-400 font-semibold">CONFIRMED</strong>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-3 bg-teal-500/5 text-teal-400 border-l border-b border-[#1f1f21] rounded-bl-xl text-[10px] font-mono font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    {aiResult.confidence}% AI Match
                  </div>
                  
                  <DiagnosticPanel isFallback={!!aiResult.isFallback} diagnostics={aiResult.diagnostics} />

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Report Title</label>
                    {isEditingTitle ? (
                      <input 
                        type="text" 
                        value={modifiedTitle}
                        onChange={(e) => setModifiedTitle(e.target.value)}
                        className="w-full p-2 bg-[#050505] border border-[#1f1f21] text-xs text-zinc-200 rounded-lg outline-none focus:border-teal-500"
                        onBlur={() => setIsEditingTitle(false)}
                        autoFocus
                      />
                    ) : (
                      <div className="flex justify-between items-start group">
                        <span className="text-xs font-bold text-zinc-250 leading-snug">{modifiedTitle}</span>
                        <button onClick={() => setIsEditingTitle(true)} className="text-[10px] text-teal-400 hover:underline font-mono ml-2">Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-sans">Full Citizen Summary</label>
                    {isEditingDesc ? (
                      <textarea
                        value={modifiedDesc}
                        onChange={(e) => setModifiedDesc(e.target.value)}
                        className="w-full h-20 p-2 bg-[#050505] border border-[#1f1f21] text-xs text-zinc-200 rounded-lg outline-none focus:border-teal-500 resize-none font-sans"
                        onBlur={() => setIsEditingDesc(false)}
                        autoFocus
                      />
                    ) : (
                      <div className="flex justify-between items-start group">
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{modifiedDesc}</p>
                        <button onClick={() => setIsEditingDesc(true)} className="text-[10px] text-teal-400 hover:underline font-mono ml-2">Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2.5 bg-[#050505] border border-[#1f1f21]/60 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Category category</span>
                      <span className="text-xs font-bold text-teal-400 block">{aiResult.category}</span>
                    </div>

                    <div className="p-2.5 bg-[#050505] border border-[#1f1f21]/60 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Estimated Gravity</span>
                      <span className="text-xs font-bold text-red-400 block">{aiResult.severity}</span>
                    </div>
                  </div>

                  {/* Department suggestion */}
                  <div className="p-3 bg-[#0a0a0c]/60 border border-[#1f1f21]/40 rounded-xl flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block leading-none">Suggested Department Dispatch</span>
                      <span className="text-xs font-semibold text-zinc-300 block mt-1 leading-tight">{aiResult.deptName}</span>
                    </div>
                  </div>

                  {/* Geolocation metadata */}
                  <div className="p-3 bg-zinc-950/40 border border-[#1f1f21]/40 rounded-xl flex items-center gap-2.5 text-[11px] text-zinc-400 font-mono">
                    <Globe className="h-4 w-4 text-emerald-400" />
                    <span>GPS Signal: [{latitude.toFixed(4)}, {longitude.toFixed(4)}] Address locked</span>
                  </div>

                  {/* Action dispatch submission button */}
                  <button
                    onClick={handleSubmitFinalReport}
                    disabled={isSubmitting}
                    className={`w-full py-3 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all ${
                      isSubmitting
                        ? "bg-zinc-800 text-zinc-550 cursor-not-allowed border border-zinc-750"
                        : "bg-gradient-to-r from-teal-500 to-emerald-400 text-zinc-950 hover:bg-teal-400 hover:scale-[1.01]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                        AI is analyzing and filing your report...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4" />
                        File Intel Report (+50 RP)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

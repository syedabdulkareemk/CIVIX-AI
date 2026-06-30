import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UploadCloud, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  RotateCcw,
  Code,
  Eye,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

export default function AITester() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        runAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (base64Img: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
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

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.diagnostics?.error || "AI Analysis API failed.");
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#ededed] flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-teal-400" />
          AI Analysis Laboratory
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Multi-modal testing interface for verifying Gemini issue categorization, severity detection, and duplicate risk auditing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1f1f21] bg-[#111113] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Input: Raw Visual Evidence</span>
              {image && (
                <button onClick={reset} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
            
            <div className="p-6">
              {!image ? (
                <label className="h-[400px] border-2 border-dashed border-[#1f1f21] hover:border-teal-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-[#0c0c0e] group">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="h-16 w-16 rounded-full bg-teal-500/5 border border-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <UploadCloud className="h-8 w-8 text-teal-400" />
                  </div>
                  <p className="text-sm font-bold text-[#ededed]">Drop test image here</p>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Supports Potholes, Waste, Lighting, etc.</p>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-[#1f1f21] aspect-video shadow-2xl">
                    <img src={image} alt="Test" className="w-full h-full object-cover" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
                        <span className="text-xs font-mono font-bold text-teal-400 animate-pulse uppercase tracking-widest">
                          Executing Gemini Vision Scan...
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-teal-950/5 border border-teal-900/10 rounded-xl flex gap-3">
                    <Info className="h-5 w-5 text-teal-400 shrink-0" />
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      <strong>AI Protocol:</strong> The image is encoded as Base64 and transmitted via secure API route to Gemini 1.5 Flash. The model is prompted to perform zero-shot municipal categorization and severity estimation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!analysisResult && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#0f0f11]/50 border border-[#1f1f21] border-dashed rounded-2xl"
              >
                <Eye className="h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-sm font-medium text-zinc-500">Upload an image to start real-time AI audit</p>
              </motion.div>
            ) : analysisResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Visual Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Categorization</span>
                    <span className="text-sm font-bold text-teal-400 block">{analysisResult.categoryDetected}</span>
                  </div>
                  <div className="p-4 bg-[#0f0f11] border border-[#1f1f21] rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Severity Impact</span>
                    <span className={`text-sm font-bold block ${
                      analysisResult.estimatedSeverity === 'Critical' ? 'text-red-500' : 
                      analysisResult.estimatedSeverity === 'High' ? 'text-amber-500' : 'text-blue-400'
                    }`}>
                      {analysisResult.estimatedSeverity}
                    </span>
                  </div>
                </div>

                {/* Main Analysis Text */}
                <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-[#1f1f21] bg-[#111113] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Parsed Semantic Result</span>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">{analysisResult.confidenceScore}% Match</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#ededed]">{analysisResult.titleDetected}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed font-sans">{analysisResult.descriptionDetected}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-[#1f1f21]">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-zinc-500">Department Dispatch:</span>
                        <span className="text-xs font-bold text-zinc-300">{analysisResult.suggestedDepartment}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-zinc-500">Recommended Action:</span>
                        <span className="text-xs font-bold text-zinc-300">{analysisResult.recommendedAction}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-zinc-500">Duplicate Hazard Risk:</span>
                        <span className="text-xs font-bold text-amber-500">{analysisResult.duplicateRisk}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Response JSON */}
                <div className="bg-[#0f0f11] border border-[#1f1f21] rounded-2xl overflow-hidden">
                  <div className="p-3 border-b border-[#1f1f21] bg-[#111113] flex items-center gap-2">
                    <Code className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Raw Gemini Response Node</span>
                  </div>
                  <div className="p-4 bg-[#050505] overflow-auto max-h-[300px]">
                    <pre className="text-[10px] font-mono text-teal-500/80 leading-relaxed">
                      {JSON.stringify(analysisResult.rawResponse || analysisResult, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

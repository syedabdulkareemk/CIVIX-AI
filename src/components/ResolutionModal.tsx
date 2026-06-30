import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, Camera, MapPin, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { Issue, UserProfile } from "../types";
import { toast } from "sonner";
import { RejectionModal } from "./RejectionModal";

interface ResolutionModalProps {
  issue: Issue;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (updatedIssue: Issue) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({ issue, user, onClose, onSuccess }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejection, setRejection] = useState<{ reason: string; details?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        captureLocation();
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    setIsCapturing(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsCapturing(false);
        },
        () => {
          setLocation({ lat: issue.latitude, lng: issue.longitude });
          setIsCapturing(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation({ lat: issue.latitude, lng: issue.longitude });
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!image || !location) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}/resolution-evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName,
          imageUrl: image,
          latitude: location.lat,
          longitude: location.lng
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Resolution evidence submitted!", {
          description: "AI is comparing before/after states. Issue moved to Pending Review."
        });
        onSuccess(result.issue);
      } else {
        setRejection({ reason: result.error, details: result.details });
        toast.error("Submission failed", { description: result.error });
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      {rejection && (
        <RejectionModal 
          reason={rejection.reason} 
          details={rejection.details} 
          onClose={() => {
            setRejection(null);
            onClose();
          }}
        />
      )}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col"
      >
        <div className="relative p-8 pb-4">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Submit Resolution</h3>
              <p className="text-slate-500 font-medium">Verify that the issue has been fixed</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Original State</p>
              <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img src={issue.imageUrl || "https://images.unsplash.com/photo-1584464431033-0662bd23a827?w=300&fit=crop"} alt="Before" className="w-full h-full object-cover opacity-60 grayscale" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Fixed State (Evidence)</p>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  image ? 'border-emerald-500' : 'border-blue-400 bg-blue-50/10 hover:bg-blue-50/20'
                }`}
              >
                {image ? (
                  <img src={image} alt="After" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-blue-600">UPLOAD PHOTO</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${location ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">{location ? 'Location Verified' : isCapturing ? 'Locating...' : 'Awaiting Location'}</p>
                <p className="text-xs text-slate-500">{location ? 'Precise GPS stamp attached' : 'Must be within 150m of site'}</p>
              </div>
            </div>
            {location && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>

          <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Accountability Note:</strong> Submitting false resolution evidence is a violation of the Community Charter and will result in a significant reputation penalty and possible account suspension.
            </p>
          </div>
        </div>

        <div className="p-8 pt-0 flex gap-4">
          <button 
            disabled={!image || !location || isSubmitting}
            onClick={handleSubmit}
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'Submit Evidence for Review'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export type Category = 
  | 'Potholes' 
  | 'Road Damage' 
  | 'Water Leakage' 
  | 'Waste Management Issues' 
  | 'Garbage Accumulation' 
  | 'Broken Streetlights' 
  | 'Fallen Trees' 
  | 'Open Manholes' 
  | 'Flooding' 
  | 'Traffic Signal Issues' 
  | 'Public Safety Hazards' 
  | 'Damaged Public Infrastructure' 
  | 'Construction Hazards' 
  | 'Other';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus = 
  | 'Reported' 
  | 'Under Verification' 
  | 'Verified' 
  | 'Escalated' 
  | 'Repair In Progress' 
  | 'Pending Resolution Review' 
  | 'Resolved';

export type UserRank = 
  | 'Citizen' 
  | 'Scout' 
  | 'Verifier' 
  | 'Inspector' 
  | 'Guardian' 
  | 'Community Hero';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Evidence {
  id: string;
  type: 'report' | 'verification' | 'resolution';
  photoURL: string;
  imageUrl?: string; // Legacy/Alias support
  timestamp: string;
  userId: string;
  userName: string;
  gps?: { lat: number, lng: number };
  latitude?: number; // Spread for easier access
  longitude?: number; // Spread for easier access
  aiConfidence?: number;
  aiAnalysis?: string;
  isApproved?: boolean;
  distanceFromOriginal?: number; // in meters
  distanceFromIssue?: number; // Alias
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus | 'Comment' | 'Action' | 'Verification' | 'Resolution Evidence';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  evidenceId?: string; // Reference to Evidence object
}

export interface AIAnalysis {
  categoryDetected: Category;
  estimatedSeverity: Severity;
  summary: string;
  suggestedDepartment: string;
  confidenceScore: number;
  
  // Rich structural report properties
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
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: Category;
  severity: Severity;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address?: string;
  gpsDetected: boolean;
  confidenceScore: number;
  aiAnalysis?: AIAnalysis;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  verificationsCount: number;
  duplicateCount: number;
  resolutionConfirmations: number;
  verifiedUsers: string[]; // List of user IDs
  duplicateUsers: string[]; // List of user IDs
  resolverUsers: string[]; // List of user IDs
  timeline: TimelineEvent[];
  evidence: Evidence[]; // Full evidence registry
  verificationThreshold: number; // RP or count needed
  isOfficialResolved: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rank: UserRank;
  xp?: number;
  reputation: number;
  issuesReported: number;
  issuesVerified: number;
  missionsCompleted: number;
  completedMissionsList: string[];
  achievements: Achievement[];
  gender?: string;
  city?: string;
  state?: string;
  preferredLanguage?: string;
  joinedDate?: string;
  trustScore?: number;
  area?: string;
  areaRanking?: string;
  nationalRanking?: string;
  isOnboarded?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetIssueId?: string;
  type: 'verify' | 'check_repair' | 'confirm_leak' | 'validate_report';
  xpReward?: number;
  repReward: number;
  latitude: number;
  longitude: number;
  status: 'Active' | 'Completed';
}

export interface Cluster {
  id: string;
  type: 'Road Infrastructure Cluster' | 'Water Network Cluster' | 'Electrical Cluster' | 'Waste Cluster' | 'General Hazard Cluster';
  severity: Severity;
  summary: string;
  affectedIssueIds: string[];
  count?: number; // Number of issues in cluster
  latitude: number;
  longitude: number;
}

export interface NeighborhoodHealth {
  score: number;
  infrastructure: number;
  safety: number;
  cleanliness: number;
  participation: number;
  trend: 'up' | 'down' | 'stable';
  rankInCity: number;
  totalAreas: number;
}

export interface PredictiveInsight {
  id: string;
  type: 'growth' | 'risk' | 'trend' | 'participation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timeframe: string;
}

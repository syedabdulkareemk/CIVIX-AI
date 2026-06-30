import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth as getAuthOriginal, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as signOutOriginal, 
  onAuthStateChanged as onAuthStateChangedOriginal, 
  User as FirebaseUser,
  signInWithEmailAndPassword as signInWithEmailAndPasswordOriginal,
  createUserWithEmailAndPassword as createUserWithEmailAndPasswordOriginal
} from "firebase/auth";

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  Firestore
} from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseDb: Firestore | null = null;
export let isRealFirebase = false;

// Mock auth system to support seamless offline/unconfigured operation
let mockAuthListeners: Array<(user: any) => void> = [];
let currentMockUser: any = null;

// Read initial mock user state from localStorage if present
try {
  const savedUserStr = localStorage.getItem("civic_hero_mock_auth_user");
  if (savedUserStr) {
    currentMockUser = JSON.parse(savedUserStr);
  }
} catch (e) {
  console.error("Failed to read mock auth user:", e);
}

function notifyMockAuthListeners() {
  mockAuthListeners.forEach(cb => {
    try {
      cb(currentMockUser);
    } catch (e) {
      console.error("Error in mock auth listener callback:", e);
    }
  });
}

if (firebaseConfig.apiKey) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuthOriginal(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    isRealFirebase = true;
  } catch (e) {
    console.error("Firebase init failed", e);
  }
}

export function getAuth() {
  if (isRealFirebase) return getAuthOriginal(firebaseApp);
  return { currentUser: currentMockUser } as any; 
}

export function onAuthStateChanged(auth: any, callback: any) {
  if (isRealFirebase) return onAuthStateChangedOriginal(auth, callback);
  
  mockAuthListeners.push(callback);
  // Emit current state immediately to kickstart the loading sequence
  const timer = setTimeout(() => {
    callback(currentMockUser);
  }, 100);
  
  return () => {
    mockAuthListeners = mockAuthListeners.filter(cb => cb !== callback);
    clearTimeout(timer);
  };
}

export function signOut(auth: any) {
  if (isRealFirebase) return signOutOriginal(auth);
  
  currentMockUser = null;
  localStorage.removeItem("civic_hero_mock_auth_user");
  notifyMockAuthListeners();
  return Promise.resolve();
}

export function signInWithEmailAndPassword(auth: any, email: string, password: string) {
  if (isRealFirebase) return signInWithEmailAndPasswordOriginal(auth, email, password);
  
  console.log("Mock Login successful for:", email);
  currentMockUser = { uid: "demo-user", email, displayName: email.split("@")[0] };
  localStorage.setItem("civic_hero_mock_auth_user", JSON.stringify(currentMockUser));
  notifyMockAuthListeners();
  return Promise.resolve({ user: currentMockUser } as any);
}

export function createUserWithEmailAndPassword(auth: any, email: string, password: string) {
  if (isRealFirebase) return createUserWithEmailAndPasswordOriginal(auth, email, password);
  
  console.log("Mock Sign Up successful for:", email);
  currentMockUser = { uid: "demo-user", email, displayName: email.split("@")[0] };
  localStorage.setItem("civic_hero_mock_auth_user", JSON.stringify(currentMockUser));
  notifyMockAuthListeners();
  return Promise.resolve({ user: currentMockUser } as any);
}

// Local storage keys for persistent fallback mode
const LOCAL_PROFILE_KEY = "civic_hero_user_profile";
const LOCAL_ISSUES_KEY = "civic_hero_issues";
const LOCAL_NOTIFICATIONS_KEY = "civic_hero_notifications";
const LOCAL_COMPLETED_MISSIONS_KEY = "civic_hero_completed_missions";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rank: "Citizen" | "Scout" | "Verifier" | "Inspector" | "Guardian" | "Community Hero";
  xp?: number;
  reputation: number;
  issuesReported: number;
  issuesVerified: number;
  missionsCompleted: number;
  completedMissionsList: string[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
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

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  icon: string;
  type: "reported" | "mission" | "critical" | "verification" | "rank" | "activity" | "nearby";
  createdAt: string;
  unread: boolean;
  issueId?: string;
}

// 1. Fallback State Initializers
const DEFAULT_USER_PROFILE: UserProfile = {
  uid: "current-user-alex",
  email: "citizen.hero@community.org",
  displayName: "Alex Carter",
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  rank: "Scout",
  xp: 350,
  reputation: 150,
  issuesReported: 6,
  issuesVerified: 12,
  missionsCompleted: 2,
  completedMissionsList: ["mission-1"],
  achievements: [
    { id: "first-report", title: "Eagle Eye", description: "Reported your first infrastructure issue.", icon: "Eye", unlockedAt: new Date(2026, 5, 10).toISOString() },
    { id: "five-verifications", title: "Pillar of Truth", description: "Verified 5 community reports accurately.", icon: "ShieldCheck", unlockedAt: new Date(2026, 5, 15).toISOString() }
  ]
};

// Safe localStorage wrapper for sandboxed environments
const inMemoryStore: { [key: string]: string } = {};
const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read denied, using memory-store.", e);
      return inMemoryStore[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied, using memory-store.", e);
      inMemoryStore[key] = value;
    }
  }
};

// 2. AUTHENTICATION CONTROLLER & FIRESTORE PROFILE HANDLERS
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid,
      email: firebaseAuth?.currentUser?.email,
      emailVerified: firebaseAuth?.currentUser?.emailVerified,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous,
      tenantId: firebaseAuth?.currentUser?.tenantId,
      providerInfo: firebaseAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (isRealFirebase && firebaseDb) {
    try {
      const userDoc = doc(firebaseDb, "users", uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.error("Error fetching user profile from Firestore:", err);
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  }
  return null;
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  safeStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  if (isRealFirebase && firebaseDb) {
    try {
      const userDoc = doc(firebaseDb, "users", profile.uid);
      await setDoc(userDoc, profile, { merge: true });
    } catch (err) {
      console.error("Error saving user profile to Firestore:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  }
}

export async function getPersistedUserProfile(): Promise<UserProfile> {
  if (isRealFirebase && firebaseAuth?.currentUser) {
    const fsProfile = await getUserProfileFromFirestore(firebaseAuth.currentUser.uid);
    if (fsProfile) {
      safeStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(fsProfile));
      return fsProfile;
    }
  }
  
  const stored = safeStorage.getItem(LOCAL_PROFILE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return parsed as UserProfile;
      }
    } catch (e) {}
  }
  
  // Return a fresh incomplete profile for onboarding
  const fresh: UserProfile = {
    uid: firebaseAuth?.currentUser?.uid || "unauthenticated",
    email: firebaseAuth?.currentUser?.email || "",
    displayName: firebaseAuth?.currentUser?.displayName || "New Hero",
    photoURL: firebaseAuth?.currentUser?.photoURL || "",
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
  return fresh;
}

export function savePersistedUserProfile(profile: UserProfile) {
  saveUserProfileToFirestore(profile).catch(err => {
    console.error("Failed to sync profile to Firestore:", err);
  });
}

// Google Sign-In using Firebase Authentication (No mock fallback)
export async function triggerGoogleSignIn(onSuccess: (profile: UserProfile, isNewUser: boolean) => void): Promise<UserProfile> {
  if (isRealFirebase && firebaseAuth && firebaseDb) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    const user = result.user;
    
    // Look up profile in Firestore
    const userDoc = doc(firebaseDb, "users", user.uid);
    let docSnap;
    try {
      docSnap = await getDoc(userDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }
    
    let profile: UserProfile;
    let isNew = false;
    if (docSnap.exists()) {
      profile = docSnap.data() as UserProfile;
    } else {
      isNew = true;
      profile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Committed Citizen",
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
      try {
        await setDoc(userDoc, profile);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
      }
    }
    safeStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    onSuccess(profile, isNew);
    return profile;
  } else {
    // Elegant Google Sign-In mock fallback
    const profile: UserProfile = {
      uid: "mock-google-user",
      email: "google.hero@example.com",
      displayName: "Google Hero",
      photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
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
    currentMockUser = { uid: "mock-google-user", email: "google.hero@example.com", displayName: "Google Hero" };
    localStorage.setItem("civic_hero_mock_auth_user", JSON.stringify(currentMockUser));
    safeStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    notifyMockAuthListeners();
    onSuccess(profile, true);
    return profile;
  }
}

// 3. PERSISTENT LOCAL DATA MANAGEMENT
export function getStoredNotifications(): NotificationItem[] {
  const stored = safeStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  
  // Default Notifications
  const defaults: NotificationItem[] = [
    {
      id: "n-1",
      title: "Critical Burst Pressure Water Leak!",
      body: "A critical water leakage issue was reported 400m away on Outer Ring Road. Click to review Diagnostics.",
      icon: "Waves",
      type: "critical",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread: true,
      issueId: "issue-3"
    },
    {
      id: "n-2",
      title: "New Verification Mission Available",
      body: "Validate the Pothole on Sony World Junction to secure +25 Reputation Points.",
      icon: "ShieldAlert",
      type: "mission",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      unread: true,
      issueId: "issue-2"
    },
    {
      id: "n-3",
      title: "Road Damage Needs Resolve Confirmation",
      body: "Storm drain has been declared Resolved. Is this accurate? Confirm resolution to earn +75 RP.",
      icon: "Trash2",
      type: "verification",
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      unread: false,
      issueId: "issue-1"
    }
  ];
  safeStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveNotifications(notifs: NotificationItem[]) {
  safeStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

export function addNotification(title: string, body: string, type: "reported" | "mission" | "critical" | "verification", issueId?: string) {
  const current = getStoredNotifications();
  const newItem: NotificationItem = {
    id: "notif-" + Date.now(),
    title,
    body,
    icon: type === "critical" ? "Flame" : type === "mission" ? "Compass" : type === "verification" ? "Key" : "Check",
    type,
    createdAt: new Date().toISOString(),
    unread: true,
    issueId
  };
  saveNotifications([newItem, ...current]);
}

// Helper to deduce Rank from Reputation Points (RP)
export function calculateRankFromReputation(rp: number): "Citizen" | "Scout" | "Verifier" | "Inspector" | "Guardian" | "Community Hero" {
  if (rp >= 2000) return "Community Hero";
  if (rp >= 1000) return "Guardian";
  if (rp >= 600) return "Inspector";
  if (rp >= 300) return "Verifier";
  if (rp >= 100) return "Scout";
  return "Citizen";
}

export async function saveVerificationToFirestore(userId: string, issueId: string, displayName: string): Promise<void> {
  if (isRealFirebase && firebaseDb) {
    try {
      const verificationId = `${userId}_${issueId}`;
      const verificationDoc = doc(firebaseDb, "verifications", verificationId);
      await setDoc(verificationDoc, {
        id: verificationId,
        userId,
        issueId,
        verifiedBy: displayName,
        timestamp: new Date().toISOString()
      }, { merge: true });
      console.log(`Stored verification in Firestore for issue ${issueId} by user ${userId}`);
    } catch (err) {
      console.error("Error saving verification to Firestore:", err);
    }
  }
}

export async function getUserVerificationsFromFirestore(userId: string): Promise<string[]> {
  if (isRealFirebase && firebaseDb) {
    try {
      const verificationsCol = collection(firebaseDb, "verifications");
      const q = query(verificationsCol, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const verifiedIssueIds: string[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.issueId) {
          verifiedIssueIds.push(data.issueId);
        }
      });
      return verifiedIssueIds;
    } catch (err) {
      console.error("Error fetching verifications from Firestore:", err);
    }
  }
  return [];
}


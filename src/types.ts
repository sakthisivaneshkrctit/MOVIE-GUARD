export type UserRole = 'USER' | 'ADMIN';

export type AgeRating = 'U' | 'U/A' | 'A'; // Universal, Universal/Adult (13+), Adult (18+)

export type FamilyRelationship = 
  | 'Self' 
  | 'Spouse' 
  | 'Son' 
  | 'Daughter' 
  | 'Father' 
  | 'Mother' 
  | 'Brother' 
  | 'Sister' 
  | 'Grandfather' 
  | 'Grandmother' 
  | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: FamilyRelationship;
  aadhaarNumber: string; // 12-digit format e.g. "5482 9104 2319"
  age: number;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  photoUrl: string; // Base64 or image URL for biometric face matching
  registeredAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  aadhaarNumber?: string; // 12-digit format e.g. "4920 1829 3048"
  webcamPhotoUrl: string; // Base64 or image URL captured during registration
  role: UserRole;
  registeredAt: string;
  familyMembers?: FamilyMember[];
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  category: 'Action' | 'Sci-Fi' | 'Thriller' | 'Drama' | 'Animation' | 'Documentary';
  posterUrl: string;
  videoUrl: string;
  duration: string; // e.g., "1h 52m" or "2m 10s"
  rating: AgeRating;
  minAge: number; // e.g. 0, 13, 18
  isUserUploaded?: boolean;
  uploadedBy?: string;
  views: number;
  createdAt: string;
}

export interface WatchHistory {
  id: string;
  mediaId: string;
  mediaTitle: string;
  posterUrl: string;
  watchedAt: string;
  progressPercentage: number;
}

export type LogStatus = 'SUCCESS' | 'WARNING' | 'DENIED';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
  status: LogStatus;
}

export interface FaceVerificationResult {
  verified: boolean;
  matchScore: number; // 0 - 100%
  userEmail: string;
  message: string;
  timestamp: string;
  verifiedMemberName?: string;
  verifiedAadhaar?: string;
  verifiedAge?: number;
  euclideanDistance?: number;
  relationship?: FamilyRelationship;
}

export type AppRoute = 
  | 'home'
  | 'movies'
  | 'movie-details'
  | 'player'
  | 'verifyface'
  | 'access-denied'
  | 'profile'
  | 'admin'
  | 'login'
  | 'register'
  | 'java-code'
  | 'drive'
  | 'aadhaar-card';

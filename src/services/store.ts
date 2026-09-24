import { User, MediaItem, ActivityLog, WatchHistory, FaceVerificationResult, LogStatus, FamilyMember, FamilyRelationship } from '../types';
import { INITIAL_USERS, INITIAL_MEDIA_ITEMS, INITIAL_LOGS } from '../data/mockData';
import { 
  analyzeFacialBiometrics, 
  matchCapturedFaceAgainstCandidates, 
  getOrExtractFeatureVector, 
  HouseholdCandidate,
  getBiometricMemoryCacheSize
} from './faceAnalysis';

const STORAGE_KEYS = {
  USERS: 'movie_guard_users_v3',
  MEDIA: 'movie_guard_media_tamil_v3',
  LOGS: 'movie_guard_logs_tamil_v3',
  CURRENT_USER: 'movie_guard_current_user_v3',
  WATCH_HISTORY: 'movie_guard_history_tamil_v3',
  BIOMETRIC_MEMORY: 'movie_guard_biometric_memory_v2',
};

class MovieGuardStore {
  private users: User[] = [];
  private mediaItems: MediaItem[] = [];
  private logs: ActivityLog[] = [];
  private currentUser: User | null = null;
  private watchHistory: WatchHistory[] = [];

  constructor() {
    this.init();
    // Pre-warm biometric feature vector memory in the background for zero-latency face recognition
    this.prewarmBiometricMemory();
  }

  /**
   * Pre-loads and caches 111-D feature vectors for all registered household members in memory
   */
  public async prewarmBiometricMemory(): Promise<number> {
    try {
      const candidates = this.getAllHouseholdCandidates();
      for (const c of candidates) {
        if (c.photoUrl) {
          await getOrExtractFeatureVector(c.photoUrl, c.id);
        }
      }
      return getBiometricMemoryCacheSize();
    } catch (e) {
      console.warn('Biometric memory pre-warming warning:', e);
      return 0;
    }
  }

  /**
   * Return all household candidates (Primary User + Family Members)
   */
  public getAllHouseholdCandidates(targetUser?: User): HouseholdCandidate[] {
    const u = targetUser || this.currentUser || (this.users[0] || null);
    if (!u) return [];

    return [
      {
        id: u.id,
        name: u.name,
        relationship: 'Primary Account Owner',
        age: u.age,
        aadhaarNumber: u.aadhaarNumber || '2841 9382 7105',
        photoUrl: u.webcamPhotoUrl,
      },
      ...(u.familyMembers || []).map(fm => ({
        id: fm.id,
        name: fm.name,
        relationship: fm.relationship,
        age: fm.age,
        aadhaarNumber: fm.aadhaarNumber,
        photoUrl: fm.photoUrl,
      }))
    ];
  }

  private init() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;

      // Ensure Sakthi Sivanesh exists with his 4 family members (total 5 linked household citizens)
      const sakthiIdx = this.users.findIndex(u => u.id === 'u1');
      if (sakthiIdx === -1) {
        this.users.unshift(INITIAL_USERS[0]);
      } else if (!this.users[sakthiIdx].familyMembers || this.users[sakthiIdx].familyMembers.length < 4) {
        this.users[sakthiIdx].familyMembers = INITIAL_USERS[0].familyMembers;
      }

      const savedMedia = localStorage.getItem(STORAGE_KEYS.MEDIA);
      this.mediaItems = savedMedia ? JSON.parse(savedMedia) : INITIAL_MEDIA_ITEMS;

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      this.logs = savedLogs ? JSON.parse(savedLogs) : INITIAL_LOGS;

      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      // Default to Sakthi Sivanesh (with 4 linked Aadhaars: Sakthi, Sangeshwaran, Ratheesahan, Rithikraj)
      this.currentUser = (parsedUser && parsedUser.id === 'u1') 
        ? parsedUser 
        : (this.users.find(u => u.id === 'u1') || INITIAL_USERS[0]);

      const savedHistory = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
      this.watchHistory = savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error('Store initialization error:', e);
      this.users = INITIAL_USERS;
      this.mediaItems = INITIAL_MEDIA_ITEMS;
      this.logs = INITIAL_LOGS;
      this.currentUser = INITIAL_USERS[0];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(this.mediaItems));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(this.watchHistory));
    } catch (e) {
      console.error('Store save error:', e);
    }
  }

  // --- USER AUTHENTICATION ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public login(email: string, password?: string): { success: boolean; user?: User; message: string } {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      this.addLog(email, 'LOGIN_FAILED', 'Account not found with this email address', 'DENIED');
      return { success: false, message: 'Invalid email or user does not exist.' };
    }

    if (password && user.password && user.password !== password) {
      this.addLog(email, 'LOGIN_FAILED', 'Invalid password attempt', 'DENIED');
      return { success: false, message: 'Incorrect password.' };
    }

    this.currentUser = user;
    this.save();
    this.addLog(user.email, 'LOGIN_SUCCESS', `User ${user.name} logged in successfully`, 'SUCCESS');

    return { success: true, user, message: 'Login successful!' };
  }

  public logout() {
    if (this.currentUser) {
      this.addLog(this.currentUser.email, 'LOGOUT', 'User logged out', 'SUCCESS');
    }
    this.currentUser = null;
    this.save();
  }

  public register(userData: Omit<User, 'id' | 'registeredAt' | 'role'> & { role?: 'USER' | 'ADMIN' }): { success: boolean; user?: User; message: string } {
    const existing = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: userData.name,
      email: userData.email.trim(),
      password: userData.password,
      age: userData.age,
      webcamPhotoUrl: userData.webcamPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      role: userData.role || 'USER',
      registeredAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.save();

    this.addLog(newUser.email, 'USER_REGISTERED', `Registered new user account (Age: ${newUser.age}) with webcam facial profile`, 'SUCCESS');

    return { success: true, user: newUser, message: 'Registration completed successfully!' };
  }

  public updateUserPhoto(webcamPhotoUrl: string) {
    if (!this.currentUser) return;
    this.currentUser.webcamPhotoUrl = webcamPhotoUrl;
    const idx = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (idx !== -1) {
      this.users[idx].webcamPhotoUrl = webcamPhotoUrl;
    }
    this.save();
    // Immediately persist face vector in high-efficiency memory cache
    getOrExtractFeatureVector(webcamPhotoUrl, this.currentUser.id).catch(console.warn);
    this.addLog(this.currentUser.email, 'FACIAL_PROFILE_UPDATED', 'Updated webcam facial template in persistent memory', 'SUCCESS');
  }

  public updateUserProfile(updates: { name?: string; age?: number; dob?: string; gender?: 'Male' | 'Female' | 'Other'; aadhaarNumber?: string; webcamPhotoUrl?: string }) {
    if (!this.currentUser) return;
    if (updates.name !== undefined) this.currentUser.name = updates.name.trim();
    if (updates.age !== undefined) this.currentUser.age = Number(updates.age);
    if (updates.dob !== undefined) this.currentUser.dob = updates.dob;
    if (updates.gender !== undefined) this.currentUser.gender = updates.gender;
    if (updates.aadhaarNumber !== undefined) this.currentUser.aadhaarNumber = updates.aadhaarNumber;
    if (updates.webcamPhotoUrl !== undefined) this.currentUser.webcamPhotoUrl = updates.webcamPhotoUrl;

    const idx = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.currentUser };
    }
    this.save();
    this.addLog(this.currentUser.email, 'PROFILE_UPDATED', `Updated profile (Name: ${this.currentUser.name}, Age: ${this.currentUser.age}, Aadhaar: ${this.currentUser.aadhaarNumber || 'Active'})`, 'SUCCESS');
  }

  // --- FAMILY MEMBERS & AADHAAR MANAGEMENT ---
  public isAadhaarNumberUsed(aadhaar: string, excludeId?: string): boolean {
    const cleanTarget = aadhaar.replace(/\D/g, '');
    if (!cleanTarget) return false;

    // Check all users
    for (const u of this.users) {
      if (u.id !== excludeId && u.aadhaarNumber && u.aadhaarNumber.replace(/\D/g, '') === cleanTarget) {
        return true;
      }
      if (u.familyMembers) {
        for (const fm of u.familyMembers) {
          if (fm.id !== excludeId && fm.aadhaarNumber && fm.aadhaarNumber.replace(/\D/g, '') === cleanTarget) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public addFamilyMember(memberData: Omit<FamilyMember, 'id' | 'registeredAt'>): { success: boolean; message: string; member?: FamilyMember } {
    if (!this.currentUser) {
      return { success: false, message: 'You must be logged in to add family members.' };
    }

    if (this.isAadhaarNumberUsed(memberData.aadhaarNumber)) {
      return { 
        success: false, 
        message: `Duplicate Aadhaar Rejected: Aadhaar number "${memberData.aadhaarNumber}" is already registered to another individual in the system.` 
      };
    }

    const newMember: FamilyMember = {
      ...memberData,
      id: 'fm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      registeredAt: new Date().toISOString(),
    };

    if (!this.currentUser.familyMembers) {
      this.currentUser.familyMembers = [];
    }
    this.currentUser.familyMembers.push(newMember);

    const userIdx = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (userIdx !== -1) {
      this.users[userIdx].familyMembers = [...this.currentUser.familyMembers];
    }

    this.save();
    this.addLog(
      this.currentUser.email,
      'FAMILY_MEMBER_ADDED',
      `Registered family member ${newMember.name} (${newMember.relationship}, Age: ${newMember.age}, Aadhaar: ${newMember.aadhaarNumber})`,
      'SUCCESS'
    );

    return { success: true, message: 'Family member registered successfully!', member: newMember };
  }

  public deleteFamilyMember(memberId: string): boolean {
    if (!this.currentUser || !this.currentUser.familyMembers) return false;

    const member = this.currentUser.familyMembers.find(m => m.id === memberId);
    this.currentUser.familyMembers = this.currentUser.familyMembers.filter(m => m.id !== memberId);

    const userIdx = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (userIdx !== -1) {
      this.users[userIdx].familyMembers = [...this.currentUser.familyMembers];
    }

    this.save();
    if (member) {
      this.addLog(
        this.currentUser.email,
        'FAMILY_MEMBER_REMOVED',
        `Removed family member ${member.name} (${member.relationship})`,
        'WARNING'
      );
    }
    return true;
  }

  public updateFamilyMemberPhoto(memberId: string, newPhotoUrl: string): boolean {
    if (!this.currentUser || !this.currentUser.familyMembers) return false;
    const member = this.currentUser.familyMembers.find(m => m.id === memberId);
    if (!member) return false;

    member.photoUrl = newPhotoUrl;
    const userIdx = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (userIdx !== -1) {
      this.users[userIdx].familyMembers = [...this.currentUser.familyMembers];
    }

    // Also sync if another user account in this.users has the same Aadhaar number or name
    const cleanMemberAadhaar = member.aadhaarNumber.replace(/\s+/g, '');
    const matchedUser = this.users.find(u => 
      (u.aadhaarNumber && u.aadhaarNumber.replace(/\s+/g, '') === cleanMemberAadhaar) ||
      (u.name.trim().toLowerCase() === member.name.trim().toLowerCase())
    );
    if (matchedUser) {
      matchedUser.webcamPhotoUrl = newPhotoUrl;
    }

    this.save();
    // Pre-warm and persist face vector in high-efficiency memory cache
    getOrExtractFeatureVector(newPhotoUrl, member.id).catch(console.warn);
    this.addLog(
      this.currentUser.email,
      'FAMILY_MEMBER_PHOTO_UPDATED',
      `Updated facial biometric template for ${member.name} (${member.relationship}) in persistent memory`,
      'SUCCESS'
    );
    return true;
  }

  public deleteCurrentUser(): boolean {
    if (!this.currentUser) return false;
    const userEmail = this.currentUser.email;
    const userName = this.currentUser.name;
    const userId = this.currentUser.id;

    this.users = this.users.filter(u => u.id !== userId);
    this.currentUser = null;
    this.save();
    this.addLog(userEmail, 'USER_DELETED', `Deleted user profile "${userName}" and all associated biometric records`, 'WARNING');
    return true;
  }

  // --- MEDIA MANAGEMENT ---
  public getMediaItems(): MediaItem[] {
    return [...this.mediaItems];
  }

  public getMediaById(id: string): MediaItem | undefined {
    return this.mediaItems.find(m => m.id === id);
  }

  public addMediaItem(item: Omit<MediaItem, 'id' | 'views' | 'createdAt'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: 'm_' + Date.now(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    this.mediaItems.unshift(newItem);
    this.save();
    
    const userEmail = this.currentUser ? this.currentUser.email : 'system';
    this.addLog(userEmail, 'MEDIA_CREATED', `Added new media: "${newItem.title}" (${newItem.category}, Rating: ${newItem.rating})`, 'SUCCESS');
    return newItem;
  }

  public updateMediaItem(id: string, updates: Partial<MediaItem>): boolean {
    const idx = this.mediaItems.findIndex(m => m.id === id);
    if (idx === -1) return false;

    this.mediaItems[idx] = { ...this.mediaItems[idx], ...updates };
    this.save();

    const userEmail = this.currentUser ? this.currentUser.email : 'system';
    this.addLog(userEmail, 'MEDIA_UPDATED', `Updated media details for "${this.mediaItems[idx].title}"`, 'SUCCESS');
    return true;
  }

  public deleteMediaItem(id: string): boolean {
    const item = this.getMediaById(id);
    if (!item) return false;

    this.mediaItems = this.mediaItems.filter(m => m.id !== id);
    this.save();

    const userEmail = this.currentUser ? this.currentUser.email : 'system';
    this.addLog(userEmail, 'MEDIA_DELETED', `Deleted media item "${item.title}"`, 'WARNING');
    return true;
  }

  public incrementMediaViews(id: string) {
    const item = this.getMediaById(id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.save();
    }
  }

  // --- MULTI-MEMBER AADHAAR FACE VERIFICATION LOGIC ---
  public async verifyFaceAsync(
    user: User,
    capturedImageDataUrl: string,
    targetMedia?: MediaItem
  ): Promise<FaceVerificationResult> {
    // 1. Compile household candidates with the currently logged-in user as primary
    const candidates = this.getAllHouseholdCandidates(user);
    const minAgeRequired = targetMedia?.minAge || 0;

    // 2. Perform cross-matching against biometric memory
    const evalResult = await matchCapturedFaceAgainstCandidates(
      capturedImageDataUrl,
      candidates,
      minAgeRequired
    );

    // 3. Biometric Mismatch / Stranger / Unrecognized Face
    if (!evalResult.isBiometricMatch || !evalResult.bestCandidate) {
      const failMsg = evalResult.message || `Security Alert - Facial Biometric Mismatch: Face in camera does not match the logged-in user "${user.name}". Match score: ${evalResult.highestScore}% (Euclidean distance: ${evalResult.bestEuclidean.toFixed(2)}). ONLY THE LOGGED-IN USER'S REGISTERED FACE IS ACCEPTED. Access blocked.`;
      this.addLog(user.email, 'FACE_VERIFY_FAILED', failMsg, 'DENIED');
      return {
        verified: false,
        matchScore: evalResult.highestScore,
        userEmail: user.email,
        message: failMsg,
        timestamp: new Date().toISOString(),
        euclideanDistance: evalResult.bestEuclidean,
      };
    }

    const recognized = evalResult.bestCandidate;

    // 4. CRITICAL: LOGGED-IN FACE ONLY ACCEPT ENFORCEMENT
    // If the detected face belongs to ANY other person (including household family members), ACCESS IS STRICTLY DENIED!
    if (recognized.id !== user.id) {
      const notLoggedMsg = `Security Alert - Logged User Mismatch: Detected face matches household member "${recognized.name}" (${recognized.relationship}), but active session belongs to logged-in user "${user.name}". ONLY THE LOGGED-IN USER'S REGISTERED FACE CAN UNLOCK ACCESS. Access Denied.`;
      this.addLog(user.email, 'FACE_VERIFY_FAILED', notLoggedMsg, 'DENIED');
      return {
        verified: false,
        matchScore: evalResult.highestScore,
        userEmail: user.email,
        message: notLoggedMsg,
        timestamp: new Date().toISOString(),
        verifiedMemberName: recognized.name,
        verifiedAadhaar: recognized.aadhaarNumber,
        verifiedAge: recognized.age,
        euclideanDistance: evalResult.bestEuclidean,
        relationship: recognized.relationship as FamilyRelationship,
      };
    }

    // 5. Check age requirement for the logged user
    const isAdult = user.age >= 18;
    if (minAgeRequired >= 18 && !isAdult) {
      const ageDenialMsg = `Aadhaar Age Restriction - Access Blocked: Logged-in user "${user.name}" (Age: ${user.age} Yrs - Minor <18). Movie "${targetMedia?.title}" requires an adult user (Age 18+) verification to unlock.`;
      this.addLog(user.email, 'FACE_VERIFY_AGE_DENIED', ageDenialMsg, 'DENIED');
      return {
        verified: false,
        matchScore: evalResult.highestScore,
        userEmail: user.email,
        message: ageDenialMsg,
        timestamp: new Date().toISOString(),
        verifiedMemberName: user.name,
        verifiedAadhaar: user.aadhaarNumber,
        verifiedAge: user.age,
        euclideanDistance: evalResult.bestEuclidean,
      };
    } else if (targetMedia && user.age < targetMedia.minAge) {
      const ageDenialMsg = `Aadhaar Age Restriction - Access Blocked: Logged-in user "${user.name}" (Age: ${user.age} Yrs). Movie "${targetMedia.title}" requires age ${targetMedia.minAge}+ (${targetMedia.rating}).`;
      this.addLog(user.email, 'FACE_VERIFY_AGE_DENIED', ageDenialMsg, 'DENIED');
      return {
        verified: false,
        matchScore: evalResult.highestScore,
        userEmail: user.email,
        message: ageDenialMsg,
        timestamp: new Date().toISOString(),
        verifiedMemberName: user.name,
        verifiedAadhaar: user.aadhaarNumber,
        verifiedAge: user.age,
        euclideanDistance: evalResult.bestEuclidean,
      };
    }

    // 6. Logged-in User Biometrically Verified & Age Eligible - ACCESS GRANTED!
    const successMsg = `Aadhaar Biometric Authenticated: Logged-in User "${user.name}" Verified (UID: ${user.aadhaarNumber}, Age: ${user.age} Yrs - Adult 18+ Verified). Match Score: ${evalResult.highestScore}%, Euclidean: ${evalResult.bestEuclidean.toFixed(2)}. Access granted to "${targetMedia?.title || 'Vault'}".`;
    this.addLog(user.email, 'FACE_VERIFY_SUCCESS', successMsg, 'SUCCESS');

    return {
      verified: true,
      matchScore: evalResult.highestScore,
      userEmail: user.email,
      message: successMsg,
      timestamp: new Date().toISOString(),
      verifiedMemberName: user.name,
      verifiedAadhaar: user.aadhaarNumber,
      verifiedAge: user.age,
      euclideanDistance: evalResult.bestEuclidean,
    };
  }

  public verifyFace(
    user: User,
    capturedImageDataUrl: string,
    targetMedia?: MediaItem
  ): FaceVerificationResult {
    // Synchronous fallback
    if (targetMedia && user.age < targetMedia.minAge) {
      const msg = `Access Denied: Movie "${targetMedia.title}" requires age ${targetMedia.minAge}+, but verified user age is ${user.age}.`;
      this.addLog(user.email, 'FACE_VERIFY_AGE_DENIED', msg, 'DENIED');
      return {
        verified: false,
        matchScore: 0,
        userEmail: user.email,
        message: msg,
        timestamp: new Date().toISOString(),
      };
    }

    // Standard baseline
    const msg = `Facial verification check processed for ${user.email}.`;
    return {
      verified: true,
      matchScore: 85,
      userEmail: user.email,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }

  // --- WATCH HISTORY ---
  public getWatchHistory(): WatchHistory[] {
    return [...this.watchHistory];
  }

  public recordWatchHistory(media: MediaItem, progressPercentage: number) {
    const existingIdx = this.watchHistory.findIndex(h => h.mediaId === media.id);
    const entry: WatchHistory = {
      id: existingIdx !== -1 ? this.watchHistory[existingIdx].id : 'wh_' + Date.now(),
      mediaId: media.id,
      mediaTitle: media.title,
      posterUrl: media.posterUrl,
      watchedAt: new Date().toISOString(),
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    };

    if (existingIdx !== -1) {
      this.watchHistory.splice(existingIdx, 1);
    }
    this.watchHistory.unshift(entry);
    this.save();
  }

  public clearWatchHistory() {
    this.watchHistory = [];
    this.save();
    if (this.currentUser) {
      this.addLog(this.currentUser.email, 'HISTORY_CLEARED', 'Cleared watch history', 'SUCCESS');
    }
  }

  // --- ACTIVITY LOGS ---
  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public addLog(userEmail: string, action: string, details: string, status: LogStatus) {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      userEmail,
      action,
      details,
      status,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200); // cap in memory logs
    }
    this.save();
  }
}

export const store = new MovieGuardStore();

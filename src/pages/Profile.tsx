import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Camera, History, ShieldCheck, Clock, 
  Trash2, Play, Calendar, Mail, Award, Lock, Edit3, Check, X, Upload, Sparkles,
  Users, Shield, AlertTriangle
} from 'lucide-react';
import { User, WatchHistory, AppRoute } from '../types';
import { store } from '../services/store';
import { WebcamCapture } from '../components/WebcamCapture';
import { FamilyManager } from '../components/FamilyManager';
import { formatAadhaarNumber } from '../services/aadhaarUtils';
import { UnifiedFaceModal } from '../components/UnifiedFaceModal';

interface ProfileProps {
  currentUser: User | null;
  watchHistory: WatchHistory[];
  onNavigate: (route: AppRoute, params?: any) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  currentUser,
  watchHistory,
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'family'>('profile');
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceTargetId, setFaceTargetId] = useState<string>(currentUser?.id || '');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>Please log in to view your account profile.</p>
        <button onClick={() => onNavigate('login')} className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer">
          Go to Login
        </button>
      </div>
    );
  }

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    store.updateUserProfile({ name: nameInput.trim() });
    setIsEditingName(false);
    showNotice('Account name updated successfully!');
  };

  const handleUpdatePhoto = (newPhotoUrl: string) => {
    store.updateUserPhoto(newPhotoUrl);
    setShowFaceModal(false);
    showNotice('Biometric face snapshot saved successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          store.updateUserPhoto(result);
          showNotice('New facial profile photo saved successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleClearHistory = () => {
    store.clearWatchHistory();
    showNotice('Watch history cleared.');
  };

  const handleUpdateUser = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Settings &amp; Biometric Photo</span>
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'family'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Household Registry ({currentUser.familyMembers?.length || 0} Members)</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 font-mono flex items-center gap-2 shadow-lg animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Profile & History */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Avatar with Camera & Upload Triggers */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative group">
                  <img
                    src={currentUser.webcamPhotoUrl}
                    alt={currentUser.name}
                    className="w-32 h-32 rounded-3xl object-cover border-2 border-red-500/80 shadow-2xl bg-zinc-950"
                  />
                  <div className="absolute inset-0 bg-black/65 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-semibold gap-1.5 p-2">
                    <button
                      onClick={() => {
                        setFaceTargetId(currentUser.id);
                        setShowFaceModal(true);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-1.5 w-full justify-center cursor-pointer shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Add / Update Face
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFaceTargetId(currentUser.id);
                      setShowFaceModal(true);
                    }}
                    className="text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-red-400" />
                    Add / Update Face
                  </button>
                </div>
              </div>

              {/* User Details & Editable Name */}
              <div className="space-y-4 text-center sm:text-left flex-1">
                <div className="space-y-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-950 border border-red-500 rounded-xl text-white font-bold text-lg outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
                        title="Save Name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setNameInput(currentUser.name);
                          setIsEditingName(false);
                        }}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name}</h1>
                      <button
                        onClick={() => {
                          setNameInput(currentUser.name);
                          setIsEditingName(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Name"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                        currentUser.role === 'ADMIN' ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 font-mono">
                    Aadhaar UID: <span className="text-amber-400 font-bold">{currentUser.aadhaarNumber || '5482 9104 2319'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-zinc-300">
                  <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>

                  <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Aadhaar Age: <strong className="text-white">{currentUser.age} yrs</strong></span>
                  </div>

                  <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>DOB: {currentUser.dob || '2004-05-14'}</span>
                  </div>

                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Aadhaar Facial Lock (Active)</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      setFaceTargetId(currentUser.id);
                      setShowFaceModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/40 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Add / Update Face</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('family')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Household Registry ({currentUser.familyMembers?.length || 0})
                  </button>

                  <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="px-4 py-2 bg-zinc-800/80 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-xl border border-zinc-700 hover:border-red-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete Profile & Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Profile
                  </button>

                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-zinc-800 hover:bg-red-950/50 text-zinc-300 hover:text-red-400 text-xs font-semibold rounded-xl border border-zinc-700 hover:border-red-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Watch History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-red-500" />
                Recently Watched Library
              </h2>

              {watchHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-zinc-400 hover:text-red-400 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {watchHistory.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                No watch history recorded yet. Stream titles from the library to populate history.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {watchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3 group hover:border-zinc-700"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.mediaTitle}
                      className="w-16 h-20 object-cover rounded-xl bg-zinc-950 shrink-0"
                    />

                    <div className="flex-1 space-y-1.5">
                      <h3 className="font-bold text-xs text-white line-clamp-1">{item.mediaTitle}</h3>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Watched: {new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${item.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('verifyface', { movieId: item.mediaId })}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow cursor-pointer"
                      title="Resume Stream"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Household Family Members Registry */}
      {activeTab === 'family' && (
        <FamilyManager
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={onLogout}
        />
      )}

      {/* Unified Biometric Face Registry Modal (Single Hub for Household Faces) */}
      <UnifiedFaceModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        currentUser={currentUser}
        initialTargetId={faceTargetId}
        onSaved={(personName) => {
          showNotice(`Biometric face template saved for ${personName}!`);
          setRefreshKey((k) => k + 1);
        }}
      />

      {/* Delete Profile Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Delete Profile & Account
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Permanent profile erasure
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-2 text-xs">
              <p className="text-red-300 font-medium leading-relaxed">
                Are you sure you want to permanently delete your user profile (<strong className="text-white">{currentUser.name}</strong>)? 
                All associated biometric face templates, Aadhaar linking, watch history, and registered household members will be permanently erased.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  store.deleteCurrentUser();
                  setShowDeleteAccountModal(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};


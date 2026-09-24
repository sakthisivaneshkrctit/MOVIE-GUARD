import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowLeft, RefreshCw, Lock, UserX, UserCheck } from 'lucide-react';
import { AppRoute, MediaItem, User } from '../types';

interface AccessDeniedProps {
  reason?: string; // 'age' | 'facemismatch' | 'unauthorized' | 'noface'
  customMessage?: string;
  movieId?: string;
  mediaItems: MediaItem[];
  currentUser: User | null;
  onNavigate: (route: AppRoute, params?: any) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason = 'facemismatch',
  customMessage,
  movieId,
  mediaItems,
  currentUser,
  onNavigate,
}) => {
  const targetMedia = movieId ? mediaItems.find(m => m.id === movieId) : null;

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6 pb-16">
      
      <div className="bg-zinc-900 border-2 border-red-600/60 rounded-3xl p-8 space-y-6 text-center shadow-2xl shadow-red-950/50 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border-2 border-red-500/50 flex items-center justify-center mx-auto shadow-xl">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Access Denied
          </h1>
          <p className="text-xs font-mono text-red-400 font-bold uppercase tracking-widest">
            Security & Policy Violation Triggered
          </p>
        </div>

        {/* Dynamic Explanation Box */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-red-500/30 text-xs font-sans text-left space-y-3">
          
          {reason === 'age' && (
            <>
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Underage Policy Restriction (18+ Required)
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {customMessage || (
                  <>
                    The requested media title <strong className="text-white">{targetMedia?.title || 'Selected Title'}</strong> is classified under rating <strong className="text-amber-400">{targetMedia?.rating || 'A'}</strong> requiring minimum user age <strong className="text-white">{targetMedia?.minAge}+</strong>.
                  </>
                )}
              </p>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300">
                <strong>Logged Face Policy:</strong> Only the registered 18+ face of the logged-in account owner (<strong className="text-white">{currentUser?.name || 'Account Owner'}</strong>) can unlock this title. Minors and other unregistered faces are strictly blocked.
              </div>
              {currentUser && (
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-400">
                  User Account Email: <span className="text-white">{currentUser.email}</span><br />
                  Household Head: <span className="text-emerald-400 font-bold">{currentUser.name} (Age: {currentUser.age})</span>
                </div>
              )}
            </>
          )}

          {reason === 'facemismatch' && (
            <>
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <UserX className="w-4 h-4 shrink-0" />
                Facial Biometric Match Failure
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {customMessage || "The captured webcam facial frame did not meet the required confidence threshold against the registered account profile. To prevent unauthorized library access, playback is blocked."}
              </p>
            </>
          )}

          {reason === 'noface' && (
            <>
              <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                No Human Face Detected
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {customMessage || "No valid human face was detected in the camera stream. Please ensure your face is well-lit and centered in front of the webcam."}
              </p>
            </>
          )}

          {reason === 'unauthorized' && (
            <>
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <Lock className="w-4 h-4 shrink-0" />
                Unauthorized Role Access
              </div>
              <p className="text-zinc-300 leading-relaxed">
                You do not possess Administrator permissions to view or edit system management tools.
              </p>
            </>
          )}

        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {movieId && (reason === 'facemismatch' || reason === 'noface') && (
            <button
              onClick={() => onNavigate('verifyface', { movieId })}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Facial Biometric Scan
            </button>
          )}

          <button
            onClick={() => onNavigate('movies')}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Media Library
          </button>
        </div>

      </div>

    </div>
  );
};

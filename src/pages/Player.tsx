import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Film, Lock, AlertTriangle } from 'lucide-react';
import { MediaItem, User, AppRoute } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { store } from '../services/store';

interface PlayerProps {
  media: MediaItem | null;
  currentUser: User | null;
  isFaceVerified: boolean;
  onNavigate: (route: AppRoute, params?: any) => void;
}

export const Player: React.FC<PlayerProps> = ({
  media,
  currentUser,
  isFaceVerified,
  onNavigate,
}) => {

  useEffect(() => {
    if (media && currentUser) {
      store.incrementMediaViews(media.id);
    }
  }, [media, currentUser]);

  if (!media || !currentUser) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>Media or session state uninitialized.</p>
        <button onClick={() => onNavigate('movies')} className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
          Return to Library
        </button>
      </div>
    );
  }

  const requiresFaceVerify = media.rating === 'A' || media.minAge >= 18;

  // Safety fallback if unverified for A-certified titles
  if (requiresFaceVerify && !isFaceVerified) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-zinc-900 border border-red-500/40 rounded-3xl text-center space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Biometric Verification Required</h2>
        <p className="text-xs text-zinc-400">
          Streaming session for the A-certified title "{media.title}" requires mandatory facial biometric authentication.
        </p>
        <button
          onClick={() => onNavigate('verifyface', { movieId: media.id })}
          className="px-6 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg"
        >
          Verify Face Now
        </button>
      </div>
    );
  }

  const handleProgressUpdate = (percent: number) => {
    if (media) {
      store.recordWatchHistory(media, percent);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('movie-details', { movieId: media.id })}
          className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </button>

        {requiresFaceVerify ? (
          <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/30 text-red-400 px-3 py-1 rounded-full font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Biometric Face Guard Verified (18+)
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Direct Stream Active ({media.rating} Content)
          </div>
        )}
      </div>

      {/* Video Player Component */}
      <VideoPlayer media={media} user={currentUser} onProgressUpdate={handleProgressUpdate} />

      {/* Video Description & Security Info Footer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-white">{media.title}</h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Category: {media.category} • Rating: {media.rating} • Duration: {media.duration}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-zinc-400">
            <div>Authorized Viewer: <span className="text-white font-bold">{currentUser.name}</span></div>
            <div className="text-zinc-500 text-[10px]">{currentUser.email}</div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {media.description}
        </p>
      </div>

    </div>
  );
};

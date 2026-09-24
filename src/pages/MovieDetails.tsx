import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Play, Clock, Film, AlertOctagon, 
  ArrowLeft, Lock, Calendar, Eye, User as UserIcon 
} from 'lucide-react';
import { MediaItem, User, AppRoute } from '../types';

interface MovieDetailsProps {
  media: MediaItem | null;
  currentUser: User | null;
  onNavigate: (route: AppRoute, params?: any) => void;
}

export const MovieDetails: React.FC<MovieDetailsProps> = ({ media, currentUser, onNavigate }) => {
  if (!media) {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-4">
        <p>Media item not found.</p>
        <button
          onClick={() => onNavigate('movies')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isUnderage = currentUser ? currentUser.age < media.minAge : false;
  const requiresFaceVerify = media.rating === 'A' || media.minAge >= 18;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('movies')}
        className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Media Vault
      </button>

      {/* Main Details Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Left Poster Column */}
        <div className="md:col-span-5 relative bg-zinc-950 aspect-[3/4] md:aspect-auto">
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:hidden" />
          
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold ${
              media.rating === 'A'
                ? 'bg-red-950/90 border-red-500/50 text-red-400'
                : 'bg-zinc-950/90 border-zinc-800 text-amber-400'
            }`}>
              Rating: {media.rating} {media.rating === 'A' ? '(Adult 18+)' : ''}
            </span>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                {media.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {media.duration}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                {media.views} Views
              </span>
              {requiresFaceVerify ? (
                <span className="px-2.5 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  Face Recognition Required
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  Direct Play (No Face Scan)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {media.title}
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {media.description}
            </p>
          </div>

          {/* Age Policy Check Alert Box */}
          <div className={`p-4 rounded-2xl border text-xs font-sans space-y-2 ${
            isUnderage 
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : requiresFaceVerify
              ? 'bg-red-950/20 border-red-500/30 text-zinc-300'
              : 'bg-emerald-950/20 border-emerald-500/30 text-zinc-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {isUnderage ? (
                <>
                  <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-red-400">Age Restriction Policy Block</span>
                </>
              ) : requiresFaceVerify ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-amber-400">A-Certified (18+) Biometric Gate Active</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">{media.rating} Certified — Direct Streaming Enabled</span>
                </>
              )}
            </div>

            <p className="text-zinc-400 leading-normal">
              {requiresFaceVerify ? (
                <>
                  This is an <strong className="text-red-400">A-Certified (Adult 18+)</strong> title requiring user age <strong>18+</strong> and mandatory facial biometric verification before streaming.
                </>
              ) : (
                <>
                  This is a <strong className="text-emerald-400">{media.rating}-Certified</strong> title (Age {media.minAge}+). <strong className="text-white">No facial recognition required</strong> — you can start watching immediately.
                </>
              )}
              {currentUser && (
                <> Current account registered age: <strong className="text-white">{currentUser.age}</strong>.</>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {isUnderage ? (
              <button
                disabled
                className="w-full py-3.5 bg-zinc-800 text-zinc-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-zinc-700/50"
              >
                <Lock className="w-4 h-4 text-red-500" />
                Stream Blocked (Age {currentUser?.age} &lt; {media.minAge}+)
              </button>
            ) : (
              <button
                onClick={() => onNavigate('verifyface', { movieId: media.id })}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
                Watch Movie (Biometric Face Verification)
              </button>
            )}

            <p className="text-[11px] text-zinc-500 text-center font-mono">
              Biometric face recognition required to stream movie media.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

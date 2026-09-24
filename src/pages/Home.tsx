import React from 'react';
import { Play, Shield, ShieldCheck, Film, Sparkles, Lock, ArrowRight, Activity, Users, Clock } from 'lucide-react';
import { MediaItem, User, AppRoute } from '../types';

interface HomeProps {
  mediaItems: MediaItem[];
  currentUser: User | null;
  onNavigate: (route: AppRoute, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ mediaItems, currentUser, onNavigate }) => {
  const featured = mediaItems[0] || null;
  const recentMedia = mediaItems.slice(1, 5);

  const categories = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Drama', 'Animation', 'Documentary'];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner Section */}
      {featured && (
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl group">
          
          {/* Background Poster Backdrop with Dark Gradient */}
          <div className="absolute inset-0">
            <img
              src={featured.posterUrl}
              alt={featured.title}
              className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-12 max-w-3xl space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                FEATURED MEDIA VAULT
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 text-zinc-300 text-xs font-mono border border-zinc-800">
                Rating: {featured.rating}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 text-zinc-300 text-xs font-mono border border-zinc-800">
                {featured.duration}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {featured.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed">
              {featured.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('verifyface', { movieId: featured.id })}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-900/40 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch Movie (Face Verification)
              </button>

              <button
                onClick={() => onNavigate('movie-details', { movieId: featured.id })}
                className="px-5 py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Film className="w-4 h-4 text-zinc-400" />
                View Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Security Feature Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Biometric Face Guard</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live webcam frame extraction guarantees only authorized verified profile owners can play restricted media.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Age Policy Protection</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatic rating checks enforce Universal (U), Universal Adult (U/A 13+), and Adult (A 18+) limits.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Spring Boot In-Memory Store</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Thread-safe Java backend tracking active user sessions, audit security logs, and media streaming tokens.
            </p>
          </div>
        </div>

      </div>

      {/* Categories Navigation Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            Media Library Overview
          </h2>
          <button
            onClick={() => onNavigate('movies')}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            Explore Full Vault
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Media Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('verifyface', { movieId: item.id })}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                
                <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md backdrop-blur border text-xs font-mono font-bold ${
                  item.rating === 'A'
                    ? 'bg-red-950/90 border-red-500/50 text-red-400'
                    : 'bg-zinc-950/90 border-zinc-700/50 text-amber-400'
                }`}>
                  {item.rating} • Face Verify
                </span>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {item.duration}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/30 text-red-400">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>{item.views} views</span>
                  <span className="text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                    Verify Face &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

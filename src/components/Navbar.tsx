import React from 'react';
import { Shield, Film, Lock, User as UserIcon, LogOut, Code2, Search, SlidersHorizontal, Eye, HardDrive } from 'lucide-react';
import { User, AppRoute } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, params?: any) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider text-white font-mono flex items-center gap-1">
              MOVIE<span className="text-red-500">GUARD</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              Secure Media Vault
            </span>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="hidden md:flex flex-1 max-w-md relative mx-4">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentRoute !== 'movies' && currentRoute !== 'home') {
                onNavigate('movies');
              }
            }}
            placeholder="Search titles, genres, ratings..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => onNavigate('movies')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'movies' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={() => onNavigate('drive')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'drive' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentRoute === 'admin' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Lock className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Java Code Inspector Drawer Toggle */}
          <button
            onClick={() => onNavigate('java-code')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border ${
              currentRoute === 'java-code'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-zinc-900 text-amber-400/90 border-amber-500/30 hover:bg-zinc-800'
            }`}
            title="Inspect Java 17 / Spring Boot Source Code"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Java Source</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 group p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <div className="relative">
                  <img
                    src={currentUser.webcamPhotoUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-red-500/50 group-hover:border-red-400"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" title="Biometric Session Verified" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-200 line-clamp-1">{currentUser.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Age: {currentUser.age}</span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs sm:text-sm text-zinc-300 hover:text-white font-medium"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-red-900/20 transition-colors"
              >
                Register
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

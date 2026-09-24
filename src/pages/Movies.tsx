import React, { useState } from 'react';
import { Film, Search, Filter, ShieldAlert, Sparkles, Clock, Play, Plus } from 'lucide-react';
import { MediaItem, AppRoute, User } from '../types';

interface MoviesProps {
  mediaItems: MediaItem[];
  currentUser: User | null;
  onNavigate: (route: AppRoute, params?: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Movies: React.FC<MoviesProps> = ({
  mediaItems,
  currentUser,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');

  const categories = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Drama', 'Animation', 'Documentary'];
  const ratings = ['All', 'U', 'U/A', 'A'];

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesRating =
      selectedRating === 'All' || item.rating.toUpperCase() === selectedRating.toUpperCase();

    return matchesSearch && matchesCategory && matchesRating;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-red-500" />
            Media Vault Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse encrypted media titles with active age policy and biometric identity verification.
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/30"
          >
            <Plus className="w-4 h-4" />
            Add Media Item
          </button>
        )}
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, description..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Category & Rating Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            Category:
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <span className="text-xs text-zinc-400 font-mono">Rating:</span>
            {ratings.map((rat) => (
              <button
                key={rat}
                onClick={() => setSelectedRating(rat)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  selectedRating === rat
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {rat}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 space-y-3">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No media items found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query or category filters to locate media files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('verifyface', { movieId: item.id })}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg backdrop-blur border text-xs font-mono font-bold ${
                    item.rating === 'A'
                      ? 'bg-red-950/90 border-red-500/50 text-red-400'
                      : 'bg-zinc-950/90 border-zinc-700/50 text-amber-400'
                  }`}>
                    {item.rating} • Face Scan
                  </span>
                </div>

                {/* Quick Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {item.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 text-red-400 font-semibold">
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

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Age {item.minAge}+</span>
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    Verify Face &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

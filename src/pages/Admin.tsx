import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Film, Users, Activity, Plus, Trash2, 
  Upload, Search, CheckCircle2, AlertTriangle, FileVideo 
} from 'lucide-react';
import { MediaItem, User, ActivityLog, AppRoute } from '../types';
import { store } from '../services/store';

interface AdminProps {
  currentUser: User | null;
  mediaItems: MediaItem[];
  users: User[];
  logs: ActivityLog[];
  onNavigate: (route: AppRoute, params?: any) => void;
  onRefreshData: () => void;
}

export const Admin: React.FC<AdminProps> = ({
  currentUser,
  mediaItems,
  users,
  logs,
  onNavigate,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'users' | 'logs'>('media');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add media form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MediaItem['category']>('Action');
  const [posterUrl, setPosterUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('1h 45m');
  const [rating, setRating] = useState<'U' | 'U/A' | 'A'>('U/A');
  const [minAge, setMinAge] = useState(13);
  const [localVideoName, setLocalVideoName] = useState<string | null>(null);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <p>Administrator privileges required to access this panel.</p>
        <button
          onClick={() => onNavigate('movies')}
          className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalVideoName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    store.addMediaItem({
      title,
      description,
      category,
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration,
      rating,
      minAge: rating === 'A' ? 18 : rating === 'U/A' ? 13 : 0,
      isUserUploaded: true,
      uploadedBy: currentUser.email,
    });

    setShowAddModal(false);
    onRefreshData();
    // reset form
    setTitle('');
    setDescription('');
    setPosterUrl('');
    setVideoUrl('');
    setLocalVideoName(null);
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Are you sure you want to remove this media item?')) {
      store.deleteMediaItem(id);
      onRefreshData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-500" />
            Security Administration Portal
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Manage media library items, inspect registered user biometric accounts, and view live audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-950/40"
        >
          <Plus className="w-4 h-4" />
          Add Media Title
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'media'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          Media Management ({mediaItems.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          InMemory Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Media Management Table */}
      {activeTab === 'media' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-sans">
              <thead className="bg-zinc-950 text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-4">Poster</th>
                  <th className="p-4">Title & Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating / Age</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {mediaItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50">
                    <td className="p-4">
                      <img src={item.posterUrl} alt={item.title} className="w-12 h-16 object-cover rounded-lg bg-zinc-950" />
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-zinc-400 line-clamp-1 text-[11px] mt-0.5">{item.description}</div>
                    </td>
                    <td className="p-4 font-mono">{item.category}</td>
                    <td className="p-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 font-bold border border-amber-500/30">
                        {item.rating} ({item.minAge}+)
                      </span>
                    </td>
                    <td className="p-4 font-mono">{item.views}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg"
                        title="Delete Media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management Table */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-sans">
              <thead className="bg-zinc-950 text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-4">Facial Scan Photo</th>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Age</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/50">
                    <td className="p-4">
                      <img src={u.webcamPhotoUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-red-500/50" />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-zinc-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-4 font-mono">{u.age} years</td>
                    <td className="p-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-600/30 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {new Date(u.registeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Activity Logs */}
      {activeTab === 'logs' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
          <div className="text-zinc-400 text-[11px] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            InMemory Security Audit Log Entries
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      log.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                      'bg-red-950 text-red-400 border border-red-500/30'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-white font-semibold">{log.userEmail}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">{log.details}</div>
                </div>

                <div className="text-zinc-500 text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              Add New Media Title
            </h3>

            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inception Matrix"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Description / Synopsis</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Drama">Drama</option>
                    <option value="Animation">Animation</option>
                    <option value="Documentary">Documentary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Age Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="U">U (Universal - 0+)</option>
                    <option value="U/A">U/A (13+)</option>
                    <option value="A">A (Adult - 18+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Poster Image URL</label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Video Source (URL or File Upload)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 mb-2"
                />

                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="admin-video-file"
                  />
                  <label
                    htmlFor="admin-video-file"
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer font-mono text-xs"
                  >
                    <Upload className="w-4 h-4 text-red-400" />
                    {localVideoName ? `Attached: ${localVideoName}` : 'Or Upload Local Video File'}
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Save Media Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

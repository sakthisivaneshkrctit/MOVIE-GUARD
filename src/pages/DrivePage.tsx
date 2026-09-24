import React, { useState, useEffect } from 'react';
import {
  HardDrive, Upload, FolderPlus, Trash2, ExternalLink, Download, 
  Search, RefreshCw, AlertTriangle, ShieldCheck, FileVideo, Folder,
  FileText, Plus, CheckCircle2, Loader2, Lock, ArrowLeft, Cloud,
  Database, Shield, Sparkles, UserCheck, X, Eye
} from 'lucide-react';
import { User, MediaItem, ActivityLog, AppRoute, AgeRating } from '../types';
import { store } from '../services/store';
import {
  googleSignIn,
  initAuth,
  getAccessToken,
  logoutGoogle,
  setCachedAccessToken
} from '../services/googleAuth';
import {
  listDriveFiles,
  uploadFileToDrive,
  createDriveFolder,
  deleteDriveFile,
  exportLogsToDrive,
  exportCatalogToDrive,
  getDriveAbout,
  DriveFile,
  DriveAboutInfo
} from '../services/driveService';

interface DrivePageProps {
  currentUser: User | null;
  mediaItems: MediaItem[];
  logs: ActivityLog[];
  onNavigate: (route: AppRoute, params?: any) => void;
  onRefreshData: () => void;
}

export const DrivePage: React.FC<DrivePageProps> = ({
  currentUser,
  mediaItems,
  logs,
  onNavigate,
  onRefreshData,
}) => {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [aboutInfo, setAboutInfo] = useState<DriveAboutInfo | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<{ id?: string; name: string }[]>([
    { name: 'My Drive' },
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'folder' | 'document'>('all');

  // Modal states
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileToUpload, setSelectedFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mandatory Delete Confirmation Modal
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import Drive Video to MovieGuard Vault Modal
  const [importDriveFile, setImportDriveFile] = useState<DriveFile | null>(null);
  const [importTitle, setImportTitle] = useState('');
  const [importDescription, setImportDescription] = useState('');
  const [importCategory, setImportCategory] = useState<'Action' | 'Sci-Fi' | 'Thriller' | 'Drama' | 'Animation' | 'Documentary'>('Action');
  const [importRating, setImportRating] = useState<AgeRating>('U/A');
  const [importMinAge, setImportMinAge] = useState(13);
  const [importPosterUrl, setImportPosterUrl] = useState('');

  // Status banners
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadDriveData(accessToken, currentFolderId);
    }
  }, [accessToken, currentFolderId, activeFilter]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGoogleConnect = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        showToast('success', 'Successfully connected to Google Drive!');
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Failed to sign in with Google Drive.');
      showToast('error', 'Google Drive sign in failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    setFiles([]);
    setAboutInfo(null);
    showToast('success', 'Disconnected from Google Drive.');
  };

  const loadDriveData = async (token: string, folderId?: string) => {
    setIsLoadingFiles(true);
    try {
      const [aboutData, fileList] = await Promise.all([
        getDriveAbout(token),
        listDriveFiles(token, {
          folderId,
          searchQuery,
          mimeTypeFilter: activeFilter,
        }),
      ]);

      if (aboutData) setAboutInfo(aboutData);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Error loading Drive content:', err);
      showToast('error', 'Failed to fetch files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadDriveData(accessToken, currentFolderId);
    }
  };

  const handleOpenFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const newFolder = await createDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      showToast('success', `Folder "${newFolder.name}" created successfully!`);
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedFileToUpload) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadFileToDrive(accessToken, selectedFileToUpload, currentFolderId);
      showToast('success', `File "${uploaded.name}" uploaded to Google Drive!`);
      setSelectedFileToUpload(null);
      setShowUploadModal(false);
      loadDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      showToast('error', err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!accessToken || !fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showToast('success', `Deleted "${fileToDelete.name}" from Google Drive.`);
      if (currentUser) {
        store.addLog(currentUser.email, 'DRIVE_FILE_DELETED', `Deleted Drive File: ${fileToDelete.name} (${fileToDelete.id})`, 'WARNING');
      }
      setFileToDelete(null);
      loadDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportLogs = async () => {
    if (!accessToken) return;
    try {
      const exported = await exportLogsToDrive(accessToken, logs, currentFolderId);
      showToast('success', `Exported ${logs.length} audit logs to Google Drive as "${exported.name}"`);
      if (currentUser) {
        store.addLog(currentUser.email, 'EXPORT_AUDIT_LOGS_DRIVE', `Exported security logs to Google Drive`, 'SUCCESS');
      }
      loadDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      showToast('error', 'Failed to export logs to Drive.');
    }
  };

  const handleBackupCatalog = async () => {
    if (!accessToken) return;
    try {
      const exported = await exportCatalogToDrive(accessToken, mediaItems, currentFolderId);
      showToast('success', `Backed up ${mediaItems.length} media items to Google Drive as "${exported.name}"`);
      if (currentUser) {
        store.addLog(currentUser.email, 'BACKUP_CATALOG_DRIVE', `Backed up media catalog to Google Drive`, 'SUCCESS');
      }
      loadDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      showToast('error', 'Failed to backup catalog.');
    }
  };

  const openImportModal = (file: DriveFile) => {
    setImportDriveFile(file);
    setImportTitle(file.name.replace(/\.[^/.]+$/, ''));
    setImportDescription(`Imported from Google Drive file: ${file.name}`);
    setImportPosterUrl(file.thumbnailLink || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80');
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importDriveFile || !currentUser) return;

    // Direct stream link or Google web view fallback
    const directVideoUrl = importDriveFile.webContentLink || importDriveFile.webViewLink || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    const newItem: MediaItem = {
      id: `drive-${Date.now()}`,
      title: importTitle || importDriveFile.name,
      description: importDescription,
      category: importCategory,
      posterUrl: importPosterUrl,
      videoUrl: directVideoUrl,
      duration: 'Imported Media',
      rating: importRating,
      minAge: importMinAge,
      isUserUploaded: true,
      uploadedBy: currentUser.email,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    store.addMediaItem(newItem);
    store.addLog(currentUser.email, 'IMPORT_DRIVE_MEDIA', `Imported movie "${newItem.title}" from Google Drive`, 'SUCCESS');
    showToast('success', `"${newItem.title}" added to MovieGuard Media Vault!`);
    onRefreshData();
    setImportDriveFile(null);
  };

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-red-950/90 text-red-300 border-red-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium font-mono">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Title & Status */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wider uppercase">
              <Cloud className="w-3.5 h-3.5" />
              Google Workspace Cloud Integration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              Google Drive Media Vault
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Connect your official Google Drive account to import movie files, back up security audit logs, and manage cloud media directly with biometric protection.
            </p>
          </div>

          {/* Connection Auth Controller */}
          {accessToken && googleUser ? (
            <div className="bg-zinc-950/80 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-lg shrink-0">
              <img
                src={googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                alt={googleUser.displayName || 'Google User'}
                className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{googleUser.displayName || 'Google User'}</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-zinc-400 font-mono line-clamp-1">{googleUser.email}</span>
                <button
                  onClick={handleGoogleDisconnect}
                  className="mt-1 text-[10px] text-red-400 hover:text-red-300 font-mono underline text-left"
                >
                  Disconnect Drive
                </button>
              </div>
            </div>
          ) : (
            <div className="shrink-0 space-y-2">
              <button
                disabled={isAuthenticating}
                onClick={handleGoogleConnect}
                className="gsi-material-button w-full sm:w-auto px-5 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer border border-zinc-200"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span className="text-xs sm:text-sm font-extrabold font-mono">Sign in with Google Drive</span>
              </button>

              {authError && <p className="text-[11px] text-red-400 font-mono text-center">{authError}</p>}
            </div>
          )}

        </div>

        {/* Quota Gauge */}
        {aboutInfo?.storageQuota && (
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">TOTAL DRIVE STORAGE</span>
              <span className="text-white font-bold text-sm">{formatBytes(aboutInfo.storageQuota.limit)}</span>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">USED DRIVE STORAGE</span>
              <span className="text-red-400 font-bold text-sm">{formatBytes(aboutInfo.storageQuota.usage)}</span>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">APPLICATION DATA USAGE</span>
              <span className="text-emerald-400 font-bold text-sm">{formatBytes(aboutInfo.storageQuota.usageInDrive)}</span>
            </div>
          </div>
        )}

      </div>

      {/* Drive Action Bar */}
      {accessToken ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Folder Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto py-1">
              {folderPath.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-zinc-600">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(idx)}
                    className={`hover:text-red-400 transition-colors font-bold whitespace-nowrap ${
                      idx === folderPath.length - 1 ? 'text-white underline decoration-red-500' : 'text-zinc-400'
                    }`}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-red-950/40 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </button>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                New Folder
              </button>

              <button
                onClick={handleExportLogs}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border border-emerald-500/30 transition-colors cursor-pointer"
                title="Export MovieGuard Security Audit Logs to Google Drive"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Backup Logs
              </button>

              <button
                onClick={handleBackupCatalog}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border border-sky-500/30 transition-colors cursor-pointer"
                title="Export Movie Catalog Backup to Google Drive"
              >
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Backup Catalog
              </button>

              <button
                onClick={() => loadDriveData(accessToken, currentFolderId)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-700 transition-colors"
                title="Refresh Google Drive"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-red-400' : ''}`} />
              </button>

            </div>

          </div>

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-zinc-800">
            
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google Drive files..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </form>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Files
              </button>
              <button
                onClick={() => setActiveFilter('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                  activeFilter === 'video' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileVideo className="w-3.5 h-3.5 text-red-400" />
                Videos
              </button>
              <button
                onClick={() => setActiveFilter('folder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                  activeFilter === 'folder' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                Folders
              </button>
              <button
                onClick={() => setActiveFilter('document')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors ${
                  activeFilter === 'document' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Docs
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <HardDrive className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-black text-white">Google Drive Not Connected</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-mono">
            Please click "Sign in with Google Drive" above to grant access and enable cloud media imports & audit log backups.
          </p>
        </div>
      )}

      {/* Google Drive Files List */}
      {accessToken && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              Drive Content ({files.length} items)
            </h2>
          </div>

          {isLoadingFiles ? (
            <div className="p-12 text-center text-zinc-400 font-mono space-y-2">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
              <p className="text-xs">Fetching Google Drive directory...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-mono space-y-2 border border-dashed border-zinc-800 rounded-2xl">
              <Folder className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-xs">No files or folders found in this location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                const isVideo = file.mimeType.startsWith('video/');

                return (
                  <div
                    key={file.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-xl group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 shrink-0">
                        {isFolder ? (
                          <Folder className="w-6 h-6 text-amber-400" />
                        ) : isVideo ? (
                          <FileVideo className="w-6 h-6 text-red-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-sky-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {isFolder ? (
                          <button
                            onClick={() => handleOpenFolder(file)}
                            className="text-xs font-bold text-white hover:text-red-400 text-left line-clamp-2 transition-colors cursor-pointer"
                          >
                            {file.name}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-white block line-clamp-2">{file.name}</span>
                        )}

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                          <span>{isFolder ? 'Folder' : formatBytes(file.size)}</span>
                          {file.createdTime && (
                            <>
                              <span>•</span>
                              <span>{new Date(file.createdTime).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* File Action Controls */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2">
                      
                      {isVideo && (
                        <button
                          onClick={() => openImportModal(file)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer border border-red-500/30"
                          title="Import video into MovieGuard Media Vault"
                        >
                          <Plus className="w-3 h-3" />
                          Import Media
                        </button>
                      )}

                      {isFolder && (
                        <button
                          onClick={() => handleOpenFolder(file)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Folder className="w-3 h-3" />
                          Open
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            title="View in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {file.webContentLink && (
                          <a
                            href={file.webContentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Delete Trigger Button -> Triggers Mandatory Confirmation Modal */}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete file from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MANDATORY DESTRUCTIVE OPERATION CONFIRMATION MODAL */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Confirm Delete from Google Drive</h3>
              <p className="text-xs text-zinc-300 font-mono">
                Are you sure you want to delete <span className="text-red-400 font-bold">"{fileToDelete.name}"</span>?
              </p>
              <p className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded-xl border border-zinc-800 font-mono">
                File ID: {fileToDelete.id}<br />
                Type: {fileToDelete.mimeType}
              </p>
              <p className="text-[11px] text-red-400 font-medium">
                This operation will permanently remove the item from your Google Drive account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950/50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                Create New Folder in Google Drive
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Movies Vault 2026"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  {isCreatingFolder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-500" />
                Upload Local File to Google Drive
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-zinc-400">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFileToUpload(e.target.files?.[0] || null)}
                  className="w-full text-xs font-mono text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFileToUpload}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Upload to Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT DRIVE MEDIA MODAL */}
      {importDriveFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-red-500" />
                Import Drive Video to MovieGuard Vault
              </h3>
              <button onClick={() => setImportDriveFile(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-zinc-400 block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={importDescription}
                  onChange={(e) => setImportDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={importCategory}
                    onChange={(e: any) => setImportCategory(e.target.value)}
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
                  <label className="text-zinc-400 block mb-1">Age Rating</label>
                  <select
                    value={importRating}
                    onChange={(e: any) => {
                      const val = e.target.value;
                      setImportRating(val);
                      if (val === 'U') setImportMinAge(0);
                      else if (val === 'U/A') setImportMinAge(13);
                      else setImportMinAge(18);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="U">U (Universal / All Ages)</option>
                    <option value="U/A">U/A (13+ Parental Guidance)</option>
                    <option value="A">A (18+ Adult)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Poster Image URL</label>
                <input
                  type="url"
                  value={importPosterUrl}
                  onChange={(e) => setImportPosterUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setImportDriveFile(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-950/50"
                >
                  Add to Media Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

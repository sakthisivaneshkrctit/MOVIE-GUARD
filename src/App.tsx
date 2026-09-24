import React, { useState, useEffect } from 'react';
import { User, MediaItem, ActivityLog, WatchHistory, AppRoute } from './types';
import { store } from './services/store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JavaCodeInspector } from './components/JavaCodeInspector';

import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { VerifyFace } from './pages/VerifyFace';
import { Player } from './pages/Player';
import { AccessDenied } from './pages/AccessDenied';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DrivePage } from './pages/DrivePage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(store.getMediaItems());
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [logs, setLogs] = useState<ActivityLog[]>(store.getLogs());
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>(store.getWatchHistory());

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [routeParams, setRouteParams] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Verified stream tokens
  const [verifiedMovies, setVerifiedMovies] = useState<Record<string, boolean>>({});

  // Java Inspector Drawer modal toggle
  const [showJavaInspector, setShowJavaInspector] = useState(false);

  const refreshState = () => {
    setCurrentUser(store.getCurrentUser());
    setMediaItems(store.getMediaItems());
    setUsers(store.getUsers());
    setLogs(store.getLogs());
    setWatchHistory(store.getWatchHistory());
  };

  const handleNavigate = (route: AppRoute, params: any = {}) => {
    if (route === 'java-code') {
      setShowJavaInspector(true);
      return;
    }

    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    store.logout();
    setVerifiedMovies({});
    refreshState();
    handleNavigate('login');
  };

  const handleVerificationComplete = (movieId: string, verified: boolean) => {
    setVerifiedMovies((prev) => ({ ...prev, [movieId]: verified }));
  };

  const activeMediaItem = routeParams.movieId
    ? mediaItems.find((m) => m.id === routeParams.movieId) || null
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {currentRoute === 'home' && (
          <Home
            mediaItems={mediaItems}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'movies' && (
          <Movies
            mediaItems={mediaItems}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentRoute === 'movie-details' && (
          <MovieDetails
            media={activeMediaItem}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'verifyface' && (
          <VerifyFace
            media={activeMediaItem}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {currentRoute === 'player' && (
          <Player
            media={activeMediaItem}
            currentUser={currentUser}
            isFaceVerified={routeParams.movieId ? !!verifiedMovies[routeParams.movieId] : false}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'access-denied' && (
          <AccessDenied
            reason={routeParams.reason}
            customMessage={routeParams.customMessage}
            movieId={routeParams.movieId}
            mediaItems={mediaItems}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'profile' && (
          <Profile
            currentUser={currentUser}
            watchHistory={watchHistory}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {currentRoute === 'admin' && (
          <Admin
            currentUser={currentUser}
            mediaItems={mediaItems}
            users={users}
            logs={logs}
            onNavigate={handleNavigate}
            onRefreshData={refreshState}
          />
        )}

        {currentRoute === 'drive' && (
          <DrivePage
            currentUser={currentUser}
            mediaItems={mediaItems}
            logs={logs}
            onNavigate={handleNavigate}
            onRefreshData={refreshState}
          />
        )}

        {currentRoute === 'login' && (
          <Login
            onNavigate={handleNavigate}
            onLoginSuccess={(u) => {
              setCurrentUser(u);
              refreshState();
            }}
          />
        )}

        {currentRoute === 'register' && (
          <Register
            onNavigate={handleNavigate}
            onRegisterSuccess={(u) => {
              setCurrentUser(u);
              refreshState();
            }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Java Code Source Inspector Modal */}
      {showJavaInspector && (
        <JavaCodeInspector onClose={() => setShowJavaInspector(false)} />
      )}

    </div>
  );
}

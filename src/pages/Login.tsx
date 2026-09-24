import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { AppRoute, User } from '../types';
import { store } from '../services/store';

interface LoginProps {
  onNavigate: (route: AppRoute, params?: any) => void;
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = store.login(email, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onNavigate('home');
    } else {
      setError(res.message);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    const res = store.login(demoEmail, demoPass);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 pb-16">
      
      {/* Login Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-950/40">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Movie Guard Access</h1>
          <p className="text-xs text-zinc-400 font-mono">
            Enter your credentials to manage your secure media vault.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Sign In to Media Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Demo Quick Accounts Selector */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-center">
            Instant Demo Account Switcher
          </div>

          <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
            <button
              onClick={() => handleQuickFill('sakthisivaneshkrctit@gmail.com', 'secure123')}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-white block">Sakthi Sivanesh</span>
                <span className="text-[10px] text-emerald-400">Age 22 (Adult 18+) • UID: 2841 9382 7105</span>
              </div>
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickFill('rithikraj@movieguard.sec', 'user123')}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-white block">Rithikraj</span>
                <span className="text-[10px] text-red-400">Age 15 (Under 18 Minor) • UID: 4105 8293 1746</span>
              </div>
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickFill('admin@movieguard.sec', 'admin123')}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="font-bold text-white block">Security Admin</span>
                <span className="text-[10px] text-zinc-400">admin@movieguard.sec</span>
              </div>
              <KeyRound className="w-4 h-4 text-red-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Register Redirect */}
        <div className="text-center text-xs text-zinc-400 pt-2">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-red-400 hover:underline font-bold"
          >
            Register Here
          </button>
        </div>

      </div>

    </div>
  );
};

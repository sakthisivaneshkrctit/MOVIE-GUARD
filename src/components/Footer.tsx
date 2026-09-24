import React from 'react';
import { Shield, Lock, Server, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-8 px-4 mt-auto text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left column */}
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold tracking-wider">
            <Shield className="w-4 h-4 text-red-500" />
            <span>MOVIE GUARD SECURITY PLATFORM</span>
          </div>
          <p className="text-zinc-500 max-w-md">
            Personal media vault powered by Java 17 Spring Boot REST architecture, in-memory state persistence, and real-time biometric face verification.
          </p>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            AES-256 DRM
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            Spring Boot 3.2.3
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Biometric Face Scan
          </span>
        </div>

        {/* Right column */}
        <div className="text-zinc-500 text-center md:text-right font-mono">
          <span>&copy; 2026 Movie Guard Inc.</span>
        </div>

      </div>
    </footer>
  );
};

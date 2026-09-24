import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Movie Guard Runtime Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAll = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-zinc-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-950/40 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-950/50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                Application Recovery Mode
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                A client-side initialization issue was intercepted. Movie Guard protected the session from crashing to a white screen.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-950/90 border border-zinc-800 rounded-xl text-left font-mono text-[11px] text-red-300 max-h-32 overflow-y-auto">
                <span className="text-zinc-500 block mb-1">Error message:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <button
                onClick={this.handleResetAll}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Cache & Restart
              </button>
            </div>

            <div className="pt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-600" />
              <span>Movie Guard • Aadhaar Biometric Protected</span>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/control-panel';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5FC] text-[#171238] flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-[#E8DFF5] p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#171238]">
                {this.props.fallbackTitle || 'Control Panel View Recovered'}
              </h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The interface encountered a temporary rendering state. You can reload this view or return to the main dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                <p className="text-[11px] font-mono text-red-700 font-semibold break-words">
                  {this.state.error.message || 'Unknown render error'}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] font-mono text-slate-500 overflow-x-auto max-h-32">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#52128B] text-white text-xs font-semibold rounded-full hover:bg-[#32105B] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Dashboard
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8DFF5] text-[#52128B] text-xs font-semibold rounded-full hover:bg-[#F5F0FC] transition-colors cursor-pointer"
              >
                Reset Cache
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full hover:bg-slate-200 transition-colors"
              >
                <Home className="w-3.5 h-3.5" /> Public Site
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              KITS College of Pharmacy for Women • Engineered &amp; Designed by Infiniforge Technologies
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

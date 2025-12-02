import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/40 bg-slate-900/60 backdrop-blur p-6 space-y-4">
            <h2 className="text-xl font-semibold text-rose-400">Something went wrong</h2>
            <p className="text-sm text-slate-300">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            {this.state.error && (
              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer hover:text-slate-300">Error details</summary>
                <pre className="mt-2 p-2 bg-slate-800 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate this boundary from parent boundaries
  level?: 'page' | 'section' | 'component'; // Error boundary level for better reporting
  name?: string; // Custom name for this boundary
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorReport {
  errorId: string;
  error: Error;
  errorInfo: ErrorInfo;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  boundaryName?: string;
  boundaryLevel?: string;
  retryCount: number;
  context: ErrorContext;
}

interface ErrorContext {
  route: string;
  props: Record<string, any>;
  state: Record<string, any>;
  memoryUsage?: { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number };
  performanceMetrics?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReports: ErrorReport[] = [];
  private maxRetries: number = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create detailed error report
    const errorReport: ErrorReport = {
      errorId,
      error,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      boundaryName: this.props.name || 'UnnamedBoundary',
      boundaryLevel: this.props.level || 'component',
      retryCount: this.state.retryCount,
      context: this.collectErrorContext()
    };

    this.errorReports.push(errorReport);

    // Enhanced logging
    console.group(`🚨 Error Boundary: ${errorReport.boundaryName}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', errorId);
    console.error('Context:', errorReport.context);
    console.groupEnd();

    // Add to performance monitor with enhanced metadata
    performanceMonitor.addError({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      type: 'javascript',
      metadata: {
        errorId,
        boundaryName: this.props.name,
        boundaryLevel: this.props.level,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount,
        context: errorReport.context
      }
    });

    this.setState({
      errorInfo,
      errorId
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to external service (if configured)
    this.reportError(errorReport);
  }

  private collectErrorContext(): ErrorContext {
    const context: ErrorContext = {
      route: window.location.pathname,
      props: this.sanitizeProps(this.props),
      state: this.sanitizeState(this.state)
    };

    // Add memory usage if available
    if ('memory' in performance) {
      context.memoryUsage = (performance as any).memory;
    }

    // Add recent performance metrics
    context.performanceMetrics = {
      recentMetrics: performanceMonitor.getMetrics().slice(-10),
      recentErrors: performanceMonitor.getErrors().slice(-5)
    };

    return context;
  }

  private sanitizeProps(props: any): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (React.isValidElement(value)) {
        sanitized[key] = '[ReactElement]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = '[Object]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private sanitizeState(state: any): Record<string, any> {
    return JSON.parse(JSON.stringify(state, (_key, value) => {
      if (typeof value === 'function') return '[Function]';
      if (value instanceof Error) return { message: value.message, stack: value.stack };
      return value;
    }));
  }

  private reportError(errorReport: ErrorReport): void {
    // Send error report to monitoring service
    // This would typically be sent to a service like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Error Report:', errorReport);
    }

    // You can implement actual error reporting here
    // Example: send to analytics or error tracking service
    if (typeof window !== 'undefined' && (window as any).errorReporting) {
      (window as any).errorReporting.report(errorReport);
    }
  }

  private handleReset = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleRetry = (): void => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn(`Max retries (${this.maxRetries}) reached for error boundary: ${this.props.name}`);
      return;
    }

    this.handleReset();
  };

  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  public clearErrorReports(): void {
    this.errorReports = [];
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const errorId = this.state.errorId;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="max-w-3xl p-8 bg-gray-800 rounded-lg shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-red-500">Something went wrong</h2>
                <p className="text-sm text-gray-400">Error ID: {errorId}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                The application encountered an unexpected error in the {this.props.name || 'component'}.
              </p>
              {this.state.retryCount > 0 && (
                <p className="text-yellow-400 text-sm">
                  Retry attempt: {this.state.retryCount}/{this.maxRetries}
                </p>
              )}
            </div>

            {this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-200 flex items-center">
                  <span className="mr-2">🔍</span>
                  Technical Details
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Error Message:</h4>
                    <pre className="p-3 bg-gray-900 rounded text-xs text-red-300 overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Stack Trace:</h4>
                      <pre className="p-3 bg-gray-900 rounded text-xs text-gray-400 overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Component Stack:</h4>
                      <pre className="p-3 bg-gray-900 rounded text-xs text-gray-400 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex space-x-4">
              {canRetry ? (
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                >
                  <span className="mr-2">🔄</span>
                  Try Again
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center"
                >
                  <span className="mr-2">🔄</span>
                  Reload Page
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    errorId,
                    message: this.state.error?.message,
                    stack: this.state.error?.stack,
                    componentStack: this.state.errorInfo?.componentStack,
                    timestamp: Date.now(),
                    url: window.location.href
                  }, null, 2));
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center"
              >
                <span className="mr-2">📋</span>
                Copy Error Details
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
                <h3 className="text-yellow-300 font-semibold mb-2">Development Mode</h3>
                <p className="text-yellow-200 text-sm">
                  This error has been logged to the console with additional debugging information.
                  Check the browser's developer tools for more details.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
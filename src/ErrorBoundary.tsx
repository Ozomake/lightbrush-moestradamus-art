import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#1a0033',
          color: 'white',
          fontFamily: 'monospace',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>Error Loading Application</h1>
          <div style={{ background: '#330011', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </pre>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
              {this.state.error?.stack}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
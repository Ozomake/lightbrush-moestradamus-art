import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initializeMonitoring, monitoringSystem, MonitoringConfig } from './index';
import { useAnalyticsDashboard, AnalyticsDashboard } from './AnalyticsDashboard';
import { PerformanceProfiler } from './ReactProfiler';

interface MonitoringContextValue {
  isEnabled: boolean;
  toggleDashboard: () => void;
  isDashboardVisible: boolean;
  enableThreeJSMonitoring: (renderer: any) => Promise<void>;
  generateReport: () => any;
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

interface MonitoringProviderProps {
  children: ReactNode;
  config?: MonitoringConfig;
  enableDashboard?: boolean;
  dashboardPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  profilerEnabled?: boolean;
  profilerName?: string;
}

export function MonitoringProvider({
  children,
  config = {},
  enableDashboard = true,
  dashboardPosition = 'top-right',
  profilerEnabled = true,
  profilerName = 'App'
}: MonitoringProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const dashboard = useAnalyticsDashboard();

  useEffect(() => {
    // Initialize monitoring system
    initializeMonitoring({
      enablePerformanceMonitoring: true,
      enableNetworkMonitoring: true,
      enableThreeJSMonitoring: true,
      enableErrorReporting: true,
      developmentOnly: false,
      ...config
    });

    setIsEnabled(true);

    // Cleanup on unmount
    return () => {
      monitoringSystem.shutdown();
    };
  }, [config]);

  const enableThreeJSMonitoring = async (renderer: any) => {
    await monitoringSystem.enableThreeJSMonitoring(renderer);
  };

  const generateReport = () => {
    return monitoringSystem.generateReport();
  };

  const contextValue: MonitoringContextValue = {
    isEnabled,
    toggleDashboard: dashboard.toggle,
    isDashboardVisible: dashboard.isVisible,
    enableThreeJSMonitoring,
    generateReport
  };

  const content = profilerEnabled ? (
    <PerformanceProfiler id={profilerName}>
      {children}
    </PerformanceProfiler>
  ) : children;

  return (
    <MonitoringContext.Provider value={contextValue}>
      {content}
      {enableDashboard && (
        <AnalyticsDashboard
          isVisible={dashboard.isVisible}
          onToggle={dashboard.toggle}
          position={dashboardPosition}
        />
      )}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring(): MonitoringContextValue {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}

// HOC for automatic monitoring setup
export function withMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    profilerName?: string;
    enableDashboard?: boolean;
    config?: MonitoringConfig;
  }
): React.ComponentType<T> {
  const WrappedComponent = (props: T) => (
    <MonitoringProvider
      config={options?.config}
      enableDashboard={options?.enableDashboard}
      profilerName={options?.profilerName}
    >
      <Component {...props} />
    </MonitoringProvider>
  );

  WrappedComponent.displayName = `withMonitoring(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Quick setup component for Three.js scenes
interface ThreeJSMonitoringProps {
  renderer: any;
  children: ReactNode;
}

export function ThreeJSMonitoring({ renderer, children }: ThreeJSMonitoringProps) {
  const monitoring = useMonitoring();

  useEffect(() => {
    if (renderer && monitoring.isEnabled) {
      monitoring.enableThreeJSMonitoring(renderer);
    }
  }, [renderer, monitoring]);

  return <>{children}</>;
}

// Development-only dashboard toggle
export function DevDashboardToggle() {
  const monitoring = useMonitoring();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={monitoring.toggleDashboard}
      className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      title="Toggle Performance Dashboard"
    >
      📊
    </button>
  );
}

// Performance metrics display component
export function PerformanceMetrics() {
  const monitoring = useMonitoring();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (monitoring.isEnabled) {
        const report = monitoring.generateReport();
        setMetrics(report);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [monitoring]);

  if (!metrics || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40 p-3 bg-black bg-opacity-75 text-white text-xs rounded">
      <div>FPS: {metrics.threeJS?.fps || 'N/A'}</div>
      <div>Network: {metrics.network.totalRequests} requests</div>
      <div>Errors: {metrics.performance.criticalErrors.length}</div>
    </div>
  );
}
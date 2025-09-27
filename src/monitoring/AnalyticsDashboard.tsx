import React, { useState, useEffect, useRef } from 'react';
import { performanceMonitor, PerformanceMetric, ErrorData, WebVitalsData } from './PerformanceMonitor';
// Lazy load Three.js monitor to avoid bundling Three.js upfront
import { networkMonitor, NetworkMetrics } from './NetworkMonitor';

interface DashboardProps {
  isVisible: boolean;
  onToggle: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface PerformanceSnapshot {
  timestamp: number;
  metrics: PerformanceMetric[];
  errors: ErrorData[];
  webVitals: WebVitalsData;
  threeJS?: any | null;
  network: NetworkMetrics;
  memory?: MemoryInfo;
}

export function AnalyticsDashboard({
  isVisible,
  onToggle,
  position = 'top-right'
}: DashboardProps) {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'errors' | 'network' | 'threejs'>('overview');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible) {
      updateSnapshot();
      intervalRef.current = setInterval(updateSnapshot, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  const updateSnapshot = async () => {
    const perfData = performanceMonitor.getPerformanceData();
    let threeJSData = null;
    try {
      const { threeJSMonitor } = await import('./ThreeJSMonitor');
      threeJSData = threeJSMonitor.getMetrics();
    } catch {
      // Three.js monitor not loaded
    }
    const networkData = networkMonitor.getMetrics();

    setSnapshot({
      timestamp: Date.now(),
      metrics: perfData.metrics,
      errors: perfData.errors,
      webVitals: perfData.webVitals,
      threeJS: threeJSData,
      network: networkData,
      memory: 'memory' in performance ? (performance as any).memory : undefined
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className={`fixed z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors ${getPositionClasses(position)}`}
        title="Open Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 ${getPositionClasses(position)} ${isMinimized ? 'w-64' : 'w-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="font-semibold text-green-400">📊 Performance Monitor</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
            title="Close Dashboard"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="max-h-96 overflow-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { key: 'overview', label: '📈', title: 'Overview' },
              { key: 'performance', label: '⚡', title: 'Performance' },
              { key: 'errors', label: '🚨', title: 'Errors' },
              { key: 'network', label: '🌐', title: 'Network' },
              { key: 'threejs', label: '🎮', title: 'Three.js' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 p-2 text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={tab.title}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'overview' && <OverviewTab snapshot={snapshot} />}
            {activeTab === 'performance' && <PerformanceTab snapshot={snapshot} />}
            {activeTab === 'errors' && <ErrorsTab snapshot={snapshot} />}
            {activeTab === 'network' && <NetworkTab snapshot={snapshot} />}
            {activeTab === 'threejs' && <ThreeJSTab snapshot={snapshot} />}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ snapshot }: { snapshot: PerformanceSnapshot | null }) {
  if (!snapshot) return <div className="text-gray-400">Loading...</div>;

  const recentErrors = snapshot.errors.slice(-3);
  const avgResponseTime = snapshot.network.averageResponseTime;
  const fps = snapshot.threeJS?.fps || 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="FPS"
          value={fps}
          suffix=""
          status={fps >= 45 ? 'good' : fps >= 30 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Network"
          value={avgResponseTime}
          suffix="ms"
          status={avgResponseTime < 500 ? 'good' : avgResponseTime < 1000 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Errors"
          value={snapshot.errors.length}
          suffix=""
          status={snapshot.errors.length === 0 ? 'good' : snapshot.errors.length < 5 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Requests"
          value={snapshot.network.totalRequests}
          suffix=""
          status="neutral"
        />
      </div>

      {snapshot.memory && (
        <div className="p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400 mb-1">Memory Usage</div>
          <div className="text-sm">
            {formatBytes(snapshot.memory.usedJSHeapSize)} / {formatBytes(snapshot.memory.jsHeapSizeLimit)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${(snapshot.memory.usedJSHeapSize / snapshot.memory.jsHeapSizeLimit) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {recentErrors.length > 0 && (
        <div className="p-2 bg-red-900 bg-opacity-30 rounded border border-red-700">
          <div className="text-xs text-red-400 mb-1">Recent Errors</div>
          {recentErrors.map((error, index) => (
            <div key={index} className="text-xs text-red-300 truncate">
              {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerformanceTab({ snapshot }: { snapshot: PerformanceSnapshot | null }) {
  if (!snapshot) return <div className="text-gray-400">Loading...</div>;

  const recentMetrics = snapshot.metrics.slice(-5);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="LCP"
          value={snapshot.webVitals.lcp || 0}
          suffix="ms"
          status={(snapshot.webVitals.lcp || 0) < 2500 ? 'good' : 'warning'}
        />
        <MetricCard
          label="FCP"
          value={snapshot.webVitals.fcp || 0}
          suffix="ms"
          status={(snapshot.webVitals.fcp || 0) < 1800 ? 'good' : 'warning'}
        />
        <MetricCard
          label="CLS"
          value={snapshot.webVitals.cls || 0}
          suffix=""
          status={(snapshot.webVitals.cls || 0) < 0.1 ? 'good' : 'warning'}
        />
        <MetricCard
          label="TTFB"
          value={snapshot.webVitals.ttfb || 0}
          suffix="ms"
          status={(snapshot.webVitals.ttfb || 0) < 600 ? 'good' : 'warning'}
        />
      </div>

      <div className="p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-400 mb-2">Recent Metrics</div>
        <div className="space-y-1">
          {recentMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-300 truncate mr-2">{metric.name}</span>
              <span className="text-green-400">{metric.value.toFixed(2)}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorsTab({ snapshot }: { snapshot: PerformanceSnapshot | null }) {
  if (!snapshot) return <div className="text-gray-400">Loading...</div>;

  const errorsByType = snapshot.errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(errorsByType).map(([type, count]) => (
          <MetricCard
            key={type}
            label={type}
            value={count}
            suffix=""
            status={count === 0 ? 'good' : count < 3 ? 'warning' : 'critical'}
          />
        ))}
      </div>

      <div className="p-2 bg-gray-800 rounded max-h-40 overflow-auto">
        <div className="text-xs text-gray-400 mb-2">Recent Errors</div>
        <div className="space-y-2">
          {snapshot.errors.slice(-5).map((error, index) => (
            <div key={index} className="p-2 bg-red-900 bg-opacity-30 rounded text-xs">
              <div className="text-red-400 font-medium">{error.type}</div>
              <div className="text-red-300 truncate">{error.message}</div>
              <div className="text-gray-400">{new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NetworkTab({ snapshot }: { snapshot: PerformanceSnapshot | null }) {
  if (!snapshot) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Success Rate"
          value={100 - snapshot.network.errorRate}
          suffix="%"
          status={snapshot.network.errorRate < 5 ? 'good' : snapshot.network.errorRate < 10 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Avg Response"
          value={snapshot.network.averageResponseTime}
          suffix="ms"
          status={snapshot.network.averageResponseTime < 500 ? 'good' : 'warning'}
        />
        <MetricCard
          label="Total Requests"
          value={snapshot.network.totalRequests}
          suffix=""
          status="neutral"
        />
        <MetricCard
          label="Failed"
          value={snapshot.network.failedRequests}
          suffix=""
          status={snapshot.network.failedRequests === 0 ? 'good' : 'warning'}
        />
      </div>

      <div className="p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-400 mb-2">Slow Requests</div>
        <div className="text-sm text-yellow-400">
          {snapshot.network.slowRequests} requests &gt; 3s
        </div>
      </div>
    </div>
  );
}

function ThreeJSTab({ snapshot }: { snapshot: PerformanceSnapshot | null }) {
  if (!snapshot || !snapshot.threeJS) {
    return <div className="text-gray-400">Three.js monitoring not available</div>;
  }

  const threeJS = snapshot.threeJS;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="FPS"
          value={threeJS.fps}
          suffix=""
          status={threeJS.fps >= 45 ? 'good' : threeJS.fps >= 30 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Frame Time"
          value={threeJS.frameTime}
          suffix="ms"
          status={threeJS.frameTime < 16.67 ? 'good' : 'warning'}
        />
        <MetricCard
          label="Draw Calls"
          value={threeJS.calls}
          suffix=""
          status={threeJS.calls < 100 ? 'good' : threeJS.calls < 500 ? 'warning' : 'critical'}
        />
        <MetricCard
          label="Triangles"
          value={Math.round(threeJS.triangles / 1000)}
          suffix="K"
          status={threeJS.triangles < 100000 ? 'good' : 'warning'}
        />
      </div>

      <div className="p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-400 mb-2">Resources</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Geometries: {threeJS.geometries}</div>
          <div>Textures: {threeJS.textures}</div>
          <div>Programs: {threeJS.programs}</div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  suffix: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
}

function MetricCard({ label, value, suffix, status }: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="p-2 bg-gray-800 rounded">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm font-mono ${getStatusColor()}`}>
        {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 0) : value}{suffix}
      </div>
    </div>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top-left': return 'top-4 left-4';
    case 'top-right': return 'top-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'bottom-right': return 'bottom-4 right-4';
    default: return 'top-4 right-4';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Hook for easy dashboard integration
export function useAnalyticsDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible(!isVisible);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    toggle,
    show,
    hide,
    Dashboard: (props: Omit<DashboardProps, 'isVisible' | 'onToggle'>) => (
      <AnalyticsDashboard {...props} isVisible={isVisible} onToggle={toggle} />
    )
  };
}
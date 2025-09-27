import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
// import { useAnimationManager } from '../../hooks/useAnimationManager'; // Commented out to fix unused import
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { ResourcePool } from '../../utils/ResourcePool';
import { preloadCriticalComponents, progressiveLoadComponents } from '../optimization/CodeSplitting';

// Performance context interface
interface PerformanceContextType {
  // Performance metrics
  performanceLevel: 'high' | 'medium' | 'low' | 'critical';
  averageFPS: number;
  memoryUsage: number;

  // Resource management
  resourcePool: ResourcePool;

  // Optimization controls
  enableOptimizations: () => void;
  disableOptimizations: () => void;
  setQualityLevel: (level: 'high' | 'medium' | 'low') => void;

  // Component loading
  preloadComponents: (priority: 'high' | 'medium' | 'low') => Promise<void>;

  // Performance monitoring
  performanceMetrics: any;
  performanceHistory: any[];
  performanceAlerts: string[];

  // Settings
  settings: PerformanceSettings;
  updateSettings: (settings: Partial<PerformanceSettings>) => void;
}

interface PerformanceSettings {
  adaptiveQuality: boolean;
  enableResourcePooling: boolean;
  enableLazyLoading: boolean;
  targetFPS: number;
  memoryLimit: number; // MB
  enableAutoOptimization: boolean;
  debugMode: boolean;
}

const defaultSettings: PerformanceSettings = {
  adaptiveQuality: true,
  enableResourcePooling: true,
  enableLazyLoading: true,
  targetFPS: 60,
  memoryLimit: 200,
  enableAutoOptimization: true,
  debugMode: false,
};

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Performance provider component
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PerformanceSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('lightbrush-performance-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low' | 'critical'>('high');
  const [_isOptimizationsEnabled, setIsOptimizationsEnabled] = useState(true);

  // Initialize core performance systems
  // const animationManager = useAnimationManager(); // Commented out to fix unused variable
  const resourcePool = useMemo(() => ResourcePool.getInstance(), []);

  const {
    metrics: performanceMetrics,
    history: performanceHistory,
    alerts: performanceAlerts,
    forceOptimization,
    resetOptimization,
  } = usePerformanceMonitor({
    updateInterval: 1000,
    enableAutoOptimization: settings.enableAutoOptimization,
    onPerformanceAlert: useCallback((metrics: any) => {
      console.warn('Performance alert:', metrics);

      // Auto-reduce quality if performance is critical
      if (metrics.qualityLevel === 'CRITICAL' && settings.adaptiveQuality) {
        setPerformanceLevel('critical');
      }
    }, [settings.adaptiveQuality]),
  });

  // Update performance level based on metrics
  useEffect(() => {
    if (!performanceMetrics || !settings.adaptiveQuality) return;

    const { fps, memoryUsage, qualityLevel } = performanceMetrics;

    let newLevel: 'high' | 'medium' | 'low' | 'critical' = 'high';

    if (qualityLevel === 'CRITICAL' || fps < 20 || memoryUsage > settings.memoryLimit * 1.5) {
      newLevel = 'critical';
    } else if (qualityLevel === 'LOW' || fps < 35 || memoryUsage > settings.memoryLimit) {
      newLevel = 'low';
    } else if (qualityLevel === 'MEDIUM' || fps < 50 || memoryUsage > settings.memoryLimit * 0.8) {
      newLevel = 'medium';
    }

    if (newLevel !== performanceLevel) {
      setPerformanceLevel(newLevel);
    }
  }, [performanceMetrics, settings.adaptiveQuality, settings.memoryLimit, performanceLevel]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('lightbrush-performance-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize performance optimizations
  useEffect(() => {
    // Preload critical components
    if (settings.enableLazyLoading) {
      preloadCriticalComponents();

      // Progressive loading based on performance
      setTimeout(() => {
        progressiveLoadComponents('high');
      }, 2000);

      setTimeout(() => {
        if (performanceLevel === 'high') {
          progressiveLoadComponents('medium');
        }
      }, 5000);

      setTimeout(() => {
        if (performanceLevel === 'high') {
          progressiveLoadComponents('low');
        }
      }, 10000);
    }
  }, [settings.enableLazyLoading, performanceLevel]);

  // Performance optimization functions
  const enableOptimizations = useCallback(() => {
    setIsOptimizationsEnabled(true);
    resetOptimization();
  }, [resetOptimization]);

  const disableOptimizations = useCallback(() => {
    setIsOptimizationsEnabled(false);
    forceOptimization();
  }, [forceOptimization]);

  const setQualityLevel = useCallback((level: 'high' | 'medium' | 'low') => {
    setPerformanceLevel(level);
    setSettings(prev => ({ ...prev, adaptiveQuality: false }));

    // Apply quality-specific optimizations
    switch (level) {
      case 'high':
        resetOptimization();
        break;
      case 'medium':
      case 'low':
        forceOptimization();
        break;
    }
  }, [forceOptimization, resetOptimization]);

  const preloadComponents = useCallback(async (priority: 'high' | 'medium' | 'low') => {
    if (settings.enableLazyLoading) {
      await progressiveLoadComponents(priority);
    }
  }, [settings.enableLazyLoading]);

  const updateSettings = useCallback((newSettings: Partial<PerformanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Context value
  const contextValue: PerformanceContextType = useMemo(() => ({
    performanceLevel,
    averageFPS: performanceMetrics?.averageFPS || 60,
    memoryUsage: performanceMetrics?.memoryUsage || 0,
    resourcePool,
    enableOptimizations,
    disableOptimizations,
    setQualityLevel,
    preloadComponents,
    performanceMetrics,
    performanceHistory,
    performanceAlerts,
    settings,
    updateSettings,
  }), [
    performanceLevel,
    performanceMetrics,
    resourcePool,
    enableOptimizations,
    disableOptimizations,
    setQualityLevel,
    preloadComponents,
    performanceHistory,
    performanceAlerts,
    settings,
    updateSettings,
  ]);

  // Debug logging
  useEffect(() => {
    if (settings.debugMode && performanceMetrics) {
      console.log('Performance Update:', {
        level: performanceLevel,
        fps: performanceMetrics.fps?.toFixed(1),
        memory: performanceMetrics.memoryUsage?.toFixed(1),
        animations: performanceMetrics.animationCount,
      });
    }
  }, [settings.debugMode, performanceLevel, performanceMetrics]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}

      {/* Performance monitoring overlay in debug mode */}
      {settings.debugMode && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
          <div className="font-bold mb-2">Performance Debug</div>
          <div>Level: <span className={`font-bold ${
            performanceLevel === 'high' ? 'text-green-400' :
            performanceLevel === 'medium' ? 'text-yellow-400' :
            performanceLevel === 'low' ? 'text-orange-400' : 'text-red-400'
          }`}>{performanceLevel.toUpperCase()}</span></div>
          {performanceMetrics && (
            <>
              <div>FPS: {performanceMetrics.fps?.toFixed(1)}</div>
              <div>Memory: {performanceMetrics.memoryUsage?.toFixed(1)} MB</div>
              <div>Animations: {performanceMetrics.animationCount}</div>
              <div>Resource Pool: {Object.keys(resourcePool.getAllStats().geometries).length} geo, {Object.keys(resourcePool.getAllStats().materials).length} mat</div>
            </>
          )}
          {performanceAlerts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-red-500">
              <div className="text-red-400 font-bold">Alerts: {performanceAlerts.length}</div>
            </div>
          )}
        </div>
      )}
    </PerformanceContext.Provider>
  );
}

// Hook to use performance context
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Performance settings component
export function PerformanceSettings() {
  const { settings, updateSettings, performanceLevel, averageFPS, memoryUsage } = usePerformance();

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md">
      <h3 className="text-lg font-bold mb-4">Performance Settings</h3>

      {/* Current status */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <div className="text-sm mb-2">Current Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Level: <span className={`font-bold ${
            performanceLevel === 'high' ? 'text-green-400' :
            performanceLevel === 'medium' ? 'text-yellow-400' :
            performanceLevel === 'low' ? 'text-orange-400' : 'text-red-400'
          }`}>{performanceLevel}</span></div>
          <div>FPS: {averageFPS.toFixed(1)}</div>
          <div>Memory: {memoryUsage.toFixed(1)} MB</div>
        </div>
      </div>

      {/* Settings controls */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.adaptiveQuality}
            onChange={(e) => updateSettings({ adaptiveQuality: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Adaptive Quality</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enableResourcePooling}
            onChange={(e) => updateSettings({ enableResourcePooling: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Resource Pooling</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enableLazyLoading}
            onChange={(e) => updateSettings({ enableLazyLoading: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Lazy Loading</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enableAutoOptimization}
            onChange={(e) => updateSettings({ enableAutoOptimization: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Auto Optimization</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.debugMode}
            onChange={(e) => updateSettings({ debugMode: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Debug Mode</span>
        </label>

        <div>
          <label className="block text-sm mb-1">Target FPS</label>
          <input
            type="range"
            min="30"
            max="120"
            value={settings.targetFPS}
            onChange={(e) => updateSettings({ targetFPS: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400">{settings.targetFPS} FPS</div>
        </div>

        <div>
          <label className="block text-sm mb-1">Memory Limit</label>
          <input
            type="range"
            min="100"
            max="500"
            value={settings.memoryLimit}
            onChange={(e) => updateSettings({ memoryLimit: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400">{settings.memoryLimit} MB</div>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for performance-aware components
export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  optimizationLevel: 'high' | 'medium' | 'low' = 'medium'
) {
  return React.memo((props: P) => {
    const { performanceLevel } = usePerformance();

    // Skip rendering if performance level is too low for this component
    if (performanceLevel === 'critical' && optimizationLevel === 'low') {
      return null;
    }

    if (performanceLevel === 'low' && optimizationLevel === 'medium') {
      return null;
    }

    return <Component {...props} />;
  });
}

export default PerformanceProvider;
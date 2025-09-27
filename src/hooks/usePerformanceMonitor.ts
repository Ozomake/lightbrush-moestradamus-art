import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnimationManager } from './useAnimationManager';
import { ResourcePool } from '../utils/ResourcePool';

// Performance metrics interface
export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  memoryUsage: number;
  renderTime: number;
  frameDrops: number;
  animationCount: number;
  resourceStats: any;
  cpuUsage: number;
  gpuMemory: number;
  timestamp: number;
  qualityLevel: string;
}

// Performance thresholds for different quality levels
const PERFORMANCE_LEVELS = {
  HIGH: { minFPS: 55, maxMemory: 100, maxRenderTime: 16 },
  MEDIUM: { minFPS: 40, maxMemory: 150, maxRenderTime: 25 },
  LOW: { minFPS: 25, maxMemory: 200, maxRenderTime: 40 },
  CRITICAL: { minFPS: 15, maxMemory: 300, maxRenderTime: 66 },
};

// Enhanced performance monitoring hook
export function usePerformanceMonitor(options: {
  updateInterval?: number;
  historySize?: number;
  enableAutoOptimization?: boolean;
  onPerformanceAlert?: (metrics: PerformanceMetrics) => void;
} = {}) {
  const {
    updateInterval = 1000,
    historySize = 60,
    enableAutoOptimization = true,
    onPerformanceAlert
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const frameDropsRef = useRef(0);

  const { getPerformanceMetrics, emergencyPerformanceMode, restoreFullPerformance } = useAnimationManager();
  const resourcePool = ResourcePool.getInstance();

  // Memory usage estimation
  const estimateMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Fallback estimation based on resource usage
    const resourceStats = resourcePool.getAllStats();
    let estimatedMB = 0;

    // Estimate based on geometries, materials, textures
    Object.values(resourceStats.geometries).forEach(stats => {
      estimatedMB += stats.total * 0.5; // ~0.5MB per geometry
    });
    Object.values(resourceStats.materials).forEach(stats => {
      estimatedMB += stats.total * 0.1; // ~0.1MB per material
    });
    Object.values(resourceStats.textures).forEach(() => {
      estimatedMB += 2; // ~2MB per texture
    });

    return estimatedMB;
  }, [resourcePool]);

  // CPU usage estimation
  const estimateCPUUsage = useCallback((): number => {
    const start = performance.now();

    // Perform a standardized computation
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += Math.sin(i) * Math.cos(i);
    }

    const duration = performance.now() - start;
    // Normalize to percentage (baseline ~1ms on modern devices)
    return Math.min(100, duration * 10);
  }, []);

  // GPU memory estimation
  const estimateGPUMemory = useCallback((): number => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          // This is a rough estimation - actual GPU memory usage is hard to measure
          const resourceStats = resourcePool.getAllStats();
          let estimatedMB = 0;

          // Estimate GPU memory usage
          Object.values(resourceStats.geometries).forEach(stats => {
            estimatedMB += stats.total * 1; // ~1MB per geometry on GPU
          });
          Object.values(resourceStats.textures).forEach(() => {
            estimatedMB += 4; // ~4MB per texture on GPU
          });

          return estimatedMB;
        }
      }
    } catch (error) {
      console.warn('Failed to estimate GPU memory:', error);
    }

    return 0;
  }, [resourcePool]);

  // Determine quality level based on current metrics
  const determineQualityLevel = useCallback((currentMetrics: PerformanceMetrics): string => {
    const { fps, memoryUsage, renderTime } = currentMetrics;

    if (fps >= PERFORMANCE_LEVELS.HIGH.minFPS &&
        memoryUsage <= PERFORMANCE_LEVELS.HIGH.maxMemory &&
        renderTime <= PERFORMANCE_LEVELS.HIGH.maxRenderTime) {
      return 'HIGH';
    } else if (fps >= PERFORMANCE_LEVELS.MEDIUM.minFPS &&
               memoryUsage <= PERFORMANCE_LEVELS.MEDIUM.maxMemory &&
               renderTime <= PERFORMANCE_LEVELS.MEDIUM.maxRenderTime) {
      return 'MEDIUM';
    } else if (fps >= PERFORMANCE_LEVELS.LOW.minFPS &&
               memoryUsage <= PERFORMANCE_LEVELS.LOW.maxMemory &&
               renderTime <= PERFORMANCE_LEVELS.LOW.maxRenderTime) {
      return 'LOW';
    } else {
      return 'CRITICAL';
    }
  }, []);

  // Auto-optimization based on performance
  const handleAutoOptimization = useCallback((currentMetrics: PerformanceMetrics) => {
    if (!enableAutoOptimization) return;

    const qualityLevel = currentMetrics.qualityLevel;

    if (qualityLevel === 'CRITICAL') {
      emergencyPerformanceMode();
      setAlerts(prev => [...prev, `CRITICAL: Emergency performance mode activated (FPS: ${currentMetrics.fps.toFixed(1)})`]);

      if (onPerformanceAlert) {
        onPerformanceAlert(currentMetrics);
      }
    } else if (qualityLevel === 'HIGH' && history.length > 5) {
      // Check if we've been stable at high performance
      const recentMetrics = history.slice(-5);
      const allHigh = recentMetrics.every(m => m.qualityLevel === 'HIGH');

      if (allHigh) {
        restoreFullPerformance();
      }
    }
  }, [enableAutoOptimization, emergencyPerformanceMode, restoreFullPerformance, history, onPerformanceAlert]);

  // Update performance metrics
  const updateMetrics = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;

    if (deltaTime >= updateInterval) {
      const fps = (frameCountRef.current * 1000) / deltaTime;
      const memoryUsage = estimateMemoryUsage();
      const cpuUsage = estimateCPUUsage();
      const gpuMemory = estimateGPUMemory();
      const animationMetrics = getPerformanceMetrics();
      const resourceStats = resourcePool.getAllStats();

      // Calculate average render time
      const avgRenderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((a, b) => a + b) / renderTimesRef.current.length
        : 16.67;

      const currentMetrics: PerformanceMetrics = {
        fps: fps,
        averageFPS: animationMetrics.averageFPS,
        memoryUsage,
        renderTime: avgRenderTime,
        frameDrops: frameDropsRef.current,
        animationCount: animationMetrics.enabledCallbacks,
        resourceStats,
        cpuUsage,
        gpuMemory,
        timestamp: now,
        qualityLevel: 'HIGH', // Will be updated below
      };

      currentMetrics.qualityLevel = determineQualityLevel(currentMetrics);

      setMetrics(currentMetrics);

      // Update history
      setHistory(prev => {
        const newHistory = [...prev, currentMetrics];
        return newHistory.slice(-historySize);
      });

      // Handle auto-optimization
      handleAutoOptimization(currentMetrics);

      // Reset counters
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      renderTimesRef.current = [];
      frameDropsRef.current = 0;
    }
  }, [updateInterval, estimateMemoryUsage, estimateCPUUsage, estimateGPUMemory, getPerformanceMetrics, resourcePool, determineQualityLevel, handleAutoOptimization, historySize]);

  // Frame tracking
  const trackFrame = useCallback((renderTime?: number) => {
    frameCountRef.current++;

    if (renderTime) {
      renderTimesRef.current.push(renderTime);

      // Track frame drops (render time > 33ms = dropped frame at 30fps)
      if (renderTime > 33) {
        frameDropsRef.current++;
      }
    }
  }, []);

  // Start monitoring
  useEffect(() => {
    const interval = setInterval(updateMetrics, updateInterval);

    // Initial update
    updateMetrics();

    return () => {
      clearInterval(interval);
    };
  }, [updateMetrics, updateInterval]);

  // Performance summary calculations
  const summary = useMemo(() => {
    if (history.length === 0) return null;

    const recent = history.slice(-10);
    const avgFPS = recent.reduce((sum, m) => sum + m.fps, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length;
    const totalFrameDrops = recent.reduce((sum, m) => sum + m.frameDrops, 0);

    return {
      averageFPS: avgFPS,
      averageMemory: avgMemory,
      totalFrameDrops,
      qualityTrend: recent.length >= 5 ?
        (recent.slice(-3).every(m => m.qualityLevel === 'HIGH') ? 'improving' :
         recent.slice(-3).every(m => m.qualityLevel === 'CRITICAL') ? 'declining' : 'stable') : 'stable'
    };
  }, [history]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Manual optimization controls
  const forceOptimization = useCallback(() => {
    emergencyPerformanceMode();
  }, [emergencyPerformanceMode]);

  const resetOptimization = useCallback(() => {
    restoreFullPerformance();
  }, [restoreFullPerformance]);

  return {
    metrics,
    history,
    summary,
    alerts,
    trackFrame,
    clearAlerts,
    forceOptimization,
    resetOptimization,
  };
}

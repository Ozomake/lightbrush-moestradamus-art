import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animation priority levels for performance optimization
export enum AnimationPriority {
  CRITICAL = 0,    // Always runs (UI elements, main interactions)
  HIGH = 1,        // Important animations (hero elements, primary content)
  MEDIUM = 2,      // Secondary animations (background effects)
  LOW = 3,         // Optional effects (particles, ambient animations)
}

// Performance thresholds for adaptive quality
const PERFORMANCE_THRESHOLDS = {
  HIGH_FPS: 55,
  MEDIUM_FPS: 40,
  LOW_FPS: 25,
};

// Animation callback interface
export interface AnimationCallback {
  id: string;
  priority: AnimationPriority;
  callback: (state: any, delta: number) => void;
  enabled: boolean;
  lastExecuted: number;
  targetFPS?: number;
}

// Centralized animation manager singleton
class AnimationManagerCore {
  private callbacks = new Map<string, AnimationCallback>();
  private performanceMetrics = {
    currentFPS: 60,
    averageFPS: 60,
    frameTime: 16.67,
    droppedFrames: 0,
  };
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private performanceHistory: number[] = [];
  private adaptiveQualityLevel = 3; // 0 = lowest, 3 = highest

  // Register an animation callback
  register(
    id: string,
    callback: (state: any, delta: number) => void,
    priority: AnimationPriority = AnimationPriority.MEDIUM,
    targetFPS?: number
  ): () => void {
    const animationCallback: AnimationCallback = {
      id,
      priority,
      callback,
      enabled: true,
      lastExecuted: 0,
      targetFPS,
    };

    this.callbacks.set(id, animationCallback);

    // Return unregister function
    return () => {
      this.callbacks.delete(id);
    };
  }

  // Update performance metrics and execute callbacks
  update(state: any, delta: number): void {
    const now = performance.now();

    // Update performance metrics
    this.updatePerformanceMetrics(now, delta);

    // Adjust quality based on performance
    this.adjustAdaptiveQuality();

    // Sort callbacks by priority and execute
    const sortedCallbacks = Array.from(this.callbacks.values())
      .filter(cb => cb.enabled)
      .sort((a, b) => a.priority - b.priority);

    let executedCallbacks = 0;
    const maxCallbacks = this.getMaxCallbacksForCurrentPerformance();

    for (const callback of sortedCallbacks) {
      if (executedCallbacks >= maxCallbacks && callback.priority > AnimationPriority.HIGH) {
        break; // Skip lower priority animations if performance is poor
      }

      if (this.shouldExecuteCallback(callback, now)) {
        try {
          callback.callback(state, delta);
          callback.lastExecuted = now;
          executedCallbacks++;
        } catch (error) {
          console.warn(`Animation callback ${callback.id} failed:`, error);
        }
      }
    }
  }

  private updatePerformanceMetrics(now: number, delta: number): void {
    this.frameCount++;
    const frameTime = delta * 1000;
    this.performanceMetrics.frameTime = frameTime;
    this.performanceMetrics.currentFPS = 1000 / frameTime;

    // Update average FPS every second
    if (now - this.lastFPSUpdate > 1000) {
      const fps = (this.frameCount * 1000) / (now - this.lastFPSUpdate);
      this.performanceMetrics.averageFPS = fps;

      this.performanceHistory.push(fps);
      if (this.performanceHistory.length > 10) {
        this.performanceHistory.shift();
      }

      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  private adjustAdaptiveQuality(): void {
    const avgFPS = this.performanceHistory.length > 0
      ? this.performanceHistory.reduce((a, b) => a + b) / this.performanceHistory.length
      : this.performanceMetrics.averageFPS;

    if (avgFPS > PERFORMANCE_THRESHOLDS.HIGH_FPS) {
      this.adaptiveQualityLevel = 3; // High quality
    } else if (avgFPS > PERFORMANCE_THRESHOLDS.MEDIUM_FPS) {
      this.adaptiveQualityLevel = 2; // Medium quality
    } else if (avgFPS > PERFORMANCE_THRESHOLDS.LOW_FPS) {
      this.adaptiveQualityLevel = 1; // Low quality
    } else {
      this.adaptiveQualityLevel = 0; // Minimal quality
    }
  }

  private getMaxCallbacksForCurrentPerformance(): number {
    switch (this.adaptiveQualityLevel) {
      case 3: return Number.MAX_SAFE_INTEGER; // No limit at high performance
      case 2: return 15; // Moderate limiting
      case 1: return 8;  // Aggressive limiting
      case 0: return 4;  // Very aggressive limiting
      default: return 10;
    }
  }

  private shouldExecuteCallback(callback: AnimationCallback, now: number): boolean {
    if (!callback.targetFPS) return true;

    const targetInterval = 1000 / callback.targetFPS;
    return (now - callback.lastExecuted) >= targetInterval;
  }

  // Enable/disable specific animations for performance control
  setCallbackEnabled(id: string, enabled: boolean): void {
    const callback = this.callbacks.get(id);
    if (callback) {
      callback.enabled = enabled;
    }
  }

  // Get current performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      qualityLevel: this.adaptiveQualityLevel,
      activeCallbacks: this.callbacks.size,
      enabledCallbacks: Array.from(this.callbacks.values()).filter(cb => cb.enabled).length,
    };
  }

  // Batch disable animations by priority for emergency performance recovery
  disableAnimationsByPriority(maxPriority: AnimationPriority): void {
    for (const callback of this.callbacks.values()) {
      if (callback.priority > maxPriority) {
        callback.enabled = false;
      }
    }
  }

  // Re-enable all animations
  enableAllAnimations(): void {
    for (const callback of this.callbacks.values()) {
      callback.enabled = true;
    }
  }
}

// Singleton instance
const animationManager = new AnimationManagerCore();

// React hook for using the animation manager
export function useAnimationManager() {
  const managerRef = useRef(animationManager);

  // Main animation loop - consolidates all useFrame calls
  useFrame((state, delta) => {
    managerRef.current.update(state, delta);
  });

  const registerAnimation = useCallback(
    (
      id: string,
      callback: (state: any, delta: number) => void,
      priority: AnimationPriority = AnimationPriority.MEDIUM,
      targetFPS?: number
    ) => {
      return managerRef.current.register(id, callback, priority, targetFPS);
    },
    []
  );

  const getPerformanceMetrics = useCallback(() => {
    return managerRef.current.getPerformanceMetrics();
  }, []);

  const setAnimationEnabled = useCallback((id: string, enabled: boolean) => {
    managerRef.current.setCallbackEnabled(id, enabled);
  }, []);

  const emergencyPerformanceMode = useCallback(() => {
    managerRef.current.disableAnimationsByPriority(AnimationPriority.HIGH);
  }, []);

  const restoreFullPerformance = useCallback(() => {
    managerRef.current.enableAllAnimations();
  }, []);

  return {
    registerAnimation,
    getPerformanceMetrics,
    setAnimationEnabled,
    emergencyPerformanceMode,
    restoreFullPerformance,
  };
}

// Specialized hook for registering individual animations
export function useAnimationRegistration(
  id: string,
  callback: (state: any, delta: number) => void,
  priority: AnimationPriority = AnimationPriority.MEDIUM,
  targetFPS?: number,
  dependencies: any[] = []
) {
  const { registerAnimation } = useAnimationManager();

  const memoizedCallback = useCallback(callback, dependencies);

  const unregister = useMemo(() => {
    return registerAnimation(id, memoizedCallback, priority, targetFPS);
  }, [id, memoizedCallback, priority, targetFPS, registerAnimation]);

  // Cleanup on unmount
  return unregister;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const { getPerformanceMetrics } = useAnimationManager();

  const metrics = useMemo(() => getPerformanceMetrics(), [getPerformanceMetrics]);

  return metrics;
}

export default animationManager;
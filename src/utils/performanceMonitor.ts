/**
 * Performance monitoring utility for tracking application metrics
 */

interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  renderTime: number;
  componentMountTime: Map<string, number>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fpsUpdateInterval: number = 1000; // Update FPS every second

  private constructor() {
    this.metrics = {
      fps: 0,
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      },
      renderTime: 0,
      componentMountTime: new Map(),
    };

    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private startMonitoring(): void {
    this.measureFPS();
    this.measureMemory();
  }

  private measureFPS(): void {
    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + this.fpsUpdateInterval) {
      this.metrics.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  private measureMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        }
      }).memory;
      if (memory) {
        this.metrics.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    }

    setTimeout(() => this.measureMemory(), 5000); // Update every 5 seconds
  }

  measureComponentMount(componentName: string, mountTime: number): void {
    this.metrics.componentMountTime.set(componentName, mountTime);
  }

  measureRenderTime(time: number): void {
    this.metrics.renderTime = time;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getReport(): string {
    const metrics = this.getMetrics();
    const memoryUsage = metrics.memory.usedJSHeapSize
      ? `${(metrics.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`
      : 'N/A';

    return `
Performance Report:
- FPS: ${metrics.fps}
- Memory Usage: ${memoryUsage}
- Render Time: ${metrics.renderTime.toFixed(2)}ms
- Component Mount Times: ${
      Array.from(metrics.componentMountTime.entries())
        .map(([name, time]) => `${name}: ${time.toFixed(2)}ms`)
        .join(', ') || 'None recorded'
    }
    `;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

import { useEffect } from 'react';

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const mountTime = performance.now();

  useEffect(() => {
    const elapsedTime = performance.now() - mountTime;
    performanceMonitor.measureComponentMount(componentName, elapsedTime);
  }, [componentName, mountTime]);

  return performanceMonitor.getMetrics();
}
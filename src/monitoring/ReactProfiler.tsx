import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react';
import { performanceMonitor } from './PerformanceMonitor';

interface ProfilerProps {
  id: string;
  children: ReactNode;
  onRender?: ProfilerOnRenderCallback;
}

interface RenderMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

class ReactProfilerManager {
  private renderMetrics: Map<string, RenderMetrics[]> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public onRender: ProfilerOnRenderCallback = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any,
    startTime: any,
    commitTime: any,
    interactions: any
  ) => {
    if (!this.isEnabled) return;

    const metrics: RenderMetrics = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    };

    // Store metrics
    if (!this.renderMetrics.has(id)) {
      this.renderMetrics.set(id, []);
    }
    this.renderMetrics.get(id)!.push(metrics);

    // Log slow renders
    if (actualDuration > 16) { // Slower than 60fps
      console.warn(`🐌 Slow render detected in ${id}:`, {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        interactions: interactions.size
      });
    }

    // Add to performance monitor
    performanceMonitor.addMetric({
      name: `react-render-${id}`,
      value: actualDuration,
      timestamp: Date.now(),
      type: 'custom',
      metadata: {
        phase,
        baseDuration,
        interactions: interactions.size,
        component: id
      }
    });

    // Log render summary periodically
    this.logRenderSummary(id);
  };

  public getMetrics(id?: string): RenderMetrics[] {
    if (id) {
      return this.renderMetrics.get(id) || [];
    }
    return Array.from(this.renderMetrics.values()).flat();
  }

  public clearMetrics(): void {
    this.renderMetrics.clear();
  }

  public getComponentStats(id: string): ComponentStats | null {
    const metrics = this.renderMetrics.get(id);
    if (!metrics || metrics.length === 0) return null;

    const actualDurations = metrics.map(m => m.actualDuration);
    const baseDurations = metrics.map(m => m.baseDuration);

    return {
      id,
      totalRenders: metrics.length,
      mountRenders: metrics.filter(m => m.phase === 'mount').length,
      updateRenders: metrics.filter(m => m.phase === 'update').length,
      avgActualDuration: actualDurations.reduce((a, b) => a + b, 0) / actualDurations.length,
      maxActualDuration: Math.max(...actualDurations),
      minActualDuration: Math.min(...actualDurations),
      avgBaseDuration: baseDurations.reduce((a, b) => a + b, 0) / baseDurations.length,
      slowRenders: metrics.filter(m => m.actualDuration > 16).length
    };
  }

  private logRenderSummary(id: string): void {
    const metrics = this.renderMetrics.get(id);
    if (!metrics || metrics.length % 10 !== 0) return; // Log every 10 renders

    const stats = this.getComponentStats(id);
    if (stats) {
      console.group(`📈 ${id} Render Stats (${stats.totalRenders} renders)`);
      console.log(`Average Duration: ${stats.avgActualDuration.toFixed(2)}ms`);
      console.log(`Max Duration: ${stats.maxActualDuration.toFixed(2)}ms`);
      console.log(`Slow Renders: ${stats.slowRenders}/${stats.totalRenders}`);
      console.log(`Mount/Update: ${stats.mountRenders}/${stats.updateRenders}`);
      console.groupEnd();
    }
  }
}

interface ComponentStats {
  id: string;
  totalRenders: number;
  mountRenders: number;
  updateRenders: number;
  avgActualDuration: number;
  maxActualDuration: number;
  minActualDuration: number;
  avgBaseDuration: number;
  slowRenders: number;
}

const profilerManager = new ReactProfilerManager();

// High-order component for automatic profiling
export function withProfiler<T extends object>(
  Component: React.ComponentType<T>,
  id?: string
): React.ComponentType<T> {
  const componentName = id || Component.displayName || Component.name || 'Anonymous';

  const ProfiledComponent = (props: T) => (
    <Profiler id={componentName} onRender={profilerManager.onRender}>
      <Component {...props} />
    </Profiler>
  );

  ProfiledComponent.displayName = `withProfiler(${componentName})`;
  return ProfiledComponent;
}

// Performance profiler component
export function PerformanceProfiler({ id, children, onRender }: ProfilerProps) {
  const handleRender: ProfilerOnRenderCallback = (...args) => {
    profilerManager.onRender(...args);
    if (onRender) {
      onRender(...args);
    }
  };

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}

// Hook for performance marks
export function usePerformanceMark() {
  const markStart = (name: string) => {
    performanceMonitor.markStart(name);
  };

  const markEnd = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.markEnd(name, metadata);
  };

  const measureAsync = async <T,>(
    name: string,
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    markStart(name);
    try {
      const result = await asyncFn();
      markEnd(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      markEnd(name, { ...metadata, success: false, error: String(error) });
      throw error;
    }
  };

  const measureSync = <T,>(
    name: string,
    syncFn: () => T,
    metadata?: Record<string, any>
  ): T => {
    markStart(name);
    try {
      const result = syncFn();
      markEnd(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      markEnd(name, { ...metadata, success: false, error: String(error) });
      throw error;
    }
  };

  return {
    markStart,
    markEnd,
    measureAsync,
    measureSync
  };
}

export { profilerManager };
export type { RenderMetrics, ComponentStats };
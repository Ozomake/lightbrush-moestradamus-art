interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'paint' | 'layout' | 'custom' | 'memory' | 'fps';
  metadata?: Record<string, any>;
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  errors: ErrorData[];
  webVitals: WebVitalsData;
}

interface ErrorData {
  message: string;
  stack?: string;
  timestamp: number;
  type: 'javascript' | 'network' | 'webgl' | 'promise';
  metadata?: Record<string, any>;
}

interface WebVitalsData {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorData[] = [];
  private webVitals: WebVitalsData = {};
  private observers: PerformanceObserver[] = [];
  private fpsCounter: FPSCounter;
  private memoryMonitor: MemoryMonitor;
  private isEnabled: boolean = false;

  constructor() {
    this.fpsCounter = new FPSCounter();
    this.memoryMonitor = new MemoryMonitor();
  }

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    this.setupPerformanceObservers();
    this.setupErrorHandlers();
    this.collectWebVitals();
    this.fpsCounter.start();
    this.memoryMonitor.start();

    // Log initial page load metrics
    this.logPageLoadMetrics();
  }

  public disable(): void {
    this.isEnabled = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.fpsCounter.stop();
    this.memoryMonitor.stop();
  }

  public markStart(name: string): void {
    if (!this.isEnabled) return;
    performance.mark(`${name}-start`);
  }

  public markEnd(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;

    performance.mark(endMark);
    performance.measure(measureName, `${name}-start`, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    this.addMetric({
      name,
      value: measure.duration,
      timestamp: Date.now(),
      type: 'custom',
      metadata
    });
  }

  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.logMetric(metric);
  }

  public addError(error: ErrorData): void {
    this.errors.push(error);
    this.logError(error);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getErrors(): ErrorData[] {
    return [...this.errors];
  }

  public getPerformanceData(): PerformanceData {
    return {
      metrics: this.getMetrics(),
      errors: this.getErrors(),
      webVitals: { ...this.webVitals }
    };
  }

  public clearData(): void {
    this.metrics = [];
    this.errors = [];
    this.webVitals = {};
  }

  private setupPerformanceObservers(): void {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.addMetric({
              name: 'domContentLoaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
              timestamp: Date.now(),
              type: 'navigation'
            });
            this.addMetric({
              name: 'loadComplete',
              value: navEntry.loadEventEnd - navEntry.navigationStart,
              timestamp: Date.now(),
              type: 'navigation'
            });
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addMetric({
            name: entry.name.replace('first-', '').replace('-paint', ''),
            value: entry.startTime,
            timestamp: Date.now(),
            type: 'paint'
          });
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Layout shift
      const layoutObserver = new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        for (const entry of list.getEntries()) {
          if ('value' in entry && !entry.hadRecentInput) {
            cumulativeScore += entry.value as number;
          }
        }
        if (cumulativeScore > 0) {
          this.webVitals.cls = (this.webVitals.cls || 0) + cumulativeScore;
          this.addMetric({
            name: 'cumulativeLayoutShift',
            value: cumulativeScore,
            timestamp: Date.now(),
            type: 'layout'
          });
        }
      });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.webVitals.lcp = lastEntry.startTime;
        this.addMetric({
          name: 'largestContentfulPaint',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          type: 'paint'
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }
  }

  private setupErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.addError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        type: 'javascript',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        message: String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        type: 'promise',
        metadata: {
          promise: event.promise
        }
      });
    });
  }

  private collectWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.fcp = entry.startTime;
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }

    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      this.webVitals.ttfb = navEntry.responseStart - navEntry.requestStart;
    }
  }

  private logPageLoadMetrics(): void {
    setTimeout(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        console.group('🚀 Page Load Performance');
        console.log(`DNS Lookup: ${(navEntry.domainLookupEnd - navEntry.domainLookupStart).toFixed(2)}ms`);
        console.log(`TCP Connection: ${(navEntry.connectEnd - navEntry.connectStart).toFixed(2)}ms`);
        console.log(`Request/Response: ${(navEntry.responseEnd - navEntry.requestStart).toFixed(2)}ms`);
        console.log(`DOM Processing: ${(navEntry.domContentLoadedEventEnd - navEntry.responseEnd).toFixed(2)}ms`);
        console.log(`Total Load Time: ${(navEntry.loadEventEnd - navEntry.navigationStart).toFixed(2)}ms`);
        console.groupEnd();
      }
    }, 1000);
  }

  private logMetric(metric: PerformanceMetric): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metric.name}: ${metric.value.toFixed(2)}ms`, metric.metadata || '');
    }
  }

  private logError(error: ErrorData): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 ${error.type} error:`, error.message, error.metadata || '');
    }
  }
}

class FPSCounter {
  private fps: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private running: boolean = false;
  private callback?: (fps: number) => void;

  public start(callback?: (fps: number) => void): void {
    this.running = true;
    this.callback = callback;
    this.lastTime = performance.now();
    this.tick();
  }

  public stop(): void {
    this.running = false;
  }

  public getFPS(): number {
    return this.fps;
  }

  private tick = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.callback) {
        this.callback(this.fps);
      }
    }

    requestAnimationFrame(this.tick);
  };
}

class MemoryMonitor {
  private interval?: NodeJS.Timeout;
  private callback?: (memory: MemoryInfo) => void;

  public start(callback?: (memory: MemoryInfo) => void): void {
    this.callback = callback;
    this.interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (this.callback) {
          this.callback(memory);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  public getCurrentMemory(): MemoryInfo | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

export type {
  PerformanceMetric,
  PerformanceData,
  ErrorData,
  WebVitalsData,
  MemoryInfo
};

export {
  PerformanceMonitor,
  FPSCounter,
  MemoryMonitor
};
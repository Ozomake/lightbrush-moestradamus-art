// Monitoring System Initialization
import { performanceMonitor } from './PerformanceMonitor';
// Lazy import Three.js monitor to avoid bundling Three.js in initial load
import { networkMonitor } from './NetworkMonitor';

interface MonitoringConfig {
  enablePerformanceMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  enableThreeJSMonitoring?: boolean;
  enableErrorReporting?: boolean;
  developmentOnly?: boolean;
}

class MonitoringSystem {
  private isInitialized: boolean = false;
  private config: MonitoringConfig = {};

  public initialize(config: MonitoringConfig = {}): void {
    if (this.isInitialized) {
      console.warn('Monitoring system already initialized');
      return;
    }

    this.config = {
      enablePerformanceMonitoring: true,
      enableNetworkMonitoring: true,
      enableThreeJSMonitoring: true,
      enableErrorReporting: true,
      developmentOnly: false,
      ...config
    };

    // Skip initialization in production if developmentOnly is true
    if (this.config.developmentOnly && process.env.NODE_ENV === 'production') {
      return;
    }

    console.group('🔧 Initializing Performance Monitoring System');

    if (this.config.enablePerformanceMonitoring) {
      performanceMonitor.enable();
      console.log('✅ Performance monitoring enabled');
    }

    if (this.config.enableNetworkMonitoring) {
      networkMonitor.enable();
      console.log('✅ Network monitoring enabled');
    }

    if (this.config.enableThreeJSMonitoring) {
      // Three.js monitoring will be enabled when a renderer is provided
      console.log('✅ Three.js monitoring ready');
    }

    console.groupEnd();

    this.isInitialized = true;

    // Set up periodic reporting in development
    if (process.env.NODE_ENV === 'development') {
      this.setupDevelopmentReporting();
    }
  }

  public async enableThreeJSMonitoring(renderer: any): Promise<void> {
    if (this.config.enableThreeJSMonitoring) {
      // Dynamically import Three.js monitor only when needed
      const { threeJSMonitor } = await import('./ThreeJSMonitor');
      threeJSMonitor.enable(renderer);
      console.log('🎮 Three.js monitoring enabled for renderer');
    }
  }

  public getSystemStatus(): SystemStatus {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      performance: {
        enabled: this.isInitialized && this.config.enablePerformanceMonitoring,
        metricsCount: performanceMonitor.getMetrics().length,
        errorsCount: performanceMonitor.getErrors().length
      },
      network: {
        enabled: this.isInitialized && this.config.enableNetworkMonitoring,
        ...networkMonitor.getMetrics()
      },
      threeJS: {
        enabled: this.isInitialized && this.config.enableThreeJSMonitoring,
        metrics: threeJSMonitor.getMetrics()
      }
    };
  }

  public generateReport(): MonitoringReport {
    const status = this.getSystemStatus();
    const performanceData = performanceMonitor.getPerformanceData();
    const networkData = networkMonitor.getMetrics();
    const threeJSData = threeJSMonitor.getMetrics();

    return {
      timestamp: Date.now(),
      systemStatus: status,
      performance: {
        webVitals: performanceData.webVitals,
        recentMetrics: performanceData.metrics.slice(-20),
        criticalErrors: performanceData.errors.filter(e => e.type === 'javascript').slice(-10)
      },
      network: {
        ...networkData,
        recentErrors: networkMonitor.getErrors().slice(-10)
      },
      threeJS: threeJSData,
      recommendations: this.generateRecommendations(performanceData, networkData, threeJSData)
    };
  }

  private setupDevelopmentReporting(): void {
    // Log summary every 30 seconds in development
    setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        this.logPerformanceSummary();
      }
    }, 30000);

    // Log detailed report every 5 minutes
    setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        const report = this.generateReport();
        console.group('📊 Performance Report');
        console.log('Web Vitals:', report.performance.webVitals);
        console.log('Network:', report.network);
        if (report.threeJS) {
          console.log('Three.js:', report.threeJS);
        }
        if (report.recommendations.length > 0) {
          console.log('Recommendations:', report.recommendations);
        }
        console.groupEnd();
      }
    }, 300000);
  }

  private logPerformanceSummary(): void {
    const status = this.getSystemStatus();
    const metrics = performanceMonitor.getMetrics();
    const recentMetrics = metrics.slice(-10);

    if (recentMetrics.length === 0) return;

    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;

    console.log(`⚡ Performance Summary: ${recentMetrics.length} recent metrics, avg ${avgDuration.toFixed(2)}ms`);

    if (status.threeJS.enabled && status.threeJS.metrics) {
      console.log(`🎮 Three.js: ${status.threeJS.metrics.fps}fps, ${status.threeJS.metrics.calls} calls`);
    }

    if (status.network.enabled) {
      console.log(`🌐 Network: ${status.network.totalRequests} requests, ${status.network.errorRate.toFixed(1)}% error rate`);
    }
  }

  private generateRecommendations(
    performanceData: any,
    networkData: any,
    threeJSData: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Performance recommendations
    if (performanceData.webVitals.lcp && performanceData.webVitals.lcp > 2500) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Large Contentful Paint is slow. Consider optimizing images and critical resources.',
        metric: 'LCP',
        value: performanceData.webVitals.lcp
      });
    }

    if (performanceData.webVitals.cls && performanceData.webVitals.cls > 0.1) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'Cumulative Layout Shift is high. Ensure proper size attributes on images and containers.',
        metric: 'CLS',
        value: performanceData.webVitals.cls
      });
    }

    // Network recommendations
    if (networkData.errorRate > 5) {
      recommendations.push({
        type: 'network',
        severity: 'high',
        message: 'High network error rate detected. Check API endpoints and error handling.',
        metric: 'Error Rate',
        value: networkData.errorRate
      });
    }

    if (networkData.averageResponseTime > 1000) {
      recommendations.push({
        type: 'network',
        severity: 'medium',
        message: 'Slow network responses. Consider API optimization or caching.',
        metric: 'Response Time',
        value: networkData.averageResponseTime
      });
    }

    // Three.js recommendations
    if (threeJSData && threeJSData.fps < 30) {
      recommendations.push({
        type: 'threejs',
        severity: 'high',
        message: 'Low FPS detected. Consider reducing geometry complexity or optimizing shaders.',
        metric: 'FPS',
        value: threeJSData.fps
      });
    }

    if (threeJSData && threeJSData.calls > 500) {
      recommendations.push({
        type: 'threejs',
        severity: 'medium',
        message: 'High draw call count. Consider batching geometries or reducing object count.',
        metric: 'Draw Calls',
        value: threeJSData.calls
      });
    }

    return recommendations;
  }

  public shutdown(): void {
    if (!this.isInitialized) return;

    performanceMonitor.disable();
    networkMonitor.disable();
    threeJSMonitor.disable();

    this.isInitialized = false;
    console.log('🔧 Monitoring system shutdown');
  }
}

interface SystemStatus {
  isInitialized: boolean;
  config: MonitoringConfig;
  performance: {
    enabled: boolean;
    metricsCount: number;
    errorsCount: number;
  };
  network: {
    enabled: boolean;
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
  };
  threeJS: {
    enabled: boolean;
    metrics: any;
  };
}

interface MonitoringReport {
  timestamp: number;
  systemStatus: SystemStatus;
  performance: {
    webVitals: any;
    recentMetrics: any[];
    criticalErrors: any[];
  };
  network: any;
  threeJS: any;
  recommendations: Recommendation[];
}

interface Recommendation {
  type: 'performance' | 'network' | 'threejs';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metric: string;
  value: number;
}

// Singleton instance
export const monitoringSystem = new MonitoringSystem();

// Convenience function for React apps
export function initializeMonitoring(config?: MonitoringConfig): void {
  monitoringSystem.initialize(config);
}

// Export everything
export * from './PerformanceMonitor';
export * from './ReactProfiler';
// ThreeJSMonitor is dynamically imported to avoid bundling Three.js upfront
export * from './NetworkMonitor';
export * from './AnalyticsDashboard';

export type {
  MonitoringConfig,
  SystemStatus,
  MonitoringReport,
  Recommendation
};
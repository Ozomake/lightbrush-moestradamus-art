# Performance & Error Monitoring System

A comprehensive monitoring solution for React applications with Three.js support, providing real-time performance tracking, error reporting, and analytics dashboard.

## Features

### 🚀 Performance Monitoring
- **React DevTools Profiler Integration**: Automatic component render tracking
- **Custom Performance Marks**: Track specific operations and code paths
- **Web Vitals Collection**: LCP, FCP, CLS, TTFB, FID metrics
- **Memory Usage Monitoring**: JavaScript heap tracking
- **Bundle Size Analysis**: Build-time bundle monitoring with performance budgets

### 🎮 Three.js Monitoring
- **FPS Tracking**: Real-time frame rate monitoring
- **WebGL Error Detection**: Automatic WebGL context error handling
- **Render Statistics**: Draw calls, triangles, geometries, textures tracking
- **Performance Warnings**: Automatic detection of performance bottlenecks

### 🌐 Network Monitoring
- **Request Tracking**: Automatic fetch/XHR interception
- **Error Detection**: Network failure and timeout tracking
- **Performance Metrics**: Response times and success rates
- **Resource Loading**: Failed asset loading detection

### 🚨 Error Tracking
- **Enhanced Error Boundaries**: Detailed error context and retry functionality
- **JavaScript Error Tracking**: Automatic error capture with stack traces
- **Promise Rejection Handling**: Unhandled promise rejection tracking
- **Error Reporting**: Structured error data with metadata

### 📊 Analytics Dashboard
- **Real-time Metrics Display**: Live performance dashboard
- **Multiple View Tabs**: Overview, Performance, Errors, Network, Three.js
- **Visual Status Indicators**: Color-coded metrics with status thresholds
- **Detailed Breakdowns**: Comprehensive metric analysis

## Quick Start

### 1. Basic Integration

```tsx
import { MonitoringProvider, DevDashboardToggle } from './monitoring/MonitoringProvider';

function App() {
  return (
    <MonitoringProvider
      config={{
        enablePerformanceMonitoring: true,
        enableNetworkMonitoring: true,
        enableThreeJSMonitoring: true,
        enableErrorReporting: true
      }}
      enableDashboard={true}
      dashboardPosition="top-right"
    >
      <YourAppContent />
      <DevDashboardToggle />
    </MonitoringProvider>
  );
}
```

### 2. Error Boundary Integration

```tsx
import ErrorBoundary from './components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary
      name="MyComponent"
      level="component"
      onError={(error, errorInfo) => {
        // Custom error handling
        console.log('Error in MyComponent:', error);
      }}
    >
      <ComponentThatMightThrow />
    </ErrorBoundary>
  );
}
```

### 3. Performance Tracking

```tsx
import { usePerformanceMark } from './monitoring/ReactProfiler';

function MyComponent() {
  const { markStart, markEnd, measureAsync } = usePerformanceMark();

  const handleExpensiveOperation = async () => {
    markStart('data-processing');

    try {
      const result = await measureAsync('api-call', async () => {
        return fetch('/api/data').then(r => r.json());
      }, { endpoint: '/api/data' });

      // Process data...
      markEnd('data-processing', { itemCount: result.length });
    } catch (error) {
      markEnd('data-processing', { success: false, error: error.message });
    }
  };

  return <button onClick={handleExpensiveOperation}>Process Data</button>;
}
```

### 4. Three.js Integration

```tsx
import { useMonitoring, ThreeJSMonitoring } from './monitoring/MonitoringProvider';

function ThreeJSScene() {
  const monitoring = useMonitoring();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;

    // Enable Three.js monitoring
    monitoring.enableThreeJSMonitoring(renderer);

    // Your Three.js setup...
  }, []);

  return (
    <ThreeJSMonitoring renderer={rendererRef.current!}>
      <div ref={mountRef} />
    </ThreeJSMonitoring>
  );
}
```

## Configuration

### Monitoring Config

```tsx
interface MonitoringConfig {
  enablePerformanceMonitoring?: boolean; // Default: true
  enableNetworkMonitoring?: boolean;     // Default: true
  enableThreeJSMonitoring?: boolean;     // Default: true
  enableErrorReporting?: boolean;        // Default: true
  developmentOnly?: boolean;             // Default: false
}
```

### Performance Budgets

```tsx
// vite.config.ts
import { bundleMonitor } from './vite-plugins/bundle-monitor';

export default defineConfig({
  plugins: [
    bundleMonitor({
      performanceBudget: {
        maxBundleSize: 2000, // KB
        maxChunkSize: 500,   // KB
        maxAssetSize: 250,   // KB
        maxJSSize: 1500,     // KB
        maxCSSSize: 100,     // KB
        maxImageSize: 500    // KB
      },
      enableReport: true,
      failOnError: false
    })
  ]
});
```

## Dashboard Features

### Overview Tab
- FPS indicator with status
- Network performance summary
- Error count display
- Memory usage visualization
- Recent error list

### Performance Tab
- Web Vitals metrics (LCP, FCP, CLS, TTFB)
- Recent performance marks
- Component render times
- Critical path analysis

### Errors Tab
- Error categorization by type
- Recent error details
- Error frequency tracking
- Stack trace analysis

### Network Tab
- Success rate monitoring
- Average response times
- Failed request tracking
- Slow request detection

### Three.js Tab
- Real-time FPS display
- Frame time analysis
- Draw call optimization
- Resource usage tracking

## Performance Thresholds

The system uses the following default thresholds:

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| FPS | ≥45 | 30-44 | <30 |
| LCP | <2.5s | 2.5-4s | >4s |
| FCP | <1.8s | 1.8-3s | >3s |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| Network Error Rate | <5% | 5-10% | >10% |
| Response Time | <500ms | 500-1000ms | >1000ms |

## Advanced Usage

### Manual Performance Tracking

```tsx
import { performanceMonitor } from './monitoring/PerformanceMonitor';

// Start tracking
performanceMonitor.markStart('custom-operation');

// Perform operation
doSomethingExpensive();

// End tracking
performanceMonitor.markEnd('custom-operation', {
  operationType: 'computation',
  dataSize: 1000
});
```

### Custom Error Reporting

```tsx
import { performanceMonitor } from './monitoring/PerformanceMonitor';

performanceMonitor.addError({
  message: 'Custom error occurred',
  timestamp: Date.now(),
  type: 'custom',
  metadata: {
    userId: 'user123',
    action: 'button-click',
    context: 'checkout-flow'
  }
});
```

### Generating Reports

```tsx
import { monitoringSystem } from './monitoring';

const report = monitoringSystem.generateReport();
console.log('Performance Report:', report);

// Report includes:
// - System status
// - Performance metrics
// - Error summary
// - Network statistics
// - Three.js metrics
// - Recommendations
```

## Development Tools

### Dashboard Toggle
```tsx
import { DevDashboardToggle } from './monitoring/MonitoringProvider';

// Adds a floating button to toggle dashboard (dev only)
<DevDashboardToggle />
```

### Performance Metrics Display
```tsx
import { PerformanceMetrics } from './monitoring/MonitoringProvider';

// Shows basic metrics overlay (dev only)
<PerformanceMetrics />
```

## Build Integration

The monitoring system includes build-time bundle analysis:

```bash
npm run build

# Output includes:
# 📦 Bundle Analysis Report
# 📊 Performance Insights
# ⚠️ Budget Violations (if any)
# 💡 Optimization Recommendations
```

## Best Practices

1. **Use Error Boundaries**: Wrap components with meaningful error boundaries
2. **Track Critical Paths**: Mark important user journeys and operations
3. **Monitor Three.js Performance**: Enable Three.js monitoring for 3D scenes
4. **Set Performance Budgets**: Configure realistic performance budgets
5. **Regular Monitoring**: Check dashboard regularly during development
6. **Production Monitoring**: Consider keeping lightweight monitoring in production

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance Impact

The monitoring system is designed to have minimal performance impact:

- ~2KB gzipped overhead
- <1ms per tracked operation
- Passive observers for most metrics
- Optional development-only mode

## Troubleshooting

### Dashboard Not Appearing
- Ensure `enableDashboard={true}` is set
- Check console for initialization errors
- Verify monitoring provider is wrapping your app

### Three.js Monitoring Not Working
- Call `enableThreeJSMonitoring(renderer)` after renderer creation
- Ensure renderer is passed to `ThreeJSMonitoring` component
- Check console for WebGL context errors

### Performance Marks Not Showing
- Verify `enablePerformanceMonitoring` is true
- Check that `markStart` and `markEnd` calls are paired
- Look for TypeScript errors in mark usage

### Bundle Analysis Issues
- Ensure Vite plugin is properly configured
- Check build output for analysis reports
- Verify performance budget configuration

## Contributing

To extend the monitoring system:

1. Add new metric types to `PerformanceMonitor.ts`
2. Extend dashboard tabs in `AnalyticsDashboard.tsx`
3. Update thresholds and recommendations
4. Add new monitoring capabilities to specific modules

## License

This monitoring system is part of the Lightbrush project and follows the same license terms.
# Hooks API Documentation

This document provides comprehensive documentation for all custom React hooks used in the LightBrush Website project.

## Table of Contents

- [useAnimationManager](#useanimationmanager)
- [useAnimationRegistration](#useanimationregistration)
- [usePerformanceMonitor](#useperformancemonitor)
- [useGameEngine](#usegameengine)
- [Animation Priority System](#animation-priority-system)
- [Performance Monitoring](#performance-monitoring)

---

## useAnimationManager

A centralized animation management hook that provides performance-optimized animation execution with priority-based scheduling.

### Usage

```tsx
import { useAnimationManager, AnimationPriority } from '../hooks/useAnimationManager';

function MyComponent() {
  const {
    registerAnimation,
    getPerformanceMetrics,
    setAnimationEnabled,
    emergencyPerformanceMode,
    restoreFullPerformance
  } = useAnimationManager();

  useEffect(() => {
    const unregister = registerAnimation(
      'my-animation',
      (state, delta) => {
        // Animation logic here
        console.log('Animation frame:', delta);
      },
      AnimationPriority.HIGH,
      30 // Target 30 FPS
    );

    return unregister; // Cleanup on unmount
  }, [registerAnimation]);

  return <div>My animated component</div>;
}
```

### API Reference

#### registerAnimation(id, callback, priority, targetFPS)

Registers an animation callback with the centralized manager.

**Parameters:**
- `id` (string): Unique identifier for the animation
- `callback` (function): Animation function `(state: any, delta: number) => void`
- `priority` (AnimationPriority): Priority level (default: MEDIUM)
- `targetFPS` (number, optional): Target frame rate for the animation

**Returns:**
- `() => void`: Unregister function to clean up the animation

#### getPerformanceMetrics()

Returns current performance metrics.

**Returns:**
```typescript
{
  currentFPS: number;
  averageFPS: number;
  frameTime: number;
  droppedFrames: number;
  qualityLevel: number;
  activeCallbacks: number;
  enabledCallbacks: number;
}
```

#### setAnimationEnabled(id, enabled)

Enable or disable a specific animation.

**Parameters:**
- `id` (string): Animation identifier
- `enabled` (boolean): Whether to enable the animation

#### emergencyPerformanceMode()

Disables all animations except CRITICAL and HIGH priority ones to improve performance.

#### restoreFullPerformance()

Re-enables all animations that were disabled by performance optimizations.

---

## useAnimationRegistration

A specialized hook for registering individual animations with automatic cleanup.

### Usage

```tsx
import { useAnimationRegistration, AnimationPriority } from '../hooks/useAnimationManager';

function AnimatedComponent({ speed = 1 }) {
  const unregister = useAnimationRegistration(
    'component-animation',
    (state, delta) => {
      // Animation logic using speed dependency
      rotationRef.current += delta * speed;
    },
    AnimationPriority.MEDIUM,
    60, // 60 FPS
    [speed] // Dependencies
  );

  // Component automatically cleans up on unmount
  return <mesh ref={rotationRef}>...</mesh>;
}
```

### API Reference

#### useAnimationRegistration(id, callback, priority, targetFPS, dependencies)

**Parameters:**
- `id` (string): Unique animation identifier
- `callback` (function): Animation callback function
- `priority` (AnimationPriority): Animation priority level
- `targetFPS` (number, optional): Target frame rate
- `dependencies` (any[]): Dependency array for callback memoization

**Returns:**
- `() => void`: Unregister function (automatically called on unmount)

---

## usePerformanceMonitor

Advanced performance monitoring hook with automatic optimization capabilities.

### Usage

```tsx
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function PerformanceWidget() {
  const {
    metrics,
    history,
    summary,
    alerts,
    trackFrame,
    clearAlerts,
    forceOptimization,
    resetOptimization
  } = usePerformanceMonitor({
    updateInterval: 1000,
    historySize: 60,
    enableAutoOptimization: true,
    onPerformanceAlert: (metrics) => {
      console.warn('Performance alert:', metrics);
    }
  });

  if (!metrics) return <div>Loading performance data...</div>;

  return (
    <div className="performance-widget">
      <div>FPS: {metrics.fps.toFixed(1)}</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)} MB</div>
      <div>Quality: {metrics.qualityLevel}</div>

      {alerts.length > 0 && (
        <div className="alerts">
          {alerts.map((alert, i) => (
            <div key={i} className="alert">{alert}</div>
          ))}
          <button onClick={clearAlerts}>Clear Alerts</button>
        </div>
      )}
    </div>
  );
}
```

### API Reference

#### Configuration Options

```typescript
interface Options {
  updateInterval?: number;        // Update frequency in ms (default: 1000)
  historySize?: number;          // Number of history entries (default: 60)
  enableAutoOptimization?: boolean; // Auto-optimize on poor performance (default: true)
  onPerformanceAlert?: (metrics: PerformanceMetrics) => void; // Alert callback
}
```

#### PerformanceMetrics Interface

```typescript
interface PerformanceMetrics {
  fps: number;                   // Current FPS
  averageFPS: number;           // Average FPS over time
  memoryUsage: number;          // Estimated memory usage (MB)
  renderTime: number;           // Average render time (ms)
  frameDrops: number;           // Number of dropped frames
  animationCount: number;       // Active animation count
  resourceStats: any;          // Resource pool statistics
  cpuUsage: number;            // Estimated CPU usage percentage
  gpuMemory: number;           // Estimated GPU memory usage (MB)
  timestamp: number;           // Timestamp of measurement
  qualityLevel: string;        // 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL'
}
```

#### Return Values

- `metrics`: Current performance metrics
- `history`: Array of historical metrics
- `summary`: Performance summary over recent measurements
- `alerts`: Array of performance alert messages
- `trackFrame(renderTime?)`: Manually track a frame for performance measurement
- `clearAlerts()`: Clear all current alerts
- `forceOptimization()`: Manually trigger performance optimization
- `resetOptimization()`: Reset all performance optimizations

---

## useGameEngine

Hook for accessing game engine state and controls from the game store.

### Usage

```tsx
import { useGameEngine } from '../store/gameStore';

function GameControls() {
  const {
    isInitialized,
    isRunning,
    isPaused,
    startGame,
    pauseGame,
    resumeGame,
    stopGame
  } = useGameEngine();

  return (
    <div className="game-controls">
      <button
        onClick={startGame}
        disabled={!isInitialized || isRunning}
      >
        Start Game
      </button>

      <button
        onClick={isRunning && !isPaused ? pauseGame : resumeGame}
        disabled={!isRunning}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>

      <button
        onClick={stopGame}
        disabled={!isRunning}
      >
        Stop Game
      </button>
    </div>
  );
}
```

### API Reference

**Returns:**
```typescript
{
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
}
```

---

## Animation Priority System

The animation system uses a priority-based approach to ensure smooth performance across different device capabilities.

### Priority Levels

```typescript
enum AnimationPriority {
  CRITICAL = 0,    // Always runs (UI elements, main interactions)
  HIGH = 1,        // Important animations (hero elements, primary content)
  MEDIUM = 2,      // Secondary animations (background effects)
  LOW = 3,         // Optional effects (particles, ambient animations)
}
```

### Performance Thresholds

The system automatically adjusts animation execution based on these thresholds:

```typescript
const PERFORMANCE_THRESHOLDS = {
  HIGH_FPS: 55,    // Above this: full quality
  MEDIUM_FPS: 40,  // Above this: medium quality
  LOW_FPS: 25,     // Above this: low quality
                   // Below this: critical mode
};
```

### Adaptive Quality Levels

- **Level 3 (High)**: No animation limits, all effects enabled
- **Level 2 (Medium)**: Moderate limiting, up to 15 animations per frame
- **Level 1 (Low)**: Aggressive limiting, up to 8 animations per frame
- **Level 0 (Critical)**: Emergency mode, up to 4 animations per frame

---

## Performance Monitoring

### Quality Level Determination

Performance quality is determined by three factors:

1. **FPS**: Frame rate measurement
2. **Memory Usage**: RAM consumption estimation
3. **Render Time**: Average frame render time

### Memory Estimation

The system estimates memory usage through multiple methods:

1. **Browser Memory API**: When available, uses `performance.memory`
2. **Resource-based Estimation**: Calculates based on loaded geometries, materials, and textures
3. **Fallback Estimation**: Conservative estimates based on resource counts

### CPU Usage Estimation

CPU usage is estimated by performing a standardized computation and measuring execution time:

```javascript
// Standardized CPU test
let sum = 0;
for (let i = 0; i < 1000; i++) {
  sum += Math.sin(i) * Math.cos(i);
}
// Duration normalized to percentage
```

### Auto-Optimization Triggers

- **CRITICAL Performance**: Automatically enables emergency performance mode
- **HIGH Performance (Sustained)**: Automatically restores full performance after 5 consecutive high-performance measurements
- **Performance Alerts**: Configurable callback for custom handling

---

## Best Practices

### Animation Registration

1. **Use Unique IDs**: Ensure animation IDs are unique across your application
2. **Clean Up**: Always return and use the unregister function
3. **Choose Appropriate Priority**: Use the correct priority level for your animation's importance
4. **Target FPS**: Set realistic target frame rates based on animation complexity

### Performance Monitoring

1. **Enable Auto-Optimization**: Let the system handle performance adjustments automatically
2. **Monitor Alerts**: Implement alert handling for user feedback
3. **Track Custom Frames**: Use `trackFrame()` for measuring specific rendering operations
4. **Historical Analysis**: Use the history data for performance trend analysis

### Memory Management

1. **Monitor Memory Usage**: Keep track of memory consumption, especially in long-running sessions
2. **Resource Cleanup**: Ensure proper cleanup of Three.js resources
3. **Texture Optimization**: Monitor texture memory usage as it's typically the largest consumer

---

## Examples

### Complex Animation with Performance Monitoring

```tsx
function AdvancedAnimatedComponent() {
  const { registerAnimation, getPerformanceMetrics } = useAnimationManager();
  const { trackFrame } = usePerformanceMonitor();
  const meshRef = useRef();

  useEffect(() => {
    const unregister = registerAnimation(
      'advanced-rotation',
      (state, delta) => {
        const startTime = performance.now();

        if (meshRef.current) {
          meshRef.current.rotation.y += delta * 0.5;
          meshRef.current.rotation.x += delta * 0.2;
        }

        const renderTime = performance.now() - startTime;
        trackFrame(renderTime);
      },
      AnimationPriority.HIGH,
      60
    );

    return unregister;
  }, [registerAnimation, trackFrame]);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

### Performance-Aware Component

```tsx
function PerformanceAwareEffect() {
  const { metrics } = usePerformanceMonitor();
  const { registerAnimation } = useAnimationManager();

  const effectIntensity = useMemo(() => {
    if (!metrics) return 1;

    switch (metrics.qualityLevel) {
      case 'HIGH': return 1.0;
      case 'MEDIUM': return 0.7;
      case 'LOW': return 0.4;
      case 'CRITICAL': return 0.1;
      default: return 0.5;
    }
  }, [metrics?.qualityLevel]);

  useEffect(() => {
    const unregister = registerAnimation(
      'adaptive-effect',
      (state, delta) => {
        // Adjust effect based on performance
        const adjustedDelta = delta * effectIntensity;
        // Apply effect with adjusted intensity
      },
      AnimationPriority.LOW
    );

    return unregister;
  }, [registerAnimation, effectIntensity]);

  return <EffectComponent intensity={effectIntensity} />;
}
```

This documentation provides a complete reference for all animation and performance monitoring hooks in the LightBrush Website project. Use these hooks to create smooth, performance-optimized animations that adapt to different device capabilities.
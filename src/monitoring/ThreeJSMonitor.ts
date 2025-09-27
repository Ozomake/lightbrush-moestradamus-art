import { performanceMonitor } from './PerformanceMonitor';

interface ThreeJSMetrics {
  fps: number;
  frameTime: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  calls: number;
  memory: {
    geometries: number;
    textures: number;
  };
}

interface WebGLErrorData {
  error: number;
  errorName: string;
  context: string;
  timestamp: number;
  stackTrace?: string;
}

class ThreeJSMonitor {
  private isEnabled: boolean = false;
  private renderer?: any;
  private stats?: any;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private animationId?: number;
  private webglErrorHandler?: (event: Event) => void;

  public enable(renderer?: any): void {
    this.isEnabled = true;
    this.renderer = renderer;

    if (renderer) {
      this.setupWebGLErrorHandling(renderer);
      this.startFrameMonitoring();
    }

    this.setupWebGLContextErrorHandling();
  }

  public disable(): void {
    this.isEnabled = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }

    this.removeWebGLErrorHandling();
  }

  public updateRenderer(renderer: any): void {
    this.renderer = renderer;
    if (this.isEnabled) {
      this.setupWebGLErrorHandling(renderer);
    }
  }

  public getMetrics(): ThreeJSMetrics | null {
    if (!this.renderer) return null;

    const info = this.renderer.info;

    return {
      fps: this.getCurrentFPS(),
      frameTime: this.getCurrentFrameTime(),
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs ? info.programs.length : 0,
      calls: info.render.calls,
      memory: {
        geometries: info.memory.geometries,
        textures: info.memory.textures
      }
    };
  }

  public logPerformanceStats(): void {
    if (!this.isEnabled || process.env.NODE_ENV !== 'development') return;

    const metrics = this.getMetrics();
    if (metrics) {
      console.group('🎮 Three.js Performance');
      console.log(`FPS: ${metrics.fps}`);
      console.log(`Frame Time: ${metrics.frameTime.toFixed(2)}ms`);
      console.log(`Draw Calls: ${metrics.calls}`);
      console.log(`Triangles: ${metrics.triangles.toLocaleString()}`);
      console.log(`Geometries: ${metrics.geometries}`);
      console.log(`Textures: ${metrics.textures}`);
      console.groupEnd();
    }
  }

  private startFrameMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      if (!this.isEnabled) return;

      frameCount++;
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // Update frame time history
      this.frameTimeHistory.push(deltaTime);
      if (this.frameTimeHistory.length > 60) {
        this.frameTimeHistory.shift();
      }

      // Calculate FPS every second
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.fpsHistory.push(fps);

        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        // Log performance metrics
        performanceMonitor.addMetric({
          name: 'threejs-fps',
          value: fps,
          timestamp: Date.now(),
          type: 'fps'
        });

        performanceMonitor.addMetric({
          name: 'threejs-frame-time',
          value: this.getCurrentFrameTime(),
          timestamp: Date.now(),
          type: 'custom'
        });

        // Warn about low FPS
        if (fps < 30 && process.env.NODE_ENV === 'development') {
          console.warn(`🐌 Low Three.js FPS detected: ${fps}fps`);
        }

        frameCount = 0;
        lastTime = currentTime;

        // Log detailed stats every 10 seconds
        if (Date.now() % 10000 < 1000) {
          this.logPerformanceStats();
        }
      }

      this.animationId = requestAnimationFrame(tick);
    };

    this.animationId = requestAnimationFrame(tick);
  }

  private setupWebGLErrorHandling(renderer: any): void {
    if (!renderer.getContext) return;

    const gl = renderer.getContext();
    if (!gl) return;

    // Wrap WebGL functions to catch errors
    this.wrapWebGLFunction(gl, 'drawArrays');
    this.wrapWebGLFunction(gl, 'drawElements');
    this.wrapWebGLFunction(gl, 'useProgram');
    this.wrapWebGLFunction(gl, 'bindTexture');
    this.wrapWebGLFunction(gl, 'bindBuffer');
  }

  private wrapWebGLFunction(gl: WebGLRenderingContext, functionName: string): void {
    const originalFunction = (gl as any)[functionName];
    if (!originalFunction) return;

    (gl as any)[functionName] = (...args: any[]) => {
      const result = originalFunction.apply(gl, args);

      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        this.handleWebGLError(error, functionName, gl);
      }

      return result;
    };
  }

  private setupWebGLContextErrorHandling(): void {
    this.webglErrorHandler = (event: Event) => {
      const webglEvent = event as any;
      performanceMonitor.addError({
        message: `WebGL context lost: ${webglEvent.statusMessage || 'Unknown reason'}`,
        timestamp: Date.now(),
        type: 'webgl',
        metadata: {
          statusMessage: webglEvent.statusMessage,
          type: 'context-lost'
        }
      });
    };

    window.addEventListener('webglcontextlost', this.webglErrorHandler);
  }

  private removeWebGLErrorHandling(): void {
    if (this.webglErrorHandler) {
      window.removeEventListener('webglcontextlost', this.webglErrorHandler);
      this.webglErrorHandler = undefined;
    }
  }

  private handleWebGLError(error: number, context: string, gl: WebGLRenderingContext): void {
    const errorNames: Record<number, string> = {
      [gl.NO_ERROR]: 'NO_ERROR',
      [gl.INVALID_ENUM]: 'INVALID_ENUM',
      [gl.INVALID_VALUE]: 'INVALID_VALUE',
      [gl.INVALID_OPERATION]: 'INVALID_OPERATION',
      [gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
      [gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL'
    };

    const errorName = errorNames[error] || `UNKNOWN_ERROR_${error}`;

    performanceMonitor.addError({
      message: `WebGL Error: ${errorName} in ${context}`,
      timestamp: Date.now(),
      type: 'webgl',
      metadata: {
        error,
        errorName,
        context,
        glError: error
      }
    });

    // Log stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 WebGL Error: ${errorName} in ${context}`, new Error().stack);
    }
  }

  private getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  private getCurrentFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    return this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
  }

  public getAverageFPS(samples: number = 10): number {
    const recent = this.fpsHistory.slice(-samples);
    if (recent.length === 0) return 0;
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  public getAverageFrameTime(samples: number = 60): number {
    const recent = this.frameTimeHistory.slice(-samples);
    if (recent.length === 0) return 0;
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  public checkPerformanceThresholds(): PerformanceWarning[] {
    const warnings: PerformanceWarning[] = [];
    const metrics = this.getMetrics();

    if (!metrics) return warnings;

    // FPS warnings
    if (metrics.fps < 30) {
      warnings.push({
        type: 'fps',
        severity: 'high',
        message: `Low FPS detected: ${metrics.fps}fps`,
        value: metrics.fps,
        threshold: 30
      });
    } else if (metrics.fps < 45) {
      warnings.push({
        type: 'fps',
        severity: 'medium',
        message: `Suboptimal FPS: ${metrics.fps}fps`,
        value: metrics.fps,
        threshold: 45
      });
    }

    // Draw call warnings
    if (metrics.calls > 1000) {
      warnings.push({
        type: 'draw-calls',
        severity: 'high',
        message: `High draw calls: ${metrics.calls}`,
        value: metrics.calls,
        threshold: 1000
      });
    }

    // Triangle count warnings
    if (metrics.triangles > 1000000) {
      warnings.push({
        type: 'triangles',
        severity: 'medium',
        message: `High triangle count: ${metrics.triangles.toLocaleString()}`,
        value: metrics.triangles,
        threshold: 1000000
      });
    }

    return warnings;
  }
}

interface PerformanceWarning {
  type: 'fps' | 'draw-calls' | 'triangles' | 'memory';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number;
  threshold: number;
}

// Singleton instance
export const threeJSMonitor = new ThreeJSMonitor();

export type { ThreeJSMetrics, WebGLErrorData, PerformanceWarning };
export { ThreeJSMonitor };
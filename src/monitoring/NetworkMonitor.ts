import { performanceMonitor } from './PerformanceMonitor';

interface NetworkError {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  message: string;
  timestamp: number;
  duration?: number;
  type: 'fetch' | 'xhr' | 'resource';
  metadata?: Record<string, any>;
}

interface NetworkMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
}

class NetworkMonitor {
  private errors: NetworkError[] = [];
  private requests: Map<string, RequestData> = new Map();
  private isEnabled: boolean = false;
  private originalFetch?: typeof fetch;
  private originalXHROpen?: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend?: typeof XMLHttpRequest.prototype.send;

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    this.interceptFetch();
    this.interceptXHR();
    this.setupResourceErrorHandling();
  }

  public disable(): void {
    this.isEnabled = false;
    this.restoreOriginalMethods();
  }

  public getErrors(): NetworkError[] {
    return [...this.errors];
  }

  public getMetrics(): NetworkMetrics {
    const requests = Array.from(this.requests.values());
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const responseTimes = requests.filter(r => r.duration).map(r => r.duration!);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    const slowRequests = requests.filter(r => r.duration && r.duration > 3000).length;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      slowRequests,
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
    };
  }

  public clearData(): void {
    this.errors = [];
    this.requests.clear();
  }

  private interceptFetch(): void {
    if (!window.fetch) return;

    this.originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      const startTime = performance.now();
      const requestId = `${method}-${url}-${Date.now()}`;

      this.requests.set(requestId, {
        url,
        method,
        startTime,
        success: false
      });

      try {
        const response = await this.originalFetch!(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Update request data
        this.requests.set(requestId, {
          url,
          method,
          startTime,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          duration
        });

        // Log performance metric
        performanceMonitor.addMetric({
          name: 'network-request',
          value: duration,
          timestamp: Date.now(),
          type: 'custom',
          metadata: {
            url,
            method,
            status: response.status,
            success: response.ok
          }
        });

        // Log slow requests
        if (duration > 3000 && process.env.NODE_ENV === 'development') {
          console.warn(`🐌 Slow network request: ${method} ${url} (${duration.toFixed(2)}ms)`);
        }

        // Handle error responses
        if (!response.ok) {
          this.addNetworkError({
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: Date.now(),
            duration,
            type: 'fetch'
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Update request data
        this.requests.set(requestId, {
          url,
          method,
          startTime,
          success: false,
          duration
        });

        this.addNetworkError({
          url,
          method,
          message: String(error),
          timestamp: Date.now(),
          duration,
          type: 'fetch',
          metadata: { error: String(error) }
        });

        throw error;
      }
    };
  }

  private interceptXHR(): void {
    if (!window.XMLHttpRequest) return;

    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string | URL,
      async?: boolean,
      user?: string | null,
      password?: string | null
    ) {
      this._networkMonitor = {
        method,
        url: String(url),
        startTime: 0
      };

      return XMLHttpRequest.prototype.open.call(this, method, url, async, user, password);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      if (this._networkMonitor) {
        this._networkMonitor.startTime = performance.now();
        const requestData = this._networkMonitor;

        this.addEventListener('loadend', () => {
          const endTime = performance.now();
          const duration = endTime - requestData.startTime;
          const success = this.status >= 200 && this.status < 400;

          performanceMonitor.addMetric({
            name: 'network-request-xhr',
            value: duration,
            timestamp: Date.now(),
            type: 'custom',
            metadata: {
              url: requestData.url,
              method: requestData.method,
              status: this.status,
              success
            }
          });

          if (!success) {
            const monitor = NetworkMonitor.getInstance();
            monitor.addNetworkError({
              url: requestData.url,
              method: requestData.method,
              status: this.status,
              statusText: this.statusText,
              message: `XHR ${this.status}: ${this.statusText}`,
              timestamp: Date.now(),
              duration,
              type: 'xhr'
            });
          }
        });

        this.addEventListener('error', () => {
          const endTime = performance.now();
          const duration = endTime - requestData.startTime;

          const monitor = NetworkMonitor.getInstance();
          monitor.addNetworkError({
            url: requestData.url,
            method: requestData.method,
            message: 'Network error',
            timestamp: Date.now(),
            duration,
            type: 'xhr'
          });
        });

        this.addEventListener('timeout', () => {
          const endTime = performance.now();
          const duration = endTime - requestData.startTime;

          const monitor = NetworkMonitor.getInstance();
          monitor.addNetworkError({
            url: requestData.url,
            method: requestData.method,
            message: 'Request timeout',
            timestamp: Date.now(),
            duration,
            type: 'xhr'
          });
        });
      }

      return this.originalXHRSend?.call(this, body);
    };
  }

  private setupResourceErrorHandling(): void {
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as any;
        if (target.src || target.href) {
          this.addNetworkError({
            url: target.src || target.href,
            method: 'GET',
            message: 'Resource failed to load',
            timestamp: Date.now(),
            type: 'resource',
            metadata: {
              tagName: target.tagName,
              type: target.type || 'unknown'
            }
          });
        }
      }
    }, true);
  }

  private restoreOriginalMethods(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }

    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }

    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend;
    }
  }

  private addNetworkError(error: NetworkError): void {
    this.errors.push(error);

    // Add to performance monitor
    performanceMonitor.addError({
      message: error.message,
      timestamp: error.timestamp,
      type: 'network',
      metadata: {
        url: error.url,
        method: error.method,
        status: error.status,
        statusText: error.statusText,
        duration: error.duration,
        networkType: error.type
      }
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`🌐 Network Error: ${error.method} ${error.url}`, error);
    }
  }

  // Singleton pattern
  private static instance?: NetworkMonitor;

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }
}

interface RequestData {
  url: string;
  method: string;
  startTime: number;
  success: boolean;
  status?: number;
  statusText?: string;
  duration?: number;
}

// Extend XMLHttpRequest interface
declare global {
  interface XMLHttpRequest {
    _networkMonitor?: {
      method: string;
      url: string;
      startTime: number;
    };
    originalXHRSend?: typeof XMLHttpRequest.prototype.send;
  }
}

// Singleton instance
export const networkMonitor = NetworkMonitor.getInstance();

export type { NetworkError, NetworkMetrics };
export { NetworkMonitor };
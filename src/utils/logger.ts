/**
 * Comprehensive logging system with multiple log levels and outputs
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
  stack?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private remoteQueue: LogEntry[] = [];
  private isFlushingRemote: boolean = false;

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemote: false,
      ...config,
    };

    // Setup remote logging interval if enabled
    if (this.config.enableRemote) {
      setInterval(() => this.flushRemoteLogs(), 5000);
    }

    // Load existing logs from storage
    this.loadFromStorage();
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Log methods for different levels
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, error?: Error | unknown): void {
    const stack = (error instanceof Error ? error.stack : undefined) || new Error().stack;
    this.log(LogLevel.ERROR, message, context, error, stack);
  }

  critical(message: string, context?: string, error?: Error | unknown): void {
    const stack = (error instanceof Error ? error.stack : undefined) || new Error().stack;
    this.log(LogLevel.CRITICAL, message, context, error, stack);
    // For critical errors, immediately flush to remote
    if (this.config.enableRemote) {
      this.flushRemoteLogs();
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    stack?: string
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      stack,
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.config.maxStorageEntries) {
      this.logBuffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.consoleOutput(entry);
    }

    // Storage
    if (this.config.enableStorage) {
      this.saveToStorage();
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.remoteQueue.push(entry);
    }
  }

  /**
   * Console output with formatting
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level] || 'UNKNOWN';
    const prefix = entry.context ? `[${entry.context}]` : '';

    const message = `${timestamp} ${levelName} ${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`%c${message}`, 'color: #888', entry.data);
        break;
      case LogLevel.INFO:
        console.info(`%c${message}`, 'color: #0ea5e9', entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data, entry.stack);
        break;
    }
  }

  /**
   * Storage operations
   */
  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(this.logBuffer);
      localStorage.setItem('app_logs', serialized);
    } catch (error) {
      console.error('Failed to save logs to storage', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const serialized = localStorage.getItem('app_logs');
      if (serialized) {
        this.logBuffer = JSON.parse(serialized);
      }
    } catch (error) {
      console.error('Failed to load logs from storage', error);
    }
  }

  /**
   * Remote logging
   */
  private async flushRemoteLogs(): Promise<void> {
    if (!this.config.remoteEndpoint || this.isFlushingRemote || this.remoteQueue.length === 0) {
      return;
    }

    this.isFlushingRemote = true;
    const logsToSend = [...this.remoteQueue];
    this.remoteQueue = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: this.getSessionId(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      // Re-add logs to queue on failure
      this.remoteQueue.unshift(...logsToSend);
      console.error('Failed to send logs to remote', error);
    } finally {
      this.isFlushingRemote = false;
    }
  }

  /**
   * Utility methods
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get filtered logs
   */
  getLogs(minLevel?: LogLevel, context?: string): LogEntry[] {
    return this.logBuffer.filter(entry => {
      const levelMatch = minLevel === undefined || entry.level >= minLevel;
      const contextMatch = !context || entry.context === context;
      return levelMatch && contextMatch;
    });
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logBuffer = [];
    this.remoteQueue = [];
    localStorage.removeItem('app_logs');
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Performance logging
   */
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Timer [${label}]: ${duration.toFixed(2)}ms`, 'Performance');
    };
  }
}

// Create singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const critical = logger.critical.bind(logger);
export const startTimer = logger.startTimer.bind(logger);
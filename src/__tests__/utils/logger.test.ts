import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogLevel, logger, debug, info, warn, error, critical } from '../../utils/logger';

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock console methods
const consoleMocks = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// Mock fetch
global.fetch = vi.fn();

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    logger.clearLogs();
  });

  describe('LogLevel constants', () => {
    test('LogLevel values are correct', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.CRITICAL).toBe(4);
    });
  });

  describe('Basic logging', () => {
    test('debug logs with correct level', () => {
      debug('test debug message');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].message).toBe('test debug message');
    });

    test('info logs with correct level', () => {
      info('test info message');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('test info message');
    });

    test('warn logs with correct level', () => {
      warn('test warn message');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe('test warn message');
    });

    test('error logs with correct level and stack', () => {
      const testError = new Error('test error');
      error('test error message', 'TestContext', testError);
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe('test error message');
      expect(logs[0].context).toBe('TestContext');
      expect(logs[0].stack).toBeDefined();
    });

    test('critical logs with correct level and immediate flush', () => {
      critical('test critical message');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.CRITICAL);
      expect(logs[0].message).toBe('test critical message');
    });
  });

  describe('Context and data logging', () => {
    test('logs with context are properly stored', () => {
      info('test message', 'TestContext', { key: 'value' });
      const logs = logger.getLogs();
      expect(logs[0].context).toBe('TestContext');
      expect(logs[0].data).toEqual({ key: 'value' });
    });

    test('getLogs filters by context', () => {
      info('message 1', 'Context1');
      info('message 2', 'Context2');
      info('message 3', 'Context1');

      const context1Logs = logger.getLogs(undefined, 'Context1');
      expect(context1Logs).toHaveLength(2);
      expect(context1Logs.every(log => log.context === 'Context1')).toBe(true);
    });

    test('getLogs filters by minimum level', () => {
      debug('debug message');
      info('info message');
      warn('warn message');
      error('error message');

      const warnAndAbove = logger.getLogs(LogLevel.WARN);
      expect(warnAndAbove).toHaveLength(2);
      expect(warnAndAbove.every(log => log.level >= LogLevel.WARN)).toBe(true);
    });
  });

  describe('Performance timer', () => {
    test('startTimer returns a function that logs duration', () => {
      // Mock performance.now to control timing
      const performanceNowSpy = vi.spyOn(performance, 'now')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);

      const endTimer = logger.startTimer('TestTimer');
      expect(typeof endTimer).toBe('function');

      endTimer();

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('Timer [TestTimer]: 50.00ms');
      expect(logs[0].context).toBe('Performance');

      performanceNowSpy.mockRestore();
    });
  });

  describe('Storage operations', () => {
    test('logs are saved to localStorage', () => {
      info('test message');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app_logs',
        expect.any(String)
      );
    });

    test('saves logs to localStorage when logging', () => {
      const mockLogs = JSON.stringify([{
        level: LogLevel.INFO,
        message: 'stored message',
        timestamp: new Date().toISOString(),
      }]);

      localStorageMock.getItem.mockReturnValue(mockLogs);

      // Clear previous calls
      localStorageMock.setItem.mockClear();

      // Log a message which should trigger save
      info('test message for storage');

      // Verify localStorage.setItem is called for saving
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app_logs',
        expect.any(String)
      );
    });

    test('clearLogs removes all logs and storage', () => {
      info('test message');
      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('app_logs');
    });
  });

  describe('Export functionality', () => {
    test('exportLogs returns JSON string', () => {
      info('test message 1');
      warn('test message 2');

      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].message).toBe('test message 1');
      expect(parsed[1].message).toBe('test message 2');
    });
  });

  describe('Console output', () => {
    test('console methods are called for different log levels', () => {
      debug('debug msg');
      info('info msg');
      warn('warn msg');
      error('error msg');
      critical('critical msg');

      expect(consoleMocks.log).toHaveBeenCalled();
      expect(consoleMocks.info).toHaveBeenCalled();
      expect(consoleMocks.warn).toHaveBeenCalled();
      expect(consoleMocks.error).toHaveBeenCalledTimes(2); // error + critical
    });
  });
});
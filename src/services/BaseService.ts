/**
 * Base service class providing common functionality for all services
 */

export interface ServiceConfig {
  name: string;
  version: string;
  debug?: boolean;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: Error;
  timestamp: number;
}

export abstract class BaseService {
  protected config: ServiceConfig;
  protected isInitialized: boolean = false;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.log('Service initialized', { config });
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.warn('Service already initialized');
      return;
    }

    try {
      await this.onInitialize();
      this.isInitialized = true;
      this.log('Service initialization complete');
    } catch (error) {
      this.error('Service initialization failed', error);
      throw error;
    }
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.onCleanup();
      this.isInitialized = false;
      this.log('Service cleanup complete');
    } catch (error) {
      this.error('Service cleanup failed', error);
      throw error;
    }
  }

  /**
   * Abstract methods to be implemented by derived services
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onCleanup(): Promise<void>;

  /**
   * Logging utilities
   */
  protected log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[${this.config.name}] ${message}`, data);
    }
  }

  protected warn(message: string, data?: unknown): void {
    console.warn(`[${this.config.name}] ${message}`, data);
  }

  protected error(message: string, error?: unknown): void {
    console.error(`[${this.config.name}] ${message}`, error);
  }

  /**
   * Create a standardized service response
   */
  protected createResponse<T>(
    data?: T,
    error?: Error
  ): ServiceResponse<T> {
    return {
      success: !error,
      data,
      error,
      timestamp: Date.now(),
    };
  }

  /**
   * Wrap async operations with error handling
   */
  protected async executeAsync<T>(
    operation: () => Promise<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await operation();
      return this.createResponse(data);
    } catch (error) {
      this.error('Operation failed', error);
      return this.createResponse<T>(undefined, error as Error);
    }
  }
}
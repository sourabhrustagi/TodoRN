import { APP_CONSTANTS } from '../constants/app';
import logger from './logger';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
  onMaxAttemptsReached?: (error: any, attempts: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public originalError: any,
    public attempts: number,
    public totalTime: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export class RetryManager {
  private static instance: RetryManager;
  private defaultConfig: RetryConfig;

  private constructor() {
    this.defaultConfig = {
      maxAttempts: APP_CONSTANTS.API.RETRY_ATTEMPTS,
      baseDelay: APP_CONSTANTS.API.RETRY_DELAY,
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      retryableErrors: [
        'Network error occurred',
        'timeout',
        'network',
        'connection',
        'ECONNRESET',
        'ENOTFOUND',
        'ETIMEDOUT',
      ],
    };
  }

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  private isRetryableError(error: unknown, config: RetryConfig): boolean {
    // Check if it's a network error
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const errorMessage = error.message.toLowerCase();
      return config.retryableErrors.some(retryableError =>
        errorMessage.includes(retryableError.toLowerCase())
      );
    }

    // Check if it's an HTTP error with retryable status code
    if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' && config.retryableStatusCodes.includes(error.status)) {
      return true;
    }

    // Check if it's a fetch error
    if (error && typeof error === 'object' && 'name' in error && error.name === 'TypeError' && 'message' in error && typeof error.message === 'string' && error.message.includes('fetch')) {
      return true;
    }

    // Custom retry logic
    if (config.shouldRetry) {
      return config.shouldRetry(error, 0);
    }

    return false;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retry<T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultConfig, ...customConfig };
    const startTime = Date.now();
    let lastError: any;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const data = await operation();
        const totalTime = Date.now() - startTime;

        logger.info('Retry operation successful', {
          attempts: attempt,
          totalTime,
          success: true,
        });

        return {
          success: true,
          data,
          attempts: attempt,
          totalTime,
        };
      } catch (error) {
        lastError = error;
        const totalTime = Date.now() - startTime;

        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.warn('Retry operation failed', {
          attempt,
          totalAttempts: config.maxAttempts,
          error: errorMessage,
          totalTime,
        });

        // Check if we should retry
        if (attempt === config.maxAttempts || !this.isRetryableError(error, config)) {
          logger.error('Retry operation failed permanently', {
            attempts: attempt,
            totalTime,
            error: errorMessage,
          });

          if (config.onMaxAttemptsReached) {
            config.onMaxAttemptsReached(error, attempt);
          }

          return {
            success: false,
            error: new RetryError(
              `Operation failed after ${attempt} attempts: ${errorMessage}`,
              error,
              attempt,
              totalTime
            ),
            attempts: attempt,
            totalTime,
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);

        logger.info('Retrying operation', {
          attempt: attempt + 1,
          delay,
          error: errorMessage,
        });

        if (config.onRetry) {
          config.onRetry(error, attempt, delay);
        }

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // This should never be reached, but just in case
    const totalTime = Date.now() - startTime;
    return {
      success: false,
      error: new RetryError(
        `Operation failed after ${config.maxAttempts} attempts`,
        lastError,
        config.maxAttempts,
        totalTime
      ),
      attempts: config.maxAttempts,
      totalTime,
    };
  }

  // Convenience methods for different types of operations
  async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    const result = await this.retry(operation, {
      maxAttempts,
      backoffMultiplier: 2,
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  async retryWithLinearBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    const result = await this.retry(operation, {
      maxAttempts,
      backoffMultiplier: 1,
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  async retryWithCustomLogic<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: any, attempt: number) => boolean,
    maxAttempts: number = 3
  ): Promise<T> {
    const result = await this.retry(operation, {
      maxAttempts,
      shouldRetry,
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  // Retry with different strategies based on error type
  async retryWithStrategy<T>(
    operation: () => Promise<T>,
    strategy: 'exponential' | 'linear' | 'immediate' = 'exponential'
  ): Promise<T> {
    const config: Partial<RetryConfig> = {
      maxAttempts: 3,
    };

    switch (strategy) {
      case 'exponential':
        config.backoffMultiplier = 2;
        break;
      case 'linear':
        config.backoffMultiplier = 1;
        break;
      case 'immediate':
        config.baseDelay = 0;
        config.backoffMultiplier = 1;
        break;
    }

    const result = await this.retry(operation, config);

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }
}

// Singleton instance
export const retryManager = RetryManager.getInstance();

// Convenience functions
export const retry = <T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
) => retryManager.retry(operation, config);

export const retryWithExponentialBackoff = <T>(
  operation: () => Promise<T>,
  maxAttempts?: number
) => retryManager.retryWithExponentialBackoff(operation, maxAttempts);

export const retryWithLinearBackoff = <T>(
  operation: () => Promise<T>,
  maxAttempts?: number
) => retryManager.retryWithLinearBackoff(operation, maxAttempts);

export const retryWithStrategy = <T>(
  operation: () => Promise<T>,
  strategy?: 'exponential' | 'linear' | 'immediate'
) => retryManager.retryWithStrategy(operation, strategy);

export default retryManager; 
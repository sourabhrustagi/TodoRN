import { useCallback, useState } from 'react';
import { retryManager, RetryConfig, RetryResult } from '../utils/retry';
import logger from '../utils/logger';

interface UseRetryOptions {
  onRetry?: (error: any, attempt: number, delay: number) => void;
  onMaxAttemptsReached?: (error: any, attempts: number) => void;
  onSuccess?: (data: any, attempts: number, totalTime: number) => void;
  onError?: (error: any, attempts: number, totalTime: number) => void;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastResult, setLastResult] = useState<RetryResult<any> | null>(null);

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      customConfig?: Partial<RetryConfig>
    ): Promise<T> => {
      setIsRetrying(true);
      setLastResult(null);

      try {
        const result = await retryManager.retry(operation, {
          onRetry: (error, attempt, delay) => {
            logger.info('Retry attempt', { attempt, delay, error: error.message });
            options.onRetry?.(error, attempt, delay);
          },
          onMaxAttemptsReached: (error, attempts) => {
            logger.error('Max retry attempts reached', { attempts, error: error.message });
            options.onMaxAttemptsReached?.(error, attempts);
          },
          ...customConfig,
        });

        setLastResult(result);

        if (result.success) {
          logger.info('Retry operation successful', {
            attempts: result.attempts,
            totalTime: result.totalTime,
          });
          options.onSuccess?.(result.data, result.attempts, result.totalTime);
          return result.data;
        } else {
          logger.error('Retry operation failed', {
            attempts: result.attempts,
            totalTime: result.totalTime,
            error: result.error?.message,
          });
          options.onError?.(result.error, result.attempts, result.totalTime);
          throw result.error;
        }
      } finally {
        setIsRetrying(false);
      }
    },
    [options]
  );

  const executeWithExponentialBackoff = useCallback(
    async <T>(operation: () => Promise<T>, maxAttempts: number = 3): Promise<T> => {
      return executeWithRetry(operation, {
        maxAttempts,
        backoffMultiplier: 2,
      });
    },
    [executeWithRetry]
  );

  const executeWithLinearBackoff = useCallback(
    async <T>(operation: () => Promise<T>, maxAttempts: number = 3): Promise<T> => {
      return executeWithRetry(operation, {
        maxAttempts,
        backoffMultiplier: 1,
      });
    },
    [executeWithRetry]
  );

  const executeWithImmediateRetry = useCallback(
    async <T>(operation: () => Promise<T>, maxAttempts: number = 3): Promise<T> => {
      return executeWithRetry(operation, {
        maxAttempts,
        baseDelay: 0,
        backoffMultiplier: 1,
      });
    },
    [executeWithRetry]
  );

  const executeWithCustomLogic = useCallback(
    async <T>(
      operation: () => Promise<T>,
      shouldRetry: (error: any, attempt: number) => boolean,
      maxAttempts: number = 3
    ): Promise<T> => {
      return executeWithRetry(operation, {
        maxAttempts,
        shouldRetry,
      });
    },
    [executeWithRetry]
  );

  return {
    // State
    isRetrying,
    lastResult,

    // Methods
    executeWithRetry,
    executeWithExponentialBackoff,
    executeWithLinearBackoff,
    executeWithImmediateRetry,
    executeWithCustomLogic,

    // Utilities
    hasRetried: lastResult ? lastResult.attempts > 1 : false,
    totalAttempts: lastResult?.attempts || 0,
    totalTime: lastResult?.totalTime || 0,
  };
};

export default useRetry; 
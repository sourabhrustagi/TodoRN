# API Retry Mechanism

## Overview

The TodoRN application implements a comprehensive retry mechanism to handle network failures, timeouts, and temporary server errors. This ensures robust API communication and improves user experience by automatically retrying failed requests.

## 🏗️ Architecture

### Retry Manager (`src/utils/retry.ts`)

The core retry functionality is implemented in the `RetryManager` class, which provides:

- **Configurable retry strategies** (exponential backoff, linear backoff, immediate)
- **Smart error detection** for retryable vs non-retryable errors
- **Comprehensive logging** for debugging and monitoring
- **Custom retry logic** for specific use cases

### RealApiService Integration

The `RealApiService` automatically applies retry logic to all API calls:

- **Automatic retry** for network errors and timeouts
- **Token refresh** on 401 errors
- **Exponential backoff** strategy
- **Configurable retry attempts** per environment

### Custom Hooks

- **`useRetry`** - Hook for custom retry operations
- **`useApi`** - Enhanced with automatic retry functionality

## 🔧 Configuration

### Environment-Specific Settings

```typescript
// src/constants/app.ts
export const APP_CONSTANTS = {
  API: {
    RETRY_ATTEMPTS: 3,        // Number of retry attempts
    RETRY_DELAY: 1000,        // Base delay in milliseconds
    TIMEOUT: 10000,           // Request timeout
  },
};
```

### Retryable Error Types

The system automatically retries on these error types:

- **Network errors**: Connection failures, timeouts
- **HTTP status codes**: 408, 429, 500, 502, 503, 504
- **Fetch errors**: Browser/React Native fetch failures
- **Custom errors**: Configurable retryable error patterns

## 📊 Retry Strategies

### 1. Exponential Backoff (Default)

```typescript
// Delay increases exponentially: 1s, 2s, 4s, 8s...
const result = await retryWithExponentialBackoff(
  () => api.getTasks(),
  3 // max attempts
);
```

### 2. Linear Backoff

```typescript
// Delay increases linearly: 1s, 2s, 3s, 4s...
const result = await retryWithLinearBackoff(
  () => api.getTasks(),
  3 // max attempts
);
```

### 3. Immediate Retry

```typescript
// No delay between retries
const result = await retryWithImmediateRetry(
  () => api.getTasks(),
  3 // max attempts
);
```

### 4. Custom Retry Logic

```typescript
const result = await retryWithCustomLogic(
  () => api.getTasks(),
  (error, attempt) => {
    // Custom logic to determine if should retry
    return error.message.includes('timeout') && attempt < 3;
  },
  3 // max attempts
);
```

## 🎣 Usage Examples

### Basic API Call with Retry

```typescript
import { useApi } from '../hooks/useApi';

const MyComponent = () => {
  const { executeApiCall, loading, error } = useApi({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  });

  const fetchTasks = async () => {
    try {
      const tasks = await executeApiCall(() => api.getTasks());
      console.log('Tasks loaded:', tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };
};
```

### Custom Retry Hook

```typescript
import { useRetry } from '../hooks/useRetry';

const MyComponent = () => {
  const { 
    executeWithExponentialBackoff, 
    isRetrying, 
    lastResult 
  } = useRetry({
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms`);
    },
    onSuccess: (data, attempts, totalTime) => {
      console.log(`Success after ${attempts} attempts in ${totalTime}ms`);
    },
  });

  const handleOperation = async () => {
    try {
      const result = await executeWithExponentialBackoff(
        () => api.createTask(taskData)
      );
      console.log('Task created:', result);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };
};
```

### Direct Retry Manager Usage

```typescript
import { retryManager } from '../utils/retry';

const performOperation = async () => {
  const result = await retryManager.retry(
    () => api.getTasks(),
    {
      maxAttempts: 5,
      baseDelay: 2000,
      backoffMultiplier: 1.5,
      retryableErrors: ['timeout', 'network'],
      onRetry: (error, attempt, delay) => {
        console.log(`Retry ${attempt} after ${delay}ms`);
      },
    }
  );

  if (result.success) {
    console.log('Operation successful:', result.data);
  } else {
    console.error('Operation failed:', result.error);
  }
};
```

## 🔐 Authentication Retry

### Token Refresh on 401 Errors

The system automatically handles authentication failures:

```typescript
// RealApiService automatically:
// 1. Detects 401 errors
// 2. Attempts token refresh
// 3. Retries original request with new token
// 4. Clears auth data if refresh fails

const result = await api.getTasks(); // Automatic auth retry
```

### Auth Error Handling

```typescript
// Method to handle 401 errors with token refresh
private async handleAuthError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && (error as any).status === 401) {
      logger.info('Token expired, attempting to refresh');
      
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        logger.info('Token refreshed, retrying original request');
        return await operation();
      } else {
        logger.error('Token refresh failed, clearing auth data');
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        throw new Error('Authentication failed');
      }
    }
    throw error;
  }
}
```

## 📈 Performance Monitoring

### Retry Metrics

The system tracks comprehensive retry metrics:

```typescript
interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}
```

### Logging

Detailed logging for debugging and monitoring:

```typescript
// Retry attempt logs
logger.info('Retry attempt', { 
  attempt: 2, 
  delay: 2000, 
  error: 'Network timeout' 
});

// Success logs
logger.info('Retry operation successful', {
  attempts: 3,
  totalTime: 4500,
  success: true,
});

// Failure logs
logger.error('Retry operation failed permanently', {
  attempts: 3,
  totalTime: 4500,
  error: 'Server error',
});
```

## 🛠️ Configuration Options

### RetryConfig Interface

```typescript
interface RetryConfig {
  maxAttempts: number;           // Maximum retry attempts
  baseDelay: number;             // Base delay in milliseconds
  maxDelay: number;              // Maximum delay in milliseconds
  backoffMultiplier: number;     // Backoff multiplier
  retryableStatusCodes: number[]; // HTTP status codes to retry
  retryableErrors: string[];     // Error patterns to retry
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
  onMaxAttemptsReached?: (error: any, attempts: number) => void;
}
```

### Environment-Specific Configuration

```typescript
// Mock Environment - Minimal retry
mock: {
  api: {
    retryAttempts: 1,
    retryDelay: 500,
  },
}

// Development Environment - Moderate retry
development: {
  api: {
    retryAttempts: 3,
    retryDelay: 1000,
  },
}

// Production Environment - Aggressive retry
production: {
  api: {
    retryAttempts: 3,
    retryDelay: 2000,
  },
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('Retry Mechanism', () => {
  it('should retry failed operations', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Network error');
      }
      return 'success';
    };

    const result = await retryWithExponentialBackoff(operation, 3);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should not retry non-retryable errors', async () => {
    const operation = async () => {
      throw new Error('Validation error');
    };

    await expect(retryWithExponentialBackoff(operation, 3))
      .rejects.toThrow('Validation error');
  });
});
```

### Integration Tests

```typescript
describe('API Retry Integration', () => {
  it('should retry API calls on network failures', async () => {
    const { executeApiCall } = useApi();
    
    const result = await executeApiCall(() => api.getTasks());
    expect(result).toBeDefined();
  });

  it('should handle token refresh on 401 errors', async () => {
    // Mock 401 response, then successful response after token refresh
    const result = await api.getTasks();
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Best Practices

### 1. Choose Appropriate Retry Strategy

- **Exponential backoff**: For most API calls
- **Linear backoff**: For rate-limited endpoints
- **Immediate retry**: For idempotent operations
- **Custom logic**: For specific error patterns

### 2. Handle Different Error Types

```typescript
const shouldRetry = (error: any, attempt: number) => {
  // Don't retry validation errors
  if (error.message.includes('validation')) return false;
  
  // Don't retry authentication errors (handled separately)
  if (error.status === 401) return false;
  
  // Retry network and server errors
  return error.message.includes('network') || error.status >= 500;
};
```

### 3. Monitor Retry Performance

```typescript
const { lastResult } = useRetry({
  onSuccess: (data, attempts, totalTime) => {
    // Track retry performance
    analytics.track('api_retry_success', {
      attempts,
      totalTime,
      endpoint: 'getTasks',
    });
  },
});
```

### 4. Set Appropriate Timeouts

```typescript
// Short timeout for quick operations
const quickOperation = retryWithExponentialBackoff(
  () => api.getTask(taskId),
  2 // fewer attempts
);

// Longer timeout for heavy operations
const heavyOperation = retryWithExponentialBackoff(
  () => api.bulkOperation(data),
  5 // more attempts
);
```

## 🔍 Debugging

### Enable Debug Logging

```typescript
// In development, enable detailed retry logging
if (__DEV__) {
  logger.setLevel('debug');
}
```

### Monitor Retry Patterns

```typescript
// Track retry patterns for optimization
const retryMetrics = {
  totalRetries: 0,
  successfulRetries: 0,
  failedRetries: 0,
  averageRetryTime: 0,
};
```

## 📊 Metrics and Monitoring

### Key Metrics to Track

1. **Retry Rate**: Percentage of requests that require retries
2. **Success Rate**: Percentage of retried requests that succeed
3. **Average Retry Time**: Time taken for successful retries
4. **Error Distribution**: Types of errors that trigger retries

### Alerting

```typescript
// Alert on high retry rates
if (retryRate > 0.1) { // 10% retry rate
  alert('High API retry rate detected');
}

// Alert on failed retries
if (failedRetries > 0.05) { // 5% failure rate
  alert('High API failure rate detected');
}
```

## 🎯 Benefits

### 1. Improved Reliability
- **Automatic recovery** from temporary failures
- **Reduced user frustration** from network issues
- **Better user experience** with seamless retries

### 2. Better Performance
- **Smart retry strategies** minimize unnecessary retries
- **Exponential backoff** prevents server overload
- **Configurable timeouts** optimize for different operations

### 3. Enhanced Monitoring
- **Comprehensive logging** for debugging
- **Performance metrics** for optimization
- **Error tracking** for issue resolution

### 4. Developer Experience
- **Simple API** for common use cases
- **Flexible configuration** for custom needs
- **Type-safe** implementation with TypeScript

This retry mechanism ensures robust API communication while providing developers with the tools they need to handle complex network scenarios effectively. 
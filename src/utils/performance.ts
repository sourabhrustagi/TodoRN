// Performance utilities for React Native

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Debounce utility for frequent events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }
  
  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const times = this.metrics.get(operation)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
    
    if (__DEV__) {
      console.log(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, operation) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
      };
    });
    
    return result;
  }
}

/**
 * Batch updates utility for Redux
 */
export function batchUpdate<T>(
  updates: (() => void)[],
  delay: number = 16
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      updates.forEach(update => update());
      resolve();
    }, delay);
  });
}

/**
 * Create selector with memoization
 */
export function createSelector<State, Result>(
  selector: (state: State) => Result,
  dependencies?: string[]
): (state: State) => Result {
  let lastState: State | null = null;
  let lastResult: Result | null = null;
  
  return (state: State): Result => {
    if (lastState === state) {
      return lastResult!;
    }
    
    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
}

/**
 * Measure performance of async operations
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  const stopTimer = monitor.startTimer(operationName);
  
  try {
    const result = await operation();
    return result;
  } finally {
    stopTimer();
  }
}

/**
 * Optimize list rendering with windowing
 */
export function createVirtualizedListConfig<T>(
  itemHeight: number,
  windowHeight: number
) {
  const visibleItemCount = Math.ceil(windowHeight / itemHeight) + 2;
  
  return {
    getItemLayout: (data: T[] | null, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    initialNumToRender: visibleItemCount,
    maxToRenderPerBatch: visibleItemCount * 2,
    windowSize: visibleItemCount * 2,
    removeClippedSubviews: true,
    keyExtractor: (item: T, index: number) => index.toString(),
  };
} 
// Performance utilities for the app

export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  }) as T;
};

export const batchUpdate = <T>(
  updates: (() => T)[],
  batchSize: number = 10
): Promise<T[]> => {
  return new Promise((resolve) => {
    const results: T[] = [];
    let index = 0;

    const processBatch = () => {
      const batch = updates.slice(index, index + batchSize);
      
      batch.forEach(update => {
        try {
          results.push(update());
        } catch (error) {
          console.error('Error in batch update:', error);
        }
      });

      index += batchSize;

      if (index < updates.length) {
        requestAnimationFrame(processBatch);
      } else {
        resolve(results);
      }
    };

    processBatch();
  });
};

export const createSelector = <TState, TResult>(
  selector: (state: TState) => TResult,
  equalityFn?: (a: TResult, b: TResult) => boolean
) => {
  let lastResult: TResult | undefined;
  let lastState: TState | undefined;

  return (state: TState): TResult => {
    if (lastState === state && lastResult !== undefined) {
      return lastResult;
    }

    const result = selector(state);
    
    if (equalityFn && lastResult !== undefined) {
      if (equalityFn(lastResult, result)) {
        return lastResult;
      }
    }

    lastState = state;
    lastResult = result;
    
    return result;
  };
};

export const measurePerformance = <T extends (...args: any[]) => any>(
  name: string,
  func: T
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start}ms`);
    
    return result;
  }) as T;
}; 
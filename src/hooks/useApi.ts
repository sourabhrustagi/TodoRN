import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import ApiService from '../services/ApiService';
import logger from '../utils/logger';
import { APP_CONSTANTS } from '../constants/app';
import { retryWithExponentialBackoff } from '../utils/retry';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showLoading?: boolean;
}

interface ApiState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
    data: null,
  });

  const dispatch = useDispatch();

  const executeApiCall = useCallback(
    async (apiCall: () => Promise<any>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const api = ApiService.getInstance();
        
        // Use retry mechanism for API calls
        const result = await retryWithExponentialBackoff(
          async () => {
            return await apiCall();
          },
          APP_CONSTANTS.API.RETRY_ATTEMPTS
        );
        
        setState({
          loading: false,
          error: null,
          data: result,
        });

        options.onSuccess?.(result);
        logger.info('API call successful', { result });
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        setState({
          loading: false,
          error: errorMessage,
          data: null,
        });

        options.onError?.(errorMessage);
        logger.error('API call failed', error);
        
        throw error;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    ...state,
    executeApiCall,
    reset,
  };
};

export const useApiWithCache = <T>(
  cacheKey: string,
  options: UseApiOptions = {}
) => {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());
  const apiState = useApi(options);

  const getCachedData = useCallback((key: string): T | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const maxAge = APP_CONSTANTS.API.CACHE_DURATION || 5 * 60 * 1000; // 5 minutes

    if (cacheAge > maxAge) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }, [cache]);

  const setCachedData = useCallback((key: string, data: T) => {
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: Date.now(),
    }));
  }, []);

  const executeWithCache = useCallback(
    async (apiCall: () => Promise<T>) => {
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        apiState.setData({ loading: false, error: null, data: cachedData });
        return cachedData;
      }

      // Execute API call
      const result = await apiState.executeApiCall(apiCall);
      setCachedData(cacheKey, result);
      return result;
    },
    [cacheKey, getCachedData, setCachedData, apiState]
  );

  return {
    ...apiState,
    executeWithCache,
    getCachedData,
    setCachedData,
  };
};

export default useApi; 
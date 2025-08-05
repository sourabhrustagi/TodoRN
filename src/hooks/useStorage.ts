import { useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../constants/app';
import logger from '../utils/logger';

interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
}

export const useStorage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getItem = useCallback(async <T>(key: string, defaultValue?: T): Promise<T | null> => {
    try {
      setIsLoading(true);
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return defaultValue || null;
      }

      const parsed = JSON.parse(value);
      logger.debug('Storage get item', { key, value: parsed });
      return parsed;
    } catch (error) {
      logger.error('Failed to get storage item', { key, error });
      return defaultValue || null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setItem = useCallback(async <T>(key: string, value: T, options?: StorageOptions): Promise<void> => {
    try {
      setIsLoading(true);
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
      
      logger.debug('Storage set item', { key, value });
    } catch (error) {
      logger.error('Failed to set storage item', { key, error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(key);
      logger.debug('Storage remove item', { key });
    } catch (error) {
      logger.error('Failed to remove storage item', { key, error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.clear();
      logger.info('Storage cleared');
    } catch (error) {
      logger.error('Failed to clear storage', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllKeys = useCallback(async (): Promise<string[]> => {
    try {
      setIsLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      logger.debug('Storage get all keys', { keys });
      return keys;
    } catch (error) {
      logger.error('Failed to get storage keys', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const multiGet = useCallback(async <T>(keys: string[]): Promise<Record<string, T | null>> => {
    try {
      setIsLoading(true);
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      keyValuePairs.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      
      logger.debug('Storage multi get', { keys, result });
      return result;
    } catch (error) {
      logger.error('Failed to multi get storage items', { keys, error });
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  const multiSet = useCallback(async <T>(keyValuePairs: Record<string, T>, options?: StorageOptions): Promise<void> => {
    try {
      setIsLoading(true);
      const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      
      await AsyncStorage.multiSet(pairs);
      logger.debug('Storage multi set', { keyValuePairs });
    } catch (error) {
      logger.error('Failed to multi set storage items', { keyValuePairs, error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const multiRemove = useCallback(async (keys: string[]): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove(keys);
      logger.debug('Storage multi remove', { keys });
    } catch (error) {
      logger.error('Failed to multi remove storage items', { keys, error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Storage utilities
  const getStorageSize = useCallback(async (): Promise<number> => {
    try {
      const keys = await getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Failed to get storage size', error);
      return 0;
    }
  }, [getAllKeys]);

  const getStorageInfo = useCallback(async () => {
    try {
      const keys = await getAllKeys();
      const size = await getStorageSize();
      
      return {
        keyCount: keys.length,
        totalSize: size,
        keys,
      };
    } catch (error) {
      logger.error('Failed to get storage info', error);
      return {
        keyCount: 0,
        totalSize: 0,
        keys: [],
      };
    }
  }, [getAllKeys, getStorageSize]);

  return {
    // State
    isLoading,

    // Basic operations
    getItem,
    setItem,
    removeItem,
    clear,

    // Batch operations
    getAllKeys,
    multiGet,
    multiSet,
    multiRemove,

    // Utilities
    getStorageSize,
    getStorageInfo,
  };
};

export default useStorage; 
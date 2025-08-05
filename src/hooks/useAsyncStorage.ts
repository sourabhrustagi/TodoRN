import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error(`Error loading ${key}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const setValue = async (value: T) => {
    try {
      setError(null);
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
      console.error(`Error saving ${key}:`, err);
    }
  };

  const removeValue = async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove data');
      console.error(`Error removing ${key}:`, err);
    }
  };

  return { storedValue, setValue, removeValue, loading, error };
} 
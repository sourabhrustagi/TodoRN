import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../constants/app';
import logger from '../utils/logger';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof APP_CONSTANTS.COLORS | typeof APP_CONSTANTS.DARK_COLORS;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeState, setThemeState] = useState<ThemeState>({
    mode: 'auto',
    isDark: false,
    colors: APP_CONSTANTS.COLORS,
  });

  const loadTheme = useCallback(async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode = (savedMode as ThemeMode) || 'auto';
      
      const isDark = mode === 'auto' 
        ? systemColorScheme === 'dark'
        : mode === 'dark';

      const colors = isDark ? APP_CONSTANTS.DARK_COLORS : APP_CONSTANTS.COLORS;

      setThemeState({
        mode,
        isDark,
        colors,
      });

      logger.info('Theme loaded', { mode, isDark });
    } catch (error) {
      logger.error('Failed to load theme', error);
    }
  }, [systemColorScheme]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      
      const isDark = mode === 'auto' 
        ? systemColorScheme === 'dark'
        : mode === 'dark';

      const colors = isDark ? APP_CONSTANTS.DARK_COLORS : APP_CONSTANTS.COLORS;

      setThemeState({
        mode,
        isDark,
        colors,
      });

      logger.info('Theme changed', { mode, isDark });
    } catch (error) {
      logger.error('Failed to save theme', error);
    }
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    const newMode = themeState.mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  }, [themeState.mode, setTheme]);

  // Auto-load theme on mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Update theme when system color scheme changes
  useEffect(() => {
    if (themeState.mode === 'auto') {
      const isDark = systemColorScheme === 'dark';
      const colors = isDark ? APP_CONSTANTS.DARK_COLORS : APP_CONSTANTS.COLORS;

      setThemeState(prev => ({
        ...prev,
        isDark,
        colors,
      }));
    }
  }, [systemColorScheme, themeState.mode]);

  return {
    // State
    mode: themeState.mode,
    isDark: themeState.isDark,
    colors: themeState.colors,

    // Actions
    setTheme,
    toggleTheme,
    loadTheme,

    // Computed values
    isAuto: themeState.mode === 'auto',
    isLight: themeState.mode === 'light',
    isDarkMode: themeState.mode === 'dark',
  };
};

export default useTheme; 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';
import { ThemeState } from '../types';
import MockApiService from '../services/MockApiService';

interface ThemeContextType {
  theme: any;
  isDark: boolean;
  isAuto: boolean;
  toggleTheme: () => Promise<void>;
  setAutoTheme: (auto: boolean) => Promise<void>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('ThemeProvider: Initializing ThemeProvider');
  
  const systemColorScheme = useColorScheme();
  const [themeState, setThemeState] = useState<ThemeState>({
    isDark: false,
    isAuto: true,
  });

  useEffect(() => {
    console.log('ThemeProvider: useEffect triggered, loading theme settings');
    loadThemeSettings();
  }, []);

  useEffect(() => {
    console.log('ThemeProvider: System color scheme changed to:', systemColorScheme);
    if (themeState.isAuto) {
      console.log('ThemeProvider: Auto theme enabled, updating theme');
      setThemeState(prev => ({ ...prev, isDark: systemColorScheme === 'dark' }));
    }
  }, [systemColorScheme, themeState.isAuto]);

  const loadThemeSettings = async () => {
    console.log('ThemeProvider: loadThemeSettings called');
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      
      const settings = await api.getSettings();
      console.log('ThemeProvider: Loaded settings:', settings);
      
      if (settings) {
        setThemeState({
          isDark: settings.theme === 'dark',
          isAuto: settings.theme === 'auto',
        });
      }
    } catch (error) {
      console.error('ThemeProvider: Error loading theme settings:', error);
    }
  };

  const toggleTheme = async () => {
    console.log('ThemeProvider: toggleTheme called');
    try {
      const newIsDark = !themeState.isDark;
      console.log('ThemeProvider: Toggling theme to:', newIsDark ? 'dark' : 'light');
      
      setThemeState(prev => ({ ...prev, isDark: newIsDark, isAuto: false }));
      
      const api = MockApiService.getInstance();
      const currentSettings = await api.getSettings();
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          theme: (newIsDark ? 'dark' : 'light') as 'light' | 'dark' | 'auto',
        };
        await api.updateSettings(updatedSettings);
      }
    } catch (error) {
      console.error('ThemeProvider: Error toggling theme:', error);
    }
  };

  const setAutoTheme = async (auto: boolean) => {
    console.log('ThemeProvider: setAutoTheme called with auto:', auto);
    try {
      setThemeState(prev => ({ 
        ...prev, 
        isAuto: auto,
        isDark: auto ? systemColorScheme === 'dark' : prev.isDark 
      }));
      
      const api = MockApiService.getInstance();
      const currentSettings = await api.getSettings();
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          theme: (auto ? 'auto' : (themeState.isDark ? 'dark' : 'light')) as 'light' | 'dark' | 'auto',
        };
        await api.updateSettings(updatedSettings);
      }
    } catch (error) {
      console.error('ThemeProvider: Error setting auto theme:', error);
    }
  };

  const theme = themeState.isDark ? darkTheme : lightTheme;
  
  console.log('ThemeProvider: Rendering with theme state:', {
    isDark: themeState.isDark,
    isAuto: themeState.isAuto,
    systemColorScheme
  });

  return (
    <ThemeContext.Provider value={{ theme, isDark: themeState.isDark, isAuto: themeState.isAuto, toggleTheme, setAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
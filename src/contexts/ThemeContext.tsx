import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme } from '../constants/theme';
import MockApiService from '../services/MockApiService';

interface ThemeContextType {
  theme: any;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('ThemeProvider: Initializing ThemeProvider');
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    console.log('ThemeProvider: useEffect triggered, loading theme settings');
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    console.log('ThemeProvider: loadThemeSettings called');
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      
      const settings = await api.getSettings();
      console.log('ThemeProvider: Loaded settings:', settings);
      
      if (settings) {
        setIsDark(settings.theme === 'dark');
      }
    } catch (error) {
      console.error('ThemeProvider: Error loading theme settings:', error);
    }
  };

  const toggleTheme = async () => {
    console.log('ThemeProvider: toggleTheme called');
    try {
      const newIsDark = !isDark;
      console.log('ThemeProvider: Toggling theme to:', newIsDark ? 'dark' : 'light');
      
      setIsDark(newIsDark);
      
      const api = MockApiService.getInstance();
      const currentSettings = await api.getSettings();
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          theme: (newIsDark ? 'dark' : 'light') as 'light' | 'dark',
        };
        await api.updateSettings(updatedSettings);
      }
    } catch (error) {
      console.error('ThemeProvider: Error toggling theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;
  
  console.log('ThemeProvider: Rendering with theme state:', { isDark });
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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
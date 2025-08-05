import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundaryClass from './src/components/ErrorBoundary';
import ApiService from './src/services/ApiService';
import { devHelpers } from './src/utils/apiConfig';
import { APP_CONSTANTS } from './src/constants/app';
import logger from './src/utils/logger';
import { initializeServices } from './src/core/di/Registry';

function App() {
  logger.info('App: Starting TodoRN application');
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Log environment configuration
        logger.logEnvironment();
        
        // Initialize dependency injection
        await initializeServices();
        logger.info('App: Dependency injection initialized');
        
        // Initialize API service
        const apiService = ApiService.getInstance();
        await apiService.initialize();
        
        // Log API mode
        const currentMode = await devHelpers.getCurrentMode();
        logger.info(`App: API Mode initialized - ${currentMode}`);
        
        logger.info('App: Initialization complete');
      } catch (error) {
        logger.error('App: Failed to initialize application', error);
      }
    };

    initializeApp();
  }, []);
  
  return (
    <ErrorBoundaryClass>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </PaperProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </ErrorBoundaryClass>
  );
}

export default App; 
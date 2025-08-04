import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundaryClass from './src/components/ErrorBoundary';

function App() {
  console.log('App: Starting full App component with Redux');
  
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
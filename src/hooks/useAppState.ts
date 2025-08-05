import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useState } from 'react';

export function useAppState() {
  const appState = useRef(AppState.currentState);
  const [currentAppState, setCurrentAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      // Handle app coming to foreground
    } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background!');
      // Handle app going to background
    }

    appState.current = nextAppState;
    setCurrentAppState(nextAppState);
  };

  return currentAppState;
} 
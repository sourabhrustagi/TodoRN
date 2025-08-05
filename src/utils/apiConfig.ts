import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../constants/app';
import ApiService from '../services/ApiService';

const API_CONFIG_KEY = 'api_config';

export interface ApiConfig {
  mockMode: boolean;
  baseUrl: string;
  timeout: number;
}

export const getDefaultApiConfig = (): ApiConfig => ({
  mockMode: APP_CONSTANTS.API.MOCK_MODE,
  baseUrl: APP_CONSTANTS.API.BASE_URL,
  timeout: APP_CONSTANTS.API.TIMEOUT,
});

export const getApiConfig = async (): Promise<ApiConfig> => {
  try {
    const configJson = await AsyncStorage.getItem(API_CONFIG_KEY);
    if (configJson) {
      return JSON.parse(configJson);
    }
    return getDefaultApiConfig();
  } catch (error) {
    console.error('Failed to load API config:', error);
    return getDefaultApiConfig();
  }
};

export const setApiConfig = async (config: Partial<ApiConfig>): Promise<void> => {
  try {
    const currentConfig = await getApiConfig();
    const newConfig = { ...currentConfig, ...config };
    await AsyncStorage.setItem(API_CONFIG_KEY, JSON.stringify(newConfig));
    
    // Update the API service
    const apiService = ApiService.getInstance();
    apiService.setMockMode(newConfig.mockMode);
    
    console.log('API Config updated:', newConfig);
  } catch (error) {
    console.error('Failed to save API config:', error);
  }
};

export const toggleMockMode = async (): Promise<boolean> => {
  try {
    const currentConfig = await getApiConfig();
    const newMockMode = !currentConfig.mockMode;
    await setApiConfig({ mockMode: newMockMode });
    return newMockMode;
  } catch (error) {
    console.error('Failed to toggle mock mode:', error);
    return false;
  }
};

export const isMockMode = async (): Promise<boolean> => {
  const config = await getApiConfig();
  return config.mockMode;
};

// Development helper functions
export const devHelpers = {
  // Switch to real API mode
  enableRealApi: async () => {
    await setApiConfig({ mockMode: false });
    console.log('Switched to REAL API mode');
  },
  
  // Switch to mock API mode
  enableMockApi: async () => {
    await setApiConfig({ mockMode: true });
    console.log('Switched to MOCK API mode');
  },
  
  // Get current API mode
  getCurrentMode: async () => {
    const isMock = await isMockMode();
    return isMock ? 'MOCK' : 'REAL';
  },
  
  // Test API connectivity
  testApiConnection: async () => {
    try {
      const apiService = ApiService.getInstance();
      const isMock = await isMockMode();
      
      if (isMock) {
        console.log('Testing MOCK API...');
        await apiService.initialize();
        const authStatus = await apiService.getAuthStatus();
        console.log('Mock API Status:', authStatus);
        return { success: true, mode: 'MOCK', status: authStatus };
      } else {
        console.log('Testing REAL API...');
        // Try to make a simple request to test connectivity
        const response = await fetch(`${APP_CONSTANTS.API.BASE_URL}/health`);
        const status = response.ok ? 'Connected' : 'Failed';
        console.log('Real API Status:', status);
        return { success: response.ok, mode: 'REAL', status };
      }
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return { success: false, error: error.message };
    }
  },
};

export default {
  getApiConfig,
  setApiConfig,
  toggleMockMode,
  isMockMode,
  devHelpers,
}; 
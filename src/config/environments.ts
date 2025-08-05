export type Environment = 'mock' | 'development' | 'production';

export interface EnvironmentConfig {
  name: string;
  api: {
    baseUrl: string;
    mockMode: boolean;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  app: {
    name: string;
    version: string;
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  features: {
    analytics: boolean;
    crashReporting: boolean;
    pushNotifications: boolean;
    offlineSupport: boolean;
  };
  storage: {
    encryption: boolean;
    backupEnabled: boolean;
  };
}

export const environments: Record<Environment, EnvironmentConfig> = {
  mock: {
    name: 'Mock',
    api: {
      baseUrl: 'https://api.todoapp.com/v1',
      mockMode: true,
      timeout: 5000,
      retryAttempts: 1,
      retryDelay: 500,
    },
    app: {
      name: 'TodoRN (Mock)',
      version: '1.0.0',
      debug: true,
      logLevel: 'debug',
    },
    features: {
      analytics: false,
      crashReporting: false,
      pushNotifications: false,
      offlineSupport: true,
    },
    storage: {
      encryption: false,
      backupEnabled: false,
    },
  },
  development: {
    name: 'Development',
    api: {
      baseUrl: 'https://dev-api.todoapp.com/v1',
      mockMode: false,
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    app: {
      name: 'TodoRN (Dev)',
      version: '1.0.0',
      debug: true,
      logLevel: 'debug',
    },
    features: {
      analytics: true,
      crashReporting: true,
      pushNotifications: false,
      offlineSupport: true,
    },
    storage: {
      encryption: false,
      backupEnabled: true,
    },
  },
  production: {
    name: 'Production',
    api: {
      baseUrl: 'https://api.todoapp.com/v1',
      mockMode: false,
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 2000,
    },
    app: {
      name: 'TodoRN',
      version: '1.0.0',
      debug: false,
      logLevel: 'error',
    },
    features: {
      analytics: true,
      crashReporting: true,
      pushNotifications: true,
      offlineSupport: true,
    },
    storage: {
      encryption: true,
      backupEnabled: true,
    },
  },
};

export const getEnvironment = (): Environment => {
  // Check for environment variable
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment;
  if (env && environments[env]) {
    return env;
  }

  // Check for __DEV__ flag
  if (__DEV__) {
    // In development, check if we should use mock mode
    const useMock = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
    return useMock ? 'mock' : 'development';
  }

  // Default to production
  return 'production';
};

export const getConfig = (): EnvironmentConfig => {
  const env = getEnvironment();
  return environments[env];
};

export const isMockMode = (): boolean => {
  const config = getConfig();
  return config.api.mockMode;
};

export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development';
};

export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

export const isMock = (): boolean => {
  return getEnvironment() === 'mock';
}; 
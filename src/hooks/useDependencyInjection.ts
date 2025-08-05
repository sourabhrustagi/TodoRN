import { useCallback, useMemo } from 'react';
import { resolveService, hasService, SERVICE_IDENTIFIERS } from '../core/di/Container';
import {
  IApiService,
  IStorageService,
  IAuthService,
  ITokenService,
  ITaskService,
  ICategoryService,
  ILoggerService,
  IValidationService,
  IRetryService,
  IPerformanceService,
  IConfigService,
  IEnvironmentService,
  INavigationService,
  IThemeService,
  IAnalyticsService,
  IErrorHandlerService,
  ICacheService,
  INetworkService,
  INotificationService,
  IOfflineService,
  ISecurityService,
  ILocalizationService,
  IFeatureFlagService,
} from '../core/di/Interfaces';

/**
 * Hook for accessing services through dependency injection
 */
export const useDependencyInjection = () => {
  // Core Services
  const apiService = useMemo<IApiService>(() => 
    resolveService<IApiService>(SERVICE_IDENTIFIERS.API_SERVICE), []
  );

  const storageService = useMemo<IStorageService>(() => 
    resolveService<IStorageService>(SERVICE_IDENTIFIERS.STORAGE_SERVICE), []
  );

  const loggerService = useMemo<ILoggerService>(() => 
    resolveService<ILoggerService>(SERVICE_IDENTIFIERS.LOGGER_SERVICE), []
  );

  const validationService = useMemo<IValidationService>(() => 
    resolveService<IValidationService>(SERVICE_IDENTIFIERS.VALIDATION_SERVICE), []
  );

  const retryService = useMemo<IRetryService>(() => 
    resolveService<IRetryService>(SERVICE_IDENTIFIERS.RETRY_SERVICE), []
  );

  const performanceService = useMemo<IPerformanceService>(() => 
    resolveService<IPerformanceService>(SERVICE_IDENTIFIERS.PERFORMANCE_SERVICE), []
  );

  const configService = useMemo<IConfigService>(() => 
    resolveService<IConfigService>(SERVICE_IDENTIFIERS.CONFIG_SERVICE), []
  );

  const environmentService = useMemo<IEnvironmentService>(() => 
    resolveService<IEnvironmentService>(SERVICE_IDENTIFIERS.ENVIRONMENT_SERVICE), []
  );

  const errorHandlerService = useMemo<IErrorHandlerService>(() => 
    resolveService<IErrorHandlerService>(SERVICE_IDENTIFIERS.ERROR_HANDLER_SERVICE), []
  );

  // Authentication Services
  const authService = useMemo<IAuthService>(() => 
    resolveService<IAuthService>(SERVICE_IDENTIFIERS.AUTH_SERVICE), []
  );

  const tokenService = useMemo<ITokenService>(() => 
    resolveService<ITokenService>(SERVICE_IDENTIFIERS.TOKEN_SERVICE), []
  );

  // Task Services
  const taskService = useMemo<ITaskService>(() => 
    resolveService<ITaskService>(SERVICE_IDENTIFIERS.TASK_SERVICE), []
  );

  const categoryService = useMemo<ICategoryService>(() => 
    resolveService<ICategoryService>(SERVICE_IDENTIFIERS.CATEGORY_SERVICE), []
  );

  // Navigation Services
  const navigationService = useMemo<INavigationService>(() => 
    resolveService<INavigationService>(SERVICE_IDENTIFIERS.NAVIGATION_SERVICE), []
  );

  // Theme Services
  const themeService = useMemo<IThemeService>(() => 
    resolveService<IThemeService>(SERVICE_IDENTIFIERS.THEME_SERVICE), []
  );

  // Analytics Services
  const analyticsService = useMemo<IAnalyticsService>(() => 
    resolveService<IAnalyticsService>(SERVICE_IDENTIFIERS.ANALYTICS_SERVICE), []
  );

  // Cache Services
  const cacheService = useMemo<ICacheService>(() => 
    resolveService<ICacheService>(SERVICE_IDENTIFIERS.CACHE_SERVICE), []
  );

  // Network Services
  const networkService = useMemo<INetworkService>(() => 
    resolveService<INetworkService>(SERVICE_IDENTIFIERS.NETWORK_SERVICE), []
  );

  // Notification Services
  const notificationService = useMemo<INotificationService>(() => 
    resolveService<INotificationService>(SERVICE_IDENTIFIERS.NOTIFICATION_SERVICE), []
  );

  // Offline Services
  const offlineService = useMemo<IOfflineService>(() => 
    resolveService<IOfflineService>(SERVICE_IDENTIFIERS.OFFLINE_SERVICE), []
  );

  // Security Services
  const securityService = useMemo<ISecurityService>(() => 
    resolveService<ISecurityService>(SERVICE_IDENTIFIERS.SECURITY_SERVICE), []
  );

  // Localization Services
  const localizationService = useMemo<ILocalizationService>(() => 
    resolveService<ILocalizationService>(SERVICE_IDENTIFIERS.I18N_SERVICE), []
  );

  // Feature Flag Services
  const featureFlagService = useMemo<IFeatureFlagService>(() => 
    resolveService<IFeatureFlagService>(SERVICE_IDENTIFIERS.FEATURE_FLAG_SERVICE), []
  );

  // Utility functions
  const hasServiceAvailable = useCallback((identifier: symbol): boolean => {
    return hasService(identifier);
  }, []);

  const getServiceByToken = useCallback(<T>(identifier: symbol): T => {
    return resolveService<T>(identifier);
  }, []);

  return {
    // Core Services
    apiService,
    storageService,
    loggerService,
    validationService,
    retryService,
    performanceService,
    configService,
    environmentService,
    errorHandlerService,

    // Authentication Services
    authService,
    tokenService,

    // Task Services
    taskService,
    categoryService,

    // Navigation Services
    navigationService,

    // Theme Services
    themeService,

    // Analytics Services
    analyticsService,

    // Cache Services
    cacheService,

    // Network Services
    networkService,

    // Notification Services
    notificationService,

    // Offline Services
    offlineService,

    // Security Services
    securityService,

    // Localization Services
    localizationService,

    // Feature Flag Services
    featureFlagService,

    // Utility functions
    hasServiceAvailable,
    getServiceByToken,
  };
};

/**
 * Hook for accessing a specific service
 */
export const useService = <T>(identifier: symbol): T => {
  return resolveService<T>(identifier);
};

/**
 * Hook for checking if a service is available
 */
export const useHasService = (identifier: symbol): boolean => {
  return hasService(identifier);
};

/**
 * Hook for accessing API service specifically
 */
export const useApiService = (): IApiService => {
  return useService<IApiService>(SERVICE_IDENTIFIERS.API_SERVICE);
};

/**
 * Hook for accessing storage service specifically
 */
export const useStorageService = (): IStorageService => {
  return useService<IStorageService>(SERVICE_IDENTIFIERS.STORAGE_SERVICE);
};

/**
 * Hook for accessing logger service specifically
 */
export const useLoggerService = (): ILoggerService => {
  return useService<ILoggerService>(SERVICE_IDENTIFIERS.LOGGER_SERVICE);
};

/**
 * Hook for accessing validation service specifically
 */
export const useValidationService = (): IValidationService => {
  return useService<IValidationService>(SERVICE_IDENTIFIERS.VALIDATION_SERVICE);
};

/**
 * Hook for accessing retry service specifically
 */
export const useRetryService = (): IRetryService => {
  return useService<IRetryService>(SERVICE_IDENTIFIERS.RETRY_SERVICE);
};

/**
 * Hook for accessing performance service specifically
 */
export const usePerformanceService = (): IPerformanceService => {
  return useService<IPerformanceService>(SERVICE_IDENTIFIERS.PERFORMANCE_SERVICE);
};

/**
 * Hook for accessing config service specifically
 */
export const useConfigService = (): IConfigService => {
  return useService<IConfigService>(SERVICE_IDENTIFIERS.CONFIG_SERVICE);
};

/**
 * Hook for accessing environment service specifically
 */
export const useEnvironmentService = (): IEnvironmentService => {
  return useService<IEnvironmentService>(SERVICE_IDENTIFIERS.ENVIRONMENT_SERVICE);
};

/**
 * Hook for accessing error handler service specifically
 */
export const useErrorHandlerService = (): IErrorHandlerService => {
  return useService<IErrorHandlerService>(SERVICE_IDENTIFIERS.ERROR_HANDLER_SERVICE);
};

export default useDependencyInjection; 
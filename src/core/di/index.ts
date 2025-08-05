// Export InversifyJS container and utilities
export * from './Container';
export * from './Interfaces';
export * from './Services';
export * from './Registry';

// Export container and utilities
export {
  container,
  bindService,
  bindServiceAsSingleton,
  bindServiceAsTransient,
  bindServiceToSelf,
  bindServiceToConstant,
  bindServiceToFactory,
  resolveService,
  hasService,
  getAllServices,
  clearContainer,
  removeService,
  getContainer,
} from './Container';

// Export service identifiers
export {
  SERVICE_IDENTIFIERS,
  ServiceIdentifier,
} from './Container';

// Export registry functions
export {
  serviceRegistry,
  initializeServices,
  clearServices,
} from './Registry';

// Export service interfaces
export {
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
} from './Interfaces';

// Export service implementations
export {
  ApiServiceImpl,
  StorageServiceImpl,
  LoggerServiceImpl,
  ValidationServiceImpl,
  RetryServiceImpl,
  PerformanceServiceImpl,
  EnvironmentServiceImpl,
  ErrorHandlerServiceImpl,
  ConfigServiceImpl,
  MockServiceImpl,
} from './Services';

// Default export
import { container } from './Container';
import { serviceRegistry, initializeServices, clearServices } from './Registry';
import { SERVICE_IDENTIFIERS } from './Container';
import { resolveService, hasService } from './Container';

export default {
  container,
  serviceRegistry,
  SERVICE_IDENTIFIERS,
  initializeServices,
  resolveService,
  hasService,
  clearServices,
}; 
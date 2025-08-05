import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';
import { APP_CONSTANTS } from '../../constants/app';
import logger from '../../utils/logger';

// Service identifiers
export const SERVICE_IDENTIFIERS = {
  // API Services
  API_SERVICE: Symbol.for('API_SERVICE'),
  MOCK_API_SERVICE: Symbol.for('MOCK_API_SERVICE'),
  REAL_API_SERVICE: Symbol.for('REAL_API_SERVICE'),

  // Storage Services
  STORAGE_SERVICE: Symbol.for('STORAGE_SERVICE'),
  ASYNC_STORAGE_SERVICE: Symbol.for('ASYNC_STORAGE_SERVICE'),

  // Authentication Services
  AUTH_SERVICE: Symbol.for('AUTH_SERVICE'),
  TOKEN_SERVICE: Symbol.for('TOKEN_SERVICE'),

  // Task Services
  TASK_SERVICE: Symbol.for('TASK_SERVICE'),
  CATEGORY_SERVICE: Symbol.for('CATEGORY_SERVICE'),

  // Utility Services
  LOGGER_SERVICE: Symbol.for('LOGGER_SERVICE'),
  VALIDATION_SERVICE: Symbol.for('VALIDATION_SERVICE'),
  RETRY_SERVICE: Symbol.for('RETRY_SERVICE'),
  PERFORMANCE_SERVICE: Symbol.for('PERFORMANCE_SERVICE'),

  // Configuration Services
  CONFIG_SERVICE: Symbol.for('CONFIG_SERVICE'),
  ENVIRONMENT_SERVICE: Symbol.for('ENVIRONMENT_SERVICE'),

  // Navigation Services
  NAVIGATION_SERVICE: Symbol.for('NAVIGATION_SERVICE'),

  // Theme Services
  THEME_SERVICE: Symbol.for('THEME_SERVICE'),

  // Analytics Services
  ANALYTICS_SERVICE: Symbol.for('ANALYTICS_SERVICE'),
  CRASH_REPORTING_SERVICE: Symbol.for('CRASH_REPORTING_SERVICE'),

  // Notification Services
  NOTIFICATION_SERVICE: Symbol.for('NOTIFICATION_SERVICE'),
  PUSH_NOTIFICATION_SERVICE: Symbol.for('PUSH_NOTIFICATION_SERVICE'),

  // Offline Services
  OFFLINE_SERVICE: Symbol.for('OFFLINE_SERVICE'),
  SYNC_SERVICE: Symbol.for('SYNC_SERVICE'),

  // Error Handling Services
  ERROR_HANDLER_SERVICE: Symbol.for('ERROR_HANDLER_SERVICE'),
  ERROR_REPORTING_SERVICE: Symbol.for('ERROR_REPORTING_SERVICE'),

  // Security Services
  ENCRYPTION_SERVICE: Symbol.for('ENCRYPTION_SERVICE'),
  SECURITY_SERVICE: Symbol.for('SECURITY_SERVICE'),

  // Cache Services
  CACHE_SERVICE: Symbol.for('CACHE_SERVICE'),
  MEMORY_CACHE_SERVICE: Symbol.for('MEMORY_CACHE_SERVICE'),

  // Network Services
  NETWORK_SERVICE: Symbol.for('NETWORK_SERVICE'),
  CONNECTIVITY_SERVICE: Symbol.for('CONNECTIVITY_SERVICE'),

  // Device Services
  DEVICE_SERVICE: Symbol.for('DEVICE_SERVICE'),
  PERMISSION_SERVICE: Symbol.for('PERMISSION_SERVICE'),

  // Localization Services
  I18N_SERVICE: Symbol.for('I18N_SERVICE'),
  TRANSLATION_SERVICE: Symbol.for('TRANSLATION_SERVICE'),

  // Feature Flags
  FEATURE_FLAG_SERVICE: Symbol.for('FEATURE_FLAG_SERVICE'),

  // Background Services
  BACKGROUND_SERVICE: Symbol.for('BACKGROUND_SERVICE'),
  WORKER_SERVICE: Symbol.for('WORKER_SERVICE'),
} as const;

export type ServiceIdentifier = typeof SERVICE_IDENTIFIERS[keyof typeof SERVICE_IDENTIFIERS];

// Create the container
export const container = new Container();

// Utility functions
export const bindService = <T>(
  identifier: symbol,
  serviceClass: new (...args: any[]) => T
): void => {
  container.bind<T>(identifier).to(serviceClass).inSingletonScope();
  logger.debug(`Bound service: ${identifier.toString()}`);
};

export const bindServiceAsSingleton = <T>(
  identifier: symbol,
  serviceClass: new (...args: any[]) => T
): void => {
  container.bind<T>(identifier).to(serviceClass).inSingletonScope();
  logger.debug(`Bound singleton service: ${identifier.toString()}`);
};

export const bindServiceAsTransient = <T>(
  identifier: symbol,
  serviceClass: new (...args: any[]) => T
): void => {
  container.bind<T>(identifier).to(serviceClass).inTransientScope();
  logger.debug(`Bound transient service: ${identifier.toString()}`);
};

export const bindServiceToSelf = <T>(
  identifier: symbol,
  serviceClass: new (...args: any[]) => T
): void => {
  container.bind<T>(identifier).toSelf().inSingletonScope();
  logger.debug(`Bound service to self: ${identifier.toString()}`);
};

export const bindServiceToConstant = <T>(
  identifier: symbol,
  value: T
): void => {
  container.bind<T>(identifier).toConstantValue(value);
  logger.debug(`Bound constant service: ${identifier.toString()}`);
};

export const bindServiceToFactory = <T>(
  identifier: symbol,
  factory: () => T
): void => {
  // Use constant value instead of factory for simplicity
  container.bind<T>(identifier).toConstantValue(factory());
  logger.debug(`Bound factory service: ${identifier.toString()}`);
};

export const resolveService = <T>(identifier: symbol): T => {
  try {
    return container.get<T>(identifier);
  } catch (error) {
    logger.error(`Failed to resolve service: ${identifier.toString()}`, error);
    throw error;
  }
};

export const hasService = <T>(identifier: symbol): boolean => {
  return container.isBound(identifier);
};

export const getAllServices = (): string[] => {
  const bindings: string[] = [];
  // Get all bound services
  Object.values(SERVICE_IDENTIFIERS).forEach(identifier => {
    if (container.isBound(identifier)) {
      bindings.push(identifier.toString());
    }
  });
  return bindings;
};

export const clearContainer = (): void => {
  container.unbindAll();
  logger.info('Container cleared');
};

export const removeService = <T>(identifier: symbol): void => {
  container.unbind(identifier);
  logger.debug(`Removed service: ${identifier.toString()}`);
};

export const getContainer = (): Container => {
  return container;
};

export default container; 
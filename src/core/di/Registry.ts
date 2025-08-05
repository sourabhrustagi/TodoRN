import 'reflect-metadata';
import { container } from './Container';
import { SERVICE_IDENTIFIERS } from './Container';
import {
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
import { IEnvironmentService } from './Interfaces';
import logger from '../../utils/logger';

/**
 * Service Registry - Registers all services in the InversifyJS container
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register all core services
   */
  registerCoreServices(): void {
    if (this.isInitialized) {
      logger.warn('Service registry already initialized');
      return;
    }

    logger.info('Registering core services...');

    // Core Services (Singleton)
    container.bind(SERVICE_IDENTIFIERS.LOGGER_SERVICE).to(LoggerServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.CONFIG_SERVICE).to(ConfigServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.ENVIRONMENT_SERVICE).to(EnvironmentServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.ERROR_HANDLER_SERVICE).to(ErrorHandlerServiceImpl).inSingletonScope();

    // Storage Services (Singleton)
    container.bind(SERVICE_IDENTIFIERS.STORAGE_SERVICE).to(StorageServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.ASYNC_STORAGE_SERVICE).to(StorageServiceImpl).inSingletonScope();

    // API Services (Singleton)
    container.bind(SERVICE_IDENTIFIERS.API_SERVICE).to(ApiServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.MOCK_API_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.REAL_API_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Utility Services (Singleton)
    container.bind(SERVICE_IDENTIFIERS.VALIDATION_SERVICE).to(ValidationServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.RETRY_SERVICE).to(RetryServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.PERFORMANCE_SERVICE).to(PerformanceServiceImpl).inSingletonScope();

    // Mock Services (for services not yet implemented)
    this.registerMockServices();

    this.isInitialized = true;
    logger.info('Core services registered successfully');
  }

  /**
   * Register mock services for unimplemented interfaces
   */
  private registerMockServices(): void {
    // Authentication Services
    container.bind(SERVICE_IDENTIFIERS.AUTH_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.TOKEN_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Task Services
    container.bind(SERVICE_IDENTIFIERS.TASK_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.CATEGORY_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Navigation Services
    container.bind(SERVICE_IDENTIFIERS.NAVIGATION_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Theme Services
    container.bind(SERVICE_IDENTIFIERS.THEME_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Analytics Services
    container.bind(SERVICE_IDENTIFIERS.ANALYTICS_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.CRASH_REPORTING_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Notification Services
    container.bind(SERVICE_IDENTIFIERS.NOTIFICATION_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.PUSH_NOTIFICATION_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Offline Services
    container.bind(SERVICE_IDENTIFIERS.OFFLINE_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.SYNC_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Security Services
    container.bind(SERVICE_IDENTIFIERS.ENCRYPTION_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.SECURITY_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Cache Services
    container.bind(SERVICE_IDENTIFIERS.CACHE_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.MEMORY_CACHE_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Network Services
    container.bind(SERVICE_IDENTIFIERS.NETWORK_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.CONNECTIVITY_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Device Services
    container.bind(SERVICE_IDENTIFIERS.DEVICE_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.PERMISSION_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Localization Services
    container.bind(SERVICE_IDENTIFIERS.I18N_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.TRANSLATION_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Feature Flags
    container.bind(SERVICE_IDENTIFIERS.FEATURE_FLAG_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Background Services
    container.bind(SERVICE_IDENTIFIERS.BACKGROUND_SERVICE).to(MockServiceImpl).inSingletonScope();
    container.bind(SERVICE_IDENTIFIERS.WORKER_SERVICE).to(MockServiceImpl).inSingletonScope();

    // Error Reporting
    container.bind(SERVICE_IDENTIFIERS.ERROR_REPORTING_SERVICE).to(MockServiceImpl).inSingletonScope();

    logger.info('Mock services registered');
  }

  /**
   * Register environment-specific services
   */
  registerEnvironmentServices(): void {
    const environment = container.get<IEnvironmentService>(SERVICE_IDENTIFIERS.ENVIRONMENT_SERVICE);
    
    if (environment.isMock()) {
      this.registerMockEnvironmentServices();
    } else if (environment.isDevelopment()) {
      this.registerDevelopmentServices();
    } else if (environment.isProduction()) {
      this.registerProductionServices();
    }

    logger.info(`Environment-specific services registered for: ${environment.getEnvironment()}`);
  }

  /**
   * Register services for mock environment
   */
  private registerMockEnvironmentServices(): void {
    // Mock environment uses minimal services
    logger.info('Registering mock environment services');
  }

  /**
   * Register services for development environment
   */
  private registerDevelopmentServices(): void {
    // Development environment uses enhanced logging and debugging
    logger.info('Registering development environment services');
  }

  /**
   * Register services for production environment
   */
  private registerProductionServices(): void {
    // Production environment uses optimized services
    logger.info('Registering production environment services');
  }

  /**
   * Validate all registered services
   */
  validateServices(): void {
    try {
      // Check if all core services are bound
      const coreServices = [
        SERVICE_IDENTIFIERS.LOGGER_SERVICE,
        SERVICE_IDENTIFIERS.CONFIG_SERVICE,
        SERVICE_IDENTIFIERS.ENVIRONMENT_SERVICE,
        SERVICE_IDENTIFIERS.ERROR_HANDLER_SERVICE,
        SERVICE_IDENTIFIERS.STORAGE_SERVICE,
        SERVICE_IDENTIFIERS.API_SERVICE,
        SERVICE_IDENTIFIERS.VALIDATION_SERVICE,
        SERVICE_IDENTIFIERS.RETRY_SERVICE,
        SERVICE_IDENTIFIERS.PERFORMANCE_SERVICE,
      ];

      for (const service of coreServices) {
        if (!container.isBound(service)) {
          throw new Error(`Core service not bound: ${service.toString()}`);
        }
      }

      logger.info('Service validation passed');
    } catch (error) {
      logger.error('Service validation failed', error);
      throw error;
    }
  }

  /**
   * Get dependency graph for debugging
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    // Get all bound services
    Object.values(SERVICE_IDENTIFIERS).forEach(identifier => {
      if (container.isBound(identifier)) {
        graph[identifier.toString()] = [];
      }
    });

    return graph;
  }

  /**
   * Get all registered service tokens
   */
  getRegisteredServices(): string[] {
    const services: string[] = [];
    Object.values(SERVICE_IDENTIFIERS).forEach(identifier => {
      if (container.isBound(identifier)) {
        services.push(identifier.toString());
      }
    });
    return services;
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    container.unbindAll();
    this.isInitialized = false;
    logger.info('Service registry cleared');
  }

  /**
   * Initialize the service registry
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing service registry...');
      
      // Register core services
      this.registerCoreServices();
      
      // Register environment-specific services
      this.registerEnvironmentServices();
      
      // Validate services
      this.validateServices();
      
      logger.info('Service registry initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize service registry', error);
      throw error;
    }
  }

  /**
   * Check if registry is initialized
   */
  isRegistryInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Convenience functions
export const initializeServices = () => serviceRegistry.initialize();
export const getService = <T>(identifier: symbol): T => container.get<T>(identifier);
export const hasService = (identifier: symbol): boolean => container.isBound(identifier);
export const clearServices = () => serviceRegistry.clear();

export default serviceRegistry; 
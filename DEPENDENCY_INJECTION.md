# Dependency Injection System

## Overview

The TodoRN application implements a comprehensive dependency injection (DI) system to ensure loose coupling, better testability, and maintainable code architecture. This system provides a centralized way to manage dependencies and services throughout the application.

## 🏗️ Architecture

### Core Components

#### **1. Container (`src/core/di/Container.ts`)**
The heart of the DI system that manages service registration and resolution:

- **Service Registration**: Register services with their dependencies
- **Service Resolution**: Resolve services with automatic dependency injection
- **Lifecycle Management**: Support for singleton and transient services
- **Circular Dependency Detection**: Prevents circular dependency issues
- **Validation**: Ensures all dependencies are properly registered

#### **2. Service Tokens (`src/core/di/Tokens.ts`)**
Centralized tokens for all services to ensure type safety:

```typescript
export const SERVICE_TOKENS = {
  API_SERVICE: 'API_SERVICE',
  STORAGE_SERVICE: 'STORAGE_SERVICE',
  LOGGER_SERVICE: 'LOGGER_SERVICE',
  // ... more tokens
};
```

#### **3. Service Interfaces (`src/core/di/Interfaces.ts`)**
Type-safe interfaces for all services:

```typescript
export interface IApiService {
  sendOtp(request: SendOtpRequest): Promise<SendOtpResponse>;
  verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse>;
  // ... more methods
}
```

#### **4. Service Implementations (`src/core/di/Services.ts`)**
Concrete implementations of all service interfaces:

```typescript
class ApiServiceImpl implements IApiService {
  // Implementation of all API methods
}
```

#### **5. Service Registry (`src/core/di/Registry.ts`)**
Manages service registration and initialization:

```typescript
export class ServiceRegistry {
  registerCoreServices(): void;
  registerEnvironmentServices(): void;
  validateServices(): void;
}
```

## 🔧 Usage

### Basic Service Registration

```typescript
import { registerSingleton, SERVICE_TOKENS } from './src/core/di';

// Register a singleton service
registerSingleton(
  SERVICE_TOKENS.API_SERVICE,
  () => new ApiServiceImpl(),
  [SERVICE_TOKENS.LOGGER_SERVICE] // dependencies
);

// Register a transient service
registerTransient(
  SERVICE_TOKENS.VALIDATION_SERVICE,
  () => new ValidationServiceImpl()
);
```

### Service Resolution

```typescript
import { resolve, SERVICE_TOKENS } from './src/core/di';

// Resolve a service
const apiService = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
const tasks = await apiService.getTasks();
```

### Using DI in React Components

```typescript
import { useDependencyInjection } from './src/hooks/useDependencyInjection';

const MyComponent = () => {
  const { apiService, loggerService, validationService } = useDependencyInjection();

  const handleSubmit = async (data: any) => {
    try {
      // Validate data
      const validation = validationService.validateTaskTitle(data.title);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Log action
      loggerService.info('Creating task', data);

      // Create task
      const result = await apiService.createTask(data);
      
      loggerService.info('Task created successfully', result);
    } catch (error) {
      loggerService.error('Failed to create task', error);
    }
  };

  return (
    // Component JSX
  );
};
```

### Specific Service Hooks

```typescript
import { useApiService, useLoggerService, useValidationService } from './src/hooks/useDependencyInjection';

const MyComponent = () => {
  const apiService = useApiService();
  const loggerService = useLoggerService();
  const validationService = useValidationService();

  // Use services directly
  const handleAction = async () => {
    loggerService.info('Action started');
    const result = await apiService.getTasks();
    loggerService.info('Action completed', result);
  };

  return (
    // Component JSX
  );
};
```

## 📊 Service Categories

### Core Services

#### **API Services**
- `API_SERVICE`: Main API service for all HTTP operations
- `MOCK_API_SERVICE`: Mock API service for testing
- `REAL_API_SERVICE`: Real API service for production

#### **Storage Services**
- `STORAGE_SERVICE`: Main storage service
- `ASYNC_STORAGE_SERVICE`: AsyncStorage wrapper

#### **Utility Services**
- `LOGGER_SERVICE`: Logging service
- `VALIDATION_SERVICE`: Form and data validation
- `RETRY_SERVICE`: Retry mechanism for operations
- `PERFORMANCE_SERVICE`: Performance monitoring
- `ERROR_HANDLER_SERVICE`: Error handling and reporting

#### **Configuration Services**
- `CONFIG_SERVICE`: Application configuration
- `ENVIRONMENT_SERVICE`: Environment management

### Feature Services

#### **Authentication Services**
- `AUTH_SERVICE`: Authentication management
- `TOKEN_SERVICE`: Token management

#### **Task Services**
- `TASK_SERVICE`: Task operations
- `CATEGORY_SERVICE`: Category operations

#### **UI Services**
- `NAVIGATION_SERVICE`: Navigation management
- `THEME_SERVICE`: Theme management

#### **Analytics Services**
- `ANALYTICS_SERVICE`: Analytics tracking
- `CRASH_REPORTING_SERVICE`: Crash reporting

#### **Infrastructure Services**
- `CACHE_SERVICE`: Caching mechanism
- `NETWORK_SERVICE`: Network connectivity
- `NOTIFICATION_SERVICE`: Push notifications
- `OFFLINE_SERVICE`: Offline functionality
- `SECURITY_SERVICE`: Security operations
- `LOCALIZATION_SERVICE`: Internationalization

## 🎯 Benefits

### 1. Loose Coupling
```typescript
// Before DI - Tight coupling
class TaskService {
  private apiService = new ApiService();
  private logger = new Logger();
}

// After DI - Loose coupling
class TaskService {
  constructor(
    private apiService: IApiService,
    private logger: ILoggerService
  ) {}
}
```

### 2. Better Testability
```typescript
// Easy to mock services for testing
const mockApiService = {
  getTasks: jest.fn().mockResolvedValue([]),
  createTask: jest.fn().mockResolvedValue({ id: '1' }),
};

// Register mock service
registerSingleton(SERVICE_TOKENS.API_SERVICE, () => mockApiService);
```

### 3. Centralized Configuration
```typescript
// All services configured in one place
registerSingleton(SERVICE_TOKENS.CONFIG_SERVICE, () => new ConfigService());
registerSingleton(SERVICE_TOKENS.ENVIRONMENT_SERVICE, () => new EnvironmentService());
```

### 4. Environment-Specific Services
```typescript
// Different services for different environments
if (environment.isMock()) {
  registerSingleton(SERVICE_TOKENS.API_SERVICE, createMockApiService);
} else {
  registerSingleton(SERVICE_TOKENS.API_SERVICE, createRealApiService);
}
```

## 🔄 Service Lifecycle

### Singleton Services
```typescript
// Created once, reused throughout app lifecycle
registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, createLoggerService);
```

### Transient Services
```typescript
// New instance created each time
registerTransient(SERVICE_TOKENS.VALIDATION_SERVICE, createValidationService);
```

### Service Dependencies
```typescript
// Services can depend on other services
registerSingleton(
  SERVICE_TOKENS.API_SERVICE,
  createApiService,
  [SERVICE_TOKENS.LOGGER_SERVICE, SERVICE_TOKENS.RETRY_SERVICE]
);
```

## 🧪 Testing with DI

### Unit Testing
```typescript
import { container, SERVICE_TOKENS } from './src/core/di';

describe('TaskService', () => {
  beforeEach(() => {
    // Clear container before each test
    container.clear();
    
    // Register mock services
    registerSingleton(SERVICE_TOKENS.API_SERVICE, () => mockApiService);
    registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, () => mockLoggerService);
  });

  it('should create task', async () => {
    const taskService = resolve<ITaskService>(SERVICE_TOKENS.TASK_SERVICE);
    const result = await taskService.createTask(taskData);
    expect(result).toBeDefined();
  });
});
```

### Integration Testing
```typescript
describe('API Integration', () => {
  it('should handle authentication flow', async () => {
    const authService = resolve<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE);
    const apiService = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
    
    const result = await authService.login('phone', 'otp');
    expect(result).toBe(true);
  });
});
```

## 🔍 Debugging

### Service Validation
```typescript
import { serviceRegistry } from './src/core/di';

// Validate all services are properly registered
serviceRegistry.validateServices();
```

### Dependency Graph
```typescript
// Get dependency graph for debugging
const graph = container.getDependencyGraph();
console.log('Dependency Graph:', graph);
```

### Service Discovery
```typescript
// Get all registered services
const services = container.getRegisteredServices();
console.log('Registered Services:', services);
```

## 🚀 Advanced Features

### Circular Dependency Detection
```typescript
// The system automatically detects and prevents circular dependencies
try {
  registerSingleton('ServiceA', () => new ServiceA(), ['ServiceB']);
  registerSingleton('ServiceB', () => new ServiceB(), ['ServiceA']);
} catch (error) {
  console.error('Circular dependency detected:', error.message);
}
```

### Conditional Service Registration
```typescript
// Register services based on conditions
if (__DEV__) {
  registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, createDevLoggerService);
} else {
  registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, createProdLoggerService);
}
```

### Service Overrides
```typescript
// Override services for testing
registerSingleton(SERVICE_TOKENS.API_SERVICE, () => mockApiService);
```

## 📈 Performance Considerations

### Lazy Loading
```typescript
// Services are created only when first accessed
const apiService = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
// Service is created here, not during registration
```

### Memory Management
```typescript
// Clear services when not needed
container.clear(); // Clears all services
container.remove('SERVICE_TOKEN'); // Remove specific service
```

### Service Caching
```typescript
// Singleton services are cached
const service1 = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
const service2 = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
// service1 === service2 (same instance)
```

## 🔧 Configuration

### Environment-Specific Registration
```typescript
// Different services for different environments
switch (environment) {
  case 'mock':
    registerMockServices();
    break;
  case 'development':
    registerDevelopmentServices();
    break;
  case 'production':
    registerProductionServices();
    break;
}
```

### Service Configuration
```typescript
// Configure services with options
registerSingleton(
  SERVICE_TOKENS.API_SERVICE,
  () => new ApiService({
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    retryAttempts: config.api.retryAttempts,
  })
);
```

## 🎯 Best Practices

### 1. Interface-First Design
```typescript
// Define interfaces before implementations
export interface IApiService {
  getTasks(): Promise<Task[]>;
  createTask(task: CreateTaskRequest): Promise<Task>;
}

// Implement the interface
class ApiServiceImpl implements IApiService {
  // Implementation
}
```

### 2. Single Responsibility
```typescript
// Each service has a single responsibility
class LoggerService implements ILoggerService {
  // Only logging functionality
}

class ValidationService implements IValidationService {
  // Only validation functionality
}
```

### 3. Dependency Injection
```typescript
// Inject dependencies rather than creating them
class TaskService {
  constructor(
    private apiService: IApiService,
    private logger: ILoggerService,
    private validation: IValidationService
  ) {}
}
```

### 4. Service Composition
```typescript
// Compose complex services from simple ones
registerSingleton(
  SERVICE_TOKENS.TASK_SERVICE,
  () => new TaskService(
    resolve<IApiService>(SERVICE_TOKENS.API_SERVICE),
    resolve<ILoggerService>(SERVICE_TOKENS.LOGGER_SERVICE),
    resolve<IValidationService>(SERVICE_TOKENS.VALIDATION_SERVICE)
  )
);
```

### 5. Error Handling
```typescript
// Handle service resolution errors
try {
  const service = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
} catch (error) {
  if (error.name === 'DependencyInjectionError') {
    console.error('Service not found:', error.message);
  }
}
```

## 🔄 Migration Guide

### From Direct Instantiation
```typescript
// Before
class MyComponent {
  private apiService = new ApiService();
  private logger = new Logger();
}

// After
const MyComponent = () => {
  const { apiService, loggerService } = useDependencyInjection();
};
```

### From Singleton Pattern
```typescript
// Before
class ApiService {
  private static instance: ApiService;
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
}

// After
registerSingleton(SERVICE_TOKENS.API_SERVICE, () => new ApiService());
const apiService = resolve<IApiService>(SERVICE_TOKENS.API_SERVICE);
```

This dependency injection system provides a robust foundation for building scalable, testable, and maintainable React Native applications while following SOLID principles and best practices. 
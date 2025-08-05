# Environment Setup & Development Flavors

## Overview

TodoRN supports three distinct development environments (flavors) to facilitate different stages of development and testing:

- **Mock Environment** - For development and testing with simulated data
- **Development Environment** - For testing with real API endpoints
- **Production Environment** - For final testing and release

## Environment Configuration

### Environment Detection

The app automatically detects the environment based on:

1. **Environment Variable**: `EXPO_PUBLIC_ENVIRONMENT`
2. **Development Flag**: `__DEV__` and `EXPO_PUBLIC_USE_MOCK`
3. **Default Fallback**: Production

### Configuration Files

Each environment has its own configuration in `src/config/environments.ts`:

```typescript
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
  // ... development and production configs
};
```

## Running Different Environments

### 1. Mock Environment

**Purpose**: Development and testing with simulated data

```bash
# Start with mock environment
npm run start:mock
# or
EXPO_PUBLIC_ENVIRONMENT=mock expo start

# Run on Android
npm run android:mock

# Run on iOS
npm run ios:mock

# Build for mock
npm run build:mock
```

**Features**:
- ✅ Local storage persistence
- ✅ Simulated network delays
- ✅ Error simulation for testing
- ✅ No external API dependencies
- ✅ Fast development cycles

### 2. Development Environment

**Purpose**: Testing with real API endpoints

```bash
# Start with development environment
npm run start:dev
# or
EXPO_PUBLIC_ENVIRONMENT=development expo start

# Run on Android
npm run android:dev

# Run on iOS
npm run ios:dev

# Build for development
npm run build:dev
```

**Features**:
- ✅ Connects to development API server
- ✅ Debug logging enabled
- ✅ Analytics and crash reporting
- ✅ Real network requests
- ✅ Development-specific features

### 3. Production Environment

**Purpose**: Final testing and release

```bash
# Start with production environment
npm run start:prod
# or
EXPO_PUBLIC_ENVIRONMENT=production expo start

# Run on Android
npm run android:prod

# Run on iOS
npm run ios:prod

# Build for production
npm run build:prod
```

**Features**:
- ✅ Connects to production API server
- ✅ Optimized performance
- ✅ Minimal logging
- ✅ All features enabled
- ✅ Production-ready settings

## EAS Build Configuration

The `eas.json` file includes build profiles for each environment:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      }
    },
    "development-mock": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "mock"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      }
    },
    "preview-mock": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "mock"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  }
}
```

### Building for Different Environments

```bash
# Build development APK
eas build --profile development --platform android

# Build mock APK
eas build --profile development-mock --platform android

# Build production APK
eas build --profile production --platform android

# Build for iOS
eas build --profile production --platform ios
```

## Environment-Specific App Configurations

### Mock Environment (`app.mock.json`)
- App name: "TodoRN (Mock)"
- Bundle ID: `com.todorn.app.mock`
- Icon color: Purple (#6750A4)
- Debug features enabled

### Development Environment (`app.development.json`)
- App name: "TodoRN (Dev)"
- Bundle ID: `com.todorn.app.dev`
- Icon color: Green (#4CAF50)
- Debug features enabled

### Production Environment (`app.production.json`)
- App name: "TodoRN"
- Bundle ID: `com.todorn.app`
- Icon color: White (#FFFFFF)
- Optimized for release

## Environment Features Comparison

| Feature | Mock | Development | Production |
|---------|------|-------------|------------|
| **API Mode** | Mock (Local) | Real (Dev Server) | Real (Prod Server) |
| **Debug Logging** | ✅ Full | ✅ Full | ❌ Minimal |
| **Analytics** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Crash Reporting** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Push Notifications** | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| **Offline Support** | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Storage Encryption** | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| **Backup** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Network Timeout** | 5s | 10s | 15s |
| **Retry Attempts** | 1 | 3 | 3 |

## Environment Switching

### Runtime Switching

You can switch environments at runtime using the Environment Selector screen:

```typescript
import { devHelpers } from './src/utils/apiConfig';

// Switch to mock mode
await devHelpers.enableMockApi();

// Switch to real API mode
await devHelpers.enableRealApi();
```

### Programmatic Switching

```typescript
import { getEnvironment, getConfig } from './src/config/environments';

// Get current environment
const env = getEnvironment(); // 'mock' | 'development' | 'production'

// Get environment configuration
const config = getConfig();

// Check environment
if (isMock()) {
  // Mock-specific logic
} else if (isDevelopment()) {
  // Development-specific logic
} else if (isProduction()) {
  // Production-specific logic
}
```

## Logging and Debugging

### Environment-Aware Logging

The logger respects environment configuration:

```typescript
import logger from './src/utils/logger';

// These logs respect the environment's log level
logger.debug('Debug message'); // Only in debug environments
logger.info('Info message');   // Info and above
logger.warn('Warning message'); // Warn and above
logger.error('Error message'); // Always logged
```

### Environment Information

```typescript
// Log current environment configuration
logger.logEnvironment();

// Output:
// [2024-01-15T10:30:00.000Z] [Mock] [INFO] Environment Configuration
// {
//   "name": "Mock",
//   "debug": true,
//   "logLevel": "debug",
//   "api": {
//     "baseUrl": "https://api.todoapp.com/v1",
//     "mockMode": true,
//     "timeout": 5000
//   },
//   "features": {
//     "analytics": false,
//     "crashReporting": false,
//     "pushNotifications": false,
//     "offlineSupport": true
//   }
// }
```

## Development Workflow

### 1. Initial Development (Mock Environment)

```bash
# Start with mock environment for fast development
npm run start:mock

# Features available:
# - Local data persistence
# - Simulated API responses
# - Error simulation
# - Fast iteration cycles
```

### 2. API Integration Testing (Development Environment)

```bash
# Switch to development environment
npm run start:dev

# Features available:
# - Real API endpoints
# - Debug logging
# - Development server
# - Full feature testing
```

### 3. Production Testing (Production Environment)

```bash
# Test production configuration
npm run start:prod

# Features available:
# - Production API endpoints
# - Optimized performance
# - Release-ready settings
# - Final validation
```

## Environment Variables

### Available Environment Variables

- `EXPO_PUBLIC_ENVIRONMENT`: Set to 'mock', 'development', or 'production'
- `EXPO_PUBLIC_USE_MOCK`: Set to 'true' to force mock mode in development

### Setting Environment Variables

```bash
# Set environment variable
export EXPO_PUBLIC_ENVIRONMENT=mock

# Or inline with command
EXPO_PUBLIC_ENVIRONMENT=development npm start
```

## Troubleshooting

### Common Issues

1. **Environment not switching**:
   - Restart the development server
   - Clear Metro cache: `npx expo start --clear`
   - Check environment variable spelling

2. **API not responding**:
   - Verify API server is running (for dev/prod)
   - Check network connectivity
   - Verify API base URL in configuration

3. **Build failures**:
   - Ensure all environment variables are set
   - Check EAS build configuration
   - Verify app.json configurations

### Debug Commands

```bash
# Check current environment
npm run env:mock
npm run env:dev
npm run env:prod

# Clear all caches
npx expo start --clear
npx expo install --fix

# Check environment in app
# Look for environment logs in console
```

## Best Practices

### Development

1. **Start with Mock**: Use mock environment for initial development
2. **Test with Dev**: Switch to development for API integration
3. **Validate with Prod**: Use production for final testing

### Testing

1. **Unit Tests**: Run in mock environment
2. **Integration Tests**: Run in development environment
3. **E2E Tests**: Run in production environment

### Deployment

1. **Development Builds**: Use development-mock or development profiles
2. **Staging Builds**: Use preview profiles
3. **Production Builds**: Use production profile

## Migration Guide

### From Single Environment to Multi-Environment

1. **Update imports**: Use environment-aware configuration
2. **Update logging**: Use the new logger utility
3. **Update API calls**: Use the unified API service
4. **Test all environments**: Verify functionality in each environment

### Environment-Specific Code

```typescript
// Instead of __DEV__ checks, use environment functions
import { isMock, isDevelopment, isProduction } from './src/config/environments';

if (isMock()) {
  // Mock-specific code
} else if (isDevelopment()) {
  // Development-specific code
} else if (isProduction()) {
  // Production-specific code
}
```

## Support

For environment-related issues:

1. Check the troubleshooting section
2. Verify environment variable settings
3. Review the configuration files
4. Test with different environment commands
5. Check the console logs for environment information 
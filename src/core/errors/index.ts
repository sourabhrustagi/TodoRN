import logger from '../../utils/logger';

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number, details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 422, { field, ...details });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

// Error handler
export class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | AppError, context?: string): void {
    if (error instanceof AppError) {
      this.handleAppError(error, context);
    } else {
      this.handleGenericError(error, context);
    }
  }

  private handleAppError(error: AppError, context?: string): void {
    logger.error(`App Error [${error.code}]: ${error.message}`, {
      context,
      statusCode: error.statusCode,
      details: error.details,
    });

    // Log to analytics/crash reporting in production
    if (process.env.NODE_ENV === 'production') {
      // Send to crash reporting service
      this.reportToAnalytics(error, context);
    }
  }

  private handleGenericError(error: Error, context?: string): void {
    logger.error(`Generic Error: ${error.message}`, {
      context,
      stack: error.stack,
    });

    // Log to analytics/crash reporting in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToAnalytics(error, context);
    }
  }

  private reportToAnalytics(error: Error, context?: string): void {
    // Implementation for crash reporting service
    // Example: Sentry.captureException(error, { extra: { context } });
    console.log('Error reported to analytics:', { error, context });
  }

  // Error recovery strategies
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
          error: lastError.message,
        });

        await this.delay(delay * attempt); // Exponential backoff
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Error boundary helper
  createErrorBoundary(componentName: string) {
    return (error: Error, errorInfo: any) => {
      logger.error(`Error in ${componentName}`, {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });
    };
  }
}

// Global error handler
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: Error | AppError, context?: string) => 
  errorHandler.handleError(error, context);

export const retryOperation = <T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  delay?: number
) => errorHandler.retryOperation(operation, maxRetries, delay);

export const createErrorBoundary = (componentName: string) => 
  errorHandler.createErrorBoundary(componentName);

// Error utilities
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const getErrorMessage = (error: Error | AppError): string => {
  if (isAppError(error)) {
    return error.message;
  }
  return error.message || 'An unexpected error occurred';
};

export const getErrorCode = (error: Error | AppError): string => {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
};

export default {
  AppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  errorHandler,
  handleError,
  retryOperation,
  createErrorBoundary,
  isAppError,
  isNetworkError,
  isValidationError,
  isAuthenticationError,
  getErrorMessage,
  getErrorCode,
}; 
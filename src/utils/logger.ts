// Logger utility for React Native

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const prefix = context ? `[${context}]` : '';
    const logMessage = `${prefix} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, error || data);
        break;
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  // Specialized logging methods
  logTaskOperation(operation: string, taskId: string, data?: any) {
    this.info(`${operation} task`, 'Task', { taskId, ...data });
  }

  logAuthOperation(operation: string, userId?: string, data?: any) {
    this.info(`${operation}`, 'Auth', { userId, ...data });
  }

  logNavigation(from: string, to: string, params?: any) {
    this.debug(`Navigation: ${from} → ${to}`, 'Navigation', { params });
  }

  logPerformance(operation: string, duration: number, data?: any) {
    this.debug(`${operation} took ${duration}ms`, 'Performance', { duration, ...data });
  }

  logError(error: Error, context?: string, data?: any) {
    this.error(error.message, context, error, data);
  }

  logNetworkRequest(url: string, method: string, status?: number, data?: any) {
    this.info(`${method} ${url}`, 'Network', { status, ...data });
  }

  logNetworkError(url: string, method: string, error: Error, data?: any) {
    this.error(`Network error: ${method} ${url}`, 'Network', error, data);
  }

  // Utility methods
  setLogLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Error tracking
  trackError(error: Error, context?: string, data?: any) {
    this.error(error.message, context, error, data);
    
    // In a real app, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: { context, data } });
  }

  // Performance tracking
  trackPerformance(operation: string, startTime: number, data?: any) {
    const duration = Date.now() - startTime;
    this.logPerformance(operation, duration, data);
  }

  // User action tracking
  trackUserAction(action: string, data?: any) {
    this.info(`User action: ${action}`, 'User', data);
  }

  // App lifecycle tracking
  trackAppLifecycle(event: 'start' | 'foreground' | 'background' | 'stop', data?: any) {
    this.info(`App ${event}`, 'Lifecycle', data);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const debug = (message: string, context?: string, data?: any) => 
  logger.debug(message, context, data);

export const info = (message: string, context?: string, data?: any) => 
  logger.info(message, context, data);

export const warn = (message: string, context?: string, data?: any) => 
  logger.warn(message, context, data);

export const error = (message: string, context?: string, error?: Error, data?: any) => 
  logger.error(message, context, error, data);

export const logTask = (operation: string, taskId: string, data?: any) => 
  logger.logTaskOperation(operation, taskId, data);

export const logAuth = (operation: string, userId?: string, data?: any) => 
  logger.logAuthOperation(operation, userId, data);

export const logNavigation = (from: string, to: string, params?: any) => 
  logger.logNavigation(from, to, params);

export const logPerformance = (operation: string, duration: number, data?: any) => 
  logger.logPerformance(operation, duration, data);

export const logError = (error: Error, context?: string, data?: any) => 
  logger.logError(error, context, data);

export const trackError = (error: Error, context?: string, data?: any) => 
  logger.trackError(error, context, data);

export const trackPerformance = (operation: string, startTime: number, data?: any) => 
  logger.trackPerformance(operation, startTime, data);

export const trackUserAction = (action: string, data?: any) => 
  logger.trackUserAction(action, data);

export const trackAppLifecycle = (event: 'start' | 'foreground' | 'background' | 'stop', data?: any) => 
  logger.trackAppLifecycle(event, data); 
import { APP_CONSTANTS } from '../constants/app';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel;
  private isDebug: boolean;

  constructor() {
    this.logLevel = APP_CONSTANTS.ENVIRONMENT.LOG_LEVEL;
    this.isDebug = APP_CONSTANTS.ENVIRONMENT.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDebug && level === 'debug') {
      return false;
    }

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const env = APP_CONSTANTS.ENVIRONMENT.NAME;
    const prefix = `[${timestamp}] [${env}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
    }
  }

  // API-specific logging
  api(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, data);
  }

  // Redux action logging
  action(type: string, payload?: any): void {
    this.debug(`Redux Action: ${type}`, payload);
  }

  // Performance logging
  performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }

  // Environment info
  logEnvironment(): void {
    this.info('Environment Configuration', {
      name: APP_CONSTANTS.ENVIRONMENT.NAME,
      debug: APP_CONSTANTS.ENVIRONMENT.DEBUG,
      logLevel: APP_CONSTANTS.ENVIRONMENT.LOG_LEVEL,
      api: {
        baseUrl: APP_CONSTANTS.API.BASE_URL,
        mockMode: APP_CONSTANTS.API.MOCK_MODE,
        timeout: APP_CONSTANTS.API.TIMEOUT,
      },
      features: {
        analytics: APP_CONSTANTS.FEATURES.ANALYTICS,
        crashReporting: APP_CONSTANTS.FEATURES.CRASH_REPORTING,
        pushNotifications: APP_CONSTANTS.FEATURES.PUSH_NOTIFICATIONS,
        offlineSupport: APP_CONSTANTS.FEATURES.OFFLINE_SUPPORT,
      },
    });
  }
}

export const logger = new Logger();
export default logger; 
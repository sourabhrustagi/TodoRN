// Logger utility for the app

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private level = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` [${context}]` : '';
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    
    return `[${timestamp}] ${levelName}${contextStr}: ${message}${dataStr}`;
  }

  private addLog(level: LogLevel, message: string, context?: string, data?: any) {
    if (level < this.level) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    const formattedMessage = this.formatMessage(level, message, context, data);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.addLog(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.addLog(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.addLog(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any) {
    this.addLog(LogLevel.ERROR, message, context, data);
  }

  // Specialized logging methods
  logTaskOperation(operation: string, taskId: string, data?: any) {
    this.info(`Task ${operation}`, 'TaskOperation', { taskId, ...data });
  }

  logAuthOperation(operation: string, data?: any) {
    this.info(`Auth ${operation}`, 'AuthOperation', data);
  }

  logNavigation(from: string, to: string) {
    this.debug(`Navigation: ${from} → ${to}`, 'Navigation');
  }

  logPerformance(operation: string, duration: number) {
    this.debug(`Performance: ${operation} took ${duration}ms`, 'Performance');
  }

  logError(error: Error, context?: string) {
    this.error(error.message, context, {
      stack: error.stack,
      name: error.name,
    });
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  exportLogs(): string {
    return this.logs
      .map(log => this.formatMessage(log.level, log.message, log.context, log.data))
      .join('\n');
  }
}

export const logger = new Logger(); 
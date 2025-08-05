import { APP_CONSTANTS } from '../constants/app';
import logger from './logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = APP_CONSTANTS.ENVIRONMENT.DEBUG;
  }

  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);
    logger.debug(`Performance timer started: ${name}`, metadata);
  }

  endTimer(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance timer not found: ${name}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.metadata = { ...metric.metadata, ...additionalMetadata };

    logger.debug(`Performance timer ended: ${name}`, {
      duration: metric.duration,
      metadata: metric.metadata,
    });

    this.metrics.delete(name);
    return metric.duration;
  }

  measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return asyncFn();
    }

    this.startTimer(name, metadata);

    return asyncFn()
      .then((result) => {
        this.endTimer(name, { success: true });
        return result;
      })
      .catch((error) => {
        this.endTimer(name, { success: false, error: error.message });
        throw error;
      });
  }

  measureSync<T>(
    name: string,
    syncFn: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.enabled) {
      return syncFn();
    }

    this.startTimer(name, metadata);

    try {
      const result = syncFn();
      this.endTimer(name, { success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { success: false, error: error.message });
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  generateReport(): Record<string, any> {
    const metrics = Array.from(this.metrics.values());
    const completedMetrics = metrics.filter(m => m.duration !== undefined);

    if (completedMetrics.length === 0) {
      return { message: 'No completed metrics found' };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const avgDuration = totalDuration / completedMetrics.length;
    const minDuration = Math.min(...completedMetrics.map(m => m.duration || 0));
    const maxDuration = Math.max(...completedMetrics.map(m => m.duration || 0));

    return {
      totalMetrics: completedMetrics.length,
      totalDuration,
      averageDuration: avgDuration,
      minDuration,
      maxDuration,
      metrics: completedMetrics.map(m => ({
        name: m.name,
        duration: m.duration,
        metadata: m.metadata,
      })),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startTimer = (name: string, metadata?: Record<string, any>) => 
  performanceMonitor.startTimer(name, metadata);

export const endTimer = (name: string, additionalMetadata?: Record<string, any>) => 
  performanceMonitor.endTimer(name, additionalMetadata);

export const measureAsync = <T>(
  name: string,
  asyncFn: () => Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measureAsync(name, asyncFn, metadata);

export const measureSync = <T>(
  name: string,
  syncFn: () => T,
  metadata?: Record<string, any>
) => performanceMonitor.measureSync(name, syncFn, metadata);

export const getPerformanceReport = () => performanceMonitor.generateReport();

export default performanceMonitor; 
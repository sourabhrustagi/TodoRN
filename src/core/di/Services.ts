import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../../constants/app';
import ApiService from '../../services/ApiService';
import MockApiService from '../../services/MockApiService';
import RealApiService from '../../services/RealApiService';
import logger from '../../utils/logger';
import { retryManager } from '../../utils/retry';
import performanceMonitor from '../../utils/performance';
import { validateField, validateForm, isFormValid, getFirstError, sanitizeInput, formatValidationError } from '../../utils/validation';
import { getEnvironment, getConfig, isMockMode, isDevelopment, isProduction, isMock } from '../../config/environments';
import { errorHandler } from '../../core/errors';
import { SERVICE_IDENTIFIERS } from './Container';
import {
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

// API Service Implementation
@injectable()
export class ApiServiceImpl implements IApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  async sendOtp(request: any): Promise<any> {
    return this.apiService.sendOtp(request);
  }

  async verifyOtp(request: any): Promise<any> {
    return this.apiService.verifyOtp(request);
  }

  async logout(): Promise<any> {
    return this.apiService.logout();
  }

  async getTasks(params?: any): Promise<any> {
    return this.apiService.getTasks(params);
  }

  async getTask(taskId: string): Promise<any> {
    return this.apiService.getTask(taskId);
  }

  async createTask(request: any): Promise<any> {
    return this.apiService.createTask(request);
  }

  async updateTask(taskId: string, request: any): Promise<any> {
    return this.apiService.updateTask(taskId, request);
  }

  async deleteTask(taskId: string): Promise<any> {
    return this.apiService.deleteTask(taskId);
  }

  async completeTask(taskId: string): Promise<any> {
    return this.apiService.completeTask(taskId);
  }

  async getCategories(): Promise<any> {
    return this.apiService.getCategories();
  }

  async createCategory(request: any): Promise<any> {
    return this.apiService.createCategory(request);
  }

  async updateCategory(categoryId: string, request: any): Promise<any> {
    return this.apiService.updateCategory(categoryId, request);
  }

  async deleteCategory(categoryId: string): Promise<any> {
    return this.apiService.deleteCategory(categoryId);
  }

  async bulkOperation(request: any): Promise<any> {
    return this.apiService.bulkOperation(request);
  }

  async searchTasks(request: any): Promise<any> {
    return this.apiService.searchTasks(request);
  }

  async getAnalytics(): Promise<any> {
    return this.apiService.getAnalytics();
  }

  async submitFeedback(request: any): Promise<any> {
    return this.apiService.submitFeedback(request);
  }

  async getFeedback(): Promise<any> {
    return this.apiService.getFeedback();
  }

  async getAuthStatus(): Promise<any> {
    return this.apiService.getAuthStatus();
  }

  async refreshToken(): Promise<boolean> {
    // Mock implementation since ApiService doesn't have refreshToken
    return true;
  }

  async initialize(): Promise<void> {
    return this.apiService.initialize();
  }

  setMockMode(enabled: boolean): void {
    this.apiService.setMockMode(enabled);
  }

  getMockMode(): boolean {
    return this.apiService.getMockMode();
  }
}

// Storage Service Implementation
@injectable()
export class StorageServiceImpl implements IStorageService {
  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue || null;
      return JSON.parse(value);
    } catch (error) {
      logger.error('Storage getItem error', error);
      return defaultValue || null;
    }
  }

  async setItem<T>(key: string, value: T, options?: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Storage setItem error', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage removeItem error', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Storage clear error', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly to mutable
    } catch (error) {
      logger.error('Storage getAllKeys error', error);
      return [];
    }
  }

  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      for (const [key, value] of keyValuePairs) {
        result[key] = value ? JSON.parse(value) : null;
      }
      
      return result;
    } catch (error) {
      logger.error('Storage multiGet error', error);
      return {};
    }
  }

  async multiSet<T>(keyValuePairs: Record<string, T>, options?: any): Promise<void> {
    try {
      const pairs: [string, string][] = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      logger.error('Storage multiSet error', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('Storage multiRemove error', error);
      throw error;
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Storage getStorageSize error', error);
      return 0;
    }
  }

  async getStorageInfo(): Promise<{ keyCount: number; totalSize: number; keys: string[] }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const totalSize = await this.getStorageSize();
      
      return {
        keyCount: keys.length,
        totalSize,
        keys: [...keys], // Convert readonly to mutable
      };
    } catch (error) {
      logger.error('Storage getStorageInfo error', error);
      return {
        keyCount: 0,
        totalSize: 0,
        keys: [],
      };
    }
  }
}

// Logger Service Implementation
@injectable()
export class LoggerServiceImpl implements ILoggerService {
  debug(message: string, data?: any): void {
    logger.debug(message, data);
  }

  info(message: string, data?: any): void {
    logger.info(message, data);
  }

  warn(message: string, data?: any): void {
    logger.warn(message, data);
  }

  error(message: string, error?: any): void {
    logger.error(message, error);
  }

  api(method: string, url: string, data?: any): void {
    logger.api(method, url, data);
  }

  action(type: string, payload?: any): void {
    logger.action(type, payload);
  }

  performance(operation: string, duration: number): void {
    logger.performance(operation, duration);
  }

  logEnvironment(): void {
    logger.logEnvironment();
  }
}

// Validation Service Implementation
@injectable()
export class ValidationServiceImpl implements IValidationService {
  validatePhone(phone: string): { isValid: boolean; errors: string[] } {
    return validateField(phone, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('Phone number is required');
      if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
        errors.push('Invalid phone number format');
      }
      return errors;
    });
  }

  validateOtp(otp: string): { isValid: boolean; errors: string[] } {
    return validateField(otp, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('OTP is required');
      if (value && !/^\d{4,6}$/.test(value)) {
        errors.push('OTP must be 4-6 digits');
      }
      return errors;
    });
  }

  validateEmail(email: string): { isValid: boolean; errors: string[] } {
    return validateField(email, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('Email is required');
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Invalid email format');
      }
      return errors;
    });
  }

  validateTaskTitle(title: string): { isValid: boolean; errors: string[] } {
    return validateField(title, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('Task title is required');
      if (value && value.length < 3) {
        errors.push('Task title must be at least 3 characters');
      }
      if (value && value.length > 100) {
        errors.push('Task title must be less than 100 characters');
      }
      return errors;
    });
  }

  validateTaskDescription(description: string): { isValid: boolean; errors: string[] } {
    return validateField(description, (value: string) => {
      const errors: string[] = [];
      if (value && value.length > 500) {
        errors.push('Task description must be less than 500 characters');
      }
      return errors;
    });
  }

  validateFeedback(feedback: string): { isValid: boolean; errors: string[] } {
    return validateField(feedback, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('Feedback is required');
      if (value && value.length < 10) {
        errors.push('Feedback must be at least 10 characters');
      }
      if (value && value.length > 1000) {
        errors.push('Feedback must be less than 1000 characters');
      }
      return errors;
    });
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return validateField(password, (value: string) => {
      const errors: string[] = [];
      if (!value) errors.push('Password is required');
      if (value && value.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        errors.push('Password must contain uppercase, lowercase, and number');
      }
      return errors;
    });
  }

  validateField(value: any, validator: (value: any) => string[]): { isValid: boolean; errors: string[] } {
    return validateField(value, validator);
  }

  validateForm(formData: Record<string, any>, validators: Record<string, (value: any) => string[]>): Record<string, string[]> {
    return validateForm(formData, validators);
  }

  isFormValid(errors: Record<string, string[]>): boolean {
    return isFormValid(errors);
  }

  getFirstError(errors: Record<string, string[]>): string | null {
    return getFirstError(errors);
  }

  sanitizeInput(input: string): string {
    return sanitizeInput(input);
  }

  formatValidationError(field: string, error: string): string {
    return formatValidationError(field, error);
  }
}

// Retry Service Implementation
@injectable()
export class RetryServiceImpl implements IRetryService {
  async retry<T>(operation: () => Promise<T>, config?: any): Promise<{ success: boolean; data?: T; error?: any; attempts: number; totalTime: number }> {
    return retryManager.retry(operation, config);
  }

  async retryWithExponentialBackoff<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T> {
    return retryManager.retryWithExponentialBackoff(operation, maxAttempts);
  }

  async retryWithLinearBackoff<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T> {
    return retryManager.retryWithLinearBackoff(operation, maxAttempts);
  }

  async retryWithImmediateRetry<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T> {
    return retryManager.retryWithStrategy(operation, 'immediate');
  }

  async retryWithCustomLogic<T>(operation: () => Promise<T>, shouldRetry: (error: any, attempt: number) => boolean, maxAttempts?: number): Promise<T> {
    return retryManager.retryWithCustomLogic(operation, shouldRetry, maxAttempts);
  }

  async retryWithStrategy<T>(operation: () => Promise<T>, strategy?: 'exponential' | 'linear' | 'immediate'): Promise<T> {
    return retryManager.retryWithStrategy(operation, strategy);
  }
}

// Performance Service Implementation
@injectable()
export class PerformanceServiceImpl implements IPerformanceService {
  startTimer(name: string, metadata?: Record<string, any>): void {
    performanceMonitor.startTimer(name, metadata);
  }

  endTimer(name: string, additionalMetadata?: Record<string, any>): number | null {
    return performanceMonitor.endTimer(name, additionalMetadata);
  }

  async measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    return performanceMonitor.measureAsync(name, asyncFn, metadata);
  }

  measureSync<T>(name: string, syncFn: () => T, metadata?: Record<string, any>): T {
    return performanceMonitor.measureSync(name, syncFn, metadata);
  }

  getMetrics(): any[] {
    return performanceMonitor.getMetrics();
  }

  clearMetrics(): void {
    performanceMonitor.clearMetrics();
  }

  generateReport(): Record<string, any> {
    return performanceMonitor.generateReport();
  }
}

// Environment Service Implementation
@injectable()
export class EnvironmentServiceImpl implements IEnvironmentService {
  getEnvironment(): string {
    return getEnvironment();
  }

  getConfig(): any {
    return getConfig();
  }

  isMockMode(): boolean {
    return isMockMode();
  }

  isDevelopment(): boolean {
    return isDevelopment();
  }

  isProduction(): boolean {
    return isProduction();
  }

  isMock(): boolean {
    return isMock();
  }
}

// Error Handler Service Implementation
@injectable()
export class ErrorHandlerServiceImpl implements IErrorHandlerService {
  handleError(error: Error | any, context?: string): void {
    errorHandler.handleError(error, context);
  }

  async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
    return errorHandler.retryOperation(operation, maxRetries, delay);
  }

  createErrorBoundary(componentName: string) {
    return errorHandler.createErrorBoundary(componentName);
  }

  isAppError(error: any): boolean {
    return error && error.name === 'AppError';
  }

  isNetworkError(error: any): boolean {
    return error && error.name === 'NetworkError';
  }

  isValidationError(error: any): boolean {
    return error && error.name === 'ValidationError';
  }

  isAuthenticationError(error: any): boolean {
    return error && error.name === 'AuthenticationError';
  }

  getErrorMessage(error: Error | any): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  getErrorCode(error: Error | any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return String(error.code);
    }
    return 'UNKNOWN_ERROR';
  }
}

// Configuration Service Implementation
@injectable()
export class ConfigServiceImpl implements IConfigService {
  private config: Record<string, any> = {};

  constructor() {
    this.load();
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.config[key] ?? defaultValue;
  }

  set<T>(key: string, value: T): void {
    this.config[key] = value;
  }

  has(key: string): boolean {
    return key in this.config;
  }

  getAll(): Record<string, any> {
    return { ...this.config };
  }

  clear(): void {
    this.config = {};
  }

  async load(): Promise<void> {
    // Load configuration from storage or environment
    this.config = {
      ...APP_CONSTANTS,
      ...getConfig(),
    };
  }

  async save(): Promise<void> {
    // Save configuration to storage if needed
    logger.info('Configuration saved');
  }
}

// Mock implementations for services that are not yet implemented
@injectable()
export class MockServiceImpl {
  // Placeholder implementations
  async initialize(): Promise<void> {
    logger.info('Mock service initialized');
  }
}

export default {
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
}; 
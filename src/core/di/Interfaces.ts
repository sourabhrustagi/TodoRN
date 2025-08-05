import {
  Task,
  Category,
  User,
  Feedback,
  AppSettings,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  LoginRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  LoginResponse,
  LogoutResponse,
  TasksListResponse,
  TaskResponse,
  CategoriesListResponse,
  CategoryResponse,
  BulkOperationResponse,
  SearchTasksResponse,
  AnalyticsResponse,
  FeedbackResponse,
  FeedbackListResponse,
  CreateTaskApiRequest,
  UpdateTaskApiRequest,
  CreateCategoryApiRequest,
  UpdateCategoryApiRequest,
  FeedbackApiRequest,
  SearchTasksRequest,
  GetTasksQueryParams,
  BulkOperationRequest,
} from '../../types';

// API Service Interface
export interface IApiService {
  // Authentication
  sendOtp(request: SendOtpRequest): Promise<SendOtpResponse>;
  verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse>;
  logout(): Promise<LogoutResponse>;

  // Tasks
  getTasks(params?: GetTasksQueryParams): Promise<TasksListResponse>;
  getTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }>;
  createTask(request: CreateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }>;
  updateTask(taskId: string, request: UpdateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }>;
  deleteTask(taskId: string): Promise<{ success: boolean; message: string }>;
  completeTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }>;

  // Categories
  getCategories(): Promise<CategoriesListResponse>;
  createCategory(request: CreateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }>;
  updateCategory(categoryId: string, request: UpdateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }>;
  deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }>;

  // Bulk Operations
  bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse>;

  // Search
  searchTasks(request: SearchTasksRequest): Promise<SearchTasksResponse>;

  // Analytics
  getAnalytics(): Promise<AnalyticsResponse>;

  // Feedback
  submitFeedback(request: FeedbackApiRequest): Promise<{ success: boolean; data: FeedbackResponse }>;
  getFeedback(): Promise<FeedbackListResponse>;

  // Utility
  getAuthStatus(): Promise<{ isAuthenticated: boolean; user?: any; token?: string }>;
  refreshToken(): Promise<boolean>;
  initialize(): Promise<void>;
  setMockMode(enabled: boolean): void;
  getMockMode(): boolean;
}

// Storage Service Interface
export interface IStorageService {
  getItem<T>(key: string, defaultValue?: T): Promise<T | null>;
  setItem<T>(key: string, value: T, options?: any): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet<T>(keys: string[]): Promise<Record<string, T | null>>;
  multiSet<T>(keyValuePairs: Record<string, T>, options?: any): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
  getStorageSize(): Promise<number>;
  getStorageInfo(): Promise<{ keyCount: number; totalSize: number; keys: string[] }>;
}

// Authentication Service Interface
export interface IAuthService {
  login(phone: string, otp: string): Promise<boolean>;
  sendOtpCode(phone: string): Promise<boolean>;
  logout(): Promise<boolean>;
  checkAuth(): Promise<boolean>;
  isAuthenticated(): boolean;
  getUser(): User | null;
  getToken(): string | null;
  refreshToken(): Promise<boolean>;
  clearAuth(): Promise<void>;
}

// Token Service Interface
export interface ITokenService {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearTokens(): Promise<void>;
  isTokenValid(): Promise<boolean>;
  refreshToken(): Promise<boolean>;
}

// Task Service Interface
export interface ITaskService {
  getTasks(params?: GetTasksQueryParams): Promise<Task[]>;
  getTask(taskId: string): Promise<Task | null>;
  createTask(request: CreateTaskRequest): Promise<Task>;
  updateTask(taskId: string, request: UpdateTaskRequest): Promise<Task>;
  deleteTask(taskId: string): Promise<boolean>;
  completeTask(taskId: string): Promise<Task>;
  searchTasks(query: string): Promise<Task[]>;
  getTasksByCategory(categoryId: string): Promise<Task[]>;
  getTasksByPriority(priority: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  bulkOperation(operation: string, taskIds: string[]): Promise<{ success: boolean; updatedCount: number }>;
}

// Category Service Interface
export interface ICategoryService {
  getCategories(): Promise<Category[]>;
  getCategory(categoryId: string): Promise<Category | null>;
  createCategory(request: CreateCategoryRequest): Promise<Category>;
  updateCategory(categoryId: string, request: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(categoryId: string): Promise<boolean>;
}

// Logger Service Interface
export interface ILoggerService {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
  api(method: string, url: string, data?: any): void;
  action(type: string, payload?: any): void;
  performance(operation: string, duration: number): void;
  logEnvironment(): void;
}

// Validation Service Interface
export interface IValidationService {
  validatePhone(phone: string): { isValid: boolean; errors: string[] };
  validateOtp(otp: string): { isValid: boolean; errors: string[] };
  validateEmail(email: string): { isValid: boolean; errors: string[] };
  validateTaskTitle(title: string): { isValid: boolean; errors: string[] };
  validateTaskDescription(description: string): { isValid: boolean; errors: string[] };
  validateFeedback(feedback: string): { isValid: boolean; errors: string[] };
  validatePassword(password: string): { isValid: boolean; errors: string[] };
  validateField(value: any, validator: (value: any) => string[]): { isValid: boolean; errors: string[] };
  validateForm(formData: Record<string, any>, validators: Record<string, (value: any) => string[]>): Record<string, string[]>;
  isFormValid(errors: Record<string, string[]>): boolean;
  getFirstError(errors: Record<string, string[]>): string | null;
  sanitizeInput(input: string): string;
  formatValidationError(field: string, error: string): string;
}

// Retry Service Interface
export interface IRetryService {
  retry<T>(operation: () => Promise<T>, config?: any): Promise<{ success: boolean; data?: T; error?: any; attempts: number; totalTime: number }>;
  retryWithExponentialBackoff<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T>;
  retryWithLinearBackoff<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T>;
  retryWithImmediateRetry<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T>;
  retryWithCustomLogic<T>(operation: () => Promise<T>, shouldRetry: (error: any, attempt: number) => boolean, maxAttempts?: number): Promise<T>;
  retryWithStrategy<T>(operation: () => Promise<T>, strategy?: 'exponential' | 'linear' | 'immediate'): Promise<T>;
}

// Performance Service Interface
export interface IPerformanceService {
  startTimer(name: string, metadata?: Record<string, any>): void;
  endTimer(name: string, additionalMetadata?: Record<string, any>): number | null;
  measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: Record<string, any>): Promise<T>;
  measureSync<T>(name: string, syncFn: () => T, metadata?: Record<string, any>): T;
  getMetrics(): any[];
  clearMetrics(): void;
  generateReport(): Record<string, any>;
}

// Configuration Service Interface
export interface IConfigService {
  get<T>(key: string, defaultValue?: T): T;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  getAll(): Record<string, any>;
  clear(): void;
  load(): Promise<void>;
  save(): Promise<void>;
}

// Environment Service Interface
export interface IEnvironmentService {
  getEnvironment(): string;
  getConfig(): any;
  isMockMode(): boolean;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isMock(): boolean;
}

// Navigation Service Interface
export interface INavigationService {
  navigate(routeName: string, params?: any): void;
  goBack(): void;
  reset(routes: any[]): void;
  push(routeName: string, params?: any): void;
  pop(): void;
  canGoBack(): boolean;
  getCurrentRoute(): string;
  getCurrentParams(): any;
}

// Theme Service Interface
export interface IThemeService {
  getTheme(): any;
  setTheme(theme: string): Promise<void>;
  toggleTheme(): Promise<void>;
  isDark(): boolean;
  isLight(): boolean;
  isAuto(): boolean;
  getColors(): any;
}

// Analytics Service Interface
export interface IAnalyticsService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  screen(screenName: string, properties?: Record<string, any>): void;
  setUserProperties(properties: Record<string, any>): void;
  setSuperProperties(properties: Record<string, any>): void;
  reset(): void;
}

// Error Handler Service Interface
export interface IErrorHandlerService {
  handleError(error: Error | any, context?: string): void;
  retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
  createErrorBoundary(componentName: string): (error: Error, errorInfo: any) => void;
  isAppError(error: any): boolean;
  isNetworkError(error: any): boolean;
  isValidationError(error: any): boolean;
  isAuthenticationError(error: any): boolean;
  getErrorMessage(error: Error | any): string;
  getErrorCode(error: Error | any): string;
}

// Cache Service Interface
export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  size(): number;
  keys(): string[];
  getStats(): { size: number; hitRate: number; missRate: number };
}

// Network Service Interface
export interface INetworkService {
  isConnected(): Promise<boolean>;
  getConnectionType(): Promise<string>;
  addListener(callback: (isConnected: boolean) => void): void;
  removeListener(callback: (isConnected: boolean) => void): void;
  isOnline(): boolean;
  getNetworkState(): Promise<any>;
}

// Notification Service Interface
export interface INotificationService {
  requestPermission(): Promise<boolean>;
  hasPermission(): Promise<boolean>;
  scheduleNotification(notification: any): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  getScheduledNotifications(): Promise<any[]>;
  addListener(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: (data: any) => void): void;
}

// Offline Service Interface
export interface IOfflineService {
  isOnline(): boolean;
  sync(): Promise<void>;
  getPendingOperations(): Promise<any[]>;
  clearPendingOperations(): Promise<void>;
  addOfflineOperation(operation: any): Promise<void>;
  processOfflineOperations(): Promise<void>;
}

// Security Service Interface
export interface ISecurityService {
  encrypt(data: string): Promise<string>;
  decrypt(encryptedData: string): Promise<string>;
  hash(data: string): Promise<string>;
  verifyHash(data: string, hash: string): Promise<boolean>;
  generateSecureKey(): Promise<string>;
  isSecureStorageAvailable(): Promise<boolean>;
}

// Localization Service Interface
export interface ILocalizationService {
  getCurrentLocale(): string;
  setLocale(locale: string): Promise<void>;
  t(key: string, params?: Record<string, any>): string;
  formatDate(date: Date, format?: string): string;
  formatNumber(number: number, options?: any): string;
  formatCurrency(amount: number, currency?: string): string;
  isRTL(): boolean;
}

// Feature Flag Service Interface
export interface IFeatureFlagService {
  isEnabled(feature: string): boolean;
  getValue(feature: string, defaultValue?: any): any;
  setValue(feature: string, value: any): void;
  refresh(): Promise<void>;
  getAllFlags(): Record<string, any>;
}

export default {
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
}; 
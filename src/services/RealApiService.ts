import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginResponse,
  SendOtpResponse,
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
  SendOtpRequest,
  VerifyOtpRequest,
  CreateTaskApiRequest,
  UpdateTaskApiRequest,
  CreateCategoryApiRequest,
  UpdateCategoryApiRequest,
  FeedbackApiRequest,
  SearchTasksRequest,
  GetTasksQueryParams,
  BulkOperationRequest,
  ApiError,
} from '../types';
import { APP_CONSTANTS } from '../constants/app';
import { retryWithExponentialBackoff } from '../utils/retry';
import logger from '../utils/logger';

class RealApiService {
  private static instance: RealApiService;
  private baseUrl: string;
  private timeout: number;

  private constructor() {
    this.baseUrl = APP_CONSTANTS.API.BASE_URL;
    this.timeout = APP_CONSTANTS.API.TIMEOUT;
  }

  static getInstance(): RealApiService {
    if (!RealApiService.instance) {
      RealApiService.instance = new RealApiService();
    }
    return RealApiService.instance;
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const makeRequestWithRetry = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
          (error as any).status = response.status;
          throw error;
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle abort error (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        // Re-throw the error for retry mechanism
        throw error;
      }
    };

    // Use retry mechanism for all API calls
    return retryWithExponentialBackoff(makeRequestWithRetry, APP_CONSTANTS.API.RETRY_ATTEMPTS);
  }

  // Authentication APIs
  async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    return this.makeRequest<SendOtpResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store tokens
    if (response.success && response.data) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<LogoutResponse> {
    const response = await this.makeRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });

    // Clear stored tokens
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);

    return response;
  }

  // Task APIs
  async getTasks(params: GetTasksQueryParams = {}): Promise<TasksListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.completed !== undefined) queryParams.append('completed', params.completed.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

    return this.handleAuthError(() => 
      this.makeRequest<TasksListResponse>(endpoint, {
        method: 'GET',
      })
    );
  }

  async getTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }> {
    return this.makeRequest<{ success: boolean; data: TaskResponse }>(`/tasks/${taskId}`, {
      method: 'GET',
    });
  }

  async createTask(request: CreateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }> {
    return this.handleAuthError(() =>
      this.makeRequest<{ success: boolean; data: TaskResponse }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    );
  }

  async updateTask(taskId: string, request: UpdateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }> {
    return this.handleAuthError(() =>
      this.makeRequest<{ success: boolean; data: TaskResponse }>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      })
    );
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }> {
    return this.makeRequest<{ success: boolean; data: TaskResponse }>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }

  // Category APIs
  async getCategories(): Promise<CategoriesListResponse> {
    return this.makeRequest<CategoriesListResponse>('/categories', {
      method: 'GET',
    });
  }

  async createCategory(request: CreateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }> {
    return this.makeRequest<{ success: boolean; data: CategoryResponse }>('/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCategory(categoryId: string, request: UpdateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }> {
    return this.makeRequest<{ success: boolean; data: CategoryResponse }>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Bulk Operations
  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    return this.makeRequest<BulkOperationResponse>('/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Search
  async searchTasks(request: SearchTasksRequest): Promise<SearchTasksResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', request.q);
    if (request.fields) queryParams.append('fields', request.fields);
    if (request.fuzzy !== undefined) queryParams.append('fuzzy', request.fuzzy.toString());

    return this.makeRequest<SearchTasksResponse>(`/tasks/search?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsResponse> {
    return this.makeRequest<AnalyticsResponse>('/tasks/analytics', {
      method: 'GET',
    });
  }

  // Feedback
  async submitFeedback(request: FeedbackApiRequest): Promise<{ success: boolean; data: FeedbackResponse }> {
    return this.makeRequest<{ success: boolean; data: FeedbackResponse }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getFeedback(): Promise<FeedbackListResponse> {
    return this.makeRequest<FeedbackListResponse>('/feedback', {
      method: 'GET',
    });
  }

  // Utility methods
  async getAuthStatus(): Promise<{ isAuthenticated: boolean; user?: any; token?: string }> {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      return {
        isAuthenticated: true,
        user,
        token,
      };
    }
    
    return {
      isAuthenticated: false,
    };
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await this.makeRequest<LoginResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        await AsyncStorage.setItem('auth_token', response.data.token);
        await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
        logger.info('Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to refresh token', error);
      return false;
    }
  }

  // Method to handle 401 errors with token refresh
  private async handleAuthError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error && (error as any).status === 401) {
        logger.info('Token expired, attempting to refresh');
        
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          logger.info('Token refreshed, retrying original request');
          return await operation();
        } else {
          logger.error('Token refresh failed, clearing auth data');
          await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
          throw new Error('Authentication failed');
        }
      }
      throw error;
    }
  }
}

export default RealApiService; 
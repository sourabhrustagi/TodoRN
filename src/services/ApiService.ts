import { APP_CONSTANTS } from '../constants/app';
import MockApiService from './MockApiService';
import RealApiService from './RealApiService';
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
} from '../types';

class ApiService {
  private static instance: ApiService;
  private mockService: MockApiService;
  private realService: RealApiService;
  private isMockMode: boolean;

  private constructor() {
    this.mockService = MockApiService.getInstance();
    this.realService = RealApiService.getInstance();
    this.isMockMode = APP_CONSTANTS.API.MOCK_MODE;
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Method to switch between mock and real API
  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
    console.log(`ApiService: Switched to ${enabled ? 'mock' : 'real'} API mode`);
  }

  getMockMode(): boolean {
    return this.isMockMode;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isMockMode) {
      await this.mockService.initialize();
    }
  }

  // Authentication APIs
  async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    if (this.isMockMode) {
      const result = await this.mockService.sendOtp(request.phoneNumber);
      return {
        success: result.success,
        data: {
          message: result.message,
          expiresIn: 300,
        },
      };
    } else {
      return this.realService.sendOtp(request);
    }
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse> {
    if (this.isMockMode) {
      const result = await this.mockService.verifyOtp({
        phone: request.phoneNumber,
        otp: request.otp,
      });
      
      if (result.success && result.user && result.token) {
        return {
          success: true,
          data: {
            token: result.token,
            refreshToken: `refresh_${result.token}`,
            expiresIn: 3600,
            user: {
              id: result.user.id,
              phoneNumber: result.user.phone,
              name: result.user.name,
            },
          },
        };
      } else {
        return {
          success: false,
          data: {
            token: '',
            refreshToken: '',
            expiresIn: 0,
            user: {
              id: '',
              phoneNumber: '',
              name: '',
            },
          },
        };
      }
    } else {
      return this.realService.verifyOtp(request);
    }
  }

  async logout(): Promise<LogoutResponse> {
    if (this.isMockMode) {
      const result = await this.mockService.logout();
      return {
        success: result.success,
        message: result.message,
      };
    } else {
      return this.realService.logout();
    }
  }

  // Task APIs - Mock mode uses old interface, Real mode uses new interface
  async getTasks(params: GetTasksQueryParams = {}): Promise<TasksListResponse> {
    if (this.isMockMode) {
      const tasks = await this.mockService.getTasks();
      const mockResponse: TasksListResponse = {
        success: true,
        data: {
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: {
              id: task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: task.dueDate ? task.dueDate.toISOString() : '',
            completed: task.completed,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          })),
          pagination: {
            page: params.page || 1,
            limit: params.limit || 20,
            total: tasks.length,
            totalPages: Math.ceil(tasks.length / (params.limit || 20)),
          },
        },
      };
      return mockResponse;
    } else {
      return this.realService.getTasks(params);
    }
  }

  async getTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }> {
    if (this.isMockMode) {
      const tasks = await this.mockService.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        return {
          success: true,
          data: {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: {
              id: task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: task.dueDate ? task.dueDate.toISOString() : '',
            completed: task.completed,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          },
        };
      } else {
        throw new Error('Task not found');
      }
    } else {
      return this.realService.getTask(taskId);
    }
  }

  async createTask(request: CreateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }> {
    if (this.isMockMode) {
      const mockRequest: CreateTaskRequest = {
        title: request.title,
        description: request.description,
        priority: request.priority,
        categoryId: request.categoryId,
        dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
      };
      
      const result = await this.mockService.createTask(mockRequest);
      
      if (result.success && result.task) {
        return {
          success: true,
          data: {
            id: result.task.id,
            title: result.task.title,
            description: result.task.description,
            priority: result.task.priority,
            category: {
              id: result.task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: result.task.dueDate ? result.task.dueDate.toISOString() : '',
            completed: result.task.completed,
            createdAt: result.task.createdAt.toISOString(),
            updatedAt: result.task.updatedAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to create task');
      }
    } else {
      return this.realService.createTask(request);
    }
  }

  async updateTask(taskId: string, request: UpdateTaskApiRequest): Promise<{ success: boolean; data: TaskResponse }> {
    if (this.isMockMode) {
      const mockRequest: UpdateTaskRequest = {
        title: request.title,
        description: request.description,
        priority: request.priority,
        categoryId: request.categoryId,
        dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
        completed: request.completed,
      };
      
      const result = await this.mockService.updateTask(taskId, mockRequest);
      
      if (result.success && result.task) {
        return {
          success: true,
          data: {
            id: result.task.id,
            title: result.task.title,
            description: result.task.description,
            priority: result.task.priority,
            category: {
              id: result.task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: result.task.dueDate ? result.task.dueDate.toISOString() : '',
            completed: result.task.completed,
            createdAt: result.task.createdAt.toISOString(),
            updatedAt: result.task.updatedAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to update task');
      }
    } else {
      return this.realService.updateTask(taskId, request);
    }
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    if (this.isMockMode) {
      return this.mockService.deleteTask(taskId);
    } else {
      return this.realService.deleteTask(taskId);
    }
  }

  async completeTask(taskId: string): Promise<{ success: boolean; data: TaskResponse }> {
    if (this.isMockMode) {
      const result = await this.mockService.updateTask(taskId, { completed: true });
      
      if (result.success && result.task) {
        return {
          success: true,
          data: {
            id: result.task.id,
            title: result.task.title,
            description: result.task.description,
            priority: result.task.priority,
            category: {
              id: result.task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: result.task.dueDate ? result.task.dueDate.toISOString() : '',
            completed: result.task.completed,
            createdAt: result.task.createdAt.toISOString(),
            updatedAt: result.task.updatedAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to complete task');
      }
    } else {
      return this.realService.completeTask(taskId);
    }
  }

  // Category APIs
  async getCategories(): Promise<CategoriesListResponse> {
    if (this.isMockMode) {
      const categories = await this.mockService.getCategories();
      return {
        success: true,
        data: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          createdAt: cat.createdAt.toISOString(),
        })),
      };
    } else {
      return this.realService.getCategories();
    }
  }

  async createCategory(request: CreateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }> {
    if (this.isMockMode) {
      const mockRequest: CreateCategoryRequest = {
        name: request.name,
        color: request.color,
        icon: 'folder', // Default icon
      };
      
      const result = await this.mockService.createCategory(mockRequest);
      
      if (result.success && result.category) {
        return {
          success: true,
          data: {
            id: result.category.id,
            name: result.category.name,
            color: result.category.color,
            createdAt: result.category.createdAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to create category');
      }
    } else {
      return this.realService.createCategory(request);
    }
  }

  async updateCategory(categoryId: string, request: UpdateCategoryApiRequest): Promise<{ success: boolean; data: CategoryResponse }> {
    if (this.isMockMode) {
      const mockRequest: UpdateCategoryRequest = {
        id: categoryId,
        name: request.name,
        color: request.color,
        icon: 'folder', // Default icon
      };
      
      const result = await this.mockService.updateCategory(categoryId, mockRequest);
      
      if (result.success && result.category) {
        return {
          success: true,
          data: {
            id: result.category.id,
            name: result.category.name,
            color: result.category.color,
            createdAt: result.category.createdAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to update category');
      }
    } else {
      return this.realService.updateCategory(categoryId, request);
    }
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    if (this.isMockMode) {
      return this.mockService.deleteCategory(categoryId);
    } else {
      return this.realService.deleteCategory(categoryId);
    }
  }

  // Bulk Operations
  async bulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    if (this.isMockMode) {
      // Mock implementation for bulk operations
      const tasks = await this.mockService.getTasks();
      let updatedCount = 0;
      
      for (const taskId of request.taskIds) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          switch (request.operation) {
            case 'complete':
              await this.mockService.updateTask(taskId, { completed: true });
              updatedCount++;
              break;
            case 'delete':
              await this.mockService.deleteTask(taskId);
              updatedCount++;
              break;
            // Add other operations as needed
          }
        }
      }
      
      return {
        success: true,
        data: {
          updatedCount,
          message: `Successfully ${request.operation}d ${updatedCount} tasks`,
        },
      };
    } else {
      return this.realService.bulkOperation(request);
    }
  }

  // Search
  async searchTasks(request: SearchTasksRequest): Promise<SearchTasksResponse> {
    if (this.isMockMode) {
      const tasks = await this.mockService.getTasks();
      const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(request.q.toLowerCase()) ||
        task.description.toLowerCase().includes(request.q.toLowerCase())
      );
      
      return {
        success: true,
        data: {
          tasks: filteredTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: {
              id: task.categoryId,
              name: 'Default Category',
              color: '#FF5722',
            },
            dueDate: task.dueDate ? task.dueDate.toISOString() : '',
            completed: task.completed,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
          })),
          total: filteredTasks.length,
        },
      };
    } else {
      return this.realService.searchTasks(request);
    }
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsResponse> {
    if (this.isMockMode) {
      const tasks = await this.mockService.getTasks();
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const overdue = tasks.filter(t => 
        t.dueDate && !t.completed && t.dueDate < new Date()
      ).length;
      
      const byPriority = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      };
      
      return {
        success: true,
        data: {
          total,
          completed,
          pending,
          overdue,
          byPriority,
          byCategory: [
            { category: 'Work', count: Math.floor(total * 0.6) },
            { category: 'Personal', count: Math.floor(total * 0.4) },
          ],
          completionRate: total > 0 ? (completed / total) * 100 : 0,
        },
      };
    } else {
      return this.realService.getAnalytics();
    }
  }

  // Feedback
  async submitFeedback(request: FeedbackApiRequest): Promise<{ success: boolean; data: FeedbackResponse }> {
    if (this.isMockMode) {
      const feedback: Feedback = {
        id: `feedback_${Date.now()}`,
        userId: 'user_1',
        rating: request.rating,
        comment: request.comment,
        category: request.category,
        createdAt: new Date(),
      };
      
      const result = await this.mockService.submitFeedback(feedback);
      
      if (result.success) {
        return {
          success: true,
          data: {
            id: feedback.id,
            rating: feedback.rating,
            comment: feedback.comment,
            category: feedback.category,
            createdAt: feedback.createdAt.toISOString(),
          },
        };
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
    } else {
      return this.realService.submitFeedback(request);
    }
  }

  async getFeedback(): Promise<FeedbackListResponse> {
    if (this.isMockMode) {
      const feedbacks = await this.mockService.getFeedbacks();
      return {
        success: true,
        data: feedbacks.map(feedback => ({
          id: feedback.id,
          rating: feedback.rating,
          comment: feedback.comment,
          category: feedback.category,
          createdAt: feedback.createdAt.toISOString(),
        })),
      };
    } else {
      return this.realService.getFeedback();
    }
  }

  // Utility methods
  async getAuthStatus(): Promise<{ isAuthenticated: boolean; user?: any; token?: string }> {
    if (this.isMockMode) {
      return this.mockService.getAuthStatus();
    } else {
      return this.realService.getAuthStatus();
    }
  }

  // Settings and other methods that only exist in mock service
  async getSettings(): Promise<AppSettings | null> {
    if (this.isMockMode) {
      return this.mockService.getSettings();
    } else {
      // Real API doesn't have settings endpoint, return null
      return null;
    }
  }

  async updateSettings(settings: AppSettings): Promise<{ success: boolean; message: string }> {
    if (this.isMockMode) {
      return this.mockService.updateSettings(settings);
    } else {
      // Real API doesn't have settings endpoint
      return {
        success: false,
        message: 'Settings not supported in real API mode',
      };
    }
  }
}

export default ApiService; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Category, User, Feedback, AppSettings, CreateTaskRequest, UpdateTaskRequest, CreateCategoryRequest, UpdateCategoryRequest, LoginRequest, SendOtpRequest } from '../types';

// Mock data storage keys
const STORAGE_KEYS = {
  TASKS: 'mock_tasks',
  CATEGORIES: 'mock_categories',
  USERS: 'mock_users',
  FEEDBACK: 'mock_feedback',
  SETTINGS: 'mock_settings',
  AUTH_TOKEN: 'mock_auth_token',
  USER_DATA: 'mock_user_data',
  TEMP_PHONE: 'mock_temp_phone',
};

// Mock delay to simulate network requests
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock error simulation
const shouldSimulateError = (endpoint: string) => {
  // 5% chance of error for demo purposes
  return Math.random() < 0.05;
};

class MockApiService {
  private static instance: MockApiService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('MockApiService: Initializing mock API service');
    
    try {
      // Initialize default data if not exists
      await this.initializeDefaultData();
      this.isInitialized = true;
      console.log('MockApiService: Initialization complete');
    } catch (error) {
      console.error('MockApiService: Initialization failed:', error);
      throw error;
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Initialize categories
    const categories = await this.getCategories();
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        {
          id: 'cat_1',
          name: 'Work',
          color: '#FF5722',
          icon: 'briefcase',
          userId: 'default',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat_2',
          name: 'Personal',
          color: '#4CAF50',
          icon: 'account',
          userId: 'default',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat_3',
          name: 'Shopping',
          color: '#2196F3',
          icon: 'cart',
          userId: 'default',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }

    // Initialize settings
    const settings = await this.getSettings();
    if (!settings) {
      const defaultSettings: AppSettings = {
        notifications: true,
        sound: true,
        vibration: true,
        autoBackup: true,
        theme: 'auto',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        reminderTime: 15,
        defaultPriority: 'medium',
        defaultCategory: 'cat_1',
        autoComplete: true,
        showCompletedTasks: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
  }

  // Authentication APIs
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: sendOtp called with phone:', phone);
    
    await mockDelay(1000);
    
    if (shouldSimulateError('sendOtp')) {
      throw new Error('Network error: Failed to send OTP');
    }

    // Store phone for verification
    await AsyncStorage.setItem(STORAGE_KEYS.TEMP_PHONE, phone);
    
    return {
      success: true,
      message: 'OTP sent successfully! Use 123456 for demo.',
    };
  }

  async verifyOtp(request: LoginRequest): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    console.log('MockApiService: verifyOtp called with request:', request);
    
    await mockDelay(1500);
    
    if (shouldSimulateError('verifyOtp')) {
      throw new Error('Network error: Failed to verify OTP');
    }

    const storedPhone = await AsyncStorage.getItem(STORAGE_KEYS.TEMP_PHONE);
    
    if (request.otp === '123456' && request.phone === storedPhone) {
      const user: User = {
        id: 'user_1',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: request.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = `mock_token_${Date.now()}`;
      
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.removeItem(STORAGE_KEYS.TEMP_PHONE);
      
      return {
        success: true,
        user,
        token,
        message: 'Login successful!',
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP. Use 123456 for demo.',
      };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: logout called');
    
    await mockDelay(500);
    
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // Task APIs
  async getTasks(userId: string = 'default'): Promise<Task[]> {
    console.log('MockApiService: getTasks called for userId:', userId);
    
    await mockDelay(800);
    
    if (shouldSimulateError('getTasks')) {
      throw new Error('Network error: Failed to fetch tasks');
    }

    const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    if (tasksJson) {
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : null,
      }));
    }
    return [];
  }

  async createTask(request: CreateTaskRequest, userId: string = 'default'): Promise<{ success: boolean; task?: Task; message: string }> {
    console.log('MockApiService: createTask called with request:', request);
    
    await mockDelay(1000);
    
    if (shouldSimulateError('createTask')) {
      throw new Error('Network error: Failed to create task');
    }

    const tasks = await this.getTasks(userId);
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: request.title,
      description: request.description,
      completed: false,
      priority: request.priority,
      dueDate: request.dueDate || null,
      categoryId: request.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      tags: [],
      repeatInterval: 'none',
      attachments: [],
      notes: '',
    };

    tasks.push(newTask);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    
    return {
      success: true,
      task: newTask,
      message: 'Task created successfully',
    };
  }

  async updateTask(taskId: string, updates: UpdateTaskRequest, userId: string = 'default'): Promise<{ success: boolean; task?: Task; message: string }> {
    console.log('MockApiService: updateTask called for taskId:', taskId, 'with updates:', updates);
    
    await mockDelay(800);
    
    if (shouldSimulateError('updateTask')) {
      throw new Error('Network error: Failed to update task');
    }

    const tasks = await this.getTasks(userId);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      
      return {
        success: true,
        task: tasks[taskIndex],
        message: 'Task updated successfully',
      };
    }
    
    return {
      success: false,
      message: 'Task not found',
    };
  }

  async deleteTask(taskId: string, userId: string = 'default'): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: deleteTask called for taskId:', taskId, 'userId:', userId);
    
    await mockDelay(600);
    
    if (shouldSimulateError('deleteTask')) {
      throw new Error('Network error: Failed to delete task');
    }

    const tasks = await this.getTasks(userId);
    console.log('MockApiService: Current tasks count:', tasks.length);
    
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    console.log('MockApiService: Filtered tasks count:', filteredTasks.length);
    
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
    console.log('MockApiService: Task deleted successfully from storage');
    
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }

  // Category APIs
  async getCategories(userId: string = 'default'): Promise<Category[]> {
    console.log('MockApiService: getCategories called for userId:', userId);
    
    await mockDelay(600);
    
    if (shouldSimulateError('getCategories')) {
      throw new Error('Network error: Failed to fetch categories');
    }

    const categoriesJson = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (categoriesJson) {
      const categories = JSON.parse(categoriesJson);
      return categories.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      }));
    }
    return [];
  }

  async createCategory(request: CreateCategoryRequest, userId: string = 'default'): Promise<{ success: boolean; category?: Category; message: string }> {
    console.log('MockApiService: createCategory called with request:', request);
    
    await mockDelay(800);
    
    if (shouldSimulateError('createCategory')) {
      throw new Error('Network error: Failed to create category');
    }

    const categories = await this.getCategories(userId);
    const newCategory: Category = {
      id: `category_${Date.now()}`,
      name: request.name,
      color: request.color,
      icon: request.icon,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    };

    categories.push(newCategory);
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    return {
      success: true,
      category: newCategory,
      message: 'Category created successfully',
    };
  }

  async updateCategory(categoryId: string, updates: UpdateCategoryRequest, userId: string = 'default'): Promise<{ success: boolean; category?: Category; message: string }> {
    console.log('MockApiService: updateCategory called for categoryId:', categoryId, 'with updates:', updates);
    
    await mockDelay(700);
    
    if (shouldSimulateError('updateCategory')) {
      throw new Error('Network error: Failed to update category');
    }

    const categories = await this.getCategories(userId);
    const categoryIndex = categories.findIndex(category => category.id === categoryId);
    
    if (categoryIndex >= 0) {
      categories[categoryIndex] = { ...categories[categoryIndex], ...updates, updatedAt: new Date() };
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      
      return {
        success: true,
        category: categories[categoryIndex],
        message: 'Category updated successfully',
      };
    }
    
    return {
      success: false,
      message: 'Category not found',
    };
  }

  async deleteCategory(categoryId: string, userId: string = 'default'): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: deleteCategory called for categoryId:', categoryId);
    
    await mockDelay(600);
    
    if (shouldSimulateError('deleteCategory')) {
      throw new Error('Network error: Failed to delete category');
    }

    const categories = await this.getCategories(userId);
    const filteredCategories = categories.filter(category => category.id !== categoryId);
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filteredCategories));
    
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  // Settings APIs
  async getSettings(): Promise<AppSettings | null> {
    console.log('MockApiService: getSettings called');
    
    await mockDelay(400);
    
    if (shouldSimulateError('getSettings')) {
      throw new Error('Network error: Failed to fetch settings');
    }

    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return null;
  }

  async updateSettings(settings: AppSettings): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: updateSettings called with settings:', settings);
    
    await mockDelay(600);
    
    if (shouldSimulateError('updateSettings')) {
      throw new Error('Network error: Failed to update settings');
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  }

  // Feedback APIs
  async submitFeedback(feedback: Feedback): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: submitFeedback called with feedback:', feedback);
    
    await mockDelay(1000);
    
    if (shouldSimulateError('submitFeedback')) {
      throw new Error('Network error: Failed to submit feedback');
    }

    const feedbacks = await this.getFeedbacks();
    feedbacks.push(feedback);
    await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
    
    return {
      success: true,
      message: 'Feedback submitted successfully',
    };
  }

  async getFeedbacks(): Promise<Feedback[]> {
    console.log('MockApiService: getFeedbacks called');
    
    await mockDelay(600);
    
    if (shouldSimulateError('getFeedbacks')) {
      throw new Error('Network error: Failed to fetch feedbacks');
    }

    const feedbacksJson = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (feedbacksJson) {
      const feedbacks = JSON.parse(feedbacksJson);
      return feedbacks.map((feedback: any) => ({
        ...feedback,
        createdAt: new Date(feedback.createdAt),
      }));
    }
    return [];
  }

  // Backup and Restore APIs
  async createBackup(): Promise<{ success: boolean; backupData?: string; message: string }> {
    console.log('MockApiService: createBackup called');
    
    await mockDelay(2000);
    
    if (shouldSimulateError('createBackup')) {
      throw new Error('Network error: Failed to create backup');
    }

    const tasks = await this.getTasks();
    const categories = await this.getCategories();
    const settings = await this.getSettings();
    const feedbacks = await this.getFeedbacks();

    const backupData = {
      tasks,
      categories,
      settings,
      feedbacks,
      backupDate: new Date(),
      version: '1.0.0',
    };

    return {
      success: true,
      backupData: JSON.stringify(backupData),
      message: 'Backup created successfully',
    };
  }

  async restoreBackup(backupJson: string): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: restoreBackup called');
    
    await mockDelay(3000);
    
    if (shouldSimulateError('restoreBackup')) {
      throw new Error('Network error: Failed to restore backup');
    }

    try {
      const backupData = JSON.parse(backupJson);
      
      if (backupData.tasks) {
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(backupData.tasks));
      }
      if (backupData.categories) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(backupData.categories));
      }
      if (backupData.settings) {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backupData.settings));
      }
      if (backupData.feedbacks) {
        await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(backupData.feedbacks));
      }
      
      return {
        success: true,
        message: 'Backup restored successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid backup data',
      };
    }
  }

  // Utility methods
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    console.log('MockApiService: clearAllData called');
    
    await mockDelay(1000);
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.FEEDBACK,
      STORAGE_KEYS.SETTINGS,
    ]);
    
    return {
      success: true,
      message: 'All data cleared successfully',
    };
  }

  async getAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User; token?: string }> {
    console.log('MockApiService: getAuthStatus called');
    
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    
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
}

export default MockApiService; 
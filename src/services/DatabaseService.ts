import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Category, User, Feedback, AppSettings } from '../types';

class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if database exists, if not create default data
      const tasks = await this.getTasks();
      if (tasks.length === 0) {
        await this.createDefaultData();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createDefaultData(): Promise<void> {
    const defaultCategories: Category[] = [
      {
        id: '1',
        name: 'Personal',
        color: '#2196F3',
        icon: 'account',
        userId: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Work',
        color: '#FF9800',
        icon: 'briefcase',
        userId: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Shopping',
        color: '#4CAF50',
        icon: 'cart',
        userId: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await this.saveCategories(defaultCategories);
  }

  // Task Operations
  async getTasks(userId: string = 'default'): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(`tasks_${userId}`);
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
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async saveTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks(task.userId);
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...task, updatedAt: new Date() };
      } else {
        tasks.push({ ...task, createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(`tasks_${task.userId}`, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId: string = 'default'): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>, userId: string = 'default'): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex >= 0) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
        await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>, userId: string = 'default'): Promise<void> {
    try {
      const tasks = await this.getTasks(userId);
      const updatedTasks = tasks.map(task => 
        taskIds.includes(task.id) 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  }

  // Category Operations
  async getCategories(userId: string = 'default'): Promise<Category[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(`categories_${userId}`);
      if (categoriesJson) {
        const categories = JSON.parse(categoriesJson);
        return categories.map((category: any) => ({
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories(category.userId);
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = { ...category, updatedAt: new Date() };
      } else {
        categories.push({ ...category, createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(`categories_${category.userId}`, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  private async saveCategories(categories: Category[]): Promise<void> {
    try {
      const userId = categories[0]?.userId || 'default';
      await AsyncStorage.setItem(`categories_${userId}`, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string, userId: string = 'default'): Promise<void> {
    try {
      const categories = await this.getCategories(userId);
      const filteredCategories = categories.filter(category => category.id !== categoryId);
      await AsyncStorage.setItem(`categories_${userId}`, JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // User Operations
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Settings Operations
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem('settings');
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
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
      defaultCategory: null,
      autoComplete: true,
      showCompletedTasks: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  }

  // Feedback Operations
  async saveFeedback(feedback: Feedback): Promise<void> {
    try {
      const feedbacks = await this.getFeedbacks();
      feedbacks.push({ ...feedback, createdAt: new Date() });
      await AsyncStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }

  async getFeedbacks(): Promise<Feedback[]> {
    try {
      const feedbacksJson = await AsyncStorage.getItem('feedbacks');
      if (feedbacksJson) {
        const feedbacks = JSON.parse(feedbacksJson);
        return feedbacks.map((feedback: any) => ({
          ...feedback,
          createdAt: new Date(feedback.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting feedbacks:', error);
      return [];
    }
  }

  // Backup and Restore
  async createBackup(): Promise<string> {
    try {
      const user = await this.getUser();
      const tasks = await this.getTasks(user?.id || 'default');
      const categories = await this.getCategories(user?.id || 'default');
      const settings = await this.getSettings();
      const feedbacks = await this.getFeedbacks();

      const backup = {
        user,
        tasks,
        categories,
        settings,
        feedbacks,
        backupDate: new Date(),
        version: '1.0.0',
      };

      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      
      if (backup.user) {
        await this.saveUser(backup.user);
      }
      
      if (backup.tasks && Array.isArray(backup.tasks)) {
        const userId = backup.user?.id || 'default';
        await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(backup.tasks));
      }
      
      if (backup.categories && Array.isArray(backup.categories)) {
        const userId = backup.user?.id || 'default';
        await AsyncStorage.setItem(`categories_${userId}`, JSON.stringify(backup.categories));
      }
      
      if (backup.settings) {
        await this.saveSettings(backup.settings);
      }
      
      if (backup.feedbacks && Array.isArray(backup.feedbacks)) {
        await AsyncStorage.setItem('feedbacks', JSON.stringify(backup.feedbacks));
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export default DatabaseService; 
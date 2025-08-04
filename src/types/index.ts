export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
  reminderTime?: Date;
  repeatInterval?: 'none' | 'daily' | 'weekly' | 'monthly';
  attachments?: string[];
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface TaskFilters {
  search: string;
  categoryId: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  status: 'all' | 'completed' | 'pending' | null;
  dueDate: 'all' | 'today' | 'week' | 'overdue' | null;
}

export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  category: string;
  createdAt: Date;
}

export interface ThemeState {
  isDark: boolean;
  isAuto: boolean;
}

export interface DatabaseState {
  isInitialized: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginRequest {
  phone: string;
  otp: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  categoryId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: Date;
  categoryId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

export interface FeedbackRequest {
  rating: number;
  comment: string;
  category: string;
}

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'all' | 'completed' | 'pending';
export type DueDateFilter = 'all' | 'today' | 'week' | 'overdue';
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledDate?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  userId: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  timestamp: Date;
  userId: string;
}

export interface BackupData {
  tasks: Task[];
  categories: Category[];
  settings: AppSettings;
  achievements: Achievement[];
  activities: TaskActivity[];
  backupDate: Date;
  version: string;
}

export interface SearchFilters {
  text: string;
  priority: Priority | null;
  category: string | null;
  status: 'all' | 'completed' | 'pending' | null;
  dueDate: DueDateFilter | null;
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface BulkOperation {
  type: 'delete' | 'complete' | 'move' | 'changePriority' | 'changeCategory';
  taskIds: string[];
  data?: any;
}

export interface AppSettings {
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  autoBackup: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
  reminderTime: number; // minutes before due date
  defaultPriority: 'high' | 'medium' | 'low';
  defaultCategory: string | null;
  autoComplete: boolean;
  showCompletedTasks: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
} 
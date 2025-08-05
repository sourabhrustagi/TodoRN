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

// New API Response Types
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      phoneNumber: string;
      name: string;
    };
  };
}

export interface SendOtpResponse {
  success: boolean;
  data: {
    message: string;
    expiresIn: number;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: {
    id: string;
    name: string;
    color: string;
  };
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TasksListResponse {
  success: boolean;
  data: {
    tasks: TaskResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CategoriesListResponse {
  success: boolean;
  data: CategoryResponse[];
}

export interface BulkOperationRequest {
  operation: 'complete' | 'delete' | 'move' | 'changePriority' | 'changeCategory';
  taskIds: string[];
  data?: any;
}

export interface BulkOperationResponse {
  success: boolean;
  data: {
    updatedCount: number;
    message: string;
  };
}

export interface SearchTasksResponse {
  success: boolean;
  data: {
    tasks: TaskResponse[];
    total: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
    byCategory: Array<{
      category: string;
      count: number;
    }>;
    completionRate: number;
  };
}

export interface FeedbackResponse {
  id: string;
  rating: number;
  comment: string;
  category: string;
  createdAt: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: FeedbackResponse[];
}

// API Request Types
export interface SendOtpRequest {
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface CreateTaskApiRequest {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  categoryId: string;
  dueDate?: string;
}

export interface UpdateTaskApiRequest {
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  categoryId?: string;
  dueDate?: string;
  completed?: boolean;
}

// Legacy types for backward compatibility
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

export interface CreateCategoryApiRequest {
  name: string;
  color: string;
}

export interface UpdateCategoryApiRequest {
  name?: string;
  color?: string;
}

export interface FeedbackApiRequest {
  rating: number;
  comment: string;
  category: string;
}

export interface SearchTasksRequest {
  q: string;
  fields?: 'title' | 'description' | 'all';
  fuzzy?: boolean;
}

export interface GetTasksQueryParams {
  page?: number;
  limit?: number;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  search?: string;
  sortBy?: 'title' | 'priority' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Error Response Types
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
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
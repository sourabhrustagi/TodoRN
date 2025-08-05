// App constants

export const APP_CONSTANTS = {
  APP_NAME: 'TodoRN',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  TASKS: 'tasks',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  FEEDBACK: 'feedback',
  BACKUP: 'backup',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  VERIFY_OTP: '/auth/verify-otp',
  LOGOUT: '/auth/logout',
  TASKS: '/tasks',
  CATEGORIES: '/categories',
  SETTINGS: '/settings',
  FEEDBACK: '/feedback',
} as const;

export const THEME_CONSTANTS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  SCROLL: 100,
  INPUT: 500,
} as const;

export const LIMITS = {
  MAX_TASK_TITLE_LENGTH: 100,
  MAX_TASK_DESCRIPTION_LENGTH: 500,
  MAX_FEEDBACK_LENGTH: 1000,
  MAX_SEARCH_QUERY_LENGTH: 50,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  PERMISSION_ERROR: 'Permission denied. Please check your settings.',
} as const;

export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully!',
} as const;

export const REGEX_PATTERNS = {
  PHONE_NUMBER: /^(\+?[1-9]\d{1,14}|\d{10,15})$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  OTP: /^\d{6}$/,
} as const; 
import { getConfig } from '../config/environments';

const config = getConfig();

// App constants

export const APP_CONSTANTS = {
  // App info
  APP_NAME: config.app.name,
  APP_VERSION: config.app.version,
  
  // API Configuration
  API: {
    BASE_URL: config.api.baseUrl,
    MOCK_MODE: config.api.mockMode,
    TIMEOUT: config.api.timeout,
    RETRY_ATTEMPTS: config.api.retryAttempts,
    RETRY_DELAY: config.api.retryDelay,
  },
  
  // Environment
  ENVIRONMENT: {
    NAME: config.name,
    DEBUG: config.app.debug,
    LOG_LEVEL: config.app.logLevel,
  },
  
  // Features
  FEATURES: {
    ANALYTICS: config.features.analytics,
    CRASH_REPORTING: config.features.crashReporting,
    PUSH_NOTIFICATIONS: config.features.pushNotifications,
    OFFLINE_SUPPORT: config.features.offlineSupport,
  },
  
  // Storage
  STORAGE: {
    ENCRYPTION: config.storage.encryption,
    BACKUP_ENABLED: config.storage.backupEnabled,
  },
  
  // API
  API_BASE_URL: config.api.baseUrl,
  API_TIMEOUT: config.api.timeout,
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    TASKS: 'tasks',
    SETTINGS: 'settings',
    THEME: 'theme',
    FEEDBACK: 'feedback',
  },
  
  // Validation limits
  VALIDATION: {
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
    OTP_LENGTH: 6,
    TASK_TITLE_MIN_LENGTH: 3,
    TASK_TITLE_MAX_LENGTH: 100,
    TASK_DESCRIPTION_MAX_LENGTH: 500,
    FEEDBACK_MIN_LENGTH: 10,
    FEEDBACK_MAX_LENGTH: 1000,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
  },
  
  // Animation durations
  ANIMATION: {
    FADE_IN: 300,
    FADE_OUT: 200,
    SLIDE_IN: 250,
    SLIDE_OUT: 200,
    SCALE_IN: 200,
    SCALE_OUT: 150,
  },
  
  // Debounce delays
  DEBOUNCE: {
    SEARCH: 300,
    SCROLL: 100,
    RESIZE: 250,
    INPUT: 500,
  },
  
  // Performance limits
  PERFORMANCE: {
    MAX_TASKS_PER_PAGE: 50,
    MAX_SEARCH_RESULTS: 100,
    CACHE_SIZE: 100,
    DEBOUNCE_DELAY: 300,
  },
  
  // Error messages
  ERRORS: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AUTH_ERROR: 'Authentication failed. Please login again.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
  },
  
  // Success messages
  SUCCESS: {
    TASK_CREATED: 'Task created successfully!',
    TASK_UPDATED: 'Task updated successfully!',
    TASK_DELETED: 'Task deleted successfully!',
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logged out successfully!',
    FEEDBACK_SENT: 'Feedback sent successfully!',
  },
  
  // UI constants
  UI: {
    BORDER_RADIUS: 12,
    CARD_ELEVATION: 4,
    BUTTON_HEIGHT: 48,
    INPUT_HEIGHT: 56,
    ICON_SIZE: 24,
    AVATAR_SIZE: 100,
  },
  
  // Priority levels
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  } as const,
  
  // Task status
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const,
  
  // Sort options
  SORT_OPTIONS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    TITLE: 'title',
    PRIORITY: 'priority',
    DUE_DATE: 'dueDate',
  } as const,
  
  // Filter options
  FILTER_OPTIONS: {
    ALL: 'all',
    PENDING: 'pending',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
  } as const,
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
  },
  
  // Colors (Material Design 3)
  COLORS: {
    PRIMARY: '#6750A4',
    PRIMARY_CONTAINER: '#EADDFF',
    SECONDARY: '#625B71',
    SECONDARY_CONTAINER: '#E8DEF8',
    TERTIARY: '#7D5260',
    TERTIARY_CONTAINER: '#FFD8E4',
    SURFACE: '#FFFBFE',
    SURFACE_VARIANT: '#E7E0EC',
    BACKGROUND: '#FFFBFE',
    ERROR: '#BA1A1A',
    ERROR_CONTAINER: '#FFDAD6',
    ON_PRIMARY: '#FFFFFF',
    ON_PRIMARY_CONTAINER: '#21005D',
    ON_SECONDARY: '#FFFFFF',
    ON_SECONDARY_CONTAINER: '#1D192B',
    ON_TERTIARY: '#FFFFFF',
    ON_TERTIARY_CONTAINER: '#31111D',
    ON_SURFACE: '#1C1B1F',
    ON_SURFACE_VARIANT: '#49454F',
    ON_BACKGROUND: '#1C1B1F',
    ON_ERROR: '#FFFFFF',
    ON_ERROR_CONTAINER: '#410002',
    OUTLINE: '#79747E',
    OUTLINE_VARIANT: '#CAC4D0',
    SHADOW: '#000000',
    SCRIM: '#000000',
    INVERSE_SURFACE: '#313033',
    INVERSE_ON_SURFACE: '#F4EFF4',
    INVERSE_PRIMARY: '#D0BCFF',
  },
  
  // Dark theme colors
  DARK_COLORS: {
    PRIMARY: '#D0BCFF',
    PRIMARY_CONTAINER: '#4F378B',
    SECONDARY: '#CCC2DC',
    SECONDARY_CONTAINER: '#4A4458',
    TERTIARY: '#EFB8C8',
    TERTIARY_CONTAINER: '#633B48',
    SURFACE: '#1C1B1F',
    SURFACE_VARIANT: '#49454F',
    BACKGROUND: '#1C1B1F',
    ERROR: '#FFB4AB',
    ERROR_CONTAINER: '#93000A',
    ON_PRIMARY: '#381E72',
    ON_PRIMARY_CONTAINER: '#EADDFF',
    ON_SECONDARY: '#332D41',
    ON_SECONDARY_CONTAINER: '#E8DEF8',
    ON_TERTIARY: '#492532',
    ON_TERTIARY_CONTAINER: '#FFD8E4',
    ON_SURFACE: '#E6E1E5',
    ON_SURFACE_VARIANT: '#CAC4D0',
    ON_BACKGROUND: '#E6E1E5',
    ON_ERROR: '#690005',
    ON_ERROR_CONTAINER: '#FFDAD6',
    OUTLINE: '#938F99',
    OUTLINE_VARIANT: '#49454F',
    SHADOW: '#000000',
    SCRIM: '#000000',
    INVERSE_SURFACE: '#E6E1E5',
    INVERSE_ON_SURFACE: '#313033',
    INVERSE_PRIMARY: '#6750A4',
  },
} as const;

// Type exports
export type Priority = typeof APP_CONSTANTS.PRIORITIES[keyof typeof APP_CONSTANTS.PRIORITIES];
export type TaskStatus = typeof APP_CONSTANTS.TASK_STATUS[keyof typeof APP_CONSTANTS.TASK_STATUS];
export type SortOption = typeof APP_CONSTANTS.SORT_OPTIONS[keyof typeof APP_CONSTANTS.SORT_OPTIONS];
export type FilterOption = typeof APP_CONSTANTS.FILTER_OPTIONS[keyof typeof APP_CONSTANTS.FILTER_OPTIONS]; 
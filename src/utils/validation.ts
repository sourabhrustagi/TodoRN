import { APP_CONSTANTS } from '../constants/app';
import logger from './logger';

// Validation error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  otp: /^\d{6}$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Validation functions
export const validators = {
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min;
  },

  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max;
  },

  pattern: (regex: RegExp) => (value: string): boolean => {
    return regex.test(value);
  },

  email: (value: string): boolean => {
    return patterns.email.test(value);
  },

  phone: (value: string): boolean => {
    return patterns.phone.test(value);
  },

  otp: (value: string): boolean => {
    return patterns.otp.test(value);
  },

  url: (value: string): boolean => {
    return patterns.url.test(value);
  },

  date: (value: any): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  futureDate: (value: any): boolean => {
    const date = new Date(value);
    const now = new Date();
    return date > now;
  },

  pastDate: (value: any): boolean => {
    const date = new Date(value);
    const now = new Date();
    return date < now;
  },

  number: (value: any): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value));
  },

  positive: (value: number): boolean => {
    return value > 0;
  },

  range: (min: number, max: number) => (value: number): boolean => {
    return value >= min && value <= max;
  },

  enum: (allowedValues: any[]) => (value: any): boolean => {
    return allowedValues.includes(value);
  },
};

// Field-specific validators
export const fieldValidators = {
  phone: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('Phone number is required');
    } else if (!validators.phone(value)) {
      errors.push('Please enter a valid phone number');
    } else if (!validators.minLength(APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH)(value)) {
      errors.push(`Phone number must be at least ${APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} characters`);
    } else if (!validators.maxLength(APP_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH)(value)) {
      errors.push(`Phone number must be no more than ${APP_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH} characters`);
    }
    
    return errors;
  },

  otp: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('OTP is required');
    } else if (!validators.otp(value)) {
      errors.push('OTP must be 6 digits');
    }
    
    return errors;
  },

  email: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('Email is required');
    } else if (!validators.email(value)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  },

  taskTitle: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('Task title is required');
    } else if (!validators.minLength(APP_CONSTANTS.VALIDATION.TASK_TITLE_MIN_LENGTH)(value)) {
      errors.push(`Title must be at least ${APP_CONSTANTS.VALIDATION.TASK_TITLE_MIN_LENGTH} characters`);
    } else if (!validators.maxLength(APP_CONSTANTS.VALIDATION.TASK_TITLE_MAX_LENGTH)(value)) {
      errors.push(`Title must be no more than ${APP_CONSTANTS.VALIDATION.TASK_TITLE_MAX_LENGTH} characters`);
    }
    
    return errors;
  },

  taskDescription: (value: string): string[] => {
    const errors: string[] = [];
    
    if (value && !validators.maxLength(APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH)(value)) {
      errors.push(`Description must be no more than ${APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} characters`);
    }
    
    return errors;
  },

  feedback: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('Feedback is required');
    } else if (!validators.minLength(APP_CONSTANTS.VALIDATION.FEEDBACK_MIN_LENGTH)(value)) {
      errors.push(`Feedback must be at least ${APP_CONSTANTS.VALIDATION.FEEDBACK_MIN_LENGTH} characters`);
    } else if (!validators.maxLength(APP_CONSTANTS.VALIDATION.FEEDBACK_MAX_LENGTH)(value)) {
      errors.push(`Feedback must be no more than ${APP_CONSTANTS.VALIDATION.FEEDBACK_MAX_LENGTH} characters`);
    }
    
    return errors;
  },

  password: (value: string): string[] => {
    const errors: string[] = [];
    
    if (!validators.required(value)) {
      errors.push('Password is required');
    } else if (!validators.minLength(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH)(value)) {
      errors.push(`Password must be at least ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters`);
    } else if (!validators.maxLength(APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH)(value)) {
      errors.push(`Password must be no more than ${APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters`);
    }
    
    return errors;
  },
};

// Form validation
export const validateForm = (
  formData: Record<string, any>,
  validators: Record<string, (value: any) => string[]>
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  for (const [field, value] of Object.entries(formData)) {
    const validator = validators[field];
    if (validator) {
      const fieldErrors = validator(value);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
  }

  logger.debug('Form validation result', { errors });
  return errors;
};

// Validate single field
export const validateField = (
  value: any,
  validator: (value: any) => string[]
): { isValid: boolean; errors: string[] } => {
  const errors = validator(value);
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Check if form is valid
export const isFormValid = (errors: Record<string, string[]>): boolean => {
  return Object.keys(errors).length === 0;
};

// Get first error from form
export const getFirstError = (errors: Record<string, string[]>): string | null => {
  for (const fieldErrors of Object.values(errors)) {
    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }
  return null;
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Format validation error message
export const formatValidationError = (field: string, error: string): string => {
  return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${error}`;
};

export default {
  patterns,
  validators,
  fieldValidators,
  validateForm,
  validateField,
  isFormValid,
  getFirstError,
  sanitizeInput,
  formatValidationError,
  ValidationError,
}; 
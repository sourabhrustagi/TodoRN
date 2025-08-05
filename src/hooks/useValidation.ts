import { useCallback, useState } from 'react';
import { APP_CONSTANTS } from '../constants/app';
import logger from '../utils/logger';

interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useValidation = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Common validation rules
  const rules = {
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

    email: (value: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },

    phone: (value: string): boolean => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      return phoneRegex.test(value);
    },

    otp: (value: string): boolean => {
      return /^\d{6}$/.test(value);
    },

    url: (value: string): boolean => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },

    number: (value: any): boolean => {
      return !isNaN(Number(value)) && isFinite(Number(value));
    },

    positive: (value: number): boolean => {
      return value > 0;
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
  };

  // Validation functions for specific fields
  const validatePhone = useCallback((phone: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'Phone number is required',
      },
      {
        test: rules.phone,
        message: 'Please enter a valid phone number',
      },
      {
        test: rules.minLength(APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH),
        message: `Phone number must be at least ${APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} characters`,
      },
      {
        test: rules.maxLength(APP_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH),
        message: `Phone number must be no more than ${APP_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH} characters`,
      },
    ];

    return validateField(phone, validationRules);
  }, []);

  const validateOtp = useCallback((otp: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'OTP is required',
      },
      {
        test: rules.otp,
        message: 'OTP must be 6 digits',
      },
    ];

    return validateField(otp, validationRules);
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'Email is required',
      },
      {
        test: rules.email,
        message: 'Please enter a valid email address',
      },
    ];

    return validateField(email, validationRules);
  }, []);

  const validateTaskTitle = useCallback((title: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'Task title is required',
      },
      {
        test: rules.minLength(APP_CONSTANTS.VALIDATION.TASK_TITLE_MIN_LENGTH),
        message: `Title must be at least ${APP_CONSTANTS.VALIDATION.TASK_TITLE_MIN_LENGTH} characters`,
      },
      {
        test: rules.maxLength(APP_CONSTANTS.VALIDATION.TASK_TITLE_MAX_LENGTH),
        message: `Title must be no more than ${APP_CONSTANTS.VALIDATION.TASK_TITLE_MAX_LENGTH} characters`,
      },
    ];

    return validateField(title, validationRules);
  }, []);

  const validateTaskDescription = useCallback((description: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.maxLength(APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH),
        message: `Description must be no more than ${APP_CONSTANTS.VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} characters`,
      },
    ];

    return validateField(description, validationRules);
  }, []);

  const validateFeedback = useCallback((feedback: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'Feedback is required',
      },
      {
        test: rules.minLength(APP_CONSTANTS.VALIDATION.FEEDBACK_MIN_LENGTH),
        message: `Feedback must be at least ${APP_CONSTANTS.VALIDATION.FEEDBACK_MIN_LENGTH} characters`,
      },
      {
        test: rules.maxLength(APP_CONSTANTS.VALIDATION.FEEDBACK_MAX_LENGTH),
        message: `Feedback must be no more than ${APP_CONSTANTS.VALIDATION.FEEDBACK_MAX_LENGTH} characters`,
      },
    ];

    return validateField(feedback, validationRules);
  }, []);

  const validatePassword = useCallback((password: string): ValidationResult => {
    const validationRules: ValidationRule[] = [
      {
        test: rules.required,
        message: 'Password is required',
      },
      {
        test: rules.minLength(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH),
        message: `Password must be at least ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      },
      {
        test: rules.maxLength(APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH),
        message: `Password must be no more than ${APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters`,
      },
    ];

    return validateField(password, validationRules);
  }, []);

  // Generic validation function
  const validateField = useCallback((value: any, rules: ValidationRule[]): ValidationResult => {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Form validation
  const validateForm = useCallback((formData: Record<string, any>, validators: Record<string, (value: any) => ValidationResult>): Record<string, string[]> => {
    const formErrors: Record<string, string[]> = {};

    for (const [field, value] of Object.entries(formData)) {
      const validator = validators[field];
      if (validator) {
        const result = validator(value);
        if (!result.isValid) {
          formErrors[field] = result.errors;
        }
      }
    }

    setErrors(formErrors);
    logger.debug('Form validation result', { formErrors });
    return formErrors;
  }, []);

  // Clear errors
  const clearErrors = useCallback((field?: string) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // Check if form is valid
  const isFormValid = useCallback((formErrors: Record<string, string[]>): boolean => {
    return Object.keys(formErrors).length === 0;
  }, []);

  return {
    // State
    errors,

    // Validation functions
    validatePhone,
    validateOtp,
    validateEmail,
    validateTaskTitle,
    validateTaskDescription,
    validateFeedback,
    validatePassword,
    validateField,
    validateForm,

    // Utilities
    clearErrors,
    isFormValid,
    rules,
  };
};

export default useValidation; 
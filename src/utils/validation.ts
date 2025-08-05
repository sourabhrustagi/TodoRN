// Validation utilities for the Todo app

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Phone number validation
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Basic phone number validation - allow numbers with or without country code
  const phoneRegex = /^(\+?[1-9]\d{1,14}|\d{10,15})$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, message: 'Please enter a valid phone number (10-15 digits)' };
  }
  
  return { isValid: true };
}

/**
 * OTP validation
 */
export function validateOtp(otp: string): ValidationResult {
  if (!otp || otp.trim().length === 0) {
    return { isValid: false, message: 'OTP is required' };
  }
  
  if (otp.length !== 6) {
    return { isValid: false, message: 'OTP must be 6 digits' };
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, message: 'OTP must contain only numbers' };
  }
  
  return { isValid: true };
}

/**
 * Task title validation
 */
export function validateTaskTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: 'Task title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, message: 'Task title must be at least 3 characters' };
  }
  
  if (title.trim().length > 100) {
    return { isValid: false, message: 'Task title must be less than 100 characters' };
  }
  
  return { isValid: true };
}

/**
 * Task description validation
 */
export function validateTaskDescription(description: string): ValidationResult {
  if (!description) {
    return { isValid: true }; // Description is optional
  }
  
  if (description.trim().length > 500) {
    return { isValid: false, message: 'Task description must be less than 500 characters' };
  }
  
  return { isValid: true };
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true };
}

/**
 * Feedback validation
 */
export function validateFeedback(feedback: string): ValidationResult {
  if (!feedback || feedback.trim().length === 0) {
    return { isValid: false, message: 'Feedback is required' };
  }
  
  if (feedback.trim().length < 10) {
    return { isValid: false, message: 'Feedback must be at least 10 characters' };
  }
  
  if (feedback.trim().length > 1000) {
    return { isValid: false, message: 'Feedback must be less than 1000 characters' };
  }
  
  return { isValid: true };
}

/**
 * Date validation
 */
export function validateDate(date: Date | null): ValidationResult {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  const now = new Date();
  if (date < now) {
    return { isValid: false, message: 'Date cannot be in the past' };
  }
  
  return { isValid: true };
}

/**
 * Priority validation
 */
export function validatePriority(priority: string): ValidationResult {
  const validPriorities = ['low', 'medium', 'high'];
  
  if (!validPriorities.includes(priority)) {
    return { isValid: false, message: 'Priority must be low, medium, or high' };
  }
  
  return { isValid: true };
}

/**
 * Generic string validation
 */
export function validateString(
  value: string, 
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customMessage?: string;
  } = {}
): ValidationResult {
  const { required = true, minLength, maxLength, pattern, customMessage } = options;
  
  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, message: customMessage || 'This field is required' };
  }
  
  if (minLength && value.length < minLength) {
    return { 
      isValid: false, 
      message: customMessage || `Must be at least ${minLength} characters` 
    };
  }
  
  if (maxLength && value.length > maxLength) {
    return { 
      isValid: false, 
      message: customMessage || `Must be less than ${maxLength} characters` 
    };
  }
  
  if (pattern && !pattern.test(value)) {
    return { isValid: false, message: customMessage || 'Invalid format' };
  }
  
  return { isValid: true };
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, value: any, validator: (value: any) => ValidationResult): string | null {
  const result = validator(value);
  return result.isValid ? null : result.message || `${field} is invalid`;
} 
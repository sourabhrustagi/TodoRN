// Validation utilities for the app

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+?[1-9]\d{1,14}|\d{10,15})$/;
  return phoneRegex.test(phone);
};

export const validateOtp = (otp: string[]): boolean => {
  const otpString = otp.join('');
  return otpString.length === 6 && /^\d{6}$/.test(otpString);
};

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateTaskDescription = (description: string): boolean => {
  return description.trim().length <= 500;
};

export const validateFeedback = (comment: string): boolean => {
  return comment.trim().length >= 10 && comment.trim().length <= 1000;
};

export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'phone':
      if (!validatePhoneNumber(value)) {
        return 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)';
      }
      break;
    case 'otp':
      if (!validateOtp(value.split(''))) {
        return 'Please enter a valid 6-digit OTP';
      }
      break;
    case 'taskTitle':
      if (!validateTaskTitle(value)) {
        return 'Task title must be between 3 and 100 characters';
      }
      break;
    case 'taskDescription':
      if (!validateTaskDescription(value)) {
        return 'Task description must be less than 500 characters';
      }
      break;
    case 'feedback':
      if (!validateFeedback(value)) {
        return 'Feedback must be between 10 and 1000 characters';
      }
      break;
  }
  return null;
}; 
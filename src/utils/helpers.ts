// Helper utilities for the app

import { Priority } from '../types';

export const formatPhoneNumber = (phone: string): string => {
  // If it starts with +, format as international
  if (phone.startsWith('+')) {
    return phone.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  // Otherwise format as local number
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return '#d32f2f';
    case 'medium':
      return '#f57c00';
    case 'low':
      return '#388e3c';
    default:
      return '#757575';
  }
};

export const getPriorityIcon = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return 'flag';
    case 'medium':
      return 'flag-outline';
    case 'low':
      return 'flag-variant-outline';
    default:
      return 'flag-variant';
  }
};

export const getSortIcon = (sortBy: string): string => {
  switch (sortBy) {
    case 'priority':
      return 'flag';
    case 'title':
      return 'sort-alphabetical-ascending';
    case 'dueDate':
      return 'calendar';
    case 'createdAt':
    default:
      return 'clock-outline';
  }
};

export const getSortLabel = (sortBy: string): string => {
  switch (sortBy) {
    case 'priority':
      return 'Priority';
    case 'title':
      return 'Title';
    case 'dueDate':
      return 'Due Date';
    case 'createdAt':
    default:
      return 'Created';
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const isOverdue = (dueDate: Date): boolean => {
  return dueDate < new Date() && !isToday(dueDate);
}; 
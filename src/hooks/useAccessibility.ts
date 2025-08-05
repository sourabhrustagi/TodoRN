import { useCallback } from 'react';
import { AccessibilityInfo, AccessibilityRole } from 'react-native';

/**
 * Custom hook for accessibility features
 */
export function useAccessibility() {
  /**
   * Announce screen reader message
   */
  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  /**
   * Check if screen reader is enabled
   */
  const isScreenReaderEnabled = useCallback(async (): Promise<boolean> => {
    return await AccessibilityInfo.isScreenReaderEnabled();
  }, []);

  /**
   * Get accessibility props for buttons
   */
  const getButtonAccessibilityProps = useCallback((
    label: string,
    hint?: string,
    role: AccessibilityRole = 'button'
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: { disabled: false },
  }), []);

  /**
   * Get accessibility props for input fields
   */
  const getInputAccessibilityProps = useCallback((
    label: string,
    hint?: string,
    required: boolean = false
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'text' as AccessibilityRole,
    accessibilityState: { disabled: false },
    accessibilityRequired: required,
  }), []);

  /**
   * Get accessibility props for list items
   */
  const getListItemAccessibilityProps = useCallback((
    label: string,
    hint?: string,
    selected: boolean = false
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as AccessibilityRole,
    accessibilityState: { selected },
  }), []);

  /**
   * Get accessibility props for images
   */
  const getImageAccessibilityProps = useCallback((
    label: string,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'image' as AccessibilityRole,
  }), []);

  /**
   * Get accessibility props for checkboxes
   */
  const getCheckboxAccessibilityProps = useCallback((
    label: string,
    checked: boolean,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'checkbox' as AccessibilityRole,
    accessibilityState: { checked },
  }), []);

  /**
   * Get accessibility props for radio buttons
   */
  const getRadioAccessibilityProps = useCallback((
    label: string,
    selected: boolean,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'radio' as AccessibilityRole,
    accessibilityState: { selected },
  }), []);

  /**
   * Get accessibility props for switches
   */
  const getSwitchAccessibilityProps = useCallback((
    label: string,
    value: boolean,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'switch' as AccessibilityRole,
    accessibilityState: { checked: value },
  }), []);

  /**
   * Get accessibility props for sliders
   */
  const getSliderAccessibilityProps = useCallback((
    label: string,
    value: number,
    min: number,
    max: number,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'adjustable' as AccessibilityRole,
    accessibilityValue: {
      min,
      max,
      now: value,
    },
  }), []);

  /**
   * Get accessibility props for headers
   */
  const getHeaderAccessibilityProps = useCallback((
    label: string,
    level: 1 | 2 | 3 | 4 | 5 | 6 = 1
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'header' as AccessibilityRole,
    accessibilityLevel: level,
  }), []);

  /**
   * Get accessibility props for navigation
   */
  const getNavigationAccessibilityProps = useCallback((
    label: string,
    hint?: string
  ) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as AccessibilityRole,
    accessibilityState: { disabled: false },
  }), []);

  return {
    announceForAccessibility,
    isScreenReaderEnabled,
    getButtonAccessibilityProps,
    getInputAccessibilityProps,
    getListItemAccessibilityProps,
    getImageAccessibilityProps,
    getCheckboxAccessibilityProps,
    getRadioAccessibilityProps,
    getSwitchAccessibilityProps,
    getSliderAccessibilityProps,
    getHeaderAccessibilityProps,
    getNavigationAccessibilityProps,
  };
} 
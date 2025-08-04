import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    primaryContainer: '#BBDEFB',
    secondary: '#FF9800',
    secondaryContainer: '#FFE0B2',
    tertiary: '#9C27B0',
    tertiaryContainer: '#E1BEE7',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#F44336',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1976D2',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#E65100',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#7B1FA2',
    onSurface: '#212121',
    onSurfaceVariant: '#757575',
    onBackground: '#212121',
    onError: '#FFFFFF',
    onErrorContainer: '#C62828',
    outline: '#E0E0E0',
    outlineVariant: '#BDBDBD',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#424242',
    inverseOnSurface: '#FAFAFA',
    inversePrimary: '#90CAF9',
    surfaceDisabled: '#F5F5F5',
    onSurfaceDisabled: '#BDBDBD',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#1976D2',
    secondary: '#FFB74D',
    secondaryContainer: '#F57C00',
    tertiary: '#CE93D8',
    tertiaryContainer: '#7B1FA2',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    background: '#000000',
    error: '#EF5350',
    errorContainer: '#C62828',
    onPrimary: '#000000',
    onPrimaryContainer: '#FFFFFF',
    onSecondary: '#000000',
    onSecondaryContainer: '#FFFFFF',
    onTertiary: '#000000',
    onTertiaryContainer: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B3B3B3',
    onBackground: '#FFFFFF',
    onError: '#000000',
    onErrorContainer: '#FFFFFF',
    outline: '#424242',
    outlineVariant: '#616161',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#FAFAFA',
    inverseOnSurface: '#212121',
    inversePrimary: '#1976D2',
    surfaceDisabled: '#1E1E1E',
    onSurfaceDisabled: '#616161',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export const priorityColors = {
  high: '#F44336',
  medium: '#FF9800',
  low: '#4CAF50',
};

export const priorityColorsLight = {
  high: '#D32F2F',
  medium: '#F57C00',
  low: '#388E3C',
};

export const priorityColorsDark = {
  high: '#EF5350',
  medium: '#FFB74D',
  low: '#81C784',
};

export const categoryColors = [
  '#2196F3', '#FF9800', '#9C27B0', '#4CAF50', '#F44336',
  '#00BCD4', '#FF5722', '#795548', '#607D8B', '#E91E63',
  '#3F51B5', '#009688', '#FFC107', '#8BC34A', '#FF4081',
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
  },
  body1: {
    fontSize: 16,
  },
  body2: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
  overline: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
}; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppSelector } from '../store/hooks';
import { lightTheme, darkTheme } from '../constants/theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a real app, you would log this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => {
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.error }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        
        {__DEV__ && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Error: {error.message}
            </Text>
            <Text style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
              {error.stack}
            </Text>
          </View>
        )}
        
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={resetError}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            Try Again
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => {
              // In a real app, you might want to restart the app or navigate to home
              console.log('Restart app or navigate to home');
            }}
            style={styles.button}
          >
            Go to Home
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ErrorBoundaryClass; 
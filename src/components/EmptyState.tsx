import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { lightTheme, darkTheme } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon,
  actionText,
  onAction,
  showAction = false,
}) => {
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={styles.icon}
      />
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {subtitle}
      </Text>
      {showAction && actionText && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});

export default EmptyState; 
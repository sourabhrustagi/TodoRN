import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, Priority } from '../types';
import { getPriorityColor, getPriorityIcon, formatDate, isToday, isOverdue } from '../utils/helpers';
import { useAppSelector } from '../store/hooks';
import { lightTheme, darkTheme } from '../constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = memo(({ task, onPress, onDelete, onToggleComplete }) => {
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;

  const priorityColor = getPriorityColor(task.priority);
  const priorityIcon = getPriorityIcon(task.priority);

  const getDueDateColor = () => {
    if (!task.dueDate) return theme.colors.onSurfaceVariant;
    if (isOverdue(task.dueDate)) return theme.colors.error;
    if (isToday(task.dueDate)) return theme.colors.primary;
    return theme.colors.onSurfaceVariant;
  };

  const getDueDateText = () => {
    if (!task.dueDate) return '';
    if (isOverdue(task.dueDate)) return `Overdue: ${formatDate(task.dueDate)}`;
    if (isToday(task.dueDate)) return `Today: ${formatDate(task.dueDate)}`;
    return `Due: ${formatDate(task.dueDate)}`;
  };

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: task.completed ? theme.colors.outline : 'transparent',
          borderWidth: task.completed ? 1 : 0,
        },
      ]}
      onPress={() => onPress(task)}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.title,
                {
                  color: task.completed ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <View style={styles.actions}>
              <IconButton
                icon={task.completed ? 'check-circle' : 'circle-outline'}
                size={20}
                onPress={() => onToggleComplete(task)}
                iconColor={task.completed ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <IconButton
                icon="delete-outline"
                size={20}
                onPress={() => onDelete(task)}
                iconColor={theme.colors.error}
              />
            </View>
          </View>
        </View>

        {task.description && (
          <Text
            variant="bodyMedium"
            style={[
              styles.description,
              {
                color: theme.colors.onSurfaceVariant,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={3}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Chip
            icon={priorityIcon}
            style={[styles.priorityChip, { backgroundColor: priorityColor + '20' }]}
            textStyle={{ color: priorityColor }}
          >
            {task.priority}
          </Chip>

          {task.dueDate && (
            <Text
              variant="bodySmall"
              style={[styles.dueDate, { color: getDueDateColor() }]}
            >
              {getDueDateText()}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityChip: {
    height: 24,
  },
  dueDate: {
    fontSize: 12,
  },
});

export default TaskCard; 
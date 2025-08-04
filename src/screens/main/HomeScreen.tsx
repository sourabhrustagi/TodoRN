import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, FAB, Portal, Modal, TextInput, SegmentedButtons, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { Task, Priority } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state: taskState, deleteTask, createTask } = useTask();
  const { state: authState } = useAuth();
  const navigation = useNavigation();
  
  // Dialog state
  const [visible, setVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    setVisible(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsCreating(true);
    try {
      const success = await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
        dueDate: undefined,
        categoryId: '', // Empty string for no category
      });

      if (success) {
        hideDialog();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    (navigation as any).navigate('TaskDetail', { taskId: task.id });
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.primary;
      case 'low': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'flag';
      case 'medium': return 'flag-outline';
      case 'low': return 'flag-variant-outline';
      default: return 'flag-outline';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Welcome back, {authState.user?.name || 'User'}!
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Manage your tasks efficiently
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {taskState.tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="clipboard-text-outline" 
              size={64} 
              color={theme.colors.outline} 
            />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No tasks yet
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Tap the + button to create your first task
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {taskState.tasks.map((task) => (
              <Card
                key={task.id}
                style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleTaskPress(task)}
              >
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                      <Text 
                        variant="titleMedium" 
                        style={[
                          styles.taskTitle, 
                          { color: theme.colors.onSurface },
                          task.completed && styles.completedTask
                        ]}
                      >
                        {task.title}
                      </Text>
                      <MaterialCommunityIcons
                        name={getPriorityIcon(task.priority)}
                        size={16}
                        color={getPriorityColor(task.priority)}
                        style={styles.priorityIcon}
                      />
                    </View>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.priorityChip, { borderColor: getPriorityColor(task.priority) }]}
                      textStyle={{ color: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </Chip>
                  </View>
                  
                  {task.description && (
                    <Text 
                      variant="bodySmall" 
                      style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}
                      numberOfLines={2}
                    >
                      {task.description}
                    </Text>
                  )}
                  
                  <View style={styles.taskFooter}>
                    {task.dueDate && (
                      <Text variant="bodySmall" style={[styles.dueDate, { color: theme.colors.onSurfaceVariant }]}>
                        Due: {formatDate(task.dueDate)}
                      </Text>
                    )}
                    <View style={styles.taskActions}>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleDeleteTask(task)}
                        textColor={theme.colors.error}
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDialog}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Create New Task
          </Text>
          
          <TextInput
            label="Task Title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            mode="outlined"
            style={styles.input}
            autoFocus
          />
          
          <TextInput
            label="Description (optional)"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          
          <Text variant="bodyMedium" style={[styles.priorityLabel, { color: theme.colors.onSurface }]}>
            Priority
          </Text>
          
          <SegmentedButtons
            value={newTaskPriority}
            onValueChange={(value) => setNewTaskPriority(value as Priority)}
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={styles.priorityButtons}
          />
          
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={hideDialog} style={styles.modalButton}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateTask}
              loading={isCreating}
              disabled={!newTaskTitle.trim() || isCreating}
              style={styles.modalButton}
            >
              Create
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={showDialog}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    fontWeight: '600',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityIcon: {
    marginLeft: 8,
  },
  priorityChip: {
    marginLeft: 8,
  },
  taskDescription: {
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontStyle: 'italic',
  },
  taskActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  priorityLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  priorityButtons: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default HomeScreen; 
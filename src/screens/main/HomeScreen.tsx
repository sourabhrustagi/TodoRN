import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, FAB, Portal, Modal, TextInput, SegmentedButtons, Chip, Searchbar, Menu, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTask, deleteTask } from '../../store/slices/taskSlice';
import { Task, Priority } from '../../types';
import { lightTheme, darkTheme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fieldValidators } from '../../utils/validation';
import performanceMonitor from '../../utils/performance';
import logger from '../../utils/logger';
import { useAccessibility } from '../../hooks/useAccessibility';
import { APP_CONSTANTS } from '../../constants/app';

type SortOption = 'low' | 'medium' | 'high';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector(state => state.task);
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const accessibility = useAccessibility();
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('medium');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  
  // Dialog state
  const [visible, setVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      logger.info('Search tasks', { query });
    },
    []
  );

  // Filtered and sorted tasks with memoization
  const filteredAndSortedTasks = useMemo(() => {
    try {
      let filteredTasks = tasks;
      
      // Filter by search query
      if (searchQuery.trim()) {
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by priority level
      filteredTasks = filteredTasks.filter(task => task.priority === sortBy);
      
      // Sort by creation date (newest first)
      filteredTasks.sort((a, b) => {
        try {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } catch (error) {
          console.error('HomeScreen: Error sorting tasks:', error);
          return 0;
        }
      });
      
      return filteredTasks;
    } catch (error) {
      console.error('HomeScreen: Error filtering/sorting tasks:', error);
      return tasks; // Return original tasks if there's an error
    }
  }, [tasks, searchQuery, sortBy]);

  const showDialog = useCallback(() => {
    setVisible(true);
    logger.info('Open create task dialog');
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
  }, []);

  const handleCreateTask = useCallback(async () => {
    // Validate task data
    const titleErrors = fieldValidators.taskTitle(newTaskTitle);
    const descriptionErrors = fieldValidators.taskDescription(newTaskDescription);
    
    if (titleErrors.length > 0) {
      Alert.alert('Error', titleErrors[0]);
      return;
    }
    
    if (descriptionErrors.length > 0) {
      Alert.alert('Error', descriptionErrors[0]);
      return;
    }

    const startTime = Date.now();
    
    setIsCreating(true);
    try {
      const taskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
        dueDate: undefined,
        categoryId: '',
      };

      const result = await performanceMonitor.measureAsync(
        'create_task',
        () => dispatch(createTask(taskData)).unwrap()
      );

      logger.info('Task created', { taskId: result.id, title: result.title, priority: result.priority });
      
      hideDialog();
    } catch (error) {
      console.error('HomeScreen: Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [newTaskTitle, newTaskDescription, newTaskPriority, dispatch, hideDialog]);

  const handleTaskPress = useCallback((task: Task) => {
    logger.info('Task pressed', { taskId: task.id, title: task.title });
    (navigation as any).navigate('TaskDetail', { taskId: task.id });
  }, [navigation]);

  const handleDeleteTask = useCallback((task: Task) => {
    logger.info('Delete task requested', { taskId: task.id, title: task.title });
    setTaskToDelete(task);
    setDeleteDialogVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!taskToDelete) return;

    const startTime = Date.now();
    
    setIsDeleting(true);
    try {
      const result = await performanceMonitor.measureAsync(
        'delete_task',
        () => dispatch(deleteTask(taskToDelete.id)).unwrap()
      );
      
      logger.info('Task deleted', { taskId: taskToDelete.id, title: taskToDelete.title });
      
      setDeleteDialogVisible(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('HomeScreen: Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [taskToDelete, dispatch]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogVisible(false);
    setTaskToDelete(null);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

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

  const getSortIcon = () => {
    switch (sortBy) {
      case 'low': return 'flag-variant-outline';
      case 'medium': return 'flag-outline';
      case 'high': return 'flag';
      default: return 'flag-outline';
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'Medium';
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
        <View style={styles.headerTop}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Welcome back, User!
          </Text>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <IconButton
                icon={getSortIcon()}
                size={24}
                onPress={() => setSortMenuVisible(true)}
                style={styles.sortButton}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setSortBy('medium');
                setSortMenuVisible(false);
              }}
              title="Sort by Medium"
              leadingIcon="flag-outline"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('high');
                setSortMenuVisible(false);
              }}
              title="Sort by High"
              leadingIcon="flag"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('low');
                setSortMenuVisible(false);
              }}
              title="Sort by Low"
              leadingIcon="flag-variant-outline"
            />
          </Menu>
        </View>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Manage your tasks efficiently
        </Text>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
          {...accessibility.getInputAccessibilityProps('Search tasks', 'Enter text to search for tasks')}
        />
        
        {/* Sort indicator */}
        <View style={styles.sortIndicator}>
          <Text variant="bodySmall" style={[styles.sortText, { color: theme.colors.onSurfaceVariant }]}>
            Showing: {getSortLabel()} Priority Tasks
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Tasks List */}
        {filteredAndSortedTasks.length > 0 ? (
          <View style={styles.taskList}>
            {filteredAndSortedTasks.map((task) => (
              <Card
                key={task.id}
                style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleTaskPress(task)}
                {...accessibility.getListItemAccessibilityProps(
                  `Task: ${task.title}`,
                  `Priority: ${task.priority}, ${task.description ? `Description: ${task.description}` : 'No description'}`
                )}
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
                        onPress={() => {
                          console.log('HomeScreen: Delete button pressed for task:', task.id, task.title);
                          handleDeleteTask(task);
                        }}
                        textColor={theme.colors.error}
                        {...accessibility.getButtonAccessibilityProps(
                          `Delete task: ${task.title}`,
                          'Double tap to delete this task'
                        )}
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              {searchQuery.trim() ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery.trim() 
                ? 'Try adjusting your search or create a new task'
                : 'Create your first task to get started'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDialog}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text 
            variant="headlineSmall" 
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            {...accessibility.getHeaderAccessibilityProps('Create New Task', 2)}
          >
            Create New Task
          </Text>
          
          <TextInput
            label="Task Title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            mode="outlined"
            style={styles.input}
            autoFocus
            {...accessibility.getInputAccessibilityProps('Task title', 'Enter the title for your new task', true)}
          />
          
          <TextInput
            label="Description (optional)"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            {...accessibility.getInputAccessibilityProps('Task description', 'Enter an optional description for your task')}
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
            <Button 
              mode="outlined" 
              onPress={hideDialog} 
              style={styles.modalButton}
              {...accessibility.getButtonAccessibilityProps('Cancel', 'Cancel creating new task')}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreateTask}
              loading={isCreating}
              disabled={isCreating}
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              {...accessibility.getButtonAccessibilityProps('Create task', 'Create the new task')}
            >
              Create Task
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal
          visible={deleteDialogVisible}
          onDismiss={handleCancelDelete}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text 
            variant="headlineSmall" 
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            {...accessibility.getHeaderAccessibilityProps('Confirm Deletion', 2)}
          >
            Confirm Deletion
          </Text>
          <Text variant="bodyMedium" style={[styles.modalText, { color: theme.colors.onSurfaceVariant }]}>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </Text>
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={handleCancelDelete} 
              style={styles.modalButton}
              {...accessibility.getButtonAccessibilityProps('Cancel', 'Cancel deleting the task')}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleConfirmDelete}
              loading={isDeleting}
              disabled={isDeleting}
              style={styles.modalButton}
              {...accessibility.getButtonAccessibilityProps('Delete', 'Confirm deletion of the task')}
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={showDialog}
        {...accessibility.getButtonAccessibilityProps('Add new task', 'Create a new task')}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 8,
    elevation: 2,
  },
  sortButton: {
    marginLeft: 8,
  },
  sortIndicator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sortText: {
    fontStyle: 'italic',
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
  modalText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default HomeScreen; 
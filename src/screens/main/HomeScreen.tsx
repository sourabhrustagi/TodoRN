import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, FAB, Portal, Modal, TextInput, SegmentedButtons, Chip, Searchbar, Menu, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTask, deleteTask } from '../../store/slices/taskSlice';
import { Task, Priority } from '../../types';
import { lightTheme, darkTheme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SortOption = 'low' | 'medium' | 'high';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector(state => state.task);
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  
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

  // Filtered and sorted tasks
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

    console.log('HomeScreen: Starting task creation...');
    console.log('HomeScreen: Current tasks count:', tasks.length);
    console.log('HomeScreen: Task data:', {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      priority: newTaskPriority,
      dueDate: undefined,
      categoryId: '',
    });

    setIsCreating(true);
    try {
      // Validate task data before creating
      const taskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
        dueDate: undefined,
        categoryId: '',
      };

      // Additional validation
      if (taskData.title.length > 100) {
        Alert.alert('Error', 'Task title is too long (max 100 characters)');
        return;
      }

      if (taskData.description.length > 500) {
        Alert.alert('Error', 'Task description is too long (max 500 characters)');
        return;
      }

      const result = await dispatch(createTask(taskData)).unwrap();

      console.log('HomeScreen: Task created successfully:', result);
      console.log('HomeScreen: New tasks count:', tasks.length + 1);
      
      hideDialog();
    } catch (error) {
      console.error('HomeScreen: Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    (navigation as any).navigate('TaskDetail', { taskId: task.id });
  };

  const handleDeleteTask = async (task: Task) => {
    console.log('HomeScreen: handleDeleteTask called for task:', task.id, task.title);
    setTaskToDelete(task);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    console.log('HomeScreen: User confirmed delete for task:', taskToDelete.id);
    console.log('HomeScreen: Current tasks count before delete:', tasks.length);
    
    setIsDeleting(true);
    try {
      const result = await dispatch(deleteTask(taskToDelete.id)).unwrap();
      console.log('HomeScreen: Delete dispatch result:', result);
      console.log('HomeScreen: Task deleted successfully');
      
      setDeleteDialogVisible(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('HomeScreen: Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    console.log('HomeScreen: Delete cancelled by user');
    setDeleteDialogVisible(false);
    setTaskToDelete(null);
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
            Welcome back, {/* authState.user?.name || 'User' */}!
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
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
        />
        
        {/* Sort indicator */}
        <View style={styles.sortIndicator}>
          <Text variant="bodySmall" style={[styles.sortText, { color: theme.colors.onSurfaceVariant }]}>
            Showing: {getSortLabel()} Priority Tasks
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredAndSortedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="clipboard-text-outline" 
              size={64} 
              color={theme.colors.outline} 
            />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              {searchQuery.trim() ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery.trim() ? 'Try adjusting your search' : 'Tap the + button to create your first task'}
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredAndSortedTasks.map((task) => (
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
                        onPress={() => {
                          console.log('HomeScreen: Delete button pressed for task:', task.id, task.title);
                          handleDeleteTask(task);
                        }}
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

      <Portal>
        <Modal
          visible={deleteDialogVisible}
          onDismiss={handleCancelDelete}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Confirm Deletion
          </Text>
          <Text variant="bodyMedium" style={[styles.modalText, { color: theme.colors.onSurfaceVariant }]}>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </Text>
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={handleCancelDelete} style={styles.modalButton}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleConfirmDelete}
              loading={isDeleting}
              disabled={isDeleting}
              style={styles.modalButton}
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
});

export default HomeScreen; 
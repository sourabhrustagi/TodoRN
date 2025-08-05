import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Chip, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';
import { Task, Priority } from '../../types';
import { lightTheme, darkTheme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TaskDetailScreenProps {
  route?: {
    params?: {
      taskId?: string;
    };
  };
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.task);
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  
  const taskId = route?.params?.taskId;
  const [task, setTask] = useState<Task | null>(null);
  
  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCompleted, setEditCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setEditTitle(foundTask.title);
        setEditDescription(foundTask.description);
        setEditPriority(foundTask.priority);
        setEditCompleted(foundTask.completed);
      }
    }
  }, [taskId, tasks]);

  const handleEdit = () => {
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!task || !editTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(updateTask({
        taskId: task.id,
        updates: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          completed: editCompleted,
        }
      })).unwrap();

      setEditVisible(false);
      // Refresh task data
      const updatedTask = tasks.find(t => t.id === task.id);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    console.log('TaskDetailScreen: handleDelete called for task:', task.id, task.title);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!task) return;

    console.log('TaskDetailScreen: User confirmed delete for task:', task.id);
    console.log('TaskDetailScreen: Attempting to delete task:', task.id);
    
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(task.id)).unwrap();
      console.log('TaskDetailScreen: Task deleted successfully, navigating back');
      
      setDeleteDialogVisible(false);
      
      // Navigate back to home screen immediately after successful deletion
      (navigation as any).navigate('MainTabs', { screen: 'Home' });
    } catch (error) {
      console.error('TaskDetailScreen: Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    console.log('TaskDetailScreen: Delete cancelled by user');
    setDeleteDialogVisible(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            Task not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => (navigation as any).goBack()}
          icon="arrow-left"
        >
          Back
        </Button>
        <View style={styles.headerActions}>
          <Button mode="text" onPress={handleEdit} icon="pencil">
            Edit
          </Button>
          <Button mode="text" onPress={handleDelete} icon="delete" textColor={theme.colors.error}>
            Delete
          </Button>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleContainer}>
                <Text 
                  variant="headlineSmall" 
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
                  size={20}
                  color={getPriorityColor(task.priority)}
                  style={styles.priorityIcon}
                />
              </View>
              <Chip
                mode="outlined"
                style={[styles.priorityChip, { borderColor: getPriorityColor(task.priority) }]}
                textStyle={{ color: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </Chip>
            </View>

            {task.description && (
              <Text 
                variant="bodyMedium" 
                style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}
              >
                {task.description}
              </Text>
            )}

            <View style={styles.taskInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  Created: {formatDate(task.createdAt)}
                </Text>
              </View>

              {task.dueDate && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    Due: {formatDate(task.dueDate)}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  Status: {task.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Edit Task
          </Text>
          
          <TextInput
            label="Task Title"
            value={editTitle}
            onChangeText={setEditTitle}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Description"
            value={editDescription}
            onChangeText={setEditDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          
          <Text variant="bodyMedium" style={[styles.priorityLabel, { color: theme.colors.onSurface }]}>
            Priority
          </Text>
          
          <SegmentedButtons
            value={editPriority}
            onValueChange={(value) => setEditPriority(value as Priority)}
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={styles.priorityButtons}
          />
          
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setEditVisible(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveEdit}
              loading={isSaving}
              disabled={!editTitle.trim() || isSaving}
              style={styles.modalButton}
            >
              Save
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
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Confirm Deletion
          </Text>
          <Text variant="bodyMedium" style={[styles.modalText, { color: theme.colors.onSurfaceVariant }]}>
            Are you sure you want to delete "{task?.title}"? This action cannot be undone.
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    fontWeight: 'bold',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  taskInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
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

export default TaskDetailScreen; 
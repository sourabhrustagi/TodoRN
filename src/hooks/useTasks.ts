import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loadTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { useApi } from './useApi';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import logger from '../utils/logger';

export const useTasks = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const isLoading = useSelector((state: RootState) => state.task.isLoading);
  const error = useSelector((state: RootState) => state.task.error);
  const api = useApi();

  const fetchTasks = useCallback(async () => {
    try {
      await dispatch(loadTasks()).unwrap();
      logger.info('Tasks loaded successfully', { count: tasks.length });
    } catch (error) {
      logger.error('Failed to load tasks', error);
      throw error;
    }
  }, [dispatch, tasks.length]);

  const addTask = useCallback(
    async (taskData: CreateTaskRequest) => {
      try {
        const newTask = await dispatch(createTask(taskData)).unwrap();
        logger.info('Task created successfully', { taskId: newTask.id });
        return newTask;
      } catch (error) {
        logger.error('Failed to create task', error);
        throw error;
      }
    },
    [dispatch]
  );

  const editTask = useCallback(
    async (taskId: string, updates: UpdateTaskRequest) => {
      try {
        const updatedTask = await dispatch(updateTask({ taskId, updates })).unwrap();
        logger.info('Task updated successfully', { taskId });
        return updatedTask;
      } catch (error) {
        logger.error('Failed to update task', error);
        throw error;
      }
    },
    [dispatch]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        logger.info('Task deleted successfully', { taskId });
        return true;
      } catch (error) {
        logger.error('Failed to delete task', error);
        throw error;
      }
    },
    [dispatch]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      return editTask(taskId, { completed: !task.completed });
    },
    [tasks, editTask]
  );

  // Computed values
  const completedTasks = useMemo(() => tasks.filter(task => task.completed), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
  const highPriorityTasks = useMemo(() => tasks.filter(task => task.priority === 'high'), [tasks]);
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < now
    );
  }, [tasks]);

  const tasksByCategory = useMemo(() => {
    const grouped = tasks.reduce((acc, task) => {
      const category = task.categoryId || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    
    return grouped;
  }, [tasks]);

  const tasksByPriority = useMemo(() => {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = [];
      }
      acc[task.priority].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    
    return grouped;
  }, [tasks]);

  // Auto-load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    // State
    tasks,
    isLoading,
    error,

    // Actions
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    toggleTaskCompletion,

    // Computed values
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    overdueTasks,
    tasksByCategory,
    tasksByPriority,

    // Statistics
    totalTasks: tasks.length,
    completedCount: completedTasks.length,
    pendingCount: pendingTasks.length,
    overdueCount: overdueTasks.length,
    highPriorityCount: highPriorityTasks.length,

    // API state
    apiLoading: api.loading,
    apiError: api.error,
  };
};

export default useTasks; 
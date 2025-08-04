import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import MockApiService from '../services/MockApiService';
import { Task, Category, TaskState, TaskFilters, CreateTaskRequest, UpdateTaskRequest, CreateCategoryRequest, UpdateCategoryRequest, TaskStats } from '../types';
import { useAuth } from './AuthContext';

interface TaskContextType {
  state: TaskState;
  stats: TaskStats;
  createTask: (request: CreateTaskRequest) => Promise<boolean>;
  updateTask: (taskId: string, updates: UpdateTaskRequest) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskComplete: (taskId: string) => Promise<boolean>;
  createCategory: (request: CreateCategoryRequest) => Promise<boolean>;
  updateCategory: (categoryId: string, updates: UpdateCategoryRequest) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  getFilteredTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getCategoryById: (categoryId: string) => Category | undefined;
}

interface TaskProviderProps {
  children: ReactNode;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  console.log('TaskProvider: Initializing TaskProvider');
  
  const { state: authState } = useAuth();
  const [state, setState] = useState<TaskState>({
    tasks: [],
    categories: [],
    isLoading: false,
    error: null,
    filters: {
      search: '',
      categoryId: null,
      priority: null,
      status: null,
      dueDate: null,
    },
  });

  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });

  useEffect(() => {
    console.log('TaskProvider: useEffect triggered, auth state changed:', {
      isAuthenticated: authState.isAuthenticated,
      userId: authState.user?.id
    });
    
    if (authState.isAuthenticated && authState.user) {
      console.log('TaskProvider: User authenticated, loading data');
      loadData();
    } else {
      console.log('TaskProvider: User not authenticated, clearing data');
      setState(prev => ({ ...prev, tasks: [], categories: [] }));
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      });
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadData = async () => {
    console.log('TaskProvider: loadData called');
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const api = MockApiService.getInstance();
      await api.initialize();
      
      const [tasks, categories] = await Promise.all([
        api.getTasks(authState.user?.id || 'default'),
        api.getCategories(authState.user?.id || 'default'),
      ]);
      
      console.log('TaskProvider: Loaded data:', {
        tasksCount: tasks.length,
        categoriesCount: categories.length
      });
      
      setState(prev => ({
        ...prev,
        tasks,
        categories,
        isLoading: false,
      }));
      
      updateStats(tasks);
    } catch (error) {
      console.error('TaskProvider: Error loading data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load data',
      }));
    }
  };

  const updateStats = (tasks: Task[]) => {
    console.log('TaskProvider: updateStats called with', tasks.length, 'tasks');
    
    const now = new Date();
    const stats: TaskStats = {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length,
      overdue: tasks.filter(task => !task.completed && task.dueDate && task.dueDate < now).length,
      highPriority: tasks.filter(task => task.priority === 'high').length,
      mediumPriority: tasks.filter(task => task.priority === 'medium').length,
      lowPriority: tasks.filter(task => task.priority === 'low').length,
    };
    
    console.log('TaskProvider: Updated stats:', stats);
    setStats(stats);
  };

  const createTask = async (request: CreateTaskRequest): Promise<boolean> => {
    console.log('TaskProvider: createTask called with request:', request);
    try {
      const api = MockApiService.getInstance();
      const result = await api.createTask(request, authState.user?.id || 'default');
      
      if (result.success && result.task) {
        setState(prev => ({
          ...prev,
          tasks: [...prev.tasks, result.task!],
        }));
        
        updateStats([...state.tasks, result.task!]);
        console.log('TaskProvider: Task created successfully');
        return true;
      } else {
        console.log('TaskProvider: Task creation failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error creating task:', error);
      setState(prev => ({ ...prev, error: 'Failed to create task' }));
      return false;
    }
  };

  const updateTask = async (taskId: string, updates: UpdateTaskRequest): Promise<boolean> => {
    console.log('TaskProvider: updateTask called for taskId:', taskId, 'with updates:', updates);
    try {
      const api = MockApiService.getInstance();
      const result = await api.updateTask(taskId, updates, authState.user?.id || 'default');
      
      if (result.success && result.task) {
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => 
            task.id === taskId ? result.task! : task
          ),
        }));
        
        updateStats(state.tasks.map(task => 
          task.id === taskId ? result.task! : task
        ));
        
        console.log('TaskProvider: Task updated successfully');
        return true;
      } else {
        console.log('TaskProvider: Task update failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error updating task:', error);
      setState(prev => ({ ...prev, error: 'Failed to update task' }));
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    console.log('TaskProvider: deleteTask called for taskId:', taskId);
    try {
      const api = MockApiService.getInstance();
      const result = await api.deleteTask(taskId, authState.user?.id || 'default');
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.filter(task => task.id !== taskId),
        }));
        
        updateStats(state.tasks.filter(task => task.id !== taskId));
        console.log('TaskProvider: Task deleted successfully');
        return true;
      } else {
        console.log('TaskProvider: Task deletion failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error deleting task:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete task' }));
      return false;
    }
  };

  const toggleTaskComplete = async (taskId: string): Promise<boolean> => {
    console.log('TaskProvider: toggleTaskComplete called for taskId:', taskId);
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    return await updateTask(taskId, { completed: !task.completed });
  };

  const createCategory = async (request: CreateCategoryRequest): Promise<boolean> => {
    console.log('TaskProvider: createCategory called with request:', request);
    try {
      const api = MockApiService.getInstance();
      const result = await api.createCategory(request, authState.user?.id || 'default');
      
      if (result.success && result.category) {
        setState(prev => ({
          ...prev,
          categories: [...prev.categories, result.category!],
        }));
        
        console.log('TaskProvider: Category created successfully');
        return true;
      } else {
        console.log('TaskProvider: Category creation failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error creating category:', error);
      setState(prev => ({ ...prev, error: 'Failed to create category' }));
      return false;
    }
  };

  const updateCategory = async (categoryId: string, updates: UpdateCategoryRequest): Promise<boolean> => {
    console.log('TaskProvider: updateCategory called for categoryId:', categoryId, 'with updates:', updates);
    try {
      const api = MockApiService.getInstance();
      const result = await api.updateCategory(categoryId, updates, authState.user?.id || 'default');
      
      if (result.success && result.category) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(category => 
            category.id === categoryId ? result.category! : category
          ),
        }));
        
        console.log('TaskProvider: Category updated successfully');
        return true;
      } else {
        console.log('TaskProvider: Category update failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error updating category:', error);
      setState(prev => ({ ...prev, error: 'Failed to update category' }));
      return false;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    console.log('TaskProvider: deleteCategory called for categoryId:', categoryId);
    try {
      const api = MockApiService.getInstance();
      const result = await api.deleteCategory(categoryId, authState.user?.id || 'default');
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(category => category.id !== categoryId),
        }));
        
        console.log('TaskProvider: Category deleted successfully');
        return true;
      } else {
        console.log('TaskProvider: Category deletion failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('TaskProvider: Error deleting category:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete category' }));
      return false;
    }
  };

  const setFilters = (filters: Partial<TaskFilters>) => {
    console.log('TaskProvider: setFilters called with filters:', filters);
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  };

  const clearFilters = () => {
    console.log('TaskProvider: clearFilters called');
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        categoryId: null,
        priority: null,
        status: null,
        dueDate: null,
      },
    }));
  };

  const getFilteredTasks = (): Task[] => {
    console.log('TaskProvider: getFilteredTasks called');
    let filteredTasks = state.tasks;

    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    if (state.filters.categoryId) {
      filteredTasks = filteredTasks.filter(task => task.categoryId === state.filters.categoryId);
    }

    if (state.filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === state.filters.priority);
    }

    if (state.filters.status === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (state.filters.status === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    if (state.filters.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      switch (state.filters.dueDate) {
        case 'today':
          filteredTasks = filteredTasks.filter(task =>
            task.dueDate && task.dueDate >= today && task.dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case 'week':
          filteredTasks = filteredTasks.filter(task =>
            task.dueDate && task.dueDate >= today && task.dueDate < weekEnd
          );
          break;
        case 'overdue':
          filteredTasks = filteredTasks.filter(task =>
            task.dueDate && task.dueDate < today && !task.completed
          );
          break;
      }
    }

    console.log('TaskProvider: Filtered tasks count:', filteredTasks.length);
    return filteredTasks;
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return state.tasks.find(task => task.id === taskId);
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return state.categories.find(category => category.id === categoryId);
  };

  console.log('TaskProvider: Rendering with state:', {
    tasksCount: state.tasks.length,
    categoriesCount: state.categories.length,
    isLoading: state.isLoading,
    error: state.error
  });

  return (
    <TaskContext.Provider value={{
      state,
      stats,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      createCategory,
      updateCategory,
      deleteCategory,
      setFilters,
      clearFilters,
      getFilteredTasks,
      getTaskById,
      getCategoryById,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 
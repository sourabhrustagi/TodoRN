import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';
import { Task, Priority, CreateTaskRequest, UpdateTaskRequest } from '../../types';

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

// Helper function to convert API response to Task
const convertApiTaskToTask = (apiTask: any): Task => {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    completed: apiTask.completed,
    priority: apiTask.priority,
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : null,
    categoryId: apiTask.category.id,
    createdAt: new Date(apiTask.createdAt),
    updatedAt: new Date(apiTask.updatedAt),
    userId: 'user_1', // Default user ID
    tags: [],
    repeatInterval: 'none',
    attachments: [],
    notes: '',
  };
};

// Async thunks
export const loadTasks = createAsyncThunk(
  'task/loadTasks',
  async (_, { rejectWithValue }) => {
    try {
      const api = ApiService.getInstance();
      await api.initialize();
      const response = await api.getTasks();
      
      if (response.success && response.data) {
        return response.data.tasks.map(convertApiTaskToTask);
      } else {
        return rejectWithValue('Failed to load tasks');
      }
    } catch (error) {
      return rejectWithValue('Failed to load tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (request: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const api = ApiService.getInstance();
      const apiRequest = {
        title: request.title,
        description: request.description,
        priority: request.priority,
        categoryId: request.categoryId,
        dueDate: request.dueDate ? request.dueDate.toISOString() : undefined,
      };
      
      const result = await api.createTask(apiRequest);
      
      if (result.success && result.data) {
        return convertApiTaskToTask(result.data);
      } else {
        return rejectWithValue('Failed to create task');
      }
    } catch (error) {
      return rejectWithValue('Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequest }, { rejectWithValue }) => {
    try {
      const api = ApiService.getInstance();
      const apiRequest: any = {};
      
      if (updates.title !== undefined) apiRequest.title = updates.title;
      if (updates.description !== undefined) apiRequest.description = updates.description;
      if (updates.priority !== undefined) apiRequest.priority = updates.priority;
      if (updates.categoryId !== undefined) apiRequest.categoryId = updates.categoryId;
      if (updates.dueDate !== undefined) apiRequest.dueDate = updates.dueDate ? updates.dueDate.toISOString() : null;
      if (updates.completed !== undefined) apiRequest.completed = updates.completed;
      
      const result = await api.updateTask(taskId, apiRequest);
      
      if (result.success && result.data) {
        return convertApiTaskToTask(result.data);
      } else {
        return rejectWithValue('Failed to update task');
      }
    } catch (error) {
      return rejectWithValue('Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    console.log('TaskSlice: deleteTask async thunk called for taskId:', taskId);
    try {
      const api = ApiService.getInstance();
      const result = await api.deleteTask(taskId);
      
      console.log('TaskSlice: deleteTask API result:', result);
      
      if (result.success) {
        console.log('TaskSlice: deleteTask successful, returning taskId:', taskId);
        return taskId;
      } else {
        console.log('TaskSlice: deleteTask failed:', result.message);
        return rejectWithValue(result.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('TaskSlice: deleteTask error:', error);
      return rejectWithValue('Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // loadTasks
    builder
      .addCase(loadTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        console.log('TaskSlice: createTask fulfilled, current tasks count:', state.tasks.length);
        console.log('TaskSlice: New task to add:', action.payload);
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        console.log('TaskSlice: Tasks after adding new task:', state.tasks.length);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateTask
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteTask
    builder
      .addCase(deleteTask.pending, (state) => {
        console.log('TaskSlice: deleteTask pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        console.log('TaskSlice: deleteTask fulfilled, taskId:', action.payload);
        console.log('TaskSlice: Current tasks count before delete:', state.tasks.length);
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        console.log('TaskSlice: Tasks count after delete:', state.tasks.length);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        console.log('TaskSlice: deleteTask rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = taskSlice.actions;
export default taskSlice.reducer; 
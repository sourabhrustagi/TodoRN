import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import MockApiService from '../../services/MockApiService';
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

// Async thunks
export const loadTasks = createAsyncThunk(
  'task/loadTasks',
  async (_, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      const tasks = await api.getTasks();
      return tasks;
    } catch (error) {
      return rejectWithValue('Failed to load tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (request: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      const result = await api.createTask(request);
      
      if (result.success && result.task) {
        return result.task;
      } else {
        return rejectWithValue(result.message || 'Failed to create task');
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
      const api = MockApiService.getInstance();
      const result = await api.updateTask(taskId, updates);
      
      if (result.success && result.task) {
        return result.task;
      } else {
        return rejectWithValue(result.message || 'Failed to update task');
      }
    } catch (error) {
      return rejectWithValue('Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      const result = await api.deleteTask(taskId);
      
      if (result.success) {
        return taskId;
      } else {
        return rejectWithValue(result.message || 'Failed to delete task');
      }
    } catch (error) {
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
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = taskSlice.actions;
export default taskSlice.reducer; 
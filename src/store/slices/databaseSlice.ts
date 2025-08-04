import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import MockApiService from '../../services/MockApiService';

export interface DatabaseState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: DatabaseState = {
  isInitialized: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const initializeDatabase = createAsyncThunk(
  'database/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to initialize database');
    }
  }
);

const databaseSlice = createSlice({
  name: 'database',
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
    // initializeDatabase
    builder
      .addCase(initializeDatabase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeDatabase.fulfilled, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initializeDatabase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = databaseSlice.actions;
export default databaseSlice.reducer; 
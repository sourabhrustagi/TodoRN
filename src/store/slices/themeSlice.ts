import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import MockApiService from '../../services/MockApiService';

export interface ThemeState {
  isDark: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ThemeState = {
  isDark: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loadThemeSettings = createAsyncThunk(
  'theme/loadThemeSettings',
  async (_, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      const settings = await api.getSettings();
      
      if (settings) {
        return settings.theme === 'dark';
      } else {
        return false;
      }
    } catch (error) {
      return rejectWithValue('Failed to load theme settings');
    }
  }
);

export const toggleTheme = createAsyncThunk(
  'theme/toggleTheme',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { theme: ThemeState };
      const newIsDark = !state.theme.isDark;
      
      const api = MockApiService.getInstance();
      const currentSettings = await api.getSettings();
      
      if (currentSettings) {
        const updatedSettings = {
          ...currentSettings,
          theme: (newIsDark ? 'dark' : 'light') as 'light' | 'dark',
        };
        await api.updateSettings(updatedSettings);
      }
      
      return newIsDark;
    } catch (error) {
      return rejectWithValue('Failed to toggle theme');
    }
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loadThemeSettings
    builder
      .addCase(loadThemeSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadThemeSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isDark = action.payload;
      })
      .addCase(loadThemeSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // toggleTheme
    builder
      .addCase(toggleTheme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isDark = action.payload;
      })
      .addCase(toggleTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTheme, clearError } = themeSlice.actions;
export default themeSlice.reducer; 
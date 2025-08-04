import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import MockApiService from '../../services/MockApiService';
import { Feedback, FeedbackRequest } from '../../types';

export interface FeedbackState {
  feedbacks: Feedback[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (feedback: FeedbackRequest, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      // Create a full Feedback object from FeedbackRequest
      const fullFeedback: Feedback = {
        id: Date.now().toString(),
        userId: 'default',
        rating: feedback.rating,
        comment: feedback.comment,
        category: feedback.category,
        createdAt: new Date(),
      };
      const result = await api.submitFeedback(fullFeedback);
      
      if (result.success) {
        return fullFeedback;
      } else {
        return rejectWithValue(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      return rejectWithValue('Failed to submit feedback');
    }
  }
);

export const loadFeedbacks = createAsyncThunk(
  'feedback/load',
  async (_, { rejectWithValue }) => {
    try {
      const api = MockApiService.getInstance();
      const feedbacks = await api.getFeedbacks();
      return feedbacks;
    } catch (error) {
      return rejectWithValue('Failed to load feedbacks');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
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
    // submitFeedback
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedbacks.unshift(action.payload);
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // loadFeedbacks
    builder
      .addCase(loadFeedbacks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFeedbacks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedbacks = action.payload;
      })
      .addCase(loadFeedbacks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = feedbackSlice.actions;
export default feedbackSlice.reducer; 
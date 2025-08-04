import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for error handling
export const useAppError = () => {
  const authError = useAppSelector(state => state.auth.error);
  const taskError = useAppSelector(state => state.task.error);
  const themeError = useAppSelector(state => state.theme.error);
  const databaseError = useAppSelector(state => state.database.error);
  const feedbackError = useAppSelector(state => state.feedback.error);
  
  return authError || taskError || themeError || databaseError || feedbackError;
};

// Custom hook for loading states
export const useAppLoading = () => {
  const authLoading = useAppSelector(state => state.auth.isLoading);
  const taskLoading = useAppSelector(state => state.task.isLoading);
  const databaseLoading = useAppSelector(state => state.database.isLoading);
  const feedbackLoading = useAppSelector(state => state.feedback.isLoading);
  
  return authLoading || taskLoading || databaseLoading || feedbackLoading;
}; 
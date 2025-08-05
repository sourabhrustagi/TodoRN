import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { sendOtp, verifyOtp, logout, checkAuthStatus } from '../store/slices/authSlice';
import { useApi } from './useApi';
import logger from '../utils/logger';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const api = useApi();

  const login = useCallback(
    async (phone: string, otp: string) => {
      try {
        await dispatch(verifyOtp({ phone, otp })).unwrap();
        logger.info('User logged in successfully', { phone });
        return true;
      } catch (error) {
        logger.error('Login failed', error);
        throw error;
      }
    },
    [dispatch]
  );

  const sendOtpCode = useCallback(
    async (phone: string) => {
      try {
        await dispatch(sendOtp(phone)).unwrap();
        logger.info('OTP sent successfully', { phone });
        return true;
      } catch (error) {
        logger.error('OTP send failed', error);
        throw error;
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      logger.info('User logged out successfully');
      return true;
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      await dispatch(checkAuthStatus()).unwrap();
      logger.info('Auth status checked successfully');
      return true;
    } catch (error) {
      logger.error('Auth status check failed', error);
      return false;
    }
  }, [dispatch]);

  // Auto-check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    // State
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error,

    // Actions
    login,
    sendOtpCode,
    logout: logoutUser,
    checkAuth,

    // API state
    apiLoading: api.loading,
    apiError: api.error,
  };
};

export default useAuth; 
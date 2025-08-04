import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MockApiService from '../services/MockApiService';
import { AuthState, User, LoginRequest, SendOtpRequest } from '../types';

interface AuthContextType {
  state: AuthState;
  sendOtp: (phone: string) => Promise<boolean>;
  login: (request: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider: Initializing AuthProvider');
  
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    console.log('AuthProvider: useEffect triggered, checking auth status');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('AuthProvider: checkAuthStatus called');
    try {
      const api = MockApiService.getInstance();
      await api.initialize();
      
      const authStatus = await api.getAuthStatus();
      console.log('AuthProvider: Auth status:', authStatus);
      
      if (authStatus.isAuthenticated && authStatus.user) {
        console.log('AuthProvider: Setting authenticated state with user:', authStatus.user.name);
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: authStatus.user,
          error: null,
        });
      } else {
        console.log('AuthProvider: Setting unauthenticated state');
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      console.error('AuthProvider: Error checking auth status:', error);
      // Don't set error state, just set as unauthenticated
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  };

  const sendOtp = async (phone: string): Promise<boolean> => {
    console.log('AuthProvider: sendOtp called with phone:', phone);
    try {
      const api = MockApiService.getInstance();
      const result = await api.sendOtp(phone);
      
      if (result.success) {
        console.log('AuthProvider: OTP sent successfully');
        return true;
      } else {
        console.log('AuthProvider: OTP send failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('AuthProvider: Error sending OTP:', error);
      setState(prev => ({ ...prev, error: 'Failed to send OTP' }));
      return false;
    }
  };

  const login = async (request: LoginRequest): Promise<boolean> => {
    console.log('AuthProvider: login called with request:', request);
    try {
      const api = MockApiService.getInstance();
      const result = await api.verifyOtp(request);
      
      if (result.success && result.user) {
        console.log('AuthProvider: Login successful, setting authenticated state');
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          error: null,
        });
        return true;
      } else {
        console.log('AuthProvider: Login failed:', result.message);
        setState(prev => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      console.error('AuthProvider: Error during login:', error);
      setState(prev => ({ ...prev, error: 'Login failed' }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('AuthProvider: logout called');
    try {
      const api = MockApiService.getInstance();
      const result = await api.logout();
      
      if (result.success) {
        console.log('AuthProvider: Logout successful, clearing state');
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      } else {
        console.error('AuthProvider: Logout failed:', result.message);
      }
    } catch (error) {
      console.error('AuthProvider: Error during logout:', error);
      // Still clear state even if API call fails
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  };

  const updateUser = async (user: User): Promise<void> => {
    console.log('AuthProvider: updateUser called with user:', user.name);
    try {
      // Store updated user data
      await AsyncStorage.setItem('mock_user_data', JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('AuthProvider: Error updating user:', error);
    }
  };

  console.log('AuthProvider: Rendering with state:', {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user?.name,
    error: state.error
  });

  return (
    <AuthContext.Provider value={{ state, sendOtp, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
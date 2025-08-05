import { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import logger from '../utils/logger';

export const useAppNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const navigateToHome = useCallback(() => {
    navigation.navigate('Home');
    logger.info('Navigated to Home');
  }, [navigation]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
    logger.info('Navigated to Login');
  }, [navigation]);

  const navigateToOtp = useCallback((phone: string) => {
    navigation.navigate('Otp', { phone });
    logger.info('Navigated to OTP', { phone });
  }, [navigation]);

  const navigateToTaskDetail = useCallback((taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
    logger.info('Navigated to Task Detail', { taskId });
  }, [navigation]);

  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
    logger.info('Navigated to Settings');
  }, [navigation]);

  const navigateToApiSettings = useCallback(() => {
    navigation.navigate('ApiSettings');
    logger.info('Navigated to API Settings');
  }, [navigation]);

  const navigateToEnvironmentSelector = useCallback(() => {
    navigation.navigate('EnvironmentSelector');
    logger.info('Navigated to Environment Selector');
  }, [navigation]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      logger.info('Navigated back');
    }
  }, [navigation]);

  const resetToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    logger.info('Reset navigation to Home');
  }, [navigation]);

  const resetToAuth = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    logger.info('Reset navigation to Login');
  }, [navigation]);

  return {
    // Current route info
    currentRoute: route.name,
    currentParams: route.params,

    // Navigation actions
    navigateToHome,
    navigateToLogin,
    navigateToOtp,
    navigateToTaskDetail,
    navigateToSettings,
    navigateToApiSettings,
    navigateToEnvironmentSelector,
    goBack,
    resetToHome,
    resetToAuth,

    // Navigation utilities
    canGoBack: navigation.canGoBack(),
    navigation,
  };
};

export default useAppNavigation; 
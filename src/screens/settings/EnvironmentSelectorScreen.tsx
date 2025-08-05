import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../../hooks/useAccessibility';
import { getEnvironment, getConfig, Environment } from '../../config/environments';
import { devHelpers } from '../../utils/apiConfig';
import logger from '../../utils/logger';

const EnvironmentSelectorScreen: React.FC = () => {
  const { colors } = useTheme();
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('mock');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentEnvironment();
  }, []);

  const loadCurrentEnvironment = () => {
    const env = getEnvironment();
    setCurrentEnvironment(env);
  };

  const handleEnvironmentChange = async (newEnvironment: Environment) => {
    setIsLoading(true);
    try {
      // Set environment variable
      process.env.EXPO_PUBLIC_ENVIRONMENT = newEnvironment;
      
      // Update API mode based on environment
      if (newEnvironment === 'mock') {
        await devHelpers.enableMockApi();
      } else {
        await devHelpers.enableRealApi();
      }
      
      setCurrentEnvironment(newEnvironment);
      
      Alert.alert(
        'Environment Changed',
        `Switched to ${newEnvironment} environment. Please restart the app for full changes to take effect.`,
        [{ text: 'OK' }]
      );
      
      logger.info(`Environment changed to ${newEnvironment}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change environment');
      logger.error('Failed to change environment', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentConfig = (env: Environment) => {
    const config = getConfig();
    return {
      name: config.name,
      apiUrl: config.api.baseUrl,
      mockMode: config.api.mockMode,
      debug: config.app.debug,
      features: config.features,
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.onBackground,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    environmentCard: {
      borderWidth: 2,
      borderColor: colors.outline,
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    environmentTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: 8,
    },
    environmentDescription: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    configRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    configLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    configValue: {
      fontSize: 12,
      color: colors.onSurface,
      fontWeight: '500',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colors.outline,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    featureDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    featureText: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
  });

  const environments: { key: Environment; title: string; description: string }[] = [
    {
      key: 'mock',
      title: 'Mock Environment',
      description: 'Uses local storage and simulated API responses for development and testing',
    },
    {
      key: 'development',
      title: 'Development Environment',
      description: 'Connects to development API server with debugging enabled',
    },
    {
      key: 'production',
      title: 'Production Environment',
      description: 'Connects to production API server with optimized settings',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Selection</Text>
          
          {environments.map((env) => {
            const config = getEnvironmentConfig(env.key);
            const isSelected = currentEnvironment === env.key;
            
            return (
              <TouchableOpacity
                key={env.key}
                style={[
                  styles.card,
                  styles.environmentCard,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => handleEnvironmentChange(env.key)}
                disabled={isLoading}
              >
                <Text style={styles.environmentTitle}>{env.title}</Text>
                <Text style={styles.environmentDescription}>{env.description}</Text>
                
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>API URL:</Text>
                  <Text style={styles.configValue}>{config.apiUrl}</Text>
                </View>
                
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Mock Mode:</Text>
                  <Text style={styles.configValue}>{config.mockMode ? 'Yes' : 'No'}</Text>
                </View>
                
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Debug:</Text>
                  <Text style={styles.configValue}>{config.debug ? 'Enabled' : 'Disabled'}</Text>
                </View>
                
                <Text style={[styles.configLabel, { marginTop: 8 }]}>Features:</Text>
                <View style={styles.featureRow}>
                  <View 
                    style={[
                      styles.featureDot, 
                      { backgroundColor: config.features.analytics ? colors.primary : colors.outline }
                    ]} 
                  />
                  <Text style={styles.featureText}>Analytics</Text>
                </View>
                <View style={styles.featureRow}>
                  <View 
                    style={[
                      styles.featureDot, 
                      { backgroundColor: config.features.crashReporting ? colors.primary : colors.outline }
                    ]} 
                  />
                  <Text style={styles.featureText}>Crash Reporting</Text>
                </View>
                <View style={styles.featureRow}>
                  <View 
                    style={[
                      styles.featureDot, 
                      { backgroundColor: config.features.pushNotifications ? colors.primary : colors.outline }
                    ]} 
                  />
                  <Text style={styles.featureText}>Push Notifications</Text>
                </View>
                <View style={styles.featureRow}>
                  <View 
                    style={[
                      styles.featureDot, 
                      { backgroundColor: config.features.offlineSupport ? colors.primary : colors.outline }
                    ]} 
                  />
                  <Text style={styles.featureText}>Offline Support</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Environment</Text>
          
          <View style={styles.card}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Environment:</Text>
              <Text style={styles.configValue}>{currentEnvironment.toUpperCase()}</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>API Mode:</Text>
              <Text style={styles.configValue}>
                {getEnvironmentConfig(currentEnvironment).mockMode ? 'MOCK' : 'REAL'}
              </Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Debug:</Text>
              <Text style={styles.configValue}>
                {getEnvironmentConfig(currentEnvironment).debug ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          
          <View style={styles.card}>
            <Text style={styles.environmentDescription}>
              • Mock: Best for development and testing{'\n'}
              • Development: For testing with real API endpoints{'\n'}
              • Production: For final testing and release{'\n'}
              • Restart the app after changing environment{'\n'}
              • Environment changes persist across app restarts
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EnvironmentSelectorScreen; 
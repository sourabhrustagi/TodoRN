import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useAccessibility';
import { devHelpers, isMockMode } from '../../utils/apiConfig';
import { APP_CONSTANTS } from '../../constants/app';

const ApiSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [isMock, setIsMock] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadCurrentMode();
  }, []);

  const loadCurrentMode = async () => {
    try {
      const mockMode = await isMockMode();
      setIsMock(mockMode);
    } catch (error) {
      console.error('Failed to load current mode:', error);
    }
  };

  const handleToggleMode = async () => {
    setIsLoading(true);
    try {
      const newMode = !isMock;
      if (newMode) {
        await devHelpers.enableMockApi();
      } else {
        await devHelpers.enableRealApi();
      }
      setIsMock(newMode);
      
      Alert.alert(
        'API Mode Changed',
        `Switched to ${newMode ? 'MOCK' : 'REAL'} API mode`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change API mode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await devHelpers.testApiConnection();
      setTestResult(result);
      
      Alert.alert(
        'Connection Test',
        `Mode: ${result.mode}\nStatus: ${result.success ? 'Success' : 'Failed'}\n${result.error || ''}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test connection');
    } finally {
      setIsLoading(false);
    }
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      color: colors.onSurface,
      flex: 1,
    },
    value: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    description: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginTop: 8,
      lineHeight: 20,
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
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>API Mode</Text>
              <Switch
                value={isMock}
                onValueChange={handleToggleMode}
                disabled={isLoading}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={colors.onPrimary}
              />
            </View>
            <Text style={styles.description}>
              {isMock 
                ? 'Using MOCK API for development and testing'
                : 'Using REAL API for production'
              }
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Current Configuration</Text>
            <View style={styles.row}>
              <Text style={styles.value}>Base URL:</Text>
              <Text style={styles.value}>{APP_CONSTANTS.API.BASE_URL}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>Timeout:</Text>
              <Text style={styles.value}>{APP_CONSTANTS.API.TIMEOUT}ms</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>Mode:</Text>
              <View style={styles.statusRow}>
                <View 
                  style={[
                    styles.statusIndicator, 
                    { backgroundColor: isMock ? colors.primary : colors.secondary }
                  ]} 
                />
                <Text style={styles.value}>{isMock ? 'MOCK' : 'REAL'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleTestConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Info</Text>
          
          <View style={styles.card}>
            <Text style={styles.description}>
              • Mock Mode: Uses local storage and simulated API responses{'\n'}
              • Real Mode: Connects to actual API endpoints{'\n'}
              • Switch modes to test different scenarios{'\n'}
              • Test connection to verify API availability
            </Text>
          </View>
        </View>

        {testResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Test Result</Text>
            
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.value}>Mode:</Text>
                <Text style={styles.value}>{testResult.mode}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.value}>Status:</Text>
                <Text style={styles.value}>
                  {testResult.success ? 'Success' : 'Failed'}
                </Text>
              </View>
              {testResult.error && (
                <Text style={styles.description}>
                  Error: {testResult.error}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ApiSettingsScreen; 
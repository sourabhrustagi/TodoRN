import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Surface, 
  IconButton,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { sendOtp } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  
  // State management
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Refs
  const phoneInputRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Validate phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation - allow numbers with or without country code
    const phoneRegex = /^(\+?[1-9]\d{1,14}|\d{10,15})$/;
    return phoneRegex.test(phone);
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // If it starts with +, format as international
    if (phone.startsWith('+')) {
      return phone.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    }
    // Otherwise format as local number
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Handle phone number change
  const handlePhoneChange = (text: string) => {
    // Remove all non-digit characters except +
    const cleaned = text.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
  };

  // Handle send OTP
  const handleSendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showError('Please enter a valid phone number (e.g., +1234567890 or 1234567890)');
      return;
    }

    try {
      console.log('LoginScreen: Sending OTP for phone:', phoneNumber);
      const result = await dispatch(sendOtp(phoneNumber)).unwrap();
      
      console.log('LoginScreen: OTP sent successfully, navigating to OTP screen');
      setSnackbarMessage('OTP sent successfully!');
      setShowSnackbar(true);
      
      // Navigate to OTP screen with phone number
      (navigation as any).navigate('Otp', { phone: phoneNumber });
    } catch (error) {
      console.error('LoginScreen: Error sending OTP:', error);
      showError(error as string || 'Failed to send OTP. Please try again.');
    }
  };

  // Show error message
  const showError = (message: string) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const isPhoneValid = validatePhoneNumber(phoneNumber);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text 
                variant="headlineLarge" 
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                Welcome Back
              </Text>
              
              <Text 
                variant="bodyLarge" 
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              >
                Sign in to continue with your tasks
              </Text>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text 
                variant="bodyMedium" 
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                Phone Number
              </Text>
              
              <TextInput
                ref={phoneInputRef}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number (e.g., 1234567890)"
                keyboardType="phone-pad"
                style={[
                  styles.phoneInput,
                  { 
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: phoneNumber && !isPhoneValid ? theme.colors.error : theme.colors.outline,
                  }
                ]}
                mode="outlined"
                disabled={isLoading}
                autoFocus
                left={<TextInput.Icon icon="phone" />}
              />
              
              {phoneNumber && !isPhoneValid && (
                <Text 
                  variant="bodySmall" 
                  style={[styles.errorText, { color: theme.colors.error }]}
                >
                  Please enter a valid phone number (10-15 digits)
                </Text>
              )}
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <IconButton
                  icon="alert-circle"
                  size={16}
                  iconColor={theme.colors.error}
                />
                <Text 
                  variant="bodySmall" 
                  style={[styles.error, { color: theme.colors.error }]}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSendOtp}
                loading={isLoading}
                disabled={!isPhoneValid || isLoading}
                style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>


            </View>


          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Snackbar for messages */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: theme.colors.surfaceVariant }]}
        action={{
          label: 'Dismiss',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    marginBottom: 8,
  },
  phoneInput: {
    borderRadius: 12,
  },
  errorText: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  sendButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },

  snackbar: {
    margin: 16,
    borderRadius: 8,
  },
});

export default LoginScreen; 
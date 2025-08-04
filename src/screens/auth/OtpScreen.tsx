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
import { verifyOtp } from '../../store/slices/authSlice';
import { lightTheme, darkTheme } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface OtpScreenProps {
  route?: {
    params?: {
      phone?: string;
    };
  };
}

const OtpScreen: React.FC<OtpScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const isDark = useAppSelector(state => state.theme.isDark);
  const theme = isDark ? darkTheme : lightTheme;
  
  // State management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Refs
  const inputRefs = useRef<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Get phone from route params or use placeholder
  const phoneNumber = route?.params?.phone || '+1234567890';

  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Handle OTP input changes
  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-focus previous input on backspace
    if (!digit && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validate OTP format
  const validateOtp = (otpArray: string[]): boolean => {
    const otpString = otpArray.join('');
    return otpString.length === 6 && /^\d{6}$/.test(otpString);
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (!validateOtp(otp)) {
      showError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      console.log('OtpScreen: Verifying OTP:', otpString);
      const result = await dispatch(verifyOtp({ phone: phoneNumber, otp: otpString })).unwrap();
      
      console.log('OtpScreen: OTP verified successfully');
      setSnackbarMessage('Login successful!');
      setShowSnackbar(true);
      
      // Clear OTP inputs
      clearOtpInputs();
    } catch (error) {
      console.error('OtpScreen: Error verifying OTP:', error);
      showError(error as string || 'Invalid OTP. Please try again.');
      triggerShakeAnimation();
    }
  };



  // Clear OTP inputs
  const clearOtpInputs = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Show error message
  const showError = (message: string) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  // Trigger shake animation for invalid input
  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+')) {
      return phone.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    }
    return phone;
  };

  const isOtpComplete = otp.every(digit => digit !== '') && validateOtp(otp);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: shakeAnim }]
            }
          ]}
        >
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Title and Description */}
            <View style={styles.header}>
              <Text 
                variant="headlineMedium" 
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                Verify Your Phone
              </Text>
              
              <Text 
                variant="bodyMedium" 
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              >
                We've sent a 6-digit code to
              </Text>
              
              <Text 
                variant="bodyLarge" 
                style={[styles.phoneNumber, { color: theme.colors.primary }]}
              >
                {formatPhoneNumber(phoneNumber)}
              </Text>
            </View>

            {/* OTP Input Container */}
            <View style={styles.otpContainer}>
              <Text 
                variant="bodySmall" 
                style={[styles.otpLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Enter the 6-digit code
              </Text>
              
              <View style={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref: any) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[
                      styles.otpInput,
                      { 
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: digit ? theme.colors.primary : theme.colors.outline,
                      }
                    ]}
                    textAlign="center"
                    mode="outlined"
                    disabled={isLoading}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
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
                onPress={handleVerifyOtp}
                loading={isLoading}
                disabled={!isOtpComplete || isLoading}
                style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </View>

            {/* Demo Info */}
            <View style={styles.helpContainer}>
              <Text 
                variant="bodySmall" 
                style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
              >
                Demo: Use OTP 123456
              </Text>
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
    paddingHorizontal: 24,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpLabel: {
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 8,
    borderWidth: 2,
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
    marginBottom: 16,
  },
  verifyButton: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },

  helpContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  helpText: {
    textAlign: 'center',
  },
  snackbar: {
    marginBottom: 20,
  },
});

export default OtpScreen; 
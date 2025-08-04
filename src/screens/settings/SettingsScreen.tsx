import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Button, Divider, Portal, Modal, TextInput, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const { theme, isDark, isAuto, toggleTheme, setAutoTheme } = useTheme();
  const { logout, state: authState } = useAuth();
  const navigation = useNavigation();
  
  // Feedback modal state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleFeedback = () => {
    setFeedbackVisible(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      // Here you would typically call your feedback API
      // For now, we'll just show a success message
      Alert.alert('Success', 'Thank you for your feedback!');
      setFeedbackVisible(false);
      setFeedbackComment('');
      setFeedbackRating(5);
      setFeedbackCategory('general');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getThemeIcon = () => {
    if (isAuto) return 'theme-light-dark';
    return isDark ? 'weather-night' : 'weather-sunny';
  };

  const getThemeText = () => {
    if (isAuto) return 'Auto';
    return isDark ? 'Dark' : 'Light';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Settings
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Customize your experience
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Account
          </List.Subheader>
          
          <List.Item
            title={authState.user?.name || 'User'}
            description={authState.user?.phone || 'No phone number'}
            left={(props) => (
              <MaterialCommunityIcons 
                name="account-circle" 
                size={24} 
                color={theme.colors.primary} 
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        {/* Appearance */}
        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Appearance
          </List.Subheader>
          
          <List.Item
            title="Theme"
            description={getThemeText()}
            left={(props) => (
              <MaterialCommunityIcons 
                name={getThemeIcon()} 
                size={24} 
                color={theme.colors.primary} 
              />
            )}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          
          <List.Item
            title="Auto Theme"
            description="Follow system theme"
            left={(props) => (
              <MaterialCommunityIcons 
                name="theme-light-dark" 
                size={24} 
                color={theme.colors.primary} 
              />
            )}
            right={() => (
              <Switch
                value={isAuto}
                onValueChange={setAutoTheme}
                color={theme.colors.primary}
              />
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        {/* Support */}
        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Support
          </List.Subheader>
          
          <List.Item
            title="Send Feedback"
            description="Help us improve the app"
            left={(props) => (
              <MaterialCommunityIcons 
                name="message-text" 
                size={24} 
                color={theme.colors.primary} 
              />
            )}
            onPress={handleFeedback}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        {/* Account Actions */}
        <List.Section>
          <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            Account
          </List.Subheader>
          
          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => (
              <MaterialCommunityIcons 
                name="logout" 
                size={24} 
                color={theme.colors.error} 
              />
            )}
            onPress={handleLogout}
            style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
            titleStyle={{ color: theme.colors.error }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>
      </ScrollView>

      {/* Feedback Modal */}
      <Portal>
        <Modal
          visible={feedbackVisible}
          onDismiss={() => setFeedbackVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Send Feedback
          </Text>
          
          <Text variant="bodyMedium" style={[styles.ratingLabel, { color: theme.colors.onSurface }]}>
            Rating
          </Text>
          
          <SegmentedButtons
            value={feedbackRating.toString()}
            onValueChange={(value) => setFeedbackRating(parseInt(value))}
            buttons={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
            ]}
            style={styles.ratingButtons}
          />
          
          <TextInput
            label="Category"
            value={feedbackCategory}
            onChangeText={setFeedbackCategory}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Your Feedback"
            value={feedbackComment}
            onChangeText={setFeedbackComment}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Tell us what you think..."
          />
          
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setFeedbackVisible(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmitFeedback}
              loading={isSubmittingFeedback}
              disabled={!feedbackComment.trim() || isSubmittingFeedback}
              style={styles.modalButton}
            >
              Submit
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItem: {
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  ratingButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default SettingsScreen; 
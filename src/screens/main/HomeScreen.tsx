import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useTask } from '../../contexts/TaskContext';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { stats } = useTask();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Dashboard
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Welcome to your task manager
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                  {stats.total}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Tasks
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                  {stats.completed}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Completed
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                  {stats.pending}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Pending
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={{ color: theme.colors.error }}>
                  {stats.overdue}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Overdue
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Quick Actions */}
          <Surface style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
            <Text 
              variant="titleMedium" 
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Quick Actions
            </Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => {}}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              >
                Add New Task
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.actionButton}
              >
                View All Tasks
              </Button>
            </View>
          </Surface>

          {/* Priority Summary */}
          <Surface style={[styles.priorityCard, { backgroundColor: theme.colors.surface }]}>
            <Text 
              variant="titleMedium" 
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Priority Summary
            </Text>
            
            <View style={styles.priorityItems}>
              <View style={styles.priorityItem}>
                <View style={[styles.priorityDot, { backgroundColor: '#F44336' }]} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  High Priority: {stats.highPriority}
                </Text>
              </View>
              
              <View style={styles.priorityItem}>
                <View style={[styles.priorityDot, { backgroundColor: '#FF9800' }]} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Medium Priority: {stats.mediumPriority}
                </Text>
              </View>
              
              <View style={styles.priorityItem}>
                <View style={[styles.priorityDot, { backgroundColor: '#4CAF50' }]} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Low Priority: {stats.lowPriority}
                </Text>
              </View>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  quickActionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  priorityCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  priorityItems: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default HomeScreen; 
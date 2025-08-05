// Analytics utilities for the app

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled = __DEV__;

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    console.log('Analytics Event:', event);
  }

  trackScreenView(screenName: string) {
    this.track('screen_view', { screen_name: screenName });
  }

  trackTaskCreated(taskId: string, priority: string) {
    this.track('task_created', { task_id: taskId, priority });
  }

  trackTaskCompleted(taskId: string) {
    this.track('task_completed', { task_id: taskId });
  }

  trackTaskDeleted(taskId: string) {
    this.track('task_deleted', { task_id: taskId });
  }

  trackUserLogin(method: string) {
    this.track('user_login', { method });
  }

  trackUserLogout() {
    this.track('user_logout');
  }

  trackThemeChanged(theme: string) {
    this.track('theme_changed', { theme });
  }

  trackSearchPerformed(query: string, resultCount: number) {
    this.track('search_performed', { query, result_count: resultCount });
  }

  trackError(error: string, context?: string) {
    this.track('error', { error, context });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const analytics = new Analytics(); 
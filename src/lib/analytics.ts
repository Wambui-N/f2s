// Analytics tracking utility for forms page
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionStart: number = Date.now();
  private pageViewStart: number = Date.now();

  // Track page view
  trackPageView(page: string, properties?: Record<string, any>) {
    this.pageViewStart = Date.now();
    this.track('page_view', {
      page,
      ...properties
    });
  }

  // Track view toggle usage
  trackViewToggle(viewMode: 'grid' | 'table') {
    this.track('view_toggle', {
      view_mode: viewMode,
      time_on_previous_view: Date.now() - this.pageViewStart
    });
    this.pageViewStart = Date.now();
  }

  // Track search usage
  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>) {
    this.track('search', {
      query,
      results_count: resultsCount,
      query_length: query.length,
      has_filters: Object.keys(filters || {}).length > 0,
      filters: filters
    });
  }

  // Track filter usage
  trackFilter(filterType: string, filterValue: any, previousValue?: any) {
    this.track('filter_change', {
      filter_type: filterType,
      filter_value: filterValue,
      previous_value: previousValue,
      changed_from_default: previousValue !== undefined
    });
  }

  // Track form actions
  trackFormAction(action: string, formId: string, formTitle: string, additionalData?: Record<string, any>) {
    this.track('form_action', {
      action,
      form_id: formId,
      form_title: formTitle,
      ...additionalData
    });
  }

  // Track bulk actions
  trackBulkAction(action: string, selectedCount: number, formIds: string[]) {
    this.track('bulk_action', {
      action,
      selected_count: selectedCount,
      form_ids: formIds
    });
  }

  // Track time spent
  trackTimeSpent(section: string, timeSpent: number) {
    this.track('time_spent', {
      section,
      time_spent_ms: timeSpent
    });
  }

  // Track user interaction patterns
  trackInteraction(interaction: string, element: string, properties?: Record<string, any>) {
    this.track('interaction', {
      interaction,
      element,
      ...properties
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance', {
      metric,
      value,
      unit
    });
  }

  // Track error events
  trackError(error: string, context: string, properties?: Record<string, any>) {
    this.track('error', {
      error,
      context,
      ...properties
    });
  }

  // Track success events
  trackSuccess(action: string, properties?: Record<string, any>) {
    this.track('success', {
      action,
      ...properties
    });
  }

  // Private method to add events
  private track(event: string, properties?: Record<string, any>) {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_duration: Date.now() - this.sessionStart,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      }
    };

    this.events.push(eventData);

    // In a real app, you would send this to your analytics service
    // For now, we'll just log it and store in localStorage for demo
    if (typeof window !== 'undefined') {
      console.log('Analytics Event:', eventData);
      
      // Store in localStorage for demo purposes
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      storedEvents.push(eventData);
      
      // Keep only last 100 events to prevent storage bloat
      if (storedEvents.length > 100) {
        storedEvents.splice(0, storedEvents.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    }
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const now = Date.now();
    const sessionDuration = now - this.sessionStart;
    const pageDuration = now - this.pageViewStart;

    return {
      session_duration: sessionDuration,
      page_duration: pageDuration,
      total_events: this.events.length,
      events: this.events
    };
  }

  // Clear events (useful for testing)
  clearEvents() {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_events');
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Hook for React components
export function useAnalytics() {
  return analytics;
}

// Analytics data fetching functions
export async function getUserAnalytics(userId: string) {
  try {
    // Import supabase client here to avoid circular dependencies
    const { supabase } = await import('./supabase');
    
    // Get user's forms
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('id, title, status, created_at, updated_at')
      .eq('user_id', userId);

    if (formsError) {
      console.error('Error fetching user forms:', formsError);
      return null;
    }

    // Get submissions count
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('form_id', forms?.map(f => f.id) || []);

    if (submissionsError) {
      console.error('Error fetching submissions count:', submissionsError);
    }

    // Calculate analytics
    const totalForms = forms?.length || 0;
    const publishedForms = forms?.filter(f => f.status === 'published').length || 0;
    const totalSubmissions = submissionsCount || 0;

    return {
      total_forms: totalForms.toString(),
      published_forms: publishedForms.toString(),
      total_submissions: totalSubmissions.toString(),
      forms: forms || []
    };
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    return null;
  }
}

export async function getFormAnalytics(userId: string, days: number = 30) {
  try {
    // Import supabase client here to avoid circular dependencies
    const { supabase } = await import('./supabase');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get forms with submission counts
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select(`
        id,
        title,
        status,
        created_at,
        submissions(count)
      `)
      .eq('user_id', userId);

    if (formsError) {
      console.error('Error fetching form analytics:', formsError);
      return [];
    }

    // Get recent submissions
    const { data: recentSubmissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id, form_id, created_at')
      .in('form_id', forms?.map(f => f.id) || [])
      .gte('created_at', startDate.toISOString());

    if (submissionsError) {
      console.error('Error fetching recent submissions:', submissionsError);
    }

    // Calculate analytics for each form
    const formAnalytics = forms?.map(form => {
      const recentCount = recentSubmissions?.filter(s => s.form_id === form.id).length || 0;
      return {
        form_id: form.id,
        form_title: form.title,
        status: form.status,
        total_submissions: form.submissions?.[0]?.count || 0,
        recent_submissions: recentCount,
        created_at: form.created_at
      };
    }) || [];

    return formAnalytics;
  } catch (error) {
    console.error('Error in getFormAnalytics:', error);
    return [];
  }
}

export async function trackFormViewAuto(formId: string) {
  try {
    // Track form view event
    analytics.trackInteraction('form_view_auto', 'form', {
      form_id: formId
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking form view:', error);
    return false;
  }
}
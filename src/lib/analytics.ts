import { supabase } from './supabase';

export interface FormViewData {
  formId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}

/**
 * Track a form view for analytics
 */
export async function trackFormView(data: FormViewData): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('track_form_view', {
      p_form_id: data.formId,
      p_ip_address: data.ipAddress || null,
      p_user_agent: data.userAgent || null,
      p_referrer: data.referrer || null,
      p_session_id: data.sessionId || null
    });

    if (error) {
      console.error('Error tracking form view:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking form view:', error);
    return false;
  }
}

/**
 * Generate a session ID for tracking unique visitors
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create a session ID from localStorage
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  const existingSessionId = localStorage.getItem('formtosheets_session_id');
  if (existingSessionId) {
    return existingSessionId;
  }
  
  const newSessionId = generateSessionId();
  localStorage.setItem('formtosheets_session_id', newSessionId);
  return newSessionId;
}

/**
 * Get client IP address (approximation using a service)
 */
export async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error('Error getting client IP:', error);
    return null;
  }
}

/**
 * Track form view with automatic data collection
 */
export async function trackFormViewAuto(formId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const sessionId = getOrCreateSessionId();
  const userAgent = navigator.userAgent;
  const referrer = document.referrer;

  // Get IP address (optional, can be slow)
  // const ipAddress = await getClientIP();

  return trackFormView({
    formId,
    // ipAddress,
    userAgent,
    referrer,
    sessionId
  });
}

/**
 * Get analytics data for a user
 */
export async function getUserAnalytics(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
      p_user_id: userId
    });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}

/**
 * Get form analytics for a user
 */
export async function getFormAnalytics(userId: string, days: number = 30) {
  try {
    const { data, error } = await supabase.rpc('get_form_analytics', {
      p_user_id: userId,
      p_days: days
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    return [];
  }
}

import { supabase } from './supabase';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  sendNotifications?: boolean;
}

export interface CalendarEventData {
  formId: string;
  submissionId: string;
  submissionData: Record<string, any>;
  formTitle: string;
}

/**
 * Create Google Calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        sendUpdates: event.sendNotifications ? 'all' : 'none'
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Calendar event creation failed:', result);
      return { 
        success: false, 
        error: result.error?.message || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

    return { 
      success: true, 
      eventId: result.id 
    };
  } catch (error) {
    console.error('Calendar event creation error:', error);
    return { 
      success: false, 
      error: 'Failed to create calendar event' 
    };
  }
}

/**
 * Get user's Google Calendar list
 */
export async function getUserCalendars(accessToken: string): Promise<{ success: boolean; calendars?: any[]; error?: string }> {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error?.message || 'Failed to fetch calendars' 
      };
    }

    return { 
      success: true, 
      calendars: result.items || [] 
    };
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return { 
      success: false, 
      error: 'Failed to fetch calendars' 
    };
  }
}

/**
 * Parse date and time from form submission
 */
export function parseFormDateTime(
  submissionData: Record<string, any>,
  dateFieldName: string,
  timeFieldName?: string,
  timezone: string = 'UTC'
): { start: Date; end: Date } | null {
  try {
    const dateValue = submissionData[dateFieldName];
    if (!dateValue) return null;

    let dateTimeString = dateValue;
    
    // Add time if specified
    if (timeFieldName && submissionData[timeFieldName]) {
      dateTimeString += ` ${submissionData[timeFieldName]}`;
    } else {
      dateTimeString += ' 09:00:00'; // Default to 9 AM
    }

    const startDate = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(startDate.getTime())) {
      console.error('Invalid date format:', dateTimeString);
      return null;
    }

    // Default 1 hour duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    return { start: startDate, end: endDate };
  } catch (error) {
    console.error('Error parsing form datetime:', error);
    return null;
  }
}

/**
 * Interpolate template variables in calendar event content
 */
export function interpolateCalendarTemplate(
  template: string,
  formTitle: string,
  submissionData: Record<string, any>
): string {
  let result = template;
  
  // Replace form title
  result = result.replace(/\{\{form_title\}\}/g, formTitle);
  
  // Replace submission data variables
  Object.entries(submissionData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const stringValue = Array.isArray(value) ? value.join(', ') : String(value || '');
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
  });
  
  return result;
}

/**
 * Create calendar event from form submission
 */
export async function createCalendarEventFromSubmission(data: CalendarEventData): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    // Get calendar settings
    const { data: calendarSettings, error: settingsError } = await supabase
      .rpc('get_form_calendar_settings', { p_form_id: data.formId });

    if (settingsError || !calendarSettings || calendarSettings.length === 0) {
      console.error('Failed to get calendar settings:', settingsError);
      return { success: false, error: 'Calendar settings not found' };
    }

    const settings = calendarSettings[0];

    // Check if calendar events are enabled
    if (!settings.is_enabled) {
      return { success: true }; // Not an error, just disabled
    }

    // Validate required fields
    if (!settings.calendar_id || !settings.date_field_name) {
      return { success: false, error: 'Calendar ID or date field not configured' };
    }

    // Parse date/time from submission
    const dateTime = parseFormDateTime(
      data.submissionData,
      settings.date_field_name,
      settings.time_field_name,
      settings.timezone
    );

    if (!dateTime) {
      return { success: false, error: 'Could not parse date/time from submission' };
    }

    // Calculate end time based on duration
    const endTime = new Date(dateTime.start.getTime() + (settings.duration_minutes * 60 * 1000));

    // Get user's Google access token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      return { success: false, error: 'Google access token not available' };
    }

    // Interpolate templates
    const eventTitle = interpolateCalendarTemplate(
      settings.event_title_template,
      settings.form_title,
      data.submissionData
    );

    const eventDescription = interpolateCalendarTemplate(
      settings.event_description_template,
      settings.form_title,
      data.submissionData
    );

    // Prepare attendees
    let attendees: Array<{ email: string }> = [];
    if (settings.add_attendees && settings.attendee_email_field) {
      const attendeeEmail = data.submissionData[settings.attendee_email_field];
      if (attendeeEmail && typeof attendeeEmail === 'string') {
        attendees.push({ email: attendeeEmail });
      }
    }

    // Create calendar event
    const calendarEvent: CalendarEvent = {
      summary: eventTitle,
      description: eventDescription,
      start: {
        dateTime: dateTime.start.toISOString(),
        timeZone: settings.timezone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: settings.timezone
      },
      attendees: attendees.length > 0 ? attendees : undefined,
      sendNotifications: settings.send_notifications
    };

    // Create the event
    const result = await createCalendarEvent(
      session.provider_token,
      settings.calendar_id,
      calendarEvent
    );

    // Log the event creation attempt
    const logData = {
      form_id: data.formId,
      submission_id: data.submissionId,
      google_event_id: result.eventId || null,
      calendar_id: settings.calendar_id,
      event_title: eventTitle,
      event_description: eventDescription,
      event_start: dateTime.start.toISOString(),
      event_end: endTime.toISOString(),
      attendee_emails: attendees.map(a => a.email),
      status: result.success ? 'created' : 'failed',
      error_message: result.error || null
    };

    await supabase.from('calendar_events_log').insert(logData);

    return result;
  } catch (error) {
    console.error('Calendar event creation error:', error);
    return { success: false, error: 'Failed to create calendar event' };
  }
}

/**
 * Get available calendars for a user
 */
export async function getAvailableCalendars(): Promise<{ success: boolean; calendars?: any[]; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      return { success: false, error: 'Google access token not available' };
    }

    return await getUserCalendars(session.provider_token);
  } catch (error) {
    console.error('Error getting available calendars:', error);
    return { success: false, error: 'Failed to get calendars' };
  }
}

/**
 * Test calendar event creation
 */
export async function testCalendarEventCreation(formId: string): Promise<{ success: boolean; error?: string }> {
  const testData: CalendarEventData = {
    formId,
    submissionId: 'test-submission',
    submissionData: {
      name: 'Test Client',
      email: 'test@example.com',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      time: '14:00', // 2 PM
      message: 'This is a test booking to verify calendar integration is working correctly.'
    },
    formTitle: 'Test Form'
  };

  return createCalendarEventFromSubmission(testData);
}


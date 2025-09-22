"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Send,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAvailableCalendars, testCalendarEventCreation } from "@/lib/googleCalendar";
import { FormData } from "./types";

interface CalendarEventsPanelProps {
  formId: string;
  formTitle: string;
  formData: FormData;
}

interface CalendarSettings {
  isEnabled: boolean;
  calendarId: string;
  eventTitleTemplate: string;
  eventDescriptionTemplate: string;
  dateFieldName: string;
  timeFieldName: string;
  durationMinutes: number;
  timezone: string;
  sendNotifications: boolean;
  addAttendees: boolean;
  attendeeEmailField: string;
}

export function CalendarEventsPanel({ formId, formTitle, formData }: CalendarEventsPanelProps) {
  const [settings, setSettings] = useState<CalendarSettings>({
    isEnabled: false,
    calendarId: 'primary',
    eventTitleTemplate: `New appointment from {{form_title}}`,
    eventDescriptionTemplate: `Appointment scheduled via {{form_title}}.\n\nClient Details:\n{{name}}\n{{email}}\n{{phone}}\n\nMessage: {{message}}`,
    dateFieldName: '',
    timeFieldName: '',
    durationMinutes: 60,
    timezone: 'UTC',
    sendNotifications: true,
    addAttendees: false,
    attendeeEmailField: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  useEffect(() => {
    loadCalendarSettings();
    loadAvailableCalendars();
  }, [formId]);

  const loadCalendarSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('form_calendar_settings')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading calendar settings:', error);
        return;
      }

      if (data) {
        setSettings({
          isEnabled: data.is_enabled,
          calendarId: data.calendar_id || 'primary',
          eventTitleTemplate: data.event_title_template,
          eventDescriptionTemplate: data.event_description_template,
          dateFieldName: data.date_field_name || '',
          timeFieldName: data.time_field_name || '',
          durationMinutes: data.duration_minutes,
          timezone: data.timezone,
          sendNotifications: data.send_notifications,
          addAttendees: data.add_attendees,
          attendeeEmailField: data.attendee_email_field || '',
        });
      }
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCalendars = async () => {
    try {
      setLoadingCalendars(true);
      const result = await getAvailableCalendars();
      
      if (result.success && result.calendars) {
        setCalendars(result.calendars);
      } else {
        console.error('Failed to load calendars:', result.error);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  const saveCalendarSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('form_calendar_settings')
        .upsert({
          form_id: formId,
          is_enabled: settings.isEnabled,
          calendar_id: settings.calendarId,
          event_title_template: settings.eventTitleTemplate,
          event_description_template: settings.eventDescriptionTemplate,
          date_field_name: settings.dateFieldName,
          time_field_name: settings.timeFieldName,
          duration_minutes: settings.durationMinutes,
          timezone: settings.timezone,
          send_notifications: settings.sendNotifications,
          add_attendees: settings.addAttendees,
          attendee_email_field: settings.attendeeEmailField,
        }, {
          onConflict: 'form_id'
        });

      if (error) {
        console.error('Error saving calendar settings:', error);
        alert('Failed to save calendar settings');
        return;
      }

      setTestResult({ success: true, message: 'Calendar settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      alert('Failed to save calendar settings');
    } finally {
      setSaving(false);
    }
  };

  const testCalendarEvent = async () => {
    try {
      setTesting(true);
      
      // Save settings first
      await saveCalendarSettings();
      
      // Test calendar event creation
      const result = await testCalendarEventCreation(formId);
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test calendar event created successfully! Check your Google Calendar.' 
          : result.error || 'Failed to create test calendar event'
      });
      
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      console.error('Error testing calendar event:', error);
      setTestResult({
        success: false,
        message: 'Failed to create test calendar event'
      });
    } finally {
      setTesting(false);
    }
  };

  // Get available form fields for mapping
  const availableFields = formData.fields || [];
  const dateTimeFields = availableFields.filter(field => 
    field.type === 'date' || field.type === 'datetime-local' || field.type === 'time'
  );
  const textFields = availableFields.filter(field => 
    field.type === 'text' || field.type === 'email' || field.type === 'textarea'
  );

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading calendar settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Events Toggle */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Calendar className="mr-3 h-5 w-5 text-purple-600" />
            Google Calendar Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Calendar Events</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically create Google Calendar events when forms with date/time fields are submitted
              </p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          {settings.isEnabled && (
            <>
              <Separator />
              
              {/* Calendar Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Target Calendar</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadAvailableCalendars}
                    disabled={loadingCalendars}
                  >
                    {loadingCalendars ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <Select value={settings.calendarId} onValueChange={(value) => setSettings(prev => ({ ...prev, calendarId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Calendar</SelectItem>
                    {calendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        {calendar.summary} {calendar.primary ? '(Primary)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Field Mapping */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Field Mapping</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Date Field *</Label>
                    <Select value={settings.dateFieldName} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFieldName: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select date field" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateTimeFields.map((field) => (
                          <SelectItem key={field.id} value={field.columnName}>
                            {field.label} ({field.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Time Field (Optional)</Label>
                    <Select value={settings.timeFieldName} onValueChange={(value) => setSettings(prev => ({ ...prev, timeFieldName: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select time field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No time field</SelectItem>
                        {dateTimeFields.filter(f => f.type === 'time').map((field) => (
                          <SelectItem key={field.id} value={field.columnName}>
                            {field.label} ({field.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="15"
                      max="480"
                      value={settings.durationMinutes}
                      onChange={(e) => setSettings(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event Templates */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Event Templates</Label>
                
                <div>
                  <Label className="text-sm">Event Title Template</Label>
                  <Input
                    placeholder="e.g., Consultation with {{name}}"
                    value={settings.eventTitleTemplate}
                    onChange={(e) => setSettings(prev => ({ ...prev, eventTitleTemplate: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm">Event Description Template</Label>
                  <Textarea
                    placeholder="Meeting details and client information..."
                    value={settings.eventDescriptionTemplate}
                    onChange={(e) => setSettings(prev => ({ ...prev, eventDescriptionTemplate: e.target.value }))}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>

              <Separator />

              {/* Attendee Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Add Attendees</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add form submitter as an attendee to the calendar event
                    </p>
                  </div>
                  <Switch
                    checked={settings.addAttendees}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, addAttendees: checked }))}
                  />
                </div>

                {settings.addAttendees && (
                  <div>
                    <Label className="text-sm">Email Field for Attendee</Label>
                    <Select value={settings.attendeeEmailField} onValueChange={(value) => setSettings(prev => ({ ...prev, attendeeEmailField: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select email field" />
                      </SelectTrigger>
                      <SelectContent>
                        {textFields.filter(f => f.type === 'email' || f.columnName.toLowerCase().includes('email')).map((field) => (
                          <SelectItem key={field.id} value={field.columnName}>
                            {field.label} ({field.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Send Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send Google Calendar notifications to attendees
                    </p>
                  </div>
                  <Switch
                    checked={settings.sendNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendNotifications: checked }))}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Template Variables Reference */}
      {settings.isEnabled && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="mr-3 h-4 w-4 text-purple-600" />
              Template Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Form Variables</h4>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{"{{form_title}}"}</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Field Variables</h4>
                <div className="flex flex-wrap gap-1">
                  {availableFields.slice(0, 6).map((field) => (
                    <code key={field.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {`{{${field.columnName}}}`}
                    </code>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                <p className="text-sm text-purple-800">
                  Calendar events will only be created for submissions that include a valid date in the mapped date field.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Warnings */}
      {settings.isEnabled && (
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              {!settings.dateFieldName && (
                <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">Please select a date field to enable calendar events.</p>
                </div>
              )}
              
              {dateTimeFields.length === 0 && (
                <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">Your form needs at least one date field to create calendar events.</p>
                </div>
              )}

              {calendars.length === 0 && !loadingCalendars && (
                <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">Make sure your Google account is connected with Calendar permissions.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {settings.isEnabled && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={saveCalendarSettings}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
          
          <Button
            onClick={testCalendarEvent}
            disabled={testing || !settings.dateFieldName}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Create Test Event
          </Button>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${testResult.success 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <p className="text-sm font-medium">{testResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}


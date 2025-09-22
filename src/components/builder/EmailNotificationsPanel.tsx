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
import {
  Mail,
  Plus,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Users,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { testEmailConfiguration } from "@/lib/email";
import { CalendarEventsPanel } from "./CalendarEventsPanel";
import { DriveFileHandlingPanel } from "./DriveFileHandlingPanel";
import { FormData } from "./types";

interface EmailNotificationsPanelProps {
  formId: string;
  formTitle: string;
  formData: FormData;
}

interface EmailSettings {
  isEnabled: boolean;
  recipientEmails: string[];
  subjectTemplate: string;
  emailTemplate: string;
  includeSubmissionData: boolean;
}

export function EmailNotificationsPanel({ formId, formTitle, formData }: EmailNotificationsPanelProps) {
  const [settings, setSettings] = useState<EmailSettings>({
    isEnabled: true,
    recipientEmails: [],
    subjectTemplate: `New submission from {{form_title}}`,
    emailTemplate: `You have received a new form submission from {{form_title}}.`,
    includeSubmissionData: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    loadEmailSettings();
  }, [formId]);

  const loadEmailSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('form_email_settings')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading email settings:', error);
        return;
      }

      if (data) {
        setSettings({
          isEnabled: data.is_enabled,
          recipientEmails: data.recipient_emails || [],
          subjectTemplate: data.subject_template,
          emailTemplate: data.email_template,
          includeSubmissionData: data.include_submission_data,
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('form_email_settings')
        .upsert({
          form_id: formId,
          is_enabled: settings.isEnabled,
          recipient_emails: settings.recipientEmails,
          subject_template: settings.subjectTemplate,
          email_template: settings.emailTemplate,
          include_submission_data: settings.includeSubmissionData,
        }, {
          onConflict: 'form_id'
        });

      if (error) {
        console.error('Error saving email settings:', error);
        alert('Failed to save email settings');
        return;
      }

      // Show success feedback
      setTestResult({ success: true, message: 'Email settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailNotification = async () => {
    try {
      setTesting(true);
      
      // Save settings first
      await saveEmailSettings();
      
      // Test email
      const result = await testEmailConfiguration(formId);
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test email sent successfully! Check your inbox.' 
          : result.error || 'Failed to send test email'
      });
      
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      console.error('Error testing email:', error);
      setTestResult({
        success: false,
        message: 'Failed to send test email'
      });
    } finally {
      setTesting(false);
    }
  };

  const addEmail = () => {
    if (newEmail.trim() && !settings.recipientEmails.includes(newEmail.trim())) {
      setSettings(prev => ({
        ...prev,
        recipientEmails: [...prev.recipientEmails, newEmail.trim()]
      }));
      setNewEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter(email => email !== emailToRemove)
    }));
  };

  const templateVariables = [
    { name: 'form_title', description: 'The name of your form' },
    { name: 'name', description: 'Submitter\'s name (if field exists)' },
    { name: 'email', description: 'Submitter\'s email (if field exists)' },
    { name: 'phone', description: 'Submitter\'s phone (if field exists)' },
    { name: 'message', description: 'Any message field' },
  ];

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading email settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications Toggle */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Mail className="mr-3 h-5 w-5 text-blue-600" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Get instant email alerts when someone submits your form
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
              
              {/* Recipient Emails */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Recipient Emails</Label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.recipientEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                    className="flex-1"
                  />
                  <Button onClick={addEmail} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Subject Template */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Email Subject Template</Label>
                <Input
                  placeholder="e.g., New booking from {{name}}"
                  value={settings.subjectTemplate}
                  onChange={(e) => setSettings(prev => ({ ...prev, subjectTemplate: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Use variables like {"{{name}}"} or {"{{email}}"} to personalize the subject
                </p>
              </div>

              <Separator />

              {/* Email Template */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Email Template</Label>
                <Textarea
                  placeholder="You have received a new submission from {{form_title}}..."
                  value={settings.emailTemplate}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailTemplate: e.target.value }))}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Customize the email content. Use variables to include form data.
                </p>
              </div>

              <Separator />

              {/* Include Submission Data */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Include Submission Data</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically include all form fields in the email
                  </p>
                </div>
                <Switch
                  checked={settings.includeSubmissionData}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeSubmissionData: checked }))}
                />
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
              {templateVariables.map((variable) => (
                <div key={variable.name} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm bg-white px-2 py-1 rounded border font-mono text-blue-600">
                    {`{{${variable.name}}}`}
                  </code>
                  <p className="text-sm text-muted-foreground flex-1">{variable.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  You can use any field name from your form as a variable. For example, if you have a "company" field, use {"{{company}}"}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {settings.isEnabled && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={saveEmailSettings}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
          
          <Button
            onClick={testEmailNotification}
            disabled={testing || settings.recipientEmails.length === 0}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Test Email
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

      {/* Calendar Events Section */}
      <CalendarEventsPanel 
        formId={formId} 
        formTitle={formTitle}
        formData={formData}
      />

      {/* Drive File Handling Section */}
      <DriveFileHandlingPanel 
        formId={formId} 
        formTitle={formTitle}
        formData={formData}
      />
    </div>
  );
}

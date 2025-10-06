"use client";

import React from 'react';
import { 
  Mail, 
  Table, 
  Clock, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Settings,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormSettings } from './FormSettings';

interface ConfigurationPreviewProps {
  settings: FormSettings;
  formFields: any[];
}

export function ConfigurationPreview({ settings, formFields }: ConfigurationPreviewProps) {
  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return 'Immediate notifications';
      case 'daily': return 'Daily digest at 9 AM';
      default: return 'No notifications';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto min-w-0">
      <div className="max-w-4xl mx-auto">
        {/* Single Form Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Form Settings
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure form behavior, notifications, and integrations.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Form Basics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Form Basics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Form Name</label>
                    <div className="text-sm text-gray-900 font-medium">{settings.name || 'Untitled Form'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${settings.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-900 capitalize">{settings.status}</span>
                    </div>
                  </div>
                </div>
                {settings.description && (
                  <div className="mt-4">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <div className="text-sm text-gray-900">{settings.description}</div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Notifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${settings.emailNotifications ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-900">
                        {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  {settings.emailNotifications && (
                    <>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Recipients</label>
                        <div className="text-sm text-gray-900">
                          {settings.recipientEmails.length > 0 
                            ? settings.recipientEmails.join(', ')
                            : 'No recipients configured'
                          }
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
                        <div className="text-sm text-gray-900">
                          {getNotificationFrequencyText(settings.notificationFrequency)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Subject</label>
                        <div className="text-sm text-gray-900">
                          {settings.customSubject || `New submission from ${settings.name}`}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Google Sheets Integration */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  Google Sheets Integration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Connection Status</label>
                    <div className="flex items-center gap-2">
                      <Table className={`w-4 h-4 ${settings.sheetConnection.isConnected ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-900">
                        {settings.sheetConnection.isConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </div>
                  {settings.sheetConnection.isConnected && (
                    <>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Sheet Name</label>
                        <div className="text-sm text-gray-900">{settings.sheetConnection.sheetName || 'Untitled Sheet'}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Last Sync</label>
                        <div className="text-sm text-gray-900">{formatLastSync(settings.sheetConnection.lastSync)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Post-Submission Behavior */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Post-Submission Behavior
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Thank You Message</label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                      {settings.thankYouMessage || 'Thank you for your submission! We\'ll get back to you soon.'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.enableRedirect && settings.redirectUrl && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Redirect URL</label>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <ExternalLink className="w-4 h-4" />
                          <a 
                            href={settings.redirectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline truncate"
                          >
                            {settings.redirectUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {settings.enableAutoClose && settings.autoCloseTimer > 0 && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Auto-Close Timer</label>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Clock className="w-4 h-4" />
                          <span>{settings.autoCloseTimer} seconds</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!settings.enableRedirect && !settings.enableAutoClose && (
                    <div className="text-sm text-gray-500 italic">
                      No special post-submission behavior configured
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              {(settings.enableSubmissionLimit || settings.scheduleForm.enabled || settings.spamProtection.honeypot || settings.spamProtection.captcha) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Advanced Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.enableSubmissionLimit && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Submission Limit</label>
                        <div className="text-sm text-gray-900">{settings.submissionLimit} submissions</div>
                      </div>
                    )}
                    
                    {settings.scheduleForm.enabled && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Schedule</label>
                        <div className="text-sm text-gray-900">
                          {settings.scheduleForm.startDate ? new Date(settings.scheduleForm.startDate).toLocaleDateString() : 'No start date'} - {settings.scheduleForm.endDate ? new Date(settings.scheduleForm.endDate).toLocaleDateString() : 'No end date'}
                        </div>
                      </div>
                    )}
                    
                    {(settings.spamProtection.honeypot || settings.spamProtection.captcha) && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Spam Protection</label>
                        <div className="text-sm text-gray-900">
                          {settings.spamProtection.honeypot ? 'Honeypot' : ''}{settings.spamProtection.honeypot && settings.spamProtection.captcha ? ', ' : ''}{settings.spamProtection.captcha ? 'reCAPTCHA' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

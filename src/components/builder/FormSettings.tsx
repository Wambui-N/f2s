"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  Mail, 
  Bell, 
  Table, 
  RefreshCw, 
  Settings, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Link,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface FormSettings {
  // Form Basics
  name: string;
  description: string;
  
  // Post-Submission
  thankYouMessage: string;
  redirectUrl: string;
  autoCloseTimer: number;
  enableRedirect: boolean;
  enableAutoClose: boolean;
  
  // Notifications
  emailNotifications: boolean;
  recipientEmails: string[];
  customSubject: string;
  notificationFrequency: 'immediate' | 'daily';
  
  // Google Sheets Integration
  sheetConnection: {
    isConnected: boolean;
    sheetName?: string;
    lastSync?: string;
    syncError?: string;
  };
  
  // Advanced
  status: 'active' | 'inactive';
  submissionLimit: number;
  enableSubmissionLimit: boolean;
  scheduleForm: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
  };
  spamProtection: {
    honeypot: boolean;
    captcha: boolean;
  };
}

interface FormSettingsProps {
  settings: FormSettings;
  onSettingsChange: (settings: Partial<FormSettings>) => void;
  onReconnectSheet: () => void;
  onChangeSheet: () => void;
  onTestSync: () => void;
  onForceSync: () => void;
}

export function FormSettings({ 
  settings, 
  onSettingsChange, 
  onReconnectSheet,
  onChangeSheet,
  onTestSync,
  onForceSync
}: FormSettingsProps) {
  const [isEditingEmails, setIsEditingEmails] = useState(false);
  const [tempEmails, setTempEmails] = useState(settings.recipientEmails.join(', '));

  const handleEmailChange = (value: string) => {
    setTempEmails(value);
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    onSettingsChange({ recipientEmails: emails });
  };

  const handleEmailSave = () => {
    setIsEditingEmails(false);
  };

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

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Settings</h3>
        <p className="text-sm text-gray-600">Configure form behavior and integrations</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Form Basics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Form Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Form Name
              </label>
              <Input
                value={settings.name}
                onChange={(e) => onSettingsChange({ name: e.target.value })}
                placeholder="Enter form name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Form Description
              </label>
              <Textarea
                value={settings.description}
                onChange={(e) => onSettingsChange({ description: e.target.value })}
                placeholder="Optional description that appears above the form"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Post-Submission */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Post-Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Thank You Message
              </label>
              <Textarea
                value={settings.thankYouMessage}
                onChange={(e) => onSettingsChange({ thankYouMessage: e.target.value })}
                placeholder="Thank you for your submission! We'll get back to you soon."
                rows={4}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Redirect to Custom Page
                </label>
                <Switch
                  checked={settings.enableRedirect}
                  onCheckedChange={(checked) => onSettingsChange({ enableRedirect: checked })}
                />
              </div>
              
              {settings.enableRedirect && (
                <div className="flex items-center gap-2">
                  <Input
                    value={settings.redirectUrl}
                    onChange={(e) => onSettingsChange({ redirectUrl: e.target.value })}
                    placeholder="https://example.com/thank-you"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Auto-close Timer
                </label>
                <Switch
                  checked={settings.enableAutoClose}
                  onCheckedChange={(checked) => onSettingsChange({ enableAutoClose: checked })}
                />
              </div>
              
              {settings.enableAutoClose && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.autoCloseTimer}
                    onChange={(e) => onSettingsChange({ autoCloseTimer: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">seconds</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => onSettingsChange({ emailNotifications: checked })}
              />
            </div>
            
            {settings.emailNotifications && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Recipient Email(s)
                  </label>
                  {isEditingEmails ? (
                    <div className="space-y-2">
                      <Input
                        value={tempEmails}
                        onChange={(e) => setTempEmails(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEmailSave}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setTempEmails(settings.recipientEmails.join(', '));
                            setIsEditingEmails(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      onClick={() => setIsEditingEmails(true)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {settings.recipientEmails.length > 0 
                            ? settings.recipientEmails.join(', ')
                            : 'Click to add emails'
                          }
                        </span>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Custom Subject
                  </label>
                  <Input
                    value={settings.customSubject}
                    onChange={(e) => onSettingsChange({ customSubject: e.target.value })}
                    placeholder="New submission from [Form Name]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Notification Frequency
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.notificationFrequency === 'immediate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSettingsChange({ notificationFrequency: 'immediate' })}
                    >
                      Immediate
                    </Button>
                    <Button
                      variant={settings.notificationFrequency === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSettingsChange({ notificationFrequency: 'daily' })}
                    >
                      Daily Digest
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Google Sheets Integration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Table className="w-4 h-4" />
              Google Sheets Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.sheetConnection.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {settings.sheetConnection.isConnected 
                      ? `Connected to ${settings.sheetConnection.sheetName || 'Sheet'}`
                      : 'Not Connected'
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    Last sync: {formatLastSync(settings.sheetConnection.lastSync)}
                  </div>
                </div>
              </div>
              <Badge variant={settings.sheetConnection.isConnected ? 'default' : 'secondary'}>
                {settings.sheetConnection.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {settings.sheetConnection.syncError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{settings.sheetConnection.syncError}</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReconnectSheet}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                {settings.sheetConnection.isConnected ? 'Reconnect' : 'Connect'}
              </Button>
              {settings.sheetConnection.isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onChangeSheet}
                >
                  <Link className="w-4 h-4 mr-1" />
                  Change
                </Button>
              )}
            </div>
            
            {settings.sheetConnection.isConnected && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTestSync}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Test Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onForceSync}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Force Sync
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Form Status</div>
                <div className="text-xs text-gray-500">Control form availability</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Inactive</span>
                <Switch
                  checked={settings.status === 'active'}
                  onCheckedChange={(checked) => onSettingsChange({ 
                    status: checked ? 'active' : 'inactive' 
                  })}
                />
                <span className="text-sm text-gray-500">Active</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Submission Limit
                </label>
                <Switch
                  checked={settings.enableSubmissionLimit}
                  onCheckedChange={(checked) => onSettingsChange({ enableSubmissionLimit: checked })}
                />
              </div>
              
              {settings.enableSubmissionLimit && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.submissionLimit}
                    onChange={(e) => onSettingsChange({ submissionLimit: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">submissions</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Schedule Form
                </label>
                <Switch
                  checked={settings.scheduleForm.enabled}
                  onCheckedChange={(checked) => onSettingsChange({ 
                    scheduleForm: { ...settings.scheduleForm, enabled: checked }
                  })}
                />
              </div>
              
              {settings.scheduleForm.enabled && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Start Date</label>
                    <Input
                      type="datetime-local"
                      value={settings.scheduleForm.startDate || ''}
                      onChange={(e) => onSettingsChange({ 
                        scheduleForm: { ...settings.scheduleForm, startDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">End Date</label>
                    <Input
                      type="datetime-local"
                      value={settings.scheduleForm.endDate || ''}
                      onChange={(e) => onSettingsChange({ 
                        scheduleForm: { ...settings.scheduleForm, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Spam Protection</div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Honeypot Field</label>
                <Switch
                  checked={settings.spamProtection.honeypot}
                  onCheckedChange={(checked) => onSettingsChange({ 
                    spamProtection: { ...settings.spamProtection, honeypot: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">reCAPTCHA</label>
                <Switch
                  checked={settings.spamProtection.captcha}
                  onCheckedChange={(checked) => onSettingsChange({ 
                    spamProtection: { ...settings.spamProtection, captcha: checked }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

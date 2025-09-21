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
  FolderOpen,
  Upload,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Send,
  RefreshCw,
  Lock,
  Users,
  Eye,
  Edit,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserDriveFolders, testFileUploadConfiguration } from "@/lib/googleDrive";
import { FormData } from "./types";

interface DriveFileHandlingPanelProps {
  formId: string;
  formTitle: string;
  formData: FormData;
}

interface FileSettings {
  isEnabled: boolean;
  baseFolderId: string;
  folderStructureTemplate: string;
  fileNamingTemplate: string;
  createSubfolders: boolean;
  organizeByDate: boolean;
  dateFormat: string;
  filePermissions: 'private' | 'anyone_with_link' | 'public';
  shareWithSubmitter: boolean;
  submitterPermission: 'reader' | 'writer' | 'commenter';
  maxFileSizeMb: number;
  allowedFileTypes: string[];
}

export function DriveFileHandlingPanel({ formId, formTitle, formData }: DriveFileHandlingPanelProps) {
  const [settings, setSettings] = useState<FileSettings>({
    isEnabled: false,
    baseFolderId: '',
    folderStructureTemplate: '/{{form_title}}/{{name}}',
    fileNamingTemplate: '{{name}}_{{original_filename}}',
    createSubfolders: true,
    organizeByDate: false,
    dateFormat: 'YYYY-MM-DD',
    filePermissions: 'private',
    shareWithSubmitter: false,
    submitterPermission: 'reader',
    maxFileSizeMb: 10,
    allowedFileTypes: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [driveFolders, setDriveFolders] = useState<any[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    loadFileSettings();
    loadDriveFolders();
  }, [formId]);

  const loadFileSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('form_file_settings')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading file settings:', error);
        return;
      }

      if (data) {
        setSettings({
          isEnabled: data.is_enabled,
          baseFolderId: data.base_folder_id || '',
          folderStructureTemplate: data.folder_structure_template,
          fileNamingTemplate: data.file_naming_template,
          createSubfolders: data.create_subfolders,
          organizeByDate: data.organize_by_date,
          dateFormat: data.date_format,
          filePermissions: data.file_permissions,
          shareWithSubmitter: data.share_with_submitter,
          submitterPermission: data.submitter_permission,
          maxFileSizeMb: data.max_file_size_mb,
          allowedFileTypes: data.allowed_file_types || [],
        });
      }
    } catch (error) {
      console.error('Error loading file settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDriveFolders = async () => {
    try {
      setLoadingFolders(true);
      const result = await getUserDriveFolders();
      
      if (result.success && result.folders) {
        setDriveFolders(result.folders);
      } else {
        console.error('Failed to load Drive folders:', result.error);
      }
    } catch (error) {
      console.error('Error loading Drive folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const saveFileSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('form_file_settings')
        .upsert({
          form_id: formId,
          is_enabled: settings.isEnabled,
          base_folder_id: settings.baseFolderId,
          folder_structure_template: settings.folderStructureTemplate,
          file_naming_template: settings.fileNamingTemplate,
          create_subfolders: settings.createSubfolders,
          organize_by_date: settings.organizeByDate,
          date_format: settings.dateFormat,
          file_permissions: settings.filePermissions,
          share_with_submitter: settings.shareWithSubmitter,
          submitter_permission: settings.submitterPermission,
          max_file_size_mb: settings.maxFileSizeMb,
          allowed_file_types: settings.allowedFileTypes,
        }, {
          onConflict: 'form_id'
        });

      if (error) {
        console.error('Error saving file settings:', error);
        alert('Failed to save file settings');
        return;
      }

      setTestResult({ success: true, message: 'File handling settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Error saving file settings:', error);
      alert('Failed to save file settings');
    } finally {
      setSaving(false);
    }
  };

  const testFileUpload = async () => {
    try {
      setTesting(true);
      
      // Save settings first
      await saveFileSettings();
      
      // Test file upload
      const result = await testFileUploadConfiguration(formId);
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test file uploaded successfully! Check your Google Drive.' 
          : result.error || 'Failed to upload test file'
      });
      
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      console.error('Error testing file upload:', error);
      setTestResult({
        success: false,
        message: 'Failed to test file upload'
      });
    } finally {
      setTesting(false);
    }
  };

  // Get file upload fields from form
  const fileFields = formData.fields?.filter(field => field.type === 'file') || [];
  const textFields = formData.fields?.filter(field => 
    field.type === 'text' || field.type === 'email' || field.type === 'textarea'
  ) || [];

  const permissionOptions = [
    { value: 'private', label: 'Private', description: 'Only you can access' },
    { value: 'anyone_with_link', label: 'Anyone with link', description: 'Anyone with the link can view' },
  ];

  const dateFormats = [
    { value: 'YYYY-MM-DD', label: '2024-03-15' },
    { value: 'YYYY/MM', label: '2024/03' },
    { value: 'YYYY', label: '2024' },
  ];

  const commonFileTypes = [
    { value: 'image/*', label: 'Images (JPG, PNG, etc.)' },
    { value: 'application/pdf', label: 'PDF Documents' },
    { value: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Documents' },
    { value: 'text/*', label: 'Text Files' },
  ];

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading file handling settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Handling Toggle */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FolderOpen className="mr-3 h-5 w-5 text-orange-600" />
            Google Drive File Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable File Uploads to Google Drive</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically organize uploaded files in Google Drive with custom folder structures
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
              
              {/* Base Folder Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Base Folder</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadDriveFolders}
                    disabled={loadingFolders}
                  >
                    {loadingFolders ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <Select value={settings.baseFolderId} onValueChange={(value) => setSettings(prev => ({ ...prev, baseFolderId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base folder (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">My Drive (Root)</SelectItem>
                    {driveFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        📁 {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose a base folder where all form files will be organized
                </p>
              </div>

              <Separator />

              {/* Folder Structure */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Folder Organization</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Create Subfolders</Label>
                    <p className="text-xs text-muted-foreground">Organize files into dynamic subfolders</p>
                  </div>
                  <Switch
                    checked={settings.createSubfolders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, createSubfolders: checked }))}
                  />
                </div>

                {settings.createSubfolders && (
                  <div>
                    <Label className="text-sm">Folder Structure Template</Label>
                    <Input
                      placeholder="e.g., /{{form_title}}/{{name}}/{{company}}"
                      value={settings.folderStructureTemplate}
                      onChange={(e) => setSettings(prev => ({ ...prev, folderStructureTemplate: e.target.value }))}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use variables to create dynamic folder paths
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Organize by Date</Label>
                    <p className="text-xs text-muted-foreground">Add date-based folder prefix</p>
                  </div>
                  <Switch
                    checked={settings.organizeByDate}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, organizeByDate: checked }))}
                  />
                </div>

                {settings.organizeByDate && (
                  <div>
                    <Label className="text-sm">Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* File Naming */}
              <div className="space-y-3">
                <Label className="text-base font-medium">File Naming</Label>
                
                <div>
                  <Label className="text-sm">File Name Template</Label>
                  <Input
                    placeholder="e.g., {{name}}_{{original_filename}}"
                    value={settings.fileNamingTemplate}
                    onChange={(e) => setSettings(prev => ({ ...prev, fileNamingTemplate: e.target.value }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize how uploaded files are named in Google Drive
                  </p>
                </div>
              </div>

              <Separator />

              {/* File Permissions */}
              <div className="space-y-4">
                <Label className="text-base font-medium">File Permissions</Label>
                
                <div>
                  <Label className="text-sm">Default File Permissions</Label>
                  <Select value={settings.filePermissions} onValueChange={(value: any) => setSettings(prev => ({ ...prev, filePermissions: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {permissionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            {option.value === 'private' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            <div>
                              <div>{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Share with Form Submitter</Label>
                    <p className="text-xs text-muted-foreground">Give submitter access to their uploaded files</p>
                  </div>
                  <Switch
                    checked={settings.shareWithSubmitter}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareWithSubmitter: checked }))}
                  />
                </div>

                {settings.shareWithSubmitter && (
                  <div>
                    <Label className="text-sm">Submitter Permission Level</Label>
                    <Select value={settings.submitterPermission} onValueChange={(value: any) => setSettings(prev => ({ ...prev, submitterPermission: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="commenter">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Can comment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="writer">
                          <div className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Can edit</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* File Restrictions */}
              <div className="space-y-4">
                <Label className="text-base font-medium">File Restrictions</Label>
                
                <div>
                  <Label className="text-sm">Maximum File Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxFileSizeMb}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileSizeMb: parseInt(e.target.value) || 10 }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm">Allowed File Types</Label>
                  <Select value="" onValueChange={(value) => {
                    if (value && !settings.allowedFileTypes.includes(value)) {
                      setSettings(prev => ({
                        ...prev,
                        allowedFileTypes: [...prev.allowedFileTypes, value]
                      }));
                    }
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Add file type restriction" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonFileTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {settings.allowedFileTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {settings.allowedFileTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                          {commonFileTypes.find(t => t.value === type)?.label || type}
                          <button
                            onClick={() => setSettings(prev => ({
                              ...prev,
                              allowedFileTypes: prev.allowedFileTypes.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty to allow all file types
                  </p>
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
              <Sparkles className="mr-3 h-4 w-4 text-orange-600" />
              Template Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">File Variables</h4>
                <div className="space-y-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{{original_filename}}</code>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{{original_basename}}</code>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{{file_extension}}</code>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{{timestamp}}</code>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Form Variables</h4>
                <div className="space-y-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block">{{form_title}}</code>
                  {textFields.slice(0, 4).map((field) => (
                    <code key={field.id} className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      {`{{${field.name}}}`}
                    </code>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Example Folder Structure</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Template: <code>/Clients/{{name}}/{{company}}</code><br/>
                      Result: <code>/Clients/John_Smith/Acme_Corp</code>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Example File Naming</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Template: <code>{{name}}_{{timestamp}}_{{original_filename}}</code><br/>
                      Result: <code>John_Smith_2024-03-15_14-30-25_contract.pdf</code>
                    </p>
                  </div>
                </div>
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
              {fileFields.length === 0 && (
                <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">Your form needs at least one file upload field to enable file handling.</p>
                </div>
              )}

              {driveFolders.length === 0 && !loadingFolders && (
                <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">Make sure your Google account is connected with Drive permissions.</p>
                </div>
              )}

              {fileFields.length > 0 && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm">
                    Found {fileFields.length} file upload field{fileFields.length > 1 ? 's' : ''}: {fileFields.map(f => f.label || f.name).join(', ')}
                  </p>
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
            onClick={saveFileSettings}
            disabled={saving}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
          
          <Button
            onClick={testFileUpload}
            disabled={testing}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Test File Upload
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




"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormField } from './FormCanvas';

interface FieldSettingsProps {
  field: FormField | null;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onClose: () => void;
}

export function FieldSettings({ field, onFieldUpdate, onClose }: FieldSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!field) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Field Settings</h3>
          <p className="text-gray-600">Select a field to configure its settings</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormField>) => {
    onFieldUpdate(field.id, updates);
  };

  const handleOptionAdd = () => {
    const newOptions = [...(field.options || []), 'New Option'];
    handleUpdate({ options: newOptions });
  };

  const handleOptionUpdate = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    handleUpdate({ options: newOptions });
  };

  const handleOptionRemove = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    handleUpdate({ options: newOptions });
  };

  const handleOptionReorder = (fromIndex: number, toIndex: number) => {
    const newOptions = [...(field.options || [])];
    const [movedItem] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedItem);
    handleUpdate({ options: newOptions });
  };

  const renderFieldSpecificSettings = () => {
    switch (field.type) {
      case 'select':
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Options
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionUpdate(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOptionRemove(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptionAdd}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Allowed File Types
              </label>
              <Input
                placeholder="e.g., .pdf, .doc, .jpg"
                value={field.validation || ''}
                onChange={(e) => handleUpdate({ validation: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max File Size (MB)
              </label>
              <Input
                type="number"
                placeholder="10"
                value={field.validation || ''}
                onChange={(e) => handleUpdate({ validation: e.target.value })}
              />
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Consent Text
              </label>
              <Input
                value={field.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder="I agree to the terms and conditions"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Link URL (optional)
              </label>
              <Input
                placeholder="https://example.com/terms"
                value={field.validation || ''}
                onChange={(e) => handleUpdate({ validation: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{field.type}</Badge>
          <span className="text-sm text-gray-600">Field #{field.order}</span>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Label
                </label>
                <Input
                  value={field.label}
                  onChange={(e) => handleUpdate({ label: e.target.value })}
                  placeholder="Field label"
                />
              </div>

              {field.type !== 'consent' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Placeholder
                  </label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                    placeholder="Placeholder text"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Required
                </label>
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => handleUpdate({ required: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Field-Specific Settings */}
          {renderFieldSpecificSettings() && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Field Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {renderFieldSpecificSettings()}
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          <Card>
            <CardHeader className="pb-3">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between p-0 h-auto"
              >
                <CardTitle className="text-sm font-medium">Advanced Settings</CardTitle>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Field Name (Internal)
                  </label>
                  <Input
                    value={field.id}
                    disabled
                    className="bg-gray-50"
                    placeholder="Auto-generated"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for database storage and Google Sheets
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Validation
                  </label>
                  <select
                    value={field.validation || ''}
                    onChange={(e) => handleUpdate({ validation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5e2a]"
                  >
                    <option value="">None</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="number">Number</option>
                    <option value="url">URL</option>
                    <option value="custom">Custom Regex</option>
                  </select>
                </div>

                {field.validation === 'custom' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Custom Regex Pattern
                    </label>
                    <Input
                      placeholder="^[a-zA-Z0-9]+$"
                      value={field.validation || ''}
                      onChange={(e) => handleUpdate({ validation: e.target.value })}
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>Coming Soon:</strong> Conditional logic, field dependencies, and custom validation messages.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

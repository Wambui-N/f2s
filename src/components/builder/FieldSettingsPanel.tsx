"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField } from './types';
import { 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Plus,
  GripVertical,
  X
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';

interface FieldSettingsPanelProps {
  field: FormField | null;
  onClose: () => void;
}

export function FieldSettingsPanel({ 
  field, 
  onClose 
}: FieldSettingsPanelProps) {
  const { updateField, deleteField, duplicateField, moveField, formData } = useFormStore();
  const [editedField, setEditedField] = useState<FormField | null>(field);

  React.useEffect(() => {
    setEditedField(field);
  }, [field]);

  if (!editedField) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle>Field Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Select a field to configure its settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    if (editedField) {
      updateField(editedField);
    }
  };
  
  const moveFieldUp = (fieldId: string) => {
    const index = formData.fields.findIndex((f: FormField) => f.id === fieldId);
    if (index > 0) moveField(index, index - 1);
  };
  
  const moveFieldDown = (fieldId: string) => {
    const index = formData.fields.findIndex((f: FormField) => f.id === fieldId);
    if (index < formData.fields.length - 1) moveField(index, index + 1);
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), 'New Option'];
    setEditedField({ ...editedField, options: newOptions });
  };
  
  const pasteFromCSV = () => {
    const csvText = prompt('Paste comma-separated values (e.g., Option 1, Option 2, Option 3):');
    if (csvText) {
      const options = csvText.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
      setEditedField({ ...editedField, options });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    setEditedField({ ...editedField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(editedField.options || [])];
    newOptions.splice(index, 1);
    setEditedField({ ...editedField, options: newOptions });
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(editedField.type);

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Field Settings</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveFieldUp(editedField.id)}
              className="flex-1"
            >
              <ChevronUp size={14} className="mr-1" />
              Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveFieldDown(editedField.id)}
              className="flex-1"
            >
              <ChevronDown size={14} className="mr-1" />
              Down
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateField(editedField)}
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteField(editedField.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Basic Settings</Label>
          
          <div className="space-y-2">
            <Label htmlFor="label" className="text-xs">Field Label</Label>
            <Input
              id="label"
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              placeholder="Enter field label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder" className="text-xs">Placeholder Text</Label>
            <Input
              id="placeholder"
              value={editedField.placeholder || ''}
              onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpText" className="text-xs">Help Text</Label>
            <Textarea
              id="helpText"
              value={editedField.helpText || ''}
              onChange={(e) => setEditedField({ ...editedField, helpText: e.target.value })}
              placeholder="Additional help text for users"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="columnName" className="text-xs">Google Sheets Column</Label>
            <Input
              id="columnName"
              value={editedField.columnName}
              onChange={(e) => setEditedField({ ...editedField, columnName: e.target.value })}
              placeholder="Column name in Google Sheets"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultValue" className="text-xs">Default Value</Label>
            <Input
              id="defaultValue"
              value={editedField.defaultValue || ''}
              onChange={(e) => setEditedField({ ...editedField, defaultValue: e.target.value })}
              placeholder="Default value (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cssClass" className="text-xs">CSS Class Hook</Label>
            <Input
              id="cssClass"
              value={editedField.cssClass || ''}
              onChange={(e) => setEditedField({ ...editedField, cssClass: e.target.value })}
              placeholder="Custom CSS class"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Required Field</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedField.required || false}
                onCheckedChange={(checked) => setEditedField({ ...editedField, required: checked })}
              />
              <Label className="text-sm">
                {editedField.required ? 'Required' : 'Optional'}
              </Label>
            </div>
          </div>
        </div>

        {needsOptions && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Field Options</Label>
            <div className="space-y-2">
              {(editedField.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <button className="cursor-grab p-1 text-muted-foreground hover:bg-muted rounded">
                    <GripVertical size={12} />
                  </button>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder="Option text"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex-1"
                >
                  <Plus size={14} className="mr-2" />
                  Add Option
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pasteFromCSV}
                  className="flex-1"
                >
                  Paste CSV
                </Button>
              </div>
            </div>
          </div>
        )}

        {editedField.type === 'number' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Validation Rules</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min" className="text-xs">Min Value</Label>
                <Input
                  id="min"
                  type="number"
                  value={editedField.validation?.min || ''}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      min: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  placeholder="Min"
                />
              </div>
              <div>
                <Label htmlFor="max" className="text-xs">Max Value</Label>
                <Input
                  id="max"
                  type="number"
                  value={editedField.validation?.max || ''}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}

        {editedField.type === 'file' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">File Upload Settings</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="fileTypes" className="text-xs">Allowed File Types</Label>
                <Input
                  id="fileTypes"
                  value={editedField.validation?.pattern || 'jpg,jpg,png,pdf,docx,xlsx,txt'}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      pattern: e.target.value
                    }
                  })}
                  placeholder="jpg,png,pdf,docx,xlsx,txt"
                />
              </div>
              <div>
                <Label htmlFor="maxSize" className="text-xs">Max File Size (MB)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  value={editedField.validation?.max || 10}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Visibility</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editedField.visibility !== 'hide'}
              onCheckedChange={(checked) => setEditedField({
                ...editedField,
                visibility: checked ? 'show' : 'hide'
              })}
            />
            <Label className="text-sm">
              {editedField.visibility !== 'hide' ? 'Visible' : 'Hidden'}
            </Label>
            {editedField.visibility !== 'hide' ? <Eye size={14} /> : <EyeOff size={14} />}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

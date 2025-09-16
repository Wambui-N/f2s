"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FieldTypes } from './types';
import { X, Plus, Trash2 } from 'lucide-react';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function FieldEditor({ field, onUpdate, onDelete, onClose }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField>(field);

  const handleSave = () => {
    onUpdate(editedField);
    onClose();
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), 'New Option'];
    setEditedField({ ...editedField, options: newOptions });
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
    <Card className="w-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Edit Field</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field Label */}
        <div className="space-y-2">
          <Label htmlFor="label">Field Label</Label>
          <Input
            id="label"
            value={editedField.label}
            onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder Text</Label>
          <Input
            id="placeholder"
            value={editedField.placeholder || ''}
            onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        {/* Column Name */}
        <div className="space-y-2">
          <Label htmlFor="columnName">Google Sheets Column</Label>
          <Input
            id="columnName"
            value={editedField.columnName}
            onChange={(e) => setEditedField({ ...editedField, columnName: e.target.value })}
            placeholder="Column name in Google Sheets"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-2">
          <Label htmlFor="defaultValue">Default Value</Label>
          <Input
            id="defaultValue"
            value={typeof editedField.defaultValue === 'string' ? editedField.defaultValue : String(editedField.defaultValue || '')}
            onChange={(e) => setEditedField({ ...editedField, defaultValue: e.target.value })}
            placeholder="Default value (optional)"
          />
        </div>

        {/* Options for select/radio/checkbox */}
        {needsOptions && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {(editedField.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder="Option text"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus size={14} className="mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        {editedField.type === 'number' && (
          <div className="space-y-2">
            <Label>Validation Rules</Label>
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

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

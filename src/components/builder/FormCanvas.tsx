"use client";

import React, { useState } from 'react';
import { GripVertical, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FieldType } from './FieldLibrary';

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
  order: number;
  isSelected?: boolean;
}

interface FormCanvasProps {
  fields: FormField[];
  onFieldSelect: (field: FormField) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldReorder: (fieldId: string, newOrder: number) => void;
  onAddSection: () => void;
  onAddDivider: () => void;
}

export function FormCanvas({ 
  fields, 
  onFieldSelect, 
  onFieldDelete, 
  onFieldReorder,
  onAddSection,
  onAddDivider 
}: FormCanvasProps) {
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    setDragOverField(fieldId);
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    
    if (draggedField && draggedField !== targetFieldId) {
      const targetField = fields.find(f => f.id === targetFieldId);
      if (targetField) {
        onFieldReorder(draggedField, targetField.order);
      }
    }
    
    setDraggedField(null);
    setDragOverField(null);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
  };

  const renderFieldPreview = (field: FormField) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5e2a] focus:border-transparent";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseClasses}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={3}
            className={baseClasses}
            disabled
          />
        );
      
      case 'select':
        return (
          <select className={baseClasses} disabled>
            <option>{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  className="text-[#2c5e2a] focus:ring-[#2c5e2a]"
                  disabled
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#2c5e2a] focus:ring-[#2c5e2a]"
                  disabled
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );
      
      case 'consent':
        return (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-[#2c5e2a] focus:ring-[#2c5e2a]"
              disabled
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </div>
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="text-sm text-gray-500">
              Click to upload or drag and drop
            </div>
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            className={baseClasses}
            disabled
          />
        );
      
      case 'section':
        return (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
          </div>
        );
      
      case 'divider':
        return (
          <div className="border-t border-gray-300 my-4"></div>
        );
      
      default:
        return (
          <div className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
            {field.type} field
          </div>
        );
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto min-w-0">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Form</h2>
          <p className="text-gray-600">Preview of your form as users will see it</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {sortedFields.length > 0 ? (
            sortedFields.map((field, index) => (
              <Card
                key={field.id}
                className={`transition-all duration-200 ${
                  field.isSelected ? 'ring-2 ring-[#2c5e2a] border-[#2c5e2a]' : 'hover:shadow-md'
                } ${
                  dragOverField === field.id ? 'border-[#2c5e2a] bg-blue-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDragOver={(e) => handleDragOver(e, field.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, field.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onFieldSelect(field)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="flex flex-col gap-1 mt-1">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="text-xs text-gray-400 font-mono">
                        {index + 1}
                      </span>
                    </div>

                    {/* Field Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      
                      {renderFieldPreview(field)}
                    </div>

                    {/* Field Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldSelect(field);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDelete(field.id);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields yet</h3>
                <p className="text-gray-600 mb-4">
                  Drag fields from the left to get started, or use the quick add buttons below.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={onAddSection}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onAddDivider}
                    className="flex items-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Add Divider
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Footer */}
        {sortedFields.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <button
              className="w-full py-2 px-4 bg-[#2c5e2a] text-white font-medium rounded-md hover:bg-[#234b21] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5e2a]"
              disabled
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

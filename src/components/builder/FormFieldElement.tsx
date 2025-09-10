"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from './types';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

interface FormFieldElementProps {
  field: FormField;
  index: number;
  onEdit?: (field: FormField) => void;
  onDelete?: (fieldId: string) => void;
  isSelected?: boolean;
}

export function FormFieldElement({ field, index, onEdit, onDelete, isSelected }: FormFieldElementProps) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ index }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render: ({ container }) => {
            container.style.opacity = '0.8';
            return () => {};
          }
        });
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [index]);

  const renderField = () => {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
        case 'date':
            return <input type={field.type} placeholder={field.placeholder} className="w-full px-3 py-2 border rounded-md" />;
        case 'textarea':
            return <textarea placeholder={field.placeholder} className="w-full px-3 py-2 border rounded-md" />;
        case 'select':
            return (
                <select className="w-full px-3 py-2 border rounded-md">
                    {field.options?.map((option, index) => <option key={index}>{option}</option>)}
                </select>
            );
        case 'checkbox':
             return (
                <div className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>{field.label}</span>
                </div>
            );
        case 'radio':
            return (
                <div className="flex space-x-4">
                    {field.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input type="radio" name={field.id} />
                            <span>{option}</span>
                        </div>
                    ))}
                </div>
            );
        case 'file':
            return (
                <div className="space-y-2">
                    <input type="file" className="w-full" />
                    <div className="text-xs text-muted-foreground">
                        Allowed: JPG, PNG, PDF, DOCX, XLSX, TXT (max 10MB)
                    </div>
                </div>
            );
        case 'hidden':
            return <p className="text-sm text-muted-foreground italic">Hidden Field: {field.label}</p>;
        default:
            return null;
    }
  }

  return (
    <div 
      ref={ref} 
      className={`${isDragging ? 'opacity-50 scale-105' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} group`}
      onClick={() => onEdit?.(field)}
    >
        <Card className={`p-4 bg-background hover:shadow-md transition-all duration-200 cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:border-gray-300'} group-hover:shadow-lg`}>
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                    <button className="cursor-grab p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors group-hover:text-gray-600">
                        <GripVertical size={16} />
                    </button>
                    {field.required && (
                      <span className="text-xs text-red-500 mt-1">*</span>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                        <label className="font-semibold text-sm text-gray-700">{field.label}</label>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(field);
                                }}
                                className="h-6 w-6 p-0"
                            >
                                <Edit2 size={12} />
                            </Button>
                        </div>
                    </div>
                    {renderField()}
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                </div>
            </div>
        </Card>
    </div>
  );
}

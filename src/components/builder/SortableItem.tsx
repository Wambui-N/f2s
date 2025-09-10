"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from './types';
import { GripVertical } from 'lucide-react';

export function SortableItem({ id, field }: { id: string; field: FormField }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderField = () => {
    switch (field.type) {
        case 'text':
        case 'email':
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
            return <input type="file" className="w-full" />;
        case 'hidden':
            return <p className="text-sm text-muted-foreground italic">Hidden Field: {field.label}</p>;
        default:
            return null;
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} >
        <Card className="p-4 bg-background hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <button {...listeners} className="cursor-grab p-2 text-muted-foreground hover:bg-muted rounded-md">
                    <GripVertical size={16} />
                </button>
                <div className="flex-grow">
                    <label className="font-semibold">{field.label} {field.required && <span className="text-destructive">*</span>}</label>
                    {renderField()}
                </div>
            </div>
        </Card>
    </div>
  );
}

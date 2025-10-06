"use client";

import React, { useState } from 'react';
import { Search, User, Mail, Phone, MessageSquare, Upload, Calendar, CheckSquare, Type, ChevronDown, Circle, Square, Hash, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface FieldType {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'advanced' | 'future';
  isComingSoon?: boolean;
  defaultConfig: {
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    validation?: string;
  };
}

const fieldTypes: FieldType[] = [
  {
    id: 'name-email-block',
    type: 'name-email-block',
    label: 'Name + Email Block',
    description: 'Pre-grouped name and email fields',
    icon: User,
    category: 'basic',
    defaultConfig: {
      label: 'Contact Information',
      required: true,
    }
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone Number',
    description: 'Phone number input with validation',
    icon: Phone,
    category: 'basic',
    defaultConfig: {
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      required: false,
      validation: 'phone'
    }
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'Message Box',
    description: 'Multi-line text input for longer messages',
    icon: MessageSquare,
    category: 'basic',
    defaultConfig: {
      label: 'Message',
      placeholder: 'Enter your message',
      required: false
    }
  },
  {
    id: 'file-upload',
    type: 'file',
    label: 'File Upload',
    description: 'Allow users to upload files',
    icon: Upload,
    category: 'basic',
    defaultConfig: {
      label: 'Upload File',
      required: false
    }
  },
  {
    id: 'calendar-scheduler',
    type: 'calendar',
    label: 'Calendar Scheduler',
    description: 'Let users book appointments',
    icon: Calendar,
    category: 'future',
    isComingSoon: true,
    defaultConfig: {
      label: 'Select Date & Time',
      required: false
    }
  },
  {
    id: 'consent-checkbox',
    type: 'consent',
    label: 'Consent Checkbox',
    description: 'GDPR-compliant consent checkbox',
    icon: CheckSquare,
    category: 'basic',
    defaultConfig: {
      label: 'I agree to the terms and conditions',
      required: true
    }
  },
  {
    id: 'text',
    type: 'text',
    label: 'Single Line Text',
    description: 'Basic text input field',
    icon: Type,
    category: 'basic',
    defaultConfig: {
      label: 'Text Input',
      placeholder: 'Enter text',
      required: false
    }
  },
  {
    id: 'dropdown',
    type: 'select',
    label: 'Dropdown',
    description: 'Single selection from a list',
    icon: ChevronDown,
    category: 'basic',
    defaultConfig: {
      label: 'Select Option',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    id: 'multiple-choice',
    type: 'radio',
    label: 'Multiple Choice',
    description: 'Single selection from radio buttons',
    icon: Circle,
    category: 'basic',
    defaultConfig: {
      label: 'Choose One',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    id: 'checkboxes',
    type: 'checkbox',
    label: 'Checkboxes',
    description: 'Multiple selection checkboxes',
    icon: Square,
    category: 'basic',
    defaultConfig: {
      label: 'Select All That Apply',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    id: 'number',
    type: 'number',
    label: 'Number',
    description: 'Numeric input field',
    icon: Hash,
    category: 'basic',
    defaultConfig: {
      label: 'Number',
      placeholder: 'Enter a number',
      required: false,
      validation: 'number'
    }
  },
  {
    id: 'date',
    type: 'date',
    label: 'Date',
    description: 'Date picker input',
    icon: CalendarIcon,
    category: 'basic',
    defaultConfig: {
      label: 'Date',
      required: false
    }
  }
];

interface FieldLibraryProps {
  onAddField: (fieldType: FieldType) => void;
  isMobile?: boolean;
}

export function FieldLibrary({ onAddField, isMobile = false }: FieldLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'future'>('all');

  const filteredFields = fieldTypes.filter(field => {
    const matchesSearch = field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Fields', count: fieldTypes.length },
    { id: 'basic', label: 'Basic', count: fieldTypes.filter(f => f.category === 'basic').length },
    { id: 'advanced', label: 'Advanced', count: fieldTypes.filter(f => f.category === 'advanced').length },
    { id: 'future', label: 'Coming Soon', count: fieldTypes.filter(f => f.category === 'future').length },
  ];

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Fields</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id as any)}
              className="text-xs h-7"
            >
              {category.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredFields.map((field) => {
            const Icon = field.icon;
            return (
              <Card
                key={field.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  field.isComingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#2c5e2a]'
                }`}
                onClick={() => !field.isComingSoon && onAddField(field)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      field.isComingSoon ? 'bg-gray-100' : 'bg-[#2c5e2a]'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        field.isComingSoon ? 'text-gray-400' : 'text-white'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {field.label}
                        </h4>
                        {field.isComingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredFields.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No fields found</p>
            <p className="text-xs text-gray-400">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

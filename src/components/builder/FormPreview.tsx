"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData, FormField } from './types';
import { Smartphone, Monitor, RefreshCw, Play } from 'lucide-react';

interface FormPreviewProps {
  formData: FormData;
  onSampleData?: () => void;
}

export function FormPreview({ formData, onSampleData }: FormPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sampleData, setSampleData] = useState<Record<string, any>>({});

  const generateSampleData = () => {
    const sample: Record<string, any> = {};
    
    formData.fields.forEach(field => {
      switch (field.type) {
        case 'text':
          sample[field.id] = field.label.includes('Name') ? 'John Smith' : 
                           field.label.includes('Company') ? 'ABC Company' : 
                           'Sample Text';
          break;
        case 'email':
          sample[field.id] = 'john@example.com';
          break;
        case 'textarea':
          sample[field.id] = 'This is a sample message describing the project requirements and goals...';
          break;
        case 'number':
          sample[field.id] = field.label.includes('Budget') ? '2500' : '42';
          break;
        case 'date':
          sample[field.id] = '2024-12-15';
          break;
        case 'select':
          sample[field.id] = field.options?.[0] || 'Option 1';
          break;
        case 'radio':
          sample[field.id] = field.options?.[0] || 'Option 1';
          break;
        case 'checkbox':
          sample[field.id] = field.options?.slice(0, 2) || ['Option 1', 'Option 2'];
          break;
        case 'file':
          sample[field.id] = 'sample-document.pdf';
          break;
        case 'hidden':
          sample[field.id] = 'hidden-value';
          break;
        default:
          sample[field.id] = '';
      }
    });
    
    setSampleData(sample);
    onSampleData?.();
  };

  const renderField = (field: FormField) => {
    const value = sampleData[field.id] || field.defaultValue || '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            value={value}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
        );
      case 'select':
        return (
          <select
            value={value}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          >
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  className="text-blue-600"
                  disabled
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  className="text-blue-600"
                  disabled
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="text-sm text-gray-500">
              📄 {value || 'No file selected'}
            </div>
          </div>
        );
      case 'hidden':
        return (
          <div className="text-xs text-gray-400 italic">
            Hidden field: {value}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor size={16} />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSampleData}
              className="ml-2"
            >
              <Play size={16} className="mr-1" />
              Fill Sample Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className={`mx-auto ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-lg'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-center">{formData.title}</h3>
            
            <form className="space-y-6">
              {formData.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-xs text-gray-500">{field.helpText}</p>
                  )}
                </div>
              ))}
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled
              >
                {formData.settings.submitText}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DesignSettings } from './DesignSettings';
import { FormField } from './FormCanvas';

interface DesignPreviewProps {
  settings: DesignSettings;
  fields: FormField[];
  onTestSubmission: () => void;
}

export function DesignPreview({ settings, fields, onTestSubmission }: DesignPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTestSubmission();
    alert('Test submission successful! (This is just a preview)');
  };

  const renderField = (field: FormField) => {
    const baseClasses = `w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${settings.primaryColor}] focus:border-transparent`;
    const fieldWidth = settings.fieldWidth === 'compact' ? 'max-w-md' : 'w-full';
    
    const labelClasses = settings.labelPosition === 'floating' 
      ? 'absolute left-3 top-3 text-gray-500 transition-all duration-200 pointer-events-none'
      : 'block text-sm font-medium text-gray-700 mb-2';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className={`relative ${fieldWidth}`}>
            {settings.labelPosition === 'floating' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type={field.type}
              placeholder={settings.labelPosition === 'floating' ? ' ' : field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={isTestMode ? (formData[field.id] || '') : ''}
              onChange={(e) => isTestMode && handleInputChange(field.id, e.target.value)}
              className={`${baseClasses} ${settings.labelPosition === 'floating' ? 'pt-6 pb-2' : ''}`}
              style={{ 
                borderRadius: `${settings.borderRadius}px`,
                fontFamily: settings.fontFamily
              }}
              disabled={!isTestMode}
            />
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className={`relative ${fieldWidth}`}>
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <textarea
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={isTestMode ? (formData[field.id] || '') : ''}
              onChange={(e) => isTestMode && handleInputChange(field.id, e.target.value)}
              rows={3}
              className={`${baseClasses} ${settings.labelPosition === 'floating' ? 'pt-6 pb-2' : ''}`}
              style={{ 
                borderRadius: `${settings.borderRadius}px`,
                fontFamily: settings.fontFamily
              }}
              disabled={!isTestMode}
            />
            {settings.labelPosition === 'floating' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'select':
        return (
          <div className={fieldWidth}>
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <select
              value={isTestMode ? (formData[field.id] || '') : ''}
              onChange={(e) => isTestMode && handleInputChange(field.id, e.target.value)}
              className={baseClasses}
              style={{ 
                borderRadius: `${settings.borderRadius}px`,
                fontFamily: settings.fontFamily
              }}
              disabled={!isTestMode}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div className={fieldWidth}>
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={isTestMode ? (formData[field.id] === option) : false}
                    onChange={(e) => isTestMode && handleInputChange(field.id, e.target.value)}
                    className="text-[#2c5e2a] focus:ring-[#2c5e2a]"
                    disabled={!isTestMode}
                  />
                  <span className="text-sm text-gray-700" style={{ fontFamily: settings.fontFamily }}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className={fieldWidth}>
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option}
                    checked={isTestMode ? (formData[field.id]?.includes(option) || false) : false}
                    onChange={(e) => {
                      if (isTestMode) {
                        const currentValues = formData[field.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((v: string) => v !== option);
                        handleInputChange(field.id, newValues);
                      }
                    }}
                    className="rounded border-gray-300 text-[#2c5e2a] focus:ring-[#2c5e2a]"
                    disabled={!isTestMode}
                  />
                  <span className="text-sm text-gray-700" style={{ fontFamily: settings.fontFamily }}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className={`flex items-start space-x-2 ${fieldWidth}`}>
            <input
              type="checkbox"
              checked={isTestMode ? (formData[field.id] || false) : false}
              onChange={(e) => isTestMode && handleInputChange(field.id, e.target.checked)}
              className="mt-1 rounded border-gray-300 text-[#2c5e2a] focus:ring-[#2c5e2a]"
              disabled={!isTestMode}
            />
            <span className="text-sm text-gray-700" style={{ fontFamily: settings.fontFamily }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        );

      case 'file':
        return (
          <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${fieldWidth}`}>
            <div className="text-sm text-gray-500" style={{ fontFamily: settings.fontFamily }}>
              Click to upload or drag and drop
            </div>
          </div>
        );

      case 'date':
        return (
          <div className={fieldWidth}>
            {settings.labelPosition === 'above' && (
              <label className={labelClasses}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type="date"
              value={isTestMode ? (formData[field.id] || '') : ''}
              onChange={(e) => isTestMode && handleInputChange(field.id, e.target.value)}
              className={baseClasses}
              style={{ 
                borderRadius: `${settings.borderRadius}px`,
                fontFamily: settings.fontFamily
              }}
              disabled={!isTestMode}
            />
          </div>
        );

      case 'section':
        return (
          <div className={`border-t border-gray-200 pt-4 ${fieldWidth}`}>
            <h3 
              className="text-lg font-semibold text-gray-900" 
              style={{ fontFamily: settings.fontFamily }}
            >
              {field.label}
            </h3>
          </div>
        );

      case 'divider':
        return (
          <div className={`border-t border-gray-300 my-4 ${fieldWidth}`}></div>
        );

      default:
        return (
          <div className={`w-full h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm ${fieldWidth}`}>
            {field.type} field
          </div>
        );
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto min-w-0">
      <div className="max-w-4xl mx-auto">
        {/* Preview Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={isTestMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsTestMode(!isTestMode)}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isTestMode ? 'Exit Test Mode' : 'Test Mode'}
              </Button>
              {isTestMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({});
                    setIsTestMode(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
              className="h-8 w-8 p-0"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === "tablet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("tablet")}
              className="h-8 w-8 p-0"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Badge variant="secondary" className="ml-2">
              {previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : 'Desktop'}
            </Badge>
          </div>
        </div>

        {/* Form Preview */}
        <div className={`bg-gray-100 rounded-lg p-4 transition-all duration-200 ${
          previewMode === "mobile" ? "max-w-sm mx-auto" : 
          previewMode === "tablet" ? "max-w-md mx-auto" : 
          "w-full"
        }`}>
          <form onSubmit={handleTestSubmit} className="bg-white rounded-lg shadow-sm p-6">
            {/* Form Header */}
            <div className="text-center mb-6">
              {settings.logo && (
                <div className={`mb-4 flex ${
                  settings.logoAlignment === 'left' ? 'justify-start' :
                  settings.logoAlignment === 'right' ? 'justify-end' :
                  'justify-center'
                }`}>
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-12 object-contain"
                  />
                </div>
              )}
              <h2 
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: settings.fontFamily }}
              >
                Contact Form
              </h2>
              <p 
                className="text-gray-600"
                style={{ fontFamily: settings.fontFamily }}
              >
                Get in touch with us
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {sortedFields.length > 0 ? (
                sortedFields.map((field) => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Fields Yet</h4>
                  <p className="text-gray-600 text-sm">Add fields in the Build tab to see them here</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {sortedFields.length > 0 && (
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    borderRadius: `${settings.borderRadius}px`,
                    fontFamily: settings.fontFamily
                  }}
                  disabled={!isTestMode}
                >
                  {settings.buttonText}
                </button>
                {isTestMode && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    This is a test submission - no data will be saved
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

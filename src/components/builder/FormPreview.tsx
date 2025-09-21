"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { FormData, FormField } from "@/types/form";
import { 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  Upload,
  Eye
} from "lucide-react";
import { generateMockData } from "@/lib/mockData";

interface FormPreviewProps {
  formData: FormData;
  isPreview?: boolean;
  isTestMode?: boolean;
  onSampleData?: () => void;
  onSubmit?: (data: Record<string, any>) => void;
}

export function FormPreview({
  formData,
  isPreview = false,
  isTestMode = false,
  onSampleData,
  onSubmit,
}: FormPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [fileInputs, setFileInputs] = useState<Record<string, FileList | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isTestMode) {
      setFormValues(generateMockData(formData.fields));
    }
  }, [isTestMode, formData.fields]);

  const generateSampleData = () => {
    const sample = generateMockData(formData.fields);
    setFormValues(sample);
    onSampleData?.();
  };

  const handleInputChange = (fieldId: string, value: any, isFile = false) => {
    if (isFile) {
      setFileInputs((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitStatus(null);

    try {
      if (isPreview) {
        onSubmit?.(formValues);
        setSubmitStatus("success");
        setSubmitMessage("Form submitted successfully! (Preview mode)");
        return;
      }

      // Handle file uploads
      const uploadedFileUrls: Record<string, string[]> = {};

      for (const field of formData.fields) {
        if ((field.type === "file" || field.type === "image") && fileInputs[field.id]) {
          const files = Array.from(fileInputs[field.id] as FileList);
          const urls = [];

          for (const file of files) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("formId", formData.id);
            uploadFormData.append("fieldId", field.id);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            const result = await response.json();
            if (result.success) {
              urls.push(result.url);
            } else {
              throw new Error(`Failed to upload ${file.name}`);
            }
          }
          uploadedFileUrls[field.id] = urls;
        }
      }

      // Merge uploaded file URLs
      const submissionData = { ...formValues };
      for (const fieldId in uploadedFileUrls) {
        submissionData[fieldId] = uploadedFileUrls[fieldId].join(", ");
      }

      // Create field mappings
      const fieldMappings: Record<string, string> = {};
      formData.fields.forEach((field) => {
        if (!["divider", "header", "richtext"].includes(field.type)) {
          fieldMappings[field.id] = field.label;
        }
      });

      const response = await fetch(`/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formData.id,
          formData: submissionData,
          fieldMappings,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setSubmitMessage(result.synced ? 
          `✅ ${result.message}` : 
          `⚠️ ${result.message}`
        );
        setFormValues({});
        setFileInputs({});
      } else {
        setSubmitStatus("error");
        setSubmitMessage(`❌ ${result.error || "Submission failed"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage("❌ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.id] || field.defaultValue || "";

    if (["divider", "header", "richtext"].includes(field.type)) {
      return null;
    }

    const baseInputClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300";

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
      case "phone":
      case "url":
        return (
          <input
            type={field.type === "phone" ? "tel" : field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClasses}
            disabled={isSubmitting}
          />
        );
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${baseInputClasses} resize-none`}
            disabled={isSubmitting}
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={baseInputClasses}
            disabled={isSubmitting}
          >
            <option value="">Choose an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                  required={field.required}
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(field.id, [...currentValues, option]);
                    } else {
                      handleInputChange(field.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        );
      case "file":
      case "image":
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                multiple={field.multiple}
                onChange={(e) => handleInputChange(field.id, e.target.files, true)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                {field.type === "image" ? "Images only" : "Any file type"} • Max 10MB
                {field.multiple && " • Multiple files allowed"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl">Live Preview</CardTitle>
            {isTestMode && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Zap className="w-3 h-3 mr-1" />
                Test Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant={viewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="hover:bg-blue-50"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="hover:bg-blue-50"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSampleData}
              className="ml-2 hover:bg-green-50 hover:text-green-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Fill Sample Data
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className={`mx-auto transition-all duration-300 ${
          viewMode === "mobile" ? "max-w-sm" : "max-w-2xl"
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{formData.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs opacity-90">Secure & Encrypted</span>
                  </div>
                </div>
              </div>
              {formData.description && (
                <p className="text-blue-100 leading-relaxed">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formData.fields.map((field) => {
                  const fieldElement = renderField(field);
                  if (!fieldElement) return null;

                  return (
                    <div key={field.id} className="space-y-3 group">
                      <label className="block text-sm font-semibold text-gray-800">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="form-field">
                        {fieldElement}
                      </div>
                      {field.helpText && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {field.helpText}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Submit Message */}
                {submitMessage && (
                  <Card className={`border-2 ${
                    submitStatus === "success" 
                      ? "border-green-200 bg-green-50" 
                      : "border-red-200 bg-red-50"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {submitStatus === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <p className={`text-sm font-medium ${
                          submitStatus === "success" ? "text-green-800" : "text-red-800"
                        }`}>
                          {submitMessage}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-primary text-lg font-semibold py-4 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {formData.settings.submitText}
                    </>
                  )}
                </Button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Instant Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
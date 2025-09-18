"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData, FormField } from "./types";
import { Smartphone, Monitor, RefreshCw, Play } from "lucide-react";
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
  const [fileInputs, setFileInputs] = useState<Record<string, FileList | null>>(
    {}
  );
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isTestMode) {
      setFormValues(generateMockData(formData.fields));
    }
  }, [isTestMode, formData.fields]);

  const generateSampleData = () => {
    const sample: Record<string, any> = {};

    formData.fields.forEach((field) => {
      switch (field.type) {
        case "text":
          sample[field.id] = field.label.includes("Name")
            ? "John Smith"
            : field.label.includes("Company")
              ? "ABC Company"
              : "Sample Text";
          break;
        case "email":
          sample[field.id] = "john@example.com";
          break;
        case "textarea":
          sample[field.id] =
            "This is a sample message describing the project requirements and goals...";
          break;
        case "number":
          sample[field.id] = field.label.includes("Budget") ? "2500" : "42";
          break;
        case "date":
          sample[field.id] = "2024-12-15";
          break;
        case "select":
          sample[field.id] = field.options?.[0] || "Option 1";
          break;
        case "radio":
          sample[field.id] = field.options?.[0] || "Option 1";
          break;
        case "checkbox":
          sample[field.id] = field.options?.slice(0, 2) || [
            "Option 1",
            "Option 2",
          ];
          break;
        case "file":
          sample[field.id] = "sample-document.pdf";
          break;
        case "hidden":
          sample[field.id] = "hidden-value";
          break;
        default:
          sample[field.id] = "";
      }
    });

    setFormValues(sample);
    onSampleData?.();
  };

  const handleInputChange = (
    fieldId: string,
    value: any,
    isFile = false
  ) => {
    if (isFile) {
      setFileInputs((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPreview) {
      // In preview mode, just call the onSubmit callback
      onSubmit?.(formValues);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // 1. Handle file uploads first
      const uploadedFileUrls: Record<string, string[]> = {};

      for (const field of formData.fields) {
        if ((field.type === "file" || field.type === "image") && fileInputs[field.id]) {
          const files = Array.from(fileInputs[field.id] as FileList);
          const urls = [];

          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("formId", formData.id);
            uploadFormData.append("fieldId", field.id);

            // TODO: Add onUploadProgress to fetch call if you want progress bars
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

      // 2. Merge uploaded file URLs into the form submission data
      const submissionData = { ...formValues };
      for (const fieldId in uploadedFileUrls) {
        submissionData[fieldId] = uploadedFileUrls[fieldId].join(", ");
      }

      // 3. Create field mappings
      const fieldMappings: Record<string, string> = {};
      formData.fields.forEach((field) => {
        if (
          field.type !== "divider" &&
          field.type !== "header" &&
          field.type !== "richtext"
        ) {
          fieldMappings[field.id] = field.label;
        }
      });

      const response = await fetch(`/api/forms/${formData.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: submissionData, // Use data with file URLs
          fieldMappings,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(
          result.synced ? `✅ ${result.message}` : `⚠️ ${result.message}`,
        );
        setFormValues({}); // Reset form
      } else {
        setSubmitMessage(`❌ ${result.error || "Submission failed"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage("❌ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.id] || field.defaultValue || "";

    // Skip non-input fields
    if (["divider", "header", "richtext"].includes(field.type)) {
      return null;
    }

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPreview && isSubmitting}
          />
        );
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPreview && isSubmitting}
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPreview && isSubmitting}
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
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="text-blue-600"
                  disabled={isPreview && isSubmitting}
                  required={field.required}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
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
      case "file":
      case "image":
        return (
          <input
            type="file"
            multiple={field.multiple}
            onChange={(e) =>
              handleInputChange(field.id, e.target.files, true)
            }
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isPreview && isSubmitting}
          />
        );
      case "hidden":
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
              variant={viewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor size={16} />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("mobile")}
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
        <div
          className={`mx-auto ${viewMode === "mobile" ? "max-w-sm" : "max-w-lg"}`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-center">
              {formData.title}
            </h3>
            {formData.description && (
              <p className="text-gray-600 mb-6 text-center">
                {formData.description}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.fields.map((field) => {
                const fieldElement = renderField(field);
                if (!fieldElement) return null; // Skip non-input fields

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {fieldElement}
                    {field.helpText && (
                      <p className="text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                );
              })}

              {submitMessage && (
                <div className="p-4 rounded-lg bg-gray-50 border text-sm">
                  {submitMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : formData.settings.submitText}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

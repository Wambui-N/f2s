"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField, FormData } from "./types";
import { FormFieldElement } from "./FormFieldElement";
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from "lucide-react";

interface EnhancedPreviewProps {
  formData: FormData;
  fields: FormField[];
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  selectedField: FormField | null;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export function EnhancedPreview({
  formData,
  fields,
  onEdit,
  onDelete,
  selectedField,
}: EnhancedPreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [showSampleData, setShowSampleData] = useState(false);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const getDeviceStyles = () => {
    switch (deviceType) {
      case "mobile":
        return "max-w-sm mx-auto";
      case "tablet":
        return "max-w-2xl mx-auto";
      default:
        return "max-w-4xl mx-auto";
    }
  };

  const getSampleData = () => {
    const sampleValues: Record<string, string> = {
      "Full Name": "John Smith",
      "Email Address": "john.smith@example.com",
      "Phone Number": "+1 (555) 123-4567",
      Message:
        "I would like to schedule a consultation for my upcoming project. Please let me know your availability.",
      "Service Type": "Consulting",
      Budget: "5000",
      "Preferred Date": "2024-02-15",
      "Priority Level": "High",
      "Services Needed": "Strategy, Implementation",
    };
    return sampleValues;
  };

  const renderFieldWithSampleData = (field: FormField, index: number) => {
    const sampleData = getSampleData();
    const sampleValue = sampleData[field.label] || "";

    if (showSampleData && sampleValue) {
      // Create a field with sample data for preview
      const fieldWithSample = {
        ...field,
        defaultValue: sampleValue,
        placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      };

      return (
        <FormFieldElement
          key={field.id}
          field={fieldWithSample}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          isSelected={selectedField?.id === field.id}
        />
      );
    }

    return (
      <FormFieldElement
        key={field.id}
        field={field}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        isSelected={selectedField?.id === field.id}
      />
    );
  };

  const renderEmbedPreview = () => {
    if (!showEmbedPreview) return null;

    return (
      <div className="mt-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            Embed Preview (simulated host page)
          </div>
          <div className="bg-white p-6 rounded border">
            <div className="text-sm text-gray-500 mb-4">
              Host page content...
            </div>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <div className="text-xs text-gray-400 mb-2">Form embed area:</div>
              <div className={`${getDeviceStyles()}`}>
                <div className="bg-white p-4 rounded border shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    {formData.title}
                  </h3>
                  {formData.description && (
                    <p className="text-gray-600 mb-4">{formData.description}</p>
                  )}
                  <div className="space-y-4">
                    {fields.slice(0, 3).map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-sm font-medium">
                          {field.label}
                        </label>
                        <div className="h-10 bg-gray-100 rounded border"></div>
                      </div>
                    ))}
                    <div className="h-10 bg-blue-500 rounded text-white flex items-center justify-center text-sm">
                      {formData.settings.submitText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Device:</Label>
            <div className="flex space-x-1">
              <Button
                variant={deviceType === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceType("desktop")}
              >
                <Monitor size={16} />
              </Button>
              <Button
                variant={deviceType === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceType("tablet")}
              >
                <Tablet size={16} />
              </Button>
              <Button
                variant={deviceType === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceType("mobile")}
              >
                <Smartphone size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showSampleData}
              onCheckedChange={setShowSampleData}
            />
            <Label className="text-sm">Sample Data</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showEmbedPreview}
              onCheckedChange={setShowEmbedPreview}
            />
            <Label className="text-sm">Embed Preview</Label>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div
        ref={previewRef}
        className={`${getDeviceStyles()} transition-all duration-300`}
      >
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Form Description */}
              {formData.description && (
                <div className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-md">
                  {formData.description}
                </div>
              )}

              {fields.map((field, index) =>
                renderFieldWithSampleData(field, index),
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                  style={{ backgroundColor: formData.theme.primaryColor }}
                >
                  {formData.settings.submitText}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embed Preview */}
      {renderEmbedPreview()}
    </div>
  );
}

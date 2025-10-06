"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFormStore } from "@/store/formStore";
import { X, Settings, MessageSquare, ExternalLink, Palette, Type, Image as ImageIcon } from "lucide-react";

interface FormSettingsPanelProps {
  onClose: () => void;
}

export function FormSettingsPanel({ onClose }: FormSettingsPanelProps) {
  const { formData, updateFormTitle, updateFormDescription } = useFormStore();

  const updateSettings = (key: string, value: any) => {
    useFormStore.setState((state) => ({
      formData: {
        ...state.formData,
        settings: {
          ...state.formData.settings,
          [key]: value,
        },
      },
    }));
  };

  const updateTheme = (key: string, value: any) => {
    useFormStore.setState((state) => ({
      formData: {
        ...state.formData,
        theme: {
          ...state.formData.theme,
          [key]: value,
        },
      },
    }));
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Form Settings
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Basic Form Info */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Basic Information</Label>
          
          <div className="space-y-2">
            <Label htmlFor="form-title" className="text-xs">Form Title</Label>
            <Input
              id="form-title"
              value={formData.title}
              onChange={(e) => updateFormTitle(e.target.value)}
              placeholder="Enter form title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description" className="text-xs">Description</Label>
            <Textarea
              id="form-description"
              value={formData.description || ""}
              onChange={(e) => updateFormDescription(e.target.value)}
              placeholder="Describe what this form is for..."
              rows={3}
            />
          </div>
        </div>

        {/* Submission Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Submission Settings
          </Label>

          <div className="space-y-2">
            <Label htmlFor="submit-text" className="text-xs">Submit Button Text</Label>
            <Input
              id="submit-text"
              value={formData.settings.submitText}
              onChange={(e) => updateSettings("submitText", e.target.value)}
              placeholder="Submit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success-message" className="text-xs">Success Message</Label>
            <Textarea
              id="success-message"
              value={formData.settings.successMessage}
              onChange={(e) => updateSettings("successMessage", e.target.value)}
              placeholder="Thank you for your submission!"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="error-message" className="text-xs">Error Message</Label>
            <Textarea
              id="error-message"
              value={formData.settings.errorMessage}
              onChange={(e) => updateSettings("errorMessage", e.target.value)}
              placeholder="There was an error submitting your form."
              rows={2}
            />
          </div>

          {/* Redirect Settings */}
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.settings.redirectEnabled || false}
                onCheckedChange={(checked) => updateSettings("redirectEnabled", checked)}
              />
              <Label className="text-sm flex items-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                Redirect after submission
              </Label>
            </div>
            
            {formData.settings.redirectEnabled && (
              <div className="space-y-2">
                <Label htmlFor="redirect-url" className="text-xs">Redirect URL</Label>
                <Input
                  id="redirect-url"
                  value={formData.settings.redirectUrl || ""}
                  onChange={(e) => updateSettings("redirectUrl", e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
              </div>
            )}
          </div>
        </div>

        {/* Design Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Design Settings
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: formData.theme.primaryColor }}
                />
                <Input
                  id="primary-color"
                  value={formData.theme.primaryColor}
                  onChange={(e) => updateTheme("primaryColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color" className="text-xs">Text Color</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: formData.theme.textColor || "#111827" }}
                />
                <Input
                  id="text-color"
                  value={formData.theme.textColor || "#111827"}
                  onChange={(e) => updateTheme("textColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background-color" className="text-xs">Background</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: formData.theme.backgroundColor || "#ffffff" }}
                />
                <Input
                  id="background-color"
                  value={formData.theme.backgroundColor || "#ffffff"}
                  onChange={(e) => updateTheme("backgroundColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="button-text-color" className="text-xs">Button Text</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: formData.theme.buttonTextColor || "#ffffff" }}
                />
                <Input
                  id="button-text-color"
                  value={formData.theme.buttonTextColor || "#ffffff"}
                  onChange={(e) => updateTheme("buttonTextColor", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family" className="text-xs">Font Family</Label>
            <select
              id="font-family"
              value={formData.theme.fontFamily}
              onChange={(e) => updateTheme("fontFamily", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="border-radius" className="text-xs">Border Radius</Label>
            <Input
              id="border-radius"
              value={formData.theme.borderRadius}
              onChange={(e) => updateTheme("borderRadius", e.target.value)}
              placeholder="8px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spacing" className="text-xs">Field Spacing</Label>
            <Input
              id="spacing"
              value={formData.theme.spacing}
              onChange={(e) => updateTheme("spacing", e.target.value)}
              placeholder="16px"
            />
          </div>
        </div>

        {/* Branding Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Branding
          </Label>

          <div className="space-y-2">
            <Label htmlFor="logo-url" className="text-xs">Logo URL</Label>
            <Input
              id="logo-url"
              value={formData.theme.logoUrl || ""}
              onChange={(e) => updateTheme("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background-image" className="text-xs">Background Image URL</Label>
            <Input
              id="background-image"
              value={formData.theme.backgroundImageUrl || ""}
              onChange={(e) => updateTheme("backgroundImageUrl", e.target.value)}
              placeholder="https://example.com/background.jpg"
            />
          </div>

          {/* Watermark Settings */}
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.theme.watermarkEnabled || false}
                onCheckedChange={(checked) => updateTheme("watermarkEnabled", checked)}
              />
              <Label className="text-sm">Show Shelfcue watermark</Label>
            </div>
            
            {formData.theme.watermarkEnabled && (
              <div className="space-y-2">
                <Label htmlFor="watermark-text" className="text-xs">Watermark Text</Label>
                <Input
                  id="watermark-text"
                  value={formData.theme.watermarkText || "Shelfcue"}
                  onChange={(e) => updateTheme("watermarkText", e.target.value)}
                  placeholder="Shelfcue"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


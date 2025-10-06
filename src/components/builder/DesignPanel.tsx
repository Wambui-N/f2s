"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/store/formStore";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Palette,
  X,
} from "lucide-react";

interface DesignPanelProps {
  onClose: () => void;
}

export function DesignPanel({ onClose }: DesignPanelProps) {
  const { formData } = useFormStore();

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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Design Settings
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Brand Colors */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Brand Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: formData.theme.primaryColor }}
              />
              <Input
                value={formData.theme.primaryColor}
                onChange={(e) => updateTheme("primaryColor", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Text Color</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: formData.theme.textColor || "#111827" }}
              />
              <Input
                value={formData.theme.textColor || "#111827"}
                onChange={(e) => updateTheme("textColor", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Background</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: formData.theme.backgroundColor || "#ffffff" }}
              />
              <Input
                value={formData.theme.backgroundColor || "#ffffff"}
                onChange={(e) => updateTheme("backgroundColor", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Button Text</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: formData.theme.buttonTextColor || "#ffffff" }}
              />
              <Input
                value={formData.theme.buttonTextColor || "#ffffff"}
                onChange={(e) => updateTheme("buttonTextColor", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Typography</Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Font Family</Label>
            <Select
              value={formData.theme.fontFamily}
              onValueChange={(value) => updateTheme("fontFamily", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Border Radius</Label>
              <Input
                value={formData.theme.borderRadius}
                onChange={(e) => updateTheme("borderRadius", e.target.value)}
                placeholder="8px"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Field Spacing</Label>
              <Input
                value={formData.theme.spacing}
                onChange={(e) => updateTheme("spacing", e.target.value)}
                placeholder="16px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Branding</Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Logo URL</Label>
            <Input
              value={formData.theme.logoUrl || ""}
              onChange={(e) => updateTheme("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Background Image URL</Label>
            <Input
              value={formData.theme.backgroundImageUrl || ""}
              onChange={(e) => updateTheme("backgroundImageUrl", e.target.value)}
              placeholder="https://example.com/background.jpg"
            />
          </div>
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
                <Label className="text-xs text-gray-600">Watermark Text</Label>
                <Input
                  value={formData.theme.watermarkText || "Shelfcue"}
                  onChange={(e) => updateTheme("watermarkText", e.target.value)}
                  placeholder="Shelfcue"
                />
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Layout Section */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Layout</Label>

        <div className="space-y-3">
          {/* Page Width */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Page width</Label>
            <Input value="700px" className="text-xs" />
          </div>

          {/* Base Font Size */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Base font size
            </Label>
            <Input value="16px" className="text-xs" />
          </div>

          {/* Logo Settings */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Logo</Label>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                <ImageIcon size={16} className="text-gray-400" />
              </div>
              <div className="flex space-x-1">
                <Input
                  value="100px"
                  placeholder="Width"
                  className="w-16 text-xs"
                />
                <Input
                  value="100px"
                  placeholder="Height"
                  className="w-16 text-xs"
                />
                <Input
                  value="50px"
                  placeholder="Radius"
                  className="w-16 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cover Height */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cover</Label>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                <ImageIcon size={16} className="text-gray-400" />
              </div>
              <Input
                value="25%"
                placeholder="Height"
                className="w-20 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Inputs</Label>

        <div className="space-y-3">
          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <Maximize2 size={12} />
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <Minimize2 size={12} />
              </Button>
              <Input value="320px" className="flex-1 text-xs" />
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input value="36px" className="text-xs" />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: "#ffffff" }}
              />
              <Input value="#ffffff" className="flex-1 text-xs" />
            </div>
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Placeholder</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: "#bbbab8" }}
              />
              <Input value="#bbbab8" className="flex-1 text-xs" />
            </div>
          </div>

          {/* Border */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Border</Label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: "#3d3b3" }}
              />
              <Input value="#3d3b3" className="flex-1 text-xs" />
              <Input value="1px" placeholder="Width" className="w-16 text-xs" />
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Radius</Label>
            <Input value="8px" className="text-xs" />
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Margin bottom
              </Label>
              <Input value="10px" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Horizontal padding
              </Label>
              <Input value="10px" className="text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Buttons</Label>

        <div className="space-y-3">
          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <Maximize2 size={12} />
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <Minimize2 size={12} />
              </Button>
              <Input value="auto" className="flex-1 text-xs" />
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input value="36px" className="text-xs" />
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Alignment</Label>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <AlignLeft size={12} />
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <AlignCenter size={12} />
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                <AlignRight size={12} />
              </Button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Font size</Label>
            <Input value="16px" className="text-xs" />
          </div>

          {/* Corner Radius */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Corner radius
            </Label>
            <Input value="8px" className="text-xs" />
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Vertical margin
              </Label>
              <Input value="10px" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Horizontal padding
              </Label>
              <Input value="14px" className="text-xs" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStore } from '@/store/formStore';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Maximize2, 
  Minimize2,
  Image as ImageIcon
} from 'lucide-react';

export function DesignPanel() {
  const { formData, updateFormTitle, updateFormDescription } = useFormStore();

  const updateTheme = (key: string, value: string) => {
    // This would need to be added to the store
    console.log('Update theme:', key, value);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Theme</Label>
        <Select defaultValue="light">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Font Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font</Label>
        <Select 
          value={formData.theme.fontFamily} 
          onValueChange={(value) => updateTheme('fontFamily', value)}
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
          </SelectContent>
        </Select>
      </div>

      {/* Colors Section */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Colors</Label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Background */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              <Input 
                value="#FFFFFF" 
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Text</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: '#37352F' }}
              />
              <Input 
                value="#37352F" 
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>

          {/* Button Background */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Button background</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: formData.theme.primaryColor }}
              />
              <Input 
                value={formData.theme.primaryColor} 
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Button text</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              <Input 
                value="#FFFFFF" 
                onChange={(e) => updateTheme('buttonTextColor', e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
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
            <Label className="text-xs text-muted-foreground">Base font size</Label>
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
                <Input value="100px" placeholder="Width" className="w-16 text-xs" />
                <Input value="100px" placeholder="Height" className="w-16 text-xs" />
                <Input value="50px" placeholder="Radius" className="w-16 text-xs" />
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
              <Input value="25%" placeholder="Height" className="w-20 text-xs" />
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
                style={{ backgroundColor: '#ffffff' }}
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
                style={{ backgroundColor: '#bbbab8' }}
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
                style={{ backgroundColor: '#3d3b3' }}
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
              <Label className="text-xs text-muted-foreground">Margin bottom</Label>
              <Input value="10px" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Horizontal padding</Label>
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
            <Label className="text-xs text-muted-foreground">Corner radius</Label>
            <Input value="8px" className="text-xs" />
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vertical margin</Label>
              <Input value="10px" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Horizontal padding</Label>
              <Input value="14px" className="text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


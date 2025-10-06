"use client";

import React, { useState } from 'react';
import { Upload, X, RotateCcw, Download, Save, Palette, Type, CornerDownLeft, Image, Layout, AlignLeft, AlignCenter, AlignRight, Move, Spacing, Eye, Palette as PaletteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export interface Theme {
  id: string;
  name: string;
  thumbnail: string;
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;
  buttonText: string;
  isCustom?: boolean;
}

export interface DesignSettings {
  selectedTheme: string;
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;
  buttonText: string;
  logo?: string;
  logoAlignment: 'left' | 'center' | 'right';
  fieldWidth: 'full' | 'compact';
  labelPosition: 'above' | 'floating';
  // New design options
  inputHeight: number;
  inputPadding: number;
  fieldSpacing: number;
  fontSize: number;
  labelSize: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  focusColor: string;
  shadowIntensity: number;
  buttonSize: 'small' | 'medium' | 'large';
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

const themes: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    thumbnail: '🎨',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: 8,
    buttonText: 'Send Message'
  },
  {
    id: 'classic',
    name: 'Classic',
    thumbnail: '📜',
    primaryColor: '#1f2937',
    fontFamily: 'Georgia',
    borderRadius: 4,
    buttonText: 'Submit'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    thumbnail: '⚪',
    primaryColor: '#000000',
    fontFamily: 'Helvetica',
    borderRadius: 0,
    buttonText: 'Send'
  },
  {
    id: 'bold',
    name: 'Bold',
    thumbnail: '🔥',
    primaryColor: '#ef4444',
    fontFamily: 'Montserrat',
    borderRadius: 12,
    buttonText: 'Get Started'
  },
  {
    id: 'professional',
    name: 'Professional',
    thumbnail: '💼',
    primaryColor: '#2c5e2a',
    fontFamily: 'Roboto',
    borderRadius: 6,
    buttonText: 'Submit Form'
  },
  {
    id: 'creative',
    name: 'Creative',
    thumbnail: '🎭',
    primaryColor: '#8b5cf6',
    fontFamily: 'Poppins',
    borderRadius: 16,
    buttonText: 'Let\'s Go!'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    thumbnail: '✨',
    primaryColor: '#059669',
    fontFamily: 'Playfair Display',
    borderRadius: 10,
    buttonText: 'Continue'
  },
  {
    id: 'tech',
    name: 'Tech',
    thumbnail: '⚡',
    primaryColor: '#06b6d4',
    fontFamily: 'JetBrains Mono',
    borderRadius: 2,
    buttonText: 'Execute'
  }
];

const colorPresets = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#2c5e2a', '#1f2937', '#000000', '#6b7280', '#9ca3af'
];

const fontFamilies = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Helvetica', label: 'Helvetica (Classic)' },
  { value: 'Georgia', label: 'Georgia (Serif)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Playfair Display', label: 'Playfair (Elegant)' },
  { value: 'JetBrains Mono', label: 'JetBrains (Monospace)' }
];

interface DesignSettingsProps {
  settings: DesignSettings;
  onSettingsChange: (settings: Partial<DesignSettings>) => void;
  onResetToDefaults: () => void;
  onExportCSS: () => void;
  onSaveAsCustom: () => void;
}

export function DesignSettings({ 
  settings, 
  onSettingsChange, 
  onResetToDefaults, 
  onExportCSS, 
  onSaveAsCustom 
}: DesignSettingsProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo || null);

  const handleThemeSelect = (theme: Theme) => {
    onSettingsChange({
      selectedTheme: theme.id,
      primaryColor: theme.primaryColor,
      fontFamily: theme.fontFamily,
      borderRadius: theme.borderRadius,
      buttonText: theme.buttonText
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        onSettingsChange({ logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    onSettingsChange({ logo: undefined });
  };

  const selectedTheme = themes.find(t => t.id === settings.selectedTheme) || themes[0];

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Settings</h3>
        <p className="text-sm text-gray-600">Customize your form's appearance</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Theme Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.selectedTheme === theme.id
                      ? 'border-[#2c5e2a] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.thumbnail}</div>
                  <div className="text-xs font-medium text-gray-900">{theme.name}</div>
                  {settings.selectedTheme === theme.id && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Active
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customize Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Customize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Color */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Primary Color
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => onSettingsChange({ primaryColor: color })}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onSettingsChange({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5e2a]"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Border Radius: {settings.borderRadius}px
              </label>
              <Slider
                value={[settings.borderRadius]}
                onValueChange={([value]) => onSettingsChange({ borderRadius: value })}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Button Text
              </label>
              <Input
                value={settings.buttonText}
                onChange={(e) => onSettingsChange({ buttonText: e.target.value })}
                placeholder="Send Message"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo & Branding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              Logo & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Upload Logo
              </label>
              {logoPreview ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-20 object-contain border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={handleLogoRemove}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="w-full text-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    Change Logo
                  </label>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 cursor-pointer"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Click to upload logo</div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Logo Alignment */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Logo Alignment
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight }
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => onSettingsChange({ logoAlignment: value as any })}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      settings.logoAlignment === value
                        ? 'border-[#2c5e2a] bg-green-50 text-[#2c5e2a]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Field Width */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Field Width
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'full', label: 'Full Width' },
                  { value: 'compact', label: 'Compact' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onSettingsChange({ fieldWidth: value as any })}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      settings.fieldWidth === value
                        ? 'border-[#2c5e2a] bg-green-50 text-[#2c5e2a]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Label Position */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Label Position
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'above', label: 'Above Field' },
                  { value: 'floating', label: 'Floating' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onSettingsChange({ labelPosition: value as any })}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      settings.labelPosition === value
                        ? 'border-[#2c5e2a] bg-green-50 text-[#2c5e2a]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Move className="w-4 h-4" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Height */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Input Height: {settings.inputHeight || 40}px
              </label>
              <Slider
                value={[settings.inputHeight || 40]}
                onValueChange={([value]) => onSettingsChange({ inputHeight: value })}
                max={80}
                min={32}
                step={4}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Compact</span>
                <span>Large</span>
              </div>
            </div>

            {/* Input Padding */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Input Padding: {settings.inputPadding || 12}px
              </label>
              <Slider
                value={[settings.inputPadding || 12]}
                onValueChange={([value]) => onSettingsChange({ inputPadding: value })}
                max={24}
                min={8}
                step={2}
                className="w-full"
              />
            </div>

            {/* Field Spacing */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Field Spacing: {settings.fieldSpacing || 16}px
              </label>
              <Slider
                value={[settings.fieldSpacing || 16]}
                onValueChange={([value]) => onSettingsChange({ fieldSpacing: value })}
                max={32}
                min={8}
                step={4}
                className="w-full"
              />
            </div>

            {/* Button Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Button Size
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onSettingsChange({ buttonSize: value as any })}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      (settings.buttonSize || 'medium') === value
                        ? 'border-[#2c5e2a] bg-green-50 text-[#2c5e2a]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Button Style
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'solid', label: 'Solid' },
                  { value: 'outline', label: 'Outline' },
                  { value: 'ghost', label: 'Ghost' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onSettingsChange({ buttonStyle: value as any })}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      (settings.buttonStyle || 'solid') === value
                        ? 'border-[#2c5e2a] bg-green-50 text-[#2c5e2a]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography & Colors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" />
              Typography & Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Font Size: {settings.fontSize || 16}px
              </label>
              <Slider
                value={[settings.fontSize || 16]}
                onValueChange={([value]) => onSettingsChange({ fontSize: value })}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
            </div>

            {/* Label Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Label Size: {settings.labelSize || 14}px
              </label>
              <Slider
                value={[settings.labelSize || 14]}
                onValueChange={([value]) => onSettingsChange({ labelSize: value })}
                max={20}
                min={12}
                step={1}
                className="w-full"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
                />
                <Input
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: settings.textColor || '#374151' }}
                />
                <Input
                  value={settings.textColor || '#374151'}
                  onChange={(e) => onSettingsChange({ textColor: e.target.value })}
                  className="flex-1"
                  placeholder="#374151"
                />
              </div>
            </div>

            {/* Border Color */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Border Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: settings.borderColor || '#d1d5db' }}
                />
                <Input
                  value={settings.borderColor || '#d1d5db'}
                  onChange={(e) => onSettingsChange({ borderColor: e.target.value })}
                  className="flex-1"
                  placeholder="#d1d5db"
                />
              </div>
            </div>

            {/* Focus Color */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Focus Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: settings.focusColor || settings.primaryColor }}
                />
                <Input
                  value={settings.focusColor || settings.primaryColor}
                  onChange={(e) => onSettingsChange({ focusColor: e.target.value })}
                  className="flex-1"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            {/* Shadow Intensity */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Shadow Intensity: {settings.shadowIntensity || 0}
              </label>
              <Slider
                value={[settings.shadowIntensity || 0]}
                onValueChange={([value]) => onSettingsChange({ shadowIntensity: value })}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Strong</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="outline"
          onClick={onResetToDefaults}
          className="w-full justify-start"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onExportCSS}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export CSS
          </Button>
          <Button
            variant="outline"
            onClick={onSaveAsCustom}
            className="text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Theme
          </Button>
        </div>
      </div>
    </div>
  );
}

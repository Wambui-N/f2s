"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FormField } from "./types";
import {
  GripVertical,
  Edit2,
  Trash2,
  Star,
  Heart,
  Circle,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings,
  Sparkles
} from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

interface FormFieldElementProps {
  field: FormField;
  index: number;
  onEdit?: (field: FormField) => void;
  onDelete?: (fieldId: string) => void;
  onDuplicate?: (field: FormField) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isSelected?: boolean;
}

export function FormFieldElement({
  field,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isSelected,
}: FormFieldElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ index }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render: ({ container }) => {
            container.style.opacity = "0.8";
            container.style.transform = "rotate(5deg)";
            return () => {};
          },
        });
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [index]);

  const renderField = () => {
    const baseInputClasses = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "url":
      case "date":
        return (
          <input
            type={field.type === "phone" ? "tel" : field.type}
            placeholder={field.placeholder}
            className={baseInputClasses}
            readOnly
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            className={`${baseInputClasses} resize-none`}
            rows={3}
            readOnly
          />
        );

      case "select":
        return (
          <select className={baseInputClasses} disabled>
            <option>{field.placeholder || "Choose an option..."}</option>
            {field.options?.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.slice(0, 3).map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                <input type="checkbox" className="text-blue-600" disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
            {field.options && field.options.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{field.options.length - 3} more options
              </div>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            {field.options?.slice(0, 3).map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                <input type="radio" name={field.id} className="text-blue-600" disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case "file":
      case "image":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              {field.type === "image" ? (
                <ImageIcon className="w-4 h-4 text-blue-600" />
              ) : (
                <Upload className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {field.type === "image" ? "Upload images" : "Upload files"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max 10MB {field.multiple && "• Multiple files"}
            </p>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Switch defaultChecked={field.defaultValue as boolean} disabled />
            <span className="text-sm">{field.label}</span>
          </div>
        );

      case "rating":
        const RatingIcon = field.ratingConfig?.shape === "heart" ? Heart : 
                           field.ratingConfig?.shape === "circle" ? Circle : Star;
        return (
          <div className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {Array.from({ length: field.ratingConfig?.scale || 5 }).map((_, i) => (
              <RatingIcon 
                key={i} 
                className="h-6 w-6 text-yellow-400 hover:scale-110 transition-transform cursor-pointer" 
              />
            ))}
          </div>
        );

      case "address":
        return (
          <div className="space-y-3">
            {field.addressConfig?.street.enabled && (
              <input
                placeholder="Street Address"
                className={baseInputClasses}
                readOnly
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              {field.addressConfig?.city.enabled && (
                <input
                  placeholder="City"
                  className={baseInputClasses}
                  readOnly
                />
              )}
              {field.addressConfig?.state.enabled && (
                <input
                  placeholder="State"
                  className={baseInputClasses}
                  readOnly
                />
              )}
            </div>
          </div>
        );

      case "header":
        return (
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {field.content || "Section Header"}
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          </div>
        );

      case "divider":
        return (
          <div className="py-4">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="px-4 text-sm font-medium text-gray-500 bg-white">
                {field.content || "Section Break"}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
          </div>
        );

      case "richtext":
        return (
          <div
            className="prose prose-sm max-w-none p-4 bg-blue-50 rounded-lg border border-blue-200"
            dangerouslySetInnerHTML={{ __html: field.content || "" }}
          />
        );

      case "hidden":
        return (
          <div className="p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-600 italic flex items-center">
              <EyeOff className="w-4 h-4 mr-2" />
              Hidden Field: {field.label} (Value: {field.defaultValue as string})
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const showLabel = !["divider", "header", "richtext"].includes(field.type);

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105 rotate-2" : ""
      } ${
        isSelected ? "ring-2 ring-blue-500 rounded-xl" : ""
      } group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit?.(field)}
    >
      <Card className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-md"
          : "hover:border-gray-300 hover:bg-gray-50/50"
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div className="flex flex-col items-center space-y-2">
              <button
                className={`cursor-grab p-2 rounded-lg transition-all duration-200 ${
                  isHovered || isSelected 
                    ? "bg-blue-100 text-blue-600" 
                    : "text-muted-foreground hover:bg-gray-100"
                }`}
                aria-label={`Drag to reorder ${field.label} field`}
              >
                <GripVertical className="w-4 h-4" />
              </button>
              {field.required && showLabel && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  Required
                </Badge>
              )}
            </div>

            {/* Field Content */}
            <div className="flex-grow">
              {showLabel && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <label className="font-semibold text-gray-800 text-base">
                      {field.label}
                    </label>
                    {field.columnName && (
                      <Badge variant="outline" className="text-xs">
                        → {field.columnName}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`flex items-center space-x-1 transition-all duration-200 ${
                    isSelected || isHovered ? "opacity-100" : "opacity-0"
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.(field);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      aria-label="Duplicate field"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp?.(index);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      aria-label="Move field up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown?.(index);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      aria-label="Move field down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(field);
                      }}
                      className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
                      aria-label="Edit field"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(field.id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
                      aria-label="Delete field"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Field Preview */}
              <div className="transition-all duration-200">
                {renderField()}
              </div>
              
              {field.helpText && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {field.helpText}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
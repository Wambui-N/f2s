"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

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
  const [isDragOver, setIsDragOver] = useState(false);

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
            return () => {};
          },
        });
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [index]);

  const renderField = () => {
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
            className="w-full px-3 py-2 border rounded-md bg-white"
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border rounded-md bg-white"
          />
        );

      case "select":
        return (
          <select className="w-full px-3 py-2 border rounded-md bg-white">
            {field.options?.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}-${index}`}
                />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      case "file":
      case "image":
        return (
          <div className="space-y-2">
            <input
              type="file"
              multiple={field.multiple}
              className="w-full text-sm"
            />
            <div className="text-xs text-muted-foreground">
              {field.type === "image"
                ? "Allowed: JPG, PNG, GIF"
                : "Allowed: All file types"}{" "}
              (max 10MB)
              {field.multiple && ", Multiple files allowed"}
            </div>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch defaultChecked={field.defaultValue as boolean} />
            <span>{field.label}</span>
          </div>
        );

      case "rating":
        const RatingIcon =
          field.ratingConfig?.shape === "heart"
            ? Heart
            : field.ratingConfig?.shape === "circle"
              ? Circle
              : Star;
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: field.ratingConfig?.scale || 5 }).map(
              (_, i) => (
                <RatingIcon key={i} className="h-6 w-6 text-yellow-400" />
              ),
            )}
          </div>
        );

      case "address":
        return (
          <div className="space-y-3">
            {field.addressConfig?.street.enabled && (
              <input
                placeholder="Street Address"
                className="w-full px-3 py-2 border rounded-md bg-white"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              {field.addressConfig?.city.enabled && (
                <input
                  placeholder="City"
                  className="px-3 py-2 border rounded-md bg-white"
                />
              )}
              {field.addressConfig?.state.enabled && (
                <input
                  placeholder="State / Province"
                  className="px-3 py-2 border rounded-md bg-white"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field.addressConfig?.zip.enabled && (
                <input
                  placeholder="ZIP / Postal Code"
                  className="px-3 py-2 border rounded-md bg-white"
                />
              )}
              {field.addressConfig?.country.enabled && (
                <input
                  placeholder="Country"
                  className="px-3 py-2 border rounded-md bg-white"
                />
              )}
            </div>
          </div>
        );

      case "header":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {field.content || "Section Header"}
            </h3>
          </div>
        );

      case "divider":
        return (
          <div>
            <p className="text-lg font-semibold">
              {field.content || "Divider"}
            </p>
            <Separator className="my-2" />
          </div>
        );

      case "richtext":
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: field.content || "" }}
          />
        );

      case "hidden":
        return (
          <p className="text-sm text-muted-foreground italic">
            Hidden Field: {field.label} (Value: {field.defaultValue as string})
          </p>
        );

      default:
        return null;
    }
  };

  // Hide label for structural elements
  const showLabel = !["divider", "header", "richtext"].includes(field.type);

  const fieldDescriptionId = `field-${field.id}-description`;

  return (
    <div
      ref={ref}
      className={`relative ${isDragging ? "opacity-50 scale-105" : ""} ${
        isSelected ? "ring-2 ring-blue-500 rounded-lg" : ""
      } group`}
      onClick={() => onEdit?.(field)}
      aria-describedby={fieldDescriptionId}
    >
      <span id={fieldDescriptionId} className="sr-only">
        {`Field: ${field.label}. Use the buttons to move or edit this field.`}
      </span>
      <Card
        className={`p-4 bg-background hover:shadow-md transition-all duration-200 cursor-pointer ${
          isSelected
            ? "bg-blue-50 border-blue-200"
            : "hover:border-gray-300"
        } group-hover:shadow-lg`}
        onClick={() => onEdit?.(field)}
      >
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <button
              className="cursor-grab p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors group-hover:text-gray-600"
              aria-label={`Drag to reorder ${field.label} field`}
            >
              <GripVertical size={16} />
            </button>
            {field.required && showLabel && (
              <span className="text-xs text-red-500 mt-1">*</span>
            )}
          </div>
          <div className="flex-grow">
            {showLabel && (
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-sm text-gray-700">
                  {field.label}
                </label>
                <div
                  className={`flex items-center space-x-1 transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate?.(field);
                    }}
                    className="h-6 w-6 p-0"
                    aria-label="Duplicate field"
                  >
                    <Copy size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp?.(index);
                    }}
                    className="h-6 w-6 p-0"
                    aria-label="Move field up"
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown?.(index);
                    }}
                    className="h-6 w-6 p-0"
                    aria-label="Move field down"
                  >
                    <ArrowDown size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(field);
                    }}
                    className="h-6 w-6 p-0"
                    aria-label="Edit field"
                  >
                    <Edit2 size={12} />
                  </Button>
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(field.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    aria-label="Delete field"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            )}
            {renderField()}
            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">
                {field.helpText}
              </p>
            )}
          </div>
        </div>
      </Card>
      {isDragOver && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}

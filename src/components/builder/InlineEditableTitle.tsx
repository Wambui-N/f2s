"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, Save } from "lucide-react";

interface InlineEditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

export function InlineEditableTitle({
  title,
  onSave,
  className = "",
}: InlineEditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      setSaveStatus("saving");
      onSave(editValue.trim());

      // Show "saved" status briefly
      setTimeout(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 300);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleAutoSave = (value: string) => {
    if (value.trim() && value !== title) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus("saving");
        onSave(value.trim());

        setTimeout(() => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }, 300);
      }, 800);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);
    handleAutoSave(value);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="text-2xl font-bold border-none shadow-none p-0 h-auto focus:ring-0"
          placeholder="Enter form title"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="h-6 w-6 p-0"
        >
          <Check size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X size={14} />
        </Button>

        {saveStatus === "saving" && (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Save size={12} className="animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <Check size={12} />
            <span>Saved</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 size={14} />
      </Button>
    </div>
  );
}

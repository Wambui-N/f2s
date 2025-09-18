"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backButton,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-6 border-b", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {backButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={backButton.onClick}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">{backButton.label || "Go back"}</span>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
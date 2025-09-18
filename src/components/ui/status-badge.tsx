"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "pending" | "warning" | "error";
  text: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ 
  status, 
  text, 
  className,
  showIcon = true 
}: StatusBadgeProps) {
  const statusConfig = {
    success: {
      variant: "default" as const,
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 border-green-200"
    },
    pending: {
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200"
    },
    warning: {
      variant: "secondary" as const,
      icon: AlertCircle,
      className: "bg-orange-100 text-orange-800 border-orange-200"
    },
    error: {
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-100 text-red-800 border-red-200"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {text}
    </Badge>
  );
}
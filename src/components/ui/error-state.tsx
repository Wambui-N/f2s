"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  type: "data" | "network" | "offline";
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ type, message, onRetry, className }: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case "data":
        return {
          icon: AlertTriangle,
          title: "Unable to load your data",
          description: message || "Something went wrong while fetching your dashboard data. Please try again.",
          action: onRetry ? (
            <Button onClick={onRetry} className="bg-[#2c5e2a] hover:bg-[#234b21] text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : null,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-900",
          descColor: "text-red-800"
        };
      case "network":
        return {
          icon: WifiOff,
          title: "Network connection issues",
          description: message || "Please check your internet connection and try again.",
          action: onRetry ? (
            <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          ) : null,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          titleColor: "text-orange-900",
          descColor: "text-orange-800"
        };
      case "offline":
        return {
          icon: WifiOff,
          title: "You're currently offline",
          description: message || "Please check your internet connection. Some features may be limited.",
          action: null,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-900",
          descColor: "text-gray-700"
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Something went wrong",
          description: "An unexpected error occurred.",
          action: null,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-900",
          descColor: "text-red-800"
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <Card className={cn("border-2", config.borderColor, config.bgColor, className)}>
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${config.iconColor.replace('text-', '')}20` }}>
          <Icon className={cn("w-8 h-8", config.iconColor)} />
        </div>
        <h3 className={cn("text-xl font-semibold mb-2", config.titleColor)}>
          {config.title}
        </h3>
        <p className={cn("text-sm mb-6 max-w-md mx-auto", config.descColor)}>
          {config.description}
        </p>
        {config.action && (
          <div className="flex justify-center">
            {config.action}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  return (
    <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You're offline</span>
    </div>
  );
}

// Queued actions notification
export function QueuedActionsNotification({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">
        {count} action{count > 1 ? 's' : ''} queued
      </span>
    </div>
  );
}

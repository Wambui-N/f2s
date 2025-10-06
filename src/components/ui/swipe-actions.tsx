"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeActionsProps {
  children: React.ReactNode;
  onMarkContacted?: () => void;
  onReply?: () => void;
  onMore?: () => void;
  className?: string;
}

export function SwipeActions({ 
  children, 
  onMarkContacted, 
  onReply, 
  onMore,
  className 
}: SwipeActionsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const SWIPE_THRESHOLD = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      setDragOffset(Math.min(diff, 200)); // Max swipe distance
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (dragOffset > SWIPE_THRESHOLD) {
      // Snap to open position
      setDragOffset(200);
    } else {
      // Snap back to closed position
      setDragOffset(0);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setDragOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Main content */}
      <div
        ref={containerRef}
        className={cn(
          "relative z-10 bg-white transition-transform duration-200 ease-out",
          isDragging ? "transition-none" : ""
        )}
        style={{ transform: `translateX(-${dragOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Swipe actions background */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-gray-50">
        <div className="flex items-center gap-2">
          {onMarkContacted && (
            <Button
              size="sm"
              onClick={() => handleAction(onMarkContacted)}
              className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white rounded-full"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {onReply && (
            <Button
              size="sm"
              onClick={() => handleAction(onReply)}
              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          {onMore && (
            <Button
              size="sm"
              onClick={() => handleAction(onMore)}
              className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

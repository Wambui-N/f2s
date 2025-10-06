"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export function FloatingActionButton({ 
  onClick, 
  className,
  label = "Create New Form",
  showLabel = false
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-[#2c5e2a] hover:bg-[#234b21] text-white",
        "md:bottom-8 md:right-8",
        showLabel && "w-auto px-6 gap-3",
        className
      )}
      size="lg"
    >
      <Plus className="w-6 h-6" />
      {showLabel && (
        <span className="hidden sm:inline font-medium">
          {label}
        </span>
      )}
    </Button>
  );
}

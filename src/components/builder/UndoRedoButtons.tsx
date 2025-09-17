"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: UndoRedoButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center space-x-2"
      >
        <Undo2 size={16} />
        <span>Undo</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center space-x-2"
      >
        <Redo2 size={16} />
        <span>Redo</span>
      </Button>
    </div>
  );
}

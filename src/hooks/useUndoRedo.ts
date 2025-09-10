"use client";

import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const saveState = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
    return history[currentIndex - 1];
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
    return history[currentIndex + 1];
  }, [canRedo, currentIndex, history]);

  return { currentState, saveState, undo, redo, canUndo, canRedo };
}

// Undo/Redo UI Component
interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export function UndoRedoButtons({ canUndo, canRedo, onUndo, onRedo, className = '' }: UndoRedoButtonsProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`px-2 py-1 text-sm rounded ${
          canUndo 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`px-2 py-1 text-sm rounded ${
          canRedo 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        ↷ Redo
      </button>
    </div>
  );
}

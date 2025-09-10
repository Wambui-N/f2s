"use client";

import React, { useCallback, useEffect } from 'react';
import { FormData } from './types';

interface UndoRedoState {
  history: FormData[];
  currentIndex: number;
  maxHistorySize: number;
}

interface UndoRedoHook {
  state: UndoRedoState;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => FormData | null;
  redo: () => FormData | null;
  saveState: (formData: FormData) => void;
  clearHistory: () => void;
}

export function useUndoRedo(initialState: FormData, maxHistorySize: number = 50): UndoRedoHook {
  const [state, setState] = React.useState<UndoRedoState>({
    history: [initialState],
    currentIndex: 0,
    maxHistorySize
  });

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  const saveState = useCallback((formData: FormData) => {
    setState(prevState => {
      const newHistory = [...prevState.history.slice(0, prevState.currentIndex + 1)];
      newHistory.push({ ...formData });
      
      // Limit history size
      if (newHistory.length > prevState.maxHistorySize) {
        newHistory.shift();
        return {
          ...prevState,
          history: newHistory,
          currentIndex: prevState.currentIndex
        };
      }
      
      return {
        ...prevState,
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback((): FormData | null => {
    if (!canUndo) return null;
    
    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex - 1
    }));
    
    return state.history[state.currentIndex - 1];
  }, [canUndo, state.currentIndex, state.history]);

  const redo = useCallback((): FormData | null => {
    if (!canRedo) return null;
    
    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex + 1
    }));
    
    return state.history[state.currentIndex + 1];
  }, [canRedo, state.currentIndex, state.history]);

  const clearHistory = useCallback(() => {
    setState(prevState => ({
      history: [prevState.history[prevState.currentIndex]],
      currentIndex: 0,
      maxHistorySize: prevState.maxHistorySize
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    clearHistory
  };
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

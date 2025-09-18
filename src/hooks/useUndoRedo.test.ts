import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "./useUndoRedo";

describe("useUndoRedo", () => {
  it("should initialize with the correct state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    expect(result.current.currentState).toEqual({ value: 1 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("should save a new state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.saveState({ value: 2 });
    });
    expect(result.current.currentState).toEqual({ value: 2 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("should undo to the previous state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.saveState({ value: 2 });
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.currentState).toEqual({ value: 1 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("should redo to the next state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.saveState({ value: 2 });
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.redo();
    });
    expect(result.current.currentState).toEqual({ value: 2 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("should not undo if there is no previous state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.undo();
    });
    expect(result.current.currentState).toEqual({ value: 1 });
    expect(result.current.canUndo).toBe(false);
  });

  it("should not redo if there is no next state", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.saveState({ value: 2 });
    });
    act(() => {
      result.current.redo();
    });
    expect(result.current.currentState).toEqual({ value: 2 });
    expect(result.current.canRedo).toBe(false);
  });

  it("should overwrite future states when a new state is saved", () => {
    const { result } = renderHook(() => useUndoRedo({ value: 1 }));
    act(() => {
      result.current.saveState({ value: 2 });
    });
    act(() => {
      result.current.saveState({ value: 3 });
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.currentState).toEqual({ value: 2 });
    act(() => {
      result.current.saveState({ value: 4 });
    });
    expect(result.current.currentState).toEqual({ value: 4 });
    expect(result.current.canRedo).toBe(false);
  });
});

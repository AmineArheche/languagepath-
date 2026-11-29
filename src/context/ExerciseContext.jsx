import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ExerciseContext = createContext(null);

export function ExerciseProvider({ children }) {
  // Current active exercise context:
  // { type, level, question, passage, options, userAnswer, correctAnswer, userDraft, attemptCount }
  const [exerciseContext, setExerciseContextState] = useState(null);
  const [activeHighlightSpans, setActiveHighlightSpans] = useState([]);

  // Ref to hold a text inserter callback (e.g. for inserting Redemittel into Schreiben textarea)
  const textInserterRef = useRef(null);

  /**
   * Register or update the active exercise context
   * @param {Object} contextData
   */
  const registerExerciseContext = useCallback((contextData) => {
    setExerciseContextState({
      type: "reading",
      level: "A1",
      question: "",
      passage: "",
      options: [],
      userAnswer: null,
      correctAnswer: null,
      userDraft: "",
      attemptCount: 0,
      ...contextData
    });
  }, []);

  /**
   * Update partial fields in the active exercise context
   */
  const updateExerciseContext = useCallback((partial) => {
    setExerciseContextState((prev) => {
      if (!prev) return partial;
      return { ...prev, ...partial };
    });
  }, []);

  /**
   * Clear active exercise context when leaving exercise module
   */
  const clearExerciseContext = useCallback(() => {
    setExerciseContextState(null);
    setActiveHighlightSpans([]);
  }, []);

  /**
   * Register callback to insert text into textarea at cursor
   */
  const registerTextInserter = useCallback((inserterFn) => {
    textInserterRef.current = inserterFn;
    return () => {
      textInserterRef.current = null;
    };
  }, []);

  /**
   * Trigger text insertion at cursor position
   */
  const insertTextAtCursor = useCallback((text) => {
    if (typeof textInserterRef.current === "function") {
      textInserterRef.current(text);
      return true;
    }
    // Fallback: copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(console.warn);
    }
    return false;
  }, []);

  /**
   * Trigger highlight spans in passage
   */
  const highlightPassageSpans = useCallback((spans) => {
    if (Array.isArray(spans)) {
      setActiveHighlightSpans(spans);
    } else if (spans) {
      setActiveHighlightSpans([spans]);
    } else {
      setActiveHighlightSpans([]);
    }
  }, []);

  return (
    <ExerciseContext.Provider
      value={{
        exerciseContext,
        registerExerciseContext,
        updateExerciseContext,
        clearExerciseContext,
        registerTextInserter,
        insertTextAtCursor,
        activeHighlightSpans,
        highlightPassageSpans
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercise() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error("useExercise must be used within an ExerciseProvider");
  }
  return context;
}

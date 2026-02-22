"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useScreenRecording, RecordingState } from "./useScreenRecording";

interface RecordingContextType {
  state: RecordingState;
  countdown: number;
  recordingTime: number;
  error: string | null;
  startCountdown: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  isIdle: boolean;
  isCountdown: boolean;
  isRecording: boolean;
  isProcessing: boolean;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const recording = useScreenRecording();
  
  return (
    <RecordingContext.Provider value={recording}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}

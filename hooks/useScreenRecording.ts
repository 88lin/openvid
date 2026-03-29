"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RecordingState, RecordingResult, VideoData } from "@/types";
import { clearAllThumbnailCache } from "@/lib/thumbnail-cache";

export type { RecordingState, RecordingResult, VideoData };

function generateVideoId(): string {
  return `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const dbName = "openvidDB";
    const storeName = "videos";
    const version = 2;

    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        const retryRequest = indexedDB.open(dbName, version + 1);
        retryRequest.onupgradeneeded = (e) => {
          const retryDb = (e.target as IDBOpenDBRequest).result;
          if (!retryDb.objectStoreNames.contains(storeName)) {
            retryDb.createObjectStore(storeName);
          }
        };
        retryRequest.onsuccess = () => resolve(retryRequest.result);
        retryRequest.onerror = () => reject(retryRequest.error);
      } else {
        resolve(db);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

async function saveVideoToIndexedDB(blob: Blob, duration: number): Promise<string> {
  try {
    await clearAllThumbnailCache();
  } catch (e) {
    console.warn("Failed to clear thumbnail cache:", e);
  }

  const videoId = generateVideoId();
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const storeName = "videos";
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const videoData = {
      blob,
      duration,
      videoId,
      timestamp: Date.now(),
    };

    const putRequest = store.put(videoData, "currentVideo");

    putRequest.onsuccess = () => {
      db.close();
      resolve(videoId);
    };

    putRequest.onerror = () => {
      db.close();
      reject(putRequest.error);
    };
  });
}

export async function loadVideoFromIndexedDB(): Promise<{ blob: Blob; duration: number; url: string; videoId: string; timestamp: number } | null> {
  try {
    const db = await getDB();
    const storeName = "videos";

    if (!db.objectStoreNames.contains(storeName)) {
      db.close();
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const getRequest = store.get("currentVideo");

      getRequest.onsuccess = () => {
        db.close();
        const data = getRequest.result;

        if (data) {
          const url = URL.createObjectURL(data.blob);
          const videoId = data.videoId || `vid_${data.timestamp || Date.now()}`;
          const timestamp = data.timestamp || Date.now();
          resolve({ blob: data.blob, duration: data.duration, url, videoId, timestamp });
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        db.close();
        reject(getRequest.error);
      };
    });
  } catch (error) {
    console.error("Error al cargar video desde la base de datos:", error);
    return null; 
  }
}

export async function deleteRecordedVideo(): Promise<void> {
  try {
    const db = await getDB();
    const storeName = "videos";

    if (!db.objectStoreNames.contains(storeName)) {
      db.close();
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete("currentVideo");

      deleteRequest.onsuccess = () => {
        db.close();
        resolve();
      };
      deleteRequest.onerror = () => {
        db.close();
        reject(deleteRequest.error);
      };
    });
  } catch (error) {
    throw error;
  }
}

const titles = {
  idle: "openvid - Crea tomas cinemáticas",
  countdown: (count: number) => `Grabando en ${count}...`,
  recording: "Grabando...",
  processing: "⏳ Procesando video...",
};

export function useScreenRecording() {
  const [state, setState] = useState<RecordingState>("idle");
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const originalTitleRef = useRef<string>("");
  const stateRef = useRef<RecordingState>("idle");
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setTitle = useCallback((title: string) => {
    if (typeof document === "undefined") return;
    document.title = title;
  }, []);

  const restoreOriginals = useCallback(() => {
    setTitle(originalTitleRef.current || titles.idle);
  }, [setTitle]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      originalTitleRef.current = document.title;
    }
  }, []);

  useEffect(() => {
    if (state === "idle") {
      restoreOriginals();
    } else if (state === "countdown") {
      setTitle(titles.countdown(countdown));
    } else if (state === "recording") {
      const timeStr = recordingTime.toString().padStart(2, '0');
      setTitle(`Grabando ${timeStr}s`);
    } else if (state === "processing") {
      setTitle(titles.processing);
    }
  }, [state, countdown, recordingTime, setTitle, restoreOriginals]);

  useEffect(() => {
    if (state === "recording") {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (state === "idle") {
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [state]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      const codecOptions = [
        { mimeType: "video/webm;codecs=vp9,opus" },
        { mimeType: "video/webm;codecs=vp8,opus" },
        { mimeType: "video/webm;codecs=vp9" },
        { mimeType: "video/webm;codecs=vp8" },
        { mimeType: "video/webm" },
      ];

      let mediaRecorder: MediaRecorder | null = null;

      for (const options of codecOptions) {
        try {
          if (MediaRecorder.isTypeSupported(options.mimeType)) {
            mediaRecorder = new MediaRecorder(stream, options);
            console.log(`Using codec: ${options.mimeType}`);
            break;
          }
        } catch (e) {
          console.warn(`Failed to create MediaRecorder with ${options.mimeType}:`, e);
        }
      }

      if (!mediaRecorder) {
        try {
          mediaRecorder = new MediaRecorder(stream);
          console.log("Using default MediaRecorder settings");
        } catch {
          throw new Error("No se pudo crear MediaRecorder con ninguna configuración");
        }
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Error durante la grabación");
        setState("idle");
        restoreOriginals();
      };

      mediaRecorder.onstop = async () => {
        setState("processing");

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const duration = (Date.now() - startTimeRef.current) / 1000;

        try {
          await saveVideoToIndexedDB(blob, duration);
          router.push("/editor");
        } catch (error) {
          console.error("Error al guardar video:", error);
          setError("Error al procesar el video");
          setState("idle");
          restoreOriginals();
        }
      };

      try {
        mediaRecorder.start(1000);
        setState("recording");
      } catch (e) {
        console.error("Error starting MediaRecorder:", e);
        throw new Error("No se pudo iniciar la grabación");
      }

    } catch (err) {
      console.error("Error al iniciar grabación:", err);
      setError(err instanceof Error ? err.message : "No se pudo iniciar la grabación");
      setState("idle");
      restoreOriginals();
    }
  }, [router, restoreOriginals]);

  const startCountdown = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      stream.getVideoTracks()[0].onended = () => {
        if (stateRef.current === "recording") {
          stopRecording();
        } else {
          setState("idle");
          restoreOriginals();
        }
      };

      setState("countdown");
      setCountdown(4);

      let count = 4;
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);

        if (count <= 0) {
          clearInterval(countdownInterval);
          startRecording(stream);
        }
      }, 1000);

    } catch (err) {
      console.error("Error al iniciar captura:", err);
      setError("No se pudo iniciar la captura de pantalla");
      setState("idle");
      restoreOriginals();
    }
  }, [restoreOriginals, stopRecording, startRecording]);

  const cancelRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    setState("idle");
    restoreOriginals();
  }, [restoreOriginals]);

  useEffect(() => {
    if (recordingTime >= 60 && state === "recording") {
      stopRecording();
    }
  }, [recordingTime, state, stopRecording]);

  return {
    state,
    countdown,
    recordingTime,
    error,
    startCountdown,
    stopRecording,
    cancelRecording,
    isIdle: state === "idle",
    isCountdown: state === "countdown",
    isRecording: state === "recording",
    isProcessing: state === "processing",
  };
}
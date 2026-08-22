"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

interface PlaybackTimeContextValue {
    currentTime: number;
}

const PlaybackTimeContext = createContext<PlaybackTimeContextValue>({
    currentTime: 0,
});

/**
 * Provides `currentTime` to descendants without forcing parent components
 * (like ControlPanel) to re-render on every playback tick (~30fps).
 *
 * Only components that actually need the current playback time should call
 * `usePlaybackTime()`. This isolates the 30fps re-renders to those leaves
 * instead of re-rendering the entire editor subtree.
 */
export function PlaybackTimeProvider({
    children,
    currentTime,
}: {
    children: ReactNode;
    currentTime: number;
}) {
    const value = useMemo(() => ({ currentTime }), [currentTime]);
    return (
        <PlaybackTimeContext.Provider value={value}>
            {children}
        </PlaybackTimeContext.Provider>
    );
}

export function usePlaybackTime(): PlaybackTimeContextValue {
    return useContext(PlaybackTimeContext);
}

export interface VideoTrackClip {
    id: string;
    libraryVideoId: string;
    name: string;
    startTime: number;
    duration: number;
    trimStart: number;
    trimEnd: number;
    thumbnailUrl?: string;
    hasCamera?: boolean;
    width?: number;
    height?: number;
}

export const MIN_CLIP_DURATION = 0.1;

export interface SplitClipResult {
    updatedClip: VideoTrackClip;
    newClip: VideoTrackClip;
}

export function calculateTotalDuration(clips: VideoTrackClip[]): number {
    if (clips.length === 0) return 0;
    const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
    const lastClip = sorted[sorted.length - 1];
    return lastClip.startTime + (lastClip.trimEnd - lastClip.trimStart);
}

export function findNextClipPosition(clips: VideoTrackClip[]): number {
    if (clips.length === 0) return 0;
    const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
    const lastClip = sorted[sorted.length - 1];
    return lastClip.startTime + (lastClip.trimEnd - lastClip.trimStart);
}

export function getClipAtTime(clips: VideoTrackClip[], time: number): VideoTrackClip | null {
    return clips.find(clip => {
        const clipEnd = clip.startTime + (clip.trimEnd - clip.trimStart);
        return time >= clip.startTime && time < clipEnd;
    }) || null;
}

export function splitClipAtTime(clip: VideoTrackClip, timelineTime: number): SplitClipResult | null {
    const clipDuration = clip.trimEnd - clip.trimStart;
    const clipEnd = clip.startTime + clipDuration;

    if (
        timelineTime <= clip.startTime + MIN_CLIP_DURATION ||
        timelineTime >= clipEnd - MIN_CLIP_DURATION
    ) {
        return null;
    }

    const splitPointInSource = clip.trimStart + (timelineTime - clip.startTime);

    const updatedClip: VideoTrackClip = {
        ...clip,
        trimEnd: splitPointInSource,
    };

    const newClip: VideoTrackClip = {
        ...clip,
        id: crypto.randomUUID(),
        startTime: timelineTime,
        trimStart: splitPointInSource,
        trimEnd: clip.trimEnd,
    };

    return { updatedClip, newClip };
}

// Reads the real media duration from metadata. Returns 0 if it can't be read.
// Used to clamp clip durations because recordings store a wall-clock duration
// that can overshoot the real length after WebM→MP4 conversion, which freezes
// multi-clip playback (currentTime never reaches trimEnd).
export async function probeMediaDuration(url: string): Promise<number> {
    return new Promise((resolve) => {
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.onloadedmetadata = () => resolve(Number.isFinite(probe.duration) && probe.duration > 0 ? probe.duration : 0);
        probe.onerror = () => resolve(0);
        probe.src = url;
    });
}

export function clampClipToRealDuration(clip: VideoTrackClip, realDuration: number): VideoTrackClip {
    if (realDuration > 0 && realDuration < clip.trimEnd) {
        const clamped = Math.min(clip.trimEnd, realDuration);
        return { ...clip, duration: Math.min(clip.duration, clamped), trimEnd: clamped };
    }
    return clip;
}
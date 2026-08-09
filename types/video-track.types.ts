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
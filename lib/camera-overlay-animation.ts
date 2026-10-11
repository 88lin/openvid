import type { CameraConfig } from "@/types/camera.types";

export interface CameraOverlayKeyframe {
    id: string;
    time: number;
    config: CameraConfig;
}

export function mergeCameraConfig(
    config: CameraConfig,
    updates: Partial<CameraConfig>,
): CameraConfig {
    return {
        ...config,
        ...updates,
        position: updates.position
            ? { ...config.position, ...updates.position }
            : config.position,
        threeD: updates.threeD
            ? { ...config.threeD, ...updates.threeD }
            : config.threeD,
    };
}

export function sampleCameraOverlayKeyframes(
    fallback: CameraConfig | null,
    keyframes: CameraOverlayKeyframe[],
    time: number,
): CameraConfig | null {
    if (keyframes.length === 0) return fallback;

    const sorted = [...keyframes]
        .filter((keyframe) => Number.isFinite(keyframe.time))
        .sort((a, b) => a.time - b.time);
    if (sorted.length === 0) return fallback;
    if (time <= sorted[0].time) return sorted[0].config;

    const last = sorted[sorted.length - 1];
    if (time >= last.time) return last.config;

    const rightIndex = sorted.findIndex((keyframe) => keyframe.time >= time);
    const left = sorted[rightIndex - 1];
    const right = sorted[rightIndex];
    const span = right.time - left.time;
    if (span <= 0) return right.config;

    const rawProgress = Math.max(0, Math.min(1, (time - left.time) / span));
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const interpolate = (from: number, to: number) => from + (to - from) * progress;
    const left3D = left.config.threeD;
    const right3D = right.config.threeD;

    return {
        ...left.config,
        size: interpolate(left.config.size, right.config.size),
        position: {
            x: interpolate(left.config.position.x, right.config.position.x),
            y: interpolate(left.config.position.y, right.config.position.y),
        },
        zoom: interpolate(left.config.zoom ?? 1, right.config.zoom ?? 1),
        threeD: left3D && right3D
            ? {
                ...left3D,
                rotationX: interpolate(left3D.rotationX, right3D.rotationX),
                rotationY: interpolate(left3D.rotationY, right3D.rotationY),
                perspective: interpolate(left3D.perspective, right3D.perspective),
            }
            : left3D ?? right3D,
    };
}

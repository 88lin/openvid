"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { VideoTrackClip, TrimEdge } from "@/types/video-track.types";
import { MIN_CLIP_DURATION, getClipTrimInfo } from "@/types/video-track.types";
import { Icon } from "@iconify/react";
import type { MotionValue } from "framer-motion";
import { collectSnapPoints, findSnap } from "@/lib/timeline-snapping";
import { useTranslations } from "next-intl";

interface VideoClipTrackItemProps {
    clip: VideoTrackClip;
    isSelected: boolean;
    contentWidth: number;
    totalDuration: number;
    otherClips: VideoTrackClip[];
    currentTime?: number;
    onSelect: () => void;
    onUpdate: (updates: Partial<VideoTrackClip>) => void;
    onDelete?: () => void;
    onDragStateChange?: (isDragging: boolean) => void;
    onReorder?: (draggedId: string, targetId: string, placeAfter: boolean) => void;
    onRestoreTrim?: (edge: TrimEdge) => void;
    zoomLevel: number;
    playheadX: MotionValue<number>;
    speed?: number;
    activeClipLeftX?: MotionValue<number>;
    activeClipRightX?: MotionValue<number>;
    autoScrollDeltaX?: MotionValue<number>;
}

interface ResizeSession {
    x: number;
    width: number;
    trimStart: number;
    trimEnd: number;
    duration: number;
    startTime: number;
    pps: number;
    scrollComp: number;
    lastOffset: number;
    pending: { trimStart: number; trimEnd: number } | null;
}

export function VideoClipTrackItem({
    clip,
    isSelected,
    contentWidth,
    totalDuration,
    otherClips,
    currentTime = 0,
    onSelect,
    onUpdate,
    onDragStateChange,
    onReorder,
    onRestoreTrim,
    zoomLevel,
    playheadX,
    speed = 1,
    activeClipLeftX,
    activeClipRightX,
    autoScrollDeltaX
}: VideoClipTrackItemProps) {
    const t = useTranslations("timeline");
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<ResizeSession | null>(null);

    const clipX = useMotionValue(0);
    const clipWidth = useMotionValue(0);

    const timeToPixels = useCallback((time: number) => {
        if (totalDuration === 0) return 0;
        return (time / totalDuration) * contentWidth;
    }, [totalDuration, contentWidth]);

    const clipDuration = clip.trimEnd - clip.trimStart;

    const pixelsToTime = useCallback((pixels: number) => {
        if (contentWidth === 0) return 0;
        return (pixels / contentWidth) * totalDuration;
    }, [contentWidth, totalDuration]);

    const initialLeft = timeToPixels(clip.startTime);
    const initialWidth = timeToPixels(clipDuration);

    const progressWidth = useTransform(
        playheadX,
        (px) => {
            const clipStartPx = timeToPixels(clip.startTime);
            const clipEndPx = timeToPixels(clip.startTime + clipDuration);
            if (px <= clipStartPx) return 0;
            if (px >= clipEndPx) return timeToPixels(clipDuration);
            return px - clipStartPx;
        }
    );

    useEffect(() => {
        if (!isDragging && !isResizing) {
            clipX.set(initialLeft);
            clipWidth.set(initialWidth);
        }
    }, [initialLeft, initialWidth, isDragging, isResizing, clipX, clipWidth]);

    const applyDragDelta = useCallback((deltaX: number) => {
        if (contentWidth === 0 || totalDuration === 0) return;
        let newX = clipX.get() + deltaX;
        const minX = 0;
        const maxX = timeToPixels(totalDuration - clipDuration);
        newX = Math.max(minX, Math.min(maxX, newX));
        clipX.set(newX);
        activeClipLeftX?.set(newX);
        activeClipRightX?.set(newX + clipWidth.get());
    }, [contentWidth, totalDuration, clipX, clipWidth, clipDuration, timeToPixels, activeClipLeftX, activeClipRightX]);

    const handleDrag = useCallback((_e: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
        applyDragDelta(info.delta.x);
    }, [applyDragDelta]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        onDragStateChange?.(true);
        onSelect();
    }, [onDragStateChange, onSelect]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        onDragStateChange?.(false);

        const draggedCenterPx = clipX.get() + clipWidth.get() / 2;
        const target = otherClips.find(other => {
            const otherStartPx = timeToPixels(other.startTime);
            const otherDur = other.trimEnd - other.trimStart;
            const otherEndPx = timeToPixels(other.startTime + otherDur);
            return draggedCenterPx >= otherStartPx && draggedCenterPx <= otherEndPx;
        });

        if (target && onReorder) {
            const targetCenterPx = timeToPixels(target.startTime) + timeToPixels(target.trimEnd - target.trimStart) / 2;
            const placeAfter = draggedCenterPx > targetCenterPx;
            onReorder(clip.id, target.id, placeAfter);
        } else {
            let finalX = clipX.get();
            const snapThresholdPx = 8;
            const finalStartTime = pixelsToTime(finalX);
            const finalEndTime = finalStartTime + clipDuration;
            const clipEdges = otherClips.map(c => ({
                start: c.startTime,
                end: c.startTime + (c.trimEnd - c.trimStart),
            }));
            const snapPoints = collectSnapPoints({ clipEdges, playhead: currentTime });
            const snapStart = findSnap(finalStartTime, snapPoints, timeToPixels, snapThresholdPx);
            if (snapStart.offsetPx !== 0) {
                finalX = timeToPixels(snapStart.time);
            } else {
                const snapEnd = findSnap(finalEndTime, snapPoints, timeToPixels, snapThresholdPx);
                if (snapEnd.offsetPx !== 0) {
                    finalX = timeToPixels(snapEnd.time - clipDuration);
                }
            }
            onUpdate({ startTime: Math.max(0, pixelsToTime(finalX)) });
        }
    }, [clipX, clipWidth, pixelsToTime, onUpdate, onDragStateChange, otherClips, timeToPixels, onReorder, clip.id, clipDuration, currentTime]);

    const applyResize = useCallback((handle: 'start' | 'end') => {
        const s = resizeRef.current;
        if (!s || s.pps <= 0) return;

        const dtRaw = (s.lastOffset + s.scrollComp) / s.pps;
        const len = s.trimEnd - s.trimStart;

        if (handle === 'start') {
            const dt = Math.max(-s.trimStart, Math.min(len - MIN_CLIP_DURATION, dtRaw));
            clipX.set(Math.max(0, s.x + dt * s.pps));
            clipWidth.set(s.width - dt * s.pps);
            s.pending = { trimStart: s.trimStart + dt, trimEnd: s.trimEnd };
        } else {
            const minDt = MIN_CLIP_DURATION - len;
            const maxDt = s.duration - s.trimEnd; // hasta el final del archivo fuente
            let dt = Math.max(minDt, Math.min(maxDt, dtRaw));

            const edgeTime = s.startTime + len + dt;
            const snap = findSnap(edgeTime, collectSnapPoints({ playhead: currentTime, zero: false }), timeToPixels, 8);
            if (snap.offsetPx !== 0) {
                dt = Math.max(minDt, Math.min(maxDt, snap.time - s.startTime - len));
            }

            clipWidth.set(s.width + dt * s.pps);
            s.pending = { trimStart: s.trimStart, trimEnd: s.trimEnd + dt };
        }

        activeClipLeftX?.set(clipX.get());
        activeClipRightX?.set(clipX.get() + clipWidth.get());
    }, [clipX, clipWidth, currentTime, timeToPixels, activeClipLeftX, activeClipRightX]);

    const beginResize = useCallback((handle: 'start' | 'end') => {
        resizeRef.current = {
            x: clipX.get(),
            width: clipWidth.get(),
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd,
            duration: clip.duration,
            startTime: clip.startTime,
            pps: totalDuration > 0 ? contentWidth / totalDuration : 0,
            scrollComp: 0,
            lastOffset: 0,
            pending: null,
        };
        setIsResizing(handle);
        onDragStateChange?.(true);
        onSelect();
    }, [clip.trimStart, clip.trimEnd, clip.duration, clip.startTime, clipX, clipWidth, contentWidth, totalDuration, onDragStateChange, onSelect]);

    const dragResize = useCallback((handle: 'start' | 'end', info: { offset: { x: number } }) => {
        const s = resizeRef.current;
        if (!s) return;
        s.lastOffset = info.offset.x;
        applyResize(handle);
    }, [applyResize]);

    const endResize = useCallback(() => {
        const s = resizeRef.current;
        resizeRef.current = null;
        setIsResizing(null);
        onDragStateChange?.(false);
        const p = s?.pending;
        if (!p) return;
        onUpdate({ trimStart: p.trimStart, trimEnd: p.trimEnd });
    }, [onDragStateChange, onUpdate]);

    const lastAutoScrollRef = useRef(0);
    useEffect(() => {
        if (!autoScrollDeltaX) return;
        lastAutoScrollRef.current = autoScrollDeltaX.get();
        return autoScrollDeltaX.on('change', (latest) => {
            const delta = latest - lastAutoScrollRef.current;
            lastAutoScrollRef.current = latest;
            if (delta === 0) return;
            if (isDragging) {
                applyDragDelta(delta);
            } else if (isResizing && resizeRef.current) {
                resizeRef.current.scrollComp += delta;
                applyResize(isResizing);
            }
        });
    }, [autoScrollDeltaX, isDragging, isResizing, applyDragDelta, applyResize]);

    const isInteracting = isDragging || isResizing !== null;
    const { head, tail, isTrimmed } = getClipTrimInfo(clip);
    const showRestore = isTrimmed && (isSelected || isHovered) && !isInteracting && initialWidth > 120;

    const HATCH = 'repeating-linear-gradient(135deg, rgba(74,222,128,0.6) 0 2px, transparent 2px 5px)';
    const startTitle = head > 0.01
        ? t("trimmedStart", { seconds: head.toFixed(1) })
        : t("trimStartHint");
    const endTitle = tail > 0.01
        ? t("trimmedEnd", { seconds: tail.toFixed(1) })
        : t("trimEndHint");

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    return (
        <motion.div
            ref={containerRef}
            className={`absolute top-0 bottom-0 rounded-md cursor-grab active:cursor-grabbing overflow-hidden group transition-colors duration-200 ${isInteracting ? 'z-50' : isSelected ? 'z-10' : 'z-0'
                } ${isSelected ? 'ring-[1px] ring-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.3)]' : ''
                } ${isHovered ? 'bg-emerald-200 dark:bg-[#1c3525]' : 'bg-emerald-100 dark:bg-[#182e20]'}`}
            style={{
                x: clipX,
                width: clipWidth,
                border: isSelected
                    ? '1px solid rgba(74, 222, 128, 0.8)'
                    : isHovered
                        ? '1px solid rgba(52, 168, 83, 0.65)'
                        : '1px solid rgba(52, 168, 83, 0.4)',
            }}
            drag="x"
            dragConstraints={false}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 flex items-center overflow-hidden">
                <div className="flex h-full w-full">
                    {Array.from({ length: Math.max(1, Math.ceil(zoomLevel * 3)) }).map((_, i) => (
                        <div
                            key={i}
                            className="h-full flex-1 border-r border-[#34A853]/10 last:border-r-0"
                            style={{
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(20, 80, 40, 0.1) 50%, rgba(52, 168, 83, 0.1) 100%)',
                                boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.05)'
                            }}
                        />
                    ))}
                </div>
            </div>

            <motion.div
                className="absolute top-0 bottom-0 left-0 border-r-2 border-[#4ade80] pointer-events-none z-5"
                style={{
                    width: progressWidth,
                    background: `linear-gradient(to bottom, rgba(52, 168, 83, 0.9) 0%, rgba(34, 139, 34, 1) 50%, rgba(20, 80, 40, 1) 100%)`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
            />

            {head > 0.01 && (
                <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none z-10" style={{ backgroundImage: HATCH }} />
            )}
            {tail > 0.01 && (
                <div className="absolute right-0 top-0 bottom-0 w-2 pointer-events-none z-10" style={{ backgroundImage: HATCH }} />
            )}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className={`flex items-center gap-2 text-[11px] font-medium drop-shadow-sm transition-colors duration-200 ${isHovered ? 'text-emerald-700 dark:text-emerald-300' : 'text-emerald-700 dark:text-emerald-400'
                    }`}>
                    <Icon icon="solar:videocamera-record-bold" width="12" className="opacity-70" />
                    <span className="truncate max-w-30">{clip.name}</span>
                    <span className={`font-mono text-[11px] transition-colors duration-200 ${isHovered ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-emerald-700/60 dark:text-emerald-400/60'
                        }`}>
                        {formatDuration(clipDuration / speed)}
                    </span>
                </span>
            </div>

            {showRestore && (
                <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] bg-black/50 text-emerald-100 hover:bg-black/70 transition-colors"
                    title={t("restoreTitle")}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRestoreTrim?.('both');
                    }}
                >
                    <Icon icon="solar:restart-bold" width="11" />
                    {t("restore")}
                </button>
            )}

            <motion.div
                title={startTitle}
                className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 group/trim flex items-center justify-center"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={(_e, info) => dragResize('start', info)}
                onDragStart={() => beginResize('start')}
                onDragEnd={endResize}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (head > 0.01) onRestoreTrim?.('start');
                }}
            >
                <div className={`w-1.5 h-8 rounded-full transition-all ${isResizing === 'start' ? 'bg-[#4ade80] scale-110' : 'bg-[#34A853] group-hover/trim:bg-[#4ade80]'
                    }`} />
            </motion.div>

            <motion.div
                title={endTitle}
                className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 group/trim flex items-center justify-end"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={(_e, info) => dragResize('end', info)}
                onDragStart={() => beginResize('end')}
                onDragEnd={endResize}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (tail > 0.01) onRestoreTrim?.('end');
                }}
            >
                <div className={`w-1.5 h-8 rounded-full transition-all ${isResizing === 'end' ? 'bg-[#4ade80] scale-110' : 'bg-[#34A853] group-hover/trim:bg-[#4ade80]'
                    }`} />
            </motion.div>
        </motion.div>
    );
}
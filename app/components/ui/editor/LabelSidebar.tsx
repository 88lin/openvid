"use client";

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { ELEMENT_ROW_HEIGHT } from '@/types/timeline.types';

interface LabelSidebarProps {
    audioLaneCount?: number;
    motionTracksCount?: number;
    elementLaneCount?: number;
    showMovementRow?: boolean;
    showCameraTrack?: boolean;
    cameraAddLabel?: string;
    onAddCameraKeyframe?: () => void;
}

export default function LabelSidebar({
    audioLaneCount = 0,
    motionTracksCount = 0,
    elementLaneCount = 0,
    showMovementRow = false,
    showCameraTrack = false,
    cameraAddLabel,
    onAddCameraKeyframe,
}: LabelSidebarProps) {
    const t = useTranslations('labelSidebar');

    return (
        <div className="sticky left-0 w-14 shrink-0 border-r border-border flex flex-col bg-background z-30">
            <div className="h-5.5 border-b border-border" />

            <div className="h-14 flex-1 flex items-center px-3">
                <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                    {t('video')}
                </span>
            </div>

            {showCameraTrack && (
                <div
                    className="flex items-center justify-center border-t border-border/70 bg-muted/20"
                    style={{ height: 34 }}
                    role="group"
                    title={t('camera')}
                    aria-label={t('camera')}
                >
                    <button
                        type="button"
                        onClick={onAddCameraKeyframe}
                        disabled={!onAddCameraKeyframe}
                        title={cameraAddLabel}
                        aria-label={cameraAddLabel ?? t('camera')}
                        className="relative flex size-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Icon icon="mdi:camera" width="14" aria-hidden="true" />
                        <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground" aria-hidden="true">
                            <Icon icon="lucide:plus" width="9" />
                        </span>
                    </button>
                </div>
            )}

            <div
                className="flex items-center px-3 border-t border-border"
                style={{ height: ELEMENT_ROW_HEIGHT }}
            >
                <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                    {t('zoom')}
                </span>
            </div>

            {showMovementRow && (
                <div
                    className="flex items-center px-3 border-t border-dashed border-emerald-500/20 bg-emerald-500/5"
                    style={{ height: ELEMENT_ROW_HEIGHT }}
                >
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-emerald-600/70 dark:text-emerald-400/70">
                        {t('movement')}
                    </span>
                </div>
            )}

            {elementLaneCount > 0 && (
                <div
                    className="flex items-center px-3 border-t border-border bg-muted/40"
                    style={{ height: elementLaneCount * ELEMENT_ROW_HEIGHT }}
                >
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('elements')}
                    </span>
                </div>
            )}

            {audioLaneCount > 0 && (
                <div
                    className="flex items-center px-3 border-t border-border bg-muted/40"
                    style={{ height: audioLaneCount * ELEMENT_ROW_HEIGHT }}
                >
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('audio')}
                    </span>
                </div>
            )}

            {motionTracksCount > 0 && (
                <div
                    className="flex items-center px-3 border-t border-border bg-muted/40"
                    style={{ height: ELEMENT_ROW_HEIGHT }}
                >
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('motion')}
                    </span>
                </div>
            )}
        </div>
    );
}
"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { SliderControl } from "../../../../components/ui/SliderControl";
import { HANDLE_R, ImageDeviceId, PAD_H, X_HALF, Y_HALF } from "@/types/mockup.types";
import { Button } from "@/components/ui/button";
import { DetailPageHeader } from "@/components/ui/DetailHeaderMenu";
import { Position3DPresetsEditor } from "@/components/ui/Position3DPresetsEditor";
import { useMockup3dContext } from "@/app/contexts/Mockup3dContext";
import {
    ENVIRONMENT_OPTIONS,
    hasMockupCameraTourSpace,
    MOCKUP_CAMERA_PRESETS,
    type CameraNavigationMode,
    type EnvironmentPreset,
    type MockupCameraConfig,
    type MockupCameraKeyframe,
    type MockupCameraPreset,
} from "@/lib/viewer-controls3d";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { TooltipAction } from "@/components/ui/tooltip-action";

function PositionPad({
    x,
    y,
    onChangeX,
    onChangeY,
    onDragStart,
    backgroundUrl,
    backgroundColorCss,
}: {
    x: number;
    y: number;
    onChangeX: (v: number) => void;
    onChangeY: (v: number) => void;
    onDragStart?: () => void;
    backgroundUrl?: string | null;
    backgroundColorCss?: string | null;
}) {
    const padRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const rectCache = useRef<DOMRect | null>(null);
    const [isDraggingState, setIsDraggingState] = useState(false);

    const cx = Math.max(-X_HALF, Math.min(X_HALF, x));
    const cy = Math.max(-Y_HALF, Math.min(Y_HALF, y));
    const pctX = (cx + X_HALF) / (X_HALF * 2);
    const hy = ((cy + Y_HALF) / (Y_HALF * 2)) * PAD_H;

    const fromEvent = useCallback(
        (e: React.PointerEvent) => {
            if (!rectCache.current) return;
            const rect = rectCache.current;
            const currentWidth = rect.width;
            const rx = Math.max(0, Math.min(currentWidth, e.clientX - rect.left));
            const ry = Math.max(0, Math.min(PAD_H, e.clientY - rect.top));
            onChangeX(Math.round((rx / currentWidth) * X_HALF * 2 - X_HALF));
            onChangeY(Math.round((ry / PAD_H) * Y_HALF * 2 - Y_HALF));
        },
        [onChangeX, onChangeY]
    );

    const bgLayerStyle: React.CSSProperties = backgroundUrl
        ? {
            backgroundImage: `url('${backgroundUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }
        : backgroundColorCss
            ? backgroundColorCss.startsWith("#") || backgroundColorCss.startsWith("rgb")
                ? { backgroundColor: backgroundColorCss }
                : {
                    backgroundImage: backgroundColorCss,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }
            : {};

    return (
        <div className="relative group w-full cursor-default">
            <div
                ref={padRef}
                className={`relative w-full rounded-[14px] overflow-hidden select-none border shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] transition-all duration-200 ${isDraggingState
                        ? "border-cyan-500/40 ring-1 ring-cyan-500/20"
                        : "border-border"
                    }`}
                style={{ height: PAD_H }}
                onPointerDown={(e) => {
                    dragging.current = true;
                    setIsDraggingState(true);
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                    if (padRef.current) {
                        rectCache.current = padRef.current.getBoundingClientRect();
                    }
                    onDragStart?.();
                    fromEvent(e);
                }}
                onPointerMove={(e) => {
                    if (dragging.current) {
                        fromEvent(e);
                    }
                }}
                onPointerUp={() => {
                    dragging.current = false;
                    setIsDraggingState(false);
                    rectCache.current = null;
                }}
            >
                <div className="absolute inset-0 pointer-events-none" style={bgLayerStyle} />
                <div className="absolute inset-0 pointer-events-none bg-black/40" />
                {isDraggingState && (
                    <div className="absolute inset-0 pointer-events-none rounded-[14px] ring-2 ring-cyan-400/30 animate-pulse" />
                )}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] bg-size-[14px_14px]" />
                <div
                    className="absolute top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent -translate-x-1/2"
                    style={{ left: "50%" }}
                />
                <div
                    className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent -translate-y-1/2"
                    style={{ top: "50%" }}
                />
                <div
                    className="absolute pointer-events-none bg-white/10 transition-opacity -translate-x-1/2"
                    style={{ left: `${pctX * 100}%`, top: 0, bottom: 0, width: "1px" }}
                />
                <div
                    className="absolute pointer-events-none bg-white/10 transition-opacity -translate-y-1/2"
                    style={{ top: hy, left: 0, right: 0, height: "1px" }}
                />
                <div
                    className={`absolute bg-white border border-white/40 rounded-full shadow-[0_0_20px_4px_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.6)] mix-blend-screen flex items-center justify-center pointer-events-auto transition-transform duration-75`}
                    style={{
                        width: HANDLE_R * 3,
                        height: HANDLE_R * 3,
                        left: `${pctX * 100}%`,
                        top: hy,
                        transform: `translate(-50%, -50%) ${isDraggingState ? "scale(1.25)" : "scale(1)"
                            }`,
                        cursor: isDraggingState ? "grabbing" : "grab",
                    }}
                />
            </div>
        </div>
    );
}

function CameraTargetPad({
    x,
    y,
    range,
    onChange,
    label,
    hint,
    backgroundUrl,
    backgroundColorCss,
    presets,
    onApplyPreset,
    reviewGuides,
    onToggleReviewGuide,
}: {
    x: number;
    y: number;
    range: number;
    onChange: (x: number, y: number) => void;
    label: string;
    hint: string;
    backgroundUrl?: string | null;
    backgroundColorCss?: string | null;
    presets: MockupCameraPreset[];
    onApplyPreset?: (preset: MockupCameraPreset) => void;
    reviewGuides: { thirds: boolean; center: boolean; safeArea: boolean };
    onToggleReviewGuide: (guide: keyof typeof reviewGuides) => void;
}) {
    const t = useTranslations("mockupMenu");
    const padRef = useRef<HTMLDivElement>(null);
    const dragPointerId = useRef<number | null>(null);
    const rectCache = useRef<DOMRect | null>(null);
    const positionX = Math.max(-range, Math.min(range, x));
    const positionY = Math.max(-range, Math.min(range, y));
    const left = ((positionX / range + 1) / 2) * 100;
    const top = ((1 - positionY / range) / 2) * 100;
    const backgroundStyle: React.CSSProperties = backgroundUrl
        ? {
            backgroundImage: `url('${backgroundUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : backgroundColorCss
            ? backgroundColorCss.startsWith("#") || backgroundColorCss.startsWith("rgb")
                ? { backgroundColor: backgroundColorCss }
                : { backgroundImage: backgroundColorCss, backgroundSize: "cover", backgroundPosition: "center" }
            : {};

    const updateFromPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const rect = rectCache.current;
        if (!rect) return;
        const normalizedX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const normalizedY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        onChange(
            (normalizedX * 2 - 1) * range,
            (1 - normalizedY * 2) * range,
        );
    }, [onChange, range]);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                <TooltipAction label={hint} side="right">
                    <button
                        type="button"
                        aria-label={hint}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Icon icon="lucide:circle-help" width="13" aria-hidden="true" />
                    </button>
                </TooltipAction>
            </div>
            <div
                ref={padRef}
                role="group"
                tabIndex={0}
                aria-label={`${label}, X ${positionX.toFixed(2)}, Y ${positionY.toFixed(2)}`}
                onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    rectCache.current = padRef.current?.getBoundingClientRect() ?? null;
                    dragPointerId.current = event.pointerId;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updateFromPointer(event);
                }}
                onPointerMove={(event) => {
                    if (dragPointerId.current === event.pointerId) updateFromPointer(event);
                }}
                onPointerUp={(event) => {
                    if (dragPointerId.current !== event.pointerId) return;
                    dragPointerId.current = null;
                    rectCache.current = null;
                }}
                onPointerCancel={() => {
                    dragPointerId.current = null;
                    rectCache.current = null;
                }}
                onKeyDown={(event) => {
                    const step = event.shiftKey ? range / 5 : range / 20;
                    let nextX = positionX;
                    let nextY = positionY;
                    if (event.key === "ArrowLeft") nextX -= step;
                    else if (event.key === "ArrowRight") nextX += step;
                    else if (event.key === "ArrowUp") nextY += step;
                    else if (event.key === "ArrowDown") nextY -= step;
                    else if (event.key === "Home") {
                        nextX = 0;
                        nextY = 0;
                    } else return;
                    event.preventDefault();
                    onChange(
                        Math.max(-range, Math.min(range, nextX)),
                        Math.max(-range, Math.min(range, nextY)),
                    );
                }}
                className={`group relative h-28 touch-none select-none overflow-hidden rounded-xl border border-border shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary ${!backgroundUrl && !backgroundColorCss ? "bg-gradient-to-br from-cyan-500/35 via-emerald-500/25 to-violet-500/35" : ""}`}
                style={backgroundStyle}
            >
                <div className="pointer-events-none absolute inset-0 bg-black/20" />
                <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:25%_25%]" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
                <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
                <span className="pointer-events-none absolute left-2 top-1.5 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[9px] font-medium text-white/85">
                    X {positionX.toFixed(2)} · Y {positionY.toFixed(2)}
                </span>
                <span
                    className="pointer-events-none absolute z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 shadow-[0_0_12px_3px_rgba(255,255,255,0.45)] transition-[left,top] duration-75 group-active:scale-110"
                    style={{ left: `${left}%`, top: `${top}%` }}
                >
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </span>
            </div>
            <div className="flex items-center justify-between gap-1 rounded-b-xl border-x border-b border-border bg-muted/30 px-1.5 py-1">
                {presets.length > 0 && (
                    <>
                        <div className="flex items-center gap-0.5" role="group" aria-label={t("cameraPresets")}>
                            {presets.map((preset) => (
                                <TooltipAction key={preset.id} label={t(`cameraPreset.${preset.id}`)}>
                                    <button
                                        type="button"
                                        onClick={() => onApplyPreset?.(preset)}
                                        aria-label={t(`cameraPreset.${preset.id}`)}
                                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <Icon icon={preset.icon} width="15" aria-hidden="true" />
                                    </button>
                                </TooltipAction>
                            ))}
                        </div>
                        <span className="h-5 w-px bg-border" aria-hidden="true" />
                    </>
                )}
                <div className="flex items-center gap-0.5" role="group" aria-label={t("cameraReviewGuides.title")}>
                    {([
                        ["thirds", "mdi:grid"],
                        ["center", "mdi:crosshairs"],
                        ["safeArea", "mdi:crop-free"],
                    ] as const).map(([guide, icon]) => (
                        <TooltipAction key={guide} label={t(`cameraReviewGuides.${guide}`)}>
                            <button
                                type="button"
                                onClick={() => onToggleReviewGuide(guide)}
                                aria-label={t(`cameraReviewGuides.${guide}`)}
                                aria-pressed={reviewGuides[guide]}
                                className={`flex size-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    reviewGuides[guide]
                                        ? "bg-primary/15 text-primary"
                                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                                }`}
                            >
                                <Icon icon={icon} width="14" aria-hidden="true" />
                            </button>
                        </TooltipAction>
                    ))}
                </div>
            </div>
        </div>
    );
}

export interface ActiveDeviceTpl {
    id: ImageDeviceId;
    title: string;
    accentColor: string;
    icon: string;
    modelUrl: string;
    posterUrl?: string;
}

export interface Mockup3dMenuProps {
    activeDeviceTpl: ActiveDeviceTpl | null;
    imagePhoneDevice: string;
    isLaptop: boolean;
    imagePhoneScale: number;
    setImagePhoneScale: (v: number) => void;
    imagePhoneOpening: number;
    setImagePhoneOpening: (v: number) => void;
    imagePhoneShadow: number;
    setImagePhoneShadow: (v: number) => void;
    setImagePhoneShadowColor: (v: string) => void;
    imagePhoneX: number;
    setImagePhoneX: (v: number) => void;
    imagePhoneY: number;
    setImagePhoneY: (v: number) => void;
    setImagePhoneRotX: (v: number) => void;
    setImagePhoneRotY: (v: number) => void;
    backgroundUrl?: string | null;
    backgroundColorCss?: string | null;
    onBack: () => void;
    onRemove: () => void;
    imagePhoneRotX: number;
    imagePhoneRotY: number;
    imagePhoneRotZ: number;
    setImagePhoneRotZ: (v: number) => void;
    imagePhonePresetId: string;
    setImagePhonePresetId: (id: string) => void;
    mediaType: "video" | "image";
    videoDuration: number;
    viewer3DAutoRotate: boolean;
    setViewer3DAutoRotate: (v: boolean) => void;
    viewer3DRotationSpeed: number;
    setViewer3DRotationSpeed: (v: number) => void;
    viewer3DGlow: number;
    setViewer3DGlow: (v: number) => void;
    viewer3DEnvironment: EnvironmentPreset;
    setViewer3DEnvironment: (v: EnvironmentPreset) => void;
    isPlaying: boolean;
    mockupCamera: MockupCameraConfig;
    setMockupCamera: (v: MockupCameraConfig) => void;
    cameraNavigationMode: CameraNavigationMode;
    setCameraNavigationMode: (v: CameraNavigationMode) => void;
    currentTime: number;
    mockupCameraKeyframes: MockupCameraKeyframe[];
    selectedMockupCameraKeyframeId: string | null;
    onApplyCameraPreset?: (preset: MockupCameraPreset) => void;
    onApplyAutomaticCamera?: () => void;
    onPreviewCameraSegment?: () => void;
    onUpdateCameraKeyframe?: (updates: Partial<MockupCameraKeyframe>) => void;
    onAddCameraKeyframe?: () => void;
    onDeleteCameraKeyframe?: (id: string) => void;
}

export function Mockup3dMenu({
    activeDeviceTpl,
    imagePhoneDevice,
    isLaptop,
    imagePhoneScale,
    setImagePhoneScale,
    imagePhoneOpening,
    setImagePhoneOpening,
    imagePhoneShadow,
    setImagePhoneShadow,
    setImagePhoneShadowColor,
    imagePhoneX,
    setImagePhoneX,
    imagePhoneY,
    setImagePhoneY,
    setImagePhoneRotX,
    setImagePhoneRotY,
    backgroundUrl,
    backgroundColorCss,
    onBack,
    onRemove,
    imagePhoneRotX,
    imagePhoneRotY,
    imagePhoneRotZ,
    setImagePhoneRotZ,
    imagePhonePresetId,
    setImagePhonePresetId,
    mediaType,
    videoDuration,
    viewer3DAutoRotate,
    setViewer3DAutoRotate,
    viewer3DRotationSpeed,
    setViewer3DRotationSpeed,
    viewer3DGlow,
    setViewer3DGlow,
    viewer3DEnvironment,
    setViewer3DEnvironment,
    isPlaying,
    mockupCamera,
    setMockupCamera,
    cameraNavigationMode,
    setCameraNavigationMode,
    currentTime,
    mockupCameraKeyframes,
    selectedMockupCameraKeyframeId,
    onApplyCameraPreset,
    onApplyAutomaticCamera,
    onPreviewCameraSegment,
    onUpdateCameraKeyframe,
    onAddCameraKeyframe,
    onDeleteCameraKeyframe,
}: Mockup3dMenuProps) {
    const t = useTranslations("mockupMenu");
    const { cameraReviewGuides, setCameraReviewGuides } = useMockup3dContext();
    const canCreateAutomaticTour = mediaType !== "video"
        || hasMockupCameraTourSpace(videoDuration, mockupCameraKeyframes);
    const cameraTargetRange = imagePhoneDevice === "laptop" ? 100 : imagePhoneDevice === "iphone-duo" ? 5 : 1;
    const selectedCameraKeyframe = mockupCameraKeyframes.find(
        (keyframe) => keyframe.id === selectedMockupCameraKeyframeId,
    );
    const hasNextCameraKeyframe = !!selectedCameraKeyframe && mockupCameraKeyframes.some(
        (keyframe) => keyframe.time > selectedCameraKeyframe.time,
    );

    const handleCameraChange = useCallback((camera: MockupCameraConfig) => {
        if (onUpdateCameraKeyframe && selectedCameraKeyframe) onUpdateCameraKeyframe({ camera });
        else setMockupCamera(camera);
    }, [setMockupCamera, onUpdateCameraKeyframe, selectedCameraKeyframe]);

    const handleReset = useCallback(() => {
        setImagePhoneX(0);
        setImagePhoneY(0);
        setImagePhoneScale(0.9);
        const defaultRotX = imagePhoneDevice === "laptop" ? 43.23 : -58.23;
        const defaultRotY = imagePhoneDevice === "laptop" ? -37.82 : -29.82;
        setImagePhoneRotX(defaultRotX);
        setImagePhoneRotY(defaultRotY);
        setCameraNavigationMode("orbit");
        setImagePhoneRotZ(0);

        if (imagePhoneDevice === "iphone-duo") {
            setImagePhoneScale(0.7);
            setImagePhoneRotX(6);
            setImagePhoneRotY(-12);
            setImagePhoneOpening(1);
            setImagePhoneShadow(0.4);
        } else if (imagePhoneDevice === "laptop") {
            setImagePhoneOpening(1);
            setImagePhoneShadow(0.7);
        } else if (imagePhoneDevice === "double_iphone_13_pro") {
            setImagePhoneRotX(-30.23);
            setImagePhoneRotY(-60.82);
        } else if (imagePhoneDevice === "iphone-13-pro-max") {
            setImagePhoneScale(1.6);
        } else {
            setImagePhoneShadow(0.4);
        }
        setImagePhoneShadowColor("#000000");
        setImagePhonePresetId("custom");
        setMockupCamera({ target: [0, 0, 0], distance: 1, fov: null });
    }, [
        imagePhoneDevice,
        setImagePhoneX,
        setImagePhoneY,
        setImagePhoneScale,
        setImagePhoneRotX,
        setImagePhoneRotY,
        setImagePhoneRotZ,
        setImagePhoneOpening,
        setImagePhoneShadow,
        setImagePhoneShadowColor,
        setImagePhonePresetId,
        setMockupCamera,
        setCameraNavigationMode,
    ]);

    const handleToggleReviewGuide = useCallback((guide: keyof typeof cameraReviewGuides) => {
        setCameraReviewGuides((previous) => ({ ...previous, [guide]: !previous[guide] }));
    }, [setCameraReviewGuides]);

    return (
        <>
            <div className="flex items-center gap-2 p-3 border-b border-border shrink-0">
                <DetailPageHeader label={t("device3DTitle")} icon="mage:box-3d" onBack={onBack} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-6">

                <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {t("configuration")}
                    </span>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors"
                    >
                        <Icon icon="lucide:rotate-ccw" width="11" />
                        {t("reset")}
                    </button>
                </div>

                {mediaType === "video" && (
                    <div className="flex flex-col gap-2">
                        <Position3DPresetsEditor
                            device={imagePhoneDevice}
                            isLaptop={isLaptop}
                            selectedPresetId={imagePhonePresetId}
                            onSelectPreset={(preset) => {
                                setImagePhoneX(preset.x);
                                setImagePhoneY(preset.y);
                                setImagePhoneScale(preset.scale);
                                setImagePhoneRotX(preset.rotateX);
                                setImagePhoneRotY(preset.rotateY);
                                setImagePhoneRotZ(preset.rotateZ);
                                setImagePhonePresetId(preset.id);
                                if ("imagePhoneOpening" in preset) {
                                    setImagePhoneOpening(preset.imagePhoneOpening);
                                }
                            }}
                            rotateX={imagePhoneRotX}
                            rotateY={imagePhoneRotY}
                            onRotationXYChange={(rX, rY) => {
                                setImagePhoneRotX(rX);
                                setImagePhoneRotY(rY);
                            }}
                            rotateZ={imagePhoneRotZ}
                            onRotateZChange={setImagePhoneRotZ}
                            onCustomReset={handleReset}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {t("position")}
                    </span>

                    <PositionPad
                        x={imagePhoneX}
                        y={imagePhoneY}
                        onChangeX={setImagePhoneX}
                        onChangeY={setImagePhoneY}
                        backgroundUrl={backgroundUrl}
                        backgroundColorCss={backgroundColorCss}
                    />

                    <SliderControl
                        icon="solar:scale-linear"
                        label={t("scale")}
                        value={Math.round(imagePhoneScale * 100)}
                        min={30}
                        max={300}
                        step={1}
                        onChange={(v) => setImagePhoneScale(v / 100)}
                        suffix="%"
                    />
                </div>

                <section className="flex flex-col gap-3 pt-4 border-t border-border" aria-labelledby="camera-controls-title">
                    <div className="flex items-center justify-between">
                        <h3 id="camera-controls-title" className="flex items-center gap-1.5 text-[10px] font-bold text-foreground uppercase tracking-wider">
                            <Icon icon="mdi:camera" width="14" className="text-primary" aria-hidden="true" />
                            {t("cameraControls")}
                        </h3>
                        <TooltipAction
                            label={mediaType === "video"
                                ? canCreateAutomaticTour ? t("autoCameraHint") : t("autoCameraNoSpace")
                                : t("autoCameraFrameHint")}
                            side="right"
                        >
                            <span
                                tabIndex={!canCreateAutomaticTour && mediaType === "video" ? 0 : -1}
                                className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <button
                                    type="button"
                                    onClick={onApplyAutomaticCamera}
                                    disabled={!onApplyAutomaticCamera || !canCreateAutomaticTour}
                                    aria-label={mediaType === "video" ? t("autoCamera") : t("autoCameraFrame")}
                                    className="flex size-8 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none"
                                >
                                    <Icon icon="lucide:sparkles" width="16" aria-hidden="true" />
                                </button>
                            </span>
                        </TooltipAction>
                    </div>

                    {mediaType === "video" && !canCreateAutomaticTour && (
                        <p className="flex items-center gap-1.5 px-1 text-[9px] leading-snug text-amber-600 dark:text-amber-400">
                            <Icon icon="lucide:circle-alert" width="13" className="shrink-0" aria-hidden="true" />
                            {t("autoCameraNoSpace")}
                        </p>
                    )}

                    {mediaType === "video" && (
                        <div className="flex items-center gap-1 px-1">
                            {mockupCameraKeyframes.length > 0 && (
                                <span className="mr-auto font-mono text-[9px] text-muted-foreground" aria-label={`${t("cameraKeyframes")}: ${mockupCameraKeyframes.length}`}>
                                    {mockupCameraKeyframes.length} · {t("cameraKeyframes")}
                                    {selectedCameraKeyframe && ` · ${currentTime.toFixed(1)}s`}
                                </span>
                            )}
                            {selectedCameraKeyframe && hasNextCameraKeyframe && (
                                <TooltipAction label={t("cameraPreviewSegment")}>
                                    <button
                                        type="button"
                                        onClick={onPreviewCameraSegment}
                                        disabled={!onPreviewCameraSegment || isPlaying}
                                        aria-label={t("cameraPreviewSegment")}
                                        className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <Icon icon="lucide:play" width="13" aria-hidden="true" />
                                    </button>
                                </TooltipAction>
                            )}
                            <TooltipAction label={t("cameraKeyframeAdd")}>
                                <button
                                    type="button"
                                    onClick={onAddCameraKeyframe}
                                    disabled={!onAddCameraKeyframe}
                                    aria-label={t("cameraKeyframeAdd")}
                                    className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <Icon icon="lucide:plus" width="14" aria-hidden="true" />
                                </button>
                            </TooltipAction>
                            {mockupCameraKeyframes.length > 0 && (
                                <TooltipAction label={t("cameraKeyframeRemove")}>
                                    <button
                                        type="button"
                                        onClick={() => selectedCameraKeyframe && onDeleteCameraKeyframe?.(selectedCameraKeyframe.id)}
                                        disabled={!selectedCameraKeyframe || !onDeleteCameraKeyframe}
                                        aria-label={t("cameraKeyframeRemove")}
                                        className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <Icon icon="lucide:trash-2" width="13" aria-hidden="true" />
                                    </button>
                                </TooltipAction>
                            )}
                        </div>
                    )}

                    {(mediaType !== "video" || mockupCameraKeyframes.length > 0) && (
                    <details className="group rounded-lg border border-border/70 bg-muted/20">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-[10px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
                            <Icon icon="lucide:sliders-horizontal" width="14" className="text-primary" aria-hidden="true" />
                            <span>{t("cameraAdvanced")}</span>
                            <Icon icon="lucide:chevron-down" width="13" className="ml-auto transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="space-y-3 border-t border-border/70 p-2.5">
                    {mediaType === "video" && selectedCameraKeyframe && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground">
                                {t("cameraTransition.label")}
                            </span>
                            <Select
                                value={selectedCameraKeyframe.transition ?? "smooth"}
                                onValueChange={(value) => {
                                    if (value === "smooth" || value === "linear" || value === "hold") {
                                        onUpdateCameraKeyframe?.({ transition: value });
                                    }
                                }}
                            >
                                <SelectTrigger className="h-8 bg-background text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smooth">{t("cameraTransition.smooth")}</SelectItem>
                                    <SelectItem value="linear">{t("cameraTransition.linear")}</SelectItem>
                                    <SelectItem value="hold">{t("cameraTransition.hold")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1" role="group" aria-label={t("cameraControls")}>
                        {([
                            ["orbit", "mdi:orbit-variant", "orbit"],
                            ["trackXY", "mdi:move", "trackXY"],
                            ["trackZ", "mdi:arrow-expand-vertical", "trackZ"],
                        ] as const).map(([mode, icon, label]) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setCameraNavigationMode(mode)}
                                aria-pressed={cameraNavigationMode === mode}
                                aria-label={`${t(label)}: ${t(mode === "orbit" ? "orbitHint" : mode === "trackXY" ? "trackXYHint" : "trackZHint")}`}
                                title={`${t(label)}: ${t(mode === "orbit" ? "orbitHint" : mode === "trackXY" ? "trackXYHint" : "trackZHint")}`}
                                className={`flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    cameraNavigationMode === mode
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                                }`}
                            >
                                <Icon icon={icon} width="15" aria-hidden="true" />
                                <span className="leading-tight">{mode === "orbit" ? t(label) : mode === "trackXY" ? "XY" : "Z"}</span>
                            </button>
                        ))}
                    </div>
                    <TooltipAction label={t("cameraDragHint")} side="right">
                        <button
                            type="button"
                            aria-label={t("cameraDragHint")}
                            className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <Icon icon="lucide:circle-help" width="14" aria-hidden="true" />
                        </button>
                    </TooltipAction>

                    <div className="space-y-2 border-t border-border/70 pt-2.5">
                        <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <Icon icon="mdi:crosshairs-gps" width="13" aria-hidden="true" />
                            {t("cameraTarget")}
                        </h4>
                        <CameraTargetPad
                            x={mockupCamera.target[0]}
                            y={mockupCamera.target[1]}
                            range={cameraTargetRange}
                            label={t("cameraTargetPosition")}
                            hint={t("cameraTargetPadHint")}
                            backgroundUrl={backgroundUrl}
                            backgroundColorCss={backgroundColorCss}
                            presets={mediaType === "video" ? [] : MOCKUP_CAMERA_PRESETS}
                            onApplyPreset={onApplyCameraPreset}
                            reviewGuides={cameraReviewGuides}
                            onToggleReviewGuide={handleToggleReviewGuide}
                            onChange={(x, y) => {
                                const target: [number, number, number] = [x, y, mockupCamera.target[2]];
                                handleCameraChange({ ...mockupCamera, target });
                            }}
                        />
                        <SliderControl
                            icon="mdi:camera-metering-center"
                            label={t("fieldOfView")}
                            value={mockupCamera.fov ?? (imagePhoneDevice === "iphone-duo" ? 30 : 40)}
                            min={20}
                            max={80}
                            step={1}
                            onChange={(fov) => handleCameraChange({ ...mockupCamera, fov })}
                            suffix="°"
                        />
                    </div>

                    <div className="space-y-2 border-t border-border/70 pt-2.5">
                        <SliderControl
                            icon="mdi:arrow-expand-vertical"
                            label={t("dolly")}
                            value={Math.round(mockupCamera.distance * 100)}
                            min={25}
                            max={400}
                            step={1}
                            onChange={(value) => handleCameraChange({ ...mockupCamera, distance: value / 100 })}
                            suffix="%"
                        />
                        <SliderControl
                            icon="mdi:crosshairs-gps"
                            label={`${t("target")} Z`}
                            value={Math.round((mockupCamera.target[2] / cameraTargetRange) * 100)}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={(value) => {
                                const target: [number, number, number] = [
                                    mockupCamera.target[0],
                                    mockupCamera.target[1],
                                    (value / 100) * cameraTargetRange,
                                ];
                                handleCameraChange({ ...mockupCamera, target });
                            }}
                        />
                    </div>
                        </div>
                    </details>
                    )}
                </section>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {t("modelProperties") || "Propiedades del Modelo"}
                    </span>

                    {(isLaptop || imagePhoneDevice === "iphone-duo") && (
                        <SliderControl
                            icon={imagePhoneDevice === "iphone-duo" ? "lucide:book-open" : "material-symbols:laptop-chromebook-outline"}
                            label={t(imagePhoneDevice === "iphone-duo" ? "foldOpening" : "laptopOpening")}
                            value={Math.round(imagePhoneOpening * 100)}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(v) => setImagePhoneOpening(v / 100)}
                            suffix="%"
                        />
                    )}

                    <SliderControl
                        icon="mdi:blur"
                        label={t("shadow")}
                        value={Math.round(imagePhoneShadow * 100)}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(v) => setImagePhoneShadow(v / 100)}
                        suffix="%"
                    />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {t("lightingAndEnvironment") || "Entorno e Iluminación"}
                    </span>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {t("environment")}
                        </span>
                        <Select
                            value={viewer3DEnvironment}
                            onValueChange={(val) => setViewer3DEnvironment(val as EnvironmentPreset)}
                        >
                            <SelectTrigger className="w-full bg-muted/50 border-border text-foreground/80 h-9" textSize="xs">
                                <SelectValue placeholder={t("environment")} />
                            </SelectTrigger>
                            <SelectContent>
                                {ENVIRONMENT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt} textSize="xs">
                                        {t(`environments.${opt}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <SliderControl
                        icon="mdi:white-balance-sunny"
                        label={t("glow")}
                        value={Math.round(viewer3DGlow * 100)}
                        min={0}
                        max={500}
                        step={10}
                        onChange={(v) => setViewer3DGlow(v / 100)}
                        suffix="%"
                    />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        {t("presentation") || "Animación y Exhibición"}
                    </span>

                    <div
                        className={`flex items-center justify-between px-3 py-2 squircle-element border transition-all ${viewer3DAutoRotate
                                ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-300"
                                : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50"
                            }`}
                    >
                        <span className="flex items-center gap-2 text-[12px] font-medium">
                            <Icon icon="mdi:orbit-variant" width="14" />
                            {t("autoRotate")}
                        </span>
                        <Toggle checked={viewer3DAutoRotate} onChange={setViewer3DAutoRotate} />
                    </div>

                    {viewer3DAutoRotate && (
                        <SliderControl
                            icon="mdi:speedometer"
                            label={t("rotationSpeed")}
                            value={viewer3DRotationSpeed}
                            min={0.1}
                            max={10}
                            step={0.1}
                            onChange={setViewer3DRotationSpeed}
                        />
                    )}
                </div>

                <div className="pt-2">
                    <Button onClick={onRemove} variant="outline" className="w-full text-xs">
                        <Icon icon="ph:trash-bold" width="13" aria-hidden="true" />
                        {t("removeFrame")}
                    </Button>
                </div>

            </div>
        </>
    );
}
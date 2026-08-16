"use client";

import { memo, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { zoomLevelToFactor, type ZoomFragment } from "@/types/zoom.types";
import { ElementsIcon } from "@/components/ui/ElementsIcon";
import { formatTime } from "@/lib";
import {
  ACCENT,
  BackgroundCategory,
  DragMode,
  HERO_GRADIENTS,
  HERO_WALLPAPERS,
  PANEL_BORDER,
  SIDEBAR_TOOLS,
  SLIDER_MAX,
  TFunc,
  THUMB,
  ZOOM_MIN_DURATION,
  clamp,
} from "@/lib/editor-preview-hero.utils";

export const DraggableRange = memo(function DraggableRange({
  start,
  end,
  duration,
  trackRef,
  minDuration = 0.3,
  onChange,
  onClick,
  className,
  handleClassName,
  children,
}: {
  start: number;
  end: number;
  duration: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  minDuration?: number;
  onChange: (next: { start: number; end: number }) => void;
  onClick?: () => void;
  className?: string;
  handleClassName?: string;
  children?: React.ReactNode;
}) {
  const dragState = useRef<{
    mode: DragMode;
    startX: number;
    initialStart: number;
    initialEnd: number;
    hasMoved: boolean;
  } | null>(null);

  const startDrag = useCallback(
    (mode: DragMode) => (e: React.PointerEvent) => {
      e.stopPropagation();
      dragState.current = {
        mode,
        startX: e.clientX,
        initialStart: start,
        initialEnd: end,
        hasMoved: false,
      };

      const handleMove = (ev: PointerEvent) => {
        const drag = dragState.current;
        const track = trackRef.current;
        if (!drag || !track || duration <= 0) return;

        const width = track.getBoundingClientRect().width;
        if (width <= 0) return;

        const deltaPx = ev.clientX - drag.startX;
        if (Math.abs(deltaPx) > 3) drag.hasMoved = true;

        const deltaSec = (deltaPx / width) * duration;
        let nextStart = drag.initialStart;
        let nextEnd = drag.initialEnd;

        if (drag.mode === "move") {
          const span = drag.initialEnd - drag.initialStart;
          nextStart = Math.max(0, Math.min(duration - span, drag.initialStart + deltaSec));
          nextEnd = nextStart + span;
        } else if (drag.mode === "resize-left") {
          nextStart = Math.max(0, Math.min(drag.initialEnd - minDuration, drag.initialStart + deltaSec));
        } else {
          nextEnd = Math.min(duration, Math.max(drag.initialStart + minDuration, drag.initialEnd + deltaSec));
        }
        onChange({ start: nextStart, end: nextEnd });
      };

      const handleUp = () => {
        if (dragState.current && !dragState.current.hasMoved && onClick) {
          onClick();
        }
        dragState.current = null;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [start, end, duration, minDuration, onChange, onClick, trackRef]
  );

  if (duration <= 0) return null;

  const left = (start / duration) * 100;
  const width = ((end - start) / duration) * 100;

  return (
    <div
      className={`group/range absolute top-0 h-full cursor-grab touch-none select-none active:cursor-grabbing ${className ?? ""}`}
      style={{ left: `${left}%`, width: `${width}%` }}
      onPointerDown={startDrag("move")}
    >
      {children}
      <div
        className="absolute -left-1 top-0 bottom-0 z-20 flex w-3 cursor-ew-resize items-center justify-center"
        onPointerDown={startDrag("resize-left")}
      >
        <div
          className={`h-6 w-1.5 rounded-full shadow-sm transition-colors ${handleClassName ?? "bg-black/0 opacity-0 group-hover/range:bg-black/40 group-hover/range:opacity-100"
            }`}
        />
      </div>
      <div
        className="absolute -right-1 top-0 bottom-0 z-20 flex w-3 cursor-ew-resize items-center justify-center"
        onPointerDown={startDrag("resize-right")}
      >
        <div
          className={`h-6 w-1.5 rounded-full shadow-sm transition-colors ${handleClassName ?? "bg-black/0 opacity-0 group-hover/range:bg-black/40 group-hover/range:opacity-100"
            }`}
        />
      </div>
    </div>
  );
});

export const TimelineClipContent = memo(function TimelineClipContent({
  label,
  duration,
  progress,
  isSelected,
}: {
  label: string;
  duration: number;
  progress: number;
  isSelected?: boolean;
}) {
  return (
    <div
      className={`group/clip relative h-full w-full overflow-hidden rounded-md border transition-all ${isSelected
        ? "border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] bg-emerald-500/25"
        : "border-emerald-600/35 hover:border-emerald-500/60 bg-emerald-500/10"
        }`}
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full flex-1 border-r border-emerald-600/10 last:border-r-0" />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-px z-[1] border-r-2 border-emerald-400 pointer-events-none"
        style={{
          width: `${progress * 100}%`,
          background: "linear-gradient(180deg, rgba(16, 187, 130, 0.66) 0%, rgba(133, 227, 197, 0.28) 100%)",
        }}
      />
      <div className="relative z-10 flex h-full min-w-0 items-center justify-center gap-1.5 px-2 pointer-events-none">
        <Icon icon="solar:videocamera-record-bold" width={10} className="shrink-0 text-emerald-700" />
        <span className="truncate text-[9px] font-medium text-emerald-800">{label}</span>
        <span className="shrink-0 font-mono text-[8px] text-emerald-700/70">{formatTime(duration)}</span>
      </div>
    </div>
  );
});

export const TimelineZoomContent = memo(function TimelineZoomContent({
  zoomLevel,
  duration,
  isSelected,
  zoomLabel,
}: {
  zoomLevel: number;
  duration: number;
  isSelected?: boolean;
  zoomLabel: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-0 rounded-md border transition-all pointer-events-none ${isSelected
        ? "border-blue-400 ring-1 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.45)] bg-blue-500/30"
        : "border-blue-500/35 hover:border-blue-500/60 bg-blue-600/15"
        }`}
    >
      <span className={`flex items-center gap-1 text-[9px] leading-tight ${isSelected ? "text-blue-800 font-semibold" : "text-blue-700"}`}>
        <Icon icon="iconamoon:zoom-in-bold" width={9} className={isSelected ? "text-blue-300" : "text-blue-600"} />
        {zoomLabel}
      </span>
      <span className={`font-mono text-[8px] leading-tight ${isSelected ? "text-blue-900" : "text-blue-700/70"}`}>
        {zoomLevelToFactor(zoomLevel).toFixed(1)}× · {duration.toFixed(1)}s
      </span>
    </div>
  );
});

export const ZoomFragmentRangeItem = memo(function ZoomFragmentRangeItem({
  fragment,
  duration,
  trackRef,
  zoomLabel,
  isSelected,
  onChange,
  onToggle,
}: {
  fragment: ZoomFragment;
  duration: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  zoomLabel: string;
  isSelected: boolean;
  onChange: (id: string, next: { start: number; end: number }) => void;
  onToggle: (id: string) => void;
}) {
  const handleChange = useCallback(
    (next: { start: number; end: number }) => onChange(fragment.id, next),
    [onChange, fragment.id]
  );
  const handleClick = useCallback(() => onToggle(fragment.id), [onToggle, fragment.id]);

  return (
    <DraggableRange
      start={fragment.startTime}
      end={fragment.endTime}
      duration={duration}
      trackRef={trackRef}
      minDuration={ZOOM_MIN_DURATION}
      onChange={handleChange}
      onClick={handleClick}
      handleClassName="bg-blue-500/70 group-hover/range:bg-blue-400"
    >
      <TimelineZoomContent
        zoomLevel={fragment.zoomLevel}
        duration={fragment.endTime - fragment.startTime}
        isSelected={isSelected}
        zoomLabel={zoomLabel}
      />
    </DraggableRange>
  );
});

export const MiniSidebar = memo(function MiniSidebar({ t }: { t: TFunc }) {
  return (
    <aside
      className={`hidden sm:flex flex-col items-center gap-1.5 w-[72px] shrink-0 border-r ${PANEL_BORDER} bg-white py-4`}
      aria-hidden="true"
    >
      {SIDEBAR_TOOLS.map((tool, i) => {
        const active = i === 0;
        return (
          <div key={tool.id} className="relative">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${active ? "bg-[#EAF6FF]" : "hover:bg-black/[0.04]"
                }`}
            >
              {tool.icon ? (
                <Icon icon={tool.icon} width={19} style={{ color: active ? ACCENT : "rgba(0,0,0,0.4)" }} />
              ) : (
                <ElementsIcon className="w-[19px] h-[19px] text-gray-400" />
              )}
            </div>
            {tool.badge === "new" && (
              <span className="absolute -top-0.5 -right-0.5 px-[3px] py-[1px] rounded-full bg-amber-700 text-[6px] font-semibold text-white leading-tight">
                NEW
              </span>
            )}
          </div>
        );
      })}
      <div className="flex-1" />
      <div className={`w-full px-2 pt-3 border-t ${PANEL_BORDER} flex flex-col gap-1.5`}>
        <div className="w-full flex flex-col items-center gap-1 py-2 rounded-xl text-black/40">
          <Icon icon="fluent:screenshot-record-16-regular" width={20} />
          <span className="text-[9px] font-medium">{t("sidebar.record")}</span>
        </div>
        <div className="w-full flex flex-col items-center gap-1 py-2 rounded-xl border border-dashed border-black/10 text-black/40">
          <Icon icon="mage:video-upload" width={20} />
          <span className="text-[9px] font-medium">{t("sidebar.upload")}</span>
        </div>
      </div>
    </aside>
  );
});

export const MiniSlider = memo(function MiniSlider({
  icon,
  label,
  value,
  max = SLIDER_MAX,
  onChange,
}: {
  icon: string;
  label: string;
  value: number;
  max?: number;
  onChange?: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const fillPercent = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      onChange?.(clamp(((clientX - rect.left) / rect.width) * max, 0, max));
    },
    [onChange, max]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onChange) return;
      e.preventDefault();
      isDraggingRef.current = true;
      updateFromClientX(e.clientX);
      const handleMove = (ev: PointerEvent) => {
        if (isDraggingRef.current) updateFromClientX(ev.clientX);
      };
      const handleUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [onChange, updateFromClientX]
  );

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      className={`relative flex h-[28px] w-full items-center overflow-hidden rounded-lg border border-black/6 bg-black/[0.035] ${onChange ? "cursor-pointer touch-none select-none" : ""
        }`}
    >
      <div
        className="absolute bottom-0 left-0 top-0 bg-black/10 transition-[width] duration-150 ease-out"
        style={{ width: `${fillPercent}%` }}
      />
      <div
        className="absolute top-[5px] bottom-[5px] z-20 w-[2px] rounded-full shadow-sm transition-[left] duration-150 ease-out"
        style={{ left: `calc(${fillPercent}% - 1px)`, background: ACCENT }}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-black/55">
          <Icon icon={icon} width={12} />
          <span>{label}</span>
        </div>
        <span className="text-[9px] font-mono text-black/40">{Math.round(value)}</span>
      </div>
    </div>
  );
});

export const SwatchGrid = memo(function SwatchGrid({
  label,
  items,
  activeIndex,
  isActiveCategory,
  cursorTarget,
  onSelect,
}: {
  label: string;
  items: { index: number | string; previewUrl: string }[];
  activeIndex: number;
  isActiveCategory: boolean;
  cursorTarget?: { x: number; y: number };
  onSelect: (index: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-black/35 font-bold mb-2">
        <Icon icon="solar:gallery-wide-linear" width={11} />
        <span>{label}</span>
      </div>
      <div className="relative grid grid-cols-5 lg:grid-cols-6 gap-2 w-max">
        {items.map((item, i) => (
          <div
            key={item.index}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(i);
            }}
            className="rounded-lg overflow-hidden bg-cover bg-center transition-shadow cursor-pointer"
            style={{
              width: THUMB,
              height: THUMB,
              backgroundImage: `url('${item.previewUrl}')`,
              boxShadow:
                isActiveCategory && i === activeIndex
                  ? `0 0 0 2px white, 0 0 0 3.5px ${ACCENT}`
                  : "0 0 0 1px rgba(0,0,0,0.08)",
            }}
          />
        ))}
        {cursorTarget && (
          <motion.div
            className="absolute pointer-events-none z-10 w-[60px] h-[60px] min-w-[60px] min-h-[60px]"
            initial={false}
            animate={{ left: cursorTarget.x, top: cursorTarget.y + 10 }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
            <Image
              src="/svg/pointinghand.svg"
              alt="Pointer"
              width={60}
              height={60}
              className="drop-shadow-md max-w-none"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
});

export const BackgroundPanel = memo(function BackgroundPanel({
  t,
  category,
  activeSwatch,
  cursorTarget,
  onSelectWallpaper,
  activeGradient,
  onSelectGradient,
  blurPercent,
  onBlurChange,
  paddingPercent,
  onPaddingChange,
  roundedPercent,
  onRoundedChange,
  shadowPercent,
  onShadowChange,
}: {
  t: TFunc;
  category: BackgroundCategory;
  activeSwatch: number;
  cursorTarget: { x: number; y: number };
  onSelectWallpaper: (index: number) => void;
  activeGradient: number;
  onSelectGradient: (index: number) => void;
  blurPercent: number;
  onBlurChange: (p: number) => void;
  paddingPercent: number;
  onPaddingChange: (p: number) => void;
  roundedPercent: number;
  onRoundedChange: (p: number) => void;
  shadowPercent: number;
  onShadowChange: (p: number) => void;
}) {
  return (
    <div className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r ${PANEL_BORDER} bg-white overflow-hidden`}>
      <header className={`flex items-center justify-between h-12 px-3 border-b ${PANEL_BORDER} shrink-0`}>
        <div className="flex items-center gap-1.5">
          <Image src="/svg/logo-openvid.svg" alt="" width={22} height={22} />
          <Image src="/svg/openvid-dark.svg" alt="Openvid" width={58} height={40} />
        </div>
        <Icon icon="lucide:sidebar-close" width={16} className="text-black/30" />
      </header>
      <div className="flex-1 overflow-y-none custom-scrollbar">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 text-black/80 font-medium text-[13px] mb-3">
            <Icon icon="solar:gallery-wide-linear" width={16} style={{ color: ACCENT }} />
            <span>{t("background.title")}</span>
          </div>
          <div className="flex bg-black/[0.04] rounded-lg p-0.5 text-[11px] font-medium">
            <div className="flex-1 text-center py-1.5 rounded-md bg-white shadow-sm text-black">{t("background.tabWallpaper")}</div>
            <div className="flex-1 text-center py-1.5 text-black/40">{t("background.tabColor")}</div>
          </div>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-black/35 font-bold mb-2">{t("background.options")}</div>
            <div className="flex flex-wrap gap-2">
              <div
                className="size-9 rounded-lg border border-black/10 shrink-0 hover:cursor-pointer bg-zinc-100 hover:bg-black/5 transition-colors"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)",
                  backgroundSize: "14px 14px",
                  backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0",
                }}
              />

              <div className="size-9 rounded-lg border border-dashed border-black/15 flex items-center justify-center bg-black/2 cursor-pointer hover:bg-black/5 transition-colors shrink-0">
                <Icon icon="material-symbols:upload-rounded" width={18} className="text-black/40" />
              </div>

              <div className="size-9 rounded-lg border border-black/10 flex items-center justify-center bg-black/2 cursor-pointer hover:bg-black/5 transition-colors shrink-0">
                <Icon icon="ri:unsplash-fill" width={18} className="text-black/40" />
              </div>
            </div>
          </div>

          <SwatchGrid
            label={t("background.desktopLabel")}
            items={HERO_WALLPAPERS}
            activeIndex={activeSwatch}
            isActiveCategory={category === "wallpaper"}
            cursorTarget={category === "wallpaper" ? cursorTarget : undefined}
            onSelect={onSelectWallpaper}
          />
          <SwatchGrid
            label={t("background.gradientsLabel")}
            items={HERO_GRADIENTS}
            activeIndex={activeGradient}
            isActiveCategory={category === "gradient"}
            cursorTarget={category === "gradient" ? cursorTarget : undefined}
            onSelect={onSelectGradient}
          />

          <div className="text-[10px] text-black/35 flex items-center justify-center gap-1">
            <Icon icon="lucide:chevron-down" width={10} />
            <span>{t("background.showMore")}</span>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-black/35 font-bold mb-2">{t("background.settings")}</div>
            <div className="flex flex-col gap-2">
              <MiniSlider icon="mdi:blur" label={t("background.blur")} value={blurPercent} onChange={onBlurChange} />
              <MiniSlider
                icon="mdi:arrow-expand-all"
                label={t("background.padding")}
                value={paddingPercent}
                onChange={onPaddingChange}
              />
              <MiniSlider
                icon="mdi:border-radius"
                label={t("background.rounded")}
                value={roundedPercent}
                onChange={onRoundedChange}
              />
              <MiniSlider
                icon="material-symbols:shadow"
                label={t("background.shadow")}
                value={shadowPercent}
                onChange={onShadowChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { SliderControl } from "../../../../components/ui/SliderControl";
import { Toggle } from "@/components/ui/toggle";
import {
  MockupMotionFragment,
  DEFAULT_MOTION_CUSTOM_OFFSETS,
  type MotionCustomOffsets,
} from "@/lib/mockup-motion";
import {
  MotionPresetIconStyles,
} from "../../../../components/ui/MotionPresetIcon";
import { DirectionPad } from "@/components/ui/DirectionPad";
import { PositionPad } from "@/components/ui/PositionPad";
import { TooltipAction } from "@/components/ui/tooltip-action";
import { DetailPageHeader } from "@/components/ui/DetailHeaderMenu";

interface MotionFragmentEditorProps {
  fragment: MockupMotionFragment;
  isGlobalMotionEnabled: boolean;
  onUpdate: (updates: Partial<MockupMotionFragment>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function MotionFragmentEditor({
  fragment,
  onUpdate,
  onDelete,
  onClose,
}: MotionFragmentEditorProps) {
  const t = useTranslations("motionMenu");
  const custom = fragment.custom ?? DEFAULT_MOTION_CUSTOM_OFFSETS;

  const updateCustom = (partial: Partial<MotionCustomOffsets>) => {
    onUpdate({ custom: { ...custom, ...partial } });
  };

  const hasCustomChanges =
    custom.positionX !== 0 ||
    custom.positionY !== 0 ||
    custom.zoomMultiplier !== 1 ||
    custom.rotateX !== 0 ||
    custom.rotateY !== 0 ||
    custom.rotateZ !== 0 ||
    custom.blur !== 0 ||
    custom.reverse;

  return (
    <div className="flex flex-col h-full text-white">
      <MotionPresetIconStyles />

      <div className="flex items-center gap-2 p-3 border-b border-white/6 shrink-0">
        <DetailPageHeader label={t("title")} icon="ph:arrow-left-bold" onBack={onClose} />
        <TooltipAction label={t("deleteTooltip")}>
          <button
            onClick={onDelete}
            className="ml-auto flex items-center gap-1.5 text-[11px] text-red-400/70 hover:text-red-400 px-2 py-1 rounded-md transition-colors shrink-0"
          >
            <Icon icon="ph:trash-bold" width="12" />
            {t("actions.delete")}
          </button>
        </TooltipAction>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5">
        <div className="flex flex-col gap-4">
          <SliderControl
            icon="mdi:tune-variant"
            label={t("controls.intensity")}
            value={fragment.intensity}
            min={0}
            max={100}
            onChange={(v: number) => onUpdate({ intensity: v })}
          />
          <SliderControl
            icon="mdi:speedometer"
            label={t("controls.speed")}
            value={fragment.speed}
            min={0}
            max={100}
            onChange={(v: number) => onUpdate({ speed: v })}
          />
        </div>

        <div className="space-y-3 p-3 bg-white/3 border border-white/8 squircle-element">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:tune" width="16" className="text-white/60" />
            <div>
              <p className="text-xs font-medium text-white/80">{t("customize.title")}</p>
              <p className="text-[11px] text-white/40">{t("customize.subtitle")}</p>
            </div>
          </div>

          <PositionPad
            x={custom.positionX}
            y={custom.positionY}
            onChange={(x, y) => updateCustom({ positionX: x, positionY: y })}
            scale={custom.zoomMultiplier}
            rotateZ={custom.rotateZ}
            blur={custom.blur}
            accentRgb="249,115,22"
            label={t("customize.positionLabel")}
            hint={t("customize.positionHint")}
          />
          <DirectionPad
            angleX={custom.rotateX}
            angleY={custom.rotateY}
            onChange={(rx, ry) => updateCustom({ rotateX: rx, rotateY: ry })}
            accentRgb="249,115,22"
            label={t("customize.tiltLabel")}
            hint={t("customize.tiltHint")}
            className="aspect-square max-w-[220px]"
          />
          <SliderControl
            icon="mdi:magnify"
            label={t("customize.zoomLabel")}
            value={Math.round(custom.zoomMultiplier * 100)}
            min={50}
            max={200}
            onChange={(v: number) => updateCustom({ zoomMultiplier: v / 100 })}
            suffix="%"
          />
          <SliderControl
            icon="mdi:axis-z-rotate-clockwise"
            label={t("customize.rotateZLabel")}
            value={custom.rotateZ}
            min={-45}
            max={45}
            onChange={(v: number) => updateCustom({ rotateZ: v })}
          />
          <label className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-xs text-white/60">{t("customize.reverseLabel")}</span>
            <Toggle
              checked={custom.reverse}
              onChange={(v: boolean) => updateCustom({ reverse: v })}
              activeColor="bg-orange-600"
            />
          </label>
          {hasCustomChanges && (
            <button
              onClick={() => onUpdate({ custom: { ...DEFAULT_MOTION_CUSTOM_OFFSETS } })}
              className="self-start text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2"
            >
              {t("customize.resetButton")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
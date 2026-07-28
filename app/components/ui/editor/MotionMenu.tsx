"use client";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { SliderControl } from "../../../../components/ui/SliderControl";
import { useMockup3dContext } from "@/app/contexts/Mockup3dContext";
import { MOCKUP_MOTION_PRESETS, type MockupMotionPresetId, MockupMotionFragment, } from "@/lib/mockup-motion";
import { MotionPresetIcon, MotionPresetIconStyles, } from "../../../../components/ui/MotionPresetIcon";
import { Toggle } from "@/components/ui/toggle";

interface MotionMenuProps {
  fragments: MockupMotionFragment[];
  selectedFragment: MockupMotionFragment | null;
  onAddOrReplacePreset: (presetId: MockupMotionPresetId) => void;
  onUpdateSelectedFragment: (updates: Partial<MockupMotionFragment>) => void;
  onSelectFragment: (id: string | null) => void;
  onDeleteFragment: (id: string) => void;
  mediaType?: "video" | "image";
  mockupId?: string;
  isGlobalMotionEnabled?: boolean;
  onToggleGlobalMotion?: (enabled: boolean) => void;
}

const CATEGORY_ORDER = ["Entrance", "Continue", "Exit"] as const;

export function MotionMenu({
  selectedFragment,
  onAddOrReplacePreset,
  onUpdateSelectedFragment,
  mediaType = "video",
  isGlobalMotionEnabled = false,
  onToggleGlobalMotion,
}: MotionMenuProps) {
  const t = useTranslations("motionMenu");
  const { imagePhoneActive } = useMockup3dContext();
  const hasMockup2D = mediaType === "video" && !imagePhoneActive;

  if (!hasMockup2D) {
    return (
      <div className="p-4 flex flex-col gap-5 h-full relative">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white font-medium">
            <Icon icon="ph:film-strip-bold" width="20" aria-hidden="true" />
            <span>{t("title")}</span>
          </div>
          {onToggleGlobalMotion && (
            <label className="flex items-center gap-2 text-xs text-white/40">
              <span>{t("globalMotionLabel")}</span>
              <Toggle checked={isGlobalMotionEnabled} onChange={onToggleGlobalMotion} disabled={true} />
            </label>
          )}
        </div>
        <div className="group bg-[#09090B] border border-dashed border-white/10 squircle-element p-8 text-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
            <Icon icon="ph:frame-corners-bold" width="24" className="text-white/40 group-hover:text-white/70 transition-colors" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-white/70 mb-1">
            {t("empty2D.title")}
          </p>
          <p className="text-xs text-white/40">{t("empty2D.description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 h-full relative min-h-0">
      <MotionPresetIconStyles />
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-white font-medium">
          <Icon icon="ph:film-strip-bold" width="20" aria-hidden="true" />
          <span>{t("title")}</span>
        </div>
        {onToggleGlobalMotion && (
          <label className="flex items-center gap-2 text-xs text-white/40">
            <span>{t("globalMotionLabel")}</span>
            <Toggle checked={isGlobalMotionEnabled} onChange={onToggleGlobalMotion} activeColor="bg-orange-600" />
          </label>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.map((category) => {
            const presets = MOCKUP_MOTION_PRESETS.filter((p) => p.category === category);
            if (presets.length === 0) return null;

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                    {t(`categories.${category}`)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {presets.map((preset) => {
                    const isActive = selectedFragment?.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onAddOrReplacePreset(preset.id)}
                        className={`group flex flex-col gap-2 rounded-xl border p-2 text-left transition-all duration-200 hover:scale-[1.015] active:scale-[0.98] ${isActive ? "border-orange-600/50 bg-orange-[0.05]" : "border-neutral-800 bg-black hover:border-neutral-700 hover:bg-neutral-900"}`}
                      >
                        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden">
                          <MotionPresetIcon
                            presetId={preset.id}
                            category={preset.category}
                            active={isActive}
                            fill
                            forceAnimate={isGlobalMotionEnabled}
                          />
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600/50 backdrop-blur-sm">
                              <Icon icon="ph:check-bold" className="text-white" width="9" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[11px] leading-tight truncate transition-colors ${isActive ? "text-white" : "text-neutral-400 group-hover:text-white"}`} >
                          {t(`presets.${preset.id}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedFragment && (
        <div className="flex flex-col gap-4">
          <SliderControl
            icon="mdi:tune-variant"
            label={t("controls.intensity")}
            value={selectedFragment?.intensity ?? 50}
            min={0} max={100}
            onChange={(v: number) => selectedFragment && onUpdateSelectedFragment({ intensity: v })}
          />
          <SliderControl
            icon="mdi:speedometer"
            label={t("controls.speed")}
            value={selectedFragment?.speed ?? 50}
            min={0} max={100}
            onChange={(v: number) => selectedFragment && onUpdateSelectedFragment({ speed: v })}
          />
        </div>
      )}
    </div>
  );
}
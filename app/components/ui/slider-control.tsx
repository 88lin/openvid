"use client";

import { Icon } from "@iconify/react";

interface SliderControlProps {
    icon?: string;
    label: string;
    value: number;
    onChange?: (value: number) => void;
}

export function SliderControl({ icon, label, value, onChange }: SliderControlProps) {
    const handleReset = () => {
        onChange?.(0);
    };

    return (
        <div>
            <div className="flex items-center gap-2 text-sm mb-2 text-[#A1A1AA]">
                {icon && <Icon icon={icon} width="16" />}
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#27272A] rounded-full relative cursor-pointer">
                    <div
                        className="absolute left-0 top-0 h-full bg-[#4F46E5] rounded-full"
                        style={{ width: `${value}%` }}
                    ></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#4F46E5] rounded-full border-2 border-white shadow"
                        style={{ left: `calc(${value}% - 7px)` }}
                    ></div>
                </div>
                <button 
                    onClick={handleReset}
                    className="text-[10px] px-2 py-1 bg-[#27272A] hover:bg-[#3F3F46] rounded text-white transition"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

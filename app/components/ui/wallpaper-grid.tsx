"use client";

interface WallpaperGridProps {
    selectedIndex?: number;
    onSelect?: (index: number) => void;
    count?: number;
}

export function WallpaperGrid({ selectedIndex = -1, onSelect, count = 12 }: WallpaperGridProps) {
    return (
        <div className="grid grid-cols-6 gap-2">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    onClick={() => onSelect?.(i)}
                    className={`aspect-square rounded-full cursor-pointer hover:ring-2 ring-white/30 transition ${
                        selectedIndex === i ? "ring-2 ring-white" : ""
                    }`}
                    style={{
                        background: `linear-gradient(${135 + i * 20}deg, #a855f7, #3b82f6)`
                    }}
                />
            ))}
        </div>
    );
}

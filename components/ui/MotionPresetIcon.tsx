"use client";

import type { MockupMotionPresetId } from "@/lib/mockup-motion";

type MotionCategory = "Entrance" | "Continue" | "Exit";

const CATEGORY_ACCENT: Record<MotionCategory, string> = {
  Entrance: "59, 130, 246",
  Continue: "167, 139, 250",
  Exit: "251, 113, 133",
};

interface MotionPresetIconProps {
  presetId: MockupMotionPresetId;
  category: MotionCategory;
  active?: boolean;
  size?: number;
  fill?: boolean;
  className?: string;
  forceAnimate?: boolean; 
}

export function MotionPresetIcon({
  presetId,
  category,
  active = false,
  size = 40,
  fill = false,
  className = "",
  forceAnimate = false,
}: MotionPresetIconProps) {
  const accent = CATEGORY_ACCENT[category];

  return (
    <div
      className={`mp-stage relative overflow-hidden rounded-[10px] border transition-shadow duration-500 ease-out group-hover:shadow-[0_0_18px_-4px_rgba(var(--mp-accent),0.5)] ${
        active ? "border-white/20 shadow-[0_0_14px_-4px_rgba(var(--mp-accent),0.45)]" : "border-white/10"
      } ${fill ? "h-full w-full" : "shrink-0"} ${forceAnimate ? "force-animate" : ""} ${className}`}
      style={
        {
          ...(fill ? {} : { width: size, height: size }),
          background: "linear-gradient(180deg, #17171a 0%, #050505 100%)",
          "--mp-accent": accent,
        } as React.CSSProperties
      }
    >
      <div className="mp-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <div className="mp-perspective absolute inset-0 flex items-center justify-center">
        <span className={`mp-card mp-card--${presetId}`} />
      </div>
    </div>
  );
}

export function MotionPresetIconStyles() {
  return (
    <style jsx global>{`
      .mp-grid {
        opacity: 0.05;
        background-image: linear-gradient(
            rgba(255, 255, 255, 0.7) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
        background-size: 8px 8px;
      }
      .mp-perspective {
        perspective: 260px;
        transform-style: preserve-3d;
      }
      .mp-card {
        display: block;
        width: 42%;
        height: 37%;
        border-radius: 4px;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.95),
          rgba(255, 255, 255, 0.55)
        );
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        transform-origin: 50% 50%;
        backface-visibility: hidden;
      }

      /* 2. Añadimos la clase .force-animate junto a .group:hover a todos los selectores */
      @media (prefers-reduced-motion: no-preference) {
        .group:hover .mp-card,
        .force-animate .mp-card {
          will-change: transform, filter, opacity;
        }

        .group:hover .mp-card--rise-settle,
        .force-animate .mp-card--rise-settle {
          animation: mp-rise-settle 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--flip-reveal,
        .force-animate .mp-card--flip-reveal {
          animation: mp-flip-reveal 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--focus-in,
        .force-animate .mp-card--focus-in {
          animation: mp-focus-in 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--depth-emerge,
        .force-animate .mp-card--depth-emerge {
          animation: mp-depth-emerge 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--z-spin-reveal,
        .force-animate .mp-card--z-spin-reveal {
          animation: mp-z-spin-reveal 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--isometric-lift,
        .force-animate .mp-card--isometric-lift {
          animation: mp-isometric-lift 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--cinematic-showcase,
        .force-animate .mp-card--cinematic-showcase {
          animation: mp-cinematic-showcase 2.6s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--panoramic-sweep,
        .force-animate .mp-card--panoramic-sweep {
          animation: mp-panoramic-sweep 2.4s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--macro-track,
        .force-animate .mp-card--macro-track {
          animation: mp-macro-track 2.4s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--rim-light-reveal,
        .force-animate .mp-card--rim-light-reveal {
          animation: mp-rim-light-reveal 2.2s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--surface-orbit,
        .force-animate .mp-card--surface-orbit {
          animation: mp-surface-orbit 2.6s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--low-dolly-reveal,
        .force-animate .mp-card--low-dolly-reveal {
          animation: mp-low-dolly-reveal 2.2s ease-in-out infinite alternate;
        }
        .group:hover .mp-card--exit-fade-down,
        .force-animate .mp-card--exit-fade-down {
          animation: mp-exit-fade-down 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
        .group:hover .mp-card--exit-scale-blur,
        .force-animate .mp-card--exit-scale-blur {
          animation: mp-exit-scale-blur 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
        }
      }

      @keyframes mp-rise-settle {
        0% { transform: translateY(45%); opacity: 0.25; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes mp-flip-reveal {
        0% { transform: rotateY(-62deg) scale(0.92); opacity: 0.35; }
        100% { transform: rotateY(0deg) scale(1); opacity: 1; }
      }
      @keyframes mp-focus-in {
        0% { transform: scale(1.22); filter: blur(3.5px); opacity: 0.45; }
        100% { transform: scale(1); filter: blur(0); opacity: 1; }
      }
      @keyframes mp-depth-emerge {
        0% { transform: scale(0.45) rotateX(22deg) rotateY(-20deg); filter: blur(5px); opacity: 0; }
        100% { transform: scale(1) rotateX(0) rotateY(0); filter: blur(0); opacity: 1; }
      }
      @keyframes mp-z-spin-reveal {
        0% { transform: scale(0.62) rotateZ(-78deg) rotateX(38deg); opacity: 0.5; }
        100% { transform: scale(1) rotateZ(0) rotateX(0); opacity: 1; }
      }
      @keyframes mp-isometric-lift {
        0% { transform: scale(1.28) rotateX(42deg) rotateZ(-18deg); }
        100% { transform: scale(1) rotateX(8deg) rotateZ(0deg); }
      }
      @keyframes mp-cinematic-showcase {
        0% { transform: scale(1.4) translate(8%, 6%) rotateX(5deg) rotateY(8deg); filter: blur(1.5px); }
        100% { transform: scale(1) translate(0, 0) rotateX(0) rotateY(0); filter: blur(0); }
      }
      @keyframes mp-panoramic-sweep {
        0% { transform: scale(1.3) translateX(-16%) rotateY(-24deg); }
        100% { transform: scale(1.1) translateX(14%) rotateY(16deg); }
      }
      @keyframes mp-macro-track {
        0% { transform: scale(1.7) translate(10%, 10%) rotateX(32deg); }
        100% { transform: scale(1) translate(-6%, -6%) rotateX(0deg); }
      }
      @keyframes mp-rim-light-reveal {
        0% { transform: scale(1.55) rotateX(55deg) rotateY(38deg); filter: brightness(0.35) blur(2.5px); opacity: 0.4; }
        100% { transform: scale(1) rotateX(0) rotateY(0); filter: brightness(1.2) blur(0); opacity: 1; }
      }
      @keyframes mp-surface-orbit {
        0% { transform: scale(1.22) rotateX(48deg); }
        100% { transform: scale(1.05) rotateX(14deg) rotateY(12deg); }
      }
      @keyframes mp-low-dolly-reveal {
        0% { transform: scale(1.45) rotateX(32deg) translateY(8%); }
        100% { transform: scale(1) rotateX(8deg) translateY(-4%); }
      }
      @keyframes mp-exit-fade-down {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(30%); opacity: 0; }
      }
      @keyframes mp-exit-scale-blur {
        0% { transform: scale(1); filter: blur(0); opacity: 1; }
        100% { transform: scale(1.3); filter: blur(4.5px); opacity: 0; }
      }
    `}</style>
  );
}
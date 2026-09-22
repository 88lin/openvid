"use client";

import { memo, useCallback, useRef, useState } from "react";

type Props = {
  src?: string;
  poster?: string;
  className?: string;
};

export const HeroSquircleVideo = memo(function HeroSquircleVideo({
  src = "/videos/hero/demo-hero-desktop.mp4",
  poster = "/images/pages/preview-editor-poster.webp",
  className = "size-[92px] left-[84%] top-[22%] sm:size-[64px] sm:left-[50%] sm:top-[82%] lg:size-[104px] lg:left-[84%] lg:top-[22%]",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { ...dragOffset };
    setIsDragging(true);
  }, [dragOffset]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const next = { x: dragOffsetRef.current.x + dx, y: dragOffsetRef.current.y + dy };
    setDragOffset(next);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    pointerIdRef.current = null;
    dragOffsetRef.current = { ...dragOffset };
    setIsDragging(false);
  }, [dragOffset]);

  // Reset drag con doble click
  const onDoubleClick = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      role="application"
      aria-label="Video flotante arrastrable (doble click para centrar)"
      aria-grabbed={isDragging}
      className={`group absolute z-20 select-none touch-none will-change-transform -translate-x-1/2 -translate-y-1/2 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{
        transform: `translate(-50%, -50%) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transition: isDragging ? "none" : "transform 120ms ease-out",
        touchAction: "none",
      }}
    >
      <div className="relative size-full overflow-hidden squircle-element-camera shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/15 bg-black rounded-[20px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={poster}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="block size-full object-cover pointer-events-none select-none"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {isDragging && (
        <div
          className="pointer-events-none absolute -inset-1 rounded-[24px] border border-white/20"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

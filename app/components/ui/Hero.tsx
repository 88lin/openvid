"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveUploadedVideo } from "@/lib/video-upload-cache";

interface HeroProps {
    onVideoUpload?: (file: File) => void;
}

export default function Hero({ onVideoUpload }: HeroProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith("video/")) return;
        setIsUploading(true);
        try {
            // Save video to IndexedDB before navigating
            await saveUploadedVideo(file);
            
            if (onVideoUpload) {
                onVideoUpload(file);
            }
            
            // Navigate to editor after saving
            router.push("/editor");
        } catch (error) {
            console.error("Error uploading video:", error);
            setIsUploading(false);
        }
    }, [onVideoUpload, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Evitamos que el leave se dispare si estamos dentro del mismo contenedor
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <>
            <h1 className="animate-reveal text-5xl md:text-7xl font-semibold text-white tracking-tight mb-6 leading-[1.1] drop-shadow-[1.2px_1.2px_100.2px_rgba(183,203,248,1)]">
                Grabación de {" "}
                <span className="relative inline-flex items-center">
                    <img
                        src="/svg/pantalla.svg"
                        alt="Pantalla"
                        className="inline-block h-[1.6em] w-auto align-middle translate-y-[0.1em] sm:translate-y-[0.3em]"
                    />
                    <img
                        src="/svg/cursor-animate.svg"
                        className="absolute -top-18 sm:-top-25 -right-28 sm:-right-30 h-[4em] w-auto"
                        alt="Decoración"
                    />
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-200 via-neutral-400 to-[#003780]">
                    edita en segundos
                </span>
            </h1>

            <p className="animate-reveal [animation-delay:150ms] text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                Añade zooms suaves, mockups, personaliza fondos y exporta demos profesionales sin editores complejos.
            </p>

            <div className="animate-reveal [animation-delay:300ms] flex flex-col sm:flex-row items-center justify-center gap-3">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`
                        relative flex items-center justify-center px-5 squircle-element border-2 border-dashed cursor-pointer
                        transition-all duration-200 text-sm font-medium 
                        w-full sm:w-70 h-13
                        ${isDragging
                            ? "border-blue-400/70 bg-blue-500/10 text-blue-300 scale-[1.02]"
                            : isUploading
                                ? "border-white/20 bg-white/5 text-white/40 cursor-not-allowed"
                                : "border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10 hover:text-white/80"
                        }
                    `}
                >
                    <div className="flex items-center justify-center gap-3 pointer-events-none w-full">
                        {isUploading ? (
                            <>
                                <Icon icon="svg-spinners:ring-resize" width="18" className="text-blue-400 shrink-0" />
                                <span>Cargando video...</span>
                            </>
                        ) : isDragging ? (
                            <>
                                <Icon icon="ph:arrow-fat-down-bold" width="18" className="text-blue-400 shrink-0" />
                                <span>Suelta el video aquí</span>
                            </>
                        ) : (
                            <>
                                <Icon icon="mage:video-upload" width="20" className="shrink-0" />
                                <span>Subir video</span>
                                <span className="text-white/40 text-xs">MP4, WebM, MOV</span>
                            </>
                        )}
                    </div>

                    {isDragging && (
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/5 blur-sm pointer-events-none" />
                    )}
                </div>
                
                <Button asChild variant="primary" size="lg" className="text-[14px] p-6 w-full sm:w-70 h-13">
                    <a href="#docs">
                        <div className="size-7 rounded-full bg-white flex items-center justify-center shrink-0">
                            <Icon icon="fluent:screenshot-record-16-regular" className="size-5 text-red-500" />
                        </div>
                        Grabar pantalla
                    </a>
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </>
    );
}
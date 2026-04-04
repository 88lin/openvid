"use client";

import React, { useEffect, useRef } from "react";

export default function DemoVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => { });
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full flex flex-col items-center mb-30">
            <h2 className="text-4xl md:text-6xl text-center font-bold tracking-tighter text-white mb-10 leading-tight drop-shadow-[1.2px_1.2px_100.2px_rgba(183,203,248,1)]">
                Mira lo que puedes <br />
                <span className="bg-linear-to-r from-[#003780] to-white bg-clip-text text-transparent">
                    crear con openvid
                </span>
            </h2>

            <div className="relative group w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0E0E12] shadow-2xl transform-gpu">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

                <div className="absolute inset-0 bg-linear-to-t from-[#0E0E12] via-transparent to-transparent z-10 pointer-events-none" />

                <video
                    ref={videoRef}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/images/pages/openvid2.webp"
                    className="relative z-0 w-full h-auto object-cover transform-gpu transition-transform duration-700 group-hover:scale-[1.02]"
                >
                    <source src="images/pages/demo.mp4" type="video/mp4" />
                    Tu navegador no soporta la reproducción de videos.
                </video>

            </div>
        </div>
    );
}
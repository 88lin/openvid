"use client";

import Footer from "@/app/components/common/Footer";
import Header from "@/app/components/common/Header";
import RecordingOverlay from "@/app/components/ui/RecordingOverlay";
import { RecordingProvider } from "@/app/contexts/RecordingContext";
import { ReactLenis } from "lenis/react";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <RecordingProvider>
            <ReactLenis
                root
                options={{
                    lerp: 0.08,
                    smoothWheel: true,
                    wheelMultiplier: 1.1,
                }}
            >
                <div className="flex min-h-screen flex-col text-neutral-300 bg-neutral-950 dark">
                    <Header />
                    <main className="flex-1 w-full">
                        {children}
                    </main>
                    <Footer />
                </div>
                <RecordingOverlay />
            </ReactLenis>
        </RecordingProvider>
    );
}

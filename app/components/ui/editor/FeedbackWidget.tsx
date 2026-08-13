"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { TooltipAction } from "@/components/ui/tooltip-action";
import { useAuth } from "@/app/contexts/useAuth";
import { Button } from "@/components/ui/button";

type FeedbackType = "bug" | "idea" | "other";

const TYPE_OPTIONS: { value: FeedbackType; icon: string }[] = [
    { value: "bug", icon: "solar:bug-bold" },
    { value: "idea", icon: "solar:lightbulb-bold" },
    { value: "other", icon: "solar:chat-round-dots-bold" },
];

const MESSAGE_MAX_LENGTH = 2000;

const emptySubscribe = () => () => { };
function useIsClient() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}

export function FeedbackWidget() {
    const t = useTranslations("feedback");
    const { user } = useAuth();
    const isClient = useIsClient();

    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>("bug");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    const reset = useCallback(() => {
        setType("bug");
        setMessage("");
        setEmail("");
        setHoneypot("");
        setStatus("idle");
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(reset, 200);
    }, [reset]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (honeypot) return;
            if (message.trim().length < 4) return;

            setStatus("sending");

            try {
                const res = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type,
                        message,
                        email: user ? undefined : email.trim() || undefined,
                        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
                        honeypot,
                    }),
                });

                if (!res.ok) throw new Error("Request failed");

                setStatus("success");
                setTimeout(handleClose, 1500);
            } catch (err) {
                console.error("Error sending feedback:", err);
                setStatus("error");
            }
        },
        [honeypot, message, type, email, user, handleClose]
    );

    const modalContent = isOpen && (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md transition-all duration-500 p-4"
            onPointerDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="p-8 bg-black border border-white/10 squircle-element-camera shadow-[0_0_80px_-15px_rgba(0,0,0,1)] w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5 px-3 py-1 ">
                        <span
                            id="feedback-dialog-title"
                            className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70"
                        >
                            {t("title")}
                        </span>
                    </div>

                    <button
                        onClick={handleClose}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all duration-200"
                        aria-label={t("close")}
                    >
                        <Icon icon="lucide:x" className="size-4" aria-hidden="true" />
                    </button>
                </div>

                {status === "success" ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                            <Icon icon="solar:check-circle-bold" className="size-6" />
                        </div>
                        <p className="text-base font-medium text-white tracking-tight">
                            {t("successMessage")}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                        />

                        <div className="grid grid-cols-3 gap-2">
                            {TYPE_OPTIONS.map((opt) => {
                                const isSelected = type === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setType(opt.value)}
                                        className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-200 squircle-element-camera cursor-pointer focus:outline-none w-full h-full min-h-[90px]
                                            ${isSelected
                                                ? "border-blue-500/40 text-blue-400"
                                                : "bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white hover:border-white/20"
                                            }`}
                                        style={isSelected ? {
                                            background: "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.1) 64%)",
                                            boxShadow: "rgb(255, 255, 255) 0px 0.5rem 0.2rem -0.5rem inset, rgba(59, 130, 246, 0.25) 0px 0px 20px 0px, rgba(0, 0, 0, 0.4) 0px 4px 6px 0px",
                                        } : undefined}
                                    >
                                        <div className="flex items-center justify-center transition-transform duration-300 scale-110 group-hover:scale-115 size-5">
                                            <Icon icon={opt.icon} className="size-5" aria-hidden="true" />
                                        </div>

                                        {isSelected && (
                                            <div className="absolute left-3 w-16 h-6 top-3 bg-white rounded-full blur-[10px] rotate-45 pointer-events-none opacity-20" />
                                        )}

                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center mt-0.5">
                                            {t(`types.${opt.value}`)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-1">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t("messagePlaceholder")}
                                required
                                minLength={7}
                                maxLength={MESSAGE_MAX_LENGTH}
                                rows={7}
                                className="w-full resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                            />
                            <div className="flex justify-end px-1">
                                <span className="text-[11px] font-mono text-white/40 tabular-nums">
                                    {message.length}/{MESSAGE_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        {!user && (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("emailPlaceholder")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                            />
                        )}

                        {status === "error" && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                                <Icon icon="lucide:alert-circle" className="size-4 shrink-0" />
                                <span>{t("errorMessage")}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={status === "sending" || message.trim().length < 4}
                            className="w-full h-11 text-sm font-semibold rounded-xl active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {status === "sending" ? (
                                <Icon icon="svg-spinners:180-ring" className="size-4" />
                            ) : (
                                <>
                                    <Icon icon="solar:plain-bold" className="size-4" />
                                    <span>{t("submit")}</span>
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );

    return (
        <>
            <TooltipAction label={t("tooltip")}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white hover:text-white transition-all duration-200 shrink-0 shadow-gray-700 shadow-lg hover:scale-105 active:scale-95"
                    aria-label={t("tooltip")}
                >
                    <Icon icon="solar:chat-round-dots-bold" className="size-6" aria-hidden="true" />
                </button>
            </TooltipAction>

            {isClient && isOpen && createPortal(modalContent, document.body)}
        </>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { Icon } from "@iconify/react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function MobileMenu() {
  const t = useTranslations('header');
  const [isOpen, setIsOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const closeMenu = () => setIsOpen(false);

  if (!isMounted) {
    return (
      <button
        className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        aria-label={t('menu')}
      >
        <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          aria-label={t('menu')}
          aria-expanded={isOpen}
        >
          <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-0 right-0 bottom-0 w-70 bg-[#0a0a0a] border-l border-white/10 z-50 animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex flex-col">
              <Dialog.Title className="sr-only">{t('menu')}</Dialog.Title>
              <Dialog.Description className="sr-only">{t('menu')}</Dialog.Description>

              <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                <Image src="/svg/logo-openvid.svg" alt="Logo" width={32} height={32} />
                <Image src="/svg/openvid.svg" alt="Openvid" width={80} height={20} />
              </Link>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label={t('close')}
              >
                <Icon icon="solar:close-square-linear" className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <Link
                href="/video-editor"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="mdi:movie-edit-outline" className="w-5 h-5" aria-hidden="true" />
                <span>{t('videoEditor')}</span>
              </Link>

              <Link
                href="/screen-recorder"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="mdi:record-circle-outline" className="w-5 h-5" aria-hidden="true" />
                <span>{t('screenRecorder')}</span>
              </Link>

              <Link
                href="/guide"
                target="_blank"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="solar:document-text-linear" className="w-5 h-5" aria-hidden="true" />
                <span>{t('guide')}</span>
              </Link>

              <a
                href="https://github.com/CristianOlivera1/openvid"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="mdi:github" className="w-5 h-5" aria-hidden="true" />
                <span>{t('github')}</span>
                <Icon icon="solar:external-link-linear" className="w-4 h-4 ml-auto opacity-50" aria-hidden="true" />
              </a>

              <Link
                href="/donate"
                target="_blank"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="mdi:donate" className="w-5 h-5" aria-hidden="true" />
                <span>{t('donate')}</span>
                <Icon icon="solar:external-link-linear" className="w-4 h-4 ml-auto opacity-50" aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

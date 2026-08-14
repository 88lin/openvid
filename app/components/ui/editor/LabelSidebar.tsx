import { useTranslations } from 'next-intl';

interface LabelSidebarProps {
    audioTracksCount?: number;
    motionTracksCount?: number;
    elementsCount?: number;
}

export default function LabelSidebar({ 
    audioTracksCount = 0, 
    motionTracksCount = 0, 
    elementsCount = 0 
}: LabelSidebarProps) {
    const t = useTranslations('labelSidebar');
    const hasAdditionalRows = audioTracksCount > 0 || motionTracksCount > 0 || elementsCount > 0;

    return (
        <div className="absolute left-0 top-0 bottom-0 w-14 shrink-0 border-r border-white/5 flex flex-col bg-[#0D0D11] z-30">
            <div className="h-5.5 border-b border-white/5" />

            <div className="flex-1 flex items-center px-3">
                <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                    {t('video')}
                </span>
            </div>

            <div className={`flex items-center px-3 border-t border-white/5 transition-all duration-300 ${
                hasAdditionalRows ? 'h-14' : 'h-16'
            }`}>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                    {t('zoom')}
                </span>
            </div>

            {elementsCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-white/5 bg-white/1">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                        {t('elements')}
                    </span>
                </div>
            )}

            {audioTracksCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-white/5 bg-white/1">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                        {t('audio')}
                    </span>
                </div>
            )}

            {motionTracksCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-white/5 bg-white/1">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-500">
                        {t('motion')}
                    </span>
                </div>
            )}
        </div>
    );
}

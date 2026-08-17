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
        <div className="absolute left-0 top-0 bottom-0 w-14 shrink-0 border-r border-border flex flex-col bg-background z-30">
            <div className="h-5.5 border-b border-border" />

            <div className="flex-1 flex items-center px-3">
                <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                    {t('video')}
                </span>
            </div>

            <div className={`flex items-center px-3 border-t border-border transition-all duration-300 ${
                hasAdditionalRows ? 'h-14' : 'h-16'
            }`}>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                    {t('zoom')}
                </span>
            </div>

            {elementsCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-border bg-muted/40">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('elements')}
                    </span>
                </div>
            )}

            {audioTracksCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-border bg-muted/40">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('audio')}
                    </span>
                </div>
            )}

            {motionTracksCount > 0 && (
                <div className="h-14 flex items-center px-3 border-t border-border bg-muted/40">
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {t('motion')}
                    </span>
                </div>
            )}
        </div>
    );
}

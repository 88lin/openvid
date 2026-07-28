interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
}

export function Toggle({ 
    checked, 
    onChange, 
    disabled = false, 
    activeColor = "bg-[#00A3FF]"
}: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                if (!disabled) {
                    onChange(!checked);
                }
            }}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                disabled
                    ? "opacity-50 cursor-not-allowed bg-white/5"
                    : checked
                        ? activeColor
                        : "bg-white/10"
            }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                    checked ? "translate-x-4" : "translate-x-0"
                }`}
            />
        </button>
    );
}

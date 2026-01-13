'use client';

interface ProgressBarProps {
    value: number;
    max: number;
    label?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({
    value,
    max,
    label,
    showPercentage = true,
    size = 'md',
    variant = 'default',
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variants = {
        default: 'from-[#EC4899] to-[#D946EF]',
        success: 'from-[#10B981] to-[#34D399]',
        warning: 'from-[#D946EF] to-[#A855F7]',
        danger: 'from-[#EF4444] to-[#F87171]',
    };

    // Auto-select variant based on percentage
    const autoVariant = percentage < 25 ? 'danger' : percentage < 50 ? 'warning' : variant;

    return (
        <div className="w-full">
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-2">
                    {label && <span className="text-sm text-[#94A3B8]">{label}</span>}
                    {showPercentage && (
                        <span className="text-sm font-mono text-[#F8FAFC]">
                            {value}/{max} ({percentage.toFixed(0)}%)
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-[#334155] rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${sizes[size]} bg-gradient-to-r ${variants[autoVariant]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

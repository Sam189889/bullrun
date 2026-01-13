'use client';

export function WarningBanner() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#D946EF] to-[#EF4444] py-2 px-4">
            <p className="text-center text-sm font-semibold text-white">
                ⚠️ IMPORTANT: Community-Led Project | Trade at Your Own Risk
            </p>
        </div>
    );
}

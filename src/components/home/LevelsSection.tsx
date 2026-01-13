'use client';

const levels = [
    { level: 'Sponsor', rate: '$0.033', color: '#EC4899' },
    { level: 'Level 1-2', rate: '$0.0125', color: '#D946EF' },
    { level: 'Level 3-15', rate: '$0.0083', color: '#3B82F6' },
];

const eligibility = [
    { referrals: 2, levels: 3 },
    { referrals: 4, levels: 6 },
    { referrals: 6, levels: 9 },
    { referrals: 8, levels: 12 },
    { referrals: 10, levels: 15 },
];

export function LevelsSection() {
    return (
        <section className="py-16 sm:py-24 bg-[#0F172A] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, #EC4899 1px, transparent 1px), linear-gradient(to bottom, #EC4899 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <div className="container-app relative z-10 px-4">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left - Content */}
                    <div className="animate-slide-up">
                        <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs sm:text-sm font-medium mb-4">
                            📈 15-Level Income System
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                            <span className="text-[#F8FAFC]">Earn From </span>
                            <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">15 Levels</span>
                        </h2>
                        <p className="text-[#94A3B8] text-sm sm:text-lg mb-6 sm:mb-8">
                            60% of registration fees are distributed across 15 levels in a 2×2 auto-fill matrix system.
                        </p>

                        {/* Income Rates */}
                        <div className="space-y-3 mb-6 sm:mb-8">
                            {levels.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-[#1E293B] rounded-lg border border-[#334155] card-hover">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[#F8FAFC] font-medium text-sm sm:text-base">{item.level}</span>
                                    </div>
                                    <span className="text-[#EC4899] font-mono font-bold text-sm sm:text-base">{item.rate}/NFT</span>
                                </div>
                            ))}
                        </div>

                        {/* Distribution */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#EC4899]/10 to-transparent rounded-lg border border-[#EC4899]/30">
                            <p className="text-xs sm:text-sm text-[#94A3B8] flex flex-wrap gap-2">
                                <span><span className="text-[#EC4899] font-bold">60%</span> Level Income</span>
                                <span className="text-[#334155]">|</span>
                                <span><span className="text-[#10B981] font-bold">20%</span> Sponsor</span>
                                <span className="text-[#334155]">|</span>
                                <span><span className="text-[#3B82F6] font-bold">20%</span> Creator</span>
                            </p>
                        </div>
                    </div>

                    {/* Right - Eligibility Chart */}
                    <div className="bg-[#1E293B] rounded-2xl p-4 sm:p-6 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC] mb-4 sm:mb-6 text-center">
                            🔓 Level Unlock Requirements
                        </h3>
                        <div className="space-y-3">
                            {eligibility.map((item, index) => (
                                <div key={index} className="relative animate-slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-[#0F172A] rounded-lg">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center font-bold text-[#0F172A] text-sm sm:text-base">
                                                {item.referrals}
                                            </div>
                                            <span className="text-[#94A3B8] text-xs sm:text-sm">Referrals</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="text-xl sm:text-2xl font-bold text-[#10B981]">{item.levels}</span>
                                            <span className="text-[#64748B] text-xs">Levels</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-2 h-1 bg-[#334155] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#EC4899] to-[#10B981] rounded-full transition-all duration-500"
                                            style={{ width: `${(item.levels / 15) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

export function BurningSection() {
    return (
        <section className="py-16 sm:py-24 bg-[#0F172A] relative overflow-hidden">
            {/* Animated fire particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 text-3xl sm:text-4xl burn-effect opacity-30">🔥</div>
                <div className="absolute top-1/3 right-1/4 text-2xl sm:text-3xl burn-effect opacity-20" style={{ animationDelay: '0.5s' }}>🔥</div>
                <div className="absolute bottom-1/4 left-1/3 text-4xl sm:text-5xl burn-effect opacity-25" style={{ animationDelay: '1s' }}>🔥</div>
                <div className="absolute bottom-1/3 right-1/3 text-2xl sm:text-3xl burn-effect opacity-20" style={{ animationDelay: '1.5s' }}>🔥</div>
            </div>

            <div className="container-app relative z-10 px-4">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16 animate-slide-up">
                    <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-xs sm:text-sm font-medium mb-4">
                        🔥 Burning Mechanism
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#F8FAFC]">Burn & Earn </span>
                        <span className="bg-gradient-to-r from-[#D946EF] to-[#EF4444] bg-clip-text text-transparent">$25.75</span>
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-sm sm:text-lg px-4">
                        Our unique burning mechanism converts $50 NFTs into 3× $25 NFTs with guaranteed rewards
                    </p>
                </div>

                {/* Burning Flowchart */}
                <div className="max-w-4xl mx-auto mb-10 sm:mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                        {[
                            { icon: '💰', title: '$50 NFT', desc: 'Purchased', bg: 'from-[#1E3A8A] to-[#0F172A]', border: '#334155' },
                            { icon: '🔥', title: 'Auto Burn', desc: '100% to Burn', bg: 'from-[#D946EF]/20 to-[#EF4444]/20', border: '#D946EF', animate: true },
                            { icon: '🪙', title: '3× $25', desc: 'NFTs Created', bg: 'from-[#10B981]/20 to-[#0F172A]', border: '#10B981' },
                            { icon: '💎', title: '$25.75', desc: 'Reward (1hr)', bg: 'from-[#EC4899]/20 to-[#D946EF]/20', border: '#EC4899', glow: true },
                        ].map((step, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-4">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`
                    w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl 
                    bg-gradient-to-br ${step.bg} border flex items-center justify-center 
                    text-2xl sm:text-3xl md:text-4xl mb-2
                    ${step.animate ? 'burn-effect' : ''} 
                    ${step.glow ? 'pulse-glow' : ''}
                  `} style={{ borderColor: step.border }}>
                                        {step.icon}
                                    </div>
                                    <h4 className="font-semibold text-[#F8FAFC] text-xs sm:text-sm">{step.title}</h4>
                                    <p className="text-[8px] sm:text-xs text-[#64748B]">{step.desc}</p>
                                </div>
                                {index < 3 && (
                                    <div className="text-lg sm:text-2xl text-[#EC4899] rotate-90 sm:rotate-0">➜</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reward Breakdown */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    <div className="bg-[#1E293B] rounded-2xl p-4 sm:p-6 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] mb-3 sm:mb-4">$25 NFT Sale Distribution</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { label: 'Holder Receives', value: '$17.166', color: '#10B981' },
                                { label: 'Burning Wallet', value: '$7.50', color: '#D946EF' },
                                { label: 'Level Income', value: 'Distributed', color: '#3B82F6' },
                                { label: 'Creator Fee', value: '$0.1666', color: '#64748B' },
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-[#94A3B8] text-xs sm:text-sm">{item.label}</span>
                                    <span className="font-mono font-bold text-xs sm:text-sm" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#1E293B] rounded-2xl p-4 sm:p-6 border border-[#EC4899]/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-base sm:text-lg font-bold text-[#EC4899] mb-3 sm:mb-4">🔥 Burn Reward</h3>
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8] text-xs sm:text-sm">Buyer Receives</span>
                                <span className="text-[#EC4899] font-mono font-bold text-lg sm:text-xl">$25.75</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8] text-xs sm:text-sm">Creator</span>
                                <span className="text-[#F8FAFC] font-mono text-xs sm:text-sm">$0.25</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#94A3B8] text-xs sm:text-sm">Sponsor</span>
                                <span className="text-[#F8FAFC] font-mono text-xs sm:text-sm">$0.05</span>
                            </div>
                            <div className="border-t border-[#334155] pt-2 sm:pt-3 mt-2 sm:mt-3">
                                <p className="text-[10px] sm:text-xs text-[#64748B]">
                                    ⏰ Reward credited 1 hour after purchase
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

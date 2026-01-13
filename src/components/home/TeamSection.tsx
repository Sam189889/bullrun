'use client';

export function TeamSection() {
    return (
        <section className="py-16 sm:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]" />

            <div className="container-app relative z-10 px-4">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left - Matrix Visualization */}
                    <div className="order-2 lg:order-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative bg-[#1E293B] rounded-2xl p-6 sm:p-8 border border-[#334155]">
                            <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] mb-4 sm:mb-6 text-center">2×2 Auto-Fill Matrix</h3>

                            {/* Matrix Tree */}
                            <div className="flex flex-col items-center">
                                {/* Level 0 - You */}
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_30px_rgba(255,215,0,0.3)] float-slow">
                                    👤
                                </div>
                                <div className="w-0.5 h-6 sm:h-8 bg-[#334155]" />

                                {/* Level 1 */}
                                <div className="flex gap-10 sm:gap-16 items-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E3A8A] flex items-center justify-center text-lg sm:text-xl float-medium" style={{ animationDelay: '0.5s' }}>👥</div>
                                        <span className="text-[10px] sm:text-xs text-[#64748B] mt-1">Left</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E3A8A] flex items-center justify-center text-lg sm:text-xl float-medium" style={{ animationDelay: '1s' }}>👥</div>
                                        <span className="text-[10px] sm:text-xs text-[#64748B] mt-1">Right</span>
                                    </div>
                                </div>
                                <div className="flex gap-6 sm:gap-8 mt-2">
                                    <div className="w-0.5 h-4 sm:h-6 bg-[#334155]" />
                                    <div className="w-16 sm:w-24" />
                                    <div className="w-0.5 h-4 sm:h-6 bg-[#334155]" />
                                </div>

                                {/* Level 2 */}
                                <div className="flex gap-2 sm:gap-4 items-center">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#334155] flex items-center justify-center text-xs sm:text-sm float-fast" style={{ animationDelay: '0.2s' }}>👤</div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#334155] flex items-center justify-center text-xs sm:text-sm float-fast" style={{ animationDelay: '0.4s' }}>👤</div>
                                    <div className="w-4 sm:w-8" />
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#334155] flex items-center justify-center text-xs sm:text-sm float-fast" style={{ animationDelay: '0.6s' }}>👤</div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#334155] flex items-center justify-center text-xs sm:text-sm float-fast" style={{ animationDelay: '0.8s' }}>👤</div>
                                </div>
                            </div>

                            <p className="text-center text-[#94A3B8] text-xs sm:text-sm mt-4 sm:mt-6">
                                Auto-fill places referrals optimally
                            </p>
                        </div>
                    </div>

                    {/* Right - Content */}
                    <div className="order-1 lg:order-2 animate-slide-up">
                        <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs sm:text-sm font-medium mb-4">
                            👥 Team & Referrals
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                            <span className="text-[#F8FAFC]">Build Your </span>
                            <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Network</span>
                        </h2>
                        <p className="text-[#94A3B8] text-sm sm:text-lg mb-6 sm:mb-8">
                            Invite traders and earn from their activity. Our 2×2 auto-fill matrix ensures optimal placement.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { icon: '💰', title: '20% Direct Referral Bonus', desc: 'Earn 20% of every direct referral\'s registration fee' },
                                { icon: '📈', title: 'Unlock More Levels', desc: 'More referrals = more income levels unlocked (up to 15)' },
                                { icon: '🔄', title: 'Auto-Fill Placement', desc: 'System automatically places team members optimally' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#1E293B] rounded-lg border border-[#334155] card-hover animate-slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-[#F8FAFC] text-sm sm:text-base">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-[#94A3B8]">{item.desc}</p>
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

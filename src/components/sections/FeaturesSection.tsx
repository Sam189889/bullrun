"use client";

export function FeaturesSection() {
    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-[#0a0f1a] via-[#0F172A] to-[#0F172A]">
            <div className="relative max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-medium mb-6">
                        ✨ Exclusive Benefits
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white">
                        Why <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">Bull Run?</span>
                    </h2>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Burn Mechanism */}
                    <div className="group relative bg-gradient-to-br from-orange-500/10 via-slate-900/50 to-red-500/10 border border-orange-500/30 rounded-3xl p-8 hover:border-orange-500/60 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative">
                            <span className="text-5xl mb-6 block">🔥</span>
                            <h3 className="text-2xl font-bold text-white mb-4">Burn Mechanisms</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Convert multiple 1.0 Bulls into special editions in 2.0 with enhanced traits.
                                Burn to earn exclusive upgrades and rare attributes that increase in value.
                            </p>
                        </div>
                    </div>

                    {/* Alpha Community */}
                    <div className="group relative bg-gradient-to-br from-purple-500/10 via-slate-900/50 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/60 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative">
                            <span className="text-5xl mb-6 block">👑</span>
                            <h3 className="text-2xl font-bold text-white mb-4">Alpha Community</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Private Discord channels with market analysis, whitelist opportunities, and exclusive IRL events.
                                Join the elite circle of Bull Run holders.
                            </p>
                        </div>
                    </div>

                    {/* Instant Earnings */}
                    <div className="group relative bg-gradient-to-br from-green-500/10 via-slate-900/50 to-emerald-500/10 border border-green-500/30 rounded-3xl p-8 hover:border-green-500/60 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative">
                            <span className="text-5xl mb-6 block">💰</span>
                            <h3 className="text-2xl font-bold text-white mb-4">20% Instant Earnings</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Earn 20% commission instantly on every resale of your NFT.
                                Your Bull keeps working for you, trade after trade.
                            </p>
                        </div>
                    </div>

                    {/* Multi-Level Rewards */}
                    <div className="group relative bg-gradient-to-br from-blue-500/10 via-slate-900/50 to-cyan-500/10 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/60 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative">
                            <span className="text-5xl mb-6 block">🎯</span>
                            <h3 className="text-2xl font-bold text-white mb-4">Multi-Level Rewards</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Community-driven rewards system. Earn from your network as the ecosystem grows.
                                Multiple income streams from a single NFT.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

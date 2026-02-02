"use client";

export function RoadmapSection() {
    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0a0f1a] to-[#0F172A]">
            {/* Background */}
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23EC4899\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }} />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/30 text-[#EC4899] text-sm font-medium mb-6">
                        🗺️ Multi-Version Roadmap
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        The Charge <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">Continues</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Bull Run is just the beginning. We're building an interconnected ecosystem across multiple blockchain dimensions.
                    </p>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Version 1.0 */}
                    <div className="relative group">
                        <div className="bg-gradient-to-b from-orange-500/20 via-slate-900/80 to-slate-900 border border-orange-500/40 rounded-3xl p-6 h-full hover:border-orange-500/70 transition-all">
                            {/* Icon */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">🔥</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-orange-400">BULL RUN 1.0</h3>
                                    <span className="text-sm text-orange-300/70">(Current)</span>
                                </div>
                            </div>

                            {/* Bull Image */}
                            <div className="w-full h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                                <img
                                    src="/bulls/bull1.png"
                                    alt="Bull Run 1.0"
                                    className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-500"
                                />
                            </div>

                            {/* Features */}
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-orange-400 mt-1">•</span>
                                    10,000 Genesis Bulls on Ethereum
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-orange-400 mt-1">•</span>
                                    Core community launch
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-orange-400 mt-1">•</span>
                                    Crofuer Technology v1.0
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Version 2.0 */}
                    <div className="relative group">
                        <div className="bg-gradient-to-b from-cyan-500/20 via-slate-900/80 to-slate-900 border border-cyan-500/40 rounded-3xl p-6 h-full hover:border-cyan-500/70 transition-all">
                            {/* Icon */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">🚀</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-cyan-400">BULL RUN 2.0</h3>
                                    <span className="text-sm text-cyan-300/70">(Q4 2027)</span>
                                </div>
                            </div>

                            {/* Winged Bull Image */}
                            <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative">
                                <img
                                    src="/bulls/bull5.png"
                                    alt="Bull Run 2.0"
                                    className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-500"
                                />
                                {/* Wings overlay effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Features */}
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    Special Bridge to OpenSea: Shift 1.0 to 2.0
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    New blockchain integration
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    Enhanced Crofuer AI v2.0
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    Cross-chain breeding mechanics
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Future Versions */}
                    <div className="relative group">
                        <div className="bg-gradient-to-b from-purple-500/20 via-slate-900/80 to-slate-900 border border-purple-500/40 rounded-3xl p-6 h-full hover:border-purple-500/70 transition-all">
                            {/* Icon */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">🔮</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-purple-400">FUTURE VERSIONS</h3>
                                    <span className="text-sm text-purple-300/70">(2028-2029)</span>
                                </div>
                            </div>

                            {/* Hexagon Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {[
                                    { v: '3.0', name: 'Arena', desc: 'PvP battling' },
                                    { v: '4.0', name: 'Legends', desc: 'Mythological expansion' },
                                    { v: '5.0', name: 'Titans', desc: 'Physical/digital hybrids' },
                                    { v: '6.0', name: 'Eternal', desc: 'Ecosystem DAO' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
                                        <span className="text-purple-400 font-bold text-sm">{item.v}</span>
                                        <p className="text-white text-xs font-medium">{item.name}</p>
                                        <p className="text-slate-500 text-[10px]">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <span className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-sm">
                                    🎯 Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

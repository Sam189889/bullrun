"use client";

export function DigitalTitansSection() {
    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#EC4899]/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#F59E0B]/30 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto">
                {/* Badge */}
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/30 text-[#EC4899] text-sm font-medium">
                        🐂 The Legend Begins
                    </span>
                </div>

                {/* Headline */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-6">
                    <span className="bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#F59E0B] bg-clip-text text-transparent">
                        Digital Titans Reborn
                    </span>
                </h2>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg md:text-xl text-slate-300 text-center leading-relaxed mb-12">
                        Bull Run NFT isn't just another collection - it's the <span className="text-[#EC4899] font-semibold">rebirth of financial mythology</span>.
                        Each of our algorithmically-generated Bulls represents raw power, unstoppable momentum, and legendary status in the Web3 arena.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '🦬', title: 'Mythical Minotaurs', desc: 'Ancient power meets modern blockchain' },
                            { icon: '🤖', title: 'Futuristic Cyborgs', desc: 'Tech-enhanced bulls of tomorrow' },
                            { icon: '👑', title: 'Legendary Status', desc: 'Every Bull tells a unique story' },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-[#EC4899]/50 transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                                <span className="text-4xl mb-4 block">{item.icon}</span>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

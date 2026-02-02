"use client";

import { PhoneMockup } from "./PhoneMockup";

export function CrofuerTechSection() {
    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#0a0f1a]">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(236,72,153,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />

            <div className="relative max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
                            ⚡ Core Innovation
                        </span>

                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                            <span className="text-white">Powered by</span>{" "}
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Crofuer AI
                            </span>
                        </h2>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            At the heart of every Bull lies our proprietary <span className="text-cyan-400 font-semibold">Crofuer Technology</span>.
                            This isn't just generative art - it's intelligent design evolution. Our AI understands mythological symbolism,
                            artistic balance, and rarity economics to create Bulls that feel legendary, not random.
                        </p>

                        {/* Features List */}
                        <div className="space-y-4">
                            {[
                                'Mythological accuracy in every trait combination',
                                'Dynamic rarity scoring that evolves with the collection',
                                'Future-proof metadata for cross-version compatibility',
                                'AI-curated trait evolution between project versions',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-0.5">
                                        <span className="text-cyan-400 text-xs">✓</span>
                                    </div>
                                    <p className="text-slate-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Phone Mockup */}
                    <div className="order-first lg:order-last w-full sm:w-auto">
                        <PhoneMockup videoSrc="/video/CrofuerTech.mp4" />
                    </div>
                </div>
            </div>
        </section>
    );
}

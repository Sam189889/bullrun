"use client";

import Link from "next/link";

export function HowToJoinSection() {
    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
            {/* Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EC4899]/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
                        🎯 Get Started
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Claim Your Bull in <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">3 Steps</span>
                    </h2>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        {
                            step: 1,
                            icon: '🔗',
                            title: 'Connect',
                            desc: 'Link your MetaMask or other wallet, load OPBNB & OPUSDT',
                            color: 'from-blue-500 to-cyan-500',
                            border: 'border-blue-500/40'
                        },
                        {
                            step: 2,
                            icon: '🎯',
                            title: 'Select',
                            desc: 'Choose your NFT quantity from the marketplace',
                            color: 'from-purple-500 to-pink-500',
                            border: 'border-purple-500/40'
                        },
                        {
                            step: 3,
                            icon: '⚡',
                            title: 'Charge',
                            desc: 'Confirm transaction. Your Bull charges into your wallet instantly!',
                            color: 'from-orange-500 to-amber-500',
                            border: 'border-orange-500/40'
                        },
                    ].map((item, i) => (
                        <div key={i} className="relative group">
                            {/* Connector Line */}
                            {i < 2 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700 z-10" />
                            )}

                            <div className={`bg-slate-900/80 border ${item.border} rounded-3xl p-8 text-center h-full hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] transition-all`}>
                                {/* Step Number */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${item.color} text-white font-bold text-lg mb-6`}>
                                    {item.step}
                                </div>

                                {/* Icon */}
                                <span className="text-5xl mb-4 block">{item.icon}</span>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EC4899] to-[#EF4444] rounded-full text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] transition-all hover:scale-105">
                        🚀 Start Your Journey
                    </Link>
                </div>
            </div>
        </section>
    );
}

"use client";

import Link from "next/link";

export function FooterCTASection() {
    return (
        <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-[#0F172A] to-black">
            {/* Background Glow */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-[#EC4899]/30 via-[#EC4899]/10 to-transparent blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto text-center">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/30 text-[#EC4899] text-sm font-medium mb-8">
                    🎫 Lifetime Pass
                </span>

                {/* Headline */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                    This isn't just a mint.{" "}
                    <span className="bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#F59E0B] bg-clip-text text-transparent">
                        It's your entry into a multi-version ecosystem.
                    </span>
                </h2>

                {/* Subtext */}
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    Powered by <span className="text-cyan-400 font-semibold">Crofuer Technology</span>.
                    Your 1.0 Bull is your lifetime pass to all future developments.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-[#EC4899] to-[#EF4444] rounded-full text-white font-bold text-xl hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] transition-all hover:scale-105"
                    >
                        🐂 Claim Your Bull Now
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-800 border border-slate-600 rounded-full text-white font-bold text-xl hover:bg-slate-700 transition-all"
                    >
                        📊 View Marketplace
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> 100% On-Chain
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> Verified Smart Contract
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> Instant Transactions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span> 20% Earnings
                    </div>
                </div>
            </div>
        </section>
    );
}

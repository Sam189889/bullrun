'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';

export function CTASection() {
    return (
        <section className="py-16 sm:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 hero-bg" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="hidden sm:block absolute top-10 left-10 text-4xl sm:text-6xl float-slow opacity-20">💰</div>
                <div className="hidden sm:block absolute bottom-10 right-10 text-3xl sm:text-5xl float-medium opacity-15">🔥</div>
                <div className="absolute top-1/2 left-5 text-2xl sm:text-4xl float-fast opacity-10">💎</div>
                <div className="absolute top-1/2 right-5 text-2xl sm:text-4xl burn-effect opacity-20">🪙</div>
            </div>

            <div className="container-app relative z-10 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Main CTA Card */}
                    <div className="relative group animate-slide-up">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#EC4899] via-[#D946EF] to-[#EC4899] rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

                        <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#EC4899]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center overflow-hidden">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#EC4899]/5 to-transparent" />

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="inline-block mb-4 sm:mb-6">
                                    <span className="text-5xl sm:text-6xl md:text-7xl float-medium inline-block">🚀</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
                                    <span className="text-[#F8FAFC]">Ready to Start </span>
                                    <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Trading?</span>
                                </h2>

                                <p className="text-[#94A3B8] text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
                                    Start with just <span className="text-[#EC4899] font-bold">$15</span> and unlock up to <span className="text-[#10B981] font-bold">$10,000</span> in NFT value
                                </p>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-6 sm:mb-8">
                                    <div className="text-center">
                                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#EC4899]">$15</p>
                                        <p className="text-[8px] sm:text-xs text-[#64748B]">Min. Registration</p>
                                    </div>
                                    <div className="text-center border-x border-[#334155]">
                                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D946EF]">15</p>
                                        <p className="text-[8px] sm:text-xs text-[#64748B]">Income Levels</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#10B981]">$25.75</p>
                                        <p className="text-[8px] sm:text-xs text-[#64748B]">Burn Reward</p>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <Link href="/register">
                                    <Button variant="primary" size="lg" className="btn-hover-lift pulse-glow text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-5">
                                        🚀 Get Started Now
                                    </Button>
                                </Link>

                                <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-[#64748B]">
                                    No hidden fees • Instant activation • 24/7 trading
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

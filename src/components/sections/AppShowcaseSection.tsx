"use client";

import { PhoneMockup } from "./PhoneMockup";

export function AppShowcaseSection() {
    return (
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EC4899]/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F59E0B]/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Text Content */}
                    <div className="text-center lg:text-left space-y-6">
                        <div className="inline-block">
                            <span className="px-4 py-2 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-full text-[#EC4899] text-sm font-semibold">
                                📱 Mobile Experience
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Trade Bulls{" "}
                            <span className="bg-gradient-to-r from-[#EC4899] via-[#EF4444] to-[#F59E0B] bg-clip-text text-transparent">
                                On The Go
                            </span>
                        </h2>

                        <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Experience seamless NFT trading with our mobile-optimized platform.
                            Buy, sell, and manage your Bull Run portfolio anytime, anywhere.
                        </p>

                        {/* Features List */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                                    <span className="text-[#10B981]">✓</span>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-white">100% Decentralized Platform</h4>
                                    <p className="text-sm text-slate-400">Fully on-chain - no central authority, complete transparency</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                                    <span className="text-[#10B981]">✓</span>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-white">Instant Transactions</h4>
                                    <p className="text-sm text-slate-400">Buy and sell NFTs in seconds with blockchain technology</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                                    <span className="text-[#10B981]">✓</span>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-white">20% Instant Earnings</h4>
                                    <p className="text-sm text-slate-400">Earn 20% commission on every resale of your NFT</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                                    <span className="text-[#10B981]">✓</span>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-white">Secure Wallet Integration</h4>
                                    <p className="text-sm text-slate-400">Connect your wallet and start trading with confidence</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Phone Mockup with Video */}
                    <div className="flex justify-center lg:justify-end">
                        <PhoneMockup videoSrc="/video/intro.mp4" />
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { PhoneMockup } from '../sections/PhoneMockup';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg pt-28 sm:pt-32 pb-12">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-[#EC4899]/10 rounded-full blur-3xl float-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-[#1E3A8A]/20 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 right-1/3 w-32 sm:w-64 h-32 sm:h-64 bg-[#D946EF]/10 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />

                {/* Floating coins - hidden on very small screens */}
                <div className="hidden sm:block absolute top-[15%] left-[8%] text-4xl md:text-6xl float-slow opacity-30">💰</div>
                <div className="hidden sm:block absolute top-[25%] right-[12%] text-3xl md:text-5xl float-medium opacity-25" style={{ animationDelay: '1s' }}>🪙</div>
                <div className="hidden md:block absolute bottom-[30%] left-[15%] text-5xl md:text-7xl float-fast opacity-20" style={{ animationDelay: '0.5s' }}>💎</div>
                <div className="hidden sm:block absolute top-[40%] left-[75%] text-2xl md:text-4xl burn-effect opacity-40" style={{ animationDelay: '2s' }}>🔥</div>
                <div className="hidden md:block absolute bottom-[20%] right-[20%] text-3xl md:text-5xl float-slow opacity-25" style={{ animationDelay: '1.5s' }}>💰</div>

                {/* Particles */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#EC4899] rounded-full particle" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/2 left-[45%] w-1.5 h-1.5 bg-[#D946EF] rounded-full particle" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 left-[55%] w-2 h-2 bg-[#EC4899] rounded-full particle" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="container-app relative z-10">
                <div className="text-center max-w-5xl mx-auto px-4">
                    {/* Badge */}
                    <div className="animate-slide-up mb-6 sm:mb-8">
                        <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/30 text-[#EC4899] text-xs sm:text-sm font-medium">
                            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                            Live Trading Platform
                        </span>
                    </div>

                    {/* 3D Bull Image with Title */}
                    <div className="animate-slide-up-delay-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-4 sm:mb-6">
                        {/* Phone Mockup with Video */}
                        <div className="w-full sm:w-auto">
                            <PhoneMockup videoSrc="/video/intro.mp4" />
                        </div>

                        {/* Main Heading */}
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight">
                                <span className="bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#D946EF] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                                    BULL RUN NFT
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-[#F59E0B] font-semibold mt-2">
                                Own a Legend. Ride the Bull Run.
                            </p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <p className="animate-slide-up-delay-2 text-base sm:text-lg md:text-xl lg:text-2xl text-[#94A3B8] mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
                        <span className="text-[#EC4899] font-semibold">Unique Digital Bulls</span> Charging the Blockchain with{" "}
                        <span className="text-[#D946EF] font-semibold">Crofuer Technology</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button variant="primary" size="lg" className="btn-hover-lift w-full text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4">
                                🚀 Register Now
                            </Button>
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto">
                            <Button variant="secondary" size="lg" className="w-full text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4">
                                📖 Learn More
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="animate-scale-in grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto" style={{ animationDelay: '0.8s' }}>
                        {[
                            { value: '$125M+', label: 'Total Volume', icon: '📊' },
                            { value: '15K+', label: 'Active Traders', icon: '👥' },
                            { value: '50K+', label: 'NFTs Traded', icon: '🪙' },
                            { value: '$25.75', label: 'Burn Reward', icon: '🔥' },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="glass-card p-3 sm:p-5 text-center card-hover group"
                            >
                                <span className="text-xl sm:text-3xl mb-1 sm:mb-2 block group-hover:scale-125 transition-transform duration-300">{stat.icon}</span>
                                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#EC4899] font-mono">{stat.value}</p>
                                <p className="text-[10px] sm:text-sm text-[#64748B]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator - hidden on mobile */}
            <div className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-[#64748B] rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-[#EC4899] rounded-full" />
                </div>
            </div>
        </section>
    );
}

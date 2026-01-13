'use client';

import Link from 'next/link';

export function AdminHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-gradient-to-r from-[#0F172A]/95 via-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border-b border-[#EF4444]/20">
                <div className="container-app">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                            <div className="relative">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300 group-hover:scale-105">
                                    <span className="text-sm sm:text-lg">🛡️</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-[#EF4444] to-[#D946EF] bg-clip-text text-transparent">
                                    ADMIN
                                </span>
                                <p className="hidden sm:block text-[9px] text-[#64748B]">Bull Run NFT</p>
                            </div>
                        </Link>

                        {/* Wallet Connect Button */}
                        <button className="group relative overflow-hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-lg sm:rounded-xl font-bold text-[#0F172A] text-[10px] sm:text-xs md:text-sm shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all duration-300 active:scale-95">
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                            {/* Wallet icon */}
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>

                            {/* Text - responsive */}
                            <span className="relative z-10 hidden sm:inline">Connect Wallet</span>
                            <span className="relative z-10 sm:hidden">Connect</span>

                            {/* Pulse indicator */}
                            <span className="relative z-10 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F172A]/40 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#0F172A]/60" />
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}

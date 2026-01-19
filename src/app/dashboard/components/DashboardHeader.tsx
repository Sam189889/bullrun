'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components';

export function DashboardHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-gradient-to-r from-[#0F172A]/95 via-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
                <div className="container-app">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-300">
                                    <span className="text-base sm:text-lg">🐂</span>
                                </div>
                            </div>
                            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">
                                BULL RUN
                            </span>
                        </Link>

                        {/* Real Wallet Connect */}
                        <WalletConnect />
                    </div>
                </div>
            </nav>
        </header>
    );
}

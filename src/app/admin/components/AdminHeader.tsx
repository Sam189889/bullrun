'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components';

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

                        {/* Wallet Connect */}
                        <WalletConnect variant="compact" />
                    </div>
                </div>
            </nav>
        </header>
    );
}

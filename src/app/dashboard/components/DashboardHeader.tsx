'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletConnect } from '@/components';

export function DashboardHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-gradient-to-r from-[#0F172A]/95 via-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
                <div className="container-app">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <Image 
                                src="/logo.png" 
                                alt="Bull Run NFT" 
                                width={150} 
                                height={40}
                                className="h-8 sm:h-10 w-auto transition-all duration-300 group-hover:scale-105"
                                priority
                            />
                        </Link>

                        {/* Real Wallet Connect */}
                        <WalletConnect />
                    </div>
                </div>
            </nav>
        </header>
    );
}

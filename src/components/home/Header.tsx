'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-[#0F172A]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
                <div className="container-app">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300">
                                    <span className="text-xl sm:text-2xl">💰</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#D946EF] bg-clip-text text-transparent">
                                    BULL RUN NFT
                                </span>
                                <p className="hidden sm:block text-[10px] text-[#64748B] tracking-[0.2em] uppercase">Trading Platform</p>
                            </div>
                        </Link>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href="/lookup">
                                <Button variant="secondary" size="md" className="btn-hover-lift">
                                    <span className="flex items-center gap-2">
                                        <span>🔍</span>
                                        <span className="hidden sm:inline">Lookup</span>
                                    </span>
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="primary" size="md" className="btn-hover-lift">
                                    <span className="flex items-center gap-2">
                                        <span className="hidden sm:inline">📊</span>
                                        Dashboard
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

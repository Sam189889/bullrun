'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';

interface NavbarProps {
    showWallet?: boolean;
    walletAddress?: string;
}

export function Navbar({ showWallet = false, walletAddress }: NavbarProps) {
    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <nav className="fixed top-10 left-0 right-0 z-40 bg-[#0F172A]/90 backdrop-blur-lg border-b border-[#334155]">
            <div className="container-app">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">
                            BULL RUN NFT
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                            Home
                        </Link>
                        <Link href="/register" className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                            Register
                        </Link>
                        <Link href="/dashboard" className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                            Dashboard
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {showWallet && walletAddress ? (
                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <button className="relative p-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                                    <span className="text-xl">🔔</span>
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
                                </button>

                                {/* Wallet */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg">
                                    <span className="text-sm text-[#10B981]">●</span>
                                    <span className="text-sm font-mono text-[#F8FAFC]">
                                        {truncateAddress(walletAddress)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <Button variant="primary" size="sm">
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

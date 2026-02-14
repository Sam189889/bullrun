'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-[#0F172A]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
                <div className="container-app">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <Image 
                                src="/logo.png" 
                                alt="Bull Run NFT" 
                                width={180} 
                                height={50}
                                className="h-10 sm:h-12 w-auto transition-all duration-300 group-hover:scale-105"
                                priority
                            />
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

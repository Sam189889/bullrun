'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';

const packages = [
    { fee: 15, nftValue: 175, highlight: false },
    { fee: 25, nftValue: 250, highlight: false },
    { fee: 50, nftValue: 500, highlight: false },
    { fee: 100, nftValue: 1000, highlight: true, badge: 'Popular' },
    { fee: 200, nftValue: 2000, highlight: false, requirements: '4 Referrals' },
    { fee: 400, nftValue: 4000, highlight: false, requirements: '4 Referrals' },
    { fee: 600, nftValue: 6000, highlight: false, requirements: '6 Referrals' },
    { fee: 800, nftValue: 8000, highlight: false, requirements: '8 Referrals' },
    { fee: 1000, nftValue: 10000, highlight: true, badge: 'Premium', requirements: '10 Referrals' },
];

export function PackagesSection() {
    return (
        <section className="py-16 sm:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B]/50 to-[#0F172A]" />

            <div className="container-app relative z-10 px-4">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16 animate-slide-up">
                    <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#EC4899]/10 text-[#EC4899] text-xs sm:text-sm font-medium mb-4">
                        💰 Registration Packages
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#F8FAFC]">Choose Your </span>
                        <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Investment Level</span>
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-sm sm:text-lg px-4">
                        Start from just $15 and scale up to $1000 for maximum NFT value
                    </p>
                </div>

                {/* Packages Grid - All 9 in responsive grid */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3 mb-8 sm:mb-12">
                    {packages.map((pkg, index) => (
                        <div
                            key={index}
                            className={`
                relative rounded-xl p-2 sm:p-3 text-center transition-all duration-300 card-hover animate-slide-up
                ${pkg.highlight
                                    ? 'bg-gradient-to-b from-[#EC4899]/20 to-[#1E293B] border-2 border-[#EC4899] shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                                    : 'bg-[#1E293B] border border-[#334155] hover:border-[#EC4899]/50'
                                }
              `}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {pkg.badge && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-full text-[8px] sm:text-[10px] font-bold text-[#0F172A] whitespace-nowrap">
                                    {pkg.badge}
                                </div>
                            )}
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#EC4899] mb-0.5">${pkg.fee}</p>
                            <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">Registration</p>
                            <div className="border-t border-[#334155] pt-1 sm:pt-2">
                                <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">${pkg.nftValue.toLocaleString()}</p>
                                <p className="text-[8px] sm:text-[10px] text-[#94A3B8]">NFT Value</p>
                            </div>
                            {pkg.requirements && (
                                <p className="text-[8px] sm:text-[10px] text-[#D946EF] mt-1">🔒 {pkg.requirements}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <Link href="/register">
                        <Button variant="primary" size="lg" className="btn-hover-lift">
                            View All Packages →
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

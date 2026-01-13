'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WarningBanner } from '@/components/layout/WarningBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { packages } from '@/lib/mockData';
import { Package } from '@/lib/types';

function PackageCard({
    pkg,
    selected,
    onSelect,
}: {
    pkg: Package;
    selected: boolean;
    onSelect: () => void;
}) {
    const hasRequirements = pkg.requirements !== undefined;
    const isLocked = hasRequirements; // In real app, check user's referrals

    return (
        <div
            onClick={() => !isLocked && onSelect()}
            className={`
        relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-300
        ${selected
                    ? 'border-[#EC4899] bg-[#EC4899]/10 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                    : 'border-[#334155] bg-[#1E293B] hover:border-[#475569]'
                }
        ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
      `}
        >
            {/* Lock Badge */}
            {isLocked && (
                <div className="absolute top-3 right-3">
                    <span className="badge badge-warning">🔒 Locked</span>
                </div>
            )}

            {/* Package Header */}
            <div className="text-center mb-4">
                <span className="text-4xl">💰</span>
                <h3 className="text-2xl font-bold text-[#EC4899] mt-2">${pkg.registrationFee}</h3>
                <p className="text-sm text-[#94A3B8]">Registration Fee</p>
            </div>

            {/* Package Details */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">NFT Value:</span>
                    <span className="text-[#F8FAFC] font-mono">${pkg.nftValue.toLocaleString()}</span>
                </div>
                <div className="text-xs text-[#64748B] text-center bg-[#0F172A] rounded px-2 py-1">
                    Formula: {pkg.formula}
                </div>
            </div>

            {/* Requirements */}
            {hasRequirements && (
                <div className="border-t border-[#334155] pt-3 mb-4">
                    <p className="text-xs font-semibold text-[#94A3B8] mb-2">Requirements:</p>
                    <ul className="text-xs text-[#64748B] space-y-1">
                        <li>• {pkg.requirements?.directReferrals} direct referrals</li>
                        <li>• {pkg.requirements?.teamRequirement}</li>
                    </ul>
                </div>
            )}

            {!hasRequirements && (
                <div className="border-t border-[#334155] pt-3 mb-4">
                    <p className="text-xs text-[#10B981]">✅ No requirements</p>
                </div>
            )}

            {/* Select Button */}
            <Button
                variant={selected ? 'primary' : 'secondary'}
                size="sm"
                className="w-full"
                disabled={isLocked}
            >
                {selected ? '✓ Selected' : 'Select Package'}
            </Button>
        </div>
    );
}

export default function RegisterPage() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [agreed, setAgreed] = useState(false);

    const selectedPkg = packages.find((p) => p.id === selectedPackage);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <WarningBanner />
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="container-app">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
                            Choose Your <span className="text-[#EC4899]">Package</span>
                        </h1>
                        <p className="text-[#94A3B8] max-w-2xl mx-auto">
                            Select a registration package that suits your investment goals.
                            Higher packages require referrals and team activity.
                        </p>
                    </div>

                    {/* Package Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {packages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                selected={selectedPackage === pkg.id}
                                onSelect={() => setSelectedPackage(pkg.id)}
                            />
                        ))}
                    </div>

                    {/* Registration Form */}
                    {selectedPackage && (
                        <Card variant="glow" className="max-w-xl mx-auto">
                            <h2 className="text-xl font-bold text-[#F8FAFC] mb-6">
                                Complete Registration
                            </h2>

                            <div className="space-y-4">
                                {/* Selected Package Summary */}
                                <div className="bg-[#0F172A] rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-[#64748B]">Selected Package</p>
                                        <p className="text-lg font-bold text-[#EC4899]">${selectedPkg?.registrationFee}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[#64748B]">NFT Value</p>
                                        <p className="text-lg font-bold text-[#F8FAFC]">${selectedPkg?.nftValue.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Wallet Address */}
                                <div>
                                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                                        Wallet Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#EC4899] transition-colors"
                                    />
                                </div>

                                {/* Referral Code */}
                                <div>
                                    <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                                        Referral Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        placeholder="Enter referral code"
                                        className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#EC4899] transition-colors"
                                    />
                                </div>

                                {/* Terms */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 w-4 h-4 accent-[#EC4899]"
                                    />
                                    <span className="text-sm text-[#94A3B8]">
                                        I understand this is a community-led project. I accept the{' '}
                                        <span className="text-[#EC4899]">Trading Rules</span> and agree to complete 75% trading within 24 hours.
                                    </span>
                                </label>

                                {/* Submit Button */}
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    disabled={!walletAddress || !agreed}
                                >
                                    Complete Registration - ${selectedPkg?.registrationFee}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Back Link */}
                    <div className="text-center mt-8">
                        <Link href="/" className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

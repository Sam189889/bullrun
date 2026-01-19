'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserTeamVolume } from '@/hooks/useContracts';

// Define types for contract returns
interface UserInfo {
    referrerId: bigint;
    packageLevel: bigint;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    activationDate: bigint;
    directReferralsCount: bigint;
}

export function TeamTab() {
    const [copied, setCopied] = useState(false);
    const { address } = useAccount();

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: userInfo } = useUserInfo(userId as bigint);
    const { data: teamVolume } = useUserTeamVolume(userId as bigint);

    const info = userInfo as UserInfo | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Generate referral link
    const referralLink = isRegistered
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${userId}`
        : 'Connect wallet to get referral link';

    const copyLink = () => {
        if (!isRegistered) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Format team volume
    const formatVolume = (value: bigint | undefined) => {
        if (!value) return '$0';
        const num = Number(formatUnits(value, 18));
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const directReferrals = info ? Number(info.directReferralsCount) : 0;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Referral Link */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EC4899]/20 via-[#1E293B] to-[#D946EF]/20 rounded-xl p-4 sm:p-5 border border-[#EC4899]/30 animate-slide-up">
                <div className="absolute top-2 right-4 text-3xl sm:text-4xl opacity-10 float-slow">👥</div>
                <p className="text-[10px] sm:text-xs text-[#EC4899] font-medium mb-2">🔗 Your Referral Link</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-sm text-[#F8FAFC] font-mono"
                    />
                    <button
                        onClick={copyLink}
                        disabled={!isRegistered}
                        className={`
                            px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95
                            ${copied
                                ? 'bg-[#10B981] text-white'
                                : isRegistered
                                    ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                                    : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                            }
                        `}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>
                {isRegistered && (
                    <p className="text-[10px] text-[#64748B] mt-2">Your User ID: <span className="text-[#EC4899] font-bold">#{userId?.toString()}</span></p>
                )}
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {([
                    { value: directReferrals, label: 'Direct', color: '#F8FAFC', icon: '👥' },
                    { value: directReferrals, label: 'Active', color: '#10B981', icon: '✅' },
                    { value: 0, label: 'Inactive', color: '#EF4444', icon: '❌' },
                    { value: formatVolume(teamVolume as bigint), label: 'Volume', color: '#EC4899', icon: '💰' },
                ] as { value: number | string; label: string; color: string; icon: string }[]).map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-2 sm:p-3 border border-[#334155] text-center card-hover">
                        <span className="text-sm sm:text-lg mb-0.5 sm:mb-1 block">{stat.icon}</span>
                        <p className="text-base sm:text-lg md:text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[8px] sm:text-[10px] text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Referral Progress */}
            {isRegistered && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#1E293B] rounded-xl p-3 sm:p-4 border border-[#EC4899]/30">
                        <div className="flex justify-between mb-2 sm:mb-3">
                            <p className="text-[10px] sm:text-sm text-[#F8FAFC] font-medium">👥 Direct Referrals</p>
                            <p className="text-[10px] sm:text-sm text-[#EC4899] font-bold">{directReferrals}</p>
                        </div>
                        <ProgressBar value={directReferrals} max={10} showPercentage={false} size="sm" />
                        <p className="text-[8px] text-[#64748B] mt-2">Next milestone: 10 referrals</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#10B981]/10 to-[#1E293B] rounded-xl p-3 sm:p-4 border border-[#10B981]/30">
                        <div className="flex justify-between mb-2 sm:mb-3">
                            <p className="text-[10px] sm:text-sm text-[#F8FAFC] font-medium">📈 Team Volume</p>
                            <p className="text-[10px] sm:text-sm text-[#10B981] font-bold">{formatVolume(teamVolume as bigint)}</p>
                        </div>
                        <ProgressBar value={Number(formatUnits(teamVolume as bigint || BigInt(0), 18))} max={10000} showPercentage={false} size="sm" variant="success" />
                        <p className="text-[8px] text-[#64748B] mt-2">Target: $10K team volume</p>
                    </div>
                </div>
            )}

            {/* No Referrals Message */}
            {isRegistered && directReferrals === 0 && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-4xl mb-3">🎯</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Start Building Your Team!</h3>
                    <p className="text-sm text-[#64748B]">Share your referral link to earn sponsor bonuses</p>
                </div>
            )}

            {/* Not Registered */}
            {!isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-4xl mb-3">🔗</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Register to Get Your Link</h3>
                    <p className="text-sm text-[#64748B]">Connect your wallet and register to start earning</p>
                </div>
            )}
        </div>
    );
}
